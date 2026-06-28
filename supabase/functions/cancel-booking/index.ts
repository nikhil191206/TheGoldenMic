import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verify caller is a logged-in customer
    const jwt = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!jwt) return json({ error: 'Unauthorized' }, 401)

    const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt)
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401)

    const { booking_id } = await req.json()
    if (!booking_id) return json({ error: 'booking_id required' }, 400)

    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single()
    if (fetchErr || !booking) return json({ error: 'Booking not found' }, 404)

    // Only the booking's own customer can cancel it
    if (booking.user_id !== user.id) return json({ error: 'Not your booking' }, 403)
    if (booking.payment_status === 'cancelled') return json({ error: 'Booking already cancelled' }, 400)

    // Compute hours remaining until the slot
    const slotDateTime = parseSlotDateTime(booking.booking_date, booking.time_slot)
    const hoursUntilSlot = (slotDateTime.getTime() - Date.now()) / (1000 * 60 * 60)

    if (hoursUntilSlot < 0) return json({ error: 'This booking has already passed.' }, 400)

    const refundPercentage = hoursUntilSlot >= 24 ? 80 : 50
    const amountPaid = booking.amount_paid ?? 0
    // amount_paid includes the non-refundable 2% transaction fee — refund off the base only
    const refundableBase = Math.round(amountPaid / 1.02)
    const refundAmount = Math.round((refundableBase * refundPercentage) / 100)

    await supabase.from('bookings').update({
      payment_status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      refund_percentage: refundPercentage,
      refund_amount: refundAmount
    }).eq('id', booking_id)

    const formattedDate = new Date(booking.booking_date).toLocaleDateString('en-IN', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    })
    const contactPhone = Deno.env.get('CONTACT_PHONE') ?? 'TODO_PHONE'
    const contactEmail = Deno.env.get('CONTACT_EMAIL') ?? 'TODO_EMAIL'

    const smsBody = `Golden Mic: Hi ${booking.name}, your booking for ${formattedDate} ${booking.time_slot} is cancelled. Refund of Rs.${refundAmount} (${refundPercentage}%) will be processed in 5-7 days.`
    const emailSubject = 'Your Golden Mic Booking has been Cancelled'
    const emailHtml = `
      <h2>Booking Cancelled</h2>
      <p>Dear ${booking.name},</p>
      <p>Your booking has been successfully cancelled as requested.</p>
      <table style="border-collapse:collapse;width:100%;margin:20px 0">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Date</td><td style="padding:8px;border:1px solid #ddd">${formattedDate}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Time</td><td style="padding:8px;border:1px solid #ddd">${booking.time_slot}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Amount Paid</td><td style="padding:8px;border:1px solid #ddd">₹${amountPaid}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Refund (${refundPercentage}%)</td><td style="padding:8px;border:1px solid #ddd"><strong>₹${refundAmount}</strong></td></tr>
      </table>
      <p>Your refund will be processed to your original payment method within 5-7 business days.</p>
      <p>Questions? Contact us at <a href="mailto:${contactEmail}">${contactEmail}</a> or call <a href="tel:${contactPhone}">${contactPhone}</a>.</p>
      <p>— The Golden Mic Team</p>
    `

    // Notify admin too so they can action the manual refund
    const adminEmailHtml = `
      <h2>Booking Cancelled — Refund Action Needed</h2>
      <p><strong>${booking.name}</strong> (${booking.phone ?? booking.email}) cancelled their booking.</p>
      <ul>
        <li>Date: ${formattedDate} at ${booking.time_slot}</li>
        <li>Amount Paid: ₹${amountPaid}</li>
        <li>Refund Owed (${refundPercentage}%): <strong>₹${refundAmount}</strong></li>
      </ul>
      <p>Please process this refund manually to the customer.</p>
    `

    await Promise.allSettled([
      sendSms(booking.phone, smsBody),
      sendEmail(booking.email, emailSubject, emailHtml),
      sendEmail(contactEmail, `Cancellation: ${booking.name} — Refund ₹${refundAmount} owed`, adminEmailHtml)
    ])

    return json({ success: true, refund_percentage: refundPercentage, refund_amount: refundAmount })
  } catch (err) {
    console.error(err)
    return json({ error: String(err) }, 500)
  }
})

function parseSlotDateTime(bookingDate: string, timeSlot: string): Date {
  // timeSlot format: "10:00 AM" / "2:00 PM"
  const [time, meridiem] = timeSlot.split(' ')
  const [hourStr, minuteStr] = time.split(':')
  let hour = parseInt(hourStr, 10)
  if (meridiem === 'PM' && hour !== 12) hour += 12
  if (meridiem === 'AM' && hour === 12) hour = 0
  const date = new Date(bookingDate)
  date.setHours(hour, parseInt(minuteStr, 10), 0, 0)
  return date
}

async function sendSms(to: string | null, body: string) {
  const apiKey = Deno.env.get('FAST2SMS_API_KEY')
  if (!apiKey || !to) return

  const number = to.replace(/^\+91/, '').replace(/^0/, '').replace(/\s|-/g, '').slice(-10)
  if (number.length !== 10) return

  const params = new URLSearchParams({
    authorization: apiKey,
    route: 'q',
    message: body.slice(0, 160),
    language: 'english',
    flash: '0',
    numbers: number
  })

  await fetch(`https://www.fast2sms.com/dev/bulkV2?${params.toString()}`, {
    headers: { 'cache-control': 'no-cache' }
  })
}

async function sendEmail(to: string | null, subject: string, html: string) {
  const key = Deno.env.get('RESEND_API_KEY')
  const from = `The Golden Mic <noreply@thegoldenmic.in>`
  if (!key || !to) return

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html })
  })
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  })
}

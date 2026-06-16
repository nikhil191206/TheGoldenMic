import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Set these in Supabase Edge Function secrets ──
// FAST2SMS_API_KEY  — from fast2sms.com dashboard
// RESEND_API_KEY    — from resend.com
// CONTACT_PHONE     — your studio phone (e.g. +919xxxxxxxxx)
// CONTACT_EMAIL     — your studio email

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

    // Verify caller is an authenticated admin
    const jwt = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!jwt) return json({ error: 'Unauthorized' }, 401)

    const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt)
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401)

    const { data: adminCheck } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', user.email)
      .single()
    if (!adminCheck) return json({ error: 'Not an admin' }, 403)

    const { booking_id, partner_name } = await req.json()
    if (!booking_id) return json({ error: 'booking_id required' }, 400)

    // Fetch booking
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single()
    if (fetchErr || !booking) return json({ error: 'Booking not found' }, 404)

    // Update status
    await supabase.from('bookings').update({
      payment_status: 'confirmed',
      payment_complete: true,
      confirmed_at: new Date().toISOString(),
      confirmed_by: partner_name ?? user.email
    }).eq('id', booking_id)

    const formattedDate = new Date(booking.booking_date).toLocaleDateString('en-IN', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    })
    const contactPhone = Deno.env.get('CONTACT_PHONE') ?? 'TODO_PHONE'
    const contactEmail = Deno.env.get('CONTACT_EMAIL') ?? 'TODO_EMAIL'

    const shortDate = new Date(booking.booking_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const smsBody = `Golden Mic: Hi ${booking.name}, your booking is confirmed for ${shortDate} at ${booking.time_slot}. Please check your email for full details.`
    const emailSubject = 'Your Golden Mic Booking is Confirmed! 🎤'
    const emailHtml = `
      <h2>Booking Confirmed! 🎤</h2>
      <p>Dear ${booking.name},</p>
      <p>Your payment has been verified and your studio session is now <strong>confirmed</strong>.</p>
      <table style="border-collapse:collapse;width:100%;margin:20px 0">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Date</td><td style="padding:8px;border:1px solid #ddd">${formattedDate}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Time</td><td style="padding:8px;border:1px solid #ddd">${booking.time_slot}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Duration</td><td style="padding:8px;border:1px solid #ddd">${booking.duration}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Studio</td><td style="padding:8px;border:1px solid #ddd">${booking.studio}</td></tr>
      </table>
      <p>Please arrive 5-10 minutes early. We look forward to seeing you!</p>
      <p>Questions? Contact us at <a href="mailto:${contactEmail}">${contactEmail}</a> or call <a href="tel:${contactPhone}">${contactPhone}</a>.</p>
      <p>— The Golden Mic Team</p>
    `

    await Promise.allSettled([
      sendSms(booking.phone, smsBody),
      sendEmail(booking.email, emailSubject, emailHtml)
    ])

    return json({ success: true })
  } catch (err) {
    console.error(err)
    return json({ error: String(err) }, 500)
  }
})

async function sendSms(to: string | null, body: string) {
  const apiKey = Deno.env.get('FAST2SMS_API_KEY')
  if (!apiKey) { console.log('SMS skipped: no FAST2SMS_API_KEY'); return }
  if (!to) { console.log('SMS skipped: booking has no phone number'); return }

  const number = to.replace(/^\+91/, '').replace(/^0/, '').replace(/\s|-/g, '').slice(-10)
  if (number.length !== 10) { console.log('SMS skipped: invalid number:', to); return }

  console.log('Sending SMS to:', number)

  const params = new URLSearchParams({
    authorization: apiKey,
    route: 'q',
    message: body.slice(0, 160),
    language: 'english',
    flash: '0',
    numbers: number
  })

  const res = await fetch(`https://www.fast2sms.com/dev/bulkV2?${params.toString()}`, {
    headers: { 'cache-control': 'no-cache' }
  })
  const result = await res.json()
  console.log('Fast2SMS response:', JSON.stringify(result))
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

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

    const jwt = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!jwt) return json({ error: 'Unauthorized' }, 401)

    const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt)
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401)

    const { bulk_booking_id } = await req.json()
    if (!bulk_booking_id) return json({ error: 'bulk_booking_id required' }, 400)

    const { data: bulk, error: fetchErr } = await supabase
      .from('bulk_bookings')
      .select('*')
      .eq('id', bulk_booking_id)
      .single()
    if (fetchErr || !bulk) return json({ error: 'Bulk booking not found' }, 404)

    if (bulk.user_id !== user.id) return json({ error: 'Not your booking' }, 403)
    if (bulk.cancelled_at) return json({ error: 'Bulk plan already cancelled' }, 400)
    if (Number(bulk.used_hours) > 0) {
      return json({ error: 'You have already used hours from this plan. Contact us directly to cancel.' }, 400)
    }

    const startDateTime = new Date(bulk.start_date + 'T00:00:00')
    const hoursUntilStart = (startDateTime.getTime() - Date.now()) / (1000 * 60 * 60)
    if (hoursUntilStart < 0) return json({ error: 'This plan has already started.' }, 400)

    const refundPercentage = hoursUntilStart >= 24 ? 80 : 50
    const amountPaid = bulk.amount_paid ?? 0
    // amount_paid includes the non-refundable 2% transaction fee — refund off the base only
    const refundableBase = Math.round(amountPaid / 1.02)
    const refundAmount = Math.round((refundableBase * refundPercentage) / 100)

    await supabase.from('bulk_bookings').update({
      cancelled_at: new Date().toISOString(),
      refund_percentage: refundPercentage,
      refund_amount: refundAmount
    }).eq('id', bulk_booking_id)

    const contactPhone = Deno.env.get('CONTACT_PHONE') ?? 'TODO_PHONE'
    const contactEmail = Deno.env.get('CONTACT_EMAIL') ?? 'TODO_EMAIL'
    const typeLabel = bulk.booking_type === 'karaoke_singer' ? 'Karaoke Singer' : 'Live Rehearsal'

    const smsBody = `Golden Mic: Hi ${bulk.name}, your bulk plan (${typeLabel}) is cancelled. Refund of Rs.${refundAmount} (${refundPercentage}%) will be processed in 5-7 days.`
    const emailSubject = 'Your Golden Mic Bulk Plan has been Cancelled'
    const emailHtml = `
      <h2>Bulk Plan Cancelled</h2>
      <p>Dear ${bulk.name},</p>
      <p>Your bulk plan has been successfully cancelled as requested.</p>
      <table style="border-collapse:collapse;width:100%;margin:20px 0">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Plan</td><td style="padding:8px;border:1px solid #ddd">${typeLabel}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Amount Paid</td><td style="padding:8px;border:1px solid #ddd">₹${amountPaid}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Refund (${refundPercentage}%)</td><td style="padding:8px;border:1px solid #ddd"><strong>₹${refundAmount}</strong></td></tr>
      </table>
      <p>Your refund will be processed to your original payment method within 5-7 business days.</p>
      <p>Questions? Contact us at <a href="mailto:${contactEmail}">${contactEmail}</a> or call <a href="tel:${contactPhone}">${contactPhone}</a>.</p>
      <p>— The Golden Mic Team</p>
    `

    const adminEmailHtml = `
      <h2>Bulk Plan Cancelled — Refund Action Needed</h2>
      <p><strong>${bulk.name}</strong> (${bulk.phone ?? bulk.email}) cancelled their bulk plan (${typeLabel}).</p>
      <ul>
        <li>Amount Paid: ₹${amountPaid}</li>
        <li>Refund Owed (${refundPercentage}%): <strong>₹${refundAmount}</strong></li>
      </ul>
      <p>Please process this refund manually to the customer.</p>
    `

    await Promise.allSettled([
      sendSms(bulk.phone, smsBody),
      sendEmail(bulk.email, emailSubject, emailHtml),
      sendEmail(contactEmail, `Bulk Cancellation: ${bulk.name} — Refund ₹${refundAmount} owed`, adminEmailHtml)
    ])

    return json({ success: true, refund_percentage: refundPercentage, refund_amount: refundAmount })
  } catch (err) {
    console.error(err)
    return json({ error: String(err) }, 500)
  }
})

async function sendSms(to: string | null, body: string) {
  const apiKey = Deno.env.get('FAST2SMS_API_KEY')
  if (!apiKey || !to) return
  const number = to.replace(/^\+91/, '').replace(/^0/, '').replace(/\s|-/g, '').slice(-10)
  if (number.length !== 10) return
  const params = new URLSearchParams({
    authorization: apiKey, route: 'q', message: body.slice(0, 160),
    language: 'english', flash: '0', numbers: number
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

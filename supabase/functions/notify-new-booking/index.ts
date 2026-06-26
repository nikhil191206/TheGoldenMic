import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  try {
    const payload = await req.json()
    const booking = payload.record
    if (!booking) return new Response('ok', { status: 200 })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: tokens } = await supabase
      .from('admin_fcm_tokens')
      .select('token')

    if (!tokens || tokens.length === 0) {
      console.log('No FCM tokens registered')
      return new Response('ok', { status: 200 })
    }

    const projectId = Deno.env.get('FIREBASE_PROJECT_ID')
    const clientEmail = Deno.env.get('FIREBASE_CLIENT_EMAIL')
    const privateKey = Deno.env.get('FIREBASE_PRIVATE_KEY')

    if (!projectId || !clientEmail || !privateKey) {
      console.log('Firebase credentials not set')
      return new Response('ok', { status: 200 })
    }

    const accessToken = await getAccessToken(clientEmail, privateKey)
    const body = `${booking.name} booked ${booking.studio} on ${booking.booking_date} at ${booking.time_slot}`

    const results = await Promise.allSettled(
      tokens.map((t: { token: string }) =>
        fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            message: {
              token: t.token,
              notification: { title: 'New Booking!', body },
              data: { booking_id: String(booking.id), type: 'new_booking' },
              android: { priority: 'high' }
            }
          })
        }).then(r => r.json())
      )
    )

    console.log('FCM results:', JSON.stringify(results))
    return new Response(JSON.stringify({ success: true, sent: tokens.length }), { status: 200 })

  } catch (err) {
    console.error('notify-new-booking error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})

async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  }

  const header = { alg: 'RS256', typ: 'JWT' }
  const encode = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const signingInput = `${encode(header)}.${encode(payload)}`

  const pemKey = privateKey.replace(/\\n/g, '\n')
  const keyBody = pemKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '')

  const binaryKey = Uint8Array.from(atob(keyBody), c => c.charCodeAt(0))
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', cryptoKey,
    new TextEncoder().encode(signingInput)
  )

  const encodedSig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const jwt = `${signingInput}.${encodedSig}`

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  })

  const { access_token } = await tokenRes.json()
  return access_token
}

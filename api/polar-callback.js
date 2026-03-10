// Vercel serverless function — exchanges Polar OAuth code for access token
// and redirects back to the dashboard with the token.
// Required env vars: POLAR_CLIENT_ID, POLAR_CLIENT_SECRET

export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.redirect('/?polar_error=' + encodeURIComponent(error));
  }
  if (!code) {
    return res.status(400).send('Missing code');
  }

  const clientId     = process.env.POLAR_CLIENT_ID;
  const clientSecret = process.env.POLAR_CLIENT_SECRET;
  const redirectUri  = `https://${req.headers.host}/api/polar-callback`;

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://polarremote.com/v2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        'Accept':        'application/json',
      },
      body: new URLSearchParams({
        grant_type:   'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Polar token exchange failed:', err);
      return res.redirect('/dashboard.html?polar_error=' + encodeURIComponent('token_exchange_failed'));
    }

    const { access_token, x_user_id } = await tokenRes.json();

    // Register user with AccessLink (idempotent — safe to call each time)
    await fetch('https://www.polaraccesslink.com/v3/users', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${access_token}`,
        'Accept':        'application/json',
      },
      body: JSON.stringify({ 'member-id': String(x_user_id) }),
    });
    // 409 = already registered, which is fine

    // Redirect to dashboard with token + userId in hash (never in query string)
    return res.redirect(
      `/dashboard.html#polar_token=${access_token}&polar_user=${x_user_id}`
    );
  } catch (e) {
    console.error('Polar callback error:', e);
    return res.redirect('/dashboard.html?polar_error=server_error');
  }
}

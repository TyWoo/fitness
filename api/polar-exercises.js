// Vercel serverless function — proxies GET /v3/exercises from Polar AccessLink
// to avoid CORS issues when calling from the browser.
// The client passes the Polar access token in the Authorization header.

module.exports = async function handler(req, res) {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  try {
    const polarRes = await fetch('https://www.polaraccesslink.com/v3/exercises', {
      headers: {
        Authorization: auth,
        Accept: 'application/json',
      },
    });

    const body = await polarRes.text();
    res.status(polarRes.status);
    res.setHeader('Content-Type', 'application/json');
    return res.send(body);
  } catch (e) {
    console.error('Polar exercises proxy error:', e);
    return res.status(500).json({ error: e.message });
  }
};

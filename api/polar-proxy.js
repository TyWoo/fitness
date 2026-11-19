// Generic Polar AccessLink proxy — forwards any /v3/* path
// Supports GET, POST, PUT for the pull-notification transaction flow

module.exports = async function handler(req, res) {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const path = req.query.path;
  if (!path || !path.startsWith('/v3/')) {
    return res.status(400).json({ error: 'Invalid path — must start with /v3/' });
  }

  const opts = {
    method: req.method || 'GET',
    headers: {
      Authorization: auth,
      Accept: 'application/json',
    },
  };

  try {
    const polarRes = await fetch('https://www.polaraccesslink.com' + path, opts);
    const body = await polarRes.text();
    res.status(polarRes.status);
    res.setHeader('Content-Type', polarRes.headers.get('content-type') || 'application/json');
    return res.send(body);
  } catch (e) {
    console.error('Polar proxy error:', e);
    return res.status(500).json({ error: e.message });
  }
};

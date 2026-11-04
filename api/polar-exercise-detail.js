// Proxies GET /v3/exercises/:id from Polar AccessLink
// Returns detailed exercise data including HR zones and samples

module.exports = async function handler(req, res) {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const exerciseId = req.query.id;
  if (!exerciseId) {
    return res.status(400).json({ error: 'Missing id query parameter' });
  }

  try {
    const polarRes = await fetch(
      `https://www.polaraccesslink.com/v3/exercises/${encodeURIComponent(exerciseId)}`,
      {
        headers: {
          Authorization: auth,
          Accept: 'application/json',
        },
      }
    );

    const body = await polarRes.text();
    res.status(polarRes.status);
    res.setHeader('Content-Type', 'application/json');
    return res.send(body);
  } catch (e) {
    console.error('Polar exercise detail proxy error:', e);
    return res.status(500).json({ error: e.message });
  }
};

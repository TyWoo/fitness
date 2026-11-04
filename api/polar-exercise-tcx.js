// Proxies GET /v3/exercises/:id/tcx from Polar AccessLink
// Returns TCX XML with full trackpoint data (HR, position, distance over time)

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
      `https://www.polaraccesslink.com/v3/exercises/${encodeURIComponent(exerciseId)}/tcx`,
      {
        headers: {
          Authorization: auth,
          Accept: 'application/vnd.garmin.tcx+xml',
        },
      }
    );

    const body = await polarRes.text();
    res.status(polarRes.status);
    res.setHeader('Content-Type', polarRes.ok ? 'application/xml' : 'application/json');
    return res.send(body);
  } catch (e) {
    console.error('Polar exercise TCX proxy error:', e);
    return res.status(500).json({ error: e.message });
  }
};

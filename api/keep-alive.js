export default async function handler(req, res) {
  const SB_URL = 'https://wnwkraukvizulycjssyk.supabase.co/rest/v1';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indud2tyYXVrdml6dWx5Y2pzc3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3OTgyMDMsImV4cCI6MjA4NzM3NDIwM30._1UVEvXKRuWtaRErJjk63dDsmSV9lcGqOUEPO0DbIqE';

  const response = await fetch(`${SB_URL}/workout_sessions?select=id&limit=1`, {
    headers: {
      'apikey': SB_KEY,
      'Authorization': `Bearer ${SB_KEY}`
    }
  });

  const status = response.status;
  return res.status(200).json({ ok: status === 200, status, timestamp: new Date().toISOString() });
}

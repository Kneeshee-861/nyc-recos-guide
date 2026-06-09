module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'X-Goog-Api-Key': process.env.GOOGLE_API_KEY,
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'places.rating,places.userRatingCount,places.priceLevel,places.types'
      },
      body: JSON.stringify({ textQuery: query })
    });
    const data = await response.json();
    if (!data.places?.[0]) return res.status(200).json({ _debug: data });
    res.status(200).json(data.places?.[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

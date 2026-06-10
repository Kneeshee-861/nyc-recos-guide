module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, mode, lat, lng, radius = 2500, includedTypes } = req.body;

  try {
    if (mode === 'nearby') {
      const body = {
        locationRestriction: {
          circle: { center: { latitude: lat, longitude: lng }, radius }
        },
        maxResultCount: 15,
        rankPreference: 'POPULARITY'
      };
      if (includedTypes && includedTypes.length) body.includedTypes = includedTypes;
      const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'X-Goog-Api-Key': process.env.GOOGLE_API_KEY,
          'Content-Type': 'application/json',
          'X-Goog-FieldMask': 'places.displayName,places.rating,places.userRatingCount,places.priceLevel,places.types,places.location'
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!data.places) console.error('Google Places nearby error:', JSON.stringify(data));
      res.status(200).json(data.places || []);

    } else {
      if (!query) return res.status(400).json({ error: 'Missing query' });
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
      res.status(200).json(data.places?.[0] || {});
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

# NYC Margdarshak — Session Notes
## Session 3 — What was built + where to pick up

---

## Current status

App is **live at `nyc-recos-guide.vercel.app`**

File structure:
```
index.html          ← entire frontend (single file, all JS inline)
api/
  claude.js         ← proxies Anthropic API (key in env var)
  places.js         ← proxies Google Places API (text search + nearby search)
nishi_picks_descriptions.md  ← description review doc (see below)
```

Vercel env vars: `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`

---

## What was done this session

---

### 1. Confirmed Google Places enrichment working

Ratings, price levels, and vibe tags (chill ✓ / not her vibe) now appear on every card. Verified via DevTools Network tab — `/api/places` returning 200 with real data.

---

### 2. Fixed walk time formula

**Problem:** Haversine gives straight-line distance. NYC street grid adds ~40% more walking distance, and 80m/min was too fast.

**Changed in `index.html`:**
```javascript
// Before:
function metersToWalk(m) {
  const mins = Math.round(m / 80);
  return mins <= 1 ? "1 min walk" : `${mins} min walk`;
}

// After:
function metersToWalk(m) {
  const mins = Math.round((m * 1.4) / 70);
  return mins <= 1 ? "1 min walk" : `~${mins} min walk`;
}
```
1.4× corrects for the street grid. 70m/min is realistic NYC walking pace with traffic lights. `~` tilde indicates it's an estimate.

---

### 3. Fixed General Nearby — replaced Claude hallucination with Google Places

**Problem:** Claude was inventing places from coordinates (e.g. suggesting a store in Massachusetts for Times Square).

**Solution:** Two-step flow:
1. Google Places Nearby Search → real places within 2500m ranked by popularity
2. Claude picks 4 that suit Abhiruchi's vibe and writes warm descriptions
3. Match Claude's picks back to Google data to get ratings/price/types/distance

**`api/places.js` — full file:**
```javascript
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, mode, lat, lng, radius = 2500 } = req.body;

  try {
    if (mode === 'nearby') {
      const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'X-Goog-Api-Key': process.env.GOOGLE_API_KEY,
          'Content-Type': 'application/json',
          'X-Goog-FieldMask': 'places.displayName,places.rating,places.userRatingCount,places.priceLevel,places.types,places.location'
        },
        body: JSON.stringify({
          locationRestriction: {
            circle: { center: { latitude: lat, longitude: lng }, radius }
          },
          maxResultCount: 15,
          rankPreference: 'POPULARITY'
        })
      });
      const data = await response.json();
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
```

**`fetchGeneralNearby` in `index.html` — full function:**
```javascript
function fetchGeneralNearby(lat, lng) {
  fetch('/api/places', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode: 'nearby', lat, lng, radius: 2500 })
  })
  .then(r => r.json())
  .then(googlePlaces => {
    if (!googlePlaces.length) throw new Error('No places found nearby');

    const skip = ['transit_station', 'subway_station', 'bus_station', 'lodging', 'gas_station', 'atm', 'bank', 'parking', 'car_wash', 'car_dealer'];
    const filtered = googlePlaces.filter(p => !p.types?.some(t => skip.includes(t)));

    const placesList = filtered.slice(0, 12).map(p =>
      `- ${p.displayName?.text} (${p.types?.slice(0, 2).join(', ')})`
    ).join('\n');

    setLoading("Writing descriptions...");

    return fetch('/api/claude', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', max_tokens: 600,
        system: `You are a warm NYC guide for Abhiruchi, who loves chill spots — cafes, parks, independent restaurants, bookshops, galleries. She does NOT like clubs or loud nightlife. She prefers less red meat and seafood — chicken is great, avoid heavy steakhouses or seafood-only spots. If suggesting a bar, only suggest ones known for craft beer or a good beer selection — no cocktail bars or clubs. Given a list of real nearby places, pick exactly 4 that suit her vibe. Output ONLY a raw JSON array — no markdown, no code blocks, no backticks. Start with [ and end with ]. Format: [{"name": "exact place name from the list", "description": "one warm sentence as if a friend is texting her"}]`,
        messages: [{ role: 'user', content: `Real places within walking distance:\n${placesList}\n\nPick 4 for Abhiruchi.` }]
      })
    })
    .then(r => r.json())
    .then(data => {
      const picked = parseClaudeJSON(data.content[0].text);
      const enriched = picked.map(p => {
        const match = filtered.find(g => g.displayName?.text?.toLowerCase() === p.name.toLowerCase())
                   || filtered.find(g => g.displayName?.text?.toLowerCase().includes(p.name.toLowerCase()));
        const dist = match?.location ? haversineDistance(lat, lng, match.location.latitude, match.location.longitude) : null;
        return {
          ...p,
          dist,
          rating: match?.rating,
          reviewCount: match?.userRatingCount,
          priceLevel: match?.priceLevel,
          types: match?.types
        };
      });
      renderPlaces(enriched, lat, lng);
    });
  })
  .catch(() => showError("Couldn't find places nearby. Make sure you're in New York City!"));
}
```

---

### 4. Added category filters (Food / Cafe / Parks / Sights)

Filters show on both General Nearby and Nishi's Picks.

**Behaviour:**
- **Nishi's Picks + filter** → filters from the full hardcoded NISHI_PICKS array, sorts by distance, skips Claude (instant)
- **Nishi's Picks + All** → runs full Claude flow (closest 8 picks, Claude rewrites descriptions)
- **General Nearby + filter** → filters already-loaded Google results by place types (instant, no API call)
- **General Nearby + All** → shows all loaded results

**CSS added:**
```css
.filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
.filter-btn { font-size: 12px; font-family: Inter, sans-serif; font-weight: 500; padding: 7px 16px; border-radius: 20px; border: 1px solid var(--border); background: var(--white); color: var(--muted); cursor: pointer; transition: all 0.15s; }
.filter-btn.active { background: var(--purple); color: white; border-color: var(--purple); }
```

**HTML added** (in results screen, above places-list):
```html
<div id="filter-bar" style="display:none;" class="filter-bar">
  <button class="filter-btn active" data-cat="all" onclick="applyFilter('all')">All</button>
  <button class="filter-btn" data-cat="food" onclick="applyFilter('food')">🍜 Food</button>
  <button class="filter-btn" data-cat="cafe" onclick="applyFilter('cafe')">☕ Cafe</button>
  <button class="filter-btn" data-cat="park" onclick="applyFilter('park')">🌿 Parks</button>
  <button class="filter-btn" data-cat="sights" onclick="applyFilter('sights')">🗽 Sights</button>
</div>
```

**JS — CATEGORY_TYPES + state variables + getNearby + applyFilter:**
```javascript
let currentLat = null, currentLng = null, currentMode = null, currentPlaces = [];

const CATEGORY_TYPES = {
  food: ['restaurant', 'bar', 'food', 'meal_takeaway', 'meal_delivery', 'american_restaurant', 'chinese_restaurant', 'indian_restaurant', 'italian_restaurant', 'japanese_restaurant', 'korean_restaurant', 'mediterranean_restaurant', 'mexican_restaurant', 'pizza_restaurant', 'ramen_restaurant', 'thai_restaurant', 'vegan_restaurant', 'vegetarian_restaurant', 'fast_food_restaurant', 'hamburger_restaurant', 'sandwich_shop', 'deli', 'food_court', 'brunch_restaurant'],
  cafe: ['cafe', 'bakery', 'coffee_shop', 'ice_cream_shop', 'dessert_shop', 'tea_house', 'bagel_shop', 'donut_shop', 'juice_shop', 'patisserie'],
  park: ['park', 'garden', 'national_park', 'nature_reserve', 'botanical_garden', 'playground', 'state_park', 'waterfront'],
  sights: ['museum', 'tourist_attraction', 'art_gallery', 'church', 'mosque', 'temple', 'hindu_temple', 'synagogue', 'place_of_worship', 'landmark', 'historical_landmark', 'book_store', 'movie_theater', 'performing_arts_theater', 'cultural_center', 'aquarium', 'zoo', 'observation_deck']
};

function getNearby(mode) {
  const isNishi = mode === 'nishi';
  currentMode = mode;
  document.getElementById('results-title').innerHTML = isNishi ? 'Nishi\'s <em>picks near you</em>' : 'What\'s <em>nearby</em>';
  document.getElementById('filter-bar').style.display = 'flex';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === 'all'));
  showResults();
  setLoading("Finding your location...");
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      currentLat = lat; currentLng = lng;
      setLoading(isNishi ? "Finding Nishi's picks near you..." : "Finding what's nearby...");
      isNishi ? fetchNishiPicks(lat, lng) : fetchGeneralNearby(lat, lng);
    },
    () => showError("Couldn't get your location.")
  );
}

function applyFilter(cat) {
  if (!currentLat) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));

  if (currentMode === 'nishi') {
    if (cat === 'all') {
      setLoading("Finding Nishi's picks near you...");
      fetchNishiPicks(currentLat, currentLng);
    } else {
      const filtered = NISHI_PICKS
        .filter(p => p.category === cat)
        .map(p => ({ ...p, dist: haversineDistance(currentLat, currentLng, p.lat, p.lng) }))
        .sort((a, b) => a.dist - b.dist);
      setLoading("Filtering picks...");
      enrichWithPlaces(filtered).then(enriched => renderPlaces(enriched, currentLat, currentLng));
    }
  } else {
    if (cat === 'all') {
      renderPlaces(currentPlaces, currentLat, currentLng);
    } else {
      const typeList = CATEGORY_TYPES[cat] || [];
      const filtered = currentPlaces.filter(p => p.types?.some(t => typeList.includes(t)));
      if (filtered.length) {
        renderPlaces(filtered, currentLat, currentLng);
      } else {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('places-list').innerHTML = `<p style="color:var(--muted);font-size:14px;padding:16px 0;">No ${cat} spots found nearby — tap All to see everything.</p>`;
      }
    }
  }
}
```

**`renderPlaces` — added one line:**
```javascript
function renderPlaces(places, lat, lng) {
  currentPlaces = places;  // ← saves results for filter use
  ...
}
```

**Each NISHI_PICKS entry now has a `category` field:**
- `"food"` — restaurants, bars, delis, food halls
- `"cafe"` — coffee, bagels, bakeries, ice cream, dessert
- `"park"` — parks, High Line, Little Island, Governor's Island
- `"sights"` — museums, landmarks, EDGE, The Vessel, Strand Bookstore, DUMBO

---

### 5. Fixed chat box

**Problem:** Claude's response was a wall of text. Input and answer stayed when going back to home.

**`askNYC` response rendering:**
```javascript
// Before:
responseEl.textContent = data.content[0].text;

// After:
responseEl.innerHTML = data.content[0].text
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
```

**`showHome` — clears chat on back:**
```javascript
function showHome() {
  document.getElementById('home-screen').classList.add('active');
  document.getElementById('results-screen').classList.remove('active');
  document.getElementById('qa-input').value = '';
  const r = document.getElementById('qa-response');
  r.innerHTML = '';
  r.style.display = 'none';
}
```

---

## Description review doc

`nishi_picks_descriptions.md` in the project folder lists all ~50 descriptions currently in the app grouped by neighbourhood. Nishi needs to review and flag any changes — apply edits directly to the matching entry in `NISHI_PICKS` inside `index.html`.

---

## Where to pick up next

**First:** Nishi reviews `nishi_picks_descriptions.md` and tells you what to change. Apply edits to `NISHI_PICKS` in `index.html`.

**Then:**

1. **Restrict the Google API key** — Google Cloud Console → Credentials → edit the key → HTTP referrer restriction: `nyc-recos-guide.vercel.app/*`. Stops anyone stealing the key.

2. **PWA manifest** — `manifest.json` + `<link rel="manifest">` in `index.html` so Abhiruchi can install the app on her iPhone home screen. Involves creating `manifest.json` with name, icons, theme colour, and optionally a service worker for offline support.

3. **Share with Abhiruchi** — stable URL is `nyc-recos-guide.vercel.app`

---

## Workflow rules (for next session)

- **Plan before touching code** — describe what files + functions will change and why, wait for approval
- **No raw git commands** — say which files are ready to push, let Nishi run it
- **One concept at a time** — this is a learning project

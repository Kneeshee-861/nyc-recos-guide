// NYC Travel App — Step 1 & 2: Claude API call with system prompt
// Run this in the browser console on about:blank
// Replace YOUR_KEY_HERE with your Anthropic API key

fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_KEY_HERE",
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
    "anthropic-dangerous-direct-browser-access": "true"
  },
  body: JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: "You are a hyper-local NYC guide. Given GPS coordinates, suggest exactly 3 things to do within a 10 minute walk besides where I am currently standing. Respond in plain JSON like this: [{\"name\": \"place\", \"description\": \"one sentence\"}]. No markdown, no extra text — just the JSON array.",
    messages: [{ role: "user", content: "I'm at 40.7527, -73.9772 (Times Square, Manhattan)." }]
  })
})
.then(r => r.json())
.then(data => {
  const places = JSON.parse(data.content[0].text);
  console.log(places); // Array of {name, description} objects
});

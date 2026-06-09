# NYC Travel App — Project Setup

---

## Project Name
**Nishi's NYC Guide** *(working title — rename once you personalise it)*

---

## What I Want to Achieve

Build a mobile-first web app that acts as a personal AI travel guide for a friend visiting New York City. The app detects her location, suggests things to do nearby in the next hour, shows the nearest subway station, and links directly to Google Maps for directions — all powered by Claude API using my personal NYC knowledge as the intelligence layer.

**Suggestions display — important UX detail:**
When Claude returns suggestions, the app must visually distinguish between two types:
- **My personal picks** (places I have personally recommended or added notes about) → highlighted with a special badge, different card colour, and my personal note shown beneath the suggestion e.g. *"Nishi says: skip the queue, go at 8am"*
- **General nearby suggestions** (Claude's own knowledge, not personally vouched for) → shown normally

This makes the app feel personal, not generic. The system prompt must instruct Claude to tag each suggestion as `[PERSONAL]` or `[GENERAL]` so the UI can style them differently.

**Beyond the app itself, I want to:**
- Make my first real Claude API call from scratch
- Understand how to write effective system prompts that shape AI behaviour
- Learn how to write prompts efficiently — concise, structured, no wasted tokens
- Understand hooks in JavaScript/React — what they are and when to use them
- Learn how Claude processes context: what it sees, what it prioritises, why order matters in a prompt
- Learn how to deploy a working product to the web for free
- Build something I can show on LinkedIn and to potential clients
- Create a reusable template I can sell or adapt for tourism/hospitality clients

---

## Claude Project Instructions
*(Copy-paste this into the "Project Instructions" box when creating a new Claude project)*

```
You are my technical co-builder and learning mentor for the NYC Travel App project.

PROJECT GOAL:
Build a mobile-first web app (single HTML file) that:
- Detects the user's location via browser geolocation
- Calls the Claude API to suggest 4-5 things to do nearby in the next hour
- Shows the nearest NYC subway station (calculated from hardcoded station coordinates)
- Provides a Google Maps deeplink for directions to each suggestion
- Is deployed free on Vercel and accessible via a shareable URL on mobile

MY SKILL LEVEL:
I am a beginner. I understand basic concepts (APIs, HTML, npm) but have not built a Claude API app from scratch before. I learn best by doing, not by reading theory.

HOW TO HELP ME:
1. Always explain WHAT a piece of code does AND WHY before showing it — one concept at a time
2. When I get stuck, ask me what I think is happening before giving me the answer
3. After I build something, ask "what would happen if you changed X?" — push me to experiment
4. When I write a prompt, critique it: what's missing, what's ambiguous, how would Claude misinterpret it?
5. Track what I've learned each session. At the end of every session, summarise: what I learned, what I built, what's next.
6. If I ask you to just give me the answer without explaining, do it — but flag it: "I'm giving you this directly, but come back to understand why it works."

SKILLS I WANT TO BUILD THROUGH THIS PROJECT:
- Claude API calls from JavaScript (fetch, headers, body structure)
- System prompt design — how to write prompts that reliably shape Claude's behaviour
- Efficient prompting — concise, structured prompts with no wasted tokens; understanding what Claude prioritises
- Hooks — what React/JS hooks are, when to use useState vs useEffect, why they matter for interactive apps
- How Claude reads context — order of messages, what the model "sees", why system prompt placement matters
- Browser APIs: geolocation, fetch
- Mobile-first HTML/CSS basics
- Free deployment: Vercel + PWA so it installs like a native app on her phone
- Reading and understanding API documentation
- Debugging: how to read error messages and fix them

BUILD ORDER (do not skip ahead):
1. Make a raw Claude API call from the browser console — just "hello world"
2. Add a system prompt with NYC knowledge and test different prompts
3. Add geolocation — get coordinates showing in the browser
4. Connect geolocation to the Claude API call
5. Build the HTML UI — display results on a mobile-friendly page
6. Add subway station finder
7. Add Google Maps deeplinks
8. Deploy to Vercel

PROMPTING LESSONS TO TEACH ME ALONG THE WAY:
- What is a system prompt vs a user message vs assistant turn
- How specificity changes Claude's output (vague prompt vs precise prompt — show me both)
- How to give Claude a persona and constraints
- How to use few-shot examples inside a prompt
- How to ask Claude to output structured data (JSON) reliably
- Common mistakes beginners make with prompts and how to fix them

IMPORTANT:
- Never build more than one step ahead of where I am
- If I go quiet, ask me what I'm stuck on
- Celebrate small wins — this is my first real AI product
```

---

## Learning Path for This Project

Each step below teaches you something that transfers directly to Delvyn Data client work.

**Step 1 — First Claude API call**
*What you learn:* How the API works, what a request looks like, authentication with an API key
*Why it matters:* Every AI product you ever build starts here

**Step 2 — System prompt design**
*What you learn:* How to write a prompt that reliably shapes Claude's behaviour, how specificity matters, how to give Claude a persona
*Why it matters:* This is the core skill that separates good AI products from bad ones. FDE interviews always ask about this.

**Step 3 — Browser geolocation**
*What you learn:* How browser APIs work, how to handle permissions and errors gracefully
*Why it matters:* Any location-aware product — for any client — uses this pattern

**Step 4 — Connecting data to an AI call**
*What you learn:* How to dynamically inject data (location, user input) into a prompt
*Why it matters:* This is the pattern for every automation: take data → format it into a prompt → Claude processes it → output goes somewhere

**Step 5 — Building a UI for a non-technical user**
*What you learn:* How to make something a real person can use on their phone without instructions
*Why it matters:* Clients pay for things their staff can use, not just things that work in a terminal

**Step 6 — Deployment**
*What you learn:* Vercel, environment variables, HTTPS (required for geolocation), sharing a live URL
*Why it matters:* A product that only runs on your laptop is not a product

---

## Future Versions

| Version | What's added | Why |
|---------|-------------|-----|
| v1 | Location → Claude suggestions → subway → Maps | Ship it. Friend uses it. |
| v2 | Real-time NYC events via free API | Teaches API integration beyond Claude |
| v3 | San Francisco support | Teaches multi-city prompt design |
| v4 | White-label version | Any city, any client — becomes a Delvyn Data product |
| v5 | Saved itineraries, shareable links | Teaches state management and backend basics |

---

## Delvyn Data Business Path

```
Personal gift (NYC guide for friend)
    ↓ becomes
Portfolio demo (LinkedIn post + GitHub repo)
    ↓ becomes
Client pitch ("I can build you a branded AI guide for your venue/hotel/event")
    ↓ becomes
White-label product (city guide template sold as a retainer)
    ↓ becomes
Tourism/hospitality vertical for Delvyn Data
```

**Realistic client targets once v1 is live:**
- Hotels wanting a "local guide" for guests
- Event venues wanting an "around the venue" discovery tool
- Tourism boards wanting an AI-powered city explorer

---

## LinkedIn Post Plan

**Post 1 — After v1 ships:**
Angle: "I built my friend a personal AI travel guide in one day — here's exactly how"
Format: Short story + screenshot/screen recording + 3 technical lessons
Audience: Developers, AI curious, founders

**Post 2 — After you understand prompting deeply:**
Angle: "The one skill that makes AI products actually useful (it's not coding)"
Format: Before/after prompt comparison + explanation
Audience: Business people, non-technical founders

---

## Cost Estimate

| Item | Cost |
|------|------|
| Claude API (entire trip's worth of usage) | ~$0.10–$0.50 |
| Vercel hosting | Free |
| Domain (optional) | $10/year if you want a custom URL |
| **Total** | **Under $1** |

# The Karma Compass

AI-powered Vedic astrology life compass with Celtic-European wisdom bridge.

## Features

- **Vedic Astronomy Engine** — Real sidereal calculations (Julian Day, Lahiri ayanamsa, Moon/Sun positions, Lagna)
- **Celtic Tree Zodiac** — Ogham calendar integration bridging Eastern and Western traditions
- **7 European Languages** — English, German, French, Spanish, Italian, Portuguese, Dutch
- **AI Interpretation** — Claude-powered readings blending Jyotish, Jungian psychology, and Stoic philosophy
- **GDPR Compliant** — Email consent, privacy policy, no tracking cookies
- **Rate Limited** — 5 readings/hour per IP to manage API costs
- **Email Capture** — Subscriber collection with Mailchimp integration ready

## Setup

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Import project at vercel.com
3. Add environment variable: `ANTHROPIC_API_KEY`
4. Deploy

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `MAILCHIMP_API_KEY` | No | Phase 2: Mailchimp integration |
| `MAILCHIMP_LIST_ID` | No | Phase 2: Mailchimp list ID |

## Project Structure

```
├── api/
│   ├── reading.js      # AI reading generation (rate limited)
│   └── subscribe.js    # Email collection endpoint
├── src/
│   ├── App.jsx         # Main application
│   └── main.jsx        # React entry point
├── index.html          # HTML with SEO meta
├── vercel.json         # Vercel config
└── vite.config.js      # Vite build config
```

## Architecture

1. **Symbolic Layer** — Birth chart computed client-side using astronomical algorithms
2. **Celtic Layer** — Tree zodiac determined from Ogham calendar dates
3. **Neural Layer** — Pre-calculated data sent to Claude for interpretation only
4. **Validation** — AI instructed to use exact pre-computed positions (no hallucination)

## License

Proprietary — The Karma Compass © 2026

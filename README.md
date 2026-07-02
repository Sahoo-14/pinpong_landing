# PinPon Dude — Landing Page

Concept landing page for **PinPon Dude**, a proposed skill-based table tennis wagering platform. This repo exists to validate the idea (waitlist signups, early feedback) before any real product build begins.

⚠️ **This is a concept/demo page only.** No real accounts, payments, or matches are processed here. Real-money wagering platforms are subject to regional gambling/skill-gaming regulations — this page is for idea validation, not a live product.

## Live demo

_(add your GitHub Pages / Vercel link here once deployed)_

## What's in here

| File | Purpose |
|---|---|
| `index.html` | Page structure/markup |
| `css/style.css` | All styling (dark theme, layout, animations) |
| `js/script.js` | Animated ping-pong canvas preview + waitlist/feedback form logic |

## Features on the page

- Animated canvas preview of a simulated match
- "How it works" explainer (wallet → stake → play → withdraw)
- Feature/value proposition grid
- Feedback/opinion capture section
- Waitlist email capture (front-end only — no backend wired up yet)

## Running locally

No build step needed — it's static HTML/CSS/JS.

```bash
git clone https://github.com/<your-username>/pinpon_landing.git
cd pinpon_landing
# open index.html directly, or serve it:
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Branch history

This project was built incrementally across feature branches to mirror a real development timeline — see closed PRs / branch list for the build order: markup → styling → interactive game preview → waitlist & forms →polish & responsiveness.

## Roadmap

- [ ] Wire waitlist form to a real backend (e.g. Formspree, Supabase, or custom API)
- [ ] Add analytics to measure interest/conversion
- [ ] A/B test hero copy
- [ ] Legal/compliance review before any real-money features are built
- [ ] Link out to the main platform repo once development starts

## Disclaimer

This is an early-stage concept. Nothing here constitutes a live gambling or financial product. Must be 18+ for any future real-money features.

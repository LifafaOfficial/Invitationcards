# Lifafa — Interactive Digital Invitations

Little moments. Beautifully revealed.

Static site. Works on GitHub Pages. No backend.

## Run locally

Open `index.html` in a browser, or:

```bash
npx serve .
```

## Modular layout

- **Catalogue** → `data/invitations.js` (only file for most monthly adds)
- **Engines** → `interactions.js`
- **Look** → `styles.css`
- **App shell** → `app.js` (routing, search, favourites, order)
- **Brand** → `config.js`
- **Sound / haptics** → `audio.js`, `haptics.js` (opt-in)
- **Assets** → `assets/images/`, `assets/audio/`
- **Validate** → `node validate.js`

Full how-to: see **[ADDING-INVITATIONS.md](ADDING-INVITATIONS.md)**.

## Current snapshot

Catalogue contains 60 invitations: exactly 6 designs in each of the 10 categories. The catalogue validator checks the category counts and required fields.

# Adding invitations

Lifafa is modular. Monthly updates should only touch the catalogue (and assets if needed).

## Architecture

| File / folder | Role |
|---|---|
| `data/invitations.js` | Catalogue only — categories + invitation records |
| `interactions.js` | Reusable interaction engines (`LifafaEngines`) |
| `styles.css` | Shared UI + engine visuals |
| `app.js` | Routing, cards, filters, favourites, personalisation, WhatsApp |
| `config.js` | Brand, WhatsApp number, Instagram, default theme |
| `audio.js` | Web Audio synth (off until user enables sound) |
| `haptics.js` | Vibration patterns (off until user enables haptics) |
| `assets/images/` | Local artwork |
| `assets/audio/` | Optional samples |
| `validate.js` | Expects **exactly 60** records and **6 per category** |

Sound and haptics are **separate** toggles in the viewer (🔇 / 📳). Both default off. Replay and close clear pending haptic schedules.

## A. Normal invitation (existing engine)

**Only change:** `data/invitations.js` (+ assets if needed).

1. Choose an existing `interaction.type` from `LifafaEngines`.
2. Append a record to `LIFAFA_CATALOGUE` with unique `id`, valid `category` slug, `fields` matching `data-f` keys in the engine.
3. Run `node validate.js` (must stay 60 total / 6 per category — replace or remove another record if you are swapping).
4. Smoke-test `#/i/your-id`, personalise, replay, Order.

## B. Artwork / sound / haptics

- Images → `assets/images/`; optional `assets` array on the record for path checks.
- New synth name → `audio.js` only; call via `LifafaAudio.play("name")` in an engine.
- New vibration pattern → `haptics.js` only; call via `LifafaHaptics.pulse` / `schedule`.

## C. New interaction type

1. Add function to `LifafaEngines` in `interactions.js` (use `play` / `hap` / `hapSeq` helpers; clear is global).
2. Add CSS in `styles.css` (respect `prefers-reduced-motion`).
3. Catalogue records with that `type`.
4. `node validate.js`.

Do not duplicate whole engines per card. Vary via `config` and `fields`.

## D. Publish checklist

- [ ] `node validate.js` → OK (60 / 6 each)
- [ ] Design opens; personalise is textContent-only
- [ ] Sound and haptics toggles independent
- [ ] Replay/close cancel haptics
- [ ] No horizontal overflow ~375px / desktop

No backend required. GitHub Pages compatible.

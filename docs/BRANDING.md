# Pdb branding

**Idea:** a ringed planet with a spark, on a deep-space tile. It says "explore, discover your place in the universe" without any literal personality-test imagery.

| Piece | Where |
| --- | --- |
| Logo mark and wordmark (the app draws it as vector art) | `src/components/brand/Logo.tsx` |
| Launch animation (logo blooms out of the star field) | `src/components/cosmic/SplashOverlay.tsx` |
| Space background (stars, planets, shooting star) | `src/components/cosmic/CosmicBackground.tsx` |
| App icon, adaptive icon, splash image, favicon | `assets/images/` (referenced from `app.json`) |

## Palette

| Role | Colour |
| --- | --- |
| Deep space | `#06050F` → `#100C26` |
| Nebula violet | `#8B5CF6` |
| Nebula pink | `#EC4899` |
| Ring cyan | `#67E8F9` |
| Spark gold | `#FDE68A` |

The full theme palettes (Nebula, Aurora and four premium ones) are in `src/theme/themes.ts`.

## Re-exporting the icons

The PNGs in `assets/images/` are rendered from the same shapes as `Logo.tsx`:

- `icon.png` (1024²): the mark on a full-bleed space gradient
- `adaptive-icon.png` (1024²): the mark at 66% on a flat tile (Android masks it)
- `splash-icon.png` (1024²): the mark alone on transparent
- `favicon.png` (96²): the mark on a rounded tile

If you change the logo, redraw the shapes in an SVG with the same gradients, render it to those sizes and replace the files. Keep the safe area: the planet and ring should stay inside the middle 70% of `icon.png`.

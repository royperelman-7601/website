# royperelman-7601.github.io

Personal profile site of Roy Perelman (SRE Engineer, CS & Economics student at Tel Aviv University), aimed at recruiters and hiring managers for SRE / DevOps / Cloud roles.

Live at **https://royperelman-7601.github.io/**

It is a plain static site: HTML, CSS and vanilla JavaScript ES modules. There is no npm, no build step and no dependencies to install. GitHub Pages serves the files exactly as they are in the repo.

## Folder structure

```
.
├─ index.html            all page content (text, links, section markup) + SEO <head>
├─ 404.html              "page not found" page (GitHub Pages serves it for unknown paths)
├─ css/
│  ├─ tokens.css         design tokens: colors, fonts, spacing, motion
│  ├─ base.css           reset, layout, buttons, reduced-motion rules
│  ├─ hero.css           hero + 3D globe
│  ├─ sections.css       nav, about, skills, experience, education, contact, footer
│  └─ terminal.css       the ` terminal easter egg
├─ js/
│  ├─ main.js            entry point: imports and starts every effect
│  ├─ data/terminal.js   texts printed by the terminal commands
│  └─ effects/           one module per effect (globe, wordReveal, tilt, scrollReveal, contact, terminal)
├─ photos/               profile.webp + profile.jpg (640×640, metadata stripped)
├─ favicon.svg, apple-touch-icon.png, og-image.png   icons and the link-preview image
├─ robots.txt, sitemap.xml                           for search engines
├─ .nojekyll             tells GitHub Pages to serve files as-is (no Jekyll processing)
├─ demo/                 effects demo, reference only (git-ignored, never published)
└─ SPEC.md, PLAN.md      local planning notes (git-ignored, never published)
```

## Editing content

| What | Where |
|---|---|
| Page text (about, experience, education, skills, contact links) | `index.html`. All text is written directly in the HTML, which is good for SEO and link previews. |
| Terminal easter-egg texts (`whoami`, `skills`, `experience`, `contact`) | `js/data/terminal.js` |
| Colors, fonts, spacing | `css/tokens.css` (change values there only) |
| Profile photo | `photos/` (keep the same file names, square, and strip metadata first) |
| Title, description, link-preview tags | the `<head>` of `index.html` |
| Link-preview image | `og-image.png` (1200×630) |

If you change the headline or job, also update the meta description, Open Graph / Twitter tags and JSON-LD in the `<head>`, regenerate `og-image.png`, and bump `<lastmod>` in `sitemap.xml`.

## Preview locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. A local server is needed (opening `index.html` directly from disk breaks the ES module imports).

## Adding a new effect

1. Create `js/effects/<name>.js` that exports an init function, e.g. `export function initSparkles(root, env) { ... }`. `env` gives you `reducedMotion`, `isMobile` and `canHover`; respect `reducedMotion`.
2. Import it in `js/main.js` and add it to the `effects` list. Each effect runs in its own `try/catch`, so a failing effect never breaks the rest of the page.
3. Put its styles in a CSS file under `css/` and link it in the `<head>`.

Rules: build DOM with `textContent` / `createElement` (never `innerHTML`), and no inline `<script>` or `style="..."`, because the Content-Security-Policy blocks them. External scripts are allowed only from `https://cdn.jsdelivr.net/npm/three@0.160.0/build/` (the pinned three.js build). To load anything else, or to upgrade three.js, update the CSP `<meta>` in `index.html` and `404.html`.

## Publishing

The site is published with GitHub Pages from the personal account `royperelman-7601` (never a work account):

- Repo: `royperelman-7601/royperelman-7601.github.io` (public).
- Pages source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
- Every push to `main` updates the live site within a minute or two. No GitHub Actions are needed.

`demo/`, `SPEC.md` and `PLAN.md` are listed in `.gitignore`, so they stay on your machine and are never pushed or published.

## Privacy note

This repo and the site are public. The email address and the WhatsApp number in `index.html` (the `wa.me` link and the email `data-*` attributes) are visible to anyone. The email link is assembled by JavaScript to reduce simple scraping, but that is not real protection. Remove or change them in `index.html` if they should no longer be public.

## Licenses

- [three.js](https://threejs.org/) 0.160.0, MIT License, loaded from the jsDelivr CDN at runtime (not vendored in this repo).
- Everything else is original code for this site.

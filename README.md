# Roy Perelman · personal website

Personal profile site of Roy Perelman (SRE Engineer, CS & Economics student at Tel Aviv University), aimed at recruiters and hiring managers for SRE / DevOps / Cloud roles.

Live at **https://royperelman.onrender.com/** (hosted on Render).

It is a plain static site: HTML, CSS and vanilla JavaScript ES modules. There is no npm, no build step and no dependencies to install. Render serves the files exactly as they are in the repo.

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

Rules: build DOM with `textContent` / `createElement` (never `innerHTML`), and no inline `<script>` or `style="..."`, because the Content-Security-Policy blocks them. External scripts are allowed only from `https://cdn.jsdelivr.net/npm/three@0.160.0/build/` (the pinned three.js build). To load anything else, or to upgrade three.js, update the CSP in **three** places: the `<meta>` in `index.html`, the `<meta>` in `404.html`, and the `Content-Security-Policy` header in `render.yaml`.

## Publishing

The site is hosted on **Render** as a static site, built from the GitHub repo of the personal account `royperelman-7601` (never a work account):

- Repo: `royperelman-7601/website` (public). GitHub Pages is turned off; Render is the only host.
- Render config: `render.yaml` (Blueprint). Service `royperelman`, no build step, publishes the repo root, auto-deploys on every push to `main`.
- `render.yaml` also sets the HTTP security headers (CSP incl. `frame-ancestors`, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS) and cache rules.
- Every push to `main` updates the live site within a minute or two; Render purges its CDN cache on each deploy.
- Everything at the repo root is publicly served (including this README and `render.yaml`), so never commit secrets or private notes here.

`demo/`, `SPEC.md` and `PLAN.md` are listed in `.gitignore`, so they stay on your machine and are never pushed or published.

## Privacy note

This repo and the site are public. The email address and the WhatsApp number in `index.html` (the `wa.me` link and the email `data-*` attributes) are visible to anyone. The email link is assembled by JavaScript to reduce simple scraping, but that is not real protection. Remove or change them in `index.html` if they should no longer be public.

## Licenses

- [three.js](https://threejs.org/) 0.160.0, MIT License, loaded from the jsDelivr CDN at runtime (not vendored in this repo).
- Skill card icons: [Lucide](https://lucide.dev/) (cloud, activity, terminal, code), ISC License, inlined as SVG.
- Design polish pass guided by the unslop skill by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0.
- Everything else is original code for this site.

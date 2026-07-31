# Panvee Naidu — Portfolio

Personal portfolio site. Static, dependency-free at runtime, deployed on Vercel.

**Live:** https://panveedev.vercel.app

![Panvee Naidu — Software Engineer](og.png)

---

## About

A single-page portfolio built around an "Obsidian Mono" design language — pure black on off-white,
zero border-radius, monospace labels, and motion used sparingly. It covers featured projects,
technical skills, experience, education, and verifiable certifications.

Started from a [Google Stitch](https://stitch.withgoogle.com) export, then rebuilt for production:
compiled Tailwind, compressed assets, real scroll-spy navigation, and accessible motion.

## Tech

| | |
|---|---|
| Markup | Semantic HTML5, single page |
| Styling | Tailwind CSS 3 (compiled, not CDN) + hand-written CSS for custom animation |
| Scripting | Vanilla JS — no framework, no bundler |
| Background | WebGL fragment shader (interactive dot grid) |
| Hosting | Vercel (static) |

**No runtime dependencies.** The browser loads one HTML file, one 20 KB stylesheet, and one image.

## Features

- **Scroll-spy navigation** — an underline slides between sections as you scroll, driven by
  section geometry rather than hardcoded state
- **WebGL dot-grid background** that reacts to cursor position
- **3D tilt** on project cards, and a black fill that sweeps up on certification cards
- **Full-screen mobile overlay menu**
- **Contact form** that composes a prefilled `mailto:` — no backend, no third-party form service
- **Respects `prefers-reduced-motion`** — every animation is guarded
- **Social share card** with Open Graph and Twitter meta

## Performance

| | Before | After |
|---|---|---|
| Page weight | ~2,350 KB | **~243 KB** |
| CSS | ~400 KB (CDN, runtime-compiled) | **20 KB** (prebuilt, minified) |
| Hero image | 1.81 MB PNG | **174 KB** JPEG |

## Running locally

```bash
git clone https://github.com/panvenaidu/Portfolio.git
cd Portfolio
python3 -m http.server 8000   # then open http://localhost:8000
```

## Editing styles

`styles.css` is generated — do not edit it directly. Change classes in `index.html` or tokens in
`tailwind.config.js`, then rebuild:

```bash
npm install
npx tailwindcss -c tailwind.config.js -i src/input.css -o styles.css --minify
```

The design tokens (colours, spacing, type scale) live in `tailwind.config.js` and are the source
of truth for the whole design system.

## Deploying

```bash
vercel deploy --prod
```

`.vercelignore` keeps build tooling off the server, so Vercel serves pure static output and never
runs a build step.

## Structure

```
index.html            Entire site — markup, custom CSS, and JS
styles.css            Compiled Tailwind output (generated)
tailwind.config.js    Design tokens
src/input.css         Tailwind entry point
profile.jpg           Hero portrait
og.png                Social share card
Panvee_Naidu_Resume.pdf
Certs/                Certificates linked from the site
```

## Contact

- **Email** — panveenaidu5@gmail.com
- **LinkedIn** — [panvee-naidu](https://www.linkedin.com/in/panvee-naidu-8a6430291/)

## License

[MIT](LICENSE) for the code. The résumé, certificates, and photograph are personal content and are
not covered by that licence — please don't reuse them.

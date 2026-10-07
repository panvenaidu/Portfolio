# Panvee Naidu | Workroom

Workroom is the only portfolio. The approved design, portrait, seven projects, six case studies, eight credentials and résumé are preserved. All earlier core previews, their source/artwork and unused animation dependencies have been removed from the project.

Open **http://127.0.0.1:4173/** while the preview server runs. The previous `/scrollcraft.html` review URL redirects here. Restart with `Start Portfolio.command`, or:

```sh
npm ci
npm run build
npm run preview
```

Development: `npm run dev` at http://127.0.0.1:5173. Use Node 20.19+ or 22.12+.

`index.html` is the approved Workroom page. `src/workroom.css` and `src/workroom.js` provide its existing layout, project gallery, Desk view and restrained motion. `src/vendor/scrollcraft.*` is the unchanged skill engine. Case studies use native links and the same Workroom theme by default, including without scripts.

`scrollcraft/builds/workroom/` contains the original brief, factual content and visual verification. Historical fingerprints remain an append-only record, not selectable website versions. Recovery archives are outside outputs, in the task's `work/` folder.

Run `npm run build` and `npm run check` before publishing.

Production target: [panveedev.vercel.app](https://panveedev.vercel.app), the existing `panveedev` Vercel project in `panvenaidus-projects`. Source: [panvenaidu/Portfolio](https://github.com/panvenaidu/Portfolio), production branch `main`. Vercel uses the Vite build and `dist` output configured in `vercel.json`. Credentials, local build output and browser verification captures are excluded from Git.

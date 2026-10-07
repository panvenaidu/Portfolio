# Local review | October 8, 2026

Workroom is the only portfolio at **http://127.0.0.1:4173/**. The previous `/scrollcraft.html` URL redirects here. Core Story, Scroll Companion, their core code/artwork and unused Three.js/GSAP/Lenis/font/icon dependencies are removed. Recovery copies are outside the delivered project.

The approved hero, gallery, Desk view, project facts and personal documents remain. Case links now return directly to Workroom, and its case theme works by default without a mode query or JavaScript. No new animation or video was added.

The original full desktop/mobile, keyboard, motion and contrast review is recorded in `scrollcraft/builds/workroom/VERIFICATION.md`; its retained-preview descriptions are historical. Current cleanup checks are appended there after verification. No deployment or remote push was performed.

Cleanup confirmation: production build, check and whitespace checks pass; 84 local references and all 23 local HTTP targets resolve. Browser confirmation covered the sole homepage, closing links and AeroChat case navigation/theme.
# Action cursor refinement, 8 October 2026

Local review only; no Git push or Vercel deployment for this refinement.

- Renamed the document-list heading to Certificates, preserving IDs and all eight document links.
- Shared action cursor on the homepage and six case studies: View certificate, Read case study, View repository, View résumé, Email, Visit GitHub, Visit LinkedIn and navigation/control labels.
- Seven project areas delegate their primary action to the original native link. Secondary links remain independent. Native keyboard links and modifier-key activation are preserved.
- One batched desktop/mobile inspection and one confirmation after centering the badge on its pointer row. Local interaction fixtures verified all labels and viewport edge clamping; native browser input verified area navigation, Command-click to a new tab, text selection without navigation, and Enter activation of the case-study link.
- Coarse-pointer and reduced-motion fixtures keep the native cursor; no-script fixture retains all eight certificate links. Mobile width 390px has no horizontal overflow. Browser error logs were empty.
- Cursor text contrast: 13.75:1. Build and content checks pass: eight HTML outputs, 98 local references. All original href destinations match the published baseline. The cursor module is 1.90 kB gzipped; no dependency was added.
- Impeccable detector reports 16 padding warnings on unchanged containers, none on the cursor. Rendered certificate links have 16px vertical padding; gallery/opening insets are supplied by the existing CSS; case-study border/background classes are overridden by Workroom. These are not new visual defects.

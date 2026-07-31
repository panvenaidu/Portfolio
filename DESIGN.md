---
name: Obsidian Mono
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e4e2e1'
  on-secondary-container: '#656464'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e4e2e1'
  secondary-fixed-dim: '#c8c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  white: '#FFFFFF'
  gray-dark: '#666666'
  gray-light: '#E5E5E5'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-xl-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '800'
    lineHeight: '1.1'
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
spacing:
  container-max: 1200px
  gutter: 32px
  margin-mobile: 20px
  margin-desktop: 64px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-gap: 80px
---

## Brand & Style

This design system embodies a "developer-chic" aesthetic, blending the precision of technical documentation with the high-end feel of a modern editorial. The brand personality is professional, authoritative, and unapologetically focused on clarity. It targets a sophisticated audience that values substance over decoration.

The visual style is a fusion of **Minimalism** and **Modern Brutalism**. It utilizes expansive white space to frame content, while employing razor-sharp borders and a strict monochromatic palette to establish a sense of architectural structure. The UI should evoke a feeling of "digital craft"—precise, intentional, and high-performance. Every element exists for a reason, stripped of unnecessary ornamentation like shadows or gradients.

## Colors

The palette is strictly monochromatic, relying on extreme contrast to create hierarchy. 

- **Primary:** Pure black (#000000) is used for all primary headlines, borders, and high-emphasis elements.
- **Secondary:** A deep charcoal (#333333) softens secondary information and metadata while maintaining legibility.
- **Neutral:** The background is crisp white (#FFFFFF), with very subtle grays (#F5F5F5) used only for large layout containers or code block surfaces to provide structural distinction without breaking the high-contrast aesthetic.

Avoid any use of color outside of this spectrum. For interactive states (hover/active), use inversions (black background with white text) rather than introducing new hues.

## Typography

The typography system uses a tri-font approach to balance impact and utility. 

1.  **Hanken Grotesk (Headlines):** High-impact, sharp sans-serif for major section headings. `headline-lg` is consistently uppercase with increased letter spacing to emulate professional print headings.
2.  **Inter (Body):** A neutral, highly legible face for descriptions and paragraphs. Body text should prioritize readability with generous line heights.
3.  **JetBrains Mono (Labels/Meta):** Introduced for small metadata, tech stacks, and tags to reinforce the "developer-chic" technical narrative.

**Alignment Note:** For large blocks of body text on desktop, use justified alignment to create clean vertical edges, mirroring the structure of the borders.

## Layout & Spacing

This design system uses a **fixed grid** model for desktop to ensure content remains framed within the white space. The layout is built on a 12-column grid with a significant 32px gutter.

- **Desktop (1200px+):** Centered container with 64px outer margins. High use of "Split-Row" layouts where the primary title is on the left and metadata/dates are right-aligned.
- **Tablet (768px - 1199px):** Content scales to 90% width; 32px margins. 
- **Mobile (<767px):** 20px horizontal margins. Split-row patterns collapse into vertical stacks with metadata moving below titles.

Spacing follows a strict 8px base unit. Use `section-gap` between major portfolio sections (Work, Projects, About) to maintain a feeling of openness.

## Elevation & Depth

The design is **100% flat**. Visual hierarchy is achieved through contrast, weight, and layout rather than shadows or blurs.

- **No Shadows:** Do not use box-shadows or drop-shadows on any element.
- **Borders as Depth:** Use `1px` or `2px` solid black borders to define containers. A thicker `2px` border is used for the primary section dividers (bottom of `h2` elements).
- **Tonal Layering:** Very subtle use of `#F5F5F5` backgrounds for code blocks or "card" surfaces is permitted to create a distinct area of focus, but these should remain bordered by `#000000`.
- **Text Selection:** Text selection should be inverted (#000000 background with #FFFFFF text) to match the high-contrast theme.

## Shapes

The shape language is **Sharp**. All corners on buttons, cards, input fields, and images must have a 0px radius. This reinforces the architectural, brutalist nature of the design. 

Borders are the primary decorative element. Use a `1px solid #000000` border for general containers and a `2px solid #000000` border for interactive components or primary dividers.

## Components

- **Buttons:** Rectangular with 0px radius. Primary buttons are solid black with white text. Hover state inverts to white background with black text and a 2px black border.
- **Input Fields:** 1px black border-bottom only (styled like a signature line) for a minimalist feel, or a full 1px box. Focus state thickens the border to 2px.
- **Chips/Tags:** Small rectangular boxes using `label-sm` typography (JetBrains Mono). 1px black border, no fill.
- **Lists:** Unordered lists use a small square bullet or a simple hyphen. Items are separated by subtle `1px` light gray lines or generous vertical whitespace.
- **Cards:** Defined by a 1px solid black border. No shadow. Cards should have generous internal padding (32px) to allow the content to "breathe."
- **Dividers:** Use a horizontal rule with `2px solid #000000` for main section headers. Use `1px solid #E5E5E5` for secondary separations within content blocks.
- **Navigation:** Simple text links in `label-md` weight. Use a thick `2px` underline for the active state.
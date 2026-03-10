# Design System: ReferralHub — Landing / Home Page
**Project ID:** `5265646510576057629`
**Stitch Project:** [1. Landing / Home Page](https://stitch.withgoogle.com/projects/5265646510576057629)
**Device:** Desktop (2560 × 5776 @2x)

---

## 1. Visual Theme & Atmosphere

**Mood:** Confident, polished, and approachable — like a well-tailored suit at a tech mixer. The design channels the clean authority of modern SaaS platforms (think Linear, Vercel) with a warm, inviting twist that makes career advancement feel within reach rather than intimidating.

**Density:** Spacious and breathable. Generous vertical padding between sections (96px–128px) creates a calm, unhurried reading rhythm. Content is constrained to a focused `max-w-7xl` (1280px) centerstage with comfortable `px-6` horizontal gutters, letting the warm off-white background breathe around each module.

**Philosophy:** Light mode with high contrast between content surfaces and the warm parchment-toned background. The interface layers white cards over the creamy canvas, creating a subtle "paper on desk" metaphor. Interactive elements pop with a bold, saturated indigo-blue primary that commands attention without being aggressive. The dark navy (`brand-dark`) provides serious typographic weight, while opacity modifiers (`/60`, `/70`, `/40`) create a natural text hierarchy without introducing additional hues.

---

## 2. Color Palette & Roles

| Name | Hex | HSL Approximation | Role |
|------|-----|-------------------|------|
| **Electric Indigo** | `#4F6EF7` | `hsl(228, 91%, 64%)` | Primary action color. Used for CTA buttons, interactive links on hover, hero accent text, step number badges, icon containers, and the full-bleed CTA banner background. The single most important color — it says "act now." |
| **Midnight Navy** | `#1A1A2E` | `hsl(240, 28%, 14%)` | Brand dark / typographic anchor. Used for all headings, body text, logo lockup backgrounds, the inverted "For Referrers" card, and the footer logo mark. Carries gravitas and trustworthiness. |
| **Warm Parchment** | `#F8F7F4` | `hsl(40, 24%, 96%)` | Page background. A warm, barely-there cream that avoids the sterile coldness of pure white. Creates a "paper" feel that feels premium and approachable. |
| **Deep Space** | `#101322` | `hsl(230, 38%, 10%)` | Dark mode background (defined but unused in light mode). Reserved for future dark-mode variations. |
| **Pure White** | `#FFFFFF` | — | Surface color for cards, containers, the header, social proof bar, and footer. Creates a clear "elevated surface" layer against the parchment background. |
| **Success Mint** | `green-100` / `green-600` | — | Semantic success indicator. Used exclusively in the floating "Referral accepted" notification card (light green background `bg-green-100`, green icon `text-green-600`). |

### Opacity System

The design uses a sophisticated opacity-based hierarchy instead of distinct gray shades:

- `brand-dark/70` — Secondary body text (navigation links, hero subtitle)
- `brand-dark/60` — Tertiary text (step descriptions, footer links, timestamps)
- `brand-dark/40` — Quaternary / label text (social proof label, copyright)
- `brand-dark/10` — Subtle borders (secondary button strokes, footer social icons)
- `brand-dark/5` — Whisper borders (card edges, header bottom border, section dividers)
- `primary/25` — Button shadow tint (hero CTA glow)
- `primary/20` — Button shadow tint on smaller CTAs
- `primary/10` — Tinted backgrounds (badge pill, step number circles)
- `white/80` — Inverted body text on primary backgrounds (CTA sub-copy)
- `white/60` — Inverted secondary text on dark surfaces (referrer card descriptions)
- `white/20` — Ghost borders on dark/colored backgrounds (CTA secondary button)
- `white/10` — Step circles on the dark "For Referrers" card

---

## 3. Typography Rules

### Font Families

| Role | Family | Fallback | Usage |
|------|--------|----------|-------|
| **Display / Headings** | `Sora` | Plus Jakarta Sans, sans-serif | All `h1`, `h2`, `h3`, `h4` headings. A geometric sans-serif with wide letterforms that feel modern and authoritative. |
| **Body / UI** | `Plus Jakarta Sans` | sans-serif | All body text, navigation, buttons, labels, and fine print. A humanist sans-serif that balances professionalism with warmth. |

### Weight Hierarchy

| Weight | Token | Usage |
|--------|-------|-------|
| **Extra Bold (800)** | `font-extrabold` | Hero headline (`h1`), section headlines (`h2`), CTA headline. Maximum visual punch. |
| **Bold (700)** | `font-bold` | Card titles (`h3`), step titles (`h4`), buttons, badge text, numbers, logo text, social proof label. |
| **Semi-Bold (600)** | `font-semibold` | Navigation links. A step below bold for secondary interactive text. |
| **Medium (500)** | `font-medium` | Footer navigation links. Understated interactive text. |
| **Regular (400)** | Implicit | Body paragraphs, step descriptions. Default comfortable reading weight. |

### Scale & Sizing

| Element | Class | Size |
|---------|-------|------|
| Hero headline | `text-5xl md:text-7xl` | 48px → 72px (responsive) |
| Section headings | `text-4xl md:text-5xl` or `text-4xl md:text-6xl` | 36px → 48px/60px |
| Card titles | `text-2xl` | 24px |
| Body / Subtitle | `text-lg md:text-xl` | 18px → 20px |
| Navigation | `text-sm` | 14px |
| Badges / Labels | `text-xs` | 12px |
| Copyright | `text-xs` | 12px |

### Character

- Hero headline uses tight leading at `leading-[1.1]` for a dense, poster-like impact with `tracking-tight`
- Social proof label uses extreme letter-spacing at `tracking-[0.2em]` with `uppercase` for an editorial, magazine-masthead feel
- Logo text uses `tracking-tight` for a compact, modern wordmark
- Body text uses `leading-relaxed` for comfortable paragraph reading

---

## 4. Component Stylings

### Buttons

| Variant | Shape | Colors | States |
|---------|-------|--------|--------|
| **Primary CTA (Large)** | Generously rounded corners (`rounded-xl`, 12px). Tall at 56px (`h-14`). Substantial horizontal padding (`px-8`). | Electric Indigo background, white text. Accompanied by a colored drop-shadow glow (`shadow-xl shadow-primary/25`). | Hover: slight opacity decrease (`hover:bg-primary/90`), smooth transition (`transition-all`) |
| **Secondary CTA (Large)** | Same rounded corners (`rounded-xl`), same height. | White background with a 2px Midnight Navy border at 10% opacity (`border-2 border-brand-dark/10`). Dark text. | Hover: subtle dark tint (`hover:bg-brand-dark/5`) |
| **Primary (Compact)** | Moderately rounded (`rounded-lg`, 8px). Medium height (`py-2.5`). | Electric Indigo background, white text. Colored shadow glow (`shadow-lg shadow-primary/20`). | Hover: micro-scale lift (`hover:scale-[1.02]`) — a delightful kinetic detail |
| **Ghost (Compact)** | Moderately rounded (`rounded-lg`). | Transparent background, dark text. | Hover: subtle fill (`hover:bg-brand-dark/5`) |
| **Inverted Primary (on colored bg)** | Rounded corners (`rounded-xl`). | White background, Electric Indigo text. | Hover: slight transparency (`hover:bg-white/90`) |
| **Inverted Ghost (on colored bg)** | Rounded corners (`rounded-xl`). | Semi-transparent dark background with white ghost border (`border-white/20`). White text. | Hover: subtle light tint (`hover:bg-white/10`) |

### Cards / Containers

| Variant | Corners | Background | Border | Shadow | Usage |
|---------|---------|------------|--------|--------|-------|
| **Feature Card (Light)** | Boldly rounded (`rounded-3xl`, 24px) | Pure White | Whisper border at `border-brand-dark/5` | Feather-light (`shadow-sm`) | How-it-works: "For Job Seekers" card |
| **Feature Card (Dark)** | Boldly rounded (`rounded-3xl`) | Midnight Navy (`bg-brand-dark`) | None | Heavy elevation (`shadow-2xl`) | How-it-works: "For Referrers" card |
| **Floating Notification** | Softly rounded (`rounded-2xl`, 16px) | Pure White | Whisper border at `border-brand-dark/5` | Heavy elevation (`shadow-2xl`) | Hero overlay: "Referral accepted" toast |
| **CTA Banner** | Extra-generous rounding (`rounded-[2.5rem]`, 40px) | Electric Indigo | None | None (the color is the elevation) | Full-width call-to-action section |
| **Hero Image Frame** | Boldly rounded outer (`rounded-3xl`) with `rounded-2xl` inner | Gradient: `from-primary/20 to-brand-dark/5` | Delicate ring: `ring-1 ring-brand-dark/5` | Inner white container has `shadow-2xl` | Hero image wrapper |

### Inputs / Forms

No explicit form fields are present on the landing page. When forms appear in other screens, follow these inferred patterns:
- Border style: 1px solid at `brand-dark/10`
- Background: White or transparent
- Border radius: `rounded-lg` (8px) to match compact buttons
- Focus state: Electric Indigo ring

### Icons

- **System:** Google Material Symbols Outlined (variable weight 100–700, variable fill 0–1)
- **Style:** Outline-style only (clean, modern, lightweight)
- **Size:** `text-3xl` for card icons, `text-sm` for inline/badge icons
- **Containers:** Icons in cards sit in 56px (`h-14 w-14`) rounded-2xl containers with solid fills; step numbers use 32px (`h-8 w-8`) pill-shaped circles

### Navigation

- **Header:** Sticky, glass-morphic (`bg-background-light/80 backdrop-blur-md`), anchored at top with `z-50`. Bottom border is a whisper (`border-brand-dark/5`).
- **Logo:** 40px square dark navy container with rounded-xl corners, containing a "hub" icon. Adjacent bold text wordmark.
- **Links:** Semi-bold, muted dark at 70% opacity. Hover transitions to Electric Indigo.
- **Footer:** Simple horizontal layout. Logo mark is smaller (32px, `rounded-lg`). Links are medium weight at 60% opacity. Social icons sit in 40px circular bordered containers.

---

## 5. Layout Principles

### Grid System

- **Max content width:** `max-w-7xl` (1280px), centered with `mx-auto`
- **CTA section:** Uses narrower `max-w-5xl` for a more intimate, focused container
- **Text width constraints:** Hero subtitle at `max-w-xl`, CTA headline at `max-w-2xl`, CTA subtitle at `max-w-xl`
- **Column layout:** Two-column grid (`grid-cols-2`) for "How it works" section, side-by-side hero content/image. Single column on mobile.
- **Social proof:** 4-column grid on desktop, 2-column on mobile

### Spacing Rhythm

| Context | Value | Usage |
|---------|-------|-------|
| **Section vertical padding** | `py-24` / `py-24 lg:py-32` (96px / 128px) | Major section breathing room |
| **Hero top padding** | `pt-20 lg:pt-32` (80px / 128px) | Space below sticky header |
| **Intra-section gaps** | `gap-12`, `gap-16` | Between grid items in hero and feature sections |
| **Card internal padding** | `p-10` (40px) | Generous internal space in feature cards |
| **Element spacing** | `space-y-10`, `mb-8`, `mt-4`, `mt-6`, `mt-10` | Consistent vertical rhythm between content blocks |
| **Horizontal gutters** | `px-6` (24px) | Consistent page-edge padding |
| **Social proof section** | `py-12` (48px) | Lighter breathing room for the logo strip |

### Responsive Behavior

- **Breakpoints used:** `sm:`, `md:`, `lg:` (Tailwind defaults: 640px, 768px, 1024px)
- **Pattern:** Mobile-first. Single column layouts expand to multi-column at `lg:`. Typography scales up at `md:`. Certain elements (`sm:block`, `md:block`) are hidden on smaller screens.
- **Header nav:** Hidden on mobile (`hidden md:flex`), only CTA buttons shown
- **Hero floating card:** Hidden on mobile (`hidden md:block`)

### Depth Model

The interface uses a layered "paper stack" approach:
1. **Base layer:** Warm Parchment background (`#F8F7F4`)
2. **Surface layer:** Pure White cards and containers, elevated with either whisper-soft `shadow-sm` or dramatic `shadow-2xl`
3. **Interactive layer:** Electric Indigo buttons with colored shadow glow (`shadow-primary/25`)
4. **Overlay layer:** Backdrop-blurred sticky header, floating notification cards
5. **CTA layer:** Full-bleed Electric Indigo banner with inverted color scheme

Borders are almost invisible — typically `5%` opacity of Midnight Navy — creating separation through suggestion rather than hard lines. The design trusts whitespace and surface color differences to create hierarchy, using heavy shadows only when a card must truly "float" above its context (hero notification, dark feature card).

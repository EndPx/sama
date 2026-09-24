# SAMA interface system

## 1. Atmosphere and identity

An open campus for early conviction: warm ivory, deep forest green, generous editorial space, and an original miniature architectural campus. The focal artwork makes the offering lifecycle feel approachable without presenting a test asset as an investment. This extends the existing ivory/green scaffold and installed shadcn/Radix primitives; it is not a new component framework.

The signature moment is an asymmetric editorial headline beside SAMA's original miniature campus. Scrolling moves through the campus into a vertical protocol field note. The campus represents a common meeting place, not a property investment. Transaction screens trade spectacle for legibility. No price tickers, invented traction, yield promises, or decorative market charts. All interface content is English. KIRA is always a simulated equity-linked demo token; demoUSDC has no monetary value. The landing introduces SAMA, not a featured Kirana company card; the single fictional company remains on Explore and its transaction page.

Selected soft/Stripe reference files were unavailable in the installed frontend skill. The existing brand assets and tokens are authoritative instead. Spatial references: [page-grid](https://github.com/changeroa/StyleGallery/blob/main/patterns/grid-repetition/page-grid.md) and [sticky-aside](https://github.com/changeroa/StyleGallery/blob/main/patterns/split-sidebar/sticky-aside.md). State-feedback reference: [beui button source](https://beui.dev/r/button), adapted without its animation dependency.

### Owner-supplied Crafts reference

[Crafts](https://crafts.dev/) was inspected in a live browser at 375, 768, and 1280 px. Observed runtime values: warm `rgb(239,238,234)` canvas; 1280 px headline approximately 81.92 px, weight 500, line-height 77 px, tracking -3.69 px; tablet headline 46.08 px; mobile headline 30.78 px. Desktop navigation is approximately 95 px tall with 44 px pill actions and 150 ms state feedback. A 1728 px desktop hero contains a sticky scene: edge labels converge, introductory copy exits, and a white explanatory sheet takes focus. Mobile presents the diagram below the headline instead of forcing desktop pinning. These are reference observations, not copied SAMA tokens.

The owner subsequently clarified that Crafts is inspiration, not a visual clone. The centered serif-accent hero, orbiting pills, converging bars, and centered explanatory sheet are explicitly rejected for SAMA. Adopt only the principle of scroll-linked explanation. SAMA uses an asymmetrical 44/56 campus composition, forest/ivory, self-hosted Manrope without serif accents, original artwork, square-soft actions, and a left-ruled vertical protocol field note. A bounded camera-like translation moves the campus while that note enters; no borrowed badge choreography. The unavailable `gpt-tasteskill.md` reference is replaced by this original design contract, not an invented skill result.

The [Crafts pitch](https://www.youtube.com/watch?v=4HIgikZlpb8) and [Colosseum page](https://colosseum.com/arena/projects/crafts-1) inform narrative order: problem, mechanism, launch scope, evidence. Timestamped auto-caption review found mechanism explanation around 0:38 and pricing around 1:05. SAMA does not inherit Crafts' legal, regulated-equity, adoption, partnership, or liquidity claims. No third-party brand assets or copy are reused.

## 2. Color

| Semantic token | Value | Role |
| --- | --- | --- |
| background | `#f6f4ed` | Warm page canvas, retained from scaffold |
| foreground | `#192d25` | Reading and headings |
| card / popover | `#fffdf8` | Raised paper surfaces, retained |
| primary | `#173f35` | Forest action and identity |
| primary-foreground | `#fffdf8` | Text on forest |
| secondary / accent | `#e4eadf` | Sage selection and secondary surfaces |
| secondary-foreground / accent-foreground | `#173f35` | Sage contrast |
| muted | `#efeee6` | Recessed surface |
| muted-foreground | `#55655a` | Secondary readable text |
| border / input | `#cbd4c7` | Component edges |
| ring | `#376854` | Keyboard focus |
| destructive | `#a32d27` | Error text and destructive action |
| success | `#236347` | Confirmed receipt, never pending |
| warning | `#825217` | Recoverable warning |
| forest-deep | `#102e27` | Dark editorial feature |
| sage-light | `#edf1e4` | Campus surround |
| white | `#ffffff` | Highlight and white-on-destructive |

No color-only state communication. Light appearance is intentional; do not invent a dark theme. Components consume semantic variables.

## 3. Typography

Manrope Variable, self-hosted from the pinned font package, replaces scaffold Arial. Display/headings use weight 500 or 600, body 400, action/label 600. System monospace is used only for addresses and hashes.

Scale: 12, 14, 16, 18, 20, 24, 32, 40, 48, 64, 80 px. Hero fluid range 40–80 px; section heading 32–48 px. Body line height 1.6; heading 1.04–1.2. Tracking: display -0.05em, headings -0.025em, labels 0.08em. Emphasis stays in the same sans-serif family with forest-green color. Paragraphs max 65ch. Financial values use tabular numerals and never animate a number into a misleading interim value.

## 4. Spacing and layout

Base unit 4 px. Spacing scale 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80, 96. Page limiter 1200 px, outer padding 20 px small / 32 px wide. Sections 64–96 px. Navigation 80 px minimum, wraps rather than hiding critical links.

The document owns vertical scroll on all pages. Header stays in document flow; landing scene alone may pin for a bounded 1.25 viewport-height transition above 1024 px when motion is allowed. Offering detail uses a main column and 400 px transaction aside above 1024 px; below that the aside follows the overview and is not sticky. Dialogs alone may have bounded internal scrolling. Children have min-inline-size:0; long addresses wrap anywhere. Breakpoint QA: 375, 768, 1280 px. Grids use minmax(0,1fr); no horizontal body scrolling.

Education routes use the existing page-grid pattern: a two-column editorial hero with a short explanation and one factual protocol artifact, then full-width numbered sections below. The document owns scroll, and the hero becomes one column below 768 px. Navigation groups the five explanatory routes in the header; Explore, Portfolio, Marketplace, source, and GitBook remain reachable from the footer and demo CTA. Links wrap at small widths, stay in document order, and never become a hidden menu.

## 5. Primitives and states

Installed shadcn/Radix is the reusable source layer. Primitive showcase `/design-system` is development-only and precedes product-screen work.

| Primitive | Anatomy and required states |
| --- | --- |
| Button | Primary, secondary, outline, ghost, destructive; default/hover/focus/active/disabled/busy. Default and large touch targets at least 44 px. Busy includes text and aria-busy. |
| Field / Input | Label, control, optional description, error; empty/filled/focus/disabled/invalid. aria-invalid and describedby bind feedback. |
| Card | Header/title/description/content/footer; no nested ornamental card grids. |
| Badge | Plain text status; secondary, outline, error variants. |
| Alert | Title plus description, optional action; neutral/error/status. No secret values in messages. |
| Tabs | Tab list, triggers, associated panels; keyboard/active/focus states. |
| Dialog | Accessible title/description, close, focus trap and return, scroll when needed. Never auto-signs a transaction. |
| Empty | Clear absence, explanation, actionable recovery; distinct from RPC failure. |
| Skeleton | Reserves final content space; labeled loading region. |
| Separator | Decorative hierarchy; never substitutes for section semantics. |
| Select | Labeled trigger, content, group/items; selection/focus/disabled. |
| PageIntro | Eyebrow, one h1, bounded explanatory paragraph. |
| Stat | Label, exact/formatted value, optional unit; no invented live values. |
| TransactionStatus | Preparing/signing/pending/confirmed/reverted/rejected/unknown; persistent hash link, live region, retry only when safe. |
| WalletGate | Disconnected/loading/wrong network/connected; explicit wallet identity, no silent account substitution. |
| EducationHero | Eyebrow, one h1, one bounded introductory paragraph, primary/secondary links, and a factual visual panel; static across Investors, Founders, Token model, Auction, and Getting started. The panel has paper and forest variants, and holds real fixture or protocol terms, never invented live numbers. |
| DemoAuthSplit | Full viewport entry with an original SAMA artwork pane and a focused sign in pane. Ready/loading, email entry/code entry, OAuth pending/error, unavailable configuration, and authenticated transitions are explicit. No application controls are mounted before Privy reports an authenticated session. |
| DemoWorkspace | Document scrolling application shell with a stable identity rail, accessible Round/Portfolio/Marketplace tabs, account identity, and sign out. Narrow widths stack the rail above the content without hiding destinations. Each transaction view reuses the existing receipt aware panels. |

## 6. Motion and interaction

State changes use 160 ms opacity/color easing `cubic-bezier(0.16,1,0.3,1)`; overlays use 200 ms. GSAP/ScrollTrigger is limited to landing storytelling: 0.5 s scrub, campus translation/scale and field-note entrance, 24 px editorial reveals over 0.65 s. No scroll hijacking, infinite ambient animation, magnetic financial buttons, animated financial counters, blur-on-text, or automated scrolling. Scene state is reversible with scroll; animations are scoped and cleaned up on unmount. Interactive CTAs remain reachable; hidden transitional content must not trap keyboard focus. Reduced motion and widths below 1024 px show the complete unpinned narrative. Busy label remains stable-width where practical. Reduced motion disables transforms, pulse/spin, and transitions; status text still conveys progress. Pending is never styled as confirmed.

The demo entry uses one 260 ms opacity and 12 px translation only when the auth stage changes; it is never an ambient loop. Provider buttons use the existing 160 ms state feedback, keep stable width during pending work, and announce errors in a live region. Reduced motion shows every state immediately. Authentication does not imply a wallet transaction or an onchain eligibility decision.

## 7. Depth and surfaces

Paper cards: 1 px semantic border, 16 px radius, subtle `0 4px 20px rgb(16 46 39 / 4%)` shadow. Controls 8 px radius, badges pill. Dialogs 16 px radius with `0 16px 48px rgb(16 46 39 / 14%)` shadow and black 40% backdrop. Hero artwork is already lit and dimensional; its surround uses a restrained sage-to-ivory radial light. Dark feature surface uses forest-deep, not generic black. No glass over financial text.

## 8. Accessibility and open verification

Primary personas: a first-time wallet user on a narrow phone; a keyboard-only reviewer; a returning bidder restoring a backup on a different browser. Each must understand the testnet disclaimer, identify their wallet/network, preserve reveal material, and distinguish a confirmed transaction from an uncertain one.

Visible focus, skip navigation, semantic headings, labeled inputs, 44 px primary controls, text error messages, reduced-motion support, and a readable 200% zoom layout are required. Never put nonce material into analytics, server requests, screenshots, or logs. Development React inspection tools are local-only and disabled in production; disable them when real reveal material is present.

Open gates: primitive showcase at three widths; full keyboard/mobile lifecycle; independent visual review; static React audit; production browser performance/accessibility measurements. No accessibility or performance debt has been accepted, and these gates are not claimed passed by the presence of this document.

Education-page content addresses three readers: a first-time bidder, a founder assessing the mechanism, and a hackathon reviewer checking claims. Each page states one role-specific question, links to the next useful step, and puts release-state limits next to any demo action. Long tables reflow into labeled rows below 768 px so they do not create horizontal scrolling. Educational examples do not become simulated wallet transactions or false live state.

## 9. Demo entry and workspace contract

The owner supplied a two-pane sign in screenshot. It supplies the spatial grammar only: a contextual artwork pane beside a focused authentication form. SAMA keeps its own forest/ivory palette, Manrope, architectural artwork, and plain English. The [split-screen pattern](https://github.com/changeroa/StyleGallery/blob/main/patterns/split-sidebar/split-screen.md) supplies the responsive layout contract. The document, not either pane, owns vertical scroll; semantic form order stays the same when the artwork stacks above the form. At wide widths the artwork takes approximately two fifths of the viewport. At 375 px it becomes a compact introduction above a full width form. Every input and action remains visible at 200% zoom.

On public testnet the demo requires a configured public Privy App ID. Privy email and enabled social methods are authentication routes, while an external wallet remains available for wallet first users. The local Anvil acceptance mode retains its existing injected wallet path. Missing Privy configuration fails closed with a clear setup message rather than silently presenting a different testnet sign in. A Privy session is a presentation gate for the workspace, not server authorization or evidence of onchain eligibility. The workspace always identifies Arbitrum Sepolia or local Anvil, never displays illustrative balances as live account state, and does not replace receipt confirmation on transaction screens.

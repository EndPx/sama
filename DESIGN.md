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

| Semantic token                           | Value     | Role                                     |
| ---------------------------------------- | --------- | ---------------------------------------- |
| background                               | `#f6f4ed` | Warm page canvas, retained from scaffold |
| foreground                               | `#192d25` | Reading and headings                     |
| card / popover                           | `#fffdf8` | Raised paper surfaces, retained          |
| primary                                  | `#173f35` | Forest action and identity               |
| primary-foreground                       | `#fffdf8` | Text on forest                           |
| secondary / accent                       | `#e4eadf` | Sage selection and secondary surfaces    |
| secondary-foreground / accent-foreground | `#173f35` | Sage contrast                            |
| muted                                    | `#efeee6` | Recessed surface                         |
| muted-foreground                         | `#55655a` | Secondary readable text                  |
| border / input                           | `#cbd4c7` | Component edges                          |
| ring                                     | `#376854` | Keyboard focus                           |
| destructive                              | `#a32d27` | Error text and destructive action        |
| success                                  | `#236347` | Confirmed receipt, never pending         |
| warning                                  | `#825217` | Recoverable warning                      |
| forest-deep                              | `#102e27` | Dark editorial feature                   |
| sage-light                               | `#edf1e4` | Campus surround                          |
| white                                    | `#ffffff` | Highlight and white-on-destructive       |

No color-only state communication. Light appearance is intentional; do not invent a dark theme. Components consume semantic variables.

## 3. Typography

Manrope Variable, self-hosted from the pinned font package, replaces scaffold Arial. Display/headings use weight 500 or 600, body 400, action/label 600. System monospace is used only for addresses and hashes.

Scale: 12, 14, 16, 18, 20, 24, 32, 40, 48, 64, 80, 96 px, with 10, 11, and 13 px reserved for dense operational labels. Hero fluid range 40–80 px; the account allocation figure may reach 96 px. Section heading 32–48 px. Body line height 1.6; heading 1.04–1.2. Tracking: display -0.05em, headings -0.025em, labels 0.08em. Emphasis stays in the same sans-serif family with forest-green color. Paragraphs max 65ch. Financial values use tabular numerals and never animate a number into a misleading interim value.

## 4. Spacing and layout

Base unit 4 px. Spacing scale 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80, 96. Page limiter 1200 px, outer padding 20 px small / 32 px wide. Sections 64–96 px. Navigation 80 px minimum, wraps rather than hiding critical links.

The document owns vertical scroll on all pages. Header stays in document flow; landing scene alone may pin for a bounded 1.25 viewport-height transition above 1024 px when motion is allowed. Offering detail uses a main column and 400 px transaction aside above 1024 px; below that the aside follows the overview and is not sticky. Dialogs alone may have bounded internal scrolling. Children have min-inline-size:0; long addresses wrap anywhere. Breakpoint QA: 375, 768, 1280 px. Grids use minmax(0,1fr); no horizontal body scrolling.

Education routes use the existing page-grid pattern: a two-column editorial hero with a short explanation and one factual protocol artifact, then full-width numbered sections below. The document owns scroll, and the hero becomes one column below 768 px. Navigation groups the five explanatory routes in the header; Explore, Portfolio, Marketplace, source, and GitBook remain reachable from the footer and demo CTA. Links wrap at small widths, stay in document order, and never become a hidden menu.

## 5. Primitives and states

Installed shadcn/Radix is the reusable source layer. Primitive showcase `/design-system` is development-only and precedes product-screen work.

| Primitive          | Anatomy and required states                                                                                                                                                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button             | Primary, secondary, outline, ghost, destructive; default/hover/focus/active/disabled/busy. Default and large touch targets at least 44 px. Busy includes text and aria-busy.                                                                                                                                                                      |
| Field / Input      | Label, control, optional description, error; empty/filled/focus/disabled/invalid. aria-invalid and describedby bind feedback.                                                                                                                                                                                                                     |
| Card               | Header/title/description/content/footer; no nested ornamental card grids.                                                                                                                                                                                                                                                                         |
| Badge              | Plain text status; secondary, outline, error variants.                                                                                                                                                                                                                                                                                            |
| Alert              | Title plus description, optional action; neutral/error/status. No secret values in messages.                                                                                                                                                                                                                                                      |
| Tabs               | Tab list, triggers, associated panels; keyboard/active/focus states.                                                                                                                                                                                                                                                                              |
| Dialog             | Accessible title/description, close, focus trap and return, scroll when needed. Never auto-signs a transaction.                                                                                                                                                                                                                                   |
| Empty              | Clear absence, explanation, actionable recovery; distinct from RPC failure.                                                                                                                                                                                                                                                                       |
| Skeleton           | Reserves final content space; labeled loading region.                                                                                                                                                                                                                                                                                             |
| Separator          | Decorative hierarchy; never substitutes for section semantics.                                                                                                                                                                                                                                                                                    |
| Select             | Labeled trigger, content, group/items; selection/focus/disabled.                                                                                                                                                                                                                                                                                  |
| PageIntro          | Eyebrow, one h1, bounded explanatory paragraph.                                                                                                                                                                                                                                                                                                   |
| Stat               | Label, exact/formatted value, optional unit; no invented live values.                                                                                                                                                                                                                                                                             |
| TransactionStatus  | Preparing/signing/pending/confirmed/reverted/rejected/unknown; persistent hash link, live region, retry only when safe.                                                                                                                                                                                                                           |
| WalletGate         | Disconnected/loading/wrong network/connected; explicit wallet identity, no silent account substitution.                                                                                                                                                                                                                                           |
| EducationHero      | Eyebrow, one h1, one bounded introductory paragraph, primary/secondary links, and a factual visual panel; static across Investors, Founders, Token model, Auction, and Getting started. The panel has paper and forest variants, and holds real fixture or protocol terms, never invented live numbers.                                           |
| DemoWorkspace      | Direct entry mock preview with a stable navigation rail, Overview/Round/Portfolio/Marketplace views, persistent "Sample data" state, and a selectable sample account instead of a wallet identity. Tablet widths use a horizontal navigation strip; phone widths show all four views in a two-row grid. No transaction panel mounts in this mode. |
| AccountOverview    | Compact account heading; dominant demo-token allocation surface; separate refundable-amount and round-status surfaces; sample activity and market-watch panels. Values always derive from the selected fixture profile. Every panel has a direct route to the corresponding work view, not a product-explanation paragraph.                       |
| ReferenceRoundDesk | Interactive view of the five bid auction fixture, with a selected bid detail and exact accepted/refundable amounts. It is always labeled as a reference example, never as live demand or the visitor's account.                                                                                                                                   |
| SamplePortfolio    | Selectable example bidder profiles drawn from the locked five bid fixture. Deposit, accepted, refund, and demo token allocation remain mathematically linked; selection never changes a connected wallet or suggests a claim was executed.                                                                                                        |
| SampleMarketplace  | Selectable illustrative listings with a quantity field and deterministic quote preview. A preview cannot submit a transaction or mutate a listing. Amounts and remaining prices follow the marketplace rounding specification.                                                                                                                    |

## 6. Motion and interaction

State changes use 160 ms opacity/color easing `cubic-bezier(0.16,1,0.3,1)`; overlays use 200 ms. GSAP/ScrollTrigger is limited to landing storytelling: 0.5 s scrub, campus translation/scale and field-note entrance, 24 px editorial reveals over 0.65 s. No scroll hijacking, infinite ambient animation, magnetic financial buttons, animated financial counters, blur-on-text, or automated scrolling. Scene state is reversible with scroll; animations are scoped and cleaned up on unmount. Interactive CTAs remain reachable; hidden transitional content must not trap keyboard focus. Reduced motion and widths below 1024 px show the complete unpinned narrative. Busy label remains stable-width where practical. Reduced motion disables transforms, pulse/spin, and transitions; status text still conveys progress. Pending is never styled as confirmed.

The direct demo preview uses a single 260 ms content entrance. Navigation and bid selection use the existing 160 ms state feedback; the selected bid changes only after user input. Reduced motion shows every state immediately. Opening the preview does not imply authentication, a wallet connection, a transaction, or an onchain eligibility decision.

## 7. Depth and surfaces

Paper cards: 1 px semantic border, 16 px radius, subtle `0 4px 20px rgb(16 46 39 / 4%)` shadow. Controls 8 px radius, badges pill. Dialogs 16 px radius with `0 16px 48px rgb(16 46 39 / 14%)` shadow and black 40% backdrop. Hero artwork is already lit and dimensional; its surround uses a restrained sage-to-ivory radial light. Dark feature surface uses forest-deep, not generic black. No glass over financial text.

## 8. Accessibility and open verification

Primary personas: a first-time wallet user on a narrow phone; a keyboard-only reviewer; a returning bidder restoring a backup on a different browser. Each must understand the testnet disclaimer, identify their wallet/network, preserve reveal material, and distinguish a confirmed transaction from an uncertain one.

Visible focus, skip navigation, semantic headings, labeled inputs, 44 px primary controls, text error messages, reduced-motion support, and a readable 200% zoom layout are required. Never put nonce material into analytics, server requests, screenshots, or logs. Development React inspection tools are local-only, off by default, and disabled in production; do not opt into them when real reveal material is present. The Next.js development indicator is hidden so the local preview reflects the application rather than inspection chrome.

Open gates: primitive showcase at three widths; full keyboard/mobile lifecycle; independent visual review; static React audit; production browser performance/accessibility measurements. No accessibility or performance debt has been accepted, and these gates are not claimed passed by the presence of this document.

Education-page content addresses three readers: a first-time bidder, a founder assessing the mechanism, and a hackathon reviewer checking claims. Each page states one role-specific question, links to the next useful step, and puts release-state limits next to any demo action. Long tables reflow into labeled rows below 768 px so they do not create horizontal scrolling. Educational examples do not become simulated wallet transactions or false live state.

## 9. Demo preview and workspace contract

The owner has deferred login testing and requested direct entry to the application. For the current design iteration, `/demo` is a mock-only product preview without an authentication gate, wallet provider, chain reads, or transaction controls. This is a public educational surface, not an account session. The existing receipt-aware transaction panels remain separate from this route and are not represented by the mock screens. A configured deployment or public Privy App ID does not silently turn `/demo` into a live workspace.

The shell composes a navigation rail and one primary reading surface using the [panel layout](https://github.com/changeroa/StyleGallery/blob/main/patterns/viewport-shell/panel-layout.md) and [sticky aside](https://github.com/changeroa/StyleGallery/blob/main/patterns/split-sidebar/sticky-aside.md) contracts. The document owns vertical scroll. At 375 px all four navigation choices are visible in a two-row grid, and all detail panels follow their parent content in DOM order. A selected reference bid uses restrained state feedback informed by the [beui tabs source](https://beui.dev/r/tabs), without importing its animation dependency. Keyboard focus, selection text, and reduced motion remain functional without animation.

The marketplace listing cards use an intrinsic `auto-fit` grid with an overflow-safe 200 px minimum, so tablet width can hold three compact cards after the navigation rail reflows while narrower main panels naturally use two or one. The portfolio account switcher is a labeled native select, not a set of promotional cards. These controls remain adjacent to the data they change in DOM and focus order.

The overview is an account dashboard, not a second landing page: lead with the selected sample account's demo-token allocation and refundable amount, then round position, activity, and market watch. The round view is a settlement workspace, the portfolio is a position breakdown, and the marketplace is a listing/quote interface; product education stays in GitBook. All values derive from the locked five bid fixture from `docs/AUCTION_SPEC.md`, except separately illustrative marketplace listings. The persistent shell says "Sample data" and "Sample account", not a connected address; individual panels avoid repeating long disclaimers. No mock value is a wallet balance, verified transaction, claimable entitlement, or live listing. The quantity calculator returns a preview quote only and makes no purchase. Neither opening the app nor switching views constitutes login or onchain eligibility. Restoring live transactions to `/demo` requires a separate, explicit release decision and real receipt verification.

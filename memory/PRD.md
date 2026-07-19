# PRD — The Spotlight Awards Guidebook (The Blueprint)

## Original problem
Create a living guidebook for The Spotlight Awards that future co-chairs of The Blueprint (Spelman College) can update over time. Include past winners (year, category, theme), overviews of past themes (2025 "25 for 25", 2026 "Gamechangers"), planning timelines, an example nomination form, a scoring rubric template, and tracking templates. Blue brand palette with subtle jaguar accents. Public read, admin (JWT email/password) edit. Print/PDF export.

## Architecture
- **Backend**: FastAPI + Motor (MongoDB). JWT Bearer-token auth, admin seeded from `.env`. Auto-seeds all content on startup.
- **Frontend**: React 19 + React Router 7 + Shadcn UI + Tailwind. Cormorant Garamond + Outfit. Royal Blue `#114488`, Jaguar Gold `#C5A059`. SWR for data.
- **DB collections**: `users`, `winners`, `themes`, `timelines`, `nomination`, `rubric`, `tracking`.

## Personas
- **Public reader** — students, faculty, alumnae browsing history & templates.
- **Co-chair (admin)** — edits every section of the guidebook year over year.

## Implemented (Feb 2026 — v1)
- Public pages: Home, Past Winners (search + year/category filter), Themes (tabs + FAQ), Timelines (year tabs + editorial timeline), Nomination (sectioned example questions), Rubric (criteria table w/ totals), Tracking (Selection & Article Production tables).
- JWT admin login (Bearer token, 12h expiry). Admin panel with CRUD tabs for winners, themes, timelines, nomination, rubric.
- Seeded with real 2025 (26 winners) and 2026 (18 winners) data + full timelines, FAQs, rubric criteria, nomination questions, sample tracking rows.
- Print/PDF-friendly view via browser print (navigation hidden with `.no-print`).

## Implemented (v2 — same day)
- **Rebrand**: "The Spelman Blueprint Spotlight Award Guidebook" with paw-print logo in nav.
- **Home**: added Blueprint-style mission quote at the top (design inspired by thespelmanblueprint.framer.website).
- **Themes**: descriptions now include "intentional themes" + "18 for 1881" rationale (cohort size 18 going forward). Per-year photo gallery on each theme tab.
- **Rubric**: reset to 1–5 per criterion (5 criteria total = max 25).
- **Tracking**: seeded all outcomes — Accepted, Waitlist, Rejected, Disqualified, plus blank Jane Doe template. Article Production seeded with N/A cases + Jane Doe. Added Interview Recording Policy note (Zoom / voice memo).
- **Nomination**: new Nominator Information section with anonymity choice + optional classification/major. Added a "social handles / links" question in About the Nominee.
- **Contacts** page: founder card (Kelsie Tillage) + Co-Chairs by year grid, editable via admin.
- **Admin panel**: new Photos and Contacts tabs with add / edit / delete.
- Backend seed_version bump (v3) auto-migrates existing DBs on startup.

## Backlog (P1)
- Admin CRUD for the Tracking board (currently read-only in public view; add UI similar to other tabs).
- Cover image / hero customization per year.
- CSV export for winners & tracking.

## Backlog (P2)
- Nominator-facing live nomination form (submits directly into DB).
- Selection committee scoring UI with per-nominee tallies + peer review.
- Password reset flow for co-chairs.
- Multi-user roles (co-chair vs. selection committee).

## Credentials
See `/app/memory/test_credentials.md`.

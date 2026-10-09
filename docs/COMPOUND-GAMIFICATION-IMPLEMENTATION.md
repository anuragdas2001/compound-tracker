# Compound — Gamification Navbar & Economy Implementation Guide

**Purpose:** Implementation-ready specification for coding agents working on Compound's navbar/player status bar and connected gamification systems.

**Product principle:** *Keep compounding.* Reward consistent effort without making users feel punished for an occasional missed day.

**Status:** Product proposal / implementation plan. Items described as proposed are not assumed to exist yet. Agents must inspect the current repository before changing architecture or duplicating features.

## 1. Existing Product Context

Compound is a habit tracker with a dark, grid-based interface and bright green accents. The current UI includes:

- Sidebar: Dashboard, Habits, Analytics, Achievements, Challenges, Leaderboard, Profile, Settings, Pricing.
- Dashboard: current streak, today's habits, completion statistics, weekly progress, and a current goal.
- Habits page: “Your Chain,” Today / Insights / Store / Settings tabs, global status cards, and a Momentum Board/calendar view.
- A visible Sparks balance near “New Habit” (example in the screenshot: `150 Sparks`).
- A profile/avatar control in the upper-right corner.

Treat the repository and screenshots as the source of truth. Do not replace the existing layout wholesale.

## 2. Goals and Non-goals

### Goals
1. Make player progress and rewards visible from the top bar.
2. Give Sparks a clear purpose as the in-app currency.
3. Separate progression (XP and levels) from spendable currency (Sparks).
4. Make power-ups, especially Streak Shields, easy to inspect and use.
5. Reuse existing pages and components.
6. Implement incrementally with server-side validation and tests.

### Non-goals for the first pass
- Do not build a full social network.
- Do not add payment processing.
- Do not make “Compound Score” the primary ranking metric until its formula is designed.
- Do not grant rewards using client-side-only calculations.
- Do not allow users to purchase infinite streak protection or silently rewrite historical completions.

## 3. Recommended Navbar

### Desktop
`⚡ 150 Sparks   🛡 2 Shields   LVL 12   🏆 #24   🔔   Avatar`

Recommended order:
1. **Sparks balance** — click opens the existing Store.
2. **Streak Shields** — click opens a popover/sheet with inventory and eligibility.
3. **Level / XP** — click opens progression details or Profile.
4. **Leaderboard rank** — show only when valid ranking data exists.
5. **Notifications** — unread indicator and panel.
6. **Avatar** — profile menu.

The current streak already has a large dashboard card. Do not add another large streak display to the navbar in the first pass.

### Responsive behavior
- Desktop: show labels and counts where space allows.
- Tablet: compact icons with accessible labels/tooltips.
- Mobile: move secondary items into a compact menu/panel rather than squeezing everything into one row.
- Preserve the existing sidebar and page layout.
- Icon-only controls must have accessible names, keyboard focus, and tooltips or equivalent labels.

### Visual direction
- Preserve the dark background, subtle grid, card borders, and green accent.
- Sparks may use a warm gold accent to distinguish currency from progress green.
- Avoid excessive glow effects and competing badges.
- Reuse the UI primitives and icon library already installed.

## 4. Navbar Components and Behavior

### 4.1 Sparks balance
**Display:** `⚡ 150`

Purpose: spendable in-app currency.

On click:
- Navigate to the existing Store tab/page or open its current UI.
- Show balance, items, prices, and purchase confirmation.
- Reuse the Store UI if it already exists; do not create a duplicate route without checking.

States:
- Loading: skeleton/placeholder, not a fake balance.
- Loaded: server-derived balance.
- Error: unavailable state and retry.
- Insufficient balance: explain the shortfall and reject the purchase.

### 4.2 Streak Shields
**Display:** `🛡 2`

On click, show:
- Available quantity.
- What a shield does.
- Eligible missed day/habit, where applicable.
- “Use Shield” only when an eligible use exists.
- Confirmation before consumption.

Suggested description:
> Protect an eligible streak from one missed scheduled day.

**Product decision required:** define whether shields are applied automatically or manually, the recovery window, whether protection is per habit or account-wide, and what happens when multiple habits are missed. Recommended starting point: manual activation for an eligible missed scheduled day within a defined recovery window, validated by the server.

A shield must not mark a habit as completed. It only affects streak continuity according to the agreed rule.

### 4.3 Level / XP
**Display:** `LVL 12`, optionally with a small progress indicator.

On click, show:
- Current level.
- Current XP.
- XP required for the next level.
- Recent XP events.

Illustrative example only:
- Level 12
- 2,450 / 3,000 XP
- 550 XP to Level 13

Do not hardcode example values. Define one server-owned level formula and test it; do not duplicate formulas in frontend and backend.

### 4.4 Leaderboard rank
**Display:** `#24` only when rank data exists and its scope is clear.

On click, navigate to `/leaderboard`. Show rank movement only if historical comparison data exists. Make the scope explicit (e.g. weekly global rank). If unavailable or opted out, hide the rank or show an explicit unavailable state. Never fabricate rankings.

### 4.5 Notifications
**Display:** bell icon and unread indicator/count.

Potential events:
- Achievement unlocked.
- Challenge completed.
- Sparks earned.
- Level increased.
- Streak at risk, if reminders are enabled.
- Leaderboard position changed, if supported.

Requirements:
- Persist read/unread state.
- Avoid duplicate notifications for the same event.
- Respect notification preferences.
- Only notify on verifiable events.

### 4.6 Avatar menu
Reuse the existing avatar control. Menu can include Profile, Achievements, Settings, and Log out. Avoid unnecessary duplication of sidebar links.

## 5. Gamification Economy

| Concept | Meaning | Earn / use |
|---|---|---|
| **XP** | Long-term progression | Earn from eligible activity; not spent |
| **Level** | Derived from XP | Increases according to the shared formula |
| **Sparks** | Spendable currency | Earn and spend on store items |
| **Power-ups** | Consumable inventory | Earn or buy with Sparks; consume under defined rules |
| **Achievements** | Milestone recognition | Unlock once when criteria are met |
| **Challenges** | Time-bound goals | Complete for specified rewards |
| **Leaderboard rank** | Position within a defined group/period | Derived from eligible ranking data |

### Reward integrity
- Award XP and Sparks on the server only.
- Make reward processing idempotent: retrying the same completion must not grant rewards twice.
- Record currency changes in a ledger/event history, not only as a mutable balance.
- Validate ownership, eligibility, inventory, and balance on the server.
- Never trust client-submitted XP, Sparks, level, rank, or shield counts.
- Record reason, amount, timestamp, and related event for each reward/transaction.

Potential reward sources (proposed): habit completion, streak milestones, achievement unlocks, challenge completion, and daily rewards if later implemented. Keep reward amounts and anti-farming rules in one configuration/service.

## 6. Power-ups

### Initial power-up: Streak Shield
User-facing promise: protect one eligible streak from one missed scheduled day.

Decide before implementation:
- Is a shield per habit or account-wide?
- What is the recovery window?
- Is activation manual or automatic?
- What happens if multiple habits are missed on the same day?
- Can a shield be used retroactively?
- Does shield use affect completion rate or only streak continuity?
- How are timezone and day boundaries handled?

Recommended initial rules:
1. A shield does not count as a habit completion.
2. It preserves streak continuity only for a missed scheduled day that meets the recovery rule.
3. The same missed day cannot consume multiple shields.
4. The server checks inventory, schedule, timezone, eligibility, and duplicate use.
5. The UI explains the effect before confirmation.
6. Shield use is recorded in an auditable event/ledger.
7. The streak calculation service is the single source of truth.

Later power-ups (not part of the first delivery unless requested):
- **Double XP:** temporary multiplier with defined duration and eligible actions.
- **XP Boost:** bounded bonus for eligible activity.
- **Streak Recovery:** restore a recently broken streak under explicit rules.
- **Cosmetics:** themes, icons, profile decoration that do not affect habit records.

Do not ship several overlapping streak-protection items before Streak Shield rules are stable.

## 7. Proposed Data Model

Inspect the existing Prisma schema and services first. Adapt these concepts to existing names and MongoDB/Prisma constraints. Do not blindly paste schema or create duplicate models.

### UserGamification
- `userId` (unique)
- `totalXp`
- `level` (or derive from XP)
- `sparksBalance` (optional cached balance if ledger is maintained)
- timestamps

### GamificationLedger
- `id`
- `userId`
- `type` (XP_EARNED, SPARKS_EARNED, SPARKS_SPENT, SHIELD_CONSUMED, ADJUSTMENT)
- `amount`
- `sourceType`
- `sourceId` / idempotency key
- `metadata`
- `createdAt`

### PowerUpInventory
- `userId`
- `powerUpType`
- `quantity`
- timestamps

### PowerUpUsage
- `userId`
- `powerUpType`
- `relatedHabitId` when applicable
- `missedDate` / scheduled date
- `idempotencyKey`
- `createdAt`

### Notification
- `userId`
- `type`
- `title`
- `body`
- `readAt`
- `deduplicationKey`
- `createdAt`

Data-model notes:
- Enforce uniqueness where needed for idempotency and duplicate prevention.
- Define timezone semantics and store dates consistently.
- Add only models needed for the agreed phase.
- Confirm transaction/atomicity support for the current database before purchases/rewards.
- Use a supported transaction or safe idempotent workflow for multi-write operations.

## 8. API / Service Responsibilities

Use existing API conventions and authentication guards. Route names below are examples; align with the repository.

- `GET /gamification/summary` — XP, level, Sparks, shield inventory.
- `GET /gamification/ledger` — paginated reward/transaction history.
- `GET /leaderboard/me` — current rank and scope, if implemented.
- `GET /notifications` — paginated notifications.
- `PATCH /notifications/:id/read` — mark one as read.
- `POST /power-ups/streak-shield/use` — use shield on an eligible missed day.
- `GET /store/items` — available items and costs.
- `POST /store/purchase` — purchase a supported item using Sparks.

Security and correctness:
- Derive user identity from the authenticated session/token, not request body.
- Validate request DTOs.
- Check balance and inventory server-side.
- Prevent double-spend and duplicate shield use.
- Return explicit domain errors (insufficient Sparks, no shield available, not eligible, already protected).
- Add rate limiting where relevant.
- Never expose another user's private gamification data.

Do not implement endpoints for features outside the selected phase.

## 9. Frontend Architecture Guidance

The project has been discussed as a Turborepo monorepo with Next.js web app, NestJS API, and shared UI/database/services/query/types packages. Previously discussed technologies include TypeScript, Tailwind CSS, Shadcn UI, Lucide icons, NestJS, Prisma, MongoDB, React Query, and Recoil. **Verify actual packages, versions, and code patterns before coding.**

Suggested component boundaries (adapt to current conventions):

```text
PlayerStatusBar
├── SparksBalance
├── StreakShieldInventory
├── LevelProgress
├── LeaderboardRank
├── NotificationsMenu
└── ProfileMenu
```

Possible hooks/services:
- `useGamificationSummary()`
- `useNotifications()`
- `useUseStreakShield()`
- `usePurchaseStoreItem()`

Use the existing shared API service and React Query patterns if present. Invalidate/refetch relevant queries after successful mutations. Avoid duplicate sources of truth in local and global state.

Implement loading, loaded, empty/unavailable, error, mutation-pending, success, and failure states. Ensure keyboard navigation, visible focus styles, and mobile-friendly popovers/dialogs.

## 10. Routes and Navigation

The sidebar already includes Dashboard, Habits, Analytics, Achievements, Challenges, Leaderboard, Profile, Settings, and Pricing.

- Reuse `/leaderboard`, `/profile`, `/achievements`, `/settings`, and existing Store UI.
- Do not create pages solely for Sparks, Shields, XP, or notifications; compact summaries belong in popovers/sheets.
- Check the App Router tree before creating files.

## 11. Phased Implementation Plan

### Phase 0 — Repository reconnaissance (no edits)
1. Inspect monorepo structure and current branch.
2. Locate the existing layout/sidebar/top navbar/avatar.
3. Find Sparks and Store implementation.
4. Inspect authentication/session handling.
5. Inspect Prisma schema and user/habit/completion models.
6. Inspect API conventions, DTO validation, React Query keys, and error handling.
7. Report existing functionality, missing functionality, and a minimal plan.
8. Do not modify files.

**Deliverable:** concise audit with exact file paths and proposed changes.

### Phase 1 — Navbar UI using existing data
1. Extend the current top-right area without changing the page layout.
2. Show Sparks using the existing source if available.
3. Add Shield count only if real inventory data exists.
4. Add level/XP only if real data exists.
5. Wire Store, Profile, and Leaderboard to existing destinations.
6. Add responsive behavior, accessible labels, loading states, and tests.

**Deliverable:** functional navbar using existing backend capabilities, with no invented balances.

### Phase 2 — Gamification summary service
1. Add a server-owned summary endpoint only for missing data.
2. Add the minimum required schema/model changes.
3. Add validation, authorization, and tests.
4. Integrate with the frontend using existing data-fetching patterns.

**Deliverable:** real XP, level, Sparks, and inventory data where supported.

### Phase 3 — Sparks ledger and rewards
1. Agree on reward values and eligible events.
2. Implement idempotent server-side reward processing.
3. Implement ledger records.
4. Prevent duplicate rewards on retries.
5. Test calculations and duplicate requests.

**Deliverable:** trustworthy balances and reward history.

### Phase 4 — Streak Shield
1. Finalize all shield rules in Section 6.
2. Implement server-side eligibility and consumption.
3. Update the single streak-calculation source of truth.
4. Build shield panel and confirmation flow.
5. Test timezone boundaries, missed schedules, retries, insufficient inventory, and duplicate use.

**Deliverable:** safe, auditable shield behavior.

### Phase 5 — Store, notifications, and leaderboard indicator
Implement only when the required data sources exist:
- Store purchase flow.
- Notification persistence and read state.
- Leaderboard rank summary.
- Empty/unavailable states and privacy controls.

**Deliverable:** connected navbar interactions backed by real data.

## 12. Testing Checklist

### Navbar
- Correct data appears for the authenticated user.
- Loading/error states do not show fabricated numbers.
- Shortcuts navigate to correct existing destinations.
- Popovers are keyboard accessible.
- Layout works at narrow widths.

### XP and currency
- Client cannot submit reward amounts.
- Duplicate completion requests do not grant duplicate rewards.
- Purchases cannot make balance negative.
- Concurrent purchases cannot overspend.
- Ledger and displayed balance remain consistent.

### Streak Shield
- Cannot use without inventory.
- Cannot use on an ineligible day.
- Same missed day cannot consume multiple shields.
- Shield does not create a completion record.
- Timezone and schedule boundaries are tested.
- Streak calculation is consistent after use.

### Notifications and rank
- Unread count matches unread notifications.
- Read state persists.
- Duplicate events do not create duplicate notifications.
- Rank is not shown without a valid scope and result.
- Private user data is not exposed.

## 13. Acceptance Criteria

- [ ] Existing Compound layout is preserved.
- [ ] Status bar is responsive and accessible.
- [ ] Sparks uses a real backend balance or is omitted until available.
- [ ] Every visible control has a working, clearly defined action.
- [ ] Existing Store/Profile routes and components are reused.
- [ ] No XP, Sparks, shield quantity, rank, or notification count is fabricated.
- [ ] Server-owned data is protected by authentication and authorization.
- [ ] Loading, empty, error, and pending states are implemented.
- [ ] Tests cover key interactions and failure cases.
- [ ] No unrelated features or broad refactors are included.

## 14. Master Prompt for a Coding Agent

Copy this prompt into your coding agent after opening the Compound repository:

> You are working on Compound, an existing habit tracker in a Turborepo monorepo. Implement the navbar/player status bar described in `COMPOUND-GAMIFICATION-IMPLEMENTATION.md`.
>
> **First, perform repository reconnaissance only. Do not edit files yet.** Inspect the Next.js App Router structure, existing sidebar and top navbar, Sparks/Store implementation, authentication, NestJS API conventions, Prisma schema, shared service layer, and React Query patterns. Return a report with exact file paths, existing functionality, missing functionality, and a minimal implementation plan.
>
> Preserve the existing dark UI, green accent, grid background, sidebar, and page structure. Reuse existing components and packages. Do not create duplicate routes, models, API clients, or state-management systems.
>
> Implement in small, reviewable phases. Start with the navbar UI and real existing data. Never fabricate balances, XP, shield counts, ranks, or notification counts. If backend support is missing, identify the gap and propose the smallest required API/schema change before implementing it.
>
> All rewards, currency changes, purchases, and shield consumption must be validated server-side and protected against duplicate requests. Follow the security, accessibility, testing, and acceptance criteria in this document. Do not implement unrelated roadmap features.
>
> After each phase, report files changed, behavior implemented, tests run and results, remaining decisions, and any migrations required. Stop and ask for product decisions wherever Streak Shield rules or reward values are unspecified.

## 15. Product Decisions Still Required

- [ ] XP rewards for each activity.
- [ ] Level progression formula.
- [ ] Sparks rewards and store prices.
- [ ] Whether shields are per habit or account-wide.
- [ ] Shield recovery window and activation method.
- [ ] Whether shields affect streaks only or other statistics.
- [ ] Ranking scope and reset periods.
- [ ] Notification types enabled by default.
- [ ] Which features, if any, are paid-plan exclusive.

**Recommendation:** Start with Phase 0 and Phase 1. Get the existing navbar working with real data first, then build the economy and power-up rules as separate, testable backend features.

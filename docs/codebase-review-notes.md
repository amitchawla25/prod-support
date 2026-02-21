# Codebase Review Notes

## What this application appears to be
- A two-sided marketplace/workflow app connecting **clients** with **developers** for short-form technical help requests ("tickets" / "gigs").
- Clients can create and track help requests; developers can browse/recommend/apply; both sides can manage ticket lifecycle and communication.
- Authentication, user profiles, matching, and ticket history are backed by Supabase.
- There is a developer verification/payment path using Stripe via Supabase edge functions.

## Signals that the app is far along
- Rich route map for multiple user journeys (marketing, auth, onboarding, dashboards, ticket/application details).
- Separate client/developer dashboards and onboarding flows.
- Detailed status-transition logic for help request lifecycle.
- Realtime-oriented data access layers and dedicated Supabase integration modules.
- Existing edge functions for payment verification and SQL migrations/policies.

## Areas that look like likely blockers
- Multiple duplicated hook files (e.g., `.ts` and `.tsx` variants for the same hook names), which can cause confusion and accidental imports.
- Some naming drift in route redirects (`/developer-dashboard` legacy paths vs current `/developer/dashboard`) that could create edge-case navigation bugs.
- Very broad and optional `HelpRequest` typing can hide data quality issues until runtime.
- No obvious test script in `package.json` despite having test files and Jest dependency.
- Heavy defensive logging/recovery code suggests there may have been auth/session instability in real usage.

## High-value clarifying questions for next step
1. What exact workflow is currently blocking you: auth, onboarding, posting help requests, developer applications, status changes, or messaging?
2. Is the blocker a **frontend UX bug**, a **Supabase data/permission issue**, or a **state management/routing issue**?
3. Do you already have a reproducible sequence (starting URL + account type + actions) that fails every time?
4. Which environment are you testing in (local dev, Lovable preview, production), and does it fail in all environments?
5. Are you using real Supabase project credentials with the latest migrations applied, or a partially-seeded environment?
6. Should the first priority be stability (fixing blockers quickly) or cleanup/refactor (reducing duplicated hooks and structural debt)?

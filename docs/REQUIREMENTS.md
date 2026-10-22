# Course requirements and product plan
Source: https://github.com/mrinal1224/social_media_B/blob/main/END_TERM_PROJECT_GUIDELINES.md (reviewed 22 October 2026).
Deadline: 27 October 2026, 23:59 IST. AI tools are explicitly allowed. The project is original; the classroom social application is a learning reference, not a copied base.

## Five workflows
1. Register, sign in, and restore a private session.
2. Discover resources with category/search filters and inspect hourly availability.
3. Reserve a future slot with capacity checks and race-safe double-booking prevention.
4. Cancel or join a FIFO waitlist; release atomically promotes the next request and creates a notification.
5. Manager reviews requests with reasons, adds resources, and pauses new bookings.

## Scope decisions
React + Express + MongoDB. One campus timezone (Asia/Kolkata). One-hour slots, 08:00–20:00, up to 14 days ahead. Pending requests hold their slot. No payments or external AI. Rooms are reserved exclusively, not seat-by-seat. Pausing resources blocks new requests and promotions; existing bookings remain valid. A declined/cancelled request releases the slot. No fabricated development history.

## Submission artifacts
Source with real incremental commits, README, architecture and API notes, tests, deployment configuration, accessible deployment, demo video, official form. Track actual readiness in SUBMISSION.md; local readiness is not deployment readiness.

# 3–5 minute demo walkthrough

Use two student accounts and one private manager account. Pick future slots before recording. Do not display passwords, `.env`, hosting secrets, or the database URI.

**0:00–0:30 — Problem.** “CampusSlot helps students reserve shared rooms and equipment without message chains and conflicting plans. It serves students and campus resource managers.”

**0:30–1:20 — Discover and book.** Show category filtering, search, resource details, capacity, and IST availability. Book a one-hour study room slot. Open My bookings and reload to demonstrate persistence.

**1:20–2:20 — Fair waitlists.** In the second student account, open the same occupied slot and join its waitlist. Cancel as the first student. Return to the second account and open My bookings/Updates to show promotion.

**2:20–3:20 — Approval.** Request the Podcast Corner or camera kit. Sign in as manager, approve with an access note. Return to the student account and show the note and confirmation. Explain that students cannot approve their own requests.

**3:20–4:10 — Engineering.** Briefly explain one-hour slots, unique indexes, transactions, password hashes, server sessions, and backend authorization. Show the test result, not a long code reading.

**4:10–4:30 — Limits and close.** Explain the current one-campus scope and planned email notifications/password reset. Show the public app and repository links.

## Be ready to explain
- Why client-only validation cannot prevent simultaneous bookings.
- How a partial unique index differs from a normal unique index.
- Why cancellation and waitlist promotion belong in a transaction.
- Why UI route guards do not secure an API.
- Why HttpOnly cookies and hashed server tokens are used.
- Why dates are stored in UTC but rendered in IST.
- Which improvements would matter for a real campus deployment.

Record your own narration after studying the workflow. Upload the video with evaluator-accessible permissions and add its link to the submission form.

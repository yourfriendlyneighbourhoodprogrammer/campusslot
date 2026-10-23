# Submission readiness
Deadline: **27 October 2026, 11:59 PM IST**.
Official form: https://forms.gle/sBy4sfqyiRG2Zpom9

- [x] Original MERN application and five connected workflows.
- [x] Seven MongoDB integration test groups and production build passed.
- [x] Public GitHub repository, real development history, setup/architecture/API documentation.
- [x] Public deployment with a dedicated, database-scoped Atlas account.
- [x] Public API verification: authentication, ownership, booking conflicts, FIFO promotion, cancellation, manager approval, notifications and persistence.
- [x] Live browser verification: student request → manager approval → reload restores session and confirmed reservation count.
- [x] Repository URL, live URL and project explanation entered in the submission form.
- [ ] Student records and publishes the required 3–5 minute demo video.
- [ ] Student enters full name, SST email and batch, reviews all links, and submits the form.

## Submission links
- GitHub: https://github.com/yourfriendlyneighbourhoodprogrammer/campusslot
- Live application: https://campusslot-phi.vercel.app
- Demo script: [DEMO.md](DEMO.md)

## Problem statement and technologies
CampusSlot helps students reserve shared campus rooms and equipment without conflicting reservations or message chains. It provides resource discovery, hourly availability, immediate or approval-based bookings, FIFO waitlists, cancellations, and private status updates. Managers review requests and maintain the resource catalog. The MERN stack uses MongoDB/Mongoose, Express, React and Node.js, with Vite and Zod. Server authorization, session cookies, password hashing, transactions and unique indexes protect the workflows.

## Final student steps
1. Record the 3–5 minute walkthrough in DEMO.md with your own narration. Show login, booking, waitlist promotion and manager approval. Do not show credentials.
2. Publish the video with evaluator-accessible permissions. Add its link to the README/demo document; because the current form has no dedicated video field, also append it to the project explanation.
3. Enter your full name, SST email and batch in the prepared form. Confirm all links open, then submit. The form has not been submitted on your behalf.
4. Keep the deployed app available for evaluation. The approved temporary Atlas network rule expires **30 October 2026 at 16:22 IST**. Replace or renew it deliberately if evaluation continues afterward.

## Evaluation access
Anyone can register a student account. Manager access is private. The owner has a local credential file at `.data/evaluation-accounts.json` (ignored by Git and excluded from deployment/archive). Share manager access only through the instructor's private channel if required; never commit passwords.

## Publication status — 24 October 2026
The public repository and Vercel production deployment are available. Atlas access uses the dedicated campusslot_user account, scoped to campusslot. Connection secrets are stored server-side. Public API and browser checks passed; details are in VERIFICATION.md. An example browser-created approval remains in the private demonstration account for the walkthrough. The required video and final form submission remain student actions.

# Submission readiness
Deadline: **27 October 2026, 11:59 PM IST**.
Official form: https://forms.gle/sBy4sfqyiRG2Zpom9

- [x] Original MERN application implemented.
- [x] Five connected workflows and server-side authorization.
- [x] Real MongoDB integration tests pass (seven test groups).
- [x] Production frontend build passes.
- [x] Browser verification: login → availability → reserve → persisted booking → inbox.
- [x] Incremental Git commits and setup/architecture/API/demo documentation.
- [x] Public GitHub repository with development history.
- [ ] Atlas connectivity and public deployment verification.
- [ ] Manager approval flow checked on public deployment.
- [ ] Student demo video recorded and accessible.
- [ ] Final submission form completed.

## Form details
Project Name: CampusSlot
Student Name: Shounak (confirm full name and roll number in the form)
Problem Statement: Students need reliable access to shared campus rooms and equipment without conflicting reservations or manual coordination.
GitHub Repository: https://github.com/yourfriendlyneighbourhoodprogrammer/campusslot
Deployed Application: https://campusslot-phi.vercel.app — deployment built successfully; Atlas access and end-to-end verification are still pending.
Demo Video: Record using docs/DEMO.md and insert the published link
Tech Stack: MongoDB, Express, React, Node.js, Vite, Zod
Major Features: Authentication; resource search/availability; conflict-safe reservations; FIFO waitlists; manager approvals and notifications.

Local completion is not final submission. The form and accessible demo video are required by the course guidelines.

## Publication status (23 October 2026)
The public GitHub repository contains the development history and its CI checks passed. Vercel production deployment is created, with the Atlas URI stored as a server-side secret and APP_ORIGIN configured. The owner approved and saved read/write access to campusslot and a temporary 0.0.0.0/0 network rule, expiring 30 October 2026 at 16:22 IST. Database authentication still fails with the saved password. The owner must supply the correct password privately before public database functionality can be verified. Do not treat a successful deployment build as a completed submission.

The repository URL and project explanation have been entered in the submission form. The student will enter their own personal details and submit after deployment verification and recording the required demo video.

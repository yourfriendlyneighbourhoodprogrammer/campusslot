# Verification record — 23 October 2026

`npm test`: seven test groups passed against a real MongoDB replica set.
`npm run build`: Vite production build passed.
`npm install`: initial dependency audit reported zero vulnerabilities.

Browser, local sandbox:
- Student sign-in succeeded.
- Resource catalog loaded from the API.
- Tomorrow shortcut refreshed available slots.
- Reserved Collaboration Studio for three people.
- My bookings displayed the confirmation, date, group size and purpose.
- Unread notification count increased.
- Desktop and narrow-screen layouts inspected.

Manager approval in the browser also passed: a pending Podcast Corner request was approved with a pickup note.

Public deployment was created on 23 October at https://campusslot-phi.vercel.app and the frontend is accessible without Vercel login. Atlas network access and read/write permission for campusslot were approved and saved. The saved database password is rejected by Atlas (authentication failure); public API verification is pending correction. Do not represent local test results as proof of a working public deployment.

Final persistence check (23 October): after a graceful server/database restart, the same student session and approved booking with manager note were restored in the browser.

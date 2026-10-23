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

## Public deployment
Production URL: https://campusslot-phi.vercel.app
Dedicated Atlas authentication succeeded. The application is accessible without a Vercel login.

Public API checks passed on 23 October 2026:
- Health and six seeded resources.
- Student and manager login with Secure, HttpOnly, SameSite cookies.
- Registration, session restoration and logout.
- Manager-only authorization, ownership and cross-origin mutation rejection.
- Conflicting booking rejection, FIFO waitlist promotion, cancellation and persisted notifications.
- Manager approval and persisted student access notes.

Test reservations were cancelled through the app, retaining their history. No real campus resources or bookings are represented.

The runtime log scan on 24 October found two dependency deprecation warnings about url.parse(), but no application failure messages in the scanned 15-minute window. No external monitoring or log drain is configured.

Final persistence check (23 October): after a graceful server/database restart, the same student session and approved booking with manager note were restored in the browser.


Browser verification on the public deployment, 24 October:
- Student signed in and requested Podcast Corner for a future slot.
- Manager signed in, reviewed the request and approved it with a room-key note.
- Reload restored the manager session; the workspace showed zero pending requests and one confirmed reservation.
- Signed out and verified the public catalog remained accessible.
- Screenshots: screenshots/public-live.png and screenshots/public-manager-verified.png.

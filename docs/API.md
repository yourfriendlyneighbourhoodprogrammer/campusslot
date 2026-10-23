# API reference
All routes are prefixed with `/api`. Request bodies use JSON. Errors use `{ "error": "message" }` with 400/401/403/404/409/500/503 as appropriate.

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | /health | public | Database connectivity |
| POST | /auth/register | public | name, email, password; creates student |
| POST | /auth/login | public | email, password; creates session |
| GET | /auth/me | signed in | Current user |
| POST | /auth/logout | signed in | Revoke current session |
| GET | /resources?q=&category= | public | Search/filter catalog |
| GET | /resources/:id/slots?date=YYYY-MM-DD | public | Hourly availability; no private booking content |
| GET | /bookings | signed in | Own booking history |
| POST | /bookings | signed in | resource, date, hour, purpose, attendees, waitlist |
| POST | /bookings/:id/cancel | owner | Cancel and promote queue |
| GET | /notifications | signed in | Own latest notifications |
| POST | /notifications/read | signed in | Mark own notifications read |
| GET | /manage | manager | Resources and recent bookings |
| POST | /manage/resources | manager | Create resource |
| PATCH | /manage/resources/:id | manager | Set active boolean |
| POST | /manage/bookings/:id/approve | manager | Confirm pending request; optional note |
| POST | /manage/bookings/:id/reject | manager | Reject pending request; required note |

A waitlist request reserves directly when the slot has become free. Repeated create/cancel/review operations return conflict instead of silently duplicating state. Slot availability is advisory: the server checks it again at reservation time.

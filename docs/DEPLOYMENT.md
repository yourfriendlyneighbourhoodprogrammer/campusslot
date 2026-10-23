# Deployment

## Current deployment
- Production: https://campusslot-phi.vercel.app
- Source: https://github.com/yourfriendlyneighbourhoodprogrammer/campusslot
- Dedicated Atlas account: `campusslot_user`, read/write only on `campusslot`, restricted to the existing cluster.
- Database URI is stored as a Vercel production Secret; it is absent from Git.
- Public API workflows passed on 23 October; browser verification continued on 24 October.
- The owner-approved temporary network access rule expires **30 October 2026, 16:22 IST**. Replace it with restricted hosting egress or renew deliberately before evaluation after that time.


## Vercel + MongoDB Atlas
1. Provision an Atlas database user authorized for the `campusslot` database. The app uses transactions, supported by Atlas replica sets.
2. Configure Atlas Network Access for the hosting network. Do not disable TLS. Static egress/private networking is preferable for long-term use; discuss network access requirements with the host before broadening it.
3. Import this repository into Vercel. Framework preset: Other. Build command: `npm run build`. Output: `dist`. Node: 22 or newer. The tracked `vercel.json` routes `/api/*` to the Express function.
4. Set server variables `MONGODB_URI`, `APP_ORIGIN=https://YOUR-PROJECT.vercel.app`, `NODE_ENV=production` for Production. Keep the URI sensitive. Never put it in React or `VITE_*` variables.
5. Locally run `npm run seed` against that connection. Optionally provision a manager using the documented seed variables.
6. Deploy. Visit `/api/health`; it must return `{ "ok": true }`. Create a student account, reserve a resource, reload, inspect history, cancel, and test manager approval with another resource.
7. Test the public URL in a signed-out browser. If deployment protection blocks evaluators, adjust the project’s protection setting intentionally.

If Atlas reports TLS/server-selection errors, verify cluster status, database user credentials, DNS, and allowed network addresses. Do not solve this by disabling certificate verification.

## Conventional Node hosting
Run `npm ci`, `npm run build`, then `npm start`. Supply MONGODB_URI, APP_ORIGIN, NODE_ENV=production and the host-assigned PORT. Serve HTTPS at the edge. React and API share the same origin.

## Local sandbox
`npm run demo` is a loopback-only demonstration with a separate MongoDB instance and known demo users. It must never be used as the public deployment command.

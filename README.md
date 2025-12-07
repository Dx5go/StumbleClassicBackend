# Unity Game Backend (self-hosted)

This repository is an Express + MongoDB backend used by a Unity client (and MelonLoader mods) for login, economy, battle pass, tournaments, analytics, and matchmaking. The code has been rebranded for self-hosting: all secrets live in `.env`, old hosting references were removed, and configuration is centralized in `config/index.js`.

## Project layout
- `index.js` - Express bootstrap and route registration.
- `BackendUtils.js` - Database layer plus controllers for users, rounds, battle pass, economy, friends, missions, news, analytics, tournaments, matchmaking, social, and events.
- `CryptoUtils.js` - Hashing/JWT helpers using env-managed salts.
- `SharedUtils.js` & `shared.json` - Shared game config/bundles; `BACKEND_PUBLIC_URL` overrides the bundled `BackendUrl`.
- `config/index.js` - Single source of configuration (env loader, required keys, flags).
- `.env.example` - Template for secrets and URLs.

## API surface (high level)
- Health: `GET /api/v1/ping`, `GET /onlinecheck`
- Auth/User: `POST /user/login`, `GET /user/config`, `POST /user/updateusername`, `GET /user/deleteaccount`, `POST /user/linkplatform`, `POST /user/unlinkplatform`, `POST /user/profile`, `POST /user-equipped-cosmetics/update`, `POST /user/cosmetics/addskin`, `POST /user/cosmetics/setequipped`
- Shared data: `GET /shared/:version/:type`
- Rounds: `GET /round/finish/:round`, `GET /round/finishv2/:round`, `POST /round/finish/v4/:round`, `POST /round/eventfinish/v4/:round`
- Battle pass: `GET /battlepass`, `POST /battlepass/claimv3`, `POST /battlepass/purchase`, `POST /battlepass/complete`
- Economy: `GET /economy/purchase/:item`, `GET /economy/purchasegasha/:itemId/:count`, `GET /economy/purchaseluckyspin`, `GET /economy/purchasedrop/:itemId/:count`, `POST /economy/:currencyType/give/:amount`
- Missions: `GET /missions`, `POST /missions/:missionId/rewards/claim/v2`, `POST /missions/objective/:objectiveId/:milestoneId/rewards/claim/v2`
- Friends: request/accept/reject/cancel/list endpoints under `/friends`
- Events/News/Social: `GET /game-events/me`, `GET /news/getall`, `GET /social/interactions`
- Analytics: `POST /analytics`
- Crowns leaderboard: `POST /update-crown-score`, `GET /highscore/crowns/list`, `GET /highscore/:type/list`
- Tournaments/Matchmaking: `GET /tournamentx/active`, join/leave/finish under `/tournamentx/:tournamentId/*`, `POST /api/v1/userLoginExternal`, `GET /api/v1/tournaments`, `GET /matchmaking/filter`

## Setup
1. Install Node.js 18+ and npm.
2. `npm install`
3. Copy `.env.example` to `.env` and fill values (see below). Generate secrets with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
4. Run locally: `npm start` (or `npm run dev`).
5. The server listens on `PORT` (default 8080).

### Environment variables
- `APP_NAME` - Display name for logs and JWT issuer.
- `BACKEND_VERSION` - Tag shown in logs (optional).
- `NODE_ENV` - `development` | `production`.
- `PORT` - Server port.
- `MONGO_URI` - MongoDB connection string (Atlas recommended).
- `MONGO_DB_NAME` - Database name.
- `API_SECRET` / `JWT_SECRET` - Primary secret for JWT signing (Photon auth). Set to a strong random value.
- `LEAGUE_SALT`, `LEAGUE_LOGIN_SALT`, `LOGIN_SALT`, `SALT` - Game hashing salts; set new random values.
- `SHARED_VERSION`, `SHARED_TYPE` - Versioning tags passed to the client.
- `BACKEND_PUBLIC_URL` - Public URL of this service (overrides `BackendUrl` in shared config).
- `FRONTEND_PUBLIC_URL` - URL of the Unity client / web front-end (informational).
- `SEED_SHARED_DATA` - `true`/`false`; when true, shared cosmetics/emotes data is synced into Mongo on boot.

### MongoDB Atlas
1. Create a free cluster in Atlas.
2. Add a database user with a strong password.
3. Allow your IP or `0.0.0.0/0` (temporary) in Network Access.
4. Copy the connection string and set `MONGO_URI`. Pick a database name and set `MONGO_DB_NAME`.

### Deploying on Render
1. Push this repo to your own GitHub repository.
2. In Render, create a new **Web Service** from that repo.
3. Environment: `Node`. Build command: `npm install`. Start command: `npm start`.
4. Add all environment variables from `.env.example` in Render’s dashboard.
5. Enable autoscale if desired, and attach a custom domain; set that URL in `BACKEND_PUBLIC_URL` so clients receive the right endpoint.

### Unity / MelonLoader client updates
- Point all HTTP calls to your `BACKEND_PUBLIC_URL` (e.g., `https://your-backend.onrender.com`).
- Update any hardcoded base URLs in the client/mod to match the routes listed above (notably `/user/login`, `/user/config`, `/shared/{version}/{type}`).
- If the client caches shared data, clear it after changing salts/URLs so new JWTs and hashes are accepted.
- Replace any old tokens or salts bundled in the client with the new values you generated for `JWT_SECRET`/`LEAGUE_SALT`/`LOGIN_SALT`.

## Future-ready notes (tournaments/leaderboards/matchmaking)
- Controllers for tournaments and matchmaking already exist inside `BackendUtils.js`. For new modules, create dedicated files in a `controllers/` and `services/` directory, then mount them via `express.Router` in `index.js`.
- Keep secrets isolated in `config/index.js` and avoid hardcoding URLs or IDs. Add new env keys to `.env.example` as features grow.
- Consider adding rate limiting, request validation (e.g., `celebrate`/`joi`), and per-route auth once the API surface stabilizes.

## Security checklist
- `.env` is ignored from git. Never commit secrets.
- Generate fresh salts and JWT secrets; do not reuse any values from previous deployments.
- Use separate MongoDB users/roles per environment. Rotate credentials when rotating salts.
- Set `SEED_SHARED_DATA=false` in production if you do not want shared cosmetics collections dropped/re-seeded on each boot.

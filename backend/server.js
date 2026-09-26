import 'dotenv/config';
import app from './src/app.js';
import { env } from './src/config/env.js';

app.listen(env.port, () => {
  console.log(`CyberSentinel API running on :${env.port} (${env.nodeEnv})`);
});


//  1. backend/server.js — entry, loads app + env, listens on 5000
//  2. backend/src/app.js — middleware stack (helmet → CORS → logs → JSON → rate limit → routes → 404 → errors) + route mounting
//  3. backend/src/config/env.js + src/config/db.js — env validation, Neon pool
//  4. backend/src/utils/apiResponse.js, src/utils/asyncHandler.js — response shape, error wrapper
//  5. backend/src/middlewares/ — auth (JWT → req.user), authorize (roles), validate (Zod), error
//  6. backend/src/validations/ — auth.validation.js, sentinel.validation.js (what each endpoint accepts)
//  7. backend/src/services/auth.service.js → normalize → aiScoring → correlation → graph — core logic, read correlation last (patterns + scoring)
//  8. backend/src/controllers/auth.controller.js → ingest → monitor → detection → incident → report — pairs with routes
//  9. backend/src/routes/*.route.js — URL map, auth/validation wiring
// 10. backend/src/models/*.model.js + src/db/schema.sql — tables behind the queries
// 11. backend/src/db/seed.js, migrate.js — demo data + schema apply
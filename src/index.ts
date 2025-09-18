// src/index.ts
import 'dotenv/config';
import { connectDB } from './config/db';
import { CONFIG } from './config/app-config';
import { app } from './app';

(async () => {
  await connectDB();
  app.listen(CONFIG.PORT, () =>
    console.log(`API running on http://localhost:${CONFIG.PORT}`)
  );
})();
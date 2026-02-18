import { buildApp } from '@/app/app.js';

const app = await buildApp();

try {
  await app.listen({ host: app.config.HOST, port: app.config.PORT });
} catch (err) {
  app.log.fatal(err);
  process.exit(1);
}

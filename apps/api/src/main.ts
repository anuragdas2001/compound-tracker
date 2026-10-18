import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';

import { AppModule } from './app.module';

let cachedServer: Express;

async function bootstrapServer(): Promise<Express> {
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    app.setGlobalPrefix('api', { exclude: ['/'] });
    app.enableCors({
      origin: process.env.FRONTEND_URL || true,
      credentials: true,
    });
    await app.init();
    cachedServer = expressApp;
  }
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const server = await bootstrapServer();
  return server(req, res);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = handler;
  module.exports.default = handler;
}

// Local standalone development without Vercel serverless environment
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  async function localBootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api', { exclude: ['/'] });
    app.enableCors({
      origin: process.env.FRONTEND_URL || true,
      credentials: true,
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
  }
  void localBootstrap();
}



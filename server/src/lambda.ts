import { Server } from 'http';
import * as express from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { eventContext } from 'aws-serverless-express/middleware';
import { createServer, proxy } from 'aws-serverless-express';
import { Handler, Context } from 'aws-lambda';

let cachedServer: Server;

async function bootstrapServer(): Promise<Server> {
  if (cachedServer) {
    try {
      const expressApp = express();
      const nestApp = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
      );
      nestApp.use(eventContext());
      await nestApp.init();
      cachedServer = createServer(expressApp);
    } catch (error) {
      throw error;
    }
  }
  return Promise.resolve(cachedServer);
}

export const handler: Handler = async (event: any, context: Context) => {
  try {
    cachedServer = await bootstrapServer();
    return proxy(cachedServer, event, context, 'PROMISE').promise;
  } catch (error) {
    console.error(error);
  }
};

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WebsocketAdapter } from './websockets/websocket.adapter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { z } from 'zod';
// import { patchNestJsSwagger } from 'nestjs-zod'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.enableCors();
  // patchNestJsSwagger()

  const config = new DocumentBuilder()
    .setTitle('Ecomerce - API')
    .setDescription('The API for the ecommerce application')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const websocketAdapter = new WebsocketAdapter(app)
  await websocketAdapter.connectToRedis()
  app.useWebSocketAdapter(websocketAdapter)
  
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();

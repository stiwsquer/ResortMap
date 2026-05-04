import express from 'express';
import { BookingService } from './domain/bookingService';
import { ResortMap } from './domain/mapModel';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { createCabanaRouter } from './routes/cabanaRoutes';
import { createMapRouter } from './routes/mapRoutes';

export interface AppDependencies {
  resortMap: ResortMap;
  bookingService: BookingService;
}

export function createApp(dependencies: AppDependencies): any {
  const app = express();

  app.use(express.json());

  app.get('/api/health', (_req: any, res: any) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', createMapRouter(dependencies.resortMap, dependencies.bookingService));
  app.use('/api', createCabanaRouter(dependencies.bookingService));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

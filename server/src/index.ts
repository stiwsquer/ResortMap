import { createApp } from './app';
import { BookingService } from './domain/bookingService';
import { getRuntimeConfig } from './config';
import { loadBookingsFromFile } from './loaders/bookingsLoader';
import { loadMapFromFile } from './loaders/mapLoader';

async function bootstrap(): Promise<void> {
  const config = getRuntimeConfig();

  const resortMap = await loadMapFromFile(config.mapPath);
  const guestRegistry = await loadBookingsFromFile(config.bookingsPath);

  const bookingService = new BookingService({
    cabanaIds: resortMap.cabanaIds,
    guestLookupByRoom: guestRegistry.lookupByRoom,
  });

  const app = createApp({
    resortMap,
    bookingService,
  });

  app.listen(config.port, () => {
    console.log(`ResortMap API listening on http://127.0.0.1:${config.port}`);
    console.log(`Map file: ${config.mapPath}`);
    console.log(`Bookings file: ${config.bookingsPath}`);
  });
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown startup error.';
  console.error(`Startup failed: ${message}`);
  process.exit(1);
});

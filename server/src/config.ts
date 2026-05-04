import path from 'node:path';

export interface RuntimeConfig {
  mapPath: string;
  bookingsPath: string;
  port: number;
}

function readOption(argv: string[], optionName: '--map' | '--bookings'): string | null {
  const index = argv.indexOf(optionName);

  if (index === -1) {
    return null;
  }

  const nextValue = argv[index + 1];

  if (!nextValue || nextValue.startsWith('--')) {
    throw new Error(`Missing value for ${optionName}.`);
  }

  return nextValue;
}

export function getRuntimeConfig(argv: string[] = process.argv.slice(2)): RuntimeConfig {
  const mapPathFromArg = readOption(argv, '--map');
  const bookingsPathFromArg = readOption(argv, '--bookings');

  return {
    mapPath: path.resolve(mapPathFromArg ?? 'map.ascii'),
    bookingsPath: path.resolve(bookingsPathFromArg ?? 'bookings.json'),
    port: 3000,
  };
}

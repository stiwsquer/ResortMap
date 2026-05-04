import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readOption(argv, optionName) {
  const index = argv.indexOf(optionName);

  if (index === -1) {
    return null;
  }

  const value = argv[index + 1];

  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${optionName}.`);
  }

  return value;
}

function buildServerArgs(argv) {
  const mapPath = readOption(argv, '--map');
  const bookingsPath = readOption(argv, '--bookings');
  const result = [];

  if (mapPath) {
    result.push('--map', mapPath);
  }

  if (bookingsPath) {
    result.push('--bookings', bookingsPath);
  }

  return result;
}

function getNpmExecutable() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function shouldUseShell() {
  return process.platform === 'win32';
}

const npmExecutable = getNpmExecutable();

let isShuttingDown = false;
let serverProcess;
let webProcess;

function terminateChildren() {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGTERM');
  }

  if (webProcess && !webProcess.killed) {
    webProcess.kill('SIGTERM');
  }
}

function shutdown(exitCode) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  terminateChildren();

  setTimeout(() => {
    process.exit(exitCode);
  }, 250);
}

function run() {
  const forwardedArgs = process.argv.slice(2);
  const serverArgs = buildServerArgs(forwardedArgs);

  serverProcess = spawn(
    npmExecutable,
    ['run', 'dev:server', '--', ...serverArgs],
    {
      cwd: __dirname,
      stdio: 'inherit',
      shell: shouldUseShell(),
    },
  );

  webProcess = spawn(
    npmExecutable,
    ['run', 'dev:web'],
    {
      cwd: __dirname,
      stdio: 'inherit',
      shell: shouldUseShell(),
    },
  );

  serverProcess.on('exit', (code) => {
    if (isShuttingDown) {
      return;
    }

    console.error(`[run] Backend exited with code ${code ?? 0}. Stopping frontend.`);
    shutdown(code ?? 1);
  });

  webProcess.on('exit', (code) => {
    if (isShuttingDown) {
      return;
    }

    console.error(`[run] Frontend exited with code ${code ?? 0}. Stopping backend.`);
    shutdown(code ?? 1);
  });

  process.on('SIGINT', () => shutdown(0));
  process.on('SIGTERM', () => shutdown(0));
}

try {
  run();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown startup error.';
  console.error(`[run] Failed to start: ${message}`);
  process.exit(1);
}

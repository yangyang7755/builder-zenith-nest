#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting backend server...');

const serverProcess = spawn('npx', ['tsx', 'server/server.ts'], {
  cwd: __dirname,
  stdio: ['inherit', 'pipe', 'pipe'],
  env: { ...process.env, SERVER_PORT: '3002' }
});

serverProcess.stdout.on('data', (data) => {
  console.log(`[SERVER] ${data}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`[SERVER ERROR] ${data}`);
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  serverProcess.kill('SIGTERM');
  process.exit(0);
});

#!/usr/bin/env node
// Start both the local proxy and the Vite dev server together.
// Usage: npm run dev

import { spawn } from 'child_process';
import path from 'path';
import process from 'process';

const root = process.cwd();
const proxyPath = path.join(root, 'server', 'proxy.js');

function startProxy() {
  const child = spawn(process.execPath, [proxyPath], {
    stdio: 'inherit',
    env: process.env,
  });
  return child;
}

function startVite() {
  // Spawn the vite binary from local node_modules/.bin via PATH
  const child = spawn('vite', [], {
    stdio: 'inherit',
    env: process.env,
  });
  return child;
}

console.log('Starting proxy and Vite dev server...');

const proxy = startProxy();
const vite = startVite();

function shutdown(code = 0) {
  try { if (proxy && !proxy.killed) proxy.kill(); } catch (e) {}
  try { if (vite && !vite.killed) vite.kill(); } catch (e) {}
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('exit', (code) => shutdown(code));

// forward child exit
proxy.on('exit', (code) => {
  console.log('Proxy exited with', code);
});
vite.on('exit', (code) => {
  console.log('Vite exited with', code);
});

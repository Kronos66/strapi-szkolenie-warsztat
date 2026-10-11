'use strict';

// Tworzy .env z .env.example, jeśli go nie ma — z losowymi sekretami zamiast "tobemodified".
// Uruchamiany automatycznie przed develop / build / start (skrypty "pre*" w package.json).

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
const examplePath = path.join(root, '.env.example');

if (fs.existsSync(envPath)) process.exit(0);

const secret = () => crypto.randomBytes(16).toString('base64');

const content = fs
  .readFileSync(examplePath, 'utf8')
  .replace(/^APP_KEYS=.*$/m, `APP_KEYS="${[secret(), secret(), secret(), secret()].join(',')}"`)
  .replace(/=tobemodified$/gim, () => `=${secret()}`);

fs.writeFileSync(envPath, content);
console.log('Utworzono .env z .env.example (wygenerowane sekrety).');

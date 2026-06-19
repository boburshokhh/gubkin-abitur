#!/usr/bin/env node
/**
 * Обёртка: cd backend && node src/scripts/check-priem-files.js
 */
const { spawnSync } = require('child_process');
const path = require('path');

const script = path.join(__dirname, '../backend/src/scripts/check-priem-files.js');
const result = spawnSync(process.execPath, [script], { stdio: 'inherit', cwd: path.join(__dirname, '../backend') });
process.exit(result.status ?? 1);

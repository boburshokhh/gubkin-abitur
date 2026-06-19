#!/usr/bin/env node
require('dotenv').config();

const { verifyApplicationStorage } = require('../services/file-storage-service');

async function main() {
  const applicationId = process.argv[2];
  if (!applicationId) {
    console.error('Usage: node src/scripts/verify-application-storage.js <application-id>');
    process.exit(1);
  }

  const report = await verifyApplicationStorage(applicationId);
  console.log(JSON.stringify(report, null, 2));

  if (report.missing > 0) {
    process.exit(2);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

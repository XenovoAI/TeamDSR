const path = require('path');
const { createServer } = require('http');

// Import the built server
const serverPath = path.join(__dirname, '../dist/index.cjs');
let app;

try {
  app = require(serverPath);
} catch (error) {
  console.error('Failed to load server:', error);
  throw error;
}

module.exports = app;

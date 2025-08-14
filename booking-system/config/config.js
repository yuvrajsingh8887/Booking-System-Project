
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

try {
  // Load YAML file from the root directory
  const configFile = fs.readFileSync(path.join(__dirname, '..', 'config.yml'), 'utf8');
  const config = yaml.load(configFile);

  module.exports = config;
} catch (e) {
  console.error('Failed to load or parse config.yml:', e);
  process.exit(1);
}
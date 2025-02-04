#!/usr/bin/env node

//Usage: node generate-hash.js --password="mySecurePassword123"

// Import required modules
const bcrypt = require('bcrypt');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command-line arguments
const argv = yargs(hideBin(process.argv))
  .option('password', {
    alias: 'p',
    type: 'string',
    demandOption: true,
    describe: 'Plain-text password to hash'
  })
  .help()
  .alias('help', 'h')
  .argv;

// Extract the plain-text password from arguments
const plainPassword = argv.password;

if (!plainPassword) {
  console.error('Error: Please provide a plain-text password using the --password or -p option.');
  process.exit(1);
}

// Define the number of salt rounds (recommended: 10-12)
const saltRounds = 10;

// Generate the password hash
bcrypt.hash(plainPassword, saltRounds)
  .then((hashedPassword) => {
    console.log('Hashed Password:', hashedPassword);
  })
  .catch((error) => {
    console.error('Error generating hash:', error.message);
    process.exit(1);
  });
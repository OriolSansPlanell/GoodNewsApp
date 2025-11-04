// Simple MongoDB connection test
require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ MongoDB connection successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ MongoDB connection failed:');
    console.error(error.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Check your password is correct in .env file');
    console.error('2. Make sure your IP is whitelisted in MongoDB Atlas (Network Access)');
    console.error('3. Verify the cluster name is correct: goodnews.29kvhhg.mongodb.net');
    process.exit(1);
  });

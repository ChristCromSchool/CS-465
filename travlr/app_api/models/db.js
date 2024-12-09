const mongoose = require('mongoose');
const readLine = require('readline');

// Require models from same directory
require('./travlr');
require('./users');
require('./cart');


const dbURI = 'mongodb://127.0.0.1/travlr';

// Updated connection with modern options
const connect = () => {
  setTimeout(() => {
    mongoose.connect(dbURI)
      .catch(err => {
        console.log('Database connection error:', err);
      });
  }, 1000);
};

// Monitor connection events
mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${dbURI}`);
});

mongoose.connection.on('error', err => {
  console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Windows specific listener
if (process.platform === 'win32') {
  const r1 = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  r1.on('SIGINT', () => {
    process.emit('SIGINT');
  });
}

// Graceful shutdown handler
const gracefulShutdown = (msg) => {
  mongoose.connection.close(() => {
    console.log(`Mongoose disconnected through ${msg}`);
    process.exit(0);
  });
};

// Event listeners for graceful shutdown
process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart');
  process.kill(process.pid, 'SIGUSR2');
});

process.on('SIGINT', () => {
  gracefulShutdown('app termination');
});

process.on('SIGTERM', () => {
  gracefulShutdown('app shutdown');
});

// Make initial connection
connect();

// Export mongoose instance
module.exports = mongoose;
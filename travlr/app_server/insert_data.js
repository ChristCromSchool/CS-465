const mongoose = require('mongoose');

// MongoDB connection string
const dbURI = 'mongodb://localhost/travlr';

// Connect to MongoDB
const connect = () => {
    setTimeout(() => mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true }), 1000);
}

mongoose.connection.on('connected', () => {
    console.log(`Mongoose connected to ${dbURI}`);
});

mongoose.connection.on('error', err => {
    console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

connect();

// Define your Trip schema
const tripSchema = new mongoose.Schema({
    code: String,
    name: String,
    length: String,
    start: Date,
    resort: String,
    perPerson: String,
    image: String,
    description: String
});

// Create a model
const Trip = mongoose.model('Trip', tripSchema);

// Your new trip data
const newTrips = [
    {
        "code": "GALR210214",
        "name": "Gale Reef",
        "length": "4 nights / 5 days",
        "start": "2021-02-14T08:00:00Z",
        "resort": "Emerald Bay, 3 stars",
        "perPerson": "799.00",
        "image": "reef1.jpg",
        "description": "<p>Gale Reef Sed et augue lorem. In sit amet placerat arcu</p>"
    },
    {
        "code": "DAWR210315",
        "name": "Dawson's Reef",
        "length": "4 nights / 5 days",
        "start": "2021-03-15T08:00:00Z",
        "resort": "Blue Lagoon, 4 stars",
        "perPerson": "1199.00",
        "image": "reef2.jpg",
        "description": "<p>Dawson's Reef Integer magna leo, posuere et dignissim v</p>"
    },
    {
        "code": "CLAR210621",
        "name": "Claire's Reef",
        "length": "4 nights / 5 days",
        "start": "2021-06-21T08:00:00Z",
        "resort": "Coral Sands, 5 stars",
        "perPerson": "1999.00",
        "image": "reef3.jpg",
        "description": "<p>Claire's Reef Donec sed felis risus. Nulla facilisi. Do</p>"
    }
];

// Function to insert trips
async function insertTrips() {
    try {
        // First, remove all existing trips
        await Trip.deleteMany({});
        console.log('Existing trips removed');

        // Insert new trips
        const result = await Trip.insertMany(newTrips);
        console.log(`${result.length} trips inserted successfully`);
    } catch (error) {
        console.error('Error inserting trips:', error);
    } finally {
        // Close the database connection
        mongoose.connection.close();
    }
}

// Run the insertion function once the connection is established
mongoose.connection.once('open', () => {
    console.log('MongoDB connection open, inserting trips...');
    insertTrips();
});
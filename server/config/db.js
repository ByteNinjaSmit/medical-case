const mongoose = require('mongoose');

// Global cache to store connection status across hot reloads in development
let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached; // Assign cached object globally for reuse

const connectToDatabase = async () => {
    if (cached.conn) return cached.conn; // Use existing connection if available

    if (!cached.promise) {
        const URI = process.env.MONGODB_URI && process.env.MONGODB_URI.trim();
        if (!URI) {
            throw new Error('MONGODB_URI is not set');
        }
        cached.promise = mongoose.connect(URI, {
            dbName: 'Amruta-Medical',
            bufferCommands: false,
            maxPoolSize:200,
            serverSelectionTimeoutMS: 5000, 
            socketTimeoutMS: 10000,

        }).then((mongoose) => mongoose.connection)
          .catch((error) => {
            console.error("Failed to connect to MongoDB:", error);
            throw new Error("Failed to connect to the database");

        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

module.exports = connectToDatabase;
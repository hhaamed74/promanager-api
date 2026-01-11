const mongoose = require("mongoose"); // Import the Mongoose library to handle MongoDB connections

/**
 * Function to establish connection with the MongoDB database
 */
const connectDB = async () => {
  try {
    // Connect to the database using the URI stored in environment variables (.env)
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Success message showing the database host name
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log any connection errors in red/error format
    console.error(`❌ Error: ${error.message}`);

    // Terminate the process with a failure status (1) if the connection fails
    // This prevents the server from running without a working database
    process.exit(1);
  }
};

module.exports = connectDB; // Export the function to be used in server.js

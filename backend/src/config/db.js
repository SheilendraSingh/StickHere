import mongoose from "mongoose";

// Define a variable to track whether Mongoose event listeners have already been attached, to prevent attaching multiple listeners if the connectDB function is called multiple times. This helps ensure that we only set up the necessary event listeners once, avoiding potential issues with duplicate event handling and ensuring that we have a clear and consistent logging of database connection events.
let mongooseListenersAttached = false;

// Define a function named attachMongooseListeners to set up event listeners for the Mongoose connection. This function checks if the listeners have already been attached using the mongooseListenersAttached variable, and if not, it attaches listeners for the "connected", "error", and "disconnected" events on the Mongoose connection. This allows us to log messages to the console when the database connection is established, encounters an error, or is disconnected, providing feedback on the status of the database connection and helping with troubleshooting any issues that may arise.
const attachMongooseListeners = () => {
  // If the Mongoose event listeners have already been attached, return early to avoid attaching multiple listeners and ensure that we only set up the necessary event listeners once. This helps prevent potential issues with duplicate event handling and ensures that we have a clear and consistent logging of database connection events.
  if (mongooseListenersAttached) return;

  // Set the mongooseListenersAttached variable to true to indicate that the event listeners have been attached, preventing future calls to this function from attaching additional listeners. This helps ensure that we only set up the necessary event listeners once, avoiding potential issues with duplicate event handling and ensuring that we have a clear and consistent logging of database connection events.
  mongooseListenersAttached = true;

  // Set up event listeners for the Mongoose connection to log messages when the connection is established, encounters an error, or is disconnected. This provides feedback on the status of the database connection and helps with troubleshooting any issues that may arise.
  mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to MongoDB");
  });

  // Set up an event listener for the "error" event on the Mongoose connection to log any runtime errors that occur with the MongoDB connection. This helps us identify and troubleshoot issues related to the database connection during the application's runtime.
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB runtime error:", err.message);
  });

  // Set up an event listener for the "disconnected" event on the Mongoose connection to log a warning message when the connection to MongoDB is lost. This helps us monitor the status of the database connection and be aware of any disruptions that may affect the application's functionality.
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });
};
// Define an asynchronous function named connectDB to establish a connection to the MongoDB database using Mongoose. This function will attempt to connect to the database using the connection URI specified in the environment variables, and handle any errors that may occur during the connection process.
const connectDB = async () => {
  // Retrieve the MongoDB connection URI from the environment variables, and throw an error if it is not defined. This ensures that we have the necessary configuration to connect to the database before attempting to establish a connection.
  const mongoURI = process.env.MONGO_URI;

  // If the MONGO_URI environment variable is not defined, log an error message to the console and exit the process with a non-zero status code to indicate that the application failed to start due to a missing database connection URI. This helps ensure that we are aware of any configuration issues related to the database connection and can take appropriate action to resolve them before attempting to run the application.
  if (!mongoURI) {
    console.error("MongoDB connection error: MONGO_URI is not defined");
    process.exit(1);
  }

  // Call the attachMongooseListeners function to set up event listeners for the Mongoose connection, ensuring that we have feedback on the status of the database connection and can troubleshoot any issues that may arise during the application's runtime.
  attachMongooseListeners();

  try {
    // Attempt to connect to the MongoDB database using Mongoose, and specify the database name if it is provided in the environment variables. If the connection is successful, log a message indicating that the connection was established successfully, along with the host of the connected database.
    const connection = await mongoose.connect(mongoURI, {
      dbName: process.env.MONGO_DB_NAME || undefined,
    });

    // Log a message to the console indicating that the MongoDB connection was established successfully, along with the host of the connected database. This provides feedback to developers and monitoring tools that the database connection is up and running, allowing them to verify that the backend API can interact with the database as expected.
    console.log(
      `MongoDB connected successfully: ${connection.connection.host}`,
    );
  } catch (error) {
    // If an error occurs during the connection process, log the error message to the console and exit the process with a non-zero status code to indicate that the application failed to start due to a database connection issue. This helps ensure that we are aware of any issues with the database connection and can take appropriate action to resolve them before attempting to run the application.
    console.error("MongoDB connection error:", error.message);
    if (/^mongodb\+srv:\/\//i.test(mongoURI)) {
      console.error(
        "Atlas checklist: allow your current IP in Network Access, confirm the cluster is running, and verify DB user credentials.",
      );
    }
    // Exit the process with a non-zero status code to indicate that the application failed to start due to a database connection issue.
    process.exit(1);
  }
};
export default connectDB;

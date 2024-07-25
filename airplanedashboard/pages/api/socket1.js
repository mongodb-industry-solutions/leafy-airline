import { MongoClient } from 'mongodb';
import { Server } from 'socket.io';

const uri = process.env.MONGO_URI;
const options = { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 5000 };

let client;
let io;
let changeStream;

const connectToDatabase = async () => {
  if (!client) {
    console.log("Connecting to MongoDB...");
    client = new MongoClient(uri, options);
    try {
      await client.connect();
      console.log("Connected to MongoDB.");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }
  return client.db('leafy_airline'); // Replace with your database name
};

const changeStreamHandler = async () => {
  console.log("Starting change stream handler...");
  const db = await connectToDatabase();
  const collection = db.collection('flight_costs');

  const startChangeStream = () => {
    console.log("Setting up change stream...");
    changeStream = collection.watch([
      { $match: { $or: [{ 'operationType': 'insert' }, { 'operationType': 'update' }] } }
    ]);

    changeStream.on('change', async (change) => {
      console.log("Change detected:", change);

      let alert = null;

      if (change.operationType === 'insert') {
        const document = change.fullDocument;
        console.log("Insert operation:", document);
        if (document.Delay_Time !== undefined) {
          alert = document;
        }
      } else if (change.operationType === 'update') {
        const updatedFields = change.updateDescription?.updatedFields;
        console.log("Update operation:", updatedFields);
        if (updatedFields?.Delay_Time !== undefined) {
          const document = await collection.findOne({ _id: change.documentKey._id });
          alert = { ...document, ...updatedFields };
        }
      }

      if (alert) {
        console.log('Alert detected:', alert);
        if (io) {
          io.emit('alert', alert);
          console.log('Alert emitted to clients.');
        } else {
          console.warn("Socket.IO not initialized.");
        }
      }
    });

    changeStream.on('error', (error) => {
      console.error("Change stream error:", error);
      if (error.code === 'ETIMEDOUT') {
        console.log("Reconnecting change stream due to timeout...");
        changeStream.close();
        setTimeout(startChangeStream, 1000);
      }
    });

    changeStream.on('end', () => {
      console.log("Change stream closed.");
    });
  };

  startChangeStream();
};

const socketHandler = (req, res) => {
  console.log("Received request at /api/socket1");
  if (!res.socket.server.io) {
    console.log("Initializing Socket.IO...");
    io = new Server(res.socket.server);
    res.socket.server.io = io;

    // Emit 'No Delay' message to clients initially
    io.emit('alert', { Delay_Time: null });
    console.log('Initial alert emitted to clients: No Delay');

    changeStreamHandler();
  } else {
    console.log("Socket.IO already initialized.");
  }
  res.end();
};

process.on('SIGINT', async () => {
  console.log("Closing MongoDB client and change stream...");
  if (changeStream) {
    await changeStream.close();
  }
  if (client) {
    await client.close();
  }
  process.exit(0);
});

export default socketHandler;


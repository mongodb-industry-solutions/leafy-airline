import { MongoClient } from 'mongodb';
import { Server } from 'socket.io';

const uri = process.env.MONGO_URI;
const options = { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 5000 };

let client;
let changeStream;
let io;

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
  return client.db('leafy_airline');
};

const changeStreamHandler = async () => {
  console.log("Starting change stream handler...");
  const db = await connectToDatabase();
  const collection = db.collection('flight_plane_simulation');

  changeStream = collection.watch([
    { $match: { $or: [{ 'operationType': 'insert' }, { 'operationType': 'update' }] } }
  ]);

  changeStream.on('change', async (change) => {
    console.log("Change detected:", change);

    let updateData = null;

    if (change.operationType === 'insert') {
      const document = change.fullDocument;
      if (document.mostRecentLat !== undefined && document.mostRecentLong !== undefined) {
        updateData = document;
      }
    } else if (change.operationType === 'update') {
      const updatedFields = change.updateDescription?.updatedFields;
      if (updatedFields?.mostRecentLat !== undefined || updatedFields?.mostRecentLong !== undefined) {
        const document = await collection.findOne({ _id: change.documentKey._id });
        updateData = { ...document, ...updatedFields };
      }
    }

    if (updateData && io) {
      io.of('/flight_plane_simulation').emit('flight_plane_simulation_update', updateData);
    }
  });

  changeStream.on('error', (error) => {
    console.error("Change stream error:", error);
    if (error.code === 'ETIMEDOUT') {
      changeStream.close();
      setTimeout(changeStreamHandler, 1000);
    }
  });

  changeStream.on('end', () => {
    console.log("Change stream closed.");
  });
};

const flightPlaneSimulationSocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket.IO already initialized.");
    return res.end();
  }

  console.log("Initializing Socket.IO...");
  io = new Server(res.socket.server);
  res.socket.server.io = io;

  const namespace = io.of('/flight_plane_simulation');
  namespace.on('connection', (socket) => {
    console.log('Client connected to flight_plane_simulation namespace');
    socket.emit('flight_plane_simulation_update', { mostRecentLat: null, mostRecentLong: null });
  });

  changeStreamHandler();
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

export default flightPlaneSimulationSocketHandler;

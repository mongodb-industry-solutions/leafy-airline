// import { MongoClient } from 'mongodb';
import { Server } from 'socket.io';
import clientPromise from '../../lib/mongo';

const uri = process.env.MONGO_URI;
const options = { useNewUrlParser: true,
                  useUnifiedTopology: true,
                  serverSelectionTimeoutMS: 5000 };

let io;
let changeStream;
let client;


const changeStreamHandler = async () => {
  console.log("Starting change stream handler...");
  
  
  const client = await clientPromise;
  const db = client.db('leafy_airline');

  console.log("Connected to MongoDB");

  const collection = db.collection('flight_costs1');

  changeStream = collection.watch([
    { $match: { $or: [{ 'operationType': 'insert' }, { 'operationType': 'update' }] } }
  ]);

  changeStream.on('change', async (change) => {
    console.log("Change detected:", change);

    let alert = null;

    if (change.operationType === 'insert') {
      const document = change.fullDocument;
      if (document.input?.Delay_Time !== undefined && document.session_id) {
        alert = document;
      }

    } else if (change.operationType === 'update') {
      const updatedFields = change.updateDescription?.updatedFields;
      if (updatedFields?.input.Delay_Time !== undefined) {
        const document = await collection.findOne({ _id: change.documentKey._id });
        if (document?.session_id) {
          alert = { ...document, ...updatedFields };
        }
      }
    }

    // Emit the alert only to the corresponding session room
    if (alert && io && alert.session_id) {
      console.log(`Emitting alert to session room: ${alert.session_id}`);
      io.to(alert.session_id).emit('alert', alert);
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

const socketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket.IO already initialized.");
    return res.end();
  }

  console.log("Initializing Socket.IO...");
  io = new Server(res.socket.server);
  res.socket.server.io = io;

  // Handle client connections
  io.on('connection', (socket) => {
    const { session_id } = socket.handshake.query;
    console.log(`Client connected with session_id: ${session_id}`);

    if (session_id) {
      // Join the user into their own session room
      socket.join(session_id);
      socket.emit('session_ack', { message: `Joined session room ${session_id}` });
      console.log(`Client joined room: ${session_id}`);
    }

    socket.on('disconnect', () => {
      console.log(`Client disconnected from session ${session_id}`);
    });
  });

  // io.emit('alert', { Delay_Time: null });
  // console.log('Initial alert emitted to clients: No Delay');

  // changeStreamHandler();
  // res.end();

  // Start MongoDB change stream
  changeStreamHandler().catch(console.error);
  res.end();
};

process.on('SIGINT', async () => {
  // console.log("Closing MongoDB client and change stream...");
  if (changeStream) {
    await changeStream.close();
  }
  // if (client) {
  //   // await client.close();
  // }
  process.exit(0);
});

export default socketHandler;

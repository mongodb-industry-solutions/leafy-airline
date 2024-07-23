import { MongoClient } from 'mongodb';
import { Server } from 'socket.io';

const uri = process.env.MONGO_URI;
const options = { useNewUrlParser: true, useUnifiedTopology: true };

let client;
let io;
let alerts = []; // In-memory storage for alerts

if (!client) {
  client = new MongoClient(uri, options);
}

async function connectToDatabase() {
  if (!client.isConnected()) await client.connect();
  return client.db('leafy_airline'); 
}

const changeStreamHandler = async () => {
  const db = await connectToDatabase();
  const collection = db.collection('flight_costs'); 

  const changeStream = collection.watch();

  changeStream.on('change', (change) => {
    if (change.operationType === 'update' && change.updateDescription.updatedFields.delay_time > 0) {
      const alert = { ...change.documentKey, ...change.updateDescription.updatedFields };
      alerts.push(alert);
      io.emit('alert', alert);
    }
  });
};

const socketHandler = (req, res) => {
  if (!res.socket.server.io) {
    io = new Server(res.socket.server);
    res.socket.server.io = io;
    changeStreamHandler();
  }
  res.end();
};

export default socketHandler;

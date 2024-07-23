// services/changeStreamService.js
import { MongoClient } from 'mongodb';
import EventEmitter from 'events';

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

class ChangeStreamService extends EventEmitter {
  constructor() {
    super();
    this.database = null;
    this.collection = null;
  }

  async connect() {
    await client.connect();
    this.database = client.db(process.env.MONGODB_DB);
    this.collection = this.database.collection('flight_costs');
  }

  watch() {
    const changeStream = this.collection.watch();
    changeStream.on('change', (change) => {
      if (change.operationType === 'update' || change.operationType === 'insert') {
        const updatedFields = change.updateDescription?.updatedFields;
        const fullDocument = change.fullDocument;

        if (updatedFields?.DelayTime > 0 || fullDocument?.DelayTime > 0) {
          this.emit('alert', change);
        }
      }
    });
  }
}

export default new ChangeStreamService();

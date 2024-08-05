// pages/api/fetchNewestDocument.js

import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI; // Replace with your MongoDB connection string
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await client.connect();
    const db = client.db('leafy_airline'); // Replace with your database name
    const collection = db.collection('flight_plane_simulation');

    const newestDocument = await collection.find().sort({ _id: -1 }).limit(1).toArray();
    if (newestDocument.length > 0) {
      console.log('Newest Document:', newestDocument[0]);
      res.status(200).json(newestDocument[0]);
    } else {
      console.log('No documents found in the collection.');
      res.status(200).json({ message: 'No documents found' });
    }
  } catch (error) {
    console.error('Error retrieving the newest document:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
}

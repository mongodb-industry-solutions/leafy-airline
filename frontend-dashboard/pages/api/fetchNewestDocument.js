// pages/api/fetchNewestDocument.js
// import { MongoClient } from 'mongodb';
import clientPromise from '../../lib/mongo';

const client = await clientPromise;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // console.log("Inside fetchNewestDocument API");
  const { session_id } = req.body || {};
  // console.log("Received session_id:", session_id);

  if (!session_id) {
    return res.status(400).json({ message: "Missing session_id in request body" });
  }

  try {
    const collectionName = 'flight_plane_simulation'
    const db = client.db('leafy_airline');
    const collection = db.collection(collectionName);

    // Find latest doc for this session
    const newestDocument = await collection
      .find({ "session_id": session_id })
      .sort({ "mostRecentTs": -1 })
      .limit(1)
      .toArray();
    

    if (newestDocument.length > 0) {
      // console.log(`Newest document for session ${session_id}:`, newestDocument[0]);
      return res.status(200).json(newestDocument[0]);
    } else {
      console.log(`No documents found for session ${session_id}`);
      // Handle this as controlled error
      // return res.status(404).json({ message: `No data found for session ${session_id}` });
      return res.status(200).json({message: `No data found for session ${session_id}`});
    }

  } catch (error) {
    console.error('Error retrieving the newest document:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    // await client.close();
  }
}

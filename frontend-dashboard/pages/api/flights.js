import clientPromise from '../../lib/mongo';

const client = await clientPromise;
const db = client.db('leafy-airline');

export default async function handler(req, res) {
  try {
    const flightsCollection = db.collection('flights');
    const flights = await flightsCollection.find({}).toArray();

    res.status(200).json(flights);
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}

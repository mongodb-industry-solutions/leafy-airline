import cron from 'node-cron';
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;
const dbName = 'leafy_airline';
const collectionName = 'flight_costs';
const outputCollection = 'flight_plane_simulation';

const runAggregation = async () => {
  console.log('Starting aggregation');

  const client = new MongoClient(MONGO_URI);

  try {
    console.log('Connecting to MongoDB...');
    const start = Date.now();
    await client.connect();
    console.log(`Connected to MongoDB in ${Date.now() - start} ms`);

    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    console.log('Running aggregation pipeline...');
    const pipelineStart = Date.now();
    const pipeline = [
        {
          $lookup: {
            from: "flight_realtimeCF",
            localField: "FlightID",
            foreignField: "flight_id",
            as: "realtime_data",
          },
        },
        {
          $unwind: "$realtime_data",
        },
        {
          $project: {
            _id: 1,
            Timestamp: 1,
            Distance_to_Destination: 1,
            Estimated_Time_Left: 1,
            Delay_Time: 1,
            Delay_Cost: 1,
            Fuel_Cost_per_Hour: 1,
            Total_Cost_per_Hour: 1,
            mostRecentLat:
              "$realtime_data.location.lat",
            mostRecentLong:
              "$realtime_data.location.long",
          },
        },
        {
          $merge: {
            into: outputCollection,
            whenMatched: "merge",
            whenNotMatched: "insert",
          },
        },
      ];

    const cursor = collection.aggregate(pipeline);
    const results = await cursor.toArray();
    console.log(`Aggregation pipeline completed in ${Date.now() - pipelineStart} ms`);

    console.log('Aggregation results:');
    results.forEach(doc => {
      console.log(`Most recent latitude: ${doc.mostRecentLat}, Most recent longitude: ${doc.mostRecentLong}, Delay Time: ${doc.Delay_Time},  Delay Cost: ${doc.Delay_Cost}`);
    });

  } catch (error) {
    console.error('Error during aggregation:', error);
  } finally {
    console.log('Closing MongoDB connection');
    const closeStart = Date.now();
    await client.close();
    console.log(`Closed MongoDB connection in ${Date.now() - closeStart} ms`);
    console.log('Aggregation finished');
  }
};

// Create a cron job to run the aggregation every 5 seconds
cron.schedule('*/5 * * * * *', runAggregation);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Start the cron job
    res.status(200).json({ message: 'Scheduler started' });
  } else {
    // Handle unsupported HTTP methods
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}













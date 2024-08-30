import cron from 'node-cron';
import { MongoClient } from 'mongodb';
// import React, { useEffect, useState } from 'react';

// const [schedulerStarted, setSchedulerStatus] = useState(false);

export async function runAggregation() {
  
  const MONGO_URI = process.env.MONGO_URI;
  const client = new MongoClient(MONGO_URI);
  const dbName = 'leafy_airline';
  const collectionName = 'flight_realtimeCF';
  const outputCollection = 'flight_plane_simulation';
  console.log('Starting aggregation');

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
        $addFields: {
          bucket: {
            $dateTrunc: {
              date: "$ts",
              unit: "second",
              binSize: 20
            }
          }
        }
      },
      {
        $sort: {
          ts: -1
        }
      },
      {
        $group: {
          _id: "$bucket",
          count: {
            $sum: 1
          },
          mostRecentLat: {
            $first: "$location.lat"
          },
          mostRecentLong: {
            $first: "$location.long"
          },
          mostRecentTs: {
            $first: "$ts"
          }
        }
      },
      {
        $sort: {
          _id: -1
        }
      },
      {
        $merge: {
          into: outputCollection,
          whenMatched: "merge",
          whenNotMatched: "insert"
        }
      }
    ];

    const cursor = collection.aggregate(pipeline);
    const results = await cursor.toArray();
    console.log(`Aggregation pipeline completed in ${Date.now() - pipelineStart} ms`);

    console.log('Aggregation results:');
    results.forEach(doc => {
      console.log(`Most recent latitude: ${doc.mostRecentLat}, Most recent longitude: ${doc.mostRecentLong}`);
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
let cronJob = null;

function createCronJob() {
  if (!cronJob) {
    cronJob = cron.schedule('*/2.5 * * * * *', runAggregation, { scheduled: false });
  }
}

export default async function handler(req, res) {
  createCronJob(); // Ensure cronJob is initialized
  
  if (req.method === 'POST') {
    if (cronJob && !cronJob.running) {
      cronJob.start();
      res.status(200).json({ message: 'Scheduler started' });
    } else {
      res.status(400).json({ message: 'Scheduler already running or could not be started' });
    }

  } else if (req.method === 'DELETE') {
    if (cronJob && cronJob.running) {
      await cronJob.stop();
      res.status(200).json({ message: 'Scheduler stopped' });
    } else {
      res.status(400).json({ message: 'Scheduler not running' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

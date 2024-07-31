import { MongoClient } from 'mongodb';

export default async function runAggregation() {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('leafy_airline');
    const collection = database.collection('flight_realtime');

    const pipeline = [
        {
          $addFields: {
            bucket: {
              $dateTrunc: {
                date: "$ts",
                unit: "second",
                binSize: 5
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
            into: "flight_plane_simulation",
            whenMatched: "merge",   // Can be "merge", "replace", or "fail"
            whenNotMatched: "insert" // Can be "insert" or "discard"
          }
        }
      ]
      

    const cursor = collection.aggregate(pipeline);

    await cursor.forEach(doc => console.log(doc));

  } finally {
    await client.close();
  }
}

runAggregation().catch(console.dir);

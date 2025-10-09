import { MongoClient } from "mongodb";

export async function runAggregation(session_id) {
  const MONGO_URI = process.env.MONGO_URI;
  const client = new MongoClient(MONGO_URI);
  const dbName = "leafy_airline";
  const collectionName = "flight_realtimeCF";
  const outputCollection = "flight_plane_simulation";

  if (!session_id) {
    throw new Error("Missing session_id for aggregation");
  }

  console.log(`Starting aggregation for session ${session_id}`);

  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const pipeline = [
      { $match: { session_id } },
      {
        $addFields: {
          bucket: {
            $dateTrunc: { date: "$ts", unit: "second", binSize: 20 },
          },
        },
      },
      { $sort: { ts: -1 } },
      {
        $group: {
          _id: "$bucket",
          count: { $sum: 1 },
          mostRecentLat: { $first: "$location.lat" },
          mostRecentLong: { $first: "$location.long" },
          mostRecentTs: { $first: "$ts" },
          session_id: { $first: "$session_id" },
        },
      },
      { $sort: { _id: -1 } },
      {
        $merge: {
          into: outputCollection,
          whenMatched: "merge",
          whenNotMatched: "insert",
        },
      },
    ];

    const result = await collection.aggregate(pipeline).toArray();
    console.log(`Aggregation for session ${session_id} completed`);
  } catch (error) {
    console.error(`Error during aggregation for ${session_id}:`, error);
  } finally {
    await client.close();
  }
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { session_id } = req.body || {};

    if (!session_id) {
      return res.status(400).json({ message: "Missing session_id" });
    }

    await runAggregation(session_id);
    return res.status(200).json({ message: `Aggregation run for session ${session_id}` });
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

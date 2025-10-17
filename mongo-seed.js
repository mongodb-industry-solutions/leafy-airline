import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { MongoClient } from "mongodb";


// Configuration  
// Take the MongoDB connection string and database name from environment variables or replace with your own values
const uri = process.env.MONGO_URI;
const databaseName = process.env.MONGODB_DB || 'airline_database';        


async function logStep(msg) {
  process.stdout.write(`\n[seed] ${msg}\n`);
}

async function closeMongoClient() {
  logStep("Closing MongoDB connection");
  await client.close();
}

async function checkDbEmpty(db) {
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    if (count > 0) return false;
  }
  return true;
}

async function createCollectionsFromData(db) {    
    const dataDir = "./data";  
    const files = ["flights.json",
                  "flight_realtimeCF.json",
                  "flight_plane_simulation.json",
                  "flight_costs.json"
    ];

    for (const file of files) {
      const colName = path.basename(file, ".json");
      logStep(`Seeding collection: ${colName}`);
      const filePath = path.join(dataDir, file);

      const raw = await fs.readFile(filePath, "utf8");
      const docs = JSON.parse(raw);

      if (!Array.isArray(docs))
        throw new Error(`${file} does not contain a JSON array.`);
      if (docs.length === 0) continue;

      if (colName !== "flight_realtimeCF") {
        await db.collection(colName).insertMany(docs);
        process.stdout.write(
          `[seed] Inserted ${docs.length} docs into ${colName}\n`
        );
      } else {
        // Timeseries collection 
        const timeseriesOptions = {
          timeField: "ts",
        };
        await db.createCollection(colName, { timeseries: timeseriesOptions });
        await db.collection(colName).insertMany(docs);
        process.stdout.write(
          `[seed] Created timeseries collection ${colName} and inserted ${docs.length} docs\n`
        );
      }
  }
};

async function main() {

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(databaseName);
    const isEmpty = await checkDbEmpty(db);

    if (isEmpty) {
      console.log('Database is empty. Seeding data...');
      await createCollectionsFromData(db);
      console.log('Seeding completed successfully.');
      await closeMongoClient();
      process.exit(0);

    } else {
      console.log('Database is not empty. Skipping seeding.');
      await closeMongoClient();
      process.exit(1);
    }
  } catch (err) {
    console.error('Error in main function:', err);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

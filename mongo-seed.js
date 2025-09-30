const { MongoClient } = require('mongodb');  
  
// Configuration  
// Take the MongoDB connection string and database name from environment variables or replace with your own values
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const databaseName = process.env.MONGODB_DB || 'flightDB';        

// Sample data
const seedData = [
  {  
    collection: 'flight_costs',  
    options: {}, // No special options for this collection  
    documents: [  
      {  
        _id: { $oid: '66a0c66fa341f28a527285f6' },  
        FlightID: '668e41ee3f23ded5fecd6cd3',  
        Timestamp: { $date: '2024-07-24T11:15:43.761Z' },  
        Distance_to_Destination: 13830.863129202127,  
        Estimated_Time_Left: 55.343838751629825,  
        Delay_Time: 44.312997429770945,  
        Delay_Cost: 4652.864730125949,  
        Fuel_Cost_per_Hour: 24918.89705270063,  
        Total_Cost_per_Hour: 29571.76178282658,  
      },  
    ],  
  },  
  {  
    collection: 'flight_plane_simulation',  
    options: {}, // No special options for this collection  
    documents: [  
      {  
        _id: { $date: '2024-07-26T16:15:30.000Z' },  
        count: 3,  
        mostRecentLat: 41.883394469356325,  
        mostRecentLong: -88.21403946739623,  
        mostRecentTs: { $date: '2024-07-26T16:15:33.305Z' },  
      },  
    ],  
  },  
  {  
    collection: 'flight_realtime',  
    options: {  
      timeseries: {  
        timeField: 'ts',  
        metaField: 'location',  
        granularity: 'seconds', // Use a suitable granularity for your timeseries data  
      },  
    },  
    documents: [  
      {  
        ts: { $date: '2024-07-25T09:44:00.479Z' },  
        _id: { $oid: '66a202413c03be29940b44b1' },  
        CF_insertion: 'Correct',  
        location: {  
          lat: 41.94940620761678,  
          long: -87.17765436437013,  
        },  
        flight_id: { $oid: '668e41ee3f23ded5fecd6cd3' },  
      },  
    ],  
  },  
  {  
    collection: 'flights',  
    options: {}, // No special options for this collection  
    documents: [  
      {  
        _id: { $oid: '668e41ee3f23ded5fecd6cd3' },  
        dep_time: { $date: '2024-07-11T09:00:00.000Z' },  
        arr_time: { $date: '2024-07-11T12:00:00.000Z' },  
        dep_arp: {  
          _id: 'ORD',  
          city: 'Chicago',  
          country: 'USA',  
          geo_loc: {  
            lat: 41.878113,  
            long: -87.629799,  
          },  
        },  
        arr_arp: {  
          _id: 'SFO',  
          city: 'San Francisco',  
          country: 'USA',  
          geo_loc: {  
            lat: 37.774929,  
            long: -122.419418,  
          },  
        },  
        airline: 'Skyline Airlines',  
        plane: 'Airbus A320',  
        ui_telemetry: {  
          timestamp: { $date: '2024-07-11T09:00:00.000Z' },  
          avg_speed: 540.2,  
          loc_vector: {  
            start: { lat: 41.878113, long: -87.629799 },  
            end: { lat: 37.774929, long: -122.419418 },  
          },  
        },  
        flight_number: 'SFO-199',  
        disruption_coords: { lat: 41.14960640210537, long: -105.56082525288254 },  
        initial_path: ['ORD', 'SFO'],  
        new_path: ['ORD', 'DEN', 'SFO'],  
      },  
    ],  
  },  
];  
  
async function seedDatabase() {  
  const client = new MongoClient(uri);  
  
  try {  
    // Connect to MongoDB server  
    await client.connect();  
    console.log('Connected to MongoDB successfully.');  
  
    // Select the database  
    const db = client.db(databaseName);  
  
    for (const { collection, options, documents } of seedData) {  
      try {  
        await db.createCollection(collection, options);  
        console.log(`Collection "${collection}" created successfully.`);  
      } catch (err) {  
        console.log(`Collection "${collection}" already exists, skipping creation.`);  
      }  
  
      const coll = db.collection(collection);  
  
      // Drop any existing documents in the collection (optional)  
      await coll.deleteMany({});  
      console.log(`Cleared existing documents in "${collection}".`);  
  
      // Insert sample documents  
      const result = await coll.insertMany(documents);  
      console.log(`Inserted ${result.insertedCount} documents into "${collection}" collection.`);  
    }  
  
    console.log('Database seeding completed successfully.');  
  } catch (err) {  
    console.error('Error seeding database:', err);  
  } finally {  
    await client.close();  
  }  
}  
  
// Execute the seed script  
seedDatabase();  

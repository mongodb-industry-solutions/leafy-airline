import clientPromise from "../../lib/mongo";

const endOfDay = (dateStr) => {
  const date = new Date(dateStr);
  date.setHours(23, 50, 0, 0);
  return date;
};  

const startOfDay = (dateStr) => {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date;
}
  
export default async function handler(req, res) {  
  if (req.method !== 'GET') {  
    res.status(405).end(); // Method Not Allowed  
    return;  
  }  
  
  const params = req.query;  
  const matchStage = {}; // Initial `$match` stage for filtering documents  
  
  // Adding filters based on query parameters  
  if (params.dep_time) {  
    matchStage['dep_time'] = { $gte: new Date(params.dep_time), $lte: endOfDay(params.dep_time) };  
    console.log('dep_time filter applied:', matchStage['dep_time']);
  }  
  if (params.arr_time) {  
    matchStage['arr_time'] = { $gte: startOfDay(params.arr_time), $lte: new Date(params.arr_time)};  
    console.log('arr_time filter applied:', matchStage['arr_time']);
  }  
  if (params['dep_arp._id']) {  
    matchStage['dep_arp._id'] = params['dep_arp._id'];  
  }  
  if (params['arr_arp._id']) {  
    matchStage['arr_arp._id'] = params['arr_arp._id'];  
  }  

  try {
    const client = await clientPromise;
    const db = client.db('leafy_airline');
    const collection = db.collection('flights');

    // Aggregation pipeline with `$facet`
    const aggregationPipeline = [
      { $match: matchStage }, // Match stage to filter results  
  
      {  
        $facet: {  
          // Facet for grouped results by departure airport  
          departureAirports: [  
            { $group: { 
              _id: '$dep_arp._id', 
              count: { $sum: 1 } ,
              city: { $first: '$dep_arp.city' }, 
              country: { $first: '$dep_arp.country' } }
            }, // Count occurrences  
            { $sort: { count: -1 } }, // Sort by count in descending order  
          ],  
  
          // Facet for grouped results by arrival airport 
          // Add city and country to each airport group
          arrivalAirports: [
            { $group: { 
              _id: '$arr_arp._id',
              count: { $sum: 1 }, 
              city: { $first: '$arr_arp.city' }, 
              country: { $first: '$arr_arp.country' } }
            }, // Count occurrences
            { $sort: { count: -1 } },

          ],  

          // Facet for grouped results by dates (dep_time)  
          dates: [  
            {  
              $group: {   
                _id: { $dateToString: { format: "%d-%m-%Y", date: "$dep_time" } },   
                count: { $sum: 1 }   
              }  
            },  
            { $sort: { _id: 1 } }, // Sort dates in ascending order  
          ],  
  
          // Facet for full filtered flight results  
          filteredFlights: [  
            { $project: { dep_time: 1, arr_time: 1, dep_arp: 1, arr_arp: 1, airline:1, plane:1, flight_number: 1 } }, // Fields to include  
          ],  
        },  
      },  
    ];  
  
    const results = await collection.aggregate(aggregationPipeline).toArray();  
  
    res.status(200).json(results[0]); // Only one document is returned by `$facet` 
    console.log('Results sent:');
    console.log(results[0]); 
  } catch (error) {  
    console.error('Error:', error);  
    res.status(500).json({ error: 'Internal Server Error', details: error.message });  
  }  
}  


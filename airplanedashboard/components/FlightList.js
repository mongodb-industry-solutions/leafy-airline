
import { useRouter } from 'next/router'; 
import styles from './GeneralStyle.module.css';

const SeparationBar = () => <hr className={styles.separationBar} />;

function FlightList({flights, sessionId}) {
    const router = useRouter(); 

    // console.log("Rendering FlightList with flights:", flights);

    const handleViewFlight = (flightId) => {
      // console.log("Viewing flight with ID:", flightId);

      // Include sessionId in a secure way using params
        // router.push(`/index1?flightId=${flightId}`); // Navigate to /index1 with the flightId query parameter
        router.push({
          pathname: '/index1',
          query: { flightId, sessionId }, // Pass both flight
        });
      };

    function FlightCard({index, flight_info}) {

      // console.log("Rendering flight:", flight_info);

      const departDate = new Date(flight_info.dep_time);
      const arrivalDate = new Date(flight_info.arr_time);

      const departTime = String(departDate.getUTCHours()).padStart(2, '0') + ':' + String(departDate.getUTCMinutes()).padStart(2, '0');
      const departDay = String(departDate.getUTCDate()).padStart(2, '0');
      const departMonth = String(departDate.getUTCMonth() + 1).padStart(2, '0'); // getUTCMonth() returns a zero-based index
      const departYear = departDate.getUTCFullYear();

      const arrivalTime = String(arrivalDate.getUTCHours()).padStart(2, '0') + ':' + String(arrivalDate.getUTCMinutes()).padStart(2, '0');
      const arrivalDay = String(arrivalDate.getUTCDate()).padStart(2, '0');
      const arrivalMonth = String(arrivalDate.getUTCMonth() + 1).padStart(2, '0');
      const arrivalYear = arrivalDate.getUTCFullYear();

      const formattedArrivalDate = `${arrivalDay}-${arrivalMonth}-${arrivalYear}`;
      const formattedDepartDate = `${departDay}-${departMonth}-${departYear}`;

        return <div 
            key={index} className={styles.resultItem}>
            <div><strong>Flight Number:</strong> {flight_info.flight_number}</div>
            <div><strong>Airline:</strong> {flight_info.airline}</div>
            <SeparationBar />
            <div><strong>Scheduled Departure:</strong> {departTime} ¦ {formattedDepartDate}</div>
            <div><strong>Scheduled Arrival:</strong> {arrivalTime} ¦ {formattedArrivalDate}</div>

            <div><strong>Departure Airport:</strong> {flight_info.dep_arp.city + ", " + flight_info.dep_arp.country }</div>
            <div><strong>Arrival Airport:</strong> {flight_info.arr_arp.city + ", " + flight_info.arr_arp.country }</div>
            <button onClick={() => handleViewFlight(flight_info._id)} className={styles.viewFlightButton}>View flight</button>
        </div>
        
        }

    return <div className={styles.resultsContainer}>
              {flights.length === 0 ? (
                <p>Oh, there are no available flights matching your criteria. Please try adjusting your filters.</p>
              ) : (
                flights.map((flight_info, index) => (
                  <FlightCard key={index} index={index} flight_info={flight_info} />
                ))
              )}
            </div>
  
  }
  
export default FlightList;
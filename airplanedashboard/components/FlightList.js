
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Import useRouter from next/router
import styles from './GeneralStyle.module.css';


function FlightList({flights}) {
    const router = useRouter(); // Initialize useRouter

    const handleViewFlight = (flightId) => {
      console.log("Viewing flight with ID:", flightId);
        router.push(`/index1?flightId=${flightId}`); // Navigate to /index1 with the flightId query parameter
      };

    function FlightCard({index, flight_info}) {

      const date = new Date(flight_info.dep_time);

      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // getUTCMonth() returns a zero-based index
      const year = date.getUTCFullYear();

      const formattedDate = `${day}-${month}-${year}`;

        return <div 
            key={index} className={styles.resultItem}>
            <div><strong>Airline:</strong> {flight_info.airline}</div>
            {/* Debugging : Add ID */}
            <div><strong>Flight ID:</strong> {flight_info._id}</div>
            <div><strong>Plane:</strong> {flight_info.plane}</div>
            <div><strong>Flight Date:</strong> {formattedDate}</div>
            <div><strong>Departure Airport:</strong> {flight_info.dep_arp.city + ", " + flight_info.dep_arp.country }</div>
            <div><strong>Arrival Airport:</strong> {flight_info.arr_arp.city + ", " + flight_info.arr_arp.country }</div>
            <button onClick={() => handleViewFlight(flight_info._id)} className={styles.viewFlightButton}>View flight</button>
        </div>
        
        }

    return <div className={styles.resultsContainer}>
              {flights.length === 0 ? (
                <p>Error: No flights available</p>
              ) : (
                flights.map((flight_info, index) => (
                  <FlightCard key={index} index={index} flight_info={flight_info} />
                ))
              )}
            </div>
  
  }
  
export default FlightList;

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Import useRouter from next/router
import styles from './Layout.module.css';


function FlightList({flights}) {
    const router = useRouter(); // Initialize useRouter

    const handleViewFlight = (flightId) => {
        router.push(`/index1?flightId=${flightId}`); // Navigate to /index1 with the flightId query parameter
      };

    function FlightCard({index, flight_info}) {

        return <div 
            key={index} className={styles.resultItem}>
            <div><strong>Airline:</strong> {flight_info.airline}</div>
            <div><strong>Plane:</strong> {flight_info.plane}</div>
            <div><strong>Departure Airport City:</strong> {flight_info.dep_arp?.city || 'N/A'}</div>
            <div><strong>Departure Airport Country:</strong> {flight_info.dep_arp?.country || 'N/A'}</div>
            <div><strong>Arrival Airport City:</strong> {flight_info.arr_arp?.city || 'N/A'}</div>
            <div><strong>Arrival Airport Country:</strong> {flight_info.arr_arp?.country || 'N/A'}</div>
            {/* Add more fields as needed */}
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
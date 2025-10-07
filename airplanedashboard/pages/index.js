// pages/index.js
import React from 'react';
import GeneralLayout from '../components/GeneralLayout';
import FlightList from '../components/FlightList';
import SearchBar from '../components/SearchBar';
import FilterSection from '../components/FilterSection';
import styles from '../components/GeneralStyle.module.css';
import { useState, useEffect } from 'react';

export default function Home() {

  // console.log("Rendering Home component with Simulation App URL:", process.env.NEXT_PUBLIC_SIMULATION_APP_URL);

  // New state for the flights
  const [flights, setFlights] = useState([]);
  const [dates, setDates] = useState([]);
  const [departureOptions, setDepartureOptions] = useState([]);
  const [arrivalOptions, setArrivalOptions] = useState([]);   
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create a unique session ID for the user
  const [sessionId, setSessionId] = useState(crypto.randomUUID());
  // useEffect(() => {
  //   const id = crypto.randomUUID();
  //   setSessionId(id);
  // }, []);

  const fetchData = async () => {
    try {

      // Fetch airports and dates with facets
      const facetsResponse = await fetch('/api/filters'); // Using the filters endpoint to get facets
      if (!facetsResponse.ok) {
        throw new Error('Network response was not ok for airports');
      }

      // Dates and airports fetched successfully
      const facetsData = await facetsResponse.json();
      console.log('Facets Data:', facetsData);

      // Extract dates and format to show count
      const datesData = facetsData.dates.map((date) => ({
        value: date._id,
        label: `${date._id} (${date.count} flights)`,
      }));
      setDates(datesData);

      // Extract and format departure and arrival airports
      const departureOptions = facetsData.departureAirports.map((airport) => ({
        value: airport._id,
        label: `${airport._id} - ${airport.city}, ${airport.country} (${airport.count} flights)`,
      }));
      const arrivalOptions = facetsData.arrivalAirports.map((airport) => ({
        value: airport._id,
        label: `${airport._id} - ${airport.city}, ${airport.country} (${airport.count} flights)`,
      }));

      setDepartureOptions(departureOptions);
      setArrivalOptions(arrivalOptions);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array ensures this runs only once

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <GeneralLayout>
      {/* Integrate the SearchBar component here */}
      <aside className={styles.sidebar}>
        <FilterSection response={flights} setResponse={setFlights} dates_list={dates} departureOptions={departureOptions} arrivalOptions={arrivalOptions} />
      </aside>
      <div className={styles.searchList}>
        <div className={styles.intro_container}>
          <h3>Dive In and Explore!</h3>
          <p>
           Welcome to the Leafy Airline Dashboard, where flight operations managers can effortlessly oversee and optimize flight data. 
           Powered by Next.js and MongoDB, our intuitive interface makes searching, filtering, and reviewing flight details a breeze.
           <br />
            
           <br />
           Begin your search right away or check out our <a href="/instructions">Instructions Tab</a> for a better understanding!
           </p>
        </div>
        <SearchBar response={flights} setResponse={setFlights}/>
        <div className={styles.flightsList}>
          <FlightList flights={flights} sessionId={sessionId} />
        </div>
      </div>
    </GeneralLayout>
  );
}

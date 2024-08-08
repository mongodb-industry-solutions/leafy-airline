// pages/index.js
import React from 'react';
import GeneralLayout from '../components/GeneralLayout';
import FlightList from '../components/FlightList';
import SearchBar from '../components/Searchbar';
import FilterSection from '../components/FilterSection';
import styles from '../components/Layout.module.css';
import { useState, useEffect } from 'react';

export default function Home() {

  // New state for the flights
  const [flights, setFlights] = useState([]);
  const [dates, setDates] = useState([]);
  const [airports , setAirports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      // Fetch dates
      const datesResponse = await fetch('/api/dates');
      if (!datesResponse.ok) {
        throw new Error('Network response was not ok for dates');
      }
      const datesData = await datesResponse.json();
      setDates(datesData);
      console.log('Dates fetched:', datesData);

      // Fetch airports
      const airportsResponse = await fetch('/api/airports');
      if (!airportsResponse.ok) {
        throw new Error('Network response was not ok for airports');
      }
      const airportsData = await airportsResponse.json();
      setAirports(airportsData);
      console.log('Airports fetched:', airportsData);

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
        <FilterSection response={flights} setResponse={setFlights} dates_list={dates} airports_list = {airports}/>
      </aside>
      <div className={styles.searchList}>
        {/* <SearchBar /> */}
        <SearchBar response={flights} setResponse={setFlights}/>
        <div className={styles.flightsList}>
          <FlightList flights={flights} />
        </div>
      </div>
    </GeneralLayout>
  );
}

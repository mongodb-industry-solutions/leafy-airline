// pages/index.js
import React from 'react';
import Layout from '../components/Layout';
import FlightList from '../components/FlightList';
import SearchBar from '../components/searchbar';
import FilterSection from '../components/FilterSection';
import styles from '../components/Layout.module.css';
import { useState, useEffect } from 'react';

export default function Home() {

  // New state for the flights
  const [flights, setFlights] = useState([]);
  const [dates, setDates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDates = async () => {
    try {
      const response = await fetch('/api/dates');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setDates(data);
      console.log('Dates fetched:', data);
    } catch (error) {
      console.error('Error fetching dates:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDates();
    }, []); // Empty dependency array ensures this runs only once

    if (loading) {
      return <div>Loading...</div>;
    }
    if (error) {
      return <div>Error: {error}</div>;
    }

  return (
    <Layout>
      {/* Integrate the SearchBar component here */}
      <aside className={styles.sidebar}>
        <FilterSection response={flights} setResponse={setFlights} dates_list={dates} />
      </aside>
      <div className={styles.searchList}>
        {/* <SearchBar /> */}
        <SearchBar response={flights} setResponse={setFlights}/>
        <div className={styles.flightsList}>
          <FlightList flights={flights} />
        </div>
      </div>
    </Layout>
  );
}

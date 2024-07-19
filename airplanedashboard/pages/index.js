// pages/index.js
import React from 'react';
import Layout from '../components/Layout';
import FlightList from '../components/FlightList';
import SearchBar from '../components/SearchBar';
import FilterSection from '../components/FilterSection';
import styles from '../components/Layout.module.css';
import { useState, useEffect } from 'react';

export default function Home() {

  // New state for the flights
  const [flights, setFlights] = useState([])

  return (
    <Layout>
      {/* Integrate the SearchBar component here */}
      <aside className={styles.sidebar}>
        <FilterSection response={flights} setResponse={setFlights} />
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

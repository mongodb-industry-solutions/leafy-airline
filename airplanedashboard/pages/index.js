// pages/index.js
import React from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/searchbar'; // Import the SearchBar component
import SearchBar2 from '../components/SearchBar2';
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
        <FilterSection state={flights} setter={setFlights} />
      </aside>
      <div className={styles.content}>
        {/* <SearchBar /> */}
        <SearchBar2 state={flights} setter={setFlights}/>
      </div>
    </Layout>
  );
}

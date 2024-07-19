// pages/index.js
import React from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/searchbar'; // Import the SearchBar component
import FilterSection from '../components/FilterSection';
import styles from '../components/Layout.module.css';

export default function Home() {
  return (
    <Layout>
      {/* Integrate the SearchBar component here */}
      <aside className={styles.sidebar}>
        <FilterSection/>
      </aside>
      <div className={styles.content}>
        <SearchBar />
      </div>
    </Layout>
  );
}

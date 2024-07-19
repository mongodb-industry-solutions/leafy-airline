// pages/index.js
import React from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/searchbar'; // Import the SearchBar component

export default function Home() {
  return (
    <Layout>
      {/* Integrate the SearchBar component here */}
      <SearchBar />
    </Layout>
  );
}

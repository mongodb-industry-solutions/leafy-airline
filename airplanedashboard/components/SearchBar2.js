// components/SearchBar.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Import useRouter from next/router
import styles from './Layout.module.css';

function SearchBar2({response, setResponse}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter(); // Initialize useRouter

  const fetchResults = async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setResults(data);
      setResponse(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(''); // Fetch all documents on component mount
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    fetchResults(query); // Fetch results based on query

    // Update general response state
    console.log('New response setted from SearchBar2')
  };

  const handleViewFlight = (flightId) => {
    router.push(`/index1?flightId=${flightId}`); // Navigate to /index1 with the flightId query parameter
  };

  return (
    <div className={styles.searchBar}>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for flights"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className={styles.error}>Error: {error}</p>}

      <div className={styles.resultsContainer}>
        {results.map((result, index) => (
          <div key={index} className={styles.resultItem}>
            <div><strong>Airline:</strong> {result.airline}</div>
            <div><strong>Plane:</strong> {result.plane}</div>
            <div><strong>Departure Airport City:</strong> {result.dep_arp?.city || 'N/A'}</div>
            <div><strong>Departure Airport Country:</strong> {result.dep_arp?.country || 'N/A'}</div>
            <div><strong>Arrival Airport City:</strong> {result.arr_arp?.city || 'N/A'}</div>
            <div><strong>Arrival Airport Country:</strong> {result.arr_arp?.country || 'N/A'}</div>
            {/* Add more fields as needed */}
            <button onClick={() => handleViewFlight(result._id)} className={styles.viewFlightButton}>View flight</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchBar2;

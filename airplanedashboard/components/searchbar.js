// components/SearchBar.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Import useRouter from next/router
import styles from './Layout.module.css';

function SearchBar({response, setResponse}) {
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

    </div>
  );
}

export default SearchBar;

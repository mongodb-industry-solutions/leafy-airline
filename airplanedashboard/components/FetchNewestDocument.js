// components/FetchNewestDocument.js

import { useEffect } from 'react';

const FetchNewestDocument = () => {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/fetchNewestDocument');
        const data = await response.json();
        console.log('Fetched Data:', data);
      } catch (error) {
        console.error('Error fetching the newest document:', error);
      }
    }, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return null;
};

export default FetchNewestDocument;

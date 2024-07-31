// pages/_app.js
import '../components/Layout.module.css'; 
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    console.log("useEffect in _app.js is running"); // Check this log in the browser console
    const startSocket = async () => {
      try {
        const response = await fetch('/api/socket1');
        if (response.ok) {
          console.log('Socket.IO and change stream initialized.');
        } else {
          console.error('Failed to initialize Socket.IO and change stream. Status:', response.status);
        }
      } catch (error) {
        console.error('Error initializing Socket.IO and change stream:', error);
      }

      try {
        const response1 = await fetch('/api/socket');
        if (response1.ok) {
          console.log('Socket.IO and change stream initialized.');
        } else {
          console.error('Failed to initialize Socket.IO and change stream. Status:', response.status);
        }
      } catch (error) {
        console.error('Error initializing Socket.IO and change stream:', error);
      }
    };
    startSocket();
  }, []);
  return <Component {...pageProps} />;
}

export default MyApp;


// pages/index1.js
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Layout.module.css';
import Logo from '@leafygreen-ui/logo';

const Layout1 = ({ children }) => {
  const router = useRouter();
  const { flightId } = router.query; // Get flightId from query parameters
  const [flightData, setFlightData] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/flights');
        const data = await res.json();
        setFlightData(data);

        if (flightId) {
          console.log('Flight ID from query:', flightId);
          const flight = data.find(flight => flight._id && flight._id.toString() === flightId.toString());
          if (flight) {
            setSelectedFlight(flight);
          } else {
            console.error('No flight found with ID:', flightId);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, [flightId]); // Re-fetch data when flightId changes

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.flightInfo}>
          <h1 className={styles.headerText}>
            <span className={styles.flightIdGreen}>Flight ID: </span>
            <span className={styles.flightIdBlack}>{selectedFlight ? selectedFlight._id : 'Loading...'}</span>
          </h1>
          <h2 className={styles.subHeader}>Flight Information & Route Optimization</h2>
        </div>
        <Logo className={styles.logo} />
      </header>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link href="/" passHref legacyBehavior>
              <a className={`${styles.navLink} ${router.pathname === '/' ? styles.activeLink : ''}`}>Flights</a>
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/index1" passHref legacyBehavior>
              <a className={`${styles.navLink} ${router.pathname === '/index1' ? styles.activeLink : ''}`}>Flight Overview</a>
            </Link>
          </li>
        </ul>
      </nav>
      <div className={styles.main}>
        <div className={styles.content}>
          {/* Flight Overview Box */}
          <div className={styles.flightOverviewBox}>
            <h3>Flight Overview</h3>
            {selectedFlight ? (
              <div className={styles.innerBox}>
                <h4>{`${selectedFlight.dep_arp.city} - ${selectedFlight.arr_arp.city}`}</h4>
                <p>{`${new Date(selectedFlight.dep_time).toLocaleTimeString()} - ${new Date(selectedFlight.arr_time).toLocaleTimeString()}`}</p>
                <div className={styles.innerBox1}>
                  <p>Delay: {selectedFlight.delay_time ? `${selectedFlight.delay_time} minutes` : 'No delay'}</p>
                </div>
              </div>
            ) : (
              <p>Loading flight details...</p>
            )}
          </div>
          {/* Main Content */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout1;

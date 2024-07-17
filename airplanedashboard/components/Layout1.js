import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Layout.module.css';
import Logo from '@leafygreen-ui/logo';

const Layout1 = ({ children }) => {
  const router = useRouter();
  const [flightData, setFlightData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/flights');
        const data = await res.json();
        setFlightData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.flightInfo}>
          <h1 className={styles.headerText}>
            <span className={styles.flightIdGreen}>Flight ID: </span>
            <span className={styles.flightIdBlack}>991345</span>
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
            {flightData.map((flight, index) => (
              <div key={index} className={styles.innerBox}>
                <h4>{`${flight.dep_arp.city} - ${flight.arr_arp.city}`}</h4>
                <p>{`${new Date(flight.dep_time).toLocaleTimeString()} - ${new Date(flight.arr_time).toLocaleTimeString()}`}</p>
              </div>
            ))}
            {flightData.map((flight, index) => (
              <div key={index} className={styles.innerBox1}>
                <p>Delay: {flight.delay_time ? `${flight.delay_time} minutes` : 'No delay'}</p>
              </div>
            ))}
          </div>
          {/* Main Content */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout1;


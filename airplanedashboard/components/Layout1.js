import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Layout.module.css';
import Logo from '@leafygreen-ui/logo';

const Layout1 = ({ children }) => {
  const router = useRouter();

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
            <div className={styles.innerBox}>
                <h4>MAD - VLC</h4>
                <p>10:30-12:30</p>
            </div>
            <div className={styles.innerBox1}>
                <h4>MAD - VLC</h4>
                <p>10:30-12:30</p>
            </div>
          </div>
          {/* Main Content */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout1;

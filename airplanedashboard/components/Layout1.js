// components/Layout1.js
import React from 'react';
import styles from './Layout.module.css';
import Logo from '@leafygreen-ui/logo';

const Layout1 = ({ children }) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.flightInfo}>
          <h1>
            <span className={styles.flightIdGreen}>Flight ID: </span>
            <span className={styles.flightIdBlack}>991345</span>
          </h1>
          <h2 className={styles.subHeader}>Flight Information & Route Optimization</h2>
        </div>
        <Logo className={styles.logo} />
      </header>
      <div className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout1;

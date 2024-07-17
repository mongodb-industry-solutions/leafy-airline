// components/Layout1.js
import React from 'react';
import styles from './Layout.module.css';
import Logo from '@leafygreen-ui/logo';

const Layout1 = ({ children }) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Flight ID: 991345</h1>
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

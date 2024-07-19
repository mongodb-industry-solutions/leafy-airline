import React from 'react';
import styles from './Layout.module.css';
import Logo from '@leafygreen-ui/logo';
import Icon from "@leafygreen-ui/icon";

const Layout = ({ children }) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.icon_container}>
            <Icon glyph='Person' fill="#00684A" size='xlarge'/>
            <span>Flight Operations Manager</span>
        </div>
        <h1>Leafy Airline Dashboard</h1>
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

export default Layout;

import React from 'react';
import styles from './Layout.module.css';
import headerStyles from './Header.module.css'; // Import the new header CSS file
import Logo from '@leafygreen-ui/logo';
import Icon from "@leafygreen-ui/icon";

const Layout = ({ children }) => {
  return (
    <div className={styles.container}>
      <header className={headerStyles.header}>
        <div className={headerStyles.logo_container}>
          <Logo className={headerStyles.logo} />
        </div>
        <div className={headerStyles.title_container}>
          <h1>Leafy Airline Dashboard</h1>
        </div>
        <div className={styles.rightheaderContainer}>
          <a href="/instructions" className={headerStyles.infoButton}>Instructions of Use</a>
          <div className={headerStyles.icon_container}>
            <Icon glyph='Person' fill="#00684A" size='xlarge'/>
            <span>Flight Operations Manager</span>
          </div>
        </div>
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

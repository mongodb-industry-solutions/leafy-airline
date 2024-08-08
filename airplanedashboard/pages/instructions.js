// pages/instructions.js
import React from 'react';
import { useRouter } from 'next/router';
import styles from '../components/Instructions.module.css';
import ExpandableCard from "@leafygreen-ui/expandable-card";
import Banner from '@leafygreen-ui/banner';

export default function Instructions() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className={styles.generalContainer}>
      <div className={styles.contentContainer}>
        <button onClick={handleBack} className={styles.backButton}>
          Back
        </button>
        <div className={styles.textContainer}>
          <h1>Getting Started: Leafy Air Dashboard</h1>

          <div className={styles.nothighlightSection}>
            <h2>Overview</h2>
            <p>
              The Leafy Airline Dashboard is designed for <strong>flight operations managers</strong> to efficiently manage and monitor flight information.<br />
              The application is built using <strong>Next.js and MongoDB</strong>, providing a user-friendly interface for searching, filtering, and viewing detailed flight information.
            </p>
            <br/>
          </div>

          <div className={styles.highlightSection}>
            <h2>Before we start : Components </h2>
            <div className={styles.componentBox}>
            <br/>
              <ExpandableCard
                className={styles.expandableCard}
                title={<span style={{ fontFamily: 'Lexend Deca, sans-serif', fontSize: '17px', fontWeight: 'bold' }}>General Overview Tab</span>}
                description={<span style={{ fontFamily: 'Lexend Deca, sans-serif', fontSize: '12px' }}>This is the landing page where you can get a summary of flights, including quick access to various functions such as searching and filtering flights.</span>}
                darkMode={false}>
                  <p><strong>Filter Selection & SearchBar: </strong> These tools allow you to refine your search based on different criteria such as flight date, departure and arrival times, and locations</p>
                  <p><strong>Flight Cards: </strong> This cards will display the basic information for each of the flights that meet the selected filters<br /></p>
              </ExpandableCard>
              <br/>
              <ExpandableCard
                className={styles.expandableCard}
                title={<span style={{ fontFamily: 'Lexend Deca, sans-serif', fontSize: '17px', fontWeight: 'bold' }}>Flight Information Tab</span>}
                description={<span style={{ fontFamily: 'Lexend Deca, sans-serif', fontSize: '12px' }}>This section displays detailed information about flights. You can view flights, sort them, and access specific details.</span>}
                darkMode={false}>
                  <p><strong>Simulation Controls: </strong> These controls enable you to start and reset flight simulations to analyze various flight scenarios.</p>
              </ExpandableCard>
              <br/>
            </div>
          </div>

          <div className={styles.nothighlightSection}>
          <h2>1. General Overview Tab </h2>
            <p>Upon logging in, you will be directed to the main dashboard. Moreover, one can use the search bar at the top of the page to find specific flights. Filtering options include: </p>
                <div className={styles.highlightSection}>
                <ul>
                  <li>Flight Date</li>
                  <li>Departure Time</li>
                  <li>Arrival Time</li>
                  <li>Departure Location</li>
                  <li>Arrival Airport Location</li>
                </ul>
                </div>
            </div>

          <div className={styles.nothighlightSection}>
            <h2>2. How to Use the Flight Information Tab</h2>
            <ul className={styles.instructionList}>
              <li className={styles.instructionBox}>
                <h4>Viewing Flight Overview</h4>
                <p>
                  Upon selecting a flight, you will see detailed information about it. This includes departure and arrival cities, times, and any potential delays or costs associated with the flight.
                </p>
              </li>
              <li className={styles.instructionBox}>
                <h4>Using the Simulation Controls</h4>
                <p>
                  The simulation controls at the bottom of the page allow you to start, pause, or reset the flight simulation. Use the following buttons to control the flight simulation:
                </p>
                <ul>
                  <li><strong>Start Simulation:</strong> Click this button to start the simulation for the flight.</li>
                  <li><strong>Reset Simulation:</strong> Click this button to reset the simulation to its initial state.</li>
                </ul>
                <Banner variant='warning' className={styles.bannerWarning}> <strong>Important!</strong> The simulation will take some seconds to begin, please be patient. </Banner>
              </li>

              <li className={styles.instructionBox}>
                <h4>Checking Delay and Cost Details</h4>
                <p>
                  The tab displays the delay time (if any) and associated costs, such as delay cost and fuel cost. This information is updated in real-time based on the simulation data.
                </p>
              </li>
              <li className={styles.instructionBox}>
                <h4>Viewing the Flight Path on the Map</h4>
                <p>
                  The Google Map on this tab shows the flight path, including markers for the departure and arrival locations.<br/>The airplane's current position and flight path are updated as the simulation progresses.
                </p>
              </li>
              <li className={styles.instructionBox}>
                <h4>Navigating Between Tabs</h4>
                <p>
                  Use the navigation links to switch between the Flight Overview tab and other sections of the dashboard. This allows you to seamlessly explore different functionalities and information.
                </p>
              </li>
            </ul>
          </div>

          <div className={styles.highlightSection}>
            <h2>Additional Tips & Comments</h2>
            <ul>
              <li><strong>Regular Updates:</strong> Ensure your browser is up-to-date for the best experience.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


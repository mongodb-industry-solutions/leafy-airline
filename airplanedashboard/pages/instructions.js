// pages/instructions.js
import React from 'react';
import { useRouter } from 'next/router';
import styles from '../components/instructions.module.css';

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
          <h1>Getting Started: Leafy Airline Dashboard</h1>

          <div className={styles.highlightSection}>
            <h2>Overview</h2>
            <p>
              The Leafy Airline Dashboard is designed for flight operations managers to efficiently manage and monitor flight information.
              The application is built using Next.js and MongoDB, providing a user-friendly interface for searching, filtering, and viewing detailed flight information.
            </p>
          </div>

          <div className={styles.highlightSection}>
            <h2>Accessing the Dashboard</h2>
            <ol>
              <li><strong>Open the Application:</strong> Launch the Leafy Airline Dashboard in your web browser.</li>
            </ol>
          </div>

          <div className={styles.highlightSection}>
            <h2>Main Dashboard - Flights Overview</h2>
            <ol>
              <li><strong>Flight Information Tab:</strong> Upon logging in, you will be directed to the main dashboard.</li>
              <li><strong>Search and Filter:</strong> Use the search bar at the top of the page to find specific flights. You can filter flights by:
                <ul>
                  <li>Flight Date</li>
                  <li>Departure Time</li>
                  <li>Arrival Time</li>
                  <li>Departure Location</li>
                  <li>Arrival Airport Location</li>
                </ul>
              </li>
            </ol>
          </div>

          <div className={styles.highlightSection}>
            <h2>Viewing Detailed Flight Information</h2>
            <ol>
              <li><strong>Select a Flight:</strong> Click on the "View Flight" button next to the flight you are interested in. This will take you to the flight detail page.</li>
            </ol>
          </div>

          <div className={styles.highlightSection}>
            <h2>Flight Detail Page</h2>
            <p>
              This section provides detailed information about the selected flight, including:
            </p>
            <ul>
              <li>Departure City</li>
              <li>Arrival City</li>
              <li>Departure Time</li>
              <li>Arrival Time</li>
              <li>Arrival Delay Time</li>
              <li>Flight Delay Cost</li>
              <li>Fuel Cost</li>
            </ul>
            <p>
              On the right side of the page, a Google Map API will display the departure and arrival cities for the selected flight.
            </p>
          </div>

          <div className={styles.highlightSection}>
            <h2>Simulation Controls</h2>
            <p>
              Use the following buttons to control the flight simulation:
            </p>
            <ul>
              <li><strong>Start Simulation:</strong> Click this button to start the simulation for the flight.</li>
              <li><strong>Pause Simulation:</strong> Click this button to pause the simulation.</li>
              <li><strong>Reset Simulation:</strong> Click this button to reset the simulation to its initial state.</li>
            </ul>
          </div>

          <div className={styles.highlightSection}>
            <h2>Navigation</h2>
            <p>
              At the bottom of the flight detail page, there is a toggle button that will take you back to the main dashboard (first page) where you can search and filter other flights.
            </p>
          </div>

          <div className={styles.highlightSection}>
            <h2>Additional Tips</h2>
            <ul>
              <li><strong>Regular Updates:</strong> Ensure your browser is up-to-date for the best experience.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


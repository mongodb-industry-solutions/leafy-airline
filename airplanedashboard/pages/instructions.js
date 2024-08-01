// pages/instructions.js
import React from 'react';
import { useRouter } from 'next/router';
import styles from '../components/Backbutton.module.css';

const fontStyle = {
  fontFamily: 'Lexend Deca, sans-serif',
};

export default function Home() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className={styles.container}>
      <button onClick={handleBack} className={styles.backButton}>
        Back
      </button>
      <div className={styles.textContainer}>
        <h1 style={fontStyle}>Instructions for Using the Leafy Airline Dashboard</h1>
        
        <h2 style={fontStyle}>Overview</h2>
        <p style={fontStyle}>
          The Leafy Airline Dashboard is designed for flight operations managers to efficiently manage and monitor flight information.
          The application is built using Next.js and MongoDB, providing a user-friendly interface for searching, filtering, and viewing detailed flight information.
        </p>

        <h2 style={fontStyle}>Accessing the Dashboard</h2>
        <ol style={fontStyle}>
          <li><strong>Open the Application:</strong> Launch the Leafy Airline Dashboard in your web browser.</li>
        </ol>

        <h2 style={fontStyle}>Main Dashboard - Flights Overview</h2>
        <ol style={fontStyle}>
          <li><strong>Flight Information Tab:</strong> Upon logging in, you will be directed to the main dashboard.</li>
          <li><strong>Search and Filter:</strong> Use the search bar at the top of the page to find specific flights. You can filter flights by:
            <ul style={fontStyle}>
              <li>Flight Date</li>
              <li>Departure Time</li>
              <li>Arrival Time</li>
              <li>Departure Location</li>
              <li>Arrival Airport Location</li>
            </ul>
          </li>
        </ol>

        <h2 style={fontStyle}>Viewing Detailed Flight Information</h2>
        <ol style={fontStyle}>
          <li><strong>Select a Flight:</strong> Click on the "View Flight" button next to the flight you are interested in. This will take you to the flight detail page.</li>
        </ol>

        <h2 style={fontStyle}>Flight Detail Page</h2>
        <p style={fontStyle}>
          This section provides detailed information about the selected flight, including:
        </p>
        <ul style={fontStyle}>
          <li>Departure City</li>
          <li>Arrival City</li>
          <li>Departure Time</li>
          <li>Arrival Time</li>
          <li>Arrival Delay Time</li>
          <li>Flight Delay Cost</li>
          <li>Fuel Cost</li>
        </ul>
        <p style={fontStyle}>
          On the right side of the page, a Google Map API will display the departure and arrival cities for the selected flight.
        </p>

        <h2 style={fontStyle}>Simulation Controls</h2>
        <p style={fontStyle}>
          Use the following buttons to control the flight simulation:
        </p>
        <ul style={fontStyle}>
          <li><strong>Start Simulation:</strong> Click this button to start the simulation for the flight.</li>
          <li><strong>Pause Simulation:</strong> Click this button to pause the simulation.</li>
          <li><strong>Reset Simulation:</strong> Click this button to reset the simulation to its initial state.</li>
        </ul>

        <h2 style={fontStyle}>Navigation</h2>
        <p style={fontStyle}>
          At the bottom of the flight detail page, there is a toggle button that will take you back to the main dashboard (first page) where you can search and filter other flights.
        </p>

        <h2 style={fontStyle}>Additional Tips</h2>
        <ul style={fontStyle}>
          <li><strong>Regular Updates:</strong> Ensure your browser is up-to-date for the best experience.</li>
        </ul>
      </div>
    </div>
  );
}
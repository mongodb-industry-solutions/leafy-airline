'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Layout.module.css'; // Ensure this path is correct
import Logo from '@leafygreen-ui/logo';
import Button from '@leafygreen-ui/button';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
const app_url = "http://127.0.0.1:8000/"

const Layout1 = ({ children }) => {
  const router = useRouter();
  const { flightId } = router.query; // Get flightId from query parameters
  const [flightData, setFlightData] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    async function fetchApiKey() {
      try {
        const res = await fetch('/api/googleMapsKey');
        const data = await res.json();
        setApiKey(data.apiKey);
      } catch (error) {
        console.error('Error fetching API key:', error);
      }
    }
    fetchApiKey();
  }, []);

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


  const startSimulation = async () => {
    console.log('Starting sim');

    const start_url = app_url + "start-scheduler";
    const app_data = {'flight_id' : flightId,
             'dep_code': selectedFlight.dep_arp._id ,
             'arr_code' : selectedFlight.arr_arp._id ,
             'dep_loc' : [selectedFlight.dep_arp.geo_loc.lat, selectedFlight.dep_arp.geo_loc.long],
             'arr_loc' : [selectedFlight.arr_arp.geo_loc.lat, selectedFlight.arr_arp.geo_loc.long]};

    try {
      const response = await fetch(start_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(app_data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error starting process:', error);
    }

    return
  };

  const pauseSimulation = async () => {
    const stop_url = app_url + "pause-scheduler"

    try {
      const response = await fetch(stop_url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error starting process:', error);
    }

    return
  };

  const resetSimulation = async () => {
    const reset_url = app_url + "reset-scheduler"

    try {
      const response = await fetch(reset_url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error starting process:', error);
    }

    return
  };

  // Assuming you have latitude and longitude in selectedFlight data
  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  // Coordinates for the departure and arrival points
  const depCoords = {
    lat: selectedFlight ? selectedFlight.dep_arp.geo_loc.lat : 0,
    lng: selectedFlight ? selectedFlight.dep_arp.geo_loc.long : 0
  };

  const arrCoords = {
    lat: selectedFlight ? selectedFlight.arr_arp.geo_loc.lat : 0,
    lng: selectedFlight ? selectedFlight.arr_arp.geo_loc.long : 0
  };

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
        <div className={styles.containersecond}>
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

          {/* Google Map Component */}
          <div className={styles.mapContainer}>
            {apiKey ? (
              <LoadScript googleMapsApiKey={apiKey}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={depCoords} // Center map on departure point
                  zoom={5}
                >
                  {/* Departure Marker */}
                  {selectedFlight && (
                    <>
                      <Marker
                        position={depCoords}
                        label={`Departure: ${selectedFlight.dep_arp.city}`}
                      />
                      <Marker
                        position={arrCoords}
                        label={`Arrival: ${selectedFlight.arr_arp.city}`}
                      />
                      {/* Line between departure and arrival */}
                      <Polyline
                        path={[depCoords, arrCoords]}
                        options={{
                          strokeColor: '#FF0000',
                          strokeOpacity: 1.0,
                          strokeWeight: 2
                        }}
                      />
                    </>
                  )}
                </GoogleMap>
              </LoadScript>
            ) : (
              <p>Loading map...</p>
            )}
          </div>
        </div>
        {/* Main Content */}
        {children}
      </div>
    </div>
  );
};

export default Layout1;

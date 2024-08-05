'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Layout.module.css'; // Ensure this path is correct
import Logo from '@leafygreen-ui/logo';
import Button from '@leafygreen-ui/button';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import io from 'socket.io-client'; // Import socket.io-client
import PlaneIcon from '../public/plane-solid.svg';

// const app_url = "http://127.0.0.1:8000/";
// const app_url = "https://simulation-app-freeaccess-65jcrv6puq-ew.a.run.app/"
const app_url = "https://simulation-app-final-65jcrv6puq-ew.a.run.app/"

const Layout1 = ({ children }) => {
  const router = useRouter();
  const { flightId } = router.query; // Get flightId from query parameters
  const [flightData, setFlightData] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [delayTime, setDelayTime] = useState(null); // State for Delay_Time
  const [delayCost, setDelayCost] = useState(null); // State for Delay_Cost
  const [fuelCostPerHour, setFuelCostPerHour] = useState(null); // State for Fuel_Cost_per_Hour
  const [airplanePosition, setAirplanePosition] = useState(null);
  const [flightPath, setFlightPath] = useState([]);
  const [fetchingStarted, setFetchingStarted] = useState(false); // State to manage fetching delay

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
  }, [flightId]);

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(); // Connect to the WebSocket server

    socket.on('alert', (alert) => {
      console.log('Alert received:', alert);
      if (alert && alert.Delay_Time !== undefined) {
        setDelayTime(Math.round(alert.Delay_Time)); // Round the delay time before setting it
      }
      if (alert && alert.Delay_Cost !== undefined) {
        setDelayCost(alert.Delay_Cost); // Set the delay cost
      }
      if (alert && alert.Fuel_Cost_per_Hour !== undefined) {
        setFuelCostPerHour(alert.Fuel_Cost_per_Hour); // Set the fuel cost per hour
      }
      //if (alert && alert.Latitude !== undefined && alert.Longitude !== undefined) {
       // const position = { lat: alert.Latitude, lng: alert.Longitude };
       // setAirplanePosition(position); // Update the airplane position
       // setFlightPath(prevPath => [...prevPath, position]); // Append to flight path
     //}
    });
    return () => {
      socket.off('alert');
    };
  }, []);

  useEffect(() => {
    if (!fetchingStarted) return;

    // Fetch the newest document every 5 seconds for position updates
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/fetchNewestDocument');
        const data = await response.json();
        console.log('Fetched Data:', data);
        if (data && data.mostRecentLat !== undefined && data.mostRecentLong !== undefined) {
          const position = { lat: data.mostRecentLat, lng: data.mostRecentLong };
          setAirplanePosition(position); // Update the airplane position
          setFlightPath(prevPath => [...prevPath, position]); // Append to flight path
        }
      } catch (error) {
        console.error('Error fetching the newest document:', error);
      }
    }, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [fetchingStarted]);

  const startSimulation = async () => {
    console.log('Starting sim');

    const start_url = app_url + "start-scheduler";
    const app_data = {
      'flight_id': flightId,
      'dep_code': selectedFlight.dep_arp._id,
      'arr_code': selectedFlight.arr_arp._id,
      'dep_loc': [selectedFlight.dep_arp.geo_loc.lat, selectedFlight.dep_arp.geo_loc.long],
      'arr_loc': [selectedFlight.arr_arp.geo_loc.lat, selectedFlight.arr_arp.geo_loc.long]
    };

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

      // Trigger Aggregation API after starting the simulation
      const aggregationResponse = await fetch('/api/aggregate', { method: 'POST' });
      if (aggregationResponse.ok) {
        console.log('Aggregation triggered successfully.');
      } else {
        console.error('Failed to trigger aggregation. Status:', aggregationResponse.status);
      }

      // Delay the start of fetching newest document
      setTimeout(() => {
        setFetchingStarted(true);
      }, 10000); // 10 seconds delay

    } catch (error) {
      console.error('Error starting process:', error);
    }
  };

  const resetSimulation = async () => {
    const reset_url = app_url + "reset-scheduler";

    try {
      const response = await fetch(reset_url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log(data);
      
      // Clear flight path and stop fetching
      setFlightPath([]);
      setFetchingStarted(false);

      // Move airplane to departure position
      if (selectedFlight) {
        const departurePosition = {
          lat: selectedFlight.dep_arp.geo_loc.lat,
          lng: selectedFlight.dep_arp.geo_loc.long
        };
        setAirplanePosition(departurePosition); // Reset airplane position
      }
    } catch (error) {
      console.error('Error resetting process:', error);
    }
  };

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

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
              <a className={`${styles.navLink} ${router.pathname === '/' ? styles.activeLink : ''}`} onClick={resetSimulation}>Flights</a>
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
              <>
                <div className={styles.innerBox}>
                  <h4>{`${selectedFlight.dep_arp.city} - ${selectedFlight.arr_arp.city}`}</h4>
                  <p>{`${new Date(selectedFlight.dep_time).toLocaleTimeString()} - ${new Date(selectedFlight.arr_time).toLocaleTimeString()}`}</p>
                </div>
                <div className={delayTime !== null ? styles.delayBox : styles.noDelayBox}>
                  <p>Delay: {delayTime !== null ? `${delayTime * 60} minutes` : 'No delay'}</p>
                </div>
                <div className={styles.costContainer}>
                  <div className={styles.costBox}>
                    <h4>Delay Cost</h4>
                    <p>{delayCost !== null ? `$${delayCost.toFixed(2)}` : 'Simulation not Started'}</p>
                  </div>
                  <div className={styles.costBox}>
                    <h4>Fuel Cost</h4>
                    <p>{fuelCostPerHour !== null ? `$${fuelCostPerHour.toFixed(2)}` : 'Simulation not Started'}</p>
                  </div>
                </div>
              </>
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
                  center={airplanePosition || depCoords} // Center map on airplane position or departure point
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
                      {/* Airplane Marker */}
                      {airplanePosition && (
                        <Marker
                          position={airplanePosition}
                          icon={{
                            url: '/plane-solid.svg',
                            scaledSize: new google.maps.Size(32, 32), // Adjust size as needed
                          }}
                          /*label="Airplane"*/
                        />
                      )}
                      {/* Polyline for flight path */}
                      <Polyline
                        path={flightPath}
                        options={{
                          strokeColor: '#023430',
                          strokeOpacity: 0.8,
                          strokeWeight: 2,
                          icons: [{
                            icon: { path: google.maps.SymbolPath.FORWARD_OPEN_ARROW },
                            offset: '100%',
                            repeat: '20px'
                          }]
                        }}
                      />
                    </>
                  )}
                </GoogleMap>
              </LoadScript>
            ) : (
              <p>Loading map...</p>
            )}

            <div className={styles.simulationbuttonSection}>
              <Button className={styles.simulationButton} children='Start Simulation' onClick={startSimulation}></Button>
              <Button className={styles.reset_simulationButton} children='Reset Simulation' onClick={resetSimulation}></Button>
            </div>
          </div>
        </div>
        {/* Main Content */}
        {children}
      </div>
    </div>
  );
};

export default Layout1;

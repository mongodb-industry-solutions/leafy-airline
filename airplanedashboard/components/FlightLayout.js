'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './Layout.module.css'; // Ensure this path is correct
import footerStyles from './Footer.module.css';
import Logo from '@leafygreen-ui/logo';
import Button from '@leafygreen-ui/button';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import io from 'socket.io-client'; // Import socket.io-client
import PlaneIcon from '../public/plane-solid.svg';
import Image from 'next/image';
import Banner from '@leafygreen-ui/banner';


const app_url = "https://simulation-app-final-65jcrv6puq-ew.a.run.app/";

const FlightLayout = ({ children }) => {
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
  const [loading, setLoading] = useState(false); // State for loading
  const [prevAirplanePosition, setPrevAirplanePosition] = useState(null);
  const [totalExpectedFuelCost, setTotalExpectedFuelCost] = useState(null);
  const [sumCost, setSumCost] = useState(null);

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
        setDelayTime(alert.Delay_Time); // Round the delay time before setting it
      }
      if (alert && alert.Delay_Cost !== undefined) {
        setDelayCost(alert.Delay_Cost); // Set the delay cost
      }
      if (alert && alert.Fuel_Cost_per_Hour !== undefined) {
        setFuelCostPerHour(alert.Fuel_Cost_per_Hour); // Set the fuel cost per hour
        setTotalExpectedFuelCost(prev => prev === null ? alert.Fuel_Cost_per_Hour : prev);
      }
    });
    return () => {
      socket.off('alert');
    };
  }, []);

  const calculateHeading = (from, to) => {
    const lat1 = from.lat * Math.PI / 180;
    const lon1 = from.lng * Math.PI / 180;
    const lat2 = to.lat * Math.PI / 180;
    const lon2 = to.lng * Math.PI / 180;

    const dLon = lon2 - lon1;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    const heading = Math.atan2(y, x) * 180 / Math.PI;
    return (heading + 360) % 360; // Normalize to 0-360
  };

  useEffect(() => {
    if (totalExpectedFuelCost !== null && delayCost !== null) {
      setSumCost(totalExpectedFuelCost + delayCost);
    } else if (totalExpectedFuelCost !== null) {
      setSumCost(totalExpectedFuelCost);
    } else if (delayCost !== null) {
      setSumCost(delayCost);
    } else {
      setSumCost(null);
    }
  }, [totalExpectedFuelCost, delayCost]);
  

  useEffect(() => {
    if (!fetchingStarted) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/fetchNewestDocument');
        const data = await response.json();
        console.log('Fetched Data:', data);
        if (data && data.mostRecentLat !== undefined && data.mostRecentLong !== undefined) {
          const newPosition = { lat: data.mostRecentLat, lng: data.mostRecentLong };

          if (prevAirplanePosition) {
            const heading = calculateHeading(prevAirplanePosition, newPosition);
            setAirplanePosition({ ...newPosition, heading });
          } else {
            setAirplanePosition(newPosition);
          }

          setFlightPath(prevPath => [...prevPath, newPosition]); // Append to flight path
          setPrevAirplanePosition(newPosition); // Update previous position
        }
      } catch (error) {
        console.error('Error fetching the newest document:', error);
      }
    }, 2500); // Fetch every 2.5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [fetchingStarted, prevAirplanePosition]);

  const getAirplaneIcon = () => {
    if (airplanePosition) {
      const { heading } = airplanePosition;
      if (heading >= 240 && heading < 300) { // Example range for heading towards West
        return '/plane-solid_west.svg'; // URL for westward plane icon
      }
    }
    return '/plane-solid.svg'; // URL for default plane icon
  };

  const startSimulation = async () => {
    setLoading(true); // Set loading to true
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
        setLoading(false); // Set loading to false after delay
      }, 3000); // 3 seconds delay

    } catch (error) {
      console.error('Error starting process:', error);
      setLoading(false); // Set loading to false if there is an error
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

      // Reset delay, delay cost, and fuel cost
      setDelayTime(null);
      setDelayCost(null);
      setFuelCostPerHour(null);
      setTotalExpectedFuelCost(null);
    } catch (error) {
      console.error('Error resetting process:', error);
    }
  };

  const handleBackClick = () => {
    resetSimulation();
    router.push('/');
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
          <h1 className={styles.flightID}>
            <span className={styles.flightIdGreen}>Flight ID: </span>
            <span className={styles.flightIdBlack}>{selectedFlight ? selectedFlight.flight_number : 'Loading...'}</span>
          </h1>
          <h2 className={styles.subHeader}>Flight Information & Route Optimization</h2>
        </div>
        {/*<Logo className={styles.logo} />*/}
        {/*<Image
          src="/leafylogo.svg" // Path to your SVG in the public directory
          alt="Leafy Logo"
          width={100} // Specify the width of the image
          height={50} // Specify the height of the image
          className={styles.logo} // Apply any relevant styles
        />*/}
      </header>
      <nav className={styles.nav}>
        <button className={styles.greenButton} onClick={handleBackClick}>
          <span className={styles.arrowIcon}>&larr;</span> Back to Flights
        </button>
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
                <div className={delayTime === 0 || delayTime === null ? styles.noDelayBox : styles.delayBox}>
                  <p>Delay: {delayTime === 0 || delayTime === null ? 'No delay' : `${(delayTime * 60).toFixed(2)} minutes`}</p>
                </div>

                <div className={styles.costContainer}>
                  <div className={styles.costBox}>
                    <h4>Delay Cost</h4>
                    <p>{delayCost !== null ? `$${delayCost.toFixed(2)}` : 'Simulation not Started'}</p>
                  </div>
                  <div className={styles.costBox}>
                    <h4>Fuel Cost until Arrival</h4>
                    <p>{fuelCostPerHour !== null ? `$${fuelCostPerHour.toFixed(2)}` : 'Simulation not Started'}</p>
                  </div>
                </div>
                <div className={styles.innerBoxTotalCosts}>
                    <p> Total Expected Fuel Cost: {totalExpectedFuelCost !== null ? `$${totalExpectedFuelCost.toFixed(2)}` : 'Simulation not started'}</p>
                </div>
                <div className={styles.innerBoxTotalCosts}>
                  <p>Total Expected Cost: {sumCost !== null ? `$${sumCost.toFixed(2)}` : 'Simulation not started'}</p>
                </div>
              </>
            ) : (
              <p>Loading flight details...</p>
            )}
          </div>

          {/* Google Map Component */}
          <div className={styles.mapContainer}>
          {apiKey ? (
          <div style={{ position: 'relative', width: '100%', height: '85%' }}>
            <LoadScript googleMapsApiKey={apiKey}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={airplanePosition || depCoords}
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
                    <Polyline
                      path={[depCoords, arrCoords]}
                      options={{
                        strokeColor: '#FF0000',
                        strokeOpacity: 1.0,
                        strokeWeight: 2
                      }}
                    />
                    {airplanePosition && (
                      <Marker
                        position={airplanePosition}
                        icon={{
                          url: getAirplaneIcon(),
                          scaledSize: new google.maps.Size(32, 32),
                        }}
                      />
                    )}
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
            {loading && <div className={styles.loadingOverlay}>Loading...</div>}
          </div>
        ) : (
          <p>Loading map...</p>
        )}


            <div className={styles.simulationbuttonSection}>
              <Button className={styles.simulationButton} onClick={startSimulation}>Start Simulation</Button>
              <Button className={styles.reset_simulationButton} onClick={resetSimulation}>Reset Simulation</Button>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className={styles.logocontainer}>
          {/*<Logo className={styles.logo} />*/}
          <Banner
            className={styles.banner}
            variant="info"
          >
            <strong>MongoDB efficiently handles operational time series data via Pub/Sub and time series collection, and powers analytical insights using Pub/Sub, Vertex AI, and regular collections. </strong>
            <a href="https://www.mongodb.com/">See more</a>
          </Banner>

        </div>

      </div>
      <footer className={footerStyles.footer}>
        <div className={footerStyles.footerContent}>
          <p>&copy; 2024 MongoDB. All rights reserved.</p>
          <p>
          Leafy Air Demo developed by IS Team 
          </p>
        </div>
        <div className={footerStyles.footerImage}>
          <Logo className={footerStyles.logo}></Logo>
        </div>
      </footer>
    </div>
  );
};

export default FlightLayout;

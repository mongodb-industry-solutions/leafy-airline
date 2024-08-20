'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './GeneralStyle.module.css'; // Ensure this path is correct
import footerStyles from './Footer.module.css';

import Logo from '@leafygreen-ui/logo';
import Button from '@leafygreen-ui/button';
import ExpandableCard from "@leafygreen-ui/expandable-card";
import Card from "@leafygreen-ui/card";

import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import io from 'socket.io-client'; // Import socket.io-client
import PlaneIcon from '../public/plane-solid.svg';

import Icon from "@leafygreen-ui/icon";
import Image from 'next/image';
import Banner from '@leafygreen-ui/banner';

import airports_dict from '../resources/airports.js'
import { set } from 'mongoose';

// const app_url = "https://simulation-app-final-65jcrv6puq-ew.a.run.app/";
// const app_url = "https://simulation-app-final-65jcrv6puq-ew.a.run.app/";
// const app_url = "https://simulation-app-newpath-65jcrv6puq-ew.a.run.app/";
const app_url = "https://simulation-app-final-v3-65jcrv6puq-ew.a.run.app/";
const app_url = "https://simulation-app-final-v3-65jcrv6puq-ew.a.run.app/";

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
  const [totalCost, setTotalCost] = useState(null);
  const [totalExpectedCost, setTotalExpectedCost] = useState(null);
  const [extraFuelCost, setExtraFuelCost] = useState(null);

  const [simulationStarted, setSimulationStarted] = useState(false)
  const [fetchingStarted, setFetchingStarted] = useState(false); // State to manage fetching delay
  const [loading, setLoading] = useState(false); // State for loading
  const [prevAirplanePosition, setPrevAirplanePosition] = useState(null);
  const [totalExpectedFuelCost, setTotalExpectedFuelCost] = useState(null);
  const [sumCost, setSumCost] = useState(null);
 
  const [newPath, setNewPath] = useState([])
  const [newDisrup, setDisruption] = useState({})
  const [disrupEmpty, setDisrupEmpty] = useState(true)

  async function fetchData() {
    try {
      const res = await fetch('/api/flights');
      const data = await res.json();
      setFlightData(data);

      if (flightId) {
        console.log('Flight ID from query:', flightId);

        const flight = data.find(flight => flight._id && flight._id.toString() === flightId.toString());
        if (flight) {
          console.log("Flight Data")
          console.log(flight)
          setSelectedFlight(flight);
        } else {
          console.error('No flight found with ID:', flightId);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

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
    fetchData();
  }, [flightId, simulationStarted]);

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(); // Connect to the WebSocket server

    socket.on('alert', (alert) => {
      console.log('Alert received:', alert);
      if (alert && alert.input.Delay_Time !== undefined) {
        setDelayTime(alert.input.Delay_Time); // Round the delay time before setting it
      }
      if (alert && alert.input.Delay_Cost !== undefined) {
        setDelayCost(alert.input.Delay_Cost); // Set the delay cost
      }
      if (alert && alert.input.Extra_Fuel_Cost !== undefined) {
        setExtraFuelCost(alert.input.Extra_Fuel_Cost); // Set the extra fuel cost
      }
      if (alert && alert.predictions[0] !== undefined) {
        setTotalCost(alert.predictions[0]); // Set the total cost
        setTotalExpectedCost(prev => prev === null ? alert.predictions[0] : prev);
      }
      if (alert && alert.input.Fuel_Cost_per_Hour !== undefined) {
        setFuelCostPerHour(alert.input.Fuel_Cost_per_Hour); // Set the fuel cost per hour
        setTotalExpectedFuelCost(prev => prev === null ? alert.input.Fuel_Cost_per_Hour : prev);
      }
    });
    return () => {
      socket.off('alert');
    };
  }, []);


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

  const getAirplaneIcon = () => {
    if (airplanePosition) {
      const { heading } = airplanePosition;
      if (heading >= 240 && heading < 300) { // Example range for heading towards West
        return '/plane-solid_west.svg'; // URL for westward plane icon
      }
    }
    return '/plane-solid.svg'; // URL for default plane icon
  };

  const getNewDisrup = () => {

    console.log(selectedFlight.disruption_coords)

    setDisruption({"lat" : selectedFlight.disruption_coords.lat,
      "lng" : selectedFlight.disruption_coords.long});
    console.log("Disruption");
    console.log(selectedFlight.disruption_coords);
    setDisrupEmpty(false);
  
  };

  const getNewPath = () => {
    console.log("Entered newpath")
    const path = selectedFlight && Array.isArray(selectedFlight.new_path) 
                  ? selectedFlight.new_path 
                  : [];

    // Map each path value to its city and code from the airports dictionary
    const resolvedPath = path.map(code => airports_dict[code] || code);

    setNewPath(resolvedPath);
    getNewDisrup()
    console.log(resolvedPath)
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

      // Change state to fetch the new information from flights to update the path visually
      setSimulationStarted(true);
      getNewPath()

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
      setTotalCost(null);
      setTotalExpectedCost(null);
      setExtraFuelCost(null);

      // Reset the simulation status
      setSimulationStarted(false);
      setNewPath([])
      setDisruption({})
      setDisrupEmpty(true);

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

  // const disrupCoords = {
  //   lat: selectedFlight ? selectedFlight.disruption_coords.lat: 0,
  //   lng: selectedFlight ? selectedFlight.disruption_coords.long : 0
  // };


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
                  <div className={styles.routing}>
                  <h4>Initial Path </h4>
                  <p className={styles.data}>{`${selectedFlight.dep_arp.city}, ${selectedFlight.dep_arp._id}  - ${selectedFlight.arr_arp.city}, ${selectedFlight.arr_arp._id}`}</p>
                  <h4>New Path </h4>
                  {newPath.length === 0 ? (
                    <p className={styles.data}>No simulation running</p>
                  ) : (
                    <div>
                    <p className={styles.data}>{`${newPath.join(' - ')}`}</p>
                    </div>
                  )}
                  <h4>Scheduled for </h4>
                  <p className={styles.data}>{`${new Date(selectedFlight.dep_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date(selectedFlight.arr_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`}</p>
                  </div>
                </div>
                
                <div className={styles.costContainer}>
                  <div className={delayTime === 0 || delayTime === null ? styles.noDelayBox : styles.delayBox}>
                  <h4>Delay:</h4>
                  <p className={styles.costs_data}>
                    {delayTime === 0 || delayTime === null ? (
                      <span className={styles.noDelayText}>No Delay</span>
                    ) : (
                      `${(delayTime * 60).toFixed(2)} minutes`
                    )}
                  </p>

                  </div>
                  <div className={styles.noDelayBox}>
                    <h4>Delay Cost:</h4>
                    <p className={styles.costs_data}>{delayCost !== null ? `$${delayCost.toFixed(2)}` : 'No Delay Cost'}</p>
                  </div>
                  
                </div>

                <div className = {styles.costContainer}>
                <div className={styles.costBox}>
                  <h4> Fixed Fuel Cost:</h4>
                  <p>{totalExpectedFuelCost !== null ? `$${totalExpectedFuelCost.toFixed(2)}` : 'Simulation not started'}</p>
                </div>
                <div className={styles.costBox}>
                    <h4>Real-Time Fuel Cost:</h4>
                    <p className={styles.costs_data}>{fuelCostPerHour !== null ? `$${fuelCostPerHour.toFixed(2)}` : 'Simulation not Started'}</p>
                </div>
                <div className={styles.costBox}>
                  <h4> Extra Fuel Cost due to Delay:</h4>
                  <p className={styles.costs_data}>{extraFuelCost !== null ? `$${extraFuelCost.toFixed(2)}` : 'Simulation not started'}</p>
                </div>
                
                  

                </div>
                <div className={styles.innerBoxTotalCosts}>
                    <h4> Total Expected Cost:</h4>
                    <p className={styles.costs_data}>{totalCost !== null ? `$${totalCost.toFixed(2)}` : 'Simulation not started'}</p>
                </div>
              </>
            ) : (
              <p>Loading flight details...</p>
            )}
          </div>

          {/* Google Map Component */}
          <div className={styles.rightContainer}>
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
                      {!disrupEmpty && (
                        <Marker
                          position={newDisrup}
                          label="Disruption"
                        />
                      )}
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

          <Card className={styles.card_styles} as="article">
            <p className={styles.title}>MongoDB Benefits</p>
            <p>MongoDB efficiently handles operational time series data via Pub/Sub and time series collection, and powers analytical insights using Pub/Sub, Vertex AI, and regular collections.</p>
            <a href="https://www.mongodb.com/">See more</a>

          </Card>
          </div>
        </div>
      </div>
      <footer className={footerStyles.footer}>
        <div className={footerStyles.footerContent}>
          <p>
          An Airline demo developed by Industry Solutions Team at MongoDB
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

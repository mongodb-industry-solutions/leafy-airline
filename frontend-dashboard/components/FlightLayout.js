"use client";
import React, { useEffect, useState , useRef} from "react";
import { useRouter } from "next/router";
import styles from "./GeneralStyle.module.css"; // Ensure this path is correct
import footerStyles from "./Footer.module.css";
import InformationCard from "./InformationCard";
import Logo from "@leafygreen-ui/logo";
import Button from "@leafygreen-ui/button";
import Card from "@leafygreen-ui/card";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import io from "socket.io-client"; // Import socket.io-client
import Image from "next/image";
import airports_dict from "../resources/airports.js";



const FlightLayout = ({ children }) => {
  const router = useRouter();
  const { flightId, sessionId } = router.query; 
  const animationRef = useRef(null);

  console.log("FlightLayout received flightId:", flightId);
  // console.log("FlightLayout received sessionId:", sessionId);
  
  const [sessionIdState, setSessionIdState] = useState(sessionId || null);
  const [flightIdState, setFlightIdState] = useState(flightId || null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [delayTime, setDelayTime] = useState(null);
  const [delayCost, setDelayCost] = useState(null);
  const [fuelCostPerHour, setFuelCostPerHour] = useState(null); 
  const [airplanePosition, setAirplanePosition] = useState(null);
  const [flightPath, setFlightPath] = useState([]);
  const [totalCost, setTotalCost] = useState(null);
  const [totalExpectedCost, setTotalExpectedCost] = useState(null);
  const [extraFuelCost, setExtraFuelCost] = useState(null);

  const [simulationStarted, setSimulationStarted] = useState(false);
  const [fetchingStarted, setFetchingStarted] = useState(false); 
  const [simulationEnded, setSimulationEnded] = useState(false);

  const [loading, setLoading] = useState(false); 
  const [prevAirplanePosition, setPrevAirplanePosition] = useState(null);
  const [equalSteps, setEqualSteps] = useState(0);
  const [totalExpectedFuelCost, setTotalExpectedFuelCost] = useState(null);
  const [sumCost, setSumCost] = useState(null);

  const [newPath, setNewPath] = useState([]);
  const [newDisrup, setDisruption] = useState({});
  const [disrupEmpty, setDisrupEmpty] = useState(true);

  // New modal for architecture images
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); 

  // Getting environment variables from server side
  const [envConfig, setEnvConfig] = useState(null);

  useEffect(() => {
    async function fetchEnvConfig() {
      try {
        const res = await fetch("/api/envConfig");
        if (!res.ok) throw new Error("Failed to fetch environment config");
        const data = await res.json();
        setEnvConfig(data);
      } catch (err) {
        console.error("Error loading environment config:", err);
      }
    }

    fetchEnvConfig();
  }, []);

  useEffect(() => {
    if (!envConfig) return;
    console.log("App URL:", envConfig.app_url);
    console.log("Simulated Mode:", envConfig.simulatedMode);
  }, [envConfig]);


  async function fetchData() {
    try {
      // Fetch data from flight_info API with flightId filter
      if (flightIdState) {

        // console.log("Fetching data for flightId:", flightIdState);

        const res = await fetch("/api/flight_info",
          { method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flight_id: flightIdState })
          }
        );

        const flight = await res.json();
        console.log("Fetched flight data:", flight);
        setSelectedFlight(flight);

        if (simulationStarted) {
          getNewPath(flight);
          getNewDisrup(flight);
        }
      } else {
        console.error("flightId is not defined in the query parameters.");
      }
        
      } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // Fetch Google Maps API key from backend
  useEffect(() => {
    async function fetchApiKey() {
      try {
        const res = await fetch("/api/googleMapsKey");
        const data = await res.json();
        setApiKey(data.apiKey);
      } catch (error) {
        console.error("Error fetching API key:", error);
      }
    }
    fetchApiKey();
  }, []);

  // Update params when we get the apiKey
  useEffect(() => {
    if (apiKey) {
      fetchData();
    }
  }, [flightIdState, simulationStarted, apiKey]);


  // Connect to WebSocket server when apiKey is available
  useEffect(() => {
    if (apiKey) {
      // Connect to WebSocket server
      // const socket = io(); 

      // Pass session_id as a query parameter to identify the session 
      const socket = io({
        query: { session_id: sessionIdState },
      });

      socket.on("alert", (alert) => {
        // console.log("Alert received:", alert);
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
          setTotalExpectedCost((prev) =>
            prev === null ? alert.predictions[0] : prev
          );
        }
        if (alert && alert.input.Fuel_Cost_per_Hour !== undefined) {
          setFuelCostPerHour(alert.input.Fuel_Cost_per_Hour); // Set the fuel cost per hour
          setTotalExpectedFuelCost((prev) =>
            prev === null ? alert.input.Fuel_Cost_per_Hour : prev
          );
        }
      });
      return () => {
        socket.off("alert");
      };
    }
  }, [apiKey]);

  //  Update sumCost whenever totalExpectedFuelCost or delayCost changes
  useEffect(() => {
    if (apiKey) {
      if (totalExpectedFuelCost !== null && delayCost !== null) {
        setSumCost(totalExpectedFuelCost + delayCost);
      } else if (totalExpectedFuelCost !== null) {
        setSumCost(totalExpectedFuelCost);
      } else if (delayCost !== null) {
        setSumCost(delayCost);
      } else {
        setSumCost(null);
      }
    }
  }, [totalExpectedFuelCost, delayCost, apiKey]);


  useEffect(() => {
    if (!fetchingStarted) return;

    const interval = setInterval(async () => {
      try {

        // console.log("Fetching newest document for session:", sessionIdState);
        const response = await fetch("/api/fetchNewestDocument", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionIdState }),
        });

        const data = await response.json();
        if (
          data &&
          data.mostRecentLat !== undefined &&
          data.mostRecentLong !== undefined
        ) {
          const newPosition = {
            lat: data.mostRecentLat,
            lng: data.mostRecentLong,
          };
          

          console.log("Latest position:", newPosition);

          if (prevAirplanePosition) {

            // Compare previous position for 3 consecutive times
            const sameLat = prevAirplanePosition.lat === newPosition.lat;
            const sameLng = prevAirplanePosition.lng === newPosition.lng;
            
            if (sameLat && sameLng && !simulationEnded) {
              setEqualSteps((prev) => prev + 1);
              console.log(`Equal steps: ${equalSteps + 1}`);

              // If position is the same for 3 consecutive times, end simulation
              if (equalSteps + 1 >= 3) {
                console.log("Simulation has ended.");
                setSimulationEnded(true);
                setEqualSteps(0);
                clearInterval(interval); // stop polling
                return;
              }
          }

            // If plane moved, update heading and continue
            // const heading = calculateHeading(prevAirplanePosition, newPosition);
            // setAirplanePosition({ ...newPosition, heading });

            if (animationRef.current) {
              cancelAnimationFrame(animationRef.current);
            }

            const heading = calculateHeading(prevAirplanePosition, newPosition);
            const start = prevAirplanePosition;
            const end = newPosition;
            const duration = 3000; // match your fetch interval
            const startTime = performance.now();

            const animate = (now) => {
              const elapsed = now - startTime;
              const fraction = Math.min(elapsed / duration, 1);
              const interpolated = {
                lat: start.lat + (end.lat - start.lat) * fraction,
                lng: start.lng + (end.lng - start.lng) * fraction,
              };

              setAirplanePosition({ ...interpolated, heading });

              if (fraction < 1) {
                animationRef.current = requestAnimationFrame(animate);
              }
            };

            animationRef.current = requestAnimationFrame(animate);

          } else {
            setAirplanePosition(newPosition);
          }

          setFlightPath((prevPath) => [...prevPath, newPosition]);
          setPrevAirplanePosition(newPosition);
        }

      } catch (error) {
        console.error("Error fetching the newest document:", error);
      }
    }, 3000); // Fetch every 2.5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [fetchingStarted, prevAirplanePosition]);

  const performAggregation = async () => {
    
    // console.log("Performing aggregation for session:", sessionIdState);


    console.time(`agg-${sessionIdState}`);
    const aggregationResponse = await fetch("/api/aggregate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionIdState }),
    });

    console.timeEnd(`agg-${sessionIdState}`);

    if (aggregationResponse.ok) {
      console.log("Aggregation triggered successfully.");
    } else {
      console.error(
        "Failed to trigger aggregation. Status:",
        aggregationResponse.status
      );
    }
  };

  useEffect(() => {
  if (simulationStarted && !simulationEnded) {
    const aggregationInterval = setInterval(performAggregation, 3000);
    return () => clearInterval(aggregationInterval);
  }
}, [simulationStarted, simulationEnded]);

// Wait until config is loaded
  if (!envConfig) return <p>Loading environment configuration...</p>;

  // Destructure variables for easier use
  const {
    app_url,
    simulatedMode,
    maps_api_key,
    mongo_uri,
    mongodb_db,
  } = envConfig;
  // console.log("App URL:", app_url);
  // console.log("Simulated Mode:", simulatedMode);


  const calculateHeading = (from, to) => {
    const lat1 = (from.lat * Math.PI) / 180;
    const lon1 = (from.lng * Math.PI) / 180;
    const lat2 = (to.lat * Math.PI) / 180;
    const lon2 = (to.lng * Math.PI) / 180;

    const dLon = lon2 - lon1;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    const heading = (Math.atan2(y, x) * 180) / Math.PI;
    return (heading + 360) % 360; // Normalize to 0-360
  };

  const getAirplaneIcon = () => {
    if (airplanePosition) {
      const { heading } = airplanePosition;
      if (heading >= 240 && heading < 300) {
        // Example range for heading towards West
        return "/plane-solid_west.svg"; // URL for westward plane icon
      }
    }
    return "/plane-solid.svg"; // URL for default plane icon
  };

  const getNewDisrup = (flight) => {
    setDisruption({
      lat: flight.disruption_coords.lat,
      lng: flight.disruption_coords.long,
    });
    // console.log("Disruption setted");
    setDisrupEmpty(false);
  };

  const getNewPath = (flight) => {
    const path =
      flight && Array.isArray(flight.new_path_airps) ? flight.new_path_airps : [];

    // Map each path value to its city and code from the airports dictionary
    const resolvedPath = path.map((code) => airports_dict[code] || code);

    setNewPath(resolvedPath);
    // console.log(resolvedPath);
  };

  const startSimulation = async () => {
    setLoading(true); // Set loading to true
    // console.log("Starting simulation");
    let start_url = "";

    // Different endpoint depending on simulatedMode
    if (simulatedMode === true) {
      console.log("Simulated Mode is ON - Using simulated endpoint`");
      start_url = app_url + "/simulated/start-scheduler";
    } else {
      console.log("Simulated Mode is OFF - Using standard endpoint`");
      start_url = app_url + "/start-scheduler";
    }
    const app_data = {
      // Adding sessionId to the payload
      session_id: sessionIdState,
      flight_id: flightId,
      dep_code: selectedFlight.dep_arp._id,
      arr_code: selectedFlight.arr_arp._id,
      dep_loc: [
        selectedFlight.dep_arp.geo_loc.lat,
        selectedFlight.dep_arp.geo_loc.long,
      ],
      arr_loc: [
        selectedFlight.arr_arp.geo_loc.lat,
        selectedFlight.arr_arp.geo_loc.long,
      ],
    };
    console.log("Payload for starting simulation:", app_data);

    try {
      const response = await fetch(start_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(app_data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // // Trigger Aggregation API after starting the simulation
      // const aggregationResponse = await fetch('/api/aggregation', { method: 'POST' });
      // if (aggregationResponse.ok) {
      //   console.log('Aggregation triggered successfully.');
      // } else {
      //   console.error('Failed to trigger aggregation. Status:', aggregationResponse.status);
      // }

      setSimulationStarted(true);

      // Delay the start of fetching newest document
      setTimeout(() => {
        setFetchingStarted(true);
        setLoading(false); // Set loading to false after delay
      }, 5000); // 5 seconds delay
    } catch (error) {
      console.error("Error starting process:", error);
      setLoading(false); // Set loading to false if there is an error
    }
  };

  const resetSimulation = async () => {
    const reset_url = `${app_url}/reset-scheduler/${sessionIdState}`;

    try {
      const response = await fetch(reset_url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      // Clear flight path and stop fetching
      setFlightPath([]);
      setFetchingStarted(false);

      // Move airplane to departure position
      if (selectedFlight) {
        const departurePosition = {
          lat: selectedFlight.dep_arp.geo_loc.lat,
          lng: selectedFlight.dep_arp.geo_loc.long,
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
      setSimulationEnded(false);
      setNewPath([]);
      setDisruption({});
      setDisrupEmpty(true);
    } catch (error) {
      console.error("Error resetting process:", error);
    }
  };

  const handleBackClick = () => {
    resetSimulation();
    router.push("/");
  };


  const depCoords = {
    lat: selectedFlight ? selectedFlight.dep_arp.geo_loc.lat : 0,
    lng: selectedFlight ? selectedFlight.dep_arp.geo_loc.long : 0,
  };

  const arrCoords = {
    lat: selectedFlight ? selectedFlight.arr_arp.geo_loc.lat : 0,
    lng: selectedFlight ? selectedFlight.arr_arp.geo_loc.long : 0,
  };

  const openModal = (imageSrc) => {  
    setModalImage(imageSrc);
    setIsModalOpen(true);
  };  
  
  const closeModal = () => {  
    setModalImage(null); 
    setIsModalOpen(false);  
  };  


  const interpolatePosition = (start, end, fraction) => ({
    lat: start.lat + (end.lat - start.lat) * fraction,
    lng: start.lng + (end.lng - start.lng) * fraction,
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.flightInfo}>
          <h1 className={styles.flightID}>
            <span className={styles.flightIdGreen}>Flight ID: </span>
            <span className={styles.flightIdBlack}>
              {selectedFlight ? selectedFlight.flight_number : "Loading..."}
            </span>
          </h1>
          <h2 className={styles.subHeader}>
            Flight Information & Route Optimization
          </h2>
        </div>
      </header>
      <nav className={styles.nav}>
        <button className={styles.greenButton} onClick={handleBackClick}>
          <span className={styles.arrowIcon}>&larr;</span> Back to Flights
        </button>
      </nav>

      <div className={styles.main}>
        <div className={styles.contentContainer}>
          <div className={styles.flightOverviewBox}>
            <h3>Flight Overview</h3>
            {selectedFlight ? (
              <>
                <div className={styles.staticBox}>
                  <div className={styles.routing}>
                    <h4>Departure - Arrival Locations </h4>
                    <p
                      className={styles.static_data}
                    >{`${selectedFlight.dep_arp.city}, ${selectedFlight.dep_arp._id}  - ${selectedFlight.arr_arp.city}, ${selectedFlight.arr_arp._id}`}</p>
                    <h4>Alternative flying route</h4>
                    {newPath.length === 0 ? (
                      <p className={styles.static_data}>
                        No simulation running
                      </p>
                    ) : (
                      <div>
                        <p className={styles.static_data}>{`${newPath.join(
                          " - "
                        )}`}</p>
                      </div>
                    )}
                    <h4>Scheduled for </h4>
                    <p className={styles.static_data}>{`${new Date(
                      selectedFlight.dep_time
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })} - ${new Date(
                      selectedFlight.arr_time
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}`}</p>
                  </div>
                </div>

                <div className={styles.dynamicContainer}>
                  <div
                    className={
                      delayTime === 0 || delayTime === null
                        ? styles.noDelayBox
                        : styles.delayBox
                    }
                  >
                    <div className={styles.boxInfo}>
                      <h4>Delay:</h4>
                      <InformationCard text="Current time difference between expected and real schedule due to disruptions"></InformationCard>
                    </div>
                    <p className={styles.data}>
                      {delayTime === 0 || delayTime === null ? (
                        <span className={styles.noDelayText}>No Delay</span>
                      ) : (
                        `${(delayTime * 60).toFixed(2)} minutes`
                      )}
                    </p>
                  </div>
                  <div className={styles.noDelayBox}>
                    <div className={styles.boxInfo}>
                      <h4>Delay Cost:</h4>
                      <InformationCard text="Dynamic calculation of current delay's real-time cost"></InformationCard>
                    </div>
                    <p className={styles.data}>
                      {delayCost !== null
                        ? `$${delayCost.toFixed(2)}`
                        : "No Delay Cost"}
                    </p>
                  </div>
                </div>

                <div className={styles.dynamicContainer}>
                  <div className={styles.costBox}>
                    <h4> Fixed Fuel Cost:</h4>
                    <p className={styles.static_data}>
                      {totalExpectedFuelCost !== null
                        ? `$${totalExpectedFuelCost.toFixed(2)}`
                        : "Simulation not started"}
                    </p>
                  </div>
                  <div className={styles.costBox}>
                    <h4>Real-Time Fuel Cost:</h4>
                    <p className={styles.data}>
                      {fuelCostPerHour !== null
                        ? `$${fuelCostPerHour.toFixed(2)}`
                        : "Simulation not Started"}
                    </p>
                  </div>
                  <div className={styles.costBox}>
                    <div className={styles.boxInfo}>
                      <h4>Extra Fuel Cost:</h4>
                      <InformationCard text="Predicted cost for the extra fuel being used due to the disruption"></InformationCard>
                    </div>
                    <p className={styles.data}>
                      {extraFuelCost !== null
                        ? `$${extraFuelCost.toFixed(2)}`
                        : "Simulation not started"}
                    </p>
                  </div>
                </div>
                <div className={styles.staticBox}>
                  <h4> Total Expected Cost:</h4>
                  <p className={styles.data}>
                    {totalCost !== null
                      ? `$${totalCost.toFixed(2)}`
                      : "Simulation not started"}
                  </p>
                </div>
              </>
            ) : (
              <p>Loading flight details...</p>
            )}
          </div>

          <div className={styles.rightContainer}>
            <div className={styles.mapContainer}>
              {apiKey ? (
                <div
                  style={{ position: "relative", width: "100%", height: "85%" }}
                >
                  <LoadScript googleMapsApiKey={apiKey}>
                    <GoogleMap
                      mapContainerStyle={{ width: "100%", height: "100%" }}
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
                            <Marker position={newDisrup} label="Disruption" />
                          )}
                          <Polyline
                            path={[depCoords, arrCoords]}
                            options={{
                              strokeColor: "#FF0000",
                              strokeOpacity: 1.0,
                              strokeWeight: 2,
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
                              strokeColor: "#0a9396",
                              strokeOpacity: 0.7,
                              strokeWeight: 2,
                              icons: [
                                {
                                  icon: {
                                    path: "M 0,-1 0,1", // small dot
                                    strokeOpacity: 1,
                                    scale: 2,
                                  },
                                  offset: "0",
                                  repeat: "15px",
                                },
                              ],
                            }}
                            />
                        </>
                      )}
                    </GoogleMap>
                  </LoadScript>
                  {loading && (
                    <div className={styles.loadingOverlay}>Loading...</div>
                  )}

                  {simulationEnded && !loading && (
                    <div className={styles.loadingOverlay}>Simulation Ended</div>
                  )}
                </div>
              ) : (
                <p>Loading map...</p>
              )}
              <div className={styles.simulationbuttonSection}>
                <Button
                  className={styles.simulationButton}
                  onClick={startSimulation}
                  disabled={simulationStarted}
                >
                  Start Simulation
                </Button>
                <Button
                  className={styles.reset_simulationButton}
                  onClick={resetSimulation}
                >
                  Reset Simulation
                </Button>
              </div>
            </div>

            <Card className={styles.highlightCard} as="article">  
              <div className={styles.highlightContent}>  
                <div className={styles.leftContent}>  
                  <p className={styles.highlightTitle}>  
                    Curious about how MongoDB transforms airline operations?  
                  </p>  
                  <p className={styles.description}>  
                    MongoDB's real-time capabilities and advanced data handling empower  
                    airlines to achieve operational excellence. From optimized time series  
                    collections to seamless integrations with Pub/Sub and Vertex AI—you can  
                    explore the possibilities.  
                  </p>  
                  <p className={styles.title}>Check out our latest blog post and YouTube video for more insights!</p>
                </div>  
                <div className={styles.rightContent}>  
                  <div className={styles.multimediaContainer}> 
                    <div className={styles.blogCoverContainer}>  
                      <a  
                        href="https://www.mongodb.com/company/blog/innovationfrom-chaos-to-control-real-time-data-analytics-for-airlines"  
                        target="_blank"  
                        rel="noopener noreferrer"  
                      >  
                        <Image  
                          src="/blog-cover.png" 
                          width={300}  
                          height={300} 
                          alt="MongoDB Blog Cover"  
                          className={styles.blogCoverImage}  
                        />  
                      </a>  
                    </div>  

                    <iframe  
                      className={styles.youtubeVideo}  
                      src="https://www.youtube.com/embed/RgreCE1eMkU"  
                      title="YouTube video"  
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"  
                      allowFullScreen  
                    ></iframe>  
                  
                  </div>  
                </div>  
              </div>  
            </Card>  

            <div className={styles.cardContainer}>    
              <h2 className={styles.titleValues}>  
                Why MongoDB for Flight Disruption Management?  
              </h2>

              <Card className={styles.extended_card_styles} as="article">  

                <div className={styles.leftContent}>
                  <p className={styles.title}>Event-Driven Architecture</p>  
                  <p>  
                    MongoDB is ideal for event-driven architectures, enabling seamless handling  
                    of dynamic events like flight schedule changes or delays. Real-time integrations  
                    with mechanisms like Pub/Sub, Cloud Functions, and Change Streams ensure  
                    faster data processing and reaction to disruptions across decentralized systems.  
                  </p>  

                </div>
                <div className={styles.rightContent}>
                  <Image  
                    src="/architecture-diagram.png"
                    alt="Event-Driven Architecture Workflow"  
                    width={300}  
                    height={200}  
                    className={styles.cardImage}  
                    onClick={() => openModal("/architecture-diagram.png")}
                  />  
                </div>
              </Card> 

              {/* Row 1 */}  
              <div className={styles.cardRow}>   

                <Card className={styles.card_styles} as="article">  
                  <p className={styles.title}>Flexible Schema</p>  
                  <p>  
                    MongoDB's document model makes it simple to store diverse flight data,  
                    including telemetry, geospatial locations, disruption paths, and  
                    time-series data. 
                  </p>
                  <p>
                    
                    Its schema flexibility allows for <b>seamless evolution</b> as  
                    airline operations or data requirements change, ensuring scalability,  
                    adaptability, and future-proof design.  
                  </p>

                  {/* Sample Document */}  
                  <pre className={styles.sampleDocument}>  
                    {`{
      "_id": "flight123",  
      "departure": {  
        "airport": "ATL",  
        "geo_location": {  
          "lat": 33.6407,  
          "long": -84.4277  
        },  
        "scheduled_time": "2023-10-01T14:00:00Z"  
      },  
      "arrival": {  
        "airport": "JFK",  
        "geo_location": {  
          "lat": 40.6413,  
          "long": -73.7781  
        },  
        "scheduled_time": "2023-10-01T17:00:00Z"  
      },  
      "airline": "Leafy Airlines",  
      "status": "on-time"  
  }`}  
                  </pre>    
                </Card>  
              
                <Card className={styles.clear_card_styles} as="article">  
                  <p className={styles.title}>Real-Time Updates</p>  
                  <p>  
                    MongoDB's <b>Change Streams</b> enable real-time notifications, allowing airlines  
                    to <b>instantly react to disruptions, reroutes, or cascading delays</b>. This  
                    ensures that both operational teams and passengers have access to live  
                    updates, improving efficiency and customer experience.  
                  </p>  

                   <Image  
                    src="/realtime-architecture.png"
                    alt="Real-Time Updates"
                    width={300}
                    height={200}
                    className={styles.cardImage}
                    onClick={() => openModal("/realtime-architecture.png")} /* Open modal with the image */
                  />
                </Card>  
               
              </div>  
              
              {/* Row 2 */}  
              <div className={styles.cardRow}>  
                <Card className={styles.card_styles} as="article">  
                  <p className={styles.title}>Geospatial Queries</p>  
                  <p>  
                    MongoDB's native geospatial querying powers dynamic calculations for route  
                    adjustments based on flight disruptions, weather patterns, or other  
                    changes. 
                  </p>  
                  <p>
                    Airlines can use its advanced algorithms to make instant,  
                    data-driven decisions with minimal latency.  
                  </p>  
                </Card>  
              
              
                <Card className={styles.clear_card_styles} as="article">  
                  <p className={styles.title}>Integration with AI</p>  
                  <p>  
                    MongoDB simplifies the pipeline for Vertex AI and similar machine  
                    learning services by providing enriched, real-time operational data.  
                    Airlines can harness this integration to improve disruption prediction,  
                    optimize costs, and deliver insights that drive organizational decisions.  
                  </p>  

                  {/* Vertex AI Diagram */}
                  <Image
                    src="/ai-integration.png"
                    alt="Vertex AI Integration" 
                    width={200}
                    height={100}
                    className={styles.cardImage}
                    onClick={() => openModal("/ai-integration.png")} /* Open modal with the image */
                  />
                </Card>  

                <Card className={styles.card_styles} as="article">  
                  <p className={styles.title}>Time-Series Data</p>  
                  <p>  
                    Optimized for telemetry and flight tracking, MongoDB's Time Series  
                    Collections enable <b>efficient storage, querying, and analysis of complex  
                    time-series datasets</b>, such as speed metrics or historical flight paths.  
                    This capability enhances predictive analytics and operational reporting.  
                  </p>  

                  {/* Sample Time-Series Data */}
                  <pre className={styles.sampleDocument}>
                    {`{
      ...
      "ts": "2024-07-16T16:15:41.608793",
      "distance_to_arrival": 291.22170366055457,
      "location": {
        "lat": 40.48532197555584,
        "long": -3.5270251738005025
      },
      "velocity": {
        "speed": 244.0087836688688,
        "heading": "north"
      }
      ...
    }`}
                  </pre>
                </Card>  
              </div>  
            </div>  
            
          </div>
        </div>
      
            {/* Modal para ampliar imágenes */}
            {isModalOpen && (
            <div
              className={styles.modalOverlay}
              onClick={closeModal}
            >
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()} // evita cerrar el modal al hacer clic en la imagen
              >
                <Image
                  src={modalImage}
                  alt="Expanded view"
                  width={1200}
                  height={900}
                  className={styles.modalImage}
                />
                <button
                  onClick={closeModal}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>
            </div>
          )}
      </div>
      <footer className={footerStyles.footer}>
        <div className={footerStyles.footerContent}>
          <p>An Airline demo developed by Industry Solutions Team at MongoDB</p>
        </div>
        <div className={footerStyles.footerImage}>
          <Logo className={footerStyles.logo}></Logo>
        </div>
      </footer>
    </div>
  );
};

export default FlightLayout;

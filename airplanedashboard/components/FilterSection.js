import { useState, useEffect } from 'react';
import styles from './Layout.module.css';
import Button from '@leafygreen-ui/button';
import { Combobox, ComboboxOption } from '@leafygreen-ui/combobox'

const airports_dict = {
  "LHR": "LHR - London Heathrow Airport",
  "CDG": "CDG - Charles de Gaulle Airport (Paris)",
  "FRA": "FRA - Frankfurt Airport",
  "AMS": "AMS - Amsterdam Schiphol Airport",
  "MAD": "MAD - Adolfo Suárez Madrid-Barajas Airport",
  "BCN": "BCN - Barcelona-El Prat Airport",
  "FCO": "FCO - Leonardo da Vinci–Fiumicino Airport (Rome)",
  "MUC": "MUC - Munich Airport",
  "LGW": "LGW - London Gatwick Airport",
  "ZRH": "ZRH - Zurich Airport",
  "VIE": "VIE - Vienna International Airport",
  "CPH": "CPH - Copenhagen Airport",
  "DUB": "DUB - Dublin Airport",
  "HEL": "HEL - Helsinki Airport",
  "BRU": "BRU - Brussels Airport",
  "OSL": "OSL - Oslo Gardermoen Airport",
  "ARN": "ARN - Stockholm Arlanda Airport",
  "MXP": "MXP - Milan Malpensa Airport",
  "ATH": "ATH - Athens International Airport",
  "LIS": "LIS - Lisbon Humberto Delgado Airport",
  "ORY": "ORY - Paris Orly Airport",
  "SVO": "SVO - Sheremetyevo International Airport (Moscow)",
  "DME": "DME - Domodedovo International Airport (Moscow)",
  "LED": "LED - Pulkovo Airport (Saint Petersburg)",
  "WAW": "WAW - Warsaw Chopin Airport",
  "PRG": "PRG - Václav Havel Airport Prague",
  "BUD": "BUD - Budapest Ferenc Liszt International Airport",
  "TXL": "TXL - Berlin Tegel Airport (closed, but historically significant)",
  "BER": "BER - Berlin Brandenburg Airport",
  "SXF": "SXF - Berlin Schönefeld Airport (now part of Brandenburg)",
  "MAN": "MAN - Manchester Airport",
  "STN": "STN - London Stansted Airport",
  "DUS": "DUS - Düsseldorf Airport",
  "HAM": "HAM - Hamburg Airport",
  "PMI": "PMI - Palma de Mallorca Airport",
  "AGP": "AGP - Málaga Airport",
  "VCE": "VCE - Venice Marco Polo Airport",
  "NAP": "NAP - Naples International Airport",
  "NCE": "NCE - Nice Côte d'Azur Airport",
  "GVA": "GVA - Geneva Airport",
  "LUX": "LUX - Luxembourg Airport",
  "LJU": "LJU - Ljubljana Jože Pučnik Airport",
  "SOF": "SOF - Sofia Airport",
  "OTP": "OTP - Henri Coandă International Airport (Bucharest)",
  "BTS": "BTS - Bratislava Airport",
  "ZAG": "ZAG - Zagreb Airport",
  "BEG": "BEG - Belgrade Nikola Tesla Airport",
  "SKG": "SKG - Thessaloniki Airport",
  "TSF": "TSF - Treviso Airport",
  "CTA": "CTA - Catania Fontanarossa Airport",
  "NYC": "NYC - New York City"
};

const airports_list = Object.values(airports_dict);

const TimeSlider = ({label, state, setter}) => {
  
  // Function to generate time values in 10-minute intervals
  const generateTimeValues = () => {
    let times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 10) {
        let hours = h.toString().padStart(2, '0');
        let minutes = m.toString().padStart(2, '0');
        times.push(`${hours}:${minutes}`);
      }
    }
    return times;
  };
  // List of time values
  const timeValues = generateTimeValues();
  const handleSliderChange = (e) => {
    setter(timeValues[e.target.value]);
  };
  return (
    <div className = {styles.filterTimeSlider}>
      <div>{label}</div>
      <input
        type="range"
        min="0"
        max={timeValues.length - 1}
        step="1"
        value={timeValues.indexOf(state)}
        onChange={handleSliderChange}
      />
      <label>Selected Time: {state}</label>
    </div>
  );
};

const SeparationBar = () => {
  return <hr className={styles.separationBar} />;
};

const FilterSection = () => {

  const [filters, setFilters] = useState({});

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [departureTime, setDepartureTime] = useState('00:00');
  const [arrivalTime, setArrivalTime] = useState('00:00');
  const [selectedDeparture, setSelectedDeparture] = useState([]);
  const [selectedArrival, setSelectedArrival] = useState([]);
  const initial_filters = {}

  
  const fetchResults = async (params) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      console.log(queryString)
      const response = await fetch(`/api/filters?${queryString}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setResults(data);
      console.log(data)

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    console.log('Applying filters')

    // Get the parsed time
    const dep_time = convertTimeToISO(departureTime)
    const arr_time = convertTimeToISO(arrivalTime)
    const params = {
      // 'dep_time' : dep_time,
      // 'arr_time' : arr_time,
      'dep_arp._id' : selectedDeparture,
      'arr_arp._id' : selectedArrival
    }
    setFilters(params)
    fetchResults(params)
  };

  const resetFilters = () => {
      // Reset the filters after applying the previous ones
      setDepartureTime('00:00')
      setArrivalTime('00:00')
      setSelectedDeparture([])
      setSelectedArrival([])
      setFilters(initial_filters)
  };

  const handleAirportChanges = (setter, value) => {

    value = String(value)
    const new_val = value.substring(0, 3);
    setter(new_val)
    return
  }

  const convertTimeToISO = (timeString) => {
    
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses en JavaScript son de 0-11
    const day = String(today.getDate()).padStart(2, '0');
  
    const [hours, minutes] = timeString.split(':');
  
    const date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00.000Z`);
  
    const isoString = date.toISOString();
  
    return isoString;
  };


  return (
    <div className={styles.filterSelection}>
      <h2>Filter Selection</h2>
      <SeparationBar />
      <TimeSlider
        label = 'Departure Time: '
        state={departureTime}
        setter={setDepartureTime}
      ></TimeSlider>
      <TimeSlider
        label = 'Arrival Time: '
        state={arrivalTime}
        setter={setArrivalTime}
      ></TimeSlider>
      <SeparationBar />
      <Combobox
        className={styles.filterCombobox}
        label="Departure Location"
        placeholder="Select departure airport"
        initialValue={[]}
        multiselect={true}
        overflow={"expand-y"}
        onChange={(e) => handleAirportChanges(setSelectedDeparture, e)}
      >
        {airports_list.map((option) => (
          <ComboboxOption key={option} value={option} />
        ))}
      </Combobox>
      <Combobox
        className={styles.filterCombobox}
        label="Arrival Location"
        placeholder="Select arrival airport"
        initialValue={[]}
        multiselect={true}
        overflow={"expand-y"}
        onChange={(e) => handleAirportChanges(setSelectedArrival, e)}
      >
        {airports_list.map((option) => (
          <ComboboxOption key={option} value={option} />
        ))}
      </Combobox>
      <div className={styles.filterbuttonSection}>
        <Button className={styles.filterButton} children = 'Apply Filters' onClick={applyFilters} ></Button>
        <Button className={styles.filterButton} children = 'Reset Filters' onClick={resetFilters} ></Button>
      </div>
    </div>
  );
};
export default FilterSection;
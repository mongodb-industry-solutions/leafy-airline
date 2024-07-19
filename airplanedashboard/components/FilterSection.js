import { useState, useEffect } from 'react';
import styles from './Layout.module.css';
import Button from '@leafygreen-ui/button';
import { Combobox, ComboboxOption } from '@leafygreen-ui/combobox'

const airports_list = [
  "LHR - London Heathrow Airport",
  "CDG - Charles de Gaulle Airport (Paris)",
  "FRA - Frankfurt Airport",
  "AMS - Amsterdam Schiphol Airport",
  "MAD - Adolfo Suárez Madrid-Barajas Airport",
  "BCN - Barcelona-El Prat Airport",
  "FCO - Leonardo da Vinci–Fiumicino Airport (Rome)",
  "MUC - Munich Airport",
  "LGW - London Gatwick Airport",
  "ZRH - Zurich Airport",
  "VIE - Vienna International Airport",
  "CPH - Copenhagen Airport",
  "DUB - Dublin Airport",
  "HEL - Helsinki Airport",
  "BRU - Brussels Airport",
  "OSL - Oslo Gardermoen Airport",
  "ARN - Stockholm Arlanda Airport",
  "MXP - Milan Malpensa Airport",
  "ATH - Athens International Airport",
  "LIS - Lisbon Humberto Delgado Airport",
  "ORY - Paris Orly Airport",
  "SVO - Sheremetyevo International Airport (Moscow)",
  "DME - Domodedovo International Airport (Moscow)",
  "LED - Pulkovo Airport (Saint Petersburg)",
  "WAW - Warsaw Chopin Airport",
  "PRG - Václav Havel Airport Prague",
  "BUD - Budapest Ferenc Liszt International Airport",
  "TXL - Berlin Tegel Airport (closed, but historically significant)",
  "BER - Berlin Brandenburg Airport",
  "SXF - Berlin Schönefeld Airport (now part of Brandenburg)",
  "MAN - Manchester Airport",
  "STN - London Stansted Airport",
  "DUS - Düsseldorf Airport",
  "HAM - Hamburg Airport",
  "PMI - Palma de Mallorca Airport",
  "AGP - Málaga Airport",
  "VCE - Venice Marco Polo Airport",
  "NAP - Naples International Airport",
  "NCE - Nice Côte d'Azur Airport",
  "GVA - Geneva Airport",
  "LUX - Luxembourg Airport",
  "LJU - Ljubljana Jože Pučnik Airport",
  "SOF - Sofia Airport",
  "OTP - Henri Coandă International Airport (Bucharest)",
  "BTS - Bratislava Airport",
  "ZAG - Zagreb Airport",
  "BEG - Belgrade Nikola Tesla Airport",
  "SKG - Thessaloniki Airport",
  "TSF - Treviso Airport",
  "CTA - Catania Fontanarossa Airport"
]
const TimeSlider = ({label, state, setter}) => {
  // const [departureTime, setDepartureTime] = useState("00:00");
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
  const [departureTime, setDepartureTime] = useState('00:00');
  const [arrivalTime, setArrivalTime] = useState('00:00');
  const [selectedDeparture, setSelectedDeparture] = useState([]);
  const [selectedArrival, setSelectedArrival] = useState([]);
  const initial_filters = {'dep_time' : '00:00',
                          'arr_time' : '00:00',
                          'dep_loc' : [],
                          'arr_loc' : []}
  const applyFilters = () => {
    const new_filters = {'dep_time' : departureTime,
                   'arr_time' : arrivalTime,
                   'dep_loc' : selectedDeparture,
                   'arr_loc' : selectedArrival
    }
    setFilters(new_filters)
    // now filters has the values for the search -> To be used in the api call
  };
  const resetFilters = () => {
      // Reset the filters after applying the previous ones
      setDepartureTime('00:00')
      setArrivalTime('00:00')
      setSelectedDeparture([])
      setSelectedArrival([])
      setFilters(initial_filters)
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
        onChange={(e) => setSelectedDeparture(e)}
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
        onChange={(e) => setSelectedArrival(e)}
      >
        {airports_list.map((option) => (
          <ComboboxOption key={option} value={option} />
        ))}
      </Combobox>
      <div className={styles.filterbuttonSection}>
        <Button className={styles.filterButton} onClick={applyFilters} >Apply Filters</Button>
        <Button className={styles.filterButton} onClick={resetFilters} >Reset Filters</Button>
      </div>
    </div>
  );
};
export default FilterSection;
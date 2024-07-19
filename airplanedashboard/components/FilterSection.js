import { useState, useEffect } from 'react';
import styles from './Layout.module.css';
import Button from '@leafygreen-ui/button';
import {Combobox, ComboboxOption} from '@leafygreen-ui/combobox'

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

const renderOptions = (list) => {
  return list.map((opt, index) => {
    return <option key={index} value={opt}>{opt}</option>;
  });
}

const Dropdown = ({ options, label, onChange }) => (
  <div className={styles.filterDropdown}>
    <label>{label}</label>
    <select onChange={onChange} className={styles.filterDropdown}>
      {renderOptions(options)}
    </select>
  </div>
);

const SeparationBar = () => {
  return <hr className={styles.separationBar} />;
};


const FilterSection = () => {

  const [filters, setFilters] = useState({}); 

  const [departureTime, setDepartureTime] = useState(12); // Default value set to 12
  const [arrivalTime, setArrivalTime] = useState(12); // Default value set to 12

  const [selectedDeparture, setSelectedDeparture] = useState(airports_list[0]);
  const [selectedArrival, setSelectedArrival] = useState(airports_list[0]);

  const [selectedOption, setSelectedOption] = useState('');

  const initial_filters = {'dep_time' : 0, 
                          'arr_time' : 0,
                          'dep_loc' : airports_list[0],
                          'arr_loc' : airports_list[0]}

  const defaultOptions = ['hola', 'comida']


  const handleSelectionChange= () => {
    console.log()
  }

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

      setDepartureTime(0)
      setArrivalTime(0)
      setSelectedDeparture([])
      setSelectedArrival([])

      setFilters(initial_filters)
    
  };

  return (
    <div className={styles.filterSelection}>
      <h2>Filter Selection</h2>


      <SeparationBar />


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

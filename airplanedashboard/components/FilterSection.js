import { useState, useEffect } from 'react';
import styles from './Layout.module.css';
import Button from '@leafygreen-ui/button';
import { Combobox, ComboboxOption } from '@leafygreen-ui/combobox'


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

const FilterSection = ({response, setResponse, dates_list, airports_list}) => {

  const [filters, setFilters] = useState({});

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState(dates_list[0]);
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
      setResponse(data);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    console.log('Applying filters')

    // Get the parsed time
    const dep_time = convertTimeToISO(departureTime);
    const arr_time = convertTimeToISO(arrivalTime);

    console.log(dep_time)

    // Checking if the params have to be included or not
    const params = {};

    if (selectedDeparture.length > 0) {
      params['dep_arp._id'] = selectedDeparture
    }

    if (selectedArrival.length > 0) {
      params['arr_arp._id'] = selectedArrival
    }

    if (dep_time) {
      params['dep_time'] = dep_time;
    }
    if (arr_time) {
        params['arr_time'] = arr_time;
    }

    setFilters(params);
    fetchResults(params);

    // Update general state
    console.log(response);
    console.log('New response setted from FilterSelection');

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

  const handleDateChange = (setter, value) => {
    setter(value)
    return
  }

  const convertTimeToISO = (timeString) => {

    console.log(timeString)

    // Create the timestamp value for the filtering based on the selected date

    const [year, month, day] = String(selectedDate).split('-');
    const [hours, minutes] = timeString.split(':');
    const date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00.000Z`);
    const isoString = date.toISOString();
  
    return isoString;
  };



  return (
    <div className={styles.filterSelection}>
      <h2>Filter Selection</h2>
      <SeparationBar />

      <Combobox
        className={styles.filterCombobox}
        label="Flight date"
        placeholder="Select date of the desired flight"
        initialValue={[]}
        multiselect={false}
        overflow={"expand-y"}
        onChange={(e) => handleDateChange(setSelectedDate, e)}
      >
        {dates_list.map((option) => (
          <ComboboxOption key={option} value={option} />
        ))}
      </Combobox>

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
import { useState, useEffect} from 'react';
import styles from './FilterSection.module.css';
import Button from '@leafygreen-ui/button';
import { Option, OptionGroup, Select, Size } from '@leafygreen-ui/select';
import TimeSlider from './TimeSlider'; // Import the TimeSlider component

const SeparationBar = () => <hr className={styles.separationBar} />;

function FilterSection({ response, setResponse, dates_list, airports_list }) {
  dates_list.sort((a, b) => new Date(b) - new Date(a));

  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dates_list[0]);
  const [departureTime, setDepartureTime] = useState('00:00');
  const [arrivalTime, setArrivalTime] = useState('00:00');
  const [selectedDeparture, setSelectedDeparture] = useState('');
  const [selectedArrival, setSelectedArrival] = useState('');
  const initial_filters = {};
    
  const fetchResults = async (params) => {
    setLoading(true);
    try {
      console.log('Params detected');
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`/api/filters?${queryString}`);
      console.log(queryString);

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
    console.log('Applying filters');
    console.log(filters);

    // Get the parsed time
    const dep_time = convertTimeToISO(departureTime);
    const arr_time = convertTimeToISO(arrivalTime);

    // Checking if the params have to be included or not
    const params = {};

    if (selectedDeparture.length > 0) {
      params['dep_arp._id'] = selectedDeparture;
    }

    if (selectedArrival.length > 0) {
      params['arr_arp._id'] = selectedArrival;
    }

    if (dep_time) {
      params['dep_time'] = dep_time;
    }
    if (arr_time) {
      params['arr_time'] = arr_time;
    }

    console.log(params);

    setFilters(params);
    fetchResults(params);
  };

  const resetFilters = () => {
    // Reset the filters after applying the previous ones
    setSelectedDate(dates_list[0]);
    setDepartureTime('00:00');
    setArrivalTime('00:00');
    setSelectedDeparture('');
    setSelectedArrival('');
    setFilters(initial_filters);

    // Fetch data without params
    fetchResults(initial_filters);
    console.log(filters);
  };

  const handleAirportChanges = (setter, value) => {
    setter(value ? value.substring(0, 3) : []);
  };

  const handleArrivalChange = (e) => setSelectedArrival(e);
  const handleDepartureChange = (e) => setSelectedDeparture(e);

  const handleDateChange = (setter, value) => {
    setter(value || dates_list[0]);
  };

  const convertTimeToISO = (timeString) => {
    // Create the timestamp value for the filtering based on the selected date
    const [year, month, day] = String(selectedDate).split('-');
    const [hours, minutes] = timeString.split(':');
    const date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00.000Z`);
    return date.toISOString();
  };


  return (
    <div className={styles.filterSelection}>
      <h2>Filter Selection</h2>
      <SeparationBar />

      <Select
        className={styles.filterSelect}
        label="Flight date"
        placeholder="Select the date"
        value={selectedDate}
        size={Size.Default}
        onChange={(e) => handleDateChange(setSelectedDate, e)}
      >
        {dates_list.map((option) => (
          <Option key={option} value={option}>{option}</Option>
        ))}
      </Select>

      <SeparationBar />
      <TimeSlider
        label="Departure Time: "
        state={departureTime}
        setter={setDepartureTime}
      />
      <TimeSlider
        label="Arrival Time: "
        state={arrivalTime}
        setter={setArrivalTime}
      />
      <SeparationBar />

      <Select
        className={styles.filterSelect}
        label="Departure Location"
        placeholder="Select departure airport"
        value={selectedDeparture}
        size={Size.Default}
        onChange={(e) => handleDepartureChange(e)}
      >
        {airports_list.map((option) => (
          <Option key={option} value={option}>{option}</Option>
        ))}
      </Select>

      <Select
        className={styles.filterSelect}
        label="Arrival Location"
        placeholder="Select arrival airport"
        value={selectedArrival}
        size={Size.Default}
        onChange={(e) => handleArrivalChange(e)}
      >
        {airports_list.map((option) => (
          <Option key={option} value={option}>{option}</Option>
        ))}
      </Select>

      <div className={styles.filterbuttonSection}>
        <Button className={styles.filterButton} onClick={applyFilters}>Apply Filters</Button>
        <Button className={styles.filterButton} onClick={resetFilters}>Reset Filters</Button>
      </div>
    </div>
  );
}

export default FilterSection;

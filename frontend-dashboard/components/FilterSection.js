import { useState, useEffect} from 'react';
import styles from './FilterSection.module.css';
import Button from '@leafygreen-ui/button';
import { Option, OptionGroup, Select, Size } from '@leafygreen-ui/select';
import TimeSlider from './TimeSlider'; // Import the TimeSlider component

const SeparationBar = () => <hr className={styles.separationBar} />;

function FilterSection({ response, setResponse, dates_list, departureOptions, arrivalOptions}) {
  // dates_list.sort((a, b) => new Date(b) - new Date(a));

  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [enableTimeFilters, setEnableTimeFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [departureTime, setDepartureTime] = useState('00:00');
  const [arrivalTime, setArrivalTime] = useState('23:50');
  const [selectedDeparture, setSelectedDeparture] = useState('');
  const [selectedArrival, setSelectedArrival] = useState('');
  const initial_filters = {};

    
  const fetchResults = async (params) => {
    setLoading(true);
    try {
      console.log('Params detected in fetchResults:', params);
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`/api/filters?${queryString}`);
      // console.log(queryString);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      setResults(data.filteredFlights);
      setResponse(data.filteredFlights);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    console.log('Applying filters');

    const params = {};

    if (selectedDeparture.length > 0) params['dep_arp._id'] = selectedDeparture;
    if (selectedArrival.length > 0) params['arr_arp._id'] = selectedArrival;

    // Time filters
    if (enableTimeFilters) {
      if (!selectedDate) {
        alert('Please select a date before applying time filters.');
        return;
      }

      // Get dep_time start and end in UTC
      const dep_time_start = convertTimeToUTC(departureTime);
      const dep_time_end = convertTimeToUTC("23:50");

      const arr_time_start = convertTimeToUTC("00:00");
      const arr_time_end = convertTimeToUTC(arrivalTime);

      console.log('Converted Departure Time UTC:', dep_time_start, 'to', dep_time_end);
      console.log('Converted Arrival Time UTC:', arr_time_start, 'to', arr_time_end);

      params['dep_time_start'] = dep_time_start;;
      params['dep_time_end'] = dep_time_end;
      params['arr_time_start'] = arr_time_start;
      params['arr_time_end'] = arr_time_end;
    }

    setFilters(params);
    fetchResults(params);
  };

  const resetFilters = () => {
    setSelectedDate('');
    setDepartureTime('00:00');
    setArrivalTime('23:50');
    setSelectedDeparture('');
    setSelectedArrival('');
    setFilters(initial_filters);

    fetchResults(initial_filters);
  };


  const handleArrivalChange = (e) => setSelectedArrival(e);
  const handleDepartureChange = (e) => setSelectedDeparture(e);

  const handleDateChange = (setter, value) => {
    setter(value || dates_list[0]);
  };

  const convertTimeToUTC = (timeString) => {

    const [day, month, year] = String(selectedDate).split('-');
    const [hours, minutes] = timeString.split(':');
    const date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00.000`);

    console.log('Converted Date Object:', date.toISOString());
    return date.toISOString();
  };

  return (
    <div className={styles.filterSelection}>
      <h2>Filters</h2>
      <SeparationBar />

      {/* 🆕 Switch for time filters */}
      <div className={styles.switchRow}>
         <label htmlFor="time-toggle">
          Enable time filters
        </label>
          <input
            type="checkbox"
            checked={enableTimeFilters}
            className={styles.toggleSwitch}
            onChange={(e) => setEnableTimeFilters(e.target.checked)}
          />
      </div>

      {enableTimeFilters && (
        <>
          <Select
            className={styles.filterSelect}
            label="Flight date"
            placeholder="Select the date"
            value={selectedDate}
            size={Size.Default}
            onChange={(e) => setSelectedDate(e)}
          >
            {dates_list.map((option) => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
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
        </>
      )}

      <Select
        className={styles.filterSelect}
        label="Departure Location"
        placeholder="Select departure airport"
        value={selectedDeparture}
        size={Size.Default}
        onChange={(e) => setSelectedDeparture(e)}
      >
        {departureOptions.map((option) => (
          <Option key={option.value} value={option.value}>{option.label}</Option>
        ))}
      </Select>

      <Select
        className={styles.filterSelect}
        label="Arrival Location"
        placeholder="Select arrival airport"
        value={selectedArrival}
        size={Size.Default}
        onChange={(e) => setSelectedArrival(e)}
      >
        {arrivalOptions.map((option) => (
          <Option key={option.value} value={option.value}>{option.label}</Option>
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

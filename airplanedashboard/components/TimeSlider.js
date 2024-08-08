// TimeSlider.js
import React from 'react';
import styles from './TimeSlider.module.css'; // Assuming you use CSS modules for styling

const TimeSlider = ({ label, state, setter }) => {
  
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
    <div className={styles.filterTimeSlider}>
      <div>{label}</div>
      <input
        type="range"
        min="0"
        max={timeValues.length - 1}
        step="1"
        value={timeValues.indexOf(state)}
        onChange={handleSliderChange}
        className={styles.slider}
      />
      <label>Selected Time: {state}</label>
    </div>
  );
};

export default TimeSlider;

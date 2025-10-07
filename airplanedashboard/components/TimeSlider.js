import React from 'react';
import styles from './TimeSlider.module.css';

const TimeSlider = ({ label, state, setter }) => {
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

  const timeValues = generateTimeValues();
  const currentIndex = timeValues.indexOf(state);
  const progress = (currentIndex / (timeValues.length - 1)) * 100;

  const handleSliderChange = (e) => {
    setter(timeValues[e.target.value]);
  };

  return (<div>
      {label === "Departure Time: " ? (
        <div className={styles.filterTimeSlider}>
        <div>{label}</div>
        <input
          type="range"
          min="0"
          max={timeValues.length - 1}
          step="1"
          value={currentIndex}
          onChange={handleSliderChange}
          className={styles.slider}
          style={{
            background: `linear-gradient(
              to right,
              #ddd ${progress}%,
              #00684A ${progress}%
            )`
          }}
        />
        <label>Departing after: {state}</label>
      </div>
      ) : (
        <div className={styles.filterTimeSlider}>
        <div>{label}</div>
        <input
          type="range"
          min="0"
          max={timeValues.length - 1}
          step="1"
          value={currentIndex}
          onChange={handleSliderChange}
          className={styles.slider}

          
          style={{
            background: `linear-gradient(
              to right,
              #00684A ${progress}%,
              #ddd ${progress}%
            )`
          }}
        />
        <label>Arriving before: {state}</label>
      </div>
      )}
    </div>
  );
};

export default TimeSlider;

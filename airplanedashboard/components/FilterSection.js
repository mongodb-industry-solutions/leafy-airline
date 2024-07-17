import styles from './Layout.module.css';

const FilterSection = () => (
  <div className={styles.filterSelection}>
    <h2>Filter Selection</h2>
    <div className={styles.filterGroup}>
      <label>Departure Time</label>
      <input type="range" min="0" max="24" className={styles.slider} />
    </div>
    <div className={styles.filterGroup}>
      <label>Arrival Time</label>
      <input type="range" min="0" max="24" className={styles.slider} />
    </div>
    <div className={styles.filterGroup}>
      <label>Departure Location</label>
      <input type="text" placeholder="Insert Departure Location..." className={styles.input} />
    </div>
    <div className={styles.filterGroup}>
      <label>Arrival Location</label>
      <input type="text" placeholder="Insert Arrival Location..." className={styles.input} />
    </div>
  </div>
);

export default FilterSection;

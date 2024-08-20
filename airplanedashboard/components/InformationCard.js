import React from 'react';
import styles from'./InformationCard.module.css'; // Import the CSS file
import Icon from '@leafygreen-ui/icon';

const InformationCard = ({title, text}) => {
    return (
        <div className={styles.cardcontainer}>
            <Icon className={styles.icon} glyph="InfoWithCircle" />
            <div className={styles.card}>
                <h3><strong>{title}</strong></h3>
                <p>{text}</p>
            </div>
        </div>
    );
};

export default InformationCard;

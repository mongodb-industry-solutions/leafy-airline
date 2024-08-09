import React from 'react';
import styles from'./InformationCard.module.css'; // Import the CSS file
import Icon from '@leafygreen-ui/icon';

const InformationCard = ({title, text}) => {
    return (
        <div className={styles.cardcontainer}>
            <Icon className={styles.icon} glyph="InfoWithCircle" fill="#00684A" />
            <div className={styles.card}>
                <h4>{title}</h4>
                <p>{text}</p>
            </div>
        </div>
    );
};

export default InformationCard;

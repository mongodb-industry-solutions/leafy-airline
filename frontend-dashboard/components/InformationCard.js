import styles from'./InformationCard.module.css';
import Icon from '@leafygreen-ui/icon';
import { useRef, useState } from 'react';

const InformationCard = ({title, text}) => {
    const containerRef = useRef(null);
    const cardRef = useRef(null);
    const [cardStyle, setCardStyle] = useState({});

    const handleMouseEnter = () => {
        if (containerRef.current && cardRef.current) {
            const iconRect = containerRef.current.getBoundingClientRect();
            const newStyle = {
                top: iconRect.bottom + window.scrollY + 5,
                left: iconRect.left + window.scrollX - 100,
            };
            setCardStyle(newStyle);
        }
    };

    return (
        <div 
            ref={containerRef}
            className={styles.cardcontainer}
            onMouseEnter={handleMouseEnter}
        >
            <Icon className={styles.icon} glyph="InfoWithCircle" />
            <div 
                ref={cardRef}
                className={styles.card}
                style={cardStyle}
            >
                <h3><strong>{title}</strong></h3>
                <p>{text}</p>
            </div>
        </div>
    );
};

export default InformationCard;

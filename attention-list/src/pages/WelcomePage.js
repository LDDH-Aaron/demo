import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/WelcomePage.module.css';

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <svg className={styles.logo} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="#333" strokeWidth="1.5"/>
          <path d="M12 7V12L15.5 14.5" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <h1 className={styles.title}>Dhの注意力清单</h1>
        <p className={styles.subtitle}>
          管理注意力，提高生产力
        </p>
        <button 
          className={styles.button}
          onClick={() => navigate('/energy-triangle')}
        >
          开始记录吧
        </button>
        <div className={styles.features}>
          <div className={styles.feature}>
            <svg className={styles.featureIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 20H22L12 2Z" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className={styles.featureText}>注意力三角形</span>
          </div>
          <div className={styles.feature}>
            <svg className={styles.featureIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className={styles.featureText}>注意力随手记</span>
          </div>
          <div className={styles.feature}>
            <svg className={styles.featureIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 5H20V14C20 16.7614 17.7614 19 15 19H9C6.23858 19 4 16.7614 4 14V5Z" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 10H16" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8 14H13" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className={styles.featureText}>注意力AI管家</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage; 
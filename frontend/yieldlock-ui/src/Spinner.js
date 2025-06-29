import React from 'react';
import './App.css';

const Spinner = ({ text = 'Loading...' }) => (
  <div className="spinner-container">
    <div className="spinner"></div>
    <span style={{ marginTop: '1rem', color: '#10b981', fontWeight: 500 }}>{text}</span>
  </div>
);

export default Spinner; 
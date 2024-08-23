import React from 'react';

const AdComponent: React.FC = () => {
  return (
    <div className="ad-container">
      <div className="ad-box ad-box-blue">
        <div className="box">
          <h2 className="ad-title">Special Offer</h2>
          <h1 className="ad-percentage">50% OFF</h1>
          <p className="ad-text">Select hotel deals</p>
          <button className="ad-button">Learn More</button>
        </div>
        <img className="ad-image" src="/img/img-1.png" alt="Special Offer" />
      </div>
      <div className="ad-box ad-box-yellow">
        <div className="box">
          <h2 className="ad-title">Get 20% OFF!</h2>
          <p className="ad-text">Let's explore the world.</p>
          <button className="ad-button">Book Now</button>
        </div>
        <img className="ad-image" src="/img/img-2.png" alt="Explore the World" />
      </div>
    </div>
  );
};

export default AdComponent;

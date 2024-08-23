import React from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

interface StatProps {
  end: number;
  label: string;
}

const StatComponent: React.FC<StatProps> = ({ end, label }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,   
  });

  return (
    <div className="stat" ref={ref}>
      <h1>
        {inView && <CountUp start={0} end={end} duration={2.5} separator="," />}
      </h1>
      <p>{label}</p>
    </div>
  );
};

const NumberStats: React.FC = () => {
  return (
    <div className="stats-container">
      <StatComponent end={1650} label="Unique Places & Events" />
      <StatComponent end={4550} label="Happy Clients & Customers" />
      <StatComponent end={400} label="Add New Places Every Day" />
      <StatComponent end={120} label="Members in Community" />
    </div>
  );
};

export default NumberStats;

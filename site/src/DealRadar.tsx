import React from 'react';

interface Deal {
  id: string;
  title: string;
  discount: string;
  distance: number;
}

interface DealRadarProps {
  deals: Deal[];
}

const DealRadar: React.FC<DealRadarProps> = ({ deals }) => {
  return (
    <div>
      <h2>Deal Radar</h2>
      <p>{deals.length} deals detected</p>
    </div>
  );
};

export default DealRadar;

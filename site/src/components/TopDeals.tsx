import React from 'react';

interface Deal {
  id: string;
  title: string;
  discount: string;
}

interface TopDealsProps {
  deals: Deal[];
}

const TopDeals: React.FC<TopDealsProps> = ({ deals }) => {
  return (
    <div>
      <h2>Top Deals</h2>
      <ul>
        {deals.map((deal) => (
          <li key={deal.id}>
            <strong>{deal.discount}</strong> {deal.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopDeals;

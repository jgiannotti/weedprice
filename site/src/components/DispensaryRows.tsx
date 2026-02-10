import React from 'react';

interface Deal {
  id: string;
  title: string;
  discount: string;
}

interface Dispensary {
  id: string;
  name: string;
  deals: Deal[];
}

interface DispensaryRowsProps {
  dispensaries: Dispensary[];
}

const DispensaryRows: React.FC<DispensaryRowsProps> = ({ dispensaries }) => {
  return (
    <div>
      <h2>Dispensaries</h2>
      {dispensaries.map((disp) => (
        <div key={disp.id}>
          <h3>{disp.name}</h3>
          <ul>
            {disp.deals.map((deal) => (
              <li key={deal.id}>
                <strong>{deal.discount}</strong> {deal.title}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default DispensaryRows;

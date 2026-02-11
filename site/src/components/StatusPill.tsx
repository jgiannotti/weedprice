import React from 'react';

export type DealStatus = 'Verified' | 'Parsed' | 'Stale' | 'Unknown';

interface StatusPillProps {
  status: DealStatus;
}

const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  let className = '';
  switch (status) {
    case 'Verified':
      className = 'bg-green-200 text-green-800';
      break;
    case 'Parsed':
      className = 'bg-blue-200 text-blue-800';
      break;
    case 'Stale':
      className = 'bg-yellow-200 text-yellow-800';
      break;
    default:
      className = 'bg-gray-200 text-gray-800';
  }

  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${className}`}>
      {status}
    </span>
  );
};

export default StatusPill;

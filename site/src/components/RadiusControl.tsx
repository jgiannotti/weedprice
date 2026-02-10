import React from 'react';

interface RadiusControlProps {
  radius: number;
  onChange: (radius: number) => void;
}

const RadiusControl: React.FC<RadiusControlProps> = ({ radius, onChange }) => {
  return (
    <div>
      <label htmlFor="radius">Radius (miles):</label>
      <select
        id="radius"
        value={radius}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={15}>15</option>
        <option value={25}>25</option>
      </select>
    </div>
  );
};

export default RadiusControl;

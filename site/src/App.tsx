import React, { useEffect, useState } from 'react';
import LocationBanner from './components/LocationBanner';
import RadiusControl from './components/RadiusControl';
import FiltersBar from './components/FiltersBar';
import TopDeals from './components/TopDeals';
import DispensaryRows from './components/DispensaryRows';
import StatusPill from './components/StatusPill';
import MapPanel from './components/MapPanel';
import DealRadar from './DealRadar';

interface Deal {
  id: string;
  title: string;
  description?: string;
  percent?: number;
  type: string;
  dispensary: string;
  distance: number;
}

interface DispensaryGroup {
  name: string;
  deals: Deal[];
}

const App: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dispensaries, setDispensaries] = useState<DispensaryGroup[]>([]);
  const [radius, setRadius] = useState<number>(15);

  useEffect(() => {
    fetch('/deals.json')
      .then(res => res.json())
      .then((data: Deal[]) => {
        setDeals(data);
        const groups: { [key: string]: Deal[] } = {};
        data.forEach(deal => {
          groups[deal.dispensary] = groups[deal.dispensary] || [];
          groups[deal.dispensary].push(deal);
        });
        const grouped = Object.entries(groups).map(([name, deals]) => ({ name, deals }));
        setDispensaries(grouped);
      })
      .catch(() => {
        setDeals([]);
        setDispensaries([]);
      });
  }, []);

  const topDeals = [...deals]
    .sort((a, b) => (b.percent || 0) - (a.percent || 0))
    .slice(0, 10);

  const handleRadiusChange = (value: number) => {
    setRadius(value);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <LocationBanner />
      <RadiusControl radius={radius} onChange={handleRadiusChange} />
      <DealRadar deals={deals} />
      <FiltersBar />
      <TopDeals deals={topDeals} />
      <DispensaryRows dispensaries={dispensaries} />
      <MapPanel />
      <StatusPill status="Parsed" />
    </div>
  );
};

export default App;

import React from 'react';
import LocationBanner from './components/LocationBanner';
import RadiusControl from './components/RadiusControl';
import FiltersBar from './components/FiltersBar';
import TopDeals from './components/TopDeals';
import DispensaryRows from './components/DispensaryRows';
import StatusPill from './components/StatusPill';
import MapPanel from './components/MapPanel';
import DealRadar from './DealRadar';

const App: React.FC = () => {
  const topDeals: any[] = [];
  const dispensaries: any[] = [];

  return (
    <div className="container mx-auto p-4 space-y-4">
      <LocationBanner />
      <RadiusControl />
      <DealRadar deals={topDeals} />
      <FiltersBar />
      <TopDeals deals={topDeals} />
      <DispensaryRows dispensaries={dispensaries} />
      <MapPanel />
      <StatusPill status="Parsed" />
    </div>
  );
};

export default App;

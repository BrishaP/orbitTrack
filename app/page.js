'use client'
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic'
import LayersControl from './components/LayersControl';

const EarthGlobe = dynamic(() => import('./components/EarthGlobe'), { ssr: false })

export default function Home() {
  const [visibleLayers, setVisibleLayers] = useState({
    debris: true,
    active: true,
    collisions: true,
  });

  const [layerCounts, setLayerCounts] = useState({
    debris: 0,
    active: 0,
    collisions: 0,
  });

  const layerColors = {
    debris: '#FF183F',
    active: '#16C1FF',
    collisions: '#FFFF00',
  };

  const handleToggleLayer = (layer, isVisible) => {
    setVisibleLayers(prev => ({ ...prev, [layer]: isVisible }));
  };

  const updateLayerCounts = (counts) => {
    setLayerCounts(counts);
  };

  return (
    <main className="flex min-h-screen h-screen w-screen flex-col items-center justify-between p-0">
      <div className="ui">
        <LayersControl onToggleLayer={handleToggleLayer} layerCounts={layerCounts} layerColors={layerColors} />
      </div>
      <EarthGlobe visibleLayers={visibleLayers} updateLayerCounts={updateLayerCounts} />
    </main>
  );
}
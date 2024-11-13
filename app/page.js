'use client'
import { useState } from 'react';
import dynamic from 'next/dynamic'
import LayersControl from './components/LayersControl';

const EarthGlobe = dynamic(() => import('./components/EarthGlobe'), { ssr: false })

export default function Home() {
  const [visibleLayers, setVisibleLayers] = useState({
    debris: true,
    active: true,
    collisions: true,
  });

  const handleToggleLayer = (layer, isVisible) => {
    setVisibleLayers(prev => ({ ...prev, [layer]: isVisible }));
  };

  return (
    <main className="flex min-h-screen h-screen w-screen flex-col items-center justify-between p-0">
      <div className="ui">
        <LayersControl onToggleLayer={handleToggleLayer} />
      </div>
      <EarthGlobe visibleLayers={visibleLayers} />
    </main>
  );
}
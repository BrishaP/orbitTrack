'use client'
import { useState } from 'react';
import dynamic from 'next/dynamic';
import LayersControl from './components/LayersControl';
import Settings from './components/Settings';

const EarthGlobe = dynamic(() => import('./components/EarthGlobe'), { ssr: false });

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

  const [earthTexture, setEarthTexture] = useState('earth-texture.jpg');
  const [brightness, setBrightness] = useState(2.5); // Set default value to 2.5
  const [showOutlines, setShowOutlines] = useState(true);

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
        <Settings
          earthTexture={earthTexture}
          setEarthTexture={setEarthTexture}
          brightness={brightness}
          setBrightness={setBrightness}
          showOutlines={showOutlines}
          setShowOutlines={setShowOutlines}
        />
      </div>
      <EarthGlobe
        visibleLayers={visibleLayers}
        updateLayerCounts={updateLayerCounts}
        earthTexture={earthTexture}
        brightness={brightness}
        showOutlines={showOutlines}
      />
    </main>
  );
}
'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Loader from './components/Loader';
import SettingsPanel from './components/SettingsPanel';

const EarthScene = dynamic(() => import('./components/EarthScene'), { ssr: false });

const satelliteCache = new Map();

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

let requestCount = 0;
const maxRequests = 5;
const timeFrame = 60000; // 1 minute

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
  const [loading, setLoading] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [beginClicked, setBeginClicked] = useState(false);

  const handleSatelliteClick = async (satellite) => {
    setSelectedSatellite(satellite);

    if (satelliteCache.has(satellite.NORAD_CAT_ID)) {
      setSelectedSatellite(prev => ({ ...prev, ...satelliteCache.get(satellite.NORAD_CAT_ID) }));
      return;
    }

    if (requestCount >= maxRequests) {
      console.error('Rate limit exceeded. Please try again later.');
      return;
    }

    requestCount++;
    setTimeout(() => requestCount--, timeFrame);

    try {
      const response = await axios.get(`https://celestrak.org/NORAD/elements/gp.php?CATNR=${satellite.NORAD_CAT_ID}&FORMAT=json`);
      const data = response.data[0]; // Assuming the first result is the correct one
      satelliteCache.set(satellite.NORAD_CAT_ID, data);
      setSelectedSatellite(prev => ({ ...prev, ...data }));
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.error('Rate limit exceeded. Please try again later.');
      } else {
        console.error('Error fetching satellite data:', error);
      }
    }
  };

  const debouncedHandleSatelliteClick = debounce(handleSatelliteClick, 300);

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

  useEffect(() => {
    // Simulate loading time for assets and data fetching
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Adjust the timeout as needed

    return () => clearTimeout(timer);
  }, []);

  const handleSceneReady = () => {
    setSceneReady(true);
  };

  const handleBeginClick = () => {
    setBeginClicked(true);
  };

  return (
    <main className="flex min-h-screen h-screen w-screen flex-col items-center justify-between p-0">
      {(!beginClicked || !sceneReady) && <Loader onBegin={handleBeginClick} sceneReady={sceneReady} />}
      {beginClicked && sceneReady && (
        <SettingsPanel
          earthTexture={earthTexture}
          setEarthTexture={setEarthTexture}
          brightness={brightness}
          setBrightness={setBrightness}
          showOutlines={showOutlines}
          setShowOutlines={setShowOutlines}
          visibleLayers={visibleLayers}
          handleToggleLayer={handleToggleLayer}
          layerCounts={layerCounts}
          layerColors={layerColors}
          selectedSatellite={selectedSatellite}
        />
      )}
      <EarthScene
        visibleLayers={visibleLayers}
        updateLayerCounts={updateLayerCounts}
        earthTexture={earthTexture}
        brightness={brightness}
        showOutlines={showOutlines}
        onSceneReady={handleSceneReady}
        onSatelliteClick={debouncedHandleSatelliteClick}
      />
    </main>
  );
};
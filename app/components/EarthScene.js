'use client'
import { useRef, useEffect, useState } from 'react';
import { Canvas, extend } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import axios from 'axios';
import { sRGBEncoding } from 'three';
import Earth from './Earth';
import Satellites from './Satellites';
import Moon from './Moon';
import * as satellite from 'satellite.js'


extend({ OutlinePass, EffectComposer, RenderPass, ShaderPass, GammaCorrectionShader });

const tleSources = [
  {
    group: 'debris',
    color: 0xFF183F, // Shared color for debris
    urls: [
      'https://celestrak.org/NORAD/elements/gp.php?GROUP=cosmos-1408-debris&FORMAT=tle',
      'https://celestrak.org/NORAD/elements/gp.php?GROUP=fengyun-1c-debris&FORMAT=tle',
      'https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium-33-debris&FORMAT=tle',
      'https://celestrak.org/NORAD/elements/gp.php?GROUP=cosmos-2251-debris&FORMAT=tle'
    ],
    files: [
      '../data/cosmos1408.txt',
      './data/fengyun1c.txt',
      './data/iridium33.txt',
      './data/cosmos2251.txt'
    ]
  },
  {
    url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle',
    color: 0x1697FF,
    file: './data/activesatellite.txt'
  }  // Active satellites
];

export default function EarthGlobe({ visibleLayers, updateLayerCounts, earthTexture, brightness, showOutlines, onSceneReady, onSatelliteClick }) {
  const [satellites, setSatellites] = useState([]);
  const earthRef = useRef();
  const outlineRef = useRef();
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchTLEData = async () => {
    const lastFetchTime = localStorage.getItem('lastFetchTime');
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    if (!lastFetchTime || now - lastFetchTime > oneDay) {
      try {
        await axios.get('/api/update-tle-data');
        localStorage.setItem('lastFetchTime', now);
      } catch (error) {
        console.error('Error updating TLE data:', error);
      }
    }

    try {
      const filePromises = tleSources.flatMap(source => {
        if (source.group === 'debris') {
          return source.files.map(file => fetch(file).then(response => response.text()).then(data => ({ data, color: source.color, group: source.group })));
        } else {
          return fetch(source.file).then(response => response.text()).then(data => ({ data, color: source.color, group: 'active' }));
        }
      });

      const fileResponses = await Promise.all(filePromises);

      const newSatellites = fileResponses.flatMap(({ data, color, group }) => {
        const tleLines = data.trim().split('\n');
        const satellites = [];
        for (let i = 0; i < tleLines.length; i += 3) {
          const name = tleLines[i].trim();
          const tleLine1 = tleLines[i + 1]?.trim();
          const tleLine2 = tleLines[i + 2]?.trim();
          if (tleLine1 && tleLine2) {
            const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
            const positionAndVelocity = satellite.propagate(satrec, new Date());
            const positionEci = positionAndVelocity.position;
            const position = new THREE.Vector3(positionEci.x / 6371, positionEci.z / 6371, -positionEci.y / 6371);
            const noradCatId = tleLine1.split(' ')[1].replace(/[^\d]/g, ''); // Extract NORAD_CAT_ID and remove non-digit characters
            satellites.push({ name, tleLine1, tleLine2, satrec, color, group, position, NORAD_CAT_ID: noradCatId });
          }
        }
        return satellites;
      });

      // Detect collisions
      const collisionThreshold = 0.01; // Adjust this value as needed
      detectCollisions(newSatellites, collisionThreshold);

      setSatellites(newSatellites);
    } catch (error) {
      console.error('Error fetching TLE data from local files:', error);
    }
  };

  useEffect(() => {
    fetchTLEData();
  }, []);

  useEffect(() => {
    const layerCounts = {
      debris: satellites.filter(sat => sat.group === 'debris' && !sat.isCollision).length,
      active: satellites.filter(sat => sat.group === 'active' && !sat.isCollision).length,
      collisions: satellites.filter(sat => sat.isCollision).length,
    };
    updateLayerCounts(layerCounts);
  }, [satellites]);

  useEffect(() => {
    if (isLoaded) {
      onSceneReady();
    }
  }, [isLoaded, onSceneReady]);

  // Function to calculate the distance between two vectors
  const calculateDistance = (vec1, vec2) => {
    return vec1.distanceTo(vec2);
  };

  // Function to detect potential collisions
  const detectCollisions = (satellites, threshold) => {
    const collisions = [];
    for (let i = 0; i < satellites.length; i++) {
      for (let j = i + 1; j < satellites.length; j++) {
        const sat1 = satellites[i];
        const sat2 = satellites[j];
        if (!sat1.position || !sat2.position) continue;
        const position1 = new THREE.Vector3(sat1.position.x, sat1.position.y, sat1.position.z);
        const position2 = new THREE.Vector3(sat2.position.x, sat2.position.y, sat2.position.z);
        const distance = calculateDistance(position1, position2);
        if (distance < threshold) {
          collisions.push({ sat1, sat2, distance });
          sat1.isCollision = true;
          sat2.isCollision = true;
        }
      }
    }
    return collisions;
  };

  return (
    <div className="w-full h-full bg-black">
      <Canvas
        camera={{ position: [0, 0, 2.5] }}
        className="w-full h-full"
        style={{ width: '100%', height: '100vh', aspectRatio: 'auto' }}
        onCreated={({ gl }) => {
          gl.outputEncoding = THREE.sRGBEncoding;
          setIsLoaded(true);
        }}
      >
        <ambientLight intensity={brightness} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Earth earthRef={earthRef} outlineRef={outlineRef} earthTexture={earthTexture} showOutlines={showOutlines} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        {visibleLayers.debris && <Satellites satellites={satellites.filter(sat => sat.group === 'debris' && !sat.isCollision)} onSatelliteClick={onSatelliteClick} />}
        {visibleLayers.active && <Satellites satellites={satellites.filter(sat => sat.group === 'active' && !sat.isCollision)} onSatelliteClick={onSatelliteClick} />}
        {visibleLayers.collisions && <Satellites satellites={satellites.filter(sat => sat.isCollision)} onSatelliteClick={onSatelliteClick} />}
        <Moon />
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}
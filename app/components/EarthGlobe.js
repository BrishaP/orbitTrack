'use client'
import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import * as satellite from 'satellite.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'
import axios from 'axios'
import { Vector3 } from 'three';

const geoJsonUrl = 'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/cultural/ne_110m_admin_0_countries.json'

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
  { url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle', 
    color: 0x16C1FF, 
    file: './data/activesatellite.txt' }  // Active satellites
];

export default function EarthGlobe() {
  const [satellites, setSatellites] = useState([]);
  const earthRef = useRef();
  const outlineRef = useRef();

  const fetchTLEData = async () => {
    const lastFetchTime = localStorage.getItem('lastFetchTime');
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;
  
    if (!lastFetchTime || now - lastFetchTime > oneDay) {
      try {
        // Call the server-side API to update the text files
        await axios.get('/api/update-tle-data');
        localStorage.setItem('lastFetchTime', now);
      } catch (error) {
        console.error('Error updating TLE data:', error);
      }
    }
  
    try {
      const filePromises = tleSources.flatMap(source => {
        if (source.group === 'debris') {
          return source.files.map(file => fetch(file).then(response => response.text()).then(data => ({ data, color: source.color })));
        } else {
          return fetch(source.file).then(response => response.text()).then(data => ({ data, color: source.color }));
        }
      });
  
      const fileResponses = await Promise.all(filePromises);
  
      const newSatellites = fileResponses.flatMap(({ data, color }) => {
        const tleLines = data.trim().split('\n');
        const satellites = [];
        for (let i = 0; i < tleLines.length; i += 3) {
          const name = tleLines[i].trim();
          const tleLine1 = tleLines[i + 1]?.trim();
          const tleLine2 = tleLines[i + 2]?.trim();
          if (tleLine1 && tleLine2) {
            const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
            satellites.push({ name, tleLine1, tleLine2, satrec, color });
          }
        }
        return satellites;
      });
  
      setSatellites(newSatellites);
    } catch (error) {
      console.error('Error fetching TLE data from local files:', error);
    }
  };
  
  useEffect(() => {
    fetchTLEData();
  }, []);

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
        const position1 = new Vector3(sat1.position.x, sat1.position.y, sat1.position.z);
        const position2 = new Vector3(sat2.position.x, sat2.position.y, sat2.position.z);
        const distance = calculateDistance(position1, position2);
        if (distance < threshold) {
          collisions.push({ sat1, sat2, distance });
        }
      }
    }
    return collisions;
  };

  function SatelliteComponent({ satellites }) {
    const meshRef = useRef()
    const dummy = new THREE.Object3D()
    const collisionThreshold = 0.01; // Adjust this value as needed

    useEffect(() => {
      const colors = new Float32Array(satellites.length * 3)
      satellites.forEach((sat, i) => {
        // Apply a shade variation to the base color
        const baseColor = new THREE.Color(sat.color)
        const shadeFactor = 0.8 + Math.random() * 0.4 // Adjust the range as needed
        const finalColor = baseColor.clone().multiplyScalar(shadeFactor)
        colors.set([finalColor.r, finalColor.g, finalColor.b], i * 3)
      })
      meshRef.current.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colors, 3))
    }, [satellites])

    useFrame(() => {
      const date = new Date();
      satellites.forEach((sat, i) => {
        const positionAndVelocity = satellite.propagate(sat.satrec, date);
        const positionEci = positionAndVelocity.position;
        dummy.position.set(positionEci.x / 6371, positionEci.z / 6371, -positionEci.y / 6371);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        sat.position = dummy.position.clone(); // Store the position for collision detection
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    
      // Detect collisions
      const collisions = detectCollisions(satellites, collisionThreshold);
      if (collisions.length > 0) {
        console.log('Potential collisions detected:', collisions);
        collisions.forEach(({ sat1, sat2 }) => {
          // Highlight the satellites involved in a collision
          const index1 = satellites.indexOf(sat1);
          const index2 = satellites.indexOf(sat2);
          if (index1 !== -1) {
            meshRef.current.setColorAt(index1, new THREE.Color(0xff0000)); // Red color for collision
          }
          if (index2 !== -1) {
            meshRef.current.setColorAt(index2, new THREE.Color(0xff0000)); // Red color for collision
          }
        });
        meshRef.current.instanceColor.needsUpdate = true;
      }
    })

    return (
      <instancedMesh ref={meshRef} args={[null, null, satellites.length]}>
        <sphereGeometry args={[0.005, 16, 16]}>
          <instancedBufferAttribute attach="attributes-color" args={[new Float32Array(satellites.length * 3), 3]} />
        </sphereGeometry>
        <meshBasicMaterial vertexColors={true} />
      </instancedMesh>
    )
  }

  function Earth({ earthRef, outlineRef }) {
    const { scene, camera, gl } = useThree();
    const [countryLines, setCountryLines] = useState([])
    const earthTexture = useLoader(TextureLoader, '/earth-texture.jpg')

    useEffect(() => {
      fetch(geoJsonUrl)
        .then(response => response.json())
        .then(data => {
          const lines = []
          data.features.forEach((feature) => {
            const color = '#76838c'
            if (feature.geometry.type === 'Polygon') {
              feature.geometry.coordinates.forEach((polygon) => {
                const points = polygon.map(([long, lat]) => latLongToVector3(lat, long))
                const geometry = new THREE.BufferGeometry().setFromPoints(points)
                const material = new THREE.LineBasicMaterial({ color, transparent: false, opacity: 1 })
                const line = new THREE.Line(geometry, material)
                lines.push(line)
              })
            } else if (feature.geometry.type === 'MultiPolygon') {
              feature.geometry.coordinates.forEach((polygons) => {
                polygons.forEach((polygon) => {
                  const points = polygon.map(([long, lat]) => latLongToVector3(lat, long))
                  const geometry = new THREE.BufferGeometry().setFromPoints(points)
                  const material = new THREE.LineBasicMaterial({ color, transparent: false, opacity: 1 })
                  const line = new THREE.Line(geometry, material)
                  lines.push(line)
                })
              })
            }
          })
          setCountryLines(lines)
        })
    }, [])

    useEffect(() => {
      const composer = new EffectComposer(gl);
    
      // Render pass for the scene
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);
    
      // Outline pass
      const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
      outlinePass.selectedObjects = [earthRef.current];
      outlinePass.edgeStrength = 2;
      outlinePass.edgeThickness = 1;
      outlinePass.visibleEdgeColor.set('#76838c');
      composer.addPass(outlinePass);
    
      // Gamma correction pass
      const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
      composer.addPass(gammaCorrectionPass);
    
      const animate = () => {
        requestAnimationFrame(animate);
        composer.render();
      };
      animate();
    }, [scene, camera, gl]);

    function latLongToVector3(lat, long, radius = 1.001) {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (long + 180) * (Math.PI / 180)
      const x = -(radius * Math.sin(phi) * Math.cos(theta))
      const z = radius * Math.sin(phi) * Math.sin(theta)
      const y = radius * Math.cos(phi)
      return new THREE.Vector3(x, y, z)
    }

    return (
      <>
        <mesh ref={earthRef}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial
            map={earthTexture}
            transparent={true} 
            opacity={0.95} 
            side={THREE.DoubleSide}
          />
        </mesh>
        {countryLines.map((line, index) => (
          <primitive key={index} object={line} />
        ))}
      </>
    )
  }

  function Moon() {
    const moonTexture = useLoader(TextureLoader, '/moon-texture.jpg')
    const moonRef = useRef()
  
    useFrame(({ clock }) => {
      const t = clock.getElapsedTime() * 0.1; // Scale down the elapsed time to slow down the orbit
      const distance = 60; // 60 times the Earth's radius
      moonRef.current.position.set(Math.sin(t) * distance, 0, Math.cos(t) * distance)
    })
  
    return (
      <mesh ref={moonRef}>
      <sphereGeometry args={[0.27, 32, 32]} /> {/* Moon's radius is about 0.27 times Earth's radius */}
      <meshStandardMaterial map={moonTexture} emissive={new THREE.Color(0xffffff)} emissiveIntensity={0.5} />
      </mesh>
    )
  }

  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 2.5] }} className="w-full h-full" style={{ width: '100%', height: '100vh', aspectRatio: 'auto' }}>
        <ambientLight intensity={0.25} />
        <pointLight position={[10, 10, 10]} />
        <Earth earthRef={earthRef} outlineRef={outlineRef} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <SatelliteComponent satellites={satellites} />
        <Moon />
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}
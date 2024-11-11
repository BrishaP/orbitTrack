'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import * as satellite from 'satellite.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';

const geoJsonUrl = 'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/cultural/ne_110m_admin_0_countries.json'

const tleData = [
  {
    line1: '1 22076U 92093A   20283.58306481  .00000070  00000-0  18614-4 0  9995',
    line2: '2 22076  82.5373 282.8150 0034374 195.2650 164.6810 13.74393097770952'
  },
  {
    line1: '1 31948U 07027D   20282.92045833  .00000038  00000-0  15958-4 0  9990',
    line2: '2 31948  98.0178 188.7072 0012211  79.0536 281.1817 14.57107883662136'
  },
  {
    line1: '1 43204U 18092A   20283.85784722  .00000018  00000-0  14067-4 0  9996',
    line2: '2 43204  97.4824 302.3462 0010023  60.5289 299.6988 15.21714668263267'
  },
  {
    line1: '1 39622U 14073E   20283.50072917  .00000065  00000-0  14315-4 0  9992',
    line2: '2 39622  74.0401 128.3834 0025084 201.3715 158.5825 14.34712754416973'
  },
  {
    line1: '1 35758U 93036A   20283.35416667  .00000084  00000-0  24174-4 0  9998',
    line2: '2 35758  74.0345  97.2596 0023542 127.1817 233.0421 14.34811097766282'
  }
];

function SatelliteComponent({ tle }) {
  const satelliteRef = useRef()

  useFrame(() => {
    if (satelliteRef.current) {
      const date = new Date()
      const satrec = satellite.twoline2satrec(tle.line1, tle.line2)
      const positionAndVelocity = satellite.propagate(satrec, date)
      const positionEci = positionAndVelocity.position

      satelliteRef.current.position.set(positionEci.x / 6371, positionEci.z / 6371, -positionEci.y / 6371)
    }
  })

  return (
    <mesh ref={satelliteRef}>
      <sphereGeometry args={[0.02, 16, 16]} />
      <meshBasicMaterial color={0xff0000} />
    </mesh>
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
      {/* <line ref={outlineRef}>
        <edgesGeometry args={[new THREE.CircleGeometry(1.05, 64)]} />
        <lineBasicMaterial color="#ffffff" />
      </line> */}
      {countryLines.map((line, index) => (
        <primitive key={index} object={line} />
      ))}
    </>
  )
}

export default function EarthGlobe() {
  const [satellites, setSatellites] = useState(tleData);
  const earthRef = useRef();
  const outlineRef = useRef();

  const addSatellite = (line1, line2) => {
    setSatellites(prev => [...prev, { line1, line2 }]);
  };

  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 2.5] }} className="w-full h-full" style={{ width: '100%', height: '100vh', aspectRatio: 'auto' }}>
        <ambientLight intensity={0.25} />
        <pointLight position={[10, 10, 10]} />
        <Earth earthRef={earthRef} outlineRef={outlineRef} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        {satellites.map((tle, index) => (
          <SatelliteComponent key={index} tle={tle} />
        ))}
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}
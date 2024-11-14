import { useMemo, useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureLoader, SRGBColorSpace } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

const geoJsonUrl = 'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/cultural/ne_110m_admin_0_countries.json';

export default function Earth({ earthRef, outlineRef, earthTexture, showOutlines }) {
  const { scene, camera, gl } = useThree();
  const [countryLines, setCountryLines] = useState([]);

  const textures = useMemo(() => {
    const loader = new TextureLoader();
    const texture1 = loader.load('/earth-texture.jpg');
    const texture2 = loader.load('/earth-texture-colour.jpg');
    texture1.colorSpace = SRGBColorSpace;
    texture2.colorSpace = SRGBColorSpace;
    return {
      'earth-texture.jpg': texture1,
      'earth-texture-colour.jpg': texture2,
    };
  }, []);

  useEffect(() => {
    fetch(geoJsonUrl)
      .then(response => response.json())
      .then(data => {
        const lines = [];
        data.features.forEach((feature) => {
          const color = '#76838c';
          if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates.forEach((polygon) => {
              const points = polygon.map(([long, lat]) => latLongToVector3(lat, long));
              const geometry = new THREE.BufferGeometry().setFromPoints(points);
              const material = new THREE.LineBasicMaterial({ color, transparent: false, opacity: 1 });
              const line = new THREE.Line(geometry, material);
              lines.push(line);
            });
          } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach((polygons) => {
              polygons.forEach((polygon) => {
                const points = polygon.map(([long, lat]) => latLongToVector3(lat, long));
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({ color, transparent: false, opacity: 1 });
                const line = new THREE.Line(geometry, material);
                lines.push(line);
              });
            });
          }
        });
        setCountryLines(lines);
      });
  }, []);

  useEffect(() => {
    const composer = new EffectComposer(gl);

    // Render pass for the scene
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const animate = () => {
      requestAnimationFrame(animate);
      composer.render();
    };
    animate();
  }, [scene, camera, gl]);

  function latLongToVector3(lat, long, radius = 1.001) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (long + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }

  return (
    <>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={textures[earthTexture]}
          transparent={false}
          opacity={1}
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>
      {showOutlines && countryLines.map((line, index) => (
        <primitive key={index} object={line} />
      ))}
    </>
  );
}
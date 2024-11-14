import { useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureLoader } from 'three';

function Moon() {
  const moonTexture = useLoader(TextureLoader, '/moon-texture.jpg');
  const moonRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.1; // Scale down the elapsed time to slow down the orbit
    const distance = 60; // 60 times the Earth's radius
    moonRef.current.position.set(Math.sin(t) * distance, 0, Math.cos(t) * distance);
  });

  return (
    <mesh ref={moonRef}>
      <sphereGeometry args={[0.27, 32, 32]} /> {/* Moon's radius is about 0.27 times Earth's radius */}
      <meshStandardMaterial map={moonTexture} emissive={new THREE.Color(0xffffff)} emissiveIntensity={0.5} />
    </mesh>
  );
}

export default Moon;
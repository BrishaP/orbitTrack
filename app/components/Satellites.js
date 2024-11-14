import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import * as satellite from 'satellite.js';

export default function SatelliteComponent({ satellites, onSatelliteClick }) {
  const meshRef = useRef();
  const dummy = new THREE.Object3D();
  const collisionThreshold = 0.01; // Adjust this value as needed

  useEffect(() => {
    const colors = new Float32Array(satellites.length * 3);
    satellites.forEach((sat, i) => {
      const baseColor = sat.isCollision ? new THREE.Color(0xFFFF00) : new THREE.Color(sat.color); // Yellow for collisions
      const shadeFactor = 0.8 + Math.random() * 0.4;
      const finalColor = baseColor.clone().multiplyScalar(shadeFactor);
      colors.set([finalColor.r, finalColor.g, finalColor.b], i * 3);
    });
    meshRef.current.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colors, 3));
  }, [satellites]);

  useFrame(() => {
    const date = new Date();
    satellites.forEach((sat, i) => {
      const positionAndVelocity = satellite.propagate(sat.satrec, date);
      const positionEci = positionAndVelocity.position;
      dummy.position.set(positionEci.x / 6371, positionEci.z / 6371, -positionEci.y / 6371);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      sat.position = dummy.position.clone();
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, satellites.length]}
      onClick={(event) => {
        const index = event.instanceId;
        if (index !== undefined) {
          onSatelliteClick(satellites[index]);
        }
      }}
    >
      <sphereGeometry args={[0.005, 16, 16]}>
        <instancedBufferAttribute attach="attributes-color" args={[new Float32Array(satellites.length * 3), 3]} />
      </sphereGeometry>
      <meshBasicMaterial vertexColors={true} />
    </instancedMesh>
  );
}
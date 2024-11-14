// FILE: EarthScene.js
'use client'
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as satellite from 'satellite.js';

const EarthScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Create the scene
    const scene = new THREE.Scene();

    // Create a camera, which determines what we'll see when we render the scene
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create a renderer and add it to our document
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Load the Earth texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/earth-texture.jpg');

    // Create a sphere geometry to represent the Earth
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ map: earthTexture });
    const earth = new THREE.Mesh(geometry, material);

    // Add the Earth to the scene
    scene.add(earth);

    // Add some lighting
    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Initialize OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 1000;

    // TLE data for satellites
    const tleData = [
      {
        name: 'Satellite 1',
        tle1: '1 25544U 98067A   20334.54791667  .00016717  00000-0  10270-3 0  9000',
        tle2: '2 25544  51.6442  21.4613 0001412  85.2888  74.7122 15.49180547246337'
      },
      {
        name: 'Satellite 2',
        tle1: '1 33591U 09005A   20334.54791667  .00000023  00000-0  00000+0 0  9000',
        tle2: '2 33591  98.1813  21.4613 0001412  85.2888  74.7122 14.49180547246337'
      }
    ];

    // Create satellite meshes
    const satelliteMeshes = tleData.map(data => {
      const satrec = satellite.twoline2satrec(data.tle1, data.tle2);
      const geometry = new THREE.SphereGeometry(0.05, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.satrec = satrec;
      scene.add(mesh);
      return mesh;
    });

    // Create an animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update satellite positions
      const now = new Date();
      satelliteMeshes.forEach(mesh => {
        const positionAndVelocity = satellite.propagate(mesh.userData.satrec, now);
        const positionEci = positionAndVelocity.position;
        const gmst = satellite.gstime(now);
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);
        const longitude = positionGd.longitude;
        const latitude = positionGd.latitude;
        const height = positionGd.height;

        const radius = 1 + height / 6371; // Earth radius + height
        const x = radius * Math.cos(latitude) * Math.cos(longitude);
        const y = radius * Math.cos(latitude) * Math.sin(longitude);
        const z = radius * Math.sin(latitude);

        mesh.position.set(x, y, z);
      });

      controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
      renderer.render(scene, camera);
    };

    // Start the animation loop
    animate();

    // Clean up on component unmount
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default EarthScene;
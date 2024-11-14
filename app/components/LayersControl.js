'use client'
import { useState } from 'react';

export default function LayersControl({ onToggleLayer, layerCounts, layerColors }) {
  const [layers, setLayers] = useState({
    debris: true,
    active: true,
    collisions: true,
  });

  const handleToggle = (layer) => {
    const newLayers = { ...layers, [layer]: !layers[layer] };
    setLayers(newLayers);
    onToggleLayer(layer, newLayers[layer]);
  };

  return (
    <div className="layers-control">
      <h4 className='ui-header'>Toggle Layers</h4>
      {Object.keys(layers).map((layer) => (
        <label key={layer} className="layer-label">
          <input
            type="checkbox"
            checked={layers[layer]}
            onChange={() => handleToggle(layer)}
          />
          <span className="layer-color" style={{ backgroundColor: layerColors[layer] }}></span>
          {layer.charAt(0).toUpperCase() + layer.slice(1)} ({layerCounts[layer]})
        </label>
      ))}
    </div>
  );
}
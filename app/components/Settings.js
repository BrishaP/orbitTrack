import React from 'react';

export default function Settings({ earthTexture, setEarthTexture, brightness, setBrightness, showOutlines, setShowOutlines }) {
    const handleToggleTexture = () => {
        setEarthTexture(prev => prev === 'earth-texture.jpg' ? 'earth-texture-colour.jpg' : 'earth-texture.jpg');
    };

    const handleBrightnessChange = (event) => {
        setBrightness(parseFloat(event.target.value));
    };

    const handleToggleOutlines = () => {
        setShowOutlines(prev => !prev);
    };

    const handleFlatEarthMode = (event) => {
        event.preventDefault();
        alert("Don't be silly 🤦‍♂️");
    };

    return (
        <div className="settings">
            <h4 className='ui-header'>Settings</h4>
            <label className='ui-label'>
                <input type="checkbox" onChange={handleToggleTexture} checked={earthTexture === 'earth-texture-colour.jpg'} />
                Toggle Earth Texture
            </label>
            <label className='ui-label'>
                Brightness:
                <div className="slider-container">
                    <input type="range" min="0.25" max="5.0" step="0.25" value={brightness} onChange={handleBrightnessChange} />
                    <span className="slider-value">{brightness}</span>
                </div>
            </label>
            <label className='ui-label'>
                <input type="checkbox" onChange={handleToggleOutlines} checked={showOutlines} />
                Show Country Outlines
            </label>
            <label className='ui-label'>
                <input type="checkbox" onClick={handleFlatEarthMode} />
                Flat Earth Mode
            </label>
        </div>
    );
}
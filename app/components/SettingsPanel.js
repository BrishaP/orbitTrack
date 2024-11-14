import React, { useState } from 'react';
import { Sling as Hamburger } from 'hamburger-react';
import LayersControl from './LayersControl';
import Settings from './Settings';
import SelectedSatellite from './SelectedSatellite';

export default function SettingsPanel({
    earthTexture, setEarthTexture,
    brightness, setBrightness,
    showOutlines, setShowOutlines,
    visibleLayers, handleToggleLayer,
    layerCounts, layerColors,
    selectedSatellite
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="settings-panel-wrapper">
            <div className="settings-panel-container">
                <Hamburger toggled={isOpen} toggle={setIsOpen} />
                {isOpen && (
                    <div className="settings-panel">
                        <LayersControl
                            onToggleLayer={handleToggleLayer}
                            layerCounts={layerCounts}
                            layerColors={layerColors}
                        />
                        <div className="linebreak"></div>
                        <Settings
                            earthTexture={earthTexture}
                            setEarthTexture={setEarthTexture}
                            brightness={brightness}
                            setBrightness={setBrightness}
                            showOutlines={showOutlines}
                            setShowOutlines={setShowOutlines}
                        />
                        <div className="linebreak"></div>
                        <SelectedSatellite satellite={selectedSatellite} />
                    </div>
                )}
            </div>
        </div>
    );
}
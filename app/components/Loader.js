import React, { useState } from 'react';

export default function Loader({ onBegin, sceneReady }) {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleBeginClick = () => {
        setIsAnimating(true);
        setTimeout(() => {
            onBegin();
        }, 1000); // Match the duration of the animation
    };

    return (
        <div className={`loader ${isAnimating ? 'fade-out' : ''}`}>
            {sceneReady ? (
                <button onClick={handleBeginClick} className="begin-button">
                    Begin
                </button>
            ) : (
                <div className="spinner">
                    <div className="orbit">
                        <div className="ring"></div>
                        <div className="moon"></div>
                    </div>
                    <div className="earth" />
                </div>
            )}
        </div>
    );
}
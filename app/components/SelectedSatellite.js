import React from 'react';

export default function SelectedSatellite({ satellite }) {
    if (!satellite) {
        return <div className="selected-satellite">No satellite selected</div>;
    }

    return (
        <div className="selected-satellite">
            <h4 className="ui-header">Selected Satellite</h4>
            <p>
                <strong>Name:</strong> {satellite.OBJECT_NAME || satellite.name}
                <span className="tooltip">?
                    <span className="tooltiptext">The name of the satellite.</span>
                </span>
            </p>
            <p>
                <strong>ID:</strong> {satellite.NORAD_CAT_ID}
                <span className="tooltip">?
                    <span className="tooltiptext">The unique identifier assigned to the satellite by NORAD.</span>
                </span>
            </p>
            <p>
                <strong>Object ID:</strong> {satellite.OBJECT_ID}
                <span className="tooltip">?
                    <span className="tooltiptext">The international designator for the satellite.</span>
                </span>
            </p>
            <p>
                <strong>Epoch:</strong> {satellite.EPOCH}
                <span className="tooltip">?
                    <span className="tooltiptext">The date and time of the orbital elements.</span>
                </span>
            </p>
            <p>
                <strong>Mean Motion:</strong> {satellite.MEAN_MOTION}
                <span className="tooltip">?
                    <span className="tooltiptext">The number of orbits the satellite completes in one day.</span>
                </span>
            </p>
            <p>
                <strong>Eccentricity:</strong> {satellite.ECCENTRICITY}
                <span className="tooltip">?
                    <span className="tooltiptext">The shape of the satellite's orbit (0 is a perfect circle).</span>
                </span>
            </p>
            <p>
                <strong>Inclination:</strong> {satellite.INCLINATION}
                <span className="tooltip">?
                    <span className="tooltiptext">The tilt of the satellite's orbit relative to the equator.</span>
                </span>
            </p>
            <p>
                <strong>RA of Ascending Node:</strong> {satellite.RA_OF_ASC_NODE}
                <span className="tooltip">?
                    <span className="tooltiptext">The right ascension of the ascending node, indicating the horizontal orientation of the orbit.</span>
                </span>
            </p>
            <p>
                <strong>Argument of Pericenter:</strong> {satellite.ARG_OF_PERICENTER}
                <span className="tooltip">?
                    <span className="tooltiptext">The argument of perigee, indicating the point of closest approach to Earth.</span>
                </span>
            </p>
            <p>
                <strong>Mean Anomaly:</strong> {satellite.MEAN_ANOMALY}
                <span className="tooltip">?
                    <span className="tooltiptext">The position of the satellite in its orbit at the epoch time.</span>
                </span>
            </p>
            <p>
                <strong>Classification Type:</strong> {satellite.CLASSIFICATION_TYPE}
                <span className="tooltip">?
                    <span className="tooltiptext">The classification of the satellite (e.g., "U" for unclassified).</span>
                </span>
            </p>
            <p>
                <strong>Element Set Number:</strong> {satellite.ELEMENT_SET_NO}
                <span className="tooltip">?
                    <span className="tooltiptext">The element set number, indicating the version of the orbital elements.</span>
                </span>
            </p>
            <p>
                <strong>Revolutions at Epoch:</strong> {satellite.REV_AT_EPOCH}
                <span className="tooltip">?
                    <span className="tooltiptext">The number of revolutions the satellite has completed at the epoch time.</span>
                </span>
            </p>
            <p>
                <strong>BStar:</strong> {satellite.BSTAR}
                <span className="tooltip">?
                    <span className="tooltiptext">The drag term, indicating the effect of atmospheric drag on the satellite.</span>
                </span>
            </p>
            <p>
                <strong>Mean Motion Dot:</strong> {satellite.MEAN_MOTION_DOT}
                <span className="tooltip">?
                    <span className="tooltiptext">The rate of change of the mean motion.</span>
                </span>
            </p>
            <p>
                <strong>Mean Motion Double Dot:</strong> {satellite.MEAN_MOTION_DDOT}
                <span className="tooltip">?
                    <span className="tooltiptext">Refers to the rate of change of the mean motion of a satellite over time. The mean motion is the average angular velocity needed for a satellite to complete one orbit around Earth, and it’s typically measured in radians per minute or degrees per day.</span>
                </span>
            </p>
        </div>
    );
}
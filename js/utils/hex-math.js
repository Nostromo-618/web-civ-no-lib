'use strict';

/**
 * Convert hex axial coordinates to pixel coordinates (flat-top orientation)
 * @param {number} q - Hex column coordinate
 * @param {number} r - Hex row coordinate
 * @param {number} size - Hex radius
 * @returns {{x: number, y: number}} Pixel coordinates
 */
export function hexToPixel(q, r, size) {
    const x = size * 1.5 * q;
    const y = size * Math.sqrt(3) * (r + q * 0.5);
    return { x, y };
}

/**
 * Convert pixel coordinates to hex axial coordinates (flat-top orientation)
 * @param {number} px - Pixel X coordinate
 * @param {number} py - Pixel Y coordinate
 * @param {number} size - Hex radius
 * @returns {{q: number, r: number}} Hex coordinates (rounded)
 */
export function pixelToHex(px, py, size) {
    const q = (2 / 3 * px) / size;
    const r = (-1 / 3 * px + Math.sqrt(3) / 3 * py) / size;
    return axialRound(q, r);
}

/**
 * Round fractional axial coordinates to nearest hex
 * @param {number} q - Fractional q coordinate
 * @param {number} r - Fractional r coordinate
 * @returns {{q: number, r: number}} Rounded hex coordinates
 */
export function axialRound(q, r) {
    const s = -q - r;
    let rq = Math.round(q);
    let rr = Math.round(r);
    let rs = Math.round(s);

    const qDiff = Math.abs(rq - q);
    const rDiff = Math.abs(rr - r);
    const sDiff = Math.abs(rs - s);

    if (qDiff > rDiff && qDiff > sDiff) {
        rq = -rr - rs;
    } else if (rDiff > sDiff) {
        rr = -rq - rs;
    }

    return { q: rq, r: rr };
}

/**
 * Get the 6 corner points of a flat-top hexagon
 * @param {number} x - Center X coordinate
 * @param {number} y - Center Y coordinate
 * @param {number} size - Hex radius
 * @returns {Array<{x: number, y: number}>} Array of 6 corner points
 */
export function getHexCorners(x, y, size) {
    const corners = [];
    for (let i = 0; i < 6; i++) {
        const angleDeg = 60 * i;
        const angleRad = (Math.PI / 180) * angleDeg;
        corners.push({
            x: x + size * Math.cos(angleRad),
            y: y + size * Math.sin(angleRad)
        });
    }
    return corners;
}

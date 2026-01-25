'use strict';

import { GRID_ROTATION } from '../config.js';

// Pre-compute rotation values for performance
const COS_ROT = Math.cos(GRID_ROTATION);
const SIN_ROT = Math.sin(GRID_ROTATION);

/**
 * Convert hex axial coordinates to pixel coordinates (flat-top orientation)
 * @param {number} q - Hex column coordinate
 * @param {number} r - Hex row coordinate
 * @param {number} size - Hex radius
 * @returns {{x: number, y: number}} Pixel coordinates
 */
export function hexToPixel(q, r, size) {
    const baseX = size * 1.5 * q;
    const baseY = size * Math.sqrt(3) * (r + q * 0.5);
    // Apply rotation matrix
    return {
        x: baseX * COS_ROT - baseY * SIN_ROT,
        y: baseX * SIN_ROT + baseY * COS_ROT
    };
}

/**
 * Convert pixel coordinates to hex axial coordinates (flat-top orientation)
 * @param {number} px - Pixel X coordinate
 * @param {number} py - Pixel Y coordinate
 * @param {number} size - Hex radius
 * @returns {{q: number, r: number}} Hex coordinates (rounded)
 */
export function pixelToHex(px, py, size) {
    // Apply inverse rotation first
    const x = px * COS_ROT + py * SIN_ROT;
    const y = -px * SIN_ROT + py * COS_ROT;
    // Then standard conversion
    const q = (2 / 3 * x) / size;
    const r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / size;
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
        const angleRad = (Math.PI / 180) * angleDeg + GRID_ROTATION;
        corners.push({
            x: x + size * Math.cos(angleRad),
            y: y + size * Math.sin(angleRad)
        });
    }
    return corners;
}

/**
 * Get the 6 adjacent hex coordinates from a given hex
 * @param {number} q - Hex column
 * @param {number} r - Hex row
 * @returns {Array<{q: number, r: number}>} Array of 6 adjacent hex coordinates
 */
export function getAdjacentHexes(q, r) {
    return [
        { q: q + 1, r: r },
        { q: q + 1, r: r - 1 },
        { q: q, r: r - 1 },
        { q: q - 1, r: r },
        { q: q - 1, r: r + 1 },
        { q: q, r: r + 1 }
    ];
}

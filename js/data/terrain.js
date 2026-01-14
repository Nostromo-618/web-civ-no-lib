'use strict';

export const TerrainType = Object.freeze({
    GRASSLAND: 'Grassland',
    PLAINS: 'Plains',
    DESERT: 'Desert',
    TUNDRA: 'Tundra',
    SNOW: 'Snow',
    MOUNTAIN: 'Mountain',
    OCEAN: 'Ocean',
    COAST: 'Coast'
});

export const TERRAIN_COLORS = Object.freeze({
    [TerrainType.GRASSLAND]: '#47602f',
    [TerrainType.PLAINS]: '#6e6838',
    [TerrainType.DESERT]: '#bd9a60',
    [TerrainType.TUNDRA]: '#75787b',
    [TerrainType.SNOW]: '#cfdce4',
    [TerrainType.MOUNTAIN]: '#464543',
    [TerrainType.OCEAN]: '#1d354c',
    [TerrainType.COAST]: '#295170'
});

export const DEFAULT_TERRAIN_COLOR = '#FF00FF';

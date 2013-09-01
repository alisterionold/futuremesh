"use strict";
var SFX;

/**
 * Renderer of simple SFX on the map.
 */
SFX = function () {
    var canvas, map, canvasWidth, canvasHeight, tileWidth, tileHeight, context,
            canvasTileWidth, canvasTileHeight, depthFactor, canvasCenterX,
            canvasCenterY, buildingsIndex, displayLightSFX,
            displayBuildableTiles, enableBuildOverlay, navigationIndex,
            enableNavigationIndex, inaccessibleColor, accessibleColor;

    depthFactor = Settings.sfx3DLightFactor;
    accessibleColor = Settings.sfxAccessibleTileColor;
    inaccessibleColor = Settings.sfxInaccessibleTileColor;
    enableBuildOverlay = false;
    enableNavigationIndex = false;

    /**
     * Sets the output canvas for rendering.
     *
     * @param {HTMLCavansElement} newCanvas New output canvas for rendering.
     */
    this.setCanvas = function (newCanvas) {
        canvas = newCanvas;
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        context = canvas.getContext('2d');
        context.strokeStyle = Settings.sfx3DLightColor;
        context.lineCap = 'round';
        canvasCenterX = canvasWidth / 2;
        canvasCenterY = canvasHeight / 2;
    };

    /**
     * Sets the current map of which SFX should be renderer.
     *
     * @param {Map} newMap The map for rendering. The method also accepts raw
     *        map data.
     */
    this.setMap = function (newMap) {
        if (!canvas) {
            throw new Error("cannot set map for SFX before canvas!");
        }
        map = newMap.getMap();
        tileWidth = TilesDefinition.getType(0).imageData.width - 1;
        tileHeight = TilesDefinition.getType(0).imageData.height / 2 - 1;
        canvasTileWidth = Math.ceil(canvasWidth / tileWidth);
        canvasTileHeight = Math.ceil(canvasHeight / tileHeight);
        buildingsIndex = newMap.getBuildingsIndex();
        navigationIndex = newMap.getNavigationIndex();
    };

    /**
     * Set whether or not the SFX renderer should display an overlay over the
     * buildings to signal that those tiles cannot be used for placing other
     * buildings.
     *
     * @param {Boolean} displayBuildableOverlay When set to true, the SFX
     *        renderer will display an overlay over the buildings.
     */
    this.setDisplayBuildableOverlay = function (displayBuildableOverlay) {
        enableBuildOverlay = displayBuildableOverlay;
    };

    /**
     * Enables or disables the rendering of the navigation index over the UI.
     * The navigation index will show which tiles can be navigated by units
     * (are not occupied by another unit or a building).
     *
     * @param {Boolean} displayNavigationIndex <code>true</code> if the
     *        navigation display should be visible.
     */
    this.setDisplayNavigationIndex = function (displayNavigationIndex) {
        enableNavigationIndex = displayNavigationIndex;
    };

    /**
     * Displays the SFX of the map on the chosen offset on the provided
     * canvas.
     *
     * @param {Number} x X offset for rendering.
     * @param {Number} y Y offset for rendering.
     */
    this.display = function (x, y) {
        context.globalAlpha = 0.3;
        displayLightSFX(x, y);
        enableBuildOverlay && displayBuildableTiles(x, y);
        enableNavigationIndex && displayNavigableTiles(x, y);
        context.globalAlpha = 1;
    };

    /**
     * Displays a 3D-like light beams emmanating from the map's surface.
     *
     * @param {Number} x  The horizonat offset of the camera from the map's top
     *        left corner in pixels.
     * @param {Number} y The vertical offset of the camera from the map's top
     *        left corner in pixels.
     */
    function displayLightSFX(x, y) {
        var mapOffsetX, mapOffsetY, i, j, offsetX, offsetY, shiftX, endX, endY,
                mapRow, mapTile;
        y -= tileHeight;
        x -= tileWidth / 2;
        mapOffsetX = Math.floor(x / tileWidth);
        mapOffsetY = Math.floor(y / tileHeight);
        for (j = canvasTileHeight + 2; j--;) {
            mapRow = map[j + mapOffsetY];
            if (!mapRow) {
                continue;
            }
            offsetY = (j + mapOffsetY) * tileHeight - y;
            shiftX = ((mapOffsetY + j) % 2) * tileWidth / 2;
            for (i = canvasTileWidth + 2; i--;) {
                mapTile = mapRow[i + mapOffsetX];
                if (!mapTile || !mapTile.lightSfx) {
                   continue;
                }
                offsetX = (i + mapOffsetX) * tileWidth + shiftX - x;
                endX = offsetX + (offsetX - canvasCenterX) / depthFactor;
                endY = offsetY + (offsetY - canvasCenterY) / depthFactor;
                context.lineWidth = mapTile.lightSfx;
                context.beginPath();
                context.moveTo(offsetX, offsetY);
                context.lineTo(endX, endY);
                context.stroke();
            }
        }
    }

    /**
     * Displays the overlay showing which tiles are occupied by buildings and
     * which are still free for building construction.
     *
     * @param {Number} x  The horizonat offset of the camera from the map's top
     *        left corner in pixels.
     * @param {Number} y The vertical offset of the camera from the map's top
     *        left corner in pixels.
     */
    function displayBuildableTiles(x, y) {
        var mapOffsetX, mapOffsetY, i, j, mapRow, offsetY, shiftX, mapTile,
                offsetX;
        context.fillStyle = Settings.sfxBuildLayerColor;
        mapOffsetX = Math.floor(x / tileWidth) - 1;
        mapOffsetY = Math.floor(y / tileHeight) - 1;
        for (j = canvasTileHeight + 2; j--;) {
            mapRow = buildingsIndex[j + mapOffsetY];
            if (!mapRow) {
                continue;
            }
            offsetY = (j + mapOffsetY) * tileHeight - y;
            shiftX = ((mapOffsetY + j) % 2) * tileWidth / 2;
            for (i = canvasTileWidth + 2; i--;) {
                mapTile = mapRow[i + mapOffsetX];
                if (!mapTile) {
                    continue;
                }
                offsetX = (i + mapOffsetX) * tileWidth + shiftX - x;
                displayTileOverlay(offsetX, offsetY);
            }
        }
    }

    /**
     * Displays an overlay over a single map tile at the specified coordinates.
     * The tile will be overlayed using a polygon filled with the current fill
     * style.
     *
     * @param {Number} x The horizontal offset of the tile's position from the
     *        map's top left cornenr.
     * @param {type} y The vertical offset of the tile's position from the
     *        map's top left corner.
     */
    function displayTileOverlay(x, y) {
        context.beginPath();
        context.moveTo(x + (tileWidth / 2), y);
        context.lineTo(x + tileWidth, y + tileHeight);
        context.lineTo(x + (tileWidth / 2), y + (tileHeight * 2));
        context.lineTo(x, y + tileHeight);
        context.fill();
    }

    /**
     * Displays the overlay showing which tiles are navigable by units
     * (accessible for unit movement).
     *
     * @param {Number} x The horizonat offset of the camera from the map's top
     *        left corner in pixels.
     * @param {Number} y The vertical offset of the camera from the map's top
     *        left corner in pixels.
     */
    function displayNavigableTiles(x, y) {
        var mapOffsetX, mapOffsetY, i, j, mapRow, offsetY, shiftX, mapTile,
                offsetX;
        mapOffsetX = Math.floor(x / tileWidth) - 1;
        mapOffsetY = Math.floor(y / tileHeight) - 1;
        for (j = canvasTileHeight + 2; j--;) {
            mapRow = navigationIndex[j + mapOffsetY];
            if (!mapRow) {
                continue;
            }
            offsetY = (j + mapOffsetY) * tileHeight - y;
            shiftX = ((mapOffsetY + j) % 2) * tileWidth / 2;
            for (i = canvasTileWidth + 2; i--;) {
                mapTile = mapRow[i + mapOffsetX];
                context.fillStyle = mapTile ? accessibleColor :
                        inaccessibleColor;
                offsetX = (i + mapOffsetX) * tileWidth + shiftX - x;
                displayTileOverlay(offsetX, offsetY);
            }
        }
    }
};

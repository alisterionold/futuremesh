var TilesDefinition;

TilesDefinition = (function () {
    var types;

    types = [
        {
            type: 0,
            image: 'data/images/tiles/grass.jpg',
            accessible: true,
            minimap: 'rgb(0,200,0)',
            resource: null
        },
        {
            type: 1,
            image: 'data/images/tiles/water.jpg',
            accessible: false,
            minimap: 'rgb(0,0,215)',
            resource: null
        },
        {
            type: 2,
            image: 'data/images/tiles/rock.jpg',
            accessible: false,
            minimap: 'rgb(128,128,128)',
            resource: null
        },
        {
            type: 3,
            image: 'data/images/tiles/energy.jpg',
            accessible: false,
            minimap: 'rgb(200,150,42)',
            resource: 0
        }
    ];

    return {
        getType: function (type) {
            return types[type];
        }
    };
}());

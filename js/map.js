var Map;
require('tile');

Map = function () {
    var map;

    map = [];

    this.setMap = function (newMap) {
        map = newMap;
    };

    this.getMap = function () {
        return map;
    }

    this.getView = function (x, y, width, height) {
        var view, i;
        view = map.slice(y, y + height);
        width += x;
        for (i = height; i--;) {
            view[i] = view[i].slice(x, width);
        }
        return view;
    };

    this.randomMap = function (width, height) {
        var i, j, row, random;
        map = [];
        for (i = height; i--;) {
            row = [];
            for (j = width; j--;) {
                random = Math.round(Math.random() * 155) + 50;
                row.push(new Tile(Math.floor(Math.random() * 3)));
            }
            map.push(row);
        }
    };
};
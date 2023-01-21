var gameMap;

initMap()
drawMap();


function initMap() {
    console.log(center)
    gameMap = new ol.Map({
        target: 'map_view',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: center,
            zoom: 10
        })
    });
}


function drawMap() {
    


}


var gameMap;

initMap()
drawMap();


function initMap() {

    gameMap = new ol.Map({
        target: 'map_view',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat(JSON.parse(center)),
            zoom: zoom
        })
    });
}


function drawMap() {
    var json = JSON.parse(caches_list)

    for (var i = 0; i < json.length; i++) {

        var marker = new ol.Overlay({
            position: json[i].location,
            element: document.createElement('div')
        });

        marker.getElement().style.width = '10px';
        marker.getElement().style.height = '10px';
        marker.getElement().style.borderRadius = '50%';
        marker.getElement().style.backgroundColor = 'red';
        marker.getElement().innerHTML = json[i].name;
        gameMap.addOverlay(marker);
    }

}



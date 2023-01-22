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
            zoom: zoom,
            maxZoom: zoom,
            minZoom: zoom
        })
    });
}


function drawMap() {
    var json = JSON.parse(caches_list)

    for (var i = 0; i < json.length; i++) {

        var marker = new ol.Overlay({
            position: json[i].location,
            element: document.createElement('img')
        });
   

        marker.getElement().src = 'https://www.tecnodret.es/wp-content/uploads/2017/02/map-marker-icon-768x768.png';
        marker.getElement().classList.add('marker-icon');

        gameMap.addOverlay(marker);
    }

}



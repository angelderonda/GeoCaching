// Para jugar ya

var mapaJuego;


playMap();

function playMap(location) {
    mapaJuego = new ol.Map({
        target: 'mapaJuego',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat(location),
            zoom: 10
        })

    });
}
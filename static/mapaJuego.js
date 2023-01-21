// Para jugar ya

var mapaJuego;


playMap();

function playMap() {
    mapaJuego = new ol.Map({
        target: 'mapaJuego',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: JSON.parse(localizacion),
            zoom: 10
        })

    });
}



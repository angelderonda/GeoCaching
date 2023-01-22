// Para jugar ya

var mapaJuego;


playMap();
drawMarks();

function playMap() {
    mapaJuego = new ol.Map({
        target: 'mapaJuego',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat(JSON.parse(localizacion)),
            zoom: zoom
        })

    });
}



function drawMarks() {
    var json = JSON.parse(marks)
    console.log(json)

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
        mapaJuego.addOverlay(marker);
    }

}



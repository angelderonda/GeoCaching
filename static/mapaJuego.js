// Para jugar ya

var mapaJuego;
var popups = [];
var marcadores = [];

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
    var lista = JSON.parse(marks);
    

    for (var i = 0; i < lista.length; i++) {
        
        let localizacion = lista[i].location;
        
        var marker = new ol.Overlay({
            position: localizacion,
            element: document.createElement('img')
        });

        marker.getElement().src = 'https://www.tecnodret.es/wp-content/uploads/2017/02/map-marker-icon-768x768.png';
        marker.getElement().classList.add('marker-icon');
        marcadores.push(marker);

        var popup = new ol.Overlay({
            element: document.createElement('div')
        });

        //Añadir una imagen al elemento del popup
        var img = document.createElement('img');        
        img.src = 'https://img.freepik.com/vector-gratis/hermosa-casa_24877-50819.jpg?w=2000';
        img.style.width = '90px';
        img.style.height = '90px';
        popup.getElement().classList.add('popup-window');
        popup.getElement().appendChild(img);        
        popups.push(popup);

        marker.getElement().addEventListener('click', function () {
            popup.setPosition(localizacion);
            popup.set("visible", true)
        });

    }

    for (let index = 0; index < lista.length; index++) {
        mapaJuego.addOverlay(marcadores[index]);
        mapaJuego.addOverlay(popups[index]);
    }

    

}

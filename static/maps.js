var map = new ol.Map({
    target: 'map',
    layers: [
    new ol.layer.Tile({
    source: new ol.source.OSM()
    })
    ],
    view: new ol.View({
    center: ol.proj.fromLonLat([-4.4, 36.7]),
    zoom: 6
    })
});

function goToCoordinates() {
    var coordinates = document.getElementById('coordinates').value;
    var lonlat = coordinates.split(',');
    var lon = parseFloat(lonlat[0]);
    var lat = parseFloat(lonlat[1]);
    var view = map.getView();
    view.animate({
    center: ol.proj.fromLonLat([lon, lat]),
    duration: 2000
    });
}

function getCoordinates() {
    var view = map.getView();
    var center = view.getCenter();
    var lonlat = ol.proj.toLonLat(center);
    var lon = lonlat[0];
    var lat = lonlat[1];
    document.getElementById("coordinates-display").innerHTML = "Longitude: " + lon + ", Latitude: " + lat;
    document.getElementById("coordinates-input").value = lon + "," + lat;
}


function goToPlace() {
    var inputPlace = document.getElementById("inputPlace").value;
    var url = 'https://nominatim.openstreetmap.org/search?q=' + inputPlace + '&format=json&limit=1';

    fetch(url)
        .then(response => response.json())
        .then(data => {
        var lat = data[0].lat;
        var lon = data[0].lon;
        var view = map.getView();
        var center = ol.proj.fromLonLat([lon, lat]);
        view.setCenter(center);
        view.setZoom(16);
        })
        .catch(error => console.log(error));
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
         lat: position.coords.latitude,
         lng: position.coords.longitude
        };
        var view = map.getView();
        var center = ol.proj.fromLonLat([pos.lng, pos.lat]);
        view.setCenter(center);
        view.setZoom(16);
        }, function() {
        handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        handleLocationError(false, infoWindow, map.getCenter());
    }
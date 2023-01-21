var gameMap;
var gameMap2;
var gameMap3;
var gameLocation;
var zoom;
let caches = [];
var cacheCount = 0;



initMap();
setGameLocation();




function initMap() {
    gameMap = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([-4.4, 36.7]),
            zoom: 10
        })
    });
}


function initMap2() {
    gameMap2 = new ol.Map({
        target: 'map2',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat(ol.proj.toLonLat(gameLocation)),
            zoom: zoom
        })
    });
}

function initMap3() {
    gameMap3 = new ol.Map({
        target: 'map3',
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
}

function setGameLocation() {
    var marker;
    gameMap.on('click', function (event) {
        gameLocation = event.coordinate;
        zoom = gameMap.getView().getZoom();
        if (marker) {
            gameMap.removeOverlay(marker);
        }
        marker = new ol.Overlay({
            position: gameLocation,
            element: document.createElement('div')
        });
        marker.getElement().style.width = '10px';
        marker.getElement().style.height = '10px';
        marker.getElement().style.borderRadius = '50%';
        marker.getElement().style.backgroundColor = 'red';
        gameMap.addOverlay(marker);
        alert("Game location set at: " + ol.proj.toLonLat(gameLocation)+"zoom:"+zoom);
        console.log(ol.proj.toLonLat(gameLocation));
        console.log(zoom);
    });
    
}



function addCache() {
    console.log("cachews");
    gameMap2.on('click', function (event) {
        if (cacheCount < 10) {
            var cache = {
                location: event.coordinate
            };
            var marker = new ol.Overlay({
                position: cache.location,
                element: document.createElement('div')
            });
            caches.push(cache);
            console.log(caches);
            console.log(ol.proj.toLonLat(cache.location));
            marker.getElement().style.width = '10px';
            marker.getElement().style.height = '10px';
            marker.getElement().style.borderRadius = '50%';
            marker.getElement().style.backgroundColor = 'red';
            gameMap2.addOverlay(marker);
            cacheCount++;
            document.getElementById('cache-count-num').innerHTML = cacheCount;
        }
    });
}


function nextStep() {
    var currentStep = document.querySelector('.step:not([style*="display: none"])');
    var nextStep = currentStep.nextElementSibling;
    console.log("pasa");
    console.log(caches)
    if (nextStep) {
        currentStep.style.display = 'none';
        nextStep.style.display = 'block';
        if (nextStep.id === 'step2') {
            console.log(ol.proj.toLonLat(gameLocation));
            initMap2();
            addCache();
        } else if (nextStep.id === 'step3') {
            initMap3();
            console.log(caches)
            caches.forEach(function (cache) {
                var marker = new ol.Overlay({
                    position: cache.location,
                    element: document.createElement('div')
                });
                marker.getElement().innerHTML = cache.name;
                gameMap3.addOverlay(marker);
            });
        }
    }
}

function finishGame() {
    var gameName = document.getElementById('game-name').value;
    var game = {
        name: gameName,
        location: gameLocation,
        caches: caches
    };
    fetch('/game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(game)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

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
            center: ol.proj.fromLonLat(gameLocation),
            zoom: zoom,
            maxZoom: zoom,
            minZoom: zoom
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
            center: ol.proj.fromLonLat(gameLocation),
            zoom: zoom,
            maxZoom: zoom,
            minZoom: zoom
        })
    });
}

function setGameLocation() {
    var marker;
    gameMap.on('click', function (event) {
        gameLocation = ol.proj.toLonLat(event.coordinate);
        zoom = gameMap.getView().getZoom();
        if (marker) {
            gameMap.removeOverlay(marker);
        }
        marker = new ol.Overlay({
            position: event.coordinate,
            element: document.createElement('img')
        });


        marker.getElement().src = 'https://www.tecnodret.es/wp-content/uploads/2017/02/map-marker-icon-768x768.png';
        marker.getElement().classList.add('marker-icon');
        gameMap.addOverlay(marker);
        alert("Game location set at: " + gameLocation + "zoom:" + zoom);
    });

}



function addCache() {
    gameMap2.on('click', function (event) {
        if (cacheCount < 10) {
            var cacheName = prompt("Please enter the cache name:", "");
            if (cacheName == null || cacheName == "") {
                alert("Cache name cannot be empty");
                return;
            }
            var cacheHint = prompt("Please enter the hint:", "");
            if (cacheHint == null || cacheHint == "") {
                alert("Cache hint cannot be empty");
                return;
            }
            var cache = {
                location: event.coordinate,
                name: cacheName,
                hint: cacheHint,
            };
            var marker = new ol.Overlay({
                position: cache.location,
                element: document.createElement('img')
            });

            marker.getElement().src = 'https://www.tecnodret.es/wp-content/uploads/2017/02/map-marker-icon-768x768.png';
            marker.getElement().classList.add('marker-icon');
            gameMap2.addOverlay(marker);

            caches.push(cache);
            cacheCount++;
            document.getElementById('cache-count-num').innerHTML = cacheCount;
        }
    });
}


function nextStep() {
    var currentStep = document.querySelector('.step:not([style*="display: none"])');
    var nextStep = currentStep.nextElementSibling;
    if (nextStep) {
        currentStep.style.display = 'none';
        nextStep.style.display = 'block';
        if (nextStep.id === 'step2') {
            initMap2();
            addCache();
        } else if (nextStep.id === 'step3') {
            initMap3();
            caches.forEach(function (cache) {
                var marker = new ol.Overlay({
                    position: cache.location,
                    element: document.createElement('img')
                });

                marker.getElement().src = 'https://www.tecnodret.es/wp-content/uploads/2017/02/map-marker-icon-768x768.png';
                marker.getElement().classList.add('marker-icon');
                gameMap3.addOverlay(marker);
            });
            fillCacheTable();
        }
    }
}

function finishGame() {
    var gameName = document.getElementById('game-name').value;
    var game = {
        name: gameName,
        location: gameLocation,
        caches: caches,
        zoom: zoom
    };
    fetch('/save_game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(game)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert("Juego creado con éxito");
            window.location.href = '/join_game';
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function fillCacheTable() {
    let tableBody = document.getElementById("cache-table-body");
    for (let i = 0; i < caches.length; i++) {
        let cache = caches[i];
        let row = document.createElement("tr");
        let nameCell = document.createElement("td");
        nameCell.innerHTML = cache.name;
        let hintCell = document.createElement("td");
        hintCell.innerHTML = cache.hint;
        row.appendChild(nameCell);
        row.appendChild(hintCell);
        tableBody.appendChild(row);
    }
}




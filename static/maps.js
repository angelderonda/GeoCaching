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
    var nextBtnDisabled = true;
    gameMap.on('click', function (event) {
        gameLocation = ol.proj.toLonLat(event.coordinate);
        zoom = gameMap.getView().getZoom();
        if (marker) {
            gameMap.removeOverlay(marker);
        }
        marker = new ol.Overlay({
            position: event.coordinate,
            element: document.createElement('div')
        });
        marker.getElement().style.width = '10px';
        marker.getElement().style.height = '10px';
        marker.getElement().style.borderRadius = '50%';
        marker.getElement().style.backgroundColor = 'red';
        gameMap.addOverlay(marker);
        alert("Game location set at: " + gameLocation + "zoom:" + zoom);
        var gameName = document.getElementById("game-name").value;
        if (gameLocation && gameName.trim() !== "") {
            nextBtnDisabled = false;
        }
        document.getElementById("next-btn-step1").disabled = nextBtnDisabled;
    });
}



function addCache() {
    gameMap2.on('click', function (event) {
        var nextBtnDisabled = false;
        if (cacheCount < 10) {
            var cacheName = prompt("Please enter the cache name:", "");
            if (cacheName.trim() === "") {
                alert("Cache name can not be empty.");
                nextBtnDisabled = true;
            }
            var cacheHint = prompt("Please enter the hint:", "");
            if (cacheHint.trim() === "") {
                alert("Cache hint cannot be empty.");
                nextBtnDisabled = true;
            }
            var cache = {
                location: event.coordinate,
                name: cacheName,
                hint: cacheHint,
            };
            var marker = new ol.Overlay({
                position: cache.location,
                element: document.createElement('div')
            });
            caches.push(cache);
            marker.getElement().style.width = '10px';
            marker.getElement().style.height = '10px';
            marker.getElement().style.borderRadius = '50%';
            marker.getElement().style.backgroundColor = 'red';
            gameMap2.addOverlay(marker);
            cacheCount++;
            document.getElementById('cache-count-num').innerHTML = cacheCount;
            document.getElementById("next-btn-step2").disabled = nextBtnDisabled;
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
                    element: document.createElement('div')
                });
                marker.getElement().style.width = '10px';
                marker.getElement().style.height = '10px';
                marker.getElement().style.borderRadius = '50%';
                marker.getElement().style.backgroundColor = 'red';
                marker.getElement().innerHTML = cache.name;
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
            alert("Game has been created");
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




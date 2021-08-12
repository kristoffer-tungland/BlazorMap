var map
var vectorSource


window.mapService = {
    Initialize: function () {

        vectorSource = new ol.VectorSource();
        var vectorLayer = new ol.VectorLayer({
            source: vectorSource,
        });

        map = new ol.Map({
            target: 'map',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                }),
                vectorLayer
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([37.41, 8.82]),
                zoom: 4
            })
        });
    },

    AddPoint: function () {

        var iconFeature = new Feature({
            geometry: new Point([0, 0]),
            name: 'Null Island',
            population: 4000,
            rainfall: 500,
        });

        var iconStyle = new Style({
            image: new Icon({
                anchor: [0.5, 46],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                src: 'data/icon.png',
            }),
        });

        iconFeature.setStyle(iconStyle);

        vectorSource.features.push(iconFeature);
    }

};

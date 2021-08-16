//import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import Point from 'ol/geom/Point';
import TileJSON from 'ol/source/TileJSON';
import OSM, { ATTRIBUTION } from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import { Icon, Style } from 'ol/style';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat, toLonLat } from 'ol/proj'
import { getUid } from 'ol/util';

var map;

window.mapService = {
    Initialize: function (dotNetMapService, args) {

        var layers = [];

        args.tileLayers.forEach((x) => {
            var tileLayer = new TileLayer({
                source: new OSM({
                    //attributions: [
                    //    'All maps © <a href="https://www.opencyclemap.org/">OpenCycleMap</a>',
                    //    ATTRIBUTION,
                    //],
                    url: x.url,
                })
            });

            layers.push(tileLayer);
        });

        map = new Map({
            target: 'map',
            layers: layers,
            view: new View({
                center: fromLonLat([args.lon, args.lat]),
                zoom: args.zoom
            }),
        });

        const element = document.getElementById('popup');

        const popup = new Overlay({
            element: element,
            positioning: 'bottom-center',
            stopEvent: false,
        });
        map.addOverlay(popup);

        // display popup on click
        map.on('click', function (evt) {
            const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                return feature;
            });
            if (feature) {

                var dotnetFeature = getDotNetFeature(feature);

                dotNetMapService.invokeMethodAsync('OnFeatureClick', dotnetFeature);

                popup.setPosition(evt.coordinate);
                $(element).popover({
                    placement: 'top',
                    html: true,
                    content: feature.get('name'),
                });
                $(element).popover('show');
            } else {
                $(element).popover('dispose');
            }
        });

        // change mouse cursor when over marker
        map.on('pointermove', function (e) {
            const pixel = map.getEventPixel(e.originalEvent);
            const hit = map.hasFeatureAtPixel(pixel);

            // TODO Fix undefined error
            //map.getTarget().style.cursor = hit ? 'pointer' : '';
        });

        // Close the popup when the map is moved
        map.on('movestart', function () {
            $(element).popover('dispose');
        });

        console.log("Map is initialized");
    },

    AddLayer: function (args) {
        var source = new VectorSource();
        var layer = new VectorLayer({
            source: source,
            style: function (feature, resolution) {

                var scale = 0.5;

                if (resolution < 10) { scale = 0.5 }
                else if (resolution < 100) { scale = 0.4 }
                else if (resolution < 1000) { scale = 0.3 }
                else if (resolution < 2000) { scale = 0.3 }
                else if (resolution < 5000) { scale = 0.2 }
                else if (resolution >= 5000) { scale = 0.1 }

                var iconStyle = new Style({
                    image: new Icon({
                        anchor: [0.5, 0.5],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'fraction',
                        src: feature.get('imageSource'),
                        rotation: feature.get('direction'),
                        scale: scale
                    }),
                });

                return iconStyle;
            },
            opacity: args.opacity,
            visible: args.visible,
            zIndex: args.zIndex
        });

        map.addLayer(layer);

        return {
            id: getUid(layer)
        };
    },

    AddIconFeature: function (args) {
        var layer = getLayer(map, args.layerId);

        const lonLat = [args.lon, args.lat];
        const coordinates = fromLonLat(lonLat);

        var feature = new Feature({
            geometry: new Point(coordinates),
            name: args.name,
            properties: args.properties
        });

        feature.set('imageSource', args.imageSource)
        feature.set('direction', args.direction)
        feature.set('layerId', args.layerId)

        var id = getUid(feature)
        feature.setId(id);

        layer.getSource().addFeature(feature);
        layer.getSource().changed();

        return id;
    },

    RemoveFeature: function (args) {
        var layer = getLayer(map, args.layerId);
        var feature = layer.getSource().getFeatureById(args.id);

        layer.getSource().removeFeature(feature);
    },

    GetFeatureById: function (id) {
        var layer = getLayer(map, args.layerId);
        var feature = layer.getSource().getFeatureById(args.id);

        return getDotNetFeature(feature);
    },

    UpdateFeatureProperties: function (args) {
        var layer = getLayer(map, args.layerId);
        var feature = layer.getSource().getFeatureById(args.id);

        feature.set('properties', args.properties)
    },

    UpdateFeatureLocation: function (args) {
        var layer = getLayer(map, args.layerId);
        var feature = layer.getSource().getFeatureById(args.id);

        const lonLat = [args.lon, args.lat];
        const coordinates = fromLonLat(lonLat);
        feature.getGeometry().setCoordinates(coordinates);
        feature.set('direction', args.direction)

        if (args.centerView) {
            map.getView().setCenter(coordinates);
        }

        layer.getSource().changed();
    }
};

function getDotNetFeature(feature) {

    var coordinates = toLonLat(feature.getGeometry().getCoordinates(coordinates));

    return {
        Id: feature.getId(),
        LayerId: feature.get('layerId'),
        Name: feature.get('name'),
        Properties: feature.get('properties'),
        Lat: coordinates[1],
        Lon: coordinates[0],
        Direction: feature.get('direction')
    }
};

function getLayer(map, layerId) {
    var layer;

    map.getLayers().forEach((x) => {
        if (getUid(x) == layerId) {
            layer = x;
        }
    });

    return layer;
};
import React from "react";
import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import { Point } from 'ol/geom';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style, Icon, RegularShape } from 'ol/style';
import Overlay from 'ol/Overlay';
import { toLonLat } from 'ol/proj';
import { fromLonLat, get } from "ol/proj"
import { transform } from 'ol/proj';


import outputData from "./output.json"




class MyMap extends React.Component {
    constructor(props) {
      super(props);
      this.state = {info: ""};
    }
  
componentDidMount(){
  

const geojsonObj = {
    "type": "FeatureCollection",
    "features": []
}

var vectorSource = new VectorSource({
    features: (new GeoJSON()).readFeatures(geojsonObj)
});

outputData.forEach((el) => {
  var x = el.geometry.coordinates[0]
   var y = el.geometry.coordinates[1]
   console.log(el)
   var iconFeature = new Feature({
        geometry: new Point(transform([x, y], 'EPSG:4326', 'EPSG:3857')),
        name: 'Marker ',
        "properties": { SPC: parseFloat(el.properties.Specific_capacity)}
        
        
    });
    console.log( iconFeature)
    vectorSource.addFeature(iconFeature);
    console.log( vectorSource)
})

function getStyleSpfCon(feature) {
    return new Style({
        image: new CircleStyle({
            radius: feature.get("properties").SPC/2,
            fill: new Fill({
                color: 'rgba(0, 0, 255, 1)'
            }),
            stroke: new Stroke({ color: 'rgba(0, 0,255, 1)', width: 1 })
        })
    });
}

var vectorLayerForSpfCon = new VectorLayer({
    fKey: "SPC",
    source: vectorSource,
    style: getStyleSpfCon
});

var info = document.getElementById('info');

const overLayer = new Overlay({
    element: info
})



var map = new Map({
    layers: [
        new TileLayer({
            source: new OSM()
        }),
       
    ],
    target: 'map',
    view: new View({
        center: fromLonLat([34.84, 36.85]),
        zoom: 12
    })
});



document.getElementById("button").onclick = () => {
    map.addLayer(vectorLayerForSpfCon)
}

map.addOverlay(overLayer)

map.on('click', function(evt) {
   
    let pixel = evt.pixel;
    var lastPair = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        let coordinateClicked = evt.coordinate;
        overLayer.setPosition(coordinateClicked)
        return [feature, layer.values_.fKey];
    });
    const feature = lastPair[0];
    const fKey = lastPair[1];

    console.log(feature, fKey)
 info.innerHTML = `<div>${fKey}: ${feature.values_.properties[fKey]}</div>`;

});
  
}


    render() {
        return <div>
        <div id="info"></div>
        <div className="map" id= "map"/>
        <button id="button">Add Circle</button>
        </div>
    }
  }

  export default MyMap;
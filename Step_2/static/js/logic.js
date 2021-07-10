//define earthquake and tectonic plates GeoJSON url variables
var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicplatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

//create two layerGroups
var earthquakes = L.layerGroup();
var tectonicplates = L.layerGroup();

//define tile layers
var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 15,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 15,
  zoomOffset: -1,
  id: "mapbox/light-v11",
  accessToken: API_KEY
});

var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 15,
  zoomOffset: -1,
  id: "mapbox/outdoors-v10",
  accessToken: API_KEY
});

var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 15,
  id: "dark-v10",
  accessToken: API_KEY
});

//define a baseMaps object to hold the base layers
var baseMaps = {
  "Satellite Map": satelliteMap,
  "Grayscale Map": grayscaleMap,
  "Outdoors Map": outdoorsMap,
  "Dark Map": darkMap
};

//create overlay object to hold the overlay layer
var overlayMaps = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonicplates
};

//create the map, adding satelliteMap and earthquakes layers to display on load
var myMap = L.map("mapid", {
  center: [
    37.7749, -122.4194
  ],
  zoom: 2,
  layers: [satelliteMap, earthquakes]
});

//create layer control
//add baseMaps and overlayMaps
//add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

d3.json(earthquakesURL, function(earthquakeData) {
  //determine the marker size by magnitude
  function markerSize(magnitude) {
    return magnitude * 5;
  };
  //determine the marker color by depth
  function chooseColor(depth) {
    switch(true) {
      case depth > 90:
        return "brown";
      case depth > 70:
        return "red";
      case depth > 50:
        return "orangered";
      case depth > 30:
        return "peach";
      case depth > 10:
        return "yellow";
      default:
        return "tan";
    }
  }

  //create a GeoJSON layer for the features array
  //the feature is a popup  with details about the earthquake
  L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, 
        //set the style of the markers based on properties.mag
        {
          radius: markerSize(feature.properties.mag),
          fillColor: chooseColor(feature.geometry.coordinates[2]),
          fillOpacity: 0.7,
          color: "black",
          stroke: true,
          weight: 0.5
        }
      );
    },
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Location: " + feature.properties.place + "</h3><hr><p>Date: "
      + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }
  }).addTo(earthquakes);
  //add our earthquake layer to the createMap function
  earthquakes.addTo(myMap);

  //get the tectonic plate data from tectonicplatesURL
  d3.json(tectonicplatesURL, function(data) {
    L.geoJSON(data, {
      color: "red",
      weight: 2
    }).addTo(tectonicplates);
    tectonicplates.addTo(myMap);
  });

    //add legend
    var legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend"),
      depth = [-10, 10, 30, 50, 70, 90];
      
      div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"
  
      for (var i =0; i < depth.length; i++) {
        div.innerHTML += 
        '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' +
            depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
      };
      legend.addTo(myMap);
});
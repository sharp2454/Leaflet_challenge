//define earthquake url variable
var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//create layerGroup and map
var earthquakes = L.layerGroup();

var myMap = L.map("map", {
    center: [37.7749, -122.4194],
    zoom: 13
  });
  
  // Adding tile layer
  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v11",
    accessToken: API_KEY
  }).addTo(myMap);

  d3.json(earthquakesURL, function(earthquakeData) {
    // Determine the marker size by magnitude
    function markerSize(magnitude) {
      return magnitude * 5;
    };

   //determine marker color by depth 
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
        // Set the style of the markers based on properties.mag
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
  //add earthquake layer to the myMap
  earthquakes.addTo(myMap);

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


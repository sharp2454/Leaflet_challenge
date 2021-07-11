// Create a map object
var myMap = L.map("map", {
    center: [32.7767, -96.7970],
    zoom: 5
});

// Define greymap layers  // id: "mapbox/light-v10",
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
}).addTo(myMap);

// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
    console.log("data")
    console.log(data)

    // Once we get a response, send the data.features object to the createFeatures function
    function createFeatures(feature01) {
        // console.log("geometry")
        // console.log(feature01.geometry)

        return {
            fillColor: chooseColor(feature01.geometry.coordinates[2]),
            // fillColor: chooseColor(feature["geometry"]["coordinates"][2]),
            color: "black",
            radius: chosenRadius(feature01.properties.mag),
            stroke: true,
            weight: 1.0,
            opacity: 1,
            fillOpacity: 1
        };

        // console.log("fillColor")
        // console.log(fillColor)

        // Setting the radius of magnitude
        function chosenRadius(magnitude) {
            return magnitude * 4;
        }

        // setting the color according to the number of magnitude reported
        function chooseColor(depth) {

            if (depth > 90) {
                return "#ea2c2c";
            } else if (depth > 70) {
                return "#ea822c";
            } else if (depth > 50) {
                return "#ea822c";
            } else if (depth > 30) {
                return "#ee9c00";
            } else if (depth > 10) {
                return "#d4ee00";
            } else {
                return "#98ee00";
            }
        }
    }

    // Here we add a GeoJSON layer to the map once the file is loaded.
    L.geoJson(data, {
        // We turn each feature into a circleMarker on the map.
        pointToLayer: function (feature01, latlng) {
            return L.circleMarker(latlng);
        },
        // We set the style for each circleMarker using our styleInfo function.
        style: createFeatures,
        // We create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
        onEachFeature: function (feature01, layer) {
            layer.bindPopup(
                "Magnitude: "
                + feature01.properties.mag
                + "<br>Depth: "
                + feature01.geometry.coordinates[2]
                + "<br>Location: "
                + feature01.properties.place
            );
        }
    }).addTo(myMap);

    // Here we create a legend control object.
    var legend = L.control({
        position: "bottomright"
    });

    // Then add all the details for the legend
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");

        var grades = [-10, 10, 30, 50, 70, 90];
        var colors = [
            "#98ee00",
            "#d4ee00",
            "#eecc00",
            "#ee9c00",
            "#ea822c",
            "#ea2c2c"
        ];

        // Looping through our intervals to generate a label with a colored square for each interval.
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += "<i style='background: " + colors[i] + "'></i> "
                + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };

    // Finally, we our legend to the map.
    legend.addTo(myMap);

})
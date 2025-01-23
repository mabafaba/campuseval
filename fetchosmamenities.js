const axios = require('axios');

function pullOSMAmenities(lat, lon, radius) {
    var url = "https://overpass-api.de/api/interpreter?data=[out:json];node[amenity](around:" + radius + "," + lat + "," + lon + ");out;";   
    return axios.get(url)
        .then(response => {
            const elements = response.data.elements;
            const geojson = {
                type: "FeatureCollection",
                features: elements.map(element => ({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [element.lon, element.lat]
                    },
                    properties: element.tags
                }))
            };
            return geojson;
        })
        .catch(error => console.error('Error:', error));
}

module.exports = pullOSMAmenities;


// overpass query used:

// Overpass API query to get all universities in a city, including those mapped as points and polygons
// [out:json];
// area[name="Deutschland"]->.searchArea;
// (
//   	node["amenity"="university"](area.searchArea);
//   	node["building"="university"](area.searchArea);
//   	way["building"="university"](area.searchArea);
//     way["amenity"="university"](area.searchArea);
// );
// out center;



// read geojson
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const geojson = JSON.parse(fs.readFileSync(path.resolve(__dirname, './universities_germany_centroids.geojson'), 'utf8'));

const { Feature, UniWithContext } = require('./db');

async function storeUniversities() {
    await mongoose.connect('mongodb://localhost:27017/campuseval');

    console.log('Connected to MongoDB');

    geojson.features.forEach(async (feature, index) => {
        
        if (feature.geometry && feature.geometry.type === 'Point') {
            const newFeature = new Feature({
                type: 'Feature',
                properties: feature.properties,
                geometry: {
                    type: 'Point',
                    coordinates: feature.geometry.coordinates
                }
            });

            await newFeature.save();

            const newUni = new UniWithContext({
                uni: newFeature,
            });
            newUni.save()
            .then(() => {
                console.log(`stored feature ${index + 1} of ${geojson.features.length}`);
            });
        } else {
            console.log(`Skipping feature ${index + 1} as it is not a Point`);
        }
    });

    console.log('All features processed');
}

storeUniversities().then(() => {
    console.log('All universities stored');
}).catch(err => {
    console.error('Error storing universities', err);
});


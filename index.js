const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 4003;
app.get('/', (req, res) => {
    // send index.html file
    res.sendFile(__dirname + '/index.html');
});

// serve ./client folder
app.use(express.static('client'));
// call them like:
// http://localhost:4003/universities.geojson

// how to load a geojson file on server side?
//a: use fs module
const fs = require('fs');
const path = require('path');

const pullOSMAmenities = require('./fetchosmamenities.js');

const statistics = require('./amenitystatistics.js');


// store all of these in the database as university context
const { UniWithContext, Feature } = require('./db.js');

// load db.js
const db = require('./db.js');




// endpoint for uniWithContext statistics
app.get('/stats', async (req, res) => {
    // pull from db entries stats field and name field
    const stats = await UniWithContext.find({}).select('stats uni.properties.name');
    res.json(stats);
});
// mongodb: any with missing 'stats' property

// 
app.get('/unis', async (req, res) => {
    // var unis = await UniWithContext.find({});
    // only 20
    var unis = await UniWithContext.find({})
    // move stats to uni properties
   

    // total number of amenities 
    unis.forEach(uni => {
        // if no stats, warn in console
        if (!uni.stats) {
            
            // console.log('No stats for', uni.uni.properties.name);
        } else {
            // console.log(uni.stats);
        }
        uni.uni.properties.stats = uni.stats;
        uni.uni.properties.amenities = uni.amenityIds;

    });

    // get only the uni field
    unis = unis.map(uni => uni.uni);


    // proper feature collection
    unis = {
        type: "FeatureCollection",
        features: unis
    };

    // if not stats in all feature props, throw error with count




    res.json(unis);
}
);
// mongodbquery to find by id where id is 67642ea9d515c6d1951ddd66
// { _id: ObjectId("678d77560da37a26874edae8") }
// {
// amenities matching a university
app.get('/amenities/:uniId', async (req, res) => {
    const uniId = req.params.uniId;
    console.log('uniid', uniId);
    // find where x.uni._id === uniId
    const uniWithContext = await UniWithContext.findOne({
        '_id': new mongoose.Types.ObjectId(uniId)
    }); 
    console.log('uniwithcontext', uniWithContext);
    if (!uniWithContext) {
        return res.status(404).json({ error: 'University context not found' });
    }
    // console.log(uniWithContext);
    const amenityFeatures = await Feature.find({ _id: { $in: uniWithContext.amenityIds } });
    // console.log('found this many amenities:', amenityFeatures.length);
    const amenities = {
        type: "FeatureCollection",
        features: amenityFeatures.map(amenity => ({
            type: "Feature",
            geometry: amenity.geometry,
            properties: amenity.properties
        }))
    };
   
    res.json(amenities);
});

app.get('/uni/complete/:uniId', async (req, res) => {
    const uniId = req.params.uniId;
    const objectId = new mongoose.Types.ObjectId(uniId);
    const uniWithContext = await UniWithContext.findOne({
        '_id': new mongoose.Types.ObjectId(uniId)
    });
    if (!uniWithContext) {
        return res.status(404).json({ error: 'University context not found' });
    }
    // populate the amenities
    var amenities = await Feature.find({ _id: { $in: uniWithContext.amenityIds } });
    if(!amenities) {
        return res.status(404).json({ error: 'Amenities not found' });
    }

    console.log('uniwithcontext', uniWithContext);
    // to geojson
    amenities = {
        type: "FeatureCollection",
        features: amenities.map(amenity => ({
            type: "Feature",
            geometry: amenity.geometry,
            properties: amenity.properties
        }))
    };
    // turn uniWithContext into editable object
    returnObj = uniWithContext.toObject();

    returnObj.amenities = amenities;
    
    res.json(returnObj);
});

// endpoint to get stats for a specific point

app.get('/stats/:lat/:lon', async (req, res) => {
    // get amenities 1km around the point
    const lat = parseFloat(req.params.lat);
    const lon = parseFloat(req.params.lon);
    const radius = 1000;
    const amenities = await pullOSMAmenities(lat, lon, radius);
    // get stats for these amenities
    const stats = statistics.calculateAmenityStatistics(amenities.features);
    res.json({ stats, amenities });
});


app.get('/minimalunis', async (req, res) => {
    // get the one and only entry from the AllUniWithContextsMinimal collection
    const unis = await db.AllUniWithContextsMinimal.findOne({});
    res.json(unis);
})



// mongodb query to get first entry and populate amenities
// {amenities: {$exists: true, $ne: []}}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});



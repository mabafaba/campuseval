const axios = require('axios');
const { UniWithContext, Feature } = require('./db');
const pullOSMAmenities = require('./fetchosmamenities');
fetchAllUniContextAmenitiesFromOSM = async () => {
    
    console.log('get from db');
    // find all university contexts without amenities (amenities.length === 0)
    // no need to populate the amenities field
    // find all university contexts without amenityIds (amenityIds.length === 0)
    var uniWithContexts = await UniWithContext.find({ 'amenityIds.0': { $exists: false } });
    
    console.log('universities without amenities:', uniWithContexts.length);
    // randomise the order of universities
    uniWithContexts = uniWithContexts.sort(() => Math.random() - 0.5);
    // pull amenities for first three universities
    for (let i = 0; i < uniWithContexts.length; i++) {
        console.log('processing university:', i);
        var starttime = new Date().getTime();
        const uniWithContext = uniWithContexts[i];
        // if amenities are already present, skip
        if (uniWithContext.amenities.length > 0) {
            continue;
        }
        const lat = uniWithContext.uni.geometry.coordinates[1];
        const lon = uniWithContext.uni.geometry.coordinates[0];
        const radius = 1000;
        pullOSMAmenities(lat, lon, radius).then(async amenities => {
        // if status 504, continue with next
        if (amenities.status === 504) {
            console.log('status 504, continuing with next');
            return;
        }

        const amenityIds = [];
        for (const feature of amenities.features) {
            const amenity = new Feature({
                type: "Feature",
                geometry: feature.geometry,
                properties: feature.properties
            });
            await amenity.save();
            amenityIds.push(amenity._id);
        }
        uniWithContext.amenityIds = amenityIds;
        await uniWithContext.save();
        // log name, # of amenities, time, in colours
        console.log(
            `\x1b[32m${((i + 1) / uniWithContexts.length * 100).toFixed(2)}%\x1b[0m`,
            // log total not just percent
            `\x1b[32m${i + 1}/${uniWithContexts.length}\x1b[0m`,
            '\x1b[33m\x1b[0m', uniWithContext.uni.properties.name + ' ' + amenityIds.length + ' amenities ' + new Date().toLocaleTimeString());
        // wait 1 second before the next call
        // var duration = new Date().getTime() - starttime;
       // wait at least 100ms before the next call (extra wait time from here betwee 0ms and 100ms)
    //    var waitTime = Math.max(100 - duration, 0);
        
    })
    await new Promise(resolve => setTimeout(resolve, 3000));
    }
}
fetchAllUniContextAmenitiesFromOSM();
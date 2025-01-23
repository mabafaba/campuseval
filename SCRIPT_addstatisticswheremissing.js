const statistics = require('./amenityStatistics');
const { UniWithContext, Feature } = require('./db');
calculatestatswheremissing = async function(){    // find  unis wiht no stats, and 
    // populate amenityIds field
    

    const unis = await UniWithContext.find({ 'stats.amenityCounts': { $exists: false } });
    console.log('unis with missing stats:', unis.length);
    // for each uni, calculate stats
    const totalUnis = unis.length;
    let processedUnis = 0;

    for (const uni of unis) {
        
        const amenities = await Feature.find({ _id: { $in: uni.amenityIds } })
        const stats = statistics.calculateAmenityStatistics(amenities);
        uni.stats = stats;
        await uni.save();
        processedUnis++;
        const progress = ((processedUnis / totalUnis) * 100).toFixed(2);
        console.log(`${progress}% (${processedUnis}/${totalUnis}) - ${uni.uni.properties.name}`);
    }
};

calculatestatswheremissing();
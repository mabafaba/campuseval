// functions to calculate summary statistics for amenities

function countPerAmenityType(amenities) {
    const counts = {};
    amenities.forEach(amenity => {
        const type = amenity.properties.amenity;
        counts[type] = counts[type] ? counts[type] + 1 : 1;
    });
    return counts;
}

function amenityEntropy(amenityCounts) {
    // formula for probability would be: -sum(p_i * log(p_i))
    // where p_i is the probability of the i-th amenity type
    // and log is the natural logarithm

    // first calculate the total number of amenities
    const total = Object.values(amenityCounts).reduce((acc, count) => acc + count, 0);
    // then calculate the entropy
    const entropy = Object.values(amenityCounts).reduce((acc, count) => {
        const p = count / total;
        return acc - p * Math.log(p); // acc is: 
    }, 0);
    return entropy;
}

function amenityDiversity(amenities) {
    const counts = countPerAmenityType(amenities);
    return amenityEntropy(counts);
}

function addAmenityStatistics(uniWithContext) {
    // to the uniWithContext.stats object, add the following properties:
    // - total number of amenities
    // - count for each amenity type
    // - entropy of amenity types

    const amenities = uniWithContext.amenities;
    const counts = countPerAmenityType(amenities);
    const entropy = amenityEntropy(counts);
    // make sure the stats object exists
    uniWithContext.stats = uniWithContext.stats || {};
    uniWithContext.stats.totalAmenities = amenities.length;
    uniWithContext.stats.amenityCounts = counts;
    uniWithContext.stats.amenityEntropy = entropy;

    // save the uniWithContext
    return uniWithContext.save();

}

function calculateAmenityStatistics(amenities){
    const counts = countPerAmenityType(amenities);
    const entropy = amenityEntropy(counts);
    return {
        totalAmenities: amenities.length,
        amenityCounts: counts,
        amenityEntropy: entropy
    };

}


module.exports = {
    countPerAmenityType,
    amenityEntropy,
    amenityDiversity,
    addAmenityStatistics,
    calculateAmenityStatistics
};
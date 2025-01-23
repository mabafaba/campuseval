const mongoose = require('mongoose');

db = mongoose.connection;


if (process.env.DOCKER === 'true') {
    mongoose.connect('mongodb://mongodb:27017/campuseval');
} else {
    mongoose.connect('mongodb://localhost:27017/campuseval');
}


db.on('error', console.error.bind(console, 'connection error:'));





const featureSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    properties: {
        type: Object,
        default: {}
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point', 'LineString', 'Polygon'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
});


const uniWithContextSchema = new mongoose.Schema({
    uni: {
        type: featureSchema,
        required: true
    },
    amenities: {
        type: [featureSchema],
        ref: 'Feature',
        default: []
    },
    // amenities as reference to features
    amenityIds: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    stats: {
        type: Object,
        default: {}

    }
});

// a schema similar to uniWithContextSchema but make the data small as possible to save bandwidth and processing time.
// should contain only the necessary fields: lat, lon, amenityCount, entropy, uniId

const allUniWithContextsMinimal = new mongoose.Schema({
    uniIds: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    lats: {
        type: [Number],
        default: []
    },
    lons: {
        type: [Number],
        default: []
    },
    totalAmenities: {
        type: [Number],
        default: []
    },
    entropies: {
        type: [Number],
        default: []
    },
    names: {
        type: [String],
        default: []
    }
});



// const UniWithContext = mongoose.model('UniWithContext', uniWithContextSchema);
const AllUniWithContextsMinimal = mongoose.model('allUniWithContextsMinimal', allUniWithContextsMinimal);
const UniWithContext = mongoose.model('UniWithContext', uniWithContextSchema);
const Feature = mongoose.model('Feature', featureSchema);

module.exports = {
    AllUniWithContextsMinimal,
    UniWithContext,
    Feature
};
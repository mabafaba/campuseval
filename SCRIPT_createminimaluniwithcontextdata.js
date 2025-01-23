const mongoose = require('mongoose');
const { UniWithContext, AllUniWithContextsMinimal 

} = require('./db');


async function createAllUniWithContextsMinimal(deleteExisting = true) {
    if (deleteExisting) {
        console.log('Deleting existing AllUniWithContextsMinimal entry');
        await AllUniWithContextsMinimal.deleteMany({});
        console.log('Existing AllUniWithContextsMinimal entry deleted');
    }
    try {
        console.log('Creating AllUniWithContextsMinimal entry');
        const uniWithContextEntries = await UniWithContext.find({});
        console.log('uniWithContextEntries:', uniWithContextEntries.length);
        
        const uniIds = [];
        const lats = [];
        const lons = [];
        const totalAmenities = [];
        const entropies = [];
        const names = [];
        var skippedEntries = 0;
        uniWithContextEntries.forEach(entry => {
            // skip if not all fields are present (they might be 0 which is should be considered as present)
            if (entry.uni === undefined || entry.uni.geometry === undefined || entry.uni.geometry.coordinates === undefined || entry.uni.geometry.coordinates[0] === undefined || entry.uni.geometry.coordinates[1] === undefined || entry.stats === undefined || entry.stats.totalAmenities === undefined) {
                skippedEntries++;
                return;
            }

            uniIds.push(entry._id);
            lats.push(entry.uni.geometry.coordinates[1]);
            lons.push(entry.uni.geometry.coordinates[0]);
            totalAmenities.push(entry.stats.totalAmenities || 0);
            entropies.push(entry.stats.amenityEntropy || 0);
            names.push(entry.uni.properties.name || '');
        });

        console.log('Skipped entries:', skippedEntries, 'oçut of', uniWithContextEntries.length);

        const allUniWithContextsMinimalEntry = new AllUniWithContextsMinimal({
            uniIds,
            lats,
            lons,
            totalAmenities,
            entropies,
            names
        });

        await allUniWithContextsMinimalEntry.save();
        console.log('\x1b[32m\x1b[1m%s\x1b[0m', 'AllUniWithContextsMinimal entry created successfully');
    } catch (error) {
        console.error('Error creating AllUniWithContextsMinimal entry:', error);
    }
}



createAllUniWithContextsMinimal();
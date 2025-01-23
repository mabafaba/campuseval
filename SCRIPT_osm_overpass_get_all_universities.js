const osmQueries = {
  germanUniversities: [
    
//     `
// area["ISO3166-1"="DE"][admin_level=2];
// ( node["amenity"="university"](area);
//   way["amenity"="university"](area);
//   rel["amenity"="university"](area);
// );
// out center;
// `,
// `area["ISO3166-1"="DE"][admin_level=2];
// ( node["building"="university"](area);
//   way["building"="university"](area);
//   rel["building"="university"](area);
// );
// out center;
// `

`area[name="Wolfsburg"];
way[building="university"](area);
(._;>;);
out center;`
  ]
};
const axios = require('axios');
const mongoose = require('mongoose');

const { Feature, UniWithContext } = require('./db'); // Assuming UniWithContext is exported from db

async function fetchAndStoreUniversities() {
   
  const queries = osmQueries.germanUniversities;
  const baseUrl = 'https://overpass-api.de/api/interpreter?data=[out:json];';

  for (const query of queries) {
    try {
    console.log('Fetching data for query:', query);
      const response = await axios.get(baseUrl + encodeURIComponent(query));
      console.log('Response:', response);
      const elements = response.data.elements;

      for (const element of elements) {
        console.log('Element:', element);
        // skip unless point
        const feature = new Feature({
          type: 'Feature',
          properties: element.tags,
          geometry: {
            type: 'Point',
            coordinates: [element.lon, element.lat]
          }
        });

        await feature.save();
        console.log('Feature saved:', feature);
        const uniWithContext = new UniWithContext({
          uni: feature
        });

        await uniWithContext.save();
        console.log('UniWithContext saved:', uniWithContext);

        // log progress
        console.log('Stored', elements.indexOf(element) + 1, 'of', elements.length, 'elements');

      }
    } catch (error) {
      console.error('Error fetching or storing data:', error);
    }
  }
}

fetchAndStoreUniversities();
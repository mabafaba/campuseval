const views = {
    views: ['info', 'loading', 'map', 'overall-stats', 'selected-uni-stats', 'primary-action', 'secondary-action', 'locationpicker', 'selected-location-stats', 'stats', 'totalamenities-rank-chart', 'entropy-rank-chart', 'compare-stats'],
    views_default_size: {
        'info': {width: '100%', height: '100%'},
        'loading': {width: '100%', height: '100%'},
        'map': {width: '100%', height: '100%'},
        'overall-stats': {width: '100%', height: '100%'},
        'selected-uni-stats': {width: '100%', height: '50%'},
        'locationpicker': {width: '100%', height: '100%'},
        'selected-location-stats': {width: '100%', height: '100%'},
        'stats': {width: '100%', height: '100%'},
        'totalamenities-rank-chart': {width: '50%', height: '100%'},
        'entropy-rank-chart': {width: '50%', height: '100%'}
    },

    show: function(ids, widths=[], heights=[]) {
        // if any id not in views, log error
        ids.forEach(id => {
            if (!this.views.includes(id)) {
                console.error('view not defined in views.views', id);
            }
        }); 
        this.views.forEach((view, i) => {
            const element = document.getElementById(view);
            if(!element) {
                console.log('element not found', view);
                return;
            }
            if (ids.includes(view)) {
                element.style.display = 'block';
                // if stats, display flex
                if (view === 'stats' || view === 'compare-stats') {
                    element.style.display = 'flex';
                }
                
                // pick from widths array index of ids matching view

                const width = widths[ids.indexOf(view)];
                if (width) {
                    element.style.width = width;
                }
                const height = heights[ids.indexOf(view)];
                if (height) {
                    element.style.height = height;
                }
            } else {
                element.style.display = 'none';
                // not none but hidden
                
            }
        });
        // if map is shown, invalidate size
        if (ids.includes('map')) {
            map.invalidateSize();
        }
        // if chart, update to fit
       
        // resize maps
        window.dispatchEvent(new Event('resize'));
    },

    primaryAction: ()=>{},
    secondaryAction: ()=>{},

    setPrimaryAction: function(label, action) {
        document.getElementById('primary-action').innerText = label;
        this.primaryAction = action;
    },
    setSecondaryAction: function(label, action) {
        document.getElementById('secondary-action').innerText = label;
        this.secondaryAction = action;
    },

    loading: function() {
        this.show(['loading'], ['100%'], ['100%']);
    },

    universityMap: function() {
        this.show(['map', 'secondary-action'],['100%'],['100%']);
        map.fitBounds(L.geoJSON(minimalUnis).getBounds());
        removeAmenitiesFromMap();
        map.eachLayer(function(layer) {
            if (layer.feature) {
                layer.setStyle({
                    fillColor: 'green',
                    color: 'green'
                });
            }
        });
        createScatterChart(minimalUnis);
        scatterChart.update();
        scatterChart.data.datasets[0].data.forEach(function(d) {
            d.highlighted = false;
            d.r = 5;
        });
        scatterChart.options.plugins.annotation.annotations = [];
        scatterChart.update();
        window.dispatchEvent(new Event('resize'));

        this.setSecondaryAction('back', () => {
            this.compareLocation();
        });
    },

    universityDetails: function(uniID) {
        this.show(['map', 'overall-stats', 'selected-uni-stats', 'stats', 'primary-action'], ['100%', '100%', '100%', '100%'], ['40%', '20%', '20%', '20%']);
        this.setPrimaryAction('show all', () => {
            this.universityMap();
        });
        window.dispatchEvent(new Event('resize'));
    },

    locationpicker: function() {
        this.show(['locationpicker', 'primary-action'], ['100%'],['100%']);
        this.setPrimaryAction('use this location', focusSelectedLocation);
    },

    selectedLocationDetails: function() {
        
        this.show(['map', 'selected-location-stats', 'stats', 'primary-action','secondary-action'], ['100%', '100%','100%'], ['40%', '40%', '20%']);
        // compare butto
        this.setPrimaryAction('compare', () => {
            this.compareLocation();
        });
        this.setSecondaryAction('back', () => {
            this.locationpicker();
        });
        // update map
        
        // Additional logic for selected location details can be added here
        window.dispatchEvent(new Event('resize'));
    },

    compareLocation: function(){
        highlightedUni = "selected-location";
        // visualisations.overviewMap(minimalUnis);
        createScatterChart(minimalUnis);
        // // shows scatter plot over 50% of screen, with comparativestats for selected location
        this.show(['overall-stats', 'stats', 'compare-stats', 'primary-action','secondary-action'], ['100%', '100%'], ['60%', '20%', '20']);
        displayCompareStats();
        displayStats(selectedLocation.properties.stats);
        // this.show(['totalamenities-rank-chart','entropy-rank-chart', 'primary-action','secondary-action'], ['50%', '50%'], ['100%', '100%']);
        // console.log('compare location');

        // // make data like
        // // [{value:1,label:'x',highlighted:true}] from 
        // // minimalUnis
        // var countdata = minimalUnis.features.map(uni => {
        //     return {
        //         value: uni.properties.stats.totalAmenities,
        //         label: uni.properties.name || uni.properties.stats.totalAmenities,
        //         highlighted: uni.properties.name === 'selected-location'
        //     }
        // });
        
        // // sort decending
        // countdata.sort((a,b) => b.value - a.value);
        // visualisations.horizontalBarChart(countdata, document.getElementById('totalamenities-rank-chart'));

        // var entropydata = minimalUnis.features.map(uni => {
        //     return {
        //         value: uni.properties.stats.amenityEntropy,
        //         label: uni.properties.name || uni.properties.stats.amenityEntropy,
        //         highlighted: uni.properties.name === 'selected-location'
        //     }
        // }
        // );
        // entropydata.sort((a,b) => b.value - a.value);
        // visualisations.horizontalBarChart(entropydata, document.getElementById('entropy-rank-chart'));




        // explore primary button
        this.setPrimaryAction('explore', ()=>{
            this.universityMap();
        });
        // back button, return to selected location details
        this.setSecondaryAction('back', ()=>{
            this.selectedLocationDetails();
        });
    },

    showInfo: ()=>{
        document.getElementById('info').style.display = 'block';
        document.getElementById('infobutton').style.display = 'none';
        document.getElementById('closeinfobutton').style.display = 'block';
    },
    hideInfo: ()=>{
        document.getElementById('info').style.display = 'none';
        document.getElementById('infobutton').style.display = 'block';
        document.getElementById('closeinfobutton').style.display = 'none';
    }
}


const visualisations = {
    overviewMap: function(data) {
    
    L.geoJSON(data, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
            radius: 4,
            fillColor: "#00FF00",
            color: "#00000000",
            weight: 1,
            opacity: 0,
            fillOpacity: 0.7
        }),
        onEachFeature: (feature, layer) => {
            if (feature.properties && feature.properties.name) {
                layer.bindTooltip(feature.properties.name);
            }
            layer.on('click', () => {
                console.log('clicked on', feature._id);
                focusUniversity(feature._id);
            });
            layer.on('mouseover', () => {
                highlightUniInColor(feature._id, 'blue');
            });
            layer.on('mouseout', () => {
                highlightUniInColor(feature._id, false);
            });
            
        }
    }).addTo(map);
    map.fitBounds(L.geoJSON(data).getBounds());
    return data;
},
horizontalBarChart: function(data, parent) {
    // destroy existing chart
    if (parent.querySelector('.chart-large-container')) {
        parent.removeChild(parent.querySelector('.chart-large-container'));
    }
    const largecontainer = document.createElement('div');
    largecontainer.class = 'chart-large-container';
    largecontainer.style.width = '100%';
    largecontainer.style.height = data.length * 5 + 'px';
    parent.appendChild(largecontainer);
    const ctx = document.createElement('canvas');
    largecontainer.appendChild(ctx);
    console.log('height', data.length * 1);
    ctx.height = (data.length * 5)+"px"; // Set height based on number of data points
    console.log('barchart data', data);
    const labels = data.map(item => item.label);
    const values = data.map(item => item.value);
    const highlighted = data.map(item => item.highlighted);
     
    


    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Dataset',
                data: values,
                backgroundColor: highlighted.map(h => h ? '#39FF14' : '#FF6EC7'),
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
               
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // ctx.height = (data.length * 5)+"px"; // Set height based on number of data points
    // make this an !important style
    // ctx.style.height = (data.length * 5)+"px";
    // make this an !important style

}



}
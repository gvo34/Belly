/**
 * 
 * 
 * 
 */

function gauge(frequency){

    // display as a level between 0 and 180
    switch(frequency){
        case 0:
            level = 0;
            break;
        case 1:
            level = 25;
            break;
        case 2:
            level = 45;
            break;
        case 3:
            level = 60;
            break;
        case 4:
            level = 85;
            break;
        case 5:
            level = 100;
            break;
        case 6:
            level = 115;
            break;
        case 7:
            level = 140;
            break;
        case 8:
            level = 170;
            break;
        default:
            level = 180;
    }

    // Trig to calc meter point
    var degrees = 180 - level,
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [{ type: 'scatter',
    x: [0], y:[0],
        marker: {size: 28, color:'850000'},
        showlegend: false,
        name: 'frequency',
        text: frequency,
        hoverinfo: 'text+name'},
    { values: [50/9,50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9,50/9,50],
    rotation: 90,
    text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4',
                '2-3', '1-2', '0-1',''],
    textinfo: 'text',
    textposition:'inside',
    marker: {colors:['rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                            'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                            'rgba(205, 202, 42, .5)', 'rgba(210, 209, 95, .5)',
                            'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                            'rgba(240, 216, 145, .5)',
                            'rgba(255, 255, 255, 0)']},
    labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4',
    '2-3', '1-2', '0-1',''],
    hoverinfo: 'label',
    hole: .5,
    type: 'pie',
    showlegend: false
    }];

    var layout = {
    shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
            color: '850000'
        }
        }],
    title: 'Weekly frequency 0-9',
    xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
    yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };

    Plotly.newPlot('dialweek', data, layout);
}


/* 
 * Update the plot with new data
 */
function updatePlotly(newdata) {

    console.log("UPDATE PLOTLY");
    console.log("redraw pie");
    var plotdiv = document.getElementById('plot');

    var labels = newdata.otu_ids.slice(1,11);
    var values = newdata.sample_values.slice(1,11);
    var descriptions = newdata.otu_desc.slice(1,11);

    console.log(labels);
    console.log(values);

    Plotly.restyle(plotdiv, 'labels', [labels]);
    Plotly.restyle(plotdiv, 'values', [values]);
    //Plotly.restyle(plotdiv, 'text', [descriptions]);
    

    var samplevalue =  newdata.sample_values;
    console.log(samplevalue);
    size =[];
    var d3colors = Plotly.d3.scale.category10();
    // color = Plotly.d3.rgb(rgb).toString()
    // var text = "Plotly: " + color + " ; " + rgb;
    colors =[];
    for (var i; i<newdata.otu_desc; i++){
        colors.push(d3colors(i));
    }

    console.log(colors);

    for (var value in newdata.sample_values) {
        size.push(newdata.sample_values[value]/2);
      }
    console.log(size)

    console.log("redraw scatter");
    var scatdiv = document.getElementById('scatter');
    Plotly.restyle(scatdiv, 'x', [newdata.otu_ids]);
    Plotly.restyle(scatdiv, 'y', [newdata.sample_values]);
    Plotly.restyle(scatdiv, 'text', [newdata.otu_desc]);
    Plotly.restyle(scatdiv, 'marker.size', [size]);
    
    // WHY doesnt this work?
    //Plotly.restyle(scatdiv, "marker.color",[colors]);
    // var update = {
    //     'x':newdata.otu_ids,
    //     'y':newdata.sample_values,
    //     mode: 'markers',
    //     'marker': {
    //         'size': newdata.sample_values
    //     }

    // };
    // Plotly.update(scatdiv, update,[0]);
    
}

/*
 * optionChanged to handle the change event when a new sample is selected 
 * (i.e. fetch data for the newly selected sample).
 */
function optionChanged(route) {
    console.log("Option changed called with  "+ route);
    Plotly.d3.json(`samples/${route}`, function(error, data) {
        console.log("Option Changed", data);
        // update pie chart and scatter plot
        updatePlotly(data);   
    });
    // update weekly frequency gauge, recreates the plot each time
    weekly(route);
    // update metadata displayed for selected sample
    meta(route);
} 

var names_route = '/names';
function names() {
    /*    Use document.getElementById, 
     * document.createElement and append to populate the create option elements and append them to the dropdown selector.
     * add   <option value="BB_940">BB_940</option>
     */
    Plotly.d3.json(names_route, function(error, response) {

        if (error) {
            console.warn("Error:"+error);
        }
        
        console.log(names_route);
        var SELECT = document.getElementById('selDataset');
        for (var i = 1; i < response.length; i++) {
            var OPTION = document.createElement('option');
            var selectHTML = "<option value='" + response[i] + "'>" + response[i] + "</option>";
            OPTION.innerHTML = selectHTML;
            SELECT.add(OPTION);
        }
    
    });
    
}

var otu_route = '/otu'
function otu(){
    /*
     *  List of OTU descriptions.
     *   Returns a list of OTU descriptions in array format
    */
    Plotly.d3.json(otu_route, function(error, response) {
        if (error) return console.warn(error);

        return response
    })  

}

// meta_route = '/metadata/<sample>'
function meta(sample){
    /*
     *   MetaData for a given sample.
     *   Args: Sample in the format: `BB_940`
    */
    Plotly.d3.json(`/metadata/${sample}`, function(error, response) {
        console.log("medatdata "+ response);
        if (error) return console.warn(error);

        var TABLE = document.getElementById('meta_data');
        var TEXT1 = "<p> AGE:      " + response.AGE + "</p>";
        var TEXT2 = "<p> BBTYPE:   " + response.BBTYPE + "</p>";
        var TEXT3 = "<p> ETHNICITY:" + response.ETHNICITY + "</p>";
        var TEXT4 = "<p> GENDER:   " + response.GENDER + "</p>";
        var TEXT5 = "<p> LOCATION: " + response.LOCATION + "</p>";
        TABLE.innerHTML = TEXT1 + TEXT2 +TEXT3 + TEXT4 + TEXT5;

        var SAMPLEID = document.getElementById('sample_id');
        var TEXT6 = "<p> SAMPLEID:  " + response.SAMPLEID + "</p>";
        SAMPLEID.innerHTML = TEXT6;

        return response
    });
    

}

// wfreq_route = '/wfreq/<sample>'
function weekly(sample){
    /*
     *   Weekly Washing Frequency as a number.
     *   Args: Sample in the format: `BB_940`
    */
    Plotly.d3.json(`/wfreq/${sample}`, function(error, response) {
        console.log("Weekly Frequency "+ response);
        if (error) return console.warn(error);

        gauge(response);
        return response
    });
}


// samples_route = '/samples/<sample>'
function samples(sample){
    /*
    *   OTU IDs and Sample Values for a given sample.
    *   OTU ID and Sample Value in Descending Order by Sample Value
    */

    Plotly.d3.json(`/samples/${sample}`, function(error, response) {
        console.log("samples/SAMPLE");
        if (error) return console.warn(error);
        console.log(response)

        datasample = response;    
        var trace = [
          {
            labels: datasample.otu_ids.slice(1,11),
            values: datasample.sample_values.slice(1,11),
            type: 'pie'
          },
        ];
        Plotly.plot('plot', trace);
        var sizes =[];
        for (var value in datasample.sample_values) {
            sizes.push(datasample.sample_values[value]/2);
          }
        var traces = [
            {
              x: datasample.otu_ids,
              y: datasample.sample_values,
              type: 'scatter',
              mode: 'markers',
              marker: {
                  size: sizes
              }
            },
          ];
        var layout = {
            xaxis: {
                title: 'OTU ID',
            },
            showlegend: false,
        };
    
        Plotly.plot('scatter',traces, layout);

        return response
    })
}


function init() {

    console.log("draw_pie for initial sample");

    samples('BB_940');
    weekly('BB_940');
    meta('BB_940');
}
  

names()    
init();

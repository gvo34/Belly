/**
 * 
 * 
 * 
 */


function drawgauge(frequency){
    // Enter a speed between 0 and 180
var level = frequency;

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
    name: 'Weekly Frequency',
    text: level,
    hoverinfo: 'text+name'},
  { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9,50],
  rotation: 90,
  text: ['9-8', '8-7', '7-6', '6-5',
            '5-4', '4-3', '3-2','2-1','1-0'],
  textinfo: 'text',
  textposition:'inside',      
  marker: {colors:['rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                         'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                         'rgba(210, 206, 145, .5)', 'rgba(220, 226, 202, .5)',
                         'rgba(230, 216, 145, .5)', 'rgba(240, 226, 202, .5)',
                         'rgba(248, 226, 202, .5)',
                         'rgba(255, 255, 255, 0)'],
                        },
  labels: ['9-8', '8-7', '7-6', '6-5', '5-4', '4-3', '3-2', '2-1', '1-0'],
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
  title: '<b>Gauge</b> <br> Frequency 0-9',
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
    Plotly.restyle(scatdiv, "marker.color",[colors]);

    
   
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
    console.log("called with  "+ route);
    Plotly.d3.json(`samples/${route}`, function(error, data) {
        console.log("Option Changed", data);
        updatePlotly(data);
    });


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

var meta_route = '/metadata/<sample>'
function meta(sample){
    /*
     *   MetaData for a given sample.
     *   Args: Sample in the format: `BB_940`
    */
    Plotly.d3.json(meta_route, function(error, response) {
        if (error) return console.warn(error);
        return response
    });
    tablepanel = document.getElementById('sampledata');

}

var wfreq_route = '/wfreq/<sample>'
function weekly(sample){
    /*
     *   Weekly Washing Frequency as a number.
     *   Args: Sample in the format: `BB_940`
    */
    Plotly.d3.json(wfreq_route, function(error, response) {
        console.log("Weekly Frequency "+ response);
        if (error) return console.warn(error);
        return response
    });
}


var samples_route = '/samples/<sample>'
function samples(sample){
    /*
    *   OTU IDs and Sample Values for a given sample.
    *   OTU ID and Sample Value in Descending Order by Sample Value
    */

    Plotly.d3.json(samples_route, function(error, response) {
        console.log("SAMPLES/SAMPLE");
        if (error) return console.warn(error);
        console.log(response)
        return response
    })
}


function init() {
    console.log("INIT ");
    
    // Empty charts to begin
    var trace = [
      {
        x: [],
        y: [],
        type: 'pie'
      },
    ];
    Plotly.plot('plot', trace);
    var traces = [
        {
          x: [1,2,3],
          y: [1,2,3],
          type: 'scatter',
          mode: 'markers',
          marker: {
              size:[1,2,3]
          }
        },
      ];
    var layout = {
        xaxis: {
            title: 'OTU ID',
            range:[0,3700]
        },
        yaxis: {
            range:[0,200]
        },
        showlegend: false,
    };
    console.log("display initial scatter plot");
    Plotly.plot('scatter',traces, layout);

    // Draw initial sample
    var bbsample = 'BB_940'
    console.log("display initial pie with "+ bbsample);
    optionChanged(bbsample);

    var weekly_freq = weekly(bbsample);
    console.log("display the gauge dial  with " + weekly_freq);
    
    
    drawgauge(5);
    
    // console.log("display the sample data table");
    // metadata(bbsample);
    // var bbsample = 'BB-940'
    





    


  }
  

names()    
init()

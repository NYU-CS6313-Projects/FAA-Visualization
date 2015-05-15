var mapViewModule = (function(){
  "use strict";

  var mapView = {};
  var gatheredData;

  mapView.create = function(data, data_type, minimum_date, maximum_date){

    var width = 475,
        height = 510,
        active = d3.select(null);

    var projection = d3.geo.albersUsa()
        .scale(1000)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#side-view").append("svg")
        .attr("class", data_type + "-mapview")
        .attr("width", width)
        .attr("height", height);

    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .on("click", reset);

    var g = svg.append("g")
        .style("stroke-width", "1.5px")
        .attr("transform", "translate(100,100)scale(0.6, 0.6)");

      var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
  })

  var fatality_color;
    var accident_color;


       // svg.call(tip);
  //   var fatality_color = d3.scale.quantile()
  //     .domain([1, MAX_FATALITIES])
  //     .range(d3.range(1, 8).map(function(d) {
  //       return "q-color" + d + "-10";
  //     }));

  // // console.log(fatality_color(30));
  // //  Map input domain to discrete range.

  //   var accident_color = d3.scale.quantile()
  //     .domain([1, MAX_ACCIDENTS])
  //     .range(d3.range(1, 8).map(function(d) {
  //       return "q-color" + d + "-10";
  //     }));


    // var legend = svg.selectAll(".legend")
    //     .data(color.domain().slice().reverse())
    //     .enter().append("g")
    //     .attr("class", "legend")
    //     .attr("transform", function (d, i) {
    //     return "translate(0," + i * 20 + ")";
    // });

    // legend.append("rect")
    //     .attr("x", width - 18)
    //     .attr("width", 18)
    //     .attr("height", 18)
    //     .style("fill", color);

    // legend.append("text")
    //     .attr("x", width - 24)
    //     .attr("y", 9)
    //     .attr("dy", ".35em")
    //     .style("text-anchor", "end")
    //     .text(function (d) {
    //     return d;
    // });


    d3.csv(csv_path, function(error, csv) {
      d3.json("/javascripts/us-named.json", function(error, us) {
        // aggregate_color = d3.nest
        if(minimum_date != undefined && maximum_date != undefined){
          csv = csv.filter(function(d){
            var currentDate = Date.parse(d.date);

              if (minimum_date <= currentDate && currentDate <= maximum_date) {
                return d;
              }
          });
        }

        gatheredData = csv;

        console.log(csv);
        // console.log(us.objects.states.geometries);

        var state_accident_data = d3.nest().key(function(d){
          return d.state;
        })
        .rollup(function(d){
          return d.length;
        }).map(csv);

        var state_fatality_data = d3.nest().key(function(d){
          return d.state;
        })
        .rollup(function(d){
          fatality_sum = d3.sum(d, function(g, i) {
          if (g.fatalities !== null) {
            fatalities = parseInt(g.fatalities);
          } else {
            fatalities = 0;
          }

          return fatalities;
        });

          return fatality_sum;
        }).map(csv);

        var features = topojson.feature(us, us.objects.states).features;
          top.location.hash.split("").slice(1, features.length).forEach(function(c, i) {
            if ((c = +c) >= 0 && c < 10) assign(features[i], c ? c - 1 : null);
          });

        if(data_type == "fatalities")
        {
          var arr_fatality = Object.keys( state_fatality_data ).map(function ( key ) { return state_fatality_data[key]; });
          var max_fatality = Math.max.apply( null, arr_fatality );

          fatality_color = d3.scale.threshold()
              .domain([0, max_fatality * 0.15, max_fatality * .30, max_fatality * .45, max_fatality * .65, max_fatality * .85]) // <-A
              .range(["#ffffff", "#FEE0D2", "#FC9272", "#FB6A4A", "#CB181D", "#A50F15", "#67000D"]);

          var state = g.selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
          .enter().append("path")
            .attr("d", path)
            .attr("class", function(d){ return "feature"})
            .style("fill", function(d){return fatality_color(state_fatality_data[d.properties.code])})
            .on("click", clicked);

            state.append("title")
            .text(function(d){return "Fatalities: " + state_fatality_data[d.properties.code];});
        }
          
        if(data_type == "accidents")
        {
          var arr_accident = Object.keys( state_accident_data ).map(function ( key ) { return state_accident_data[key]; });
          var max_accident = Math.max.apply( null, arr_accident );

          accident_color = d3.scale.threshold()
              .domain([0, max_accident * 0.15, max_accident * .30, max_accident * .45, max_accident * .65, max_accident * .85]) // <-A
              .range(["#ffffff", "#FEE0D2", "#FC9272", "#FB6A4A", "#CB181D", "#A50F15", "#67000D"]);

          var state = g.selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
          .enter().append("path")
            .attr("d", path)
            .attr("class", function(d){ return "feature"})
            .style("fill", function(d){return accident_color(state_accident_data[d.properties.code])})
            .on("click", clicked);

            state.append("title")
            .text(function(d){return "Accidents: " + state_accident_data[d.properties.code];});
        }

        console.log("states");
        console.log(state_fatality_data);
        console.log(state_accident_data);

            // .on('mouseover', tip.show)
            // .on('mouseout', tip.hide);

        g.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "mesh")
            .attr("d", path);
      });
    });

    function clicked(d) {
      d3.select("#weather-breakdown").remove();
      console.log(d.properties.code);

      if (active.node() === this) return reset();
      active.classed("active", false);
      active = d3.select(this).classed("active", true);

      var bounds = path.bounds(d),
          dx = bounds[1][0] - bounds[0][0],
          dy = bounds[1][1] - bounds[0][1],
          x = (bounds[0][0] + bounds[1][0]) / 2,
          y = (bounds[0][1] + bounds[1][1]) / 2,
          scale = .9 / Math.max(dx / width, dy / height),
          translate = [width / 2 - scale * x, height / 2 - scale * y];

      g.transition()
          .duration(750)
          .style("stroke-width", 1.5 / scale + "px")
          .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

      generateScatterPlot(d.properties.code);
    }

    function reset() {
      active.classed("active", false);
      active = d3.select(null);

      g.transition()
          .duration(750)
          .style("stroke-width", "1.5px")
          .attr("transform", "translate(100,100)scale(0.6, 0.6)");
    }

    function generateScatterPlot(state) {
      var count = 0;

      var stateData = d3.nest().key(function(d){return d.state})
                  .sortKeys(d3.ascending)
                  .key(function(d){return d.weather})
                  .rollup(function(leaves){return leaves.length;})
                  .entries(gatheredData).filter(function(d){return state == d.key});

    console.log(stateData[0].values);


    stateData[0].values = stateData[0].values.sort(function(a, b){return b.values - a.values}).filter(function(d, i){return (d.key != "null" && d.key != "Other" && d.key != "Unknown") && (i == 0 || i == 1 || i == 2 || i == 3 || i == 4 || i == 5 ||  i == 6 || i == 7);});

      var margin = {top: 20, right: 20, bottom: 30, left: 40},
          width = 475 - margin.left - margin.right,
          height = 510 - margin.top - margin.bottom;

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<strong>Frequency:</strong> <span style='color:red'>" + d.values + "</span>";
            })

      var x = d3.scale.ordinal()
          .rangeRoundBands([0, width], .1, 1);

      var y = d3.scale.linear()
          .range([height, 0]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .tickFormat(d3.format(".2s"));

      // var svg = d3.select("#side-view").append("svg")
      //     .attr("width", width + margin.left + margin.right)
      //     .attr("height", height + margin.top + margin.bottom)
        var barChart = svg.append("g").attr("id", "weather-breakdown")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.call(tip);

      var color = d3.scale.ordinal()
        .range([ "#B2182B", "#E08214", "#676767", "#EF8A62",  "#D8B365", "#999999"]);

        stateData[0].values.forEach(function(d) {
          d.values = +d.values;
        });

        x.domain(stateData[0].values.map(function(d) { return d.key; }));
        y.domain([0, d3.max(stateData[0].values, function(d) { return d.values; })]);

        barChart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll(".tick text")
      .call(wrap, x.rangeBand());

        barChart.append("g")
            .attr("class", "y axis")
            // .attr("transform", "translate(35,0)")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Frequency");

        barChart.selectAll(".bar")
            .data(stateData[0].values)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.key); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.values); })
            .attr("height", function(d) { return height - y(d.values); })
            .style("fill", function(d){return color(d.key);})
            .on('mouseover', function(d){
          tip.show(d);
          hoverBar(d);
        })
      .on('mouseout', function(d){tip.hide(d); hoverOff(d);});;
        
        function wrap(text, width) {
            text.each(function() {
              var text = d3.select(this),
                  words = text.text().split(/\s+/).reverse(),
                  word,
                  line = [],
                  lineNumber = 0,
                  lineHeight = 1.1, // ems
                  y = text.attr("y"),
                  dy = parseFloat(text.attr("dy")),
                  tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
              while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                  line.pop();
                  tspan.text(line.join(" "));
                  line = [word];
                  tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
              }
            });
          }

        function hoverBar(d) {
      // var s = "<p>" + d.category + "</p>";

          // var hoveredBar = d3.select(this);
          d3.selectAll('g .bar').filter(function(e){return e !== d}).style('opacity', 0.2);
          // d3.select('#hello').html(s);
        }

        function hoverOff() {
            d3.selectAll('g .bar').style('opacity', 1);
        }

      console.log(stateData);

      }
  };

    mapView.update = function(){
    
   };

  return mapView;

})();

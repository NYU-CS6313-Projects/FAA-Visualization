var mapViewModule = (function(){
  "use strict";

  var mapView = {};

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
    }

    function reset() {
      active.classed("active", false);
      active = d3.select(null);

      g.transition()
          .duration(750)
          .style("stroke-width", "1.5px")
          .attr("transform", "translate(100,100)scale(0.6, 0.6)");
    }

  };

    mapView.update = function(){
    
   };

  return mapView;

})();

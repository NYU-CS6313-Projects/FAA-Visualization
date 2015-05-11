var barChartModule = (function(){ 
  "use strict";

  var barChart = {};

  var category_data;
    var formattedCategoryData;
    var selectedCategories;
    var aggregate_data = {};
    var barChartData;

    var binXAxis = [];

    var margin = {top: 5, right: 5, bottom: 30, left: 40},
        width = 475 - margin.left - margin.right,
        height = 510 - margin.top - margin.bottom;

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.ordinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c"]);
        // .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c"]);

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
  })

    var svg;
    var data;

  barChart.create = function(minimum_date, maximum_date){

    function hoverBar(d) {
      // console.log(d);
      // var s = "<p>" + d.category + "</p>";

      // var hoveredBar = d3.select(this);
      d3.selectAll('.g rect').filter(function(e){return e !== d}).style('opacity', 0.3);
            console.log(d3.select(this));
      // d3.select('#hello').html(s);
    }

    function hoverOff() {
        d3.selectAll('.g rect').style('opacity', 1);
    }

    function checkboxChecked(d) {
      // d3.selectAll('input[name="accident_type"]')[0].forEach(function(d, i){console.log(d.checked);});
      
      function updateChart(selectedCategories){

        barChartData.forEach(function(d){
            d.categories = selectedCategories.map(function(category) {return {category: category, frequency: +d[category]}; });
          });

        // console.log("BarChartData inside update chart: " + barChartData);

          x0.domain(binXAxis.concat("0 - 199").concat("200 - 399").concat("400 - 599").concat("600 - 799").concat("800 - 999").concat("1000+"));
          x1.domain(selectedCategories).rangeRoundBands([0, x0.rangeBand()]);
          y.domain([0, d3.max(barChartData, function(d) { return d3.max(d.categories, function(d) { return d.frequency; }); })]);

        svg.selectAll('.x.axis').transition()
        .duration(800).call(xAxis)
        svg.selectAll('.y.axis').transition()
        .duration(800).call(yAxis)

        // console.log(barChartData);

        //  Update...
    var bin = svg.selectAll(".g")
        .data(barChartData)
        .attr("transform", function(d) { return "translate(" + x0(d.bin) + ",0)"; }).selectAll("rect")
        .data(function(d) {return d.categories; })
        .attr("width", x1.rangeBand())
        .attr("x", function(d) { return x1(d.category); })
        .attr("y", function(d) { return y(d.frequency); })
        .attr("height", function(d) { return height - y(d.frequency); })
        .style("fill", function(d) { return color(d.category); });

    //  Enter new elements...
      

      bin.enter().append('rect')
        .attr("width", x1.rangeBand())
        .attr("x", function(d) { return x1(d.category); })
        .attr("y", function(d) { return y(d.frequency); })
        // .transition().duration(800)
        .attr("height", function(d) { return height - y(d.frequency); })
        .style("fill", function(d) { return color(d.category); })
        .on('mouseover', function(d){
          tip.show(d);
          hoverBar(d);
        })
      .on('mouseout', function(d){tip.hide(d); hoverOff(d);});
        // .on('mouseover', hoverBar).on('mouseout', hoverOff);
        // .on('mouseover', function(d) { this.attr('fill', 'red');});

          bin.exit().remove();
          


        }

        function updateLegend(selectedCategories) {
               //  Update
        
        var legend = svg.select(".legend-group").selectAll(".legend")
                      .data(selectedCategories.slice(), function(d) { return d; })
                      .attr("transform", function(d, i) { return "translate(-100," + i * 12 + ")"; });

          //  Enter

          var enter_legend = legend.enter().append('g').attr('class', 'legend').attr("transform", function(d, i) { return "translate(-100," + i * 12 + ")"; });

          enter_legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", color);


          enter_legend.append("text")
          .attr("x", width - 24)
          .attr("y", 6)
          .attr("dy", ".35em")
          .attr("font-size", "10px")
          .style("text-anchor", "end")
          .text(function(d) { return d; });

          legend.exit().remove();




        }

      var input_checked_count = d3.nest().key(function(d){
          return d.checked === true ? "true" : "false";
        }).rollup(function(d){
          return d.length; 
        }).map(d3.selectAll('input[name="accident_type"]')[0]);


      if(input_checked_count['true'] > 6) {
        d3.select(this).property('checked', false);
        alert('Cannot exceed six checked options.');
        return;
      }
      else {
        //  If the user has just checked this box, update the selected categories.
        if(d3.select(this).property('checked') === true)
        {
          selectedCategories.push(d3.select(this)[0][0].__data__);

          updateLegend(selectedCategories);
          updateChart(selectedCategories);

        }
        //  If the user unchecks this box, update the selected categories.
        else {
          // console.log(d3.select(this)[0][0].__data__);
          // svg.selectAll('rect').filter(function(d){ return d.category === checkboxValue; })
          // console.log("Items: " + selectedCategories.indexOf(d3.select(this)[0][0].__data__));
          selectedCategories.splice(selectedCategories.indexOf(d3.select(this)[0][0].__data__), 1);

          updateLegend(selectedCategories);
          updateChart(selectedCategories);
        }

        
        // svg.selectAll(".legend").data(selectedCategories.slice().reverse())
        //   .transition()
        // .duration(800) 
        //   .text(function(d) { return d; });
      }

      
      
    }


    function generateBarChart(totalHoursParameter, xAxisTitle) {

      svg = d3.select("#side-view").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.call(tip);

    d3.csv(csv_path, function(error, csv){

      data = csv;

      if(minimum_date != undefined && maximum_date != undefined){
        data = data.filter(function(d){
            var currentDate = Date.parse(d.date);

              if (minimum_date <= currentDate && currentDate <= maximum_date) {
                return d;
              }
          });
      }

       category_data = d3.nest().key(function(d){
          return 0 <= d[totalHoursParameter] && d[totalHoursParameter] < 200 ?
            "0 - 199" : (200 <= d[totalHoursParameter] && d[totalHoursParameter] < 400 ?
                          "200 - 399" : (400 <= d[totalHoursParameter] && d[totalHoursParameter] < 600 ?
                                          "400 - 599" : (600 <= d[totalHoursParameter] && d[totalHoursParameter] < 800 ?
                                                          "600 - 799" : (800 <= d[totalHoursParameter] && d[totalHoursParameter] < 1000 ?
                                                                          "800 - 999" : "1000+"))));
        })
      .key(function(d) { return d.primary_cause; })
      .sortKeys(d3.ascending)
      .rollup(function(leaves){ 
          return leaves.length;
        }).entries(data);

        formattedCategoryData = category_data.map(function(d){
          var obj = {};

          obj["bin"] = d.key;
          for(var i = 0; i < d.values.length; i++)
          {
            obj[d.values[i].key] = d.values[i].values;
          }

          return obj;
        });

        // console.log("Category Data");
        // console.log(category_data);

      function commonKeys(obj1, obj2, obj3, obj4, obj5, obj6) {
        var keys = [];
        for(var i in obj1) {
          if(i in obj2 && i in obj3 && i in obj4 && i in obj5 && i in obj6 && i !== "null" && i !== "bin") {
            keys.push(i);
            aggregate_data[i] = 0;
          }
        }              
        return keys;
      }

      var commonKeyValues = commonKeys(formattedCategoryData[0], formattedCategoryData[1], formattedCategoryData[2], formattedCategoryData[3], formattedCategoryData[4], formattedCategoryData[5]);

      // console.log("Common Key Values");
      // console.log(formattedCategoryData);

      barChartData = formattedCategoryData.map(function(d){
        var obj = {};

        obj["bin"] = d["bin"];
        for(var i = 0; i < commonKeyValues.length; i++)
        {
          obj[commonKeyValues[i]] = d[commonKeyValues[i]];
          aggregate_data[commonKeyValues[i]] += d[commonKeyValues[i]];
        }

        return obj;
      });

      // console.log("Bar Chart Data");
      console.log(barChartData);

      // console.log(category_data);
      // console.log(formattedCategoryData);
      // console.log(commonKeyValues);
      // console.log(barChartData);
      // console.log(aggregate_data);

      selectedCategories = commonKeyValues.filter(function(key, i) { return i === 0 || i === 1 || i === 2 || i === 3 || i === 4 || i === 5; });

      var selected_obj  = {};
      for(var i = 0, l = selectedCategories.length; i < l; i++) {
          selected_obj[selectedCategories[i]] = true;
      }

      // console.log("Selected!!!");
      // console.log(selectedCategories);
      // console.log("........");

      barChartData.forEach(function(d){
        d.categories = selectedCategories.map(function(category) {return {category: category, frequency: +d[category]}; });
      });

      // x0.domain(barChartData.map(function(d) {console.log('bin: ' + d.bin); return d.bin; }));
      x0.domain(binXAxis.concat("0 - 199").concat("200 - 399").concat("400 - 599").concat("600 - 799").concat("800 - 999").concat("1000+"));
      x1.domain(selectedCategories).rangeRoundBands([0, x0.rangeBand()]);
      y.domain([0, d3.max(barChartData, function(d) { return d3.max(d.categories, function(d) { return d.frequency; }); })]);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
          .append("text")
          .attr("y", 24)
          .attr("dy", ".5em")
          .attr("x", width / 2 + 50)
          .style("text-anchor", "end")
          .style("z-index", 999)
          .text(xAxisTitle);;

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          // .attr("dy", ".71em")
          .attr("dy", ".01em")
          .style("text-anchor", "end")
          .style("z-index", 999)
          .text("Frequency");

      var bin = svg.selectAll(".bins")
          .data(barChartData)
        .enter().append("g")
          .attr("class", "g")
          .attr("transform", function(d) { return "translate(" + x0(d.bin) + ",0)"; });
      
      var rect = bin.selectAll("rect")
          .data(function(d) { return d.categories; })
        .enter().append("rect")
          .attr("width", x1.rangeBand())
          .attr("x", function(d) { return x1(d.category); })
          .attr("y", function(d) { return y(d.frequency); })
          // .transition().duration(800)
          .attr("height", function(d) { return height - y(d.frequency); })
          .style("fill", function(d) { return color(d.category); })
          // .on('mouseover', hoverBar)
          // .on('mouseout', hoverOff);
          .on('mouseover', function(d){tip.show(d); hoverBar(d);})
      .on('mouseout', function(d){tip.hide(d); hoverOff(d);});
          // .on('mouseover', function(d) { this.attr('fill', 'red');});

      var legend = svg.append("g").attr("class", "legend-group").selectAll(".legend")
          .data(selectedCategories.slice(), function(d) { return d; })
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(-100," + i * 12 + ")"; });

      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", color);

      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 6)
          .attr("dy", ".35em")
          .attr("font-size", "10px")
          .style("text-anchor", "end")
          .text(function(d) { return d; });

      //  Need hover feature...
      // inputs = d3.select('#dropdown3')
      //             .selectAll('input')
      //             .data(commonKeyValues, function(d) { return d; })
      //             .enter()
      //             .append('li')
      //               // .attr('display', 'block')
      //               // .text(function(d){return d;})
      //             .append('a')
      //             .text(function(d){return d + ' ' + '(' + aggregate_data[d] + ')';})
      //             .append('input')
      //               .attr('type', 'checkbox')
      //               .attr('name', 'accident_type')
      //               .attr('value', function(d){return d;})
      //               // .attr('right', '25px')
      //               .style('left', '515px')
      //               .property('checked', function(d, i){return (i === 0 || i === 1 || i === 2 || i === 3 || i === 4 || i === 5) ? true : false;})
      //               .on('click', checkboxChecked);


    var inputs = d3.select('#dropdown3')
                  // .selectAll('input')
                  .selectAll('li')
                  .data(commonKeyValues, function(d) { return d; });
                  
        var inputs_sub = inputs.enter()
                  .append('li');
                    // .attr('display', 'block')
                    // .text(function(d){return d;})
        var inputs_sub_b = inputs_sub.append('a')
                  .text(function(d){return d + ' ' + '(' + aggregate_data[d] + ')';})
        
        inputs_sub_b.append('input')
                    .attr('type', 'checkbox')
                    .attr('name', 'accident_type')
                    .attr('value', function(d){ return d;})
                    // .attr('right', '25px')
                    // .style('left', '515px')
                      .style('left', '7px')
                    .style('margin-top', '6px')
                    // .style('font-weight', function(d, i){return (i === 0 || i === 1 || i === 2 || i === 3 || i === 4 || i === 5) ? "bold" : "normal";})
                    //console.log(d + ": " + (d in selected_obj));
                    .on('click', checkboxChecked);

        d3.selectAll('#dropdown3 li input').property('checked', function(d, i){ return (d in selected_obj) ? true : false;})
        // console.log(selected_obj)

            inputs.exit().remove();

      });
    }

    generateBarChart("total_hours_flown", "Total Hours Flown");

    d3.selectAll('#total-hours-flown, #total-hours-flown-ninety, #total-hours-flown-make, #total-hours-flown-ninety-make').on('click', function() {
          d3.select('#side-view').select('.legend-group').remove();
          d3.select('#side-view').select('svg').remove();
        if($('#total-hours-flown').is(':checked')) 
        {
          generateBarChart("total_hours_flown", "Total Hours Flown");
        }
        if($('#total-hours-flown-ninety').is(':checked')) 
          generateBarChart("hours_flown_90_days", "Total Hours Flown (Past 90 Days)");
        if($('#total-hours-flown-make').is(':checked'))
          generateBarChart("total_hours_model_flown", "Total Hours Flown - Make/Model");
        if($('#total-hours-flown-ninety-make').is(':checked'))
          generateBarChart("hours_model_flown_90_days", "Total Hours Flown (Past 90 Days) - Make/Model");
      }); 

    $(document).mouseup(function (e)
    {
      var container = $("#dropdown3");

      if (!container.is(e.target) // if the target of the click isn't the container...
          && container.has(e.target).length === 0) // ... nor a descendant of the container
      {
          container.hide();
      }
    });
  };

  return barChart;
})();
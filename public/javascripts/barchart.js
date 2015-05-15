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
    .range([ "#B2182B", "#E08214", "#676767", "#EF8A62",  "#D8B365", "#999999"]);



    var color_hash = {
                      "#B2182B": true, 
                      "#E08214": true, 
                      "#676767": true, 
                      "#EF8A62": true,  
                      "#D8B365": true, 
                      "#999999": true
                    }


            // .range(["#B2182B", "#E08214", "#4D4D4D", "#EF8A62",  "#D8B365", "#999999"]);
        // .range(["#B2182B", "#EF8A62", "#FDDBC7", "#E0E0E0", "#999999", "#4D4D4D"]);
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
      // var s = "<p>" + d.category + "</p>";

      // var hoveredBar = d3.select(this);
      d3.selectAll('.g rect').filter(function(e){return e !== d}).style('opacity', 0.2);
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

          x0.domain(binXAxis.concat("0 - 199").concat("200 - 399").concat("400 - 599").concat("600 - 799").concat("800 - 999").concat("1000+"));
          x1.domain(selectedCategories).rangeRoundBands([0, x0.rangeBand()]);
          y.domain([0, d3.max(barChartData, function(d) { return d3.max(d.categories, function(d) { return d.frequency; }); })]);

        svg.selectAll('.x.axis').transition()
        .duration(800).call(xAxis)
        svg.selectAll('.y.axis').transition()
        .duration(800).call(yAxis)

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
          .text(function(d) { return d; })
          .attr("fill", "#9e9e9e");

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


    function generateBarChart(totalHoursParameter, xAxisTitle, filterHash) {

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

      //  To verify the bin exists or not.
      var binHash = {"0 - 199":0, "200 - 399":0, "400 - 599":0, "600 - 799":0, "800 - 999":0, "1000+":0, "Unknown": 0};

      //  Retrieves data in the following format:
      //    6 objects: each object in the following format {key: 'bin_value', values: [array of objects in key/value pair]}
       category_data = d3.nest().key(function(d){
          return 0 <= d[totalHoursParameter] && d[totalHoursParameter] < 200 ?
            (binHash["0 - 199"] += 1, "0 - 199") : (200 <= d[totalHoursParameter] && d[totalHoursParameter] < 400 ?
                          (binHash["200 - 399"] += 1, "200 - 399") : (400 <= d[totalHoursParameter] && d[totalHoursParameter] < 600 ?
                                          (binHash["400 - 599"] += 1, "400 - 599") : (600 <= d[totalHoursParameter] && d[totalHoursParameter] < 800 ?
                                                          (binHash["600 - 799"] += 1, "600 - 799") : (800 <= d[totalHoursParameter] && d[totalHoursParameter] < 1000 ?
                                                                          (binHash["800 - 999"] += 1, "800 - 999") : (d[totalHoursParameter] >= 1000 ?
                                                                                (binHash["1000+"] += 1, "1000+") : (binHash["Unknown"] += 1, "Unknown") )))));
        })
      .key(function(d) {return d.primary_cause;})
      .sortKeys(d3.ascending)
      .rollup(function(leaves){ 
          return leaves.length;
        }).entries(data);

      // console.log(binHash);

      if(binHash["0 - 199"] == 0)
      {
        category_data.push({key: "0 - 199", values: [{key: "Advanced Throttle Rapidly", values: 0}, {key: "Aerobatics Below Safe Altitude", values: 0}, {key: "Aircraft Improperly Aligned With Runway", values: 0}, {key: "Aircraft Improperly Equipped for Flight", values: 0}, {key: "Attempt Operation With Different Equipment", values: 0}, {key: "Attempted Operations Beyond Experience Level", values: 0}, {key: "Blown Over By Strong Wind", values: 0}]});
      }
      if(binHash["200 - 399"] == 0)
      {
        category_data.push({key: "200 - 399", values: [{key: "Advanced Throttle Rapidly", values: 0}, {key: "Aerobatics Below Safe Altitude", values: 0}, {key: "Aircraft Improperly Aligned With Runway", values: 0}, {key: "Aircraft Improperly Equipped for Flight", values: 0}, {key: "Attempt Operation With Different Equipment", values: 0}, {key: "Attempted Operations Beyond Experience Level", values: 0}, {key: "Blown Over By Strong Wind", values: 0}]});
      }
      if(binHash["400 - 599"] == 0)
      {
        category_data.push({key: "400 - 599", values: [{key: "Advanced Throttle Rapidly", values: 0}, {key: "Aerobatics Below Safe Altitude", values: 0}, {key: "Aircraft Improperly Aligned With Runway", values: 0}, {key: "Aircraft Improperly Equipped for Flight", values: 0}, {key: "Attempt Operation With Different Equipment", values: 0}, {key: "Attempted Operations Beyond Experience Level", values: 0}, {key: "Blown Over By Strong Wind", values: 0}]});
      }
      if(binHash["600 - 799"] == 0)
      {
        category_data.push({key: "600 - 799", values: [{key: "Advanced Throttle Rapidly", values: 0}, {key: "Aerobatics Below Safe Altitude", values: 0}, {key: "Aircraft Improperly Aligned With Runway", values: 0}, {key: "Aircraft Improperly Equipped for Flight", values: 0}, {key: "Attempt Operation With Different Equipment", values: 0}, {key: "Attempted Operations Beyond Experience Level", values: 0}, {key: "Blown Over By Strong Wind", values: 0}]});
      }
      if(binHash["800 - 999"] == 0)
      {
        category_data.push({key: "800 - 999", values: [{key: "Advanced Throttle Rapidly", values: 0}, {key: "Aerobatics Below Safe Altitude", values: 0}, {key: "Aircraft Improperly Aligned With Runway", values: 0}, {key: "Aircraft Improperly Equipped for Flight", values: 0}, {key: "Attempt Operation With Different Equipment", values: 0}, {key: "Attempted Operations Beyond Experience Level", values: 0}, {key: "Blown Over By Strong Wind", values: 0}]});
      }
      if(binHash["1000+"] == 0)
      {
        category_data.push({key: "1000+", values: [{key: "Advanced Throttle Rapidly", values: 0}, {key: "Aerobatics Below Safe Altitude", values: 0}, {key: "Aircraft Improperly Aligned With Runway", values: 0}, {key: "Aircraft Improperly Equipped for Flight", values: 0}, {key: "Attempt Operation With Different Equipment", values: 0}, {key: "Attempted Operations Beyond Experience Level", values: 0}, {key: "Blown Over By Strong Wind", values: 0}]});
      }
      if(binHash["Unknown"] == 0)
      {
        category_data.push({key: "Unknown", values: [{key: "Advanced Throttle Rapidly", values: 0}, {key: "Aerobatics Below Safe Altitude", values: 0}, {key: "Aircraft Improperly Aligned With Runway", values: 0}, {key: "Aircraft Improperly Equipped for Flight", values: 0}, {key: "Attempt Operation With Different Equipment", values: 0}, {key: "Attempted Operations Beyond Experience Level", values: 0}, {key: "Blown Over By Strong Wind", values: 0}]});
      }

      // console.log(category_data);

      category_data = category_data.filter(function(d){
        if(d.values.length == 1 && d.values[0]["key"] == "null")
        {
          // console.log("Inside");
          d.values.push({key: "Advanced Throttle Rapidly", values: 0}, {key: "Aerobatics Below Safe Altitude", values: 0}, {key: "Aircraft Improperly Aligned With Runway", values: 0}, {key: "Aircraft Improperly Equipped for Flight", values: 0}, {key: "Attempt Operation With Different Equipment", values: 0}, {key: "Attempted Operations Beyond Experience Level", values: 0}, {key: "Blown Over By Strong Wind", values: 0});
          return d;
        }
        else
          return d;

      });

      //  Converts the above in the following format:
      //    6 objects: each object in the following format {0: {'cause': count}, ...}
        formattedCategoryData = category_data.filter(function(d){return d.key != "Unknown"}).map(function(d){
          var obj = {};

          obj["bin"] = d.key;
          for(var i = 0; i < d.values.length; i++)
          {
            obj[d.values[i].key] = d.values[i].values;
          }

          return obj;
        });

            // console.log(formattedCategoryData);


        //  Technically speaking, this function does not need to aggregate the common keys since we're dealing with reported accident types.
        //  Instead, take the maximum of each bin and make that one of the six categories.
      // function commonKeys(obj1, obj2, obj3, obj4, obj5, obj6) {
      //   var keys = [];
      //   for(var i in obj1) {
      //     if(i in obj2 && i in obj3 && i in obj4 && i in obj5 && i in obj6 && i !== "null" && i !== "bin") {
      //       keys.push(i);
      //       aggregate_data[i] = 0;
      //     }
      //   }              
      //   return keys;
      // }

      function extractUniqueKeys(obj1, obj2, obj3, obj4, obj5, obj6){
        var keys = [];
        for(var i in obj1) {
          if(i !== "null" && i !== "bin") {
            keys.push(i);
            aggregate_data[i] = 0;
          }
        }
        for(var i in obj2) {
          if(i !== "null" && i !== "bin" && !(i in obj1)) {
            keys.push(i);
            aggregate_data[i] = 0;
          }
        }
        for(var i in obj3) {
          if(i !== "null" && i !== "bin" && !(i in obj1) && !(i in obj2)) {
            keys.push(i);
            aggregate_data[i] = 0;
          }
        }
        for(var i in obj4) {
          if(i !== "null" && i !== "bin" && !(i in obj1) && !(i in obj2) && !(i in obj3)) {
            keys.push(i);
            aggregate_data[i] = 0;
          }
        }
        for(var i in obj5) {
          if(i !== "null" && i !== "bin" && !(i in obj1) && !(i in obj2) && !(i in obj3) && !(i in obj4)) {
            keys.push(i);
            aggregate_data[i] = 0;
          }
        }
        for(var i in obj6) {
          if(i !== "null" && i !== "bin" && !(i in obj1) && !(i in obj2) && !(i in obj3) && !(i in obj4) && !(i in obj5)) {
            keys.push(i);
            aggregate_data[i] = 0;
          }
        }
        return keys.sort();
      }

      function maxKeyValue(obj, keyOne, keyTwo, keyThree, keyFour, keyFive){
        // console.log(obj);

        if(keyOne == undefined && keyTwo == undefined && keyThree == undefined && keyFour == undefined && keyFive == undefined)
          return Object.keys(obj).filter(function(d){return d !== "null" && d !== "bin"; }).reduce(function(a, b){return  (obj[a] > obj[b]) ? a : b });
        else
          return Object.keys(obj).filter(function(d){return d !== "null" && d !== "bin" && d !== keyOne && d !== keyTwo && d !== keyThree && d !== keyFour && d !== keyFive; }).reduce(function(a, b){return  (obj[a] > obj[b]) ? a : b });
      }

      var bin0Category = maxKeyValue(formattedCategoryData[0]);
      var bin1Category = maxKeyValue(formattedCategoryData[1], bin0Category);
      var bin2Category = maxKeyValue(formattedCategoryData[2], bin0Category, bin1Category);
      var bin3Category = maxKeyValue(formattedCategoryData[3], bin0Category, bin1Category, bin2Category);
      var bin4Category = maxKeyValue(formattedCategoryData[4], bin0Category, bin1Category, bin2Category, bin3Category);
      var bin5Category = maxKeyValue(formattedCategoryData[5], bin0Category, bin1Category, bin2Category, bin3Category, bin4Category);

      //  undefined statements....

      var uniqueKeyValues = extractUniqueKeys(formattedCategoryData[0], formattedCategoryData[1], formattedCategoryData[2], formattedCategoryData[3], formattedCategoryData[4], formattedCategoryData[5]);

      // var commonKeyValues = commonKeys(formattedCategoryData[0], formattedCategoryData[1], formattedCategoryData[2], formattedCategoryData[3], formattedCategoryData[4], formattedCategoryData[5]);

      // console.log(commonKeyValues);

      barChartData = formattedCategoryData.map(function(d){
        var obj = {};

        obj["bin"] = d["bin"];
        for(var i = 0; i < uniqueKeyValues.length; i++)
        {
          if(d[uniqueKeyValues[i]] == undefined)
          {
            obj[uniqueKeyValues[i]] = 0;
            aggregate_data[uniqueKeyValues[i]] += 0;
          }
          else
          {
            obj[uniqueKeyValues[i]] = d[uniqueKeyValues[i]];
            aggregate_data[uniqueKeyValues[i]] += d[uniqueKeyValues[i]];
          }
        }

        return obj;
      });

      // console.log(barChartData);

      if(filterHash == undefined)
      {
        selectedCategories = uniqueKeyValues.filter(function(key, i) { return key === bin0Category || key === bin1Category || key === bin2Category || key === bin3Category || key === bin4Category || key === bin5Category;});

        var selected_obj  = {};
        for(var i = 0, l = selectedCategories.length; i < l; i++) {
            selected_obj[selectedCategories[i]] = true;
        }

        barChartData.forEach(function(d){
          d.categories = selectedCategories.map(function(category) {return {category: category, frequency: +d[category]}; });
        });
      }
      else
      {
        selectedCategories = uniqueKeyValues.filter(function(key, i) { return key in filterHash;});

        var selected_obj  = {};
        for(var i = 0, l = selectedCategories.length; i < l; i++) {
            selected_obj[selectedCategories[i]] = true;
        }

        barChartData.forEach(function(d){
          d.categories = selectedCategories.map(function(category) {return {category: category, frequency: +d[category]}; });
        });
      }


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
          .text(xAxisTitle)
          .attr("fill", "#9e9e9e");

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
          .text("Frequency")
          .attr("fill", "#9e9e9e");

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
          .style("fill", function(d) {if(color(d.category) in color_hash){ color_hash[color(d.category)] = true; } return color(d.category); })
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
          .text(function(d) { return d; })
          .attr("fill", "#9e9e9e");

    var inputs = d3.select('#dropdown3')
                  // .selectAll('input')
                  .selectAll('li')
                  .data(uniqueKeyValues, function(d) { return d; });
                  
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
      var filter_hash = {}; 
          d3.select('#side-view').select('.legend-group').remove();
          d3.select('#side-view').select('svg').remove();
        if($('#total-hours-flown').is(':checked')) 
        {
          d3.selectAll('#dropdown3 li input').filter(function(d){if(d3.select(this).property('checked')){ filter_hash[d3.select(this)[0][0].__data__] = true;}});
          generateBarChart("total_hours_flown", "Total Hours Flown", filter_hash);
        }
        if($('#total-hours-flown-ninety').is(':checked')) 
        {
          d3.selectAll('#dropdown3 li input').filter(function(d){if(d3.select(this).property('checked')){ filter_hash[d3.select(this)[0][0].__data__] = true;}});
          generateBarChart("hours_flown_90_days", "Total Hours Flown (Past 90 Days)", filter_hash);
        }
        if($('#total-hours-flown-make').is(':checked'))
        {
          d3.selectAll('#dropdown3 li input').filter(function(d){if(d3.select(this).property('checked')){ filter_hash[d3.select(this)[0][0].__data__] = true;}});
          generateBarChart("total_hours_model_flown", "Total Hours Flown - Make/Model", filter_hash);
        }
        if($('#total-hours-flown-ninety-make').is(':checked'))
        {
          d3.selectAll('#dropdown3 li input').filter(function(d){if(d3.select(this).property('checked')){ filter_hash[d3.select(this)[0][0].__data__] = true;}});
          generateBarChart("hours_model_flown_90_days", "Total Hours Flown (Past 90 Days) - Make/Model", filter_hash);
        }
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
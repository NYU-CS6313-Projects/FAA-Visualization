(function(){

  //  Initialize scale 
  var MAX_FATALITIES = 37;
  var MAX_ACCIDENTS = 44;

  var data_lookup = {}; 
  var accident_data;
  var fatality_data;

  var width = 750,
      height = 100,
      // cellSize = 17; // cell size
      cellSize = 13;

  var day = d3.time.format("%w"),
      week = d3.time.format("%U"),
      format = d3.time.format("%Y-%m-%d");

  var fatality_color = d3.scale.quantile()
      .domain([1, MAX_FATALITIES])
      .range(d3.range(1, 9).map(function(d){
        return "q-color" + d + "-10";
      }));

  console.log(fatality_color(30));
      //  Map input domain to discrete range.

  var accident_color = d3.scale.quantile()
      .domain([1, MAX_ACCIDENTS])
      .range(d3.range(1, 9).map(function(d){
        return "q-color" + d + "-10";
      }));

  //  append heatmap
  var svg = d3.select("#heatmap-panel").selectAll("svg")
      .data(d3.range(1980, 1985))
    .enter().append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "RdYlGn")
    .append("g")
      .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

  svg.append("text")
      .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
      .style("text-anchor", "middle")
      .text(function(d) { return d; });

  var rect = svg.selectAll(".day")
      .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("rect")
      .attr("class", "day")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", function(d) { return week(d) * cellSize; })
      .attr("y", function(d) { return day(d) * cellSize; })
      .datum(format);

  rect.append("title")
      .text(function(d) { return d; });

  svg.selectAll(".month")
      .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("path")
      .attr("class", "month")
      .attr("d", monthPath);

  d3.csv("../data/part_91_csv/data_1980_84.csv", function(error, csv) {

    csv.forEach(function(d){
      if(d.date in data_lookup)
        data_lookup[d.date].push(d);
      else
        data_lookup[d.date] = [];
    });

    fatality_data = d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(d) { 
        //  Count of fatalities...
         fatality_sum = d3.sum(d, function(g){
           if (g.fatalities !== null)
          {
              fatalities = parseInt(g.fatalities);
            
            return fatalities;
          }
          else 
              return 0; 
          });

         // if(MAX_FATALITIES < fatality_sum)
         //      MAX_FATALITIES = fatality_sum;
         //    console.log("Fatalities: " + MAX_FATALITIES);
         // console.log("Sum: " + fatality_sum);
         return fatality_sum;
      }).map(csv);

    accident_data = d3.nest()
      .key(function(d){ return d.date; })
      .rollup(function(d){
        //  Count of accidents...
        // if(d.length > MAX_ACCIDENTS)
        //   MAX_ACCIDENTS = d.length;
        // console.log("Accidents: " + MAX_ACCIDENTS);
        return d.length; 
      }).map(csv);

    // category_data = d3.nest().key(function(d){
    //   return d.primary_cause;
    // }).rollup(function(d){
    //   return (d3.sum(d, function(g){
    //       if(g.total_hours_flown !== null) return g.total_hours_flown;
    //       else return 0;
    //     })/d.length); 
    // }).map(csv);

  category_data = d3.nest().key(function(d){
      return d.primary_cause;
    }).rollup(function(d){
      return d.length; 
    }).map(csv);

    // generateBarCharts(csv);

    //  Initialize the view.
    rect.filter(function(d) { return d in fatality_data; })
      .attr("class", function(d) { return (fatality_data[d] === 0) ? "day q-color" + d + "-10" : "day " + fatality_color(fatality_data[d]); })
      .select("title")
        .text(function(d) {
          if(fatality_data[d] == 0)
            return d + ": No fatalities!";
          else if(fatality_data[d] == 1)
            return d + ": " + fatality_data[d] + " fatality" 
          else
            return d + ": " + fatality_data[d] + " fatalities"; 
        });
  });

  function monthPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = +day(t0), w0 = +week(t0),
        d1 = +day(t1), w1 = +week(t1);
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
        + "H" + w0 * cellSize + "V" + 7 * cellSize
        + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
        + "H" + (w1 + 1) * cellSize + "V" + 0
        + "H" + (w0 + 1) * cellSize + "Z";
  }

  d3.select(self.frameElement).style("height", "2910px");

  var heatmapRadioActions = function() {
    function rectVisibility(id, callback){
      var data;
      switch(id)
      {
        case "#fatalities":
          console.log("inside case fatalities");
          data = fatality_data;
          color = fatality_color;
          break;
        case "#accidents":
          console.log("inside case accidents");
          data = accident_data;
          color = accident_color;
          break;
        default:
          break;
      }

      callback(data, color);
    }

    function renderRectangle(data, color, id){
      console.log("inside default");
        rect.filter(function(d) { return d in data; })
          .attr("class", function(d) { return (data[d] === 0) ? "day q-color" + d + "-10" : "day " + color(data[d]); })
          .select("title")
            .text(function(d) {
              switch(id)
              {
                case "#fatalities":
                  if(data[d] == 0)
                    return d + ": No fatalities!";
                  else if(data[d] == 1)
                    return d + ": " + data[d] + " fatality" 
                  else
                    return d + ": " + data[d] + " fatalities"; 
                  break;
                case "#accidents":
                  if(data[d] == 0)
                    return d + ": No accidents!";
                  else if(data[d] == 1)
                    return d + ": " + data[d] + " accident" 
                  else
                    return d + ": " + data[d] + " accidents"; 
                  break;
                default:
                  break;
              }
            });
    }

    d3.selectAll('#accidents, #fatalities').on('click', function() {
      if($('#accidents').is(':checked')) 
        rectVisibility('#accidents', function(data, color){
          renderRectangle(data, color, "#accidents");
        });
      if($('#fatalities').is(':checked')) 
        rectVisibility('#fatalities', function(data, color){
          renderRectangle(data, color, "#fatalities");
        });
    }); 

  };

  // console.log(data_lookup);

  heatmapRadioActions();

  d3.selectAll('.day').on('click', function(d){

    // s = JSON.stringify(data_lookup[d])
    // d3.select('.cd-panel-content').html(s);
    ko.applyBindings({
      incidents: data_lookup[d]
    });
  });

  $("#slider").bind("valuesChanging", function(e, data){
    var minimumDate = data.values.min;
    var maximumDate = data.values.max;

    d3.selectAll('.day').filter(function(d){

      var currentDate = Date.parse(d);

      if(minimumDate <= currentDate && currentDate <= maximumDate){
        return d3.select(this).classed('q-invisible', false);
      }
      else
        return d3.select(this).classed('q-invisible', true);
    });
  });

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

  $('#weekday-dropdown.btn.dropdown-button').click(function(){
        $('ul#dropdown1').show(); 
        $('ul#dropdown1').css({'opacity': 1}); 
    });
  $('#month-dropdown.btn.dropdown-button').click(function(){
        $('ul#dropdown2').show(); 
        $('ul#dropdown2').css({'opacity': 1}); 
    });
  $('#accident-type-dropdown.btn.dropdown-button').click(function(){
        $('ul#dropdown3').show(); 
        $('ul#dropdown3').css({'opacity': 1}); 
    });

  $('ul#dropdown1 li a').click(function(e){
         $('#weekday-dropdown.btn.dropdown-button span').text($(this).text());
         $('ul#dropdown1').hide();
         $('ul#dropdown1').css({'opacity': 0}); 
  });
  $('ul#dropdown2 li a').click(function(e){
         $('#month-dropdown.btn.dropdown-button span').text($(this).text());
         $('ul#dropdown2').hide();
         $('ul#dropdown2').css({'opacity': 0}); 
  });
  
  // $('ul#dropdown3 li a').click(function(e){
  //        $('#accident-type-dropdown.btn.dropdown-button span').text($(this).text());
  //        $('ul#dropdown3').hide();
  //        $('ul#dropdown3').css({'opacity': 0}); 
  // });

})();
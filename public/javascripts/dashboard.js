var barChartModule = barChartModule || {};
var mapViewModule = mapViewModule || {};
var collapsibleTreeModule = collapsibleTreeModule || {};

data_range = data_range.split(',');

(function(global) {
  // "use strict";

  barChartModule.create();

  // var ssc = global.ssc;   
  //   if (!ssc) {
  //       ssc = {};
  //       global.ssc = ssc;
  //   }

  // var barChartModule = ssc.barChartModule;
  // var mapViewModule = ssc.mapViewModule;

  //  Initialize scale 
  var MAX_FATALITIES = 37;
  var MAX_ACCIDENTS = 44;

  var data_lookup = {};
  var accident_data;
  var fatality_data;
  var fatality_data_array = [];
  var accident_data_array = [];
  var csv_data;

  var width = 750,
    height = 100,
    // cellSize = 17; // cell size
    cellSize = 13;

  var day = d3.time.format("%w"),
    week = d3.time.format("%U"),
    format = d3.time.format("%Y-%m-%d");

  var parseDate = d3.time.format("%Y-%m-%d").parse;

  var fatality_color = d3.scale.quantile()
    .domain([1, MAX_FATALITIES])
    .range(d3.range(1, 8).map(function(d) {
      return "q-color" + d + "-10";
    }));

  // console.log(fatality_color(30));
  //  Map input domain to discrete range.

  var accident_color = d3.scale.quantile()
    .domain([1, MAX_ACCIDENTS])
    .range(d3.range(1, 8).map(function(d) {
      return "q-color" + d + "-10";
    }));

  //  append heatmap
  var svg = d3.select("#heatmap-panel").selectAll("svg")
    .data(d3.range(parseInt(data_range[0]), parseInt(data_range[1]) + 1))
    .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "RdYlGn")
    .append("g")
    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

  svg.append("text")
    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text(function(d) {
      return d;
    });

  var x = d3.time.scale().range([0, 1200]),
    x2 = d3.time.scale().range([0, 1200]),
    y = d3.scale.linear().range([50, 0]),
    y2 = d3.scale.linear().range([50, 0]);

  var xAxis = d3.svg.axis().scale(x).orient("bottom"),
    xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).orient("left");

  var area2 = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) {
      return x2(d.date);
    })
    .y0(50)
    .y1(function(d) {
      return y2(d.count);
    });

  var brush = d3.svg.brush()
    .x(x2)
    .on("brushstart", brushedstart)
    .on("brush", brushed)
    .on("brushend", brushedend);

  // Establish the context for selecting a particular timeline of data
  var context = d3.select("#context-slider").append("svg").style("width", 1280).style("height", 70).style("margin-left", 30)
    .append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + 0 + "," + 0 + ")");

  var rect = svg.selectAll(".day")
    .data(function(d) {
      return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
    })
    .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) {
      return week(d) * cellSize;
    })
    .attr("y", function(d) {
      return day(d) * cellSize;
    })
    .datum(format);

  rect.append("title")
    .text(function(d) {
      return d;
    });

  svg.selectAll(".month")
    .data(function(d) {
      return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
    })
    .enter().append("path")
    .attr("class", "month")
    .attr("d", monthPath);

  d3.csv(csv_path, function(error, csv) {

    csv_data = csv;

    csv_data.forEach(function(d) {
      if (d.date in data_lookup)
        data_lookup[d.date].push(d);
      else
        data_lookup[d.date] = [];
    });

    csv_data.sort(sortByDateAscending);

    function sortByDateAscending(a, b) {
      // Dates will be cast to numbers automagically:
      return parseDate(a.date) - parseDate(b.date);
    }

    fatality_data = d3.nest()
      .key(function(d) {
        return d.date;
      })
      .rollup(function(d) {
        var fatality_object = {
          date: null,
          count: null
        };

        fatality_object.date = parseDate(d[0].date);

        //  Count of fatalities...
        fatality_sum = d3.sum(d, function(g, i) {
          if (g.fatalities !== null) {
            fatalities = parseInt(g.fatalities);
          } else {
            fatalities = 0;
          }

          return fatalities;
        });

        fatality_object.count = fatality_sum;
        fatality_data_array.push(fatality_object);
        // console.log(fatality_object);

        return fatality_sum;
      }).map(csv_data);

    accident_data = d3.nest()
      .key(function(d) {
        return d.date;
      })
      .rollup(function(d) {
        var accident_object = {
          date: null,
          count: null
        };

        accident_object.date = parseDate(d[0].date);
        accident_object.count = d.length;
        accident_data_array.push(accident_object);
        // console.log(accident_object);
        return accident_object.count;
      }).map(csv_data);

      //  Just checking the distribution of weather
      weather_data = d3.nest()
      .key(function(d) {
        return d.weather;
      })
      .rollup(function(d) {
        // var accident_object = {
        //   date: null,
        //   count: null
        // };

        // accident_object.date = parseDate(d[0].date);
        // accident_object.count = d.length;
        // accident_data_array.push(accident_object);
        // console.log(accident_object);
        return d.length;
      }).map(csv_data);

    // console.log(weather_data);

    category_data = d3.nest().key(function(d) {
      return d.primary_cause;
    }).rollup(function(d) {
      return d.length;
    }).map(csv_data);

    x.domain(d3.extent(fatality_data_array.map(function(d) {
      return d.date;
    })));
    y.domain([0, d3.max(fatality_data_array.map(function(d) {
      return d.count;
    }))]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    //  Initialize the view.
    rect.filter(function(d) {
        return d in fatality_data;
      })
      .attr("class", function(d) {
        return (fatality_data[d] === 0) ? "month-" + d.substring(5, 7) + " day q-color0-10" : "month-" + d.substring(5, 7) + " day " + fatality_color(fatality_data[d]);
      })
      .select("title")
      .text(function(d) {
        if (fatality_data[d] == 0)
          return d + ": No fatalities!";
        else if (fatality_data[d] == 1)
          return d + ": " + fatality_data[d] + " fatality"
        else
          return d + ": " + fatality_data[d] + " fatalities";
      });

    context.append("path")
      .datum(fatality_data_array)
      .attr("class", "area")
      .attr("transform", "translate(0," + 0 + ")")
      .attr("d", area2);

    context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + 50 + ")")
      .call(xAxis2);

    context.append("g")
      .attr("class", "x brush")
      .call(brush)
      .selectAll("rect")
      .attr("y", -6)
      .attr("height", 56);

    //  Must translate text to make more readable
    d3.selectAll('g.context g.tick text').attr('transform', 'translate(9,0)');

    collapsibleTreeModule.create(csv_data);

  });

  function monthPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = +day(t0),
      w0 = +week(t0),
      d1 = +day(t1),
      w1 = +week(t1);
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize + "H" + w0 * cellSize + "V" + 7 * cellSize + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize + "H" + (w1 + 1) * cellSize + "V" + 0 + "H" + (w0 + 1) * cellSize + "Z";
  }

  d3.select(self.frameElement).style("height", "2910px");

  var heatmapRadioActions = function() {
    function rectVisibility(id, callback) {
      var data;
      switch (id) {
        case "#fatalities":
          // console.log("inside case fatalities");
          data = fatality_data;
          color = fatality_color;
          break;
        case "#accidents":
          // console.log("inside case accidents");
          data = accident_data;
          color = accident_color;
          break;
        default:
          break;
      }

      callback(data, color);
    }

    function renderRectangle(data, color, id) {
      // console.log("inside default");
      rect.filter(function(d) {
          return d in data;
        })
        .attr("class", function(d) {
          return (data[d] === 0) ? "month-" + d.substring(5, 7) + " day q-color0-10" : "month-" + d.substring(5, 7) + " day " + color(data[d]);
        })
        .select("title")
        .text(function(d) {
          switch (id) {
            case "#fatalities":
              if (data[d] == 0)
                return d + ": No fatalities!";
              else if (data[d] == 1)
                return d + ": " + data[d] + " fatality"
              else
                return d + ": " + data[d] + " fatalities";
              break;
            case "#accidents":
              if (data[d] == 0)
                return d + ": No accidents!";
              else if (data[d] == 1)
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
      if ($('#accidents').is(':checked'))
      {
        rectVisibility('#accidents', function(data, color) {
          renderRectangle(data, color, "#accidents");

          x.domain(d3.extent(accident_data_array.map(function(d) {
            return d.date;
          })));
          y.domain([0, d3.max(accident_data_array.map(function(d) {
            return d.count;
          }))]);
          x2.domain(x.domain());
          y2.domain(y.domain());

          context = d3.selectAll('g.context path.area')
            .datum(accident_data_array)
            .transition()
            .duration(1000)
            .attr("d", area2);

            // context.append("g")
            // .attr("class", "x axis")
            // .attr("transform", "translate(0," + 50 + ")")
            // .call(xAxis2);

        });
        if(d3.select("#side-view").select("svg").attr("class") == "fatalities-mapview")
        {
          d3.select("#side-view").select("svg").remove();
          mapViewModule.create(csv_data, "accidents");
        }
      }
      if ($('#fatalities').is(':checked'))
      {
        rectVisibility('#fatalities', function(data, color) {
          renderRectangle(data, color, "#fatalities");

          x.domain(d3.extent(fatality_data_array.map(function(d) {
            return d.date;
          })));
          y.domain([0, d3.max(fatality_data_array.map(function(d) {
            return d.count;
          }))]);
          x2.domain(x.domain());
          y2.domain(y.domain());

          context = d3.selectAll('g.context path.area')
            .datum(fatality_data_array)
            .transition()
            .duration(1000)
            .attr("d", area2);

          // context.append("g")
          //   .attr("class", "x axis")
          //   .attr("transform", "translate(0," + 50 + ")")
          //   .call(xAxis2);

        });
        if(d3.select("#side-view").select("svg").attr("class") == "accidents-mapview")
        {
          d3.select("#side-view").select("svg").remove();
          mapViewModule.create(csv_data, "fatalities");
        }
      }
    });

  };

  // console.log(data_lookup);

  heatmapRadioActions();

  d3.selectAll('.day').on('click', function(d) {
    // d3.select("#side-view").select("svg").remove();
    // d3.selectAll("#dropdown3 li").remove();
    // console.log(d);
    // minimumDate = d;
    // maximumDate = d;

    // if ($('#bargraph-view').is(':checked'))
    //     barChartModule.create(minimumDate, maximumDate);
    // if ($('#mapview-view').is(':checked'))
    // {
    //   if($('#accidents').is(':checked'))
    //     mapViewModule.create(csv_data, "accidents", minimumDate, maximumDate)
    //   if($('#fatalities').is(':checked'))
    //     mapViewModule.create(csv_data, "fatalities", minimumDate, maximumDate)
    // }


    s = JSON.stringify(data_lookup[d]);
    // console.log(data_lookup[d]);
    // d3.select('.cd-panel-content').html(s);
    // ko.applyBindings({
    //   incidents: data_lookup[d]
    // });
    d3.select('.cd-panel-content svg').remove();
    collapsibleTreeModule.create(data_lookup[d]);
  });

  // $("#slider").bind("valuesChanging", function(e, data){
  //   var minimumDate = data.values.min;
  //   var maximumDate = data.values.max;

  //   d3.selectAll('.day').filter(function(d){

  //     var currentDate = Date.parse(d);

  //     if(minimumDate <= currentDate && currentDate <= maximumDate){
  //       return d3.select(this).classed('q-invisible', false);
  //     }
  //     else
  //       return d3.select(this).classed('q-invisible', true);
  //   });
  // });

  d3.selectAll('#bargraph-view, #mapview-view').on('click', function() {
    // console.log("Inside");
    if ($('#bargraph-view').is(':checked'))
    {
      // console.log("Bargraph");
      d3.select("#side-view").select("svg").remove();
      d3.selectAll("#dropdown3 li").remove();
      barChartModule.create();
    }
    if ($('#mapview-view').is(':checked'))
    {
      // console.log("Mapview");
      d3.select("#side-view").select("svg").remove();
      if($('#fatalities').is(':checked'))
        mapViewModule.create(csv_data, "fatalities");
      if($('#accidents').is(':checked'))
        mapViewModule.create(csv_data, "accidents");
    }
  });

  // d3.selectAll('rect.day').on('mouseover', function() {
  //   d3.select(this).style('stroke', 'black');
  // }).on('mouseoff', function(){
  //   d3.select(this).style('stroke', '#ccc');
  // });



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

  $('#weekday-dropdown.btn.dropdown-button').click(function() {
    $('ul#dropdown1').show();
    $('ul#dropdown1').css({
      'opacity': 1
    });
  });
  $('#month-dropdown.btn.dropdown-button').click(function() {
    $('ul#dropdown2').show();
    $('ul#dropdown2').css({
      'opacity': 1
    });
  });
  $('#accident-type-dropdown.btn.dropdown-button').click(function() {
    $('ul#dropdown3').show();
    $('ul#dropdown3').css({
      'opacity': 1
    });
  });

  $('ul#dropdown1 li a').click(function(e) {
    $('#weekday-dropdown.btn.dropdown-button span').text($(this).text());
    $('ul#dropdown1').hide();
    $('ul#dropdown1').css({
      'opacity': 0
    });
  });
  $('ul#dropdown2 li a').click(function(e) {
    $('#month-dropdown.btn.dropdown-button span').text($(this).text());
    $('ul#dropdown2').hide();
    $('ul#dropdown2').css({
      'opacity': 0
    });
  });

  //  Note:
  //    - Sunday: y = 0
  //    - Monday: y = 13
  //    - Tuesday: y = 26
  //    - Wednesday: y = 39
  //    - Thursday: y = 52
  //    - Friday: y = 65
  //    - Saturday: y = 78

  $(document).mouseup(function (e)
    {
      var container = $("#dropdown1");

      if (!container.is(e.target) // if the target of the click isn't the container...
          && container.has(e.target).length === 0) // ... nor a descendant of the container
      {
          container.hide();
      }
    });

  $(document).mouseup(function (e)
    {
      var container = $("#dropdown2");

      if (!container.is(e.target) // if the target of the click isn't the container...
          && container.has(e.target).length === 0) // ... nor a descendant of the container
      {
          container.hide();
      }
    });

  $('ul#dropdown1 li').click(function() {

    switch ($(this).text()) {
      case 'Weekday':
        d3.selectAll('rect.day').style('opacity', 1);
        break;
      case 'Sunday':
        d3.selectAll('rect.day').style('opacity', function(d) {
          // console.log(d3.select(this).attr('y'));
          if (d3.select(this).attr('y') == 0) {
            // console.log(d3.select(this)[0][0].__data__)
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      case 'Monday':
        d3.selectAll('rect.day').style('opacity', function(d) {
          if (d3.select(this).attr('y') == 13) {
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      case 'Tuesday':
        d3.selectAll('rect.day').style('opacity', function(d) {
          if (d3.select(this).attr('y') == 26) {
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      case 'Wednesday':
        d3.selectAll('rect.day').style('opacity', function(d) {
          if (d3.select(this).attr('y') == 39) {
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      case 'Thursday':
        d3.selectAll('rect.day').style('opacity', function(d) {
          if (d3.select(this).attr('y') == 52) {
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      case 'Friday':
        d3.selectAll('rect.day').style('opacity', function(d) {
          if (d3.select(this).attr('y') == 65) {
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      case 'Saturday':
        d3.selectAll('rect.day').style('opacity', function(d) {
          if (d3.select(this).attr('y') == 78) {
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      default:
        break;
    };

  });

function brushedstart() {
    d3.select('.cd-panel-content svg').remove();
    d3.select("#side-view").select("svg").remove();
    d3.select('#side-view').insert('div', ':first-child').classed('preloader-wrapper', true).classed('big', true).classed('active', true)
                                .style('position', 'relative').style('left', '45%').style('margin-top','180px')
                                .append('div').classed('spinner-layer', true).classed('spinner-blue-only', true)
                                .style('border-color', '#A00F00')
                                .append('div').classed('circle-clipper', true).classed('left', true)
                                .append('div').classed('circle', true).style('border-width', '10px');
  }

  function brushed() {
    // focus.select(".area").attr("d", area);
    // focus.select(".x.axis").call(xAxis);
      

    if (!brush.empty()) {
      minimumDate = brush.extent()[0];
      maximumDate = brush.extent()[1];


      d3.selectAll('.day').filter(function(d) {

        var currentDate = Date.parse(d);

        if (minimumDate <= currentDate && currentDate <= maximumDate) {
          // return d3.select(this).classed('q-invisible', false);
          return d3.select(this).style('opacity', 1);
        } else
          // return d3.select(this).classed('q-invisible', true);
          return d3.select(this).style('opacity', 0.1);
      });

    } else {
      // d3.selectAll('.day').classed('q-invisible', false);
      // brushedend();
      return d3.selectAll('.day').style('opacity', 1);
    }

  }

  function brushedend() {
    d3.select('#side-view div.preloader-wrapper.active').remove();
    if(!brush.empty()) {
      minimumDate = brush.extent()[0];
      maximumDate = brush.extent()[1];
      if ($('#bargraph-view').is(':checked'))
        barChartModule.create(minimumDate, maximumDate);
      if ($('#mapview-view').is(':checked'))
      {
        if($('#accidents').is(':checked'))
          mapViewModule.create(csv_data, "accidents", minimumDate, maximumDate)
        if($('#fatalities').is(':checked'))
          mapViewModule.create(csv_data, "fatalities", minimumDate, maximumDate)
      }
      collapsibleTreeModule.create(csv_data.filter(function(d){
        var currentDate = Date.parse(d.date);

          if (minimumDate <= currentDate && currentDate <= maximumDate) {
            return d;
          }
      }));
      
    }
    else{
      if($('#bargraph-view').is(':checked'))
        barChartModule.create();
      else
      {
        if($('#accidents').is(':checked'))
          mapViewModule.create(csv_data, "accidents");
        if($('#fatalities').is(':checked'))
          mapViewModule.create(csv_data, "fatalities");
      }
    }
  }

  

  //  Need to implement a cumulative number...
  $('ul#dropdown2 li').click(function() {

    switch ($(this).text()) {
      case 'Month':
        d3.selectAll('rect.day').style('opacity', 1);
        break;
      case 'January':
        d3.selectAll('rect.day').style('opacity', function(d) {
          if (d3.select(this).classed('month-01')) {
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      case 'February':
        d3.selectAll('rect.day').style('opacity', function(d) {
          if (d3.select(this).classed('month-02')) {
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      case 'March':
        d3.selectAll('rect.day').style('opacity', function(d) {
          if (d3.select(this).classed('month-03')) {
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      case 'April':
        d3.selectAll('rect.day').style('opacity', function(d) {
          if (d3.select(this).classed('month-04')) {
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      case 'May':
        d3.selectAll('rect.day').style('opacity', function(d) {
          if (d3.select(this).classed('month-05')) {
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      case 'June':
        d3.selectAll('rect.day').style('opacity', function(d) {
          if (d3.select(this).classed('month-06')) {
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      case 'July':
        d3.selectAll('rect.day').style('opacity', function(d) {
          if (d3.select(this).classed('month-07')) {
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      case 'August':
        d3.selectAll('rect.day').style('opacity', function(d) {
          if (d3.select(this).classed('month-08')) {
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      case 'September':
        d3.selectAll('rect.day').style('opacity', function(d) {
          if (d3.select(this).classed('month-09')) {
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      case 'October':
        d3.selectAll('rect.day').style('opacity', function(d) {
          if (d3.select(this).classed('month-10')) {
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      case 'November':
        d3.selectAll('rect.day').style('opacity', function(d) {
          if (d3.select(this).classed('month-11')) {
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      case 'December':
        d3.selectAll('rect.day').style('opacity', function(d) {
          if (d3.select(this).classed('month-12')) {
            return 1;
          } else {
            return 0.1;
          }
        });
        break;
      default:
        break;
    };

  });


})(this);
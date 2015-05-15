var collapsibleTreeModule = (function(){
  "use strict";

  var collapsibleTree = {};

  collapsibleTree.create = function(data){
    // console.log(data);
    var date_range;
    var remarks_hash = {};

    if(data[data.length - 1].date != data[0].date)
      date_range = data[0].date + " to " + data[data.length - 1].date; 
    else
      date_range = data[0].date

    var flare_obj = {name: "List of events that occurred on: " + date_range, children:[], class: "parent"};   

      var overall_primary = d3.nest().key(function(d){return d.primary_cause;}).rollup(function(d){return d}).entries(data).filter(function(d, index)
        { if(d.key == "null"){d.key = "Unknown Cause"} flare_obj.children.push({name: d.key + ": " + d.values.length, children:[], class:"parent"});  for(var i = 0; i < d.values.length; i++)
        { d.values[i].name = "Event: " + i;  flare_obj.children[index].children.push({name: d.values[i].name, children:[], class: "parent"});

        for(var property in d.values[i])
         {
          var truncated_text;
          var property_modified;
          if(property !== "name")
          {
            if(d.values[i][property] == null || d.values[i][property] == "null")
              d.values[i][property] = "Unknown";

            switch(property)
            {
              case 'date':
                property_modified = 'Date';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'state':
                property_modified = 'State';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'city':
                property_modified = 'City';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'weather':
                property_modified = 'Weather';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'light':
                property_modified = 'Light Condition';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'visibility':
                property_modified = 'Visibility (in Miles)';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'fatalities':
                property_modified = 'Fatalities';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'primary_cause':
                property_modified = 'Primary Cause';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'type':
                property_modified = 'Type of Accident';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'pilot_age':
                property_modified = 'Pilot Age (in Years)';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'total_hours_model_flown':
                property_modified = 'Total Number of Hours Flown Given Model';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'hours_model_flown_90_days':
                property_modified = 'Total Number of Hours Flown Given Model (Past 90 Days)';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'hours_flown_90_days':
                property_modified = 'Total Number of Hours Flown (Past 90 Days)';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'total_hours_flown':
                property_modified = 'Total Number of Hours Flown';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'pilot_certification':
                property_modified = 'Pilot Certification';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'engines':
                property_modified = 'Total Number of Engines';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'aircraft_make':
                property_modified = 'Aircraft Make';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'aircraft_model':
                property_modified = 'Aircraft Model';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'hours_airframe':
                property_modified = 'Total Airframe Hours';
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i][property], class: "child"});
                break;
              case 'remarks':
                property_modified = 'Remarks';
                truncated_text = d.values[i][property].substring(0, 48) + "...";
                remarks_hash[truncated_text] = {date: d.values[i].date, primary_cause: d.key, event_number: i, text: d.values[i][property]};
                (d.values[i][property].length > 47) ? d.values[i]['modified_remarks'] = truncated_text : d.values[i]['modified_remarks'] = d.values[i][property];
                flare_obj.children[index].children[i].children.push({name: property_modified + ": " + d.values[i]['modified_remarks'], class: "child"});
                break;
              default: 
                break;
            }
            // console.log(property);
            
            // console.log(property);

          }
         } 
         } });

      //my crud
      var marginFlare = {top: 30, right: 20, bottom: 30, left: 20},
          widthFlare = 500 - marginFlare.left - marginFlare.right,
          barHeightFlare = 20,
          barWidthFlare = widthFlare * .8;

      var i = 0,
          duration = 400,
          root;

      var treeFlare = d3.layout.tree()
          .nodeSize([0, 20]);

      var diagonalFlare = d3.svg.diagonal()
          .projection(function(d) { return [d.y, d.x]; });

      var svgFlare = d3.select('.cd-panel-content').append("svg")
          .attr("id", "flare-tree")
          .attr("width", widthFlare + marginFlare.left + marginFlare.right)
        .append("g")
          .attr("transform", "translate(" + marginFlare.left + "," + marginFlare.top + ")");

      function moveChildren(node) {
      if(node.children) {
          node.children.forEach(function(c) { moveChildren(c); });
          node._children = node.children;
          node.children = null;
      }
      }

      var initialFlare = function(flare){
        flare.x0 = 0;
        flare.y0 = 0;
        moveChildren(flare);
        update(root = flare);
      }

      initialFlare(flare_obj);

      // d3.json(data_lookup[d], function(error, flare) {
      //   flare.x0 = 0;
      //   flare.y0 = 0;
      //   update(root = flare);
      // });

      function update(source) {
        // console.log("Source");
        // console.log(root);
        // Compute the flattened node list. TODO use d3.layout.hierarchy.
        var nodes = treeFlare.nodes(root);

        // console.log(nodes);

        var heightFlare = Math.max(500, nodes.length * barHeightFlare + marginFlare.top + marginFlare.bottom);

        d3.select("#flare-tree").transition()
            .duration(duration)
            .attr("height", heightFlare);

        d3.select(self.frameElement).transition()
            .duration(duration)
            .style("height", heightFlare + "px");

        // Compute the "layout".
        nodes.forEach(function(n, i) {
          n.x = i * barHeightFlare;
        });

        // Update the nodes…
        var node = svgFlare.selectAll("g.node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); });

        var nodeEnter = node.enter().append("g")
            .attr("class", function(d){return d.class + " node";})
            .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
            .style("opacity", 1e-6);


        // Enter any new nodes at the parent's previous position.
        nodeEnter.append("rect")
            .attr("y", -barHeightFlare / 2)
            .attr("height", barHeightFlare)
            .attr("width", barWidthFlare)
            .style("fill", color)
            .on("click", click)
            .on("mouseover", hoverRect);

        nodeEnter.append("text")
            .attr("dy", 3.5)
            .attr("dx", 5.5)
            .text(function(d) { return d.name; });

        // Transition nodes to their new position.
        nodeEnter.transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
            .style("opacity", 1);

        node.select('text') 
          .text(function(d) { 
            if (d.children) {
              return '- ' + d.name;
            } else if (d._children) {
              return '+ ' + d.name;
            } else {
              return d.name;
            }
          });

        node.transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
            .style("opacity", 1)
          .select("rect")
            .style("fill", color);



        // Transition exiting nodes to the parent's new position.
        node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
            .style("opacity", 1e-6)
            .remove();

        // Update the links…
        var link = svgFlare.selectAll("path.link")
            .data(treeFlare.links(nodes), function(d) { return d.target.id; });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
              var o = {x: source.x0, y: source.y0};
              return diagonalFlare({source: o, target: o});
            })
          .transition()
            .duration(duration)
            .attr("d", diagonalFlare);

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonalFlare);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
              var o = {x: source.x, y: source.y};
              return diagonalFlare({source: o, target: o});
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
          d.x0 = d.x;
          d.y0 = d.y;
        });
      }


      // Toggle children on click.
      function click(d) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d);
      }

      function color(d) {
        // return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#E3EDF7";
                return d._children ? "#b7b7b7" : d.children ? "whitesmoke" : "whitesmoke";

        // return d._children ? "#FEE0D2" : d.children ? "#FEE0D2" : "#FEE0D2";


      }



      // console.log(remarks_hash);

      function hoverRect(d) {
        if(d.name.indexOf("Remarks") >= 0)
          // d3.select('#remarks-box').html("<div>Date: " + remarks_hash[d.name.substring(9)].date 
          //   + "</div><div>Primary Cause: " + remarks_hash[d.name.substring(9)].primary_cause 
          //   +  "</div><div>Event Number: " + remarks_hash[d.name.substring(9)].event_number 
          //   +  "</div><div>Remarks: " + remarks_hash[d.name.substring(9)].text + "</div>");
          d3.select('#remarks-box').html("<h5>Full Remarks: </h5>" + "<div>" + remarks_hash[d.name.substring(9)].text + "</div>");
      }

    };

    collapsibleTree.update = function(){

    };

    return collapsibleTree;
})();    
    
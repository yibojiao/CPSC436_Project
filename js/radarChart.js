class RadarChart{
  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.width,
      containerHeight: _config.height,
      select: _config.select,
    }
    this.margin = {top: 50, right: 50, bottom: 50, left: 50},
    this.data = _data;
    this.selection = this.config.select;
    this.initVis();
  }

  initVis() {
    let vis = this;

    // areas
    vis.width = vis.config.containerWidth-vis.margin.left-vis.margin.right;
    vis.height = vis.config.containerHeight-vis.margin.top-vis.margin.bottom;
    vis.svg = d3.select(vis.config.parentElement)
        .append('svg').attr('class', 'chart')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight+100)
    vis.g = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.containerWidth/2}, ${vis.config.containerHeight/2+95})`);
    vis.radiusScale = d3.scaleLinear()
      .range([0, vis.height/2])
      .domain([0, 1]);
    vis.colorScale = d3.scaleOrdinal()
      .domain(['Farm','Land use change','Transport','Retail','Packging', 'Animal feed', 'Processing'])
      .range(["#e1874b","#3e95c2","#d86860","#446276","#bebada","#b4de68", "#fccde5"]);
    vis.colorScale2 = d3.scaleOrdinal()
      .domain(['farm','land_use_change','transport','retail','packging', 'animal_feed', 'processing'])
      .range(["#e1874b","#3e95c2","#d86860","#446276","#bebada","#b4de68", "#fccde5"]);

    // defs
    vis.glow = vis.g.append('defs').append('filter').attr('id','glow'),
    vis.glow.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur').append('feMerge')
    vis.feMerge = vis.glow.append('feMerge'),
    vis.feMerge.append('feMergeNode').attr('in','coloredBlur'),
    vis.feMerge.append('feMergeNode').attr('in','SourceGraphic');
    // defs
    var defs = vis.svg.append('defs');
    vis.drawIcon = function(name) {
      defs.append('pattern').attr('id', name).attr('height', '100%').attr('width', '100%')
        .attr('patternContentUnits', 'objectBoundingBox').append('image').attr('height', 1)
        .attr('width', 1).attr('preserveAspectRatio', 'none').attr('xlink:href', `icon/${name}.png`)
      return `url(#${name})`;
    }

    // axis grid
    vis.axisGrid = vis.g.append("g").attr("class", "axisWrapper");
    vis.axisGrid.selectAll(".levels")
	    .data(d3.range(1,6).reverse())
	    .enter()
      .append("circle")
      .attr("class", "gridCircle")
      .attr("r", function(d, i){return vis.height/2/5*d;})
      .style("fill", "#CDCDCD")
      .style("stroke", '#999999')
      .style("fill-opacity", 0.1)
      .style("filter" , "url(#glow)");
    vis.axisGrid.selectAll(".axisLabel")
      .data(d3.range(1,6).reverse())
      .enter().append("text")
      .attr("class", "axisLabel")
      .attr("x", 4)
      .attr("dy", "0.35em")
      .attr("y", function(d){return -d*vis.height/2/5;})
      .style("font-size", "10px")
      .attr("fill", "#999999")
      .text(function(d) { return d/5*100+'%' });

    // axis
    vis.axis = vis.axisGrid.selectAll(".axis")
      .data(['Farm','Land use change','Transport','Retail','Packging', 'Animal feed', 'Processing'])
      .enter()
      .append("g")
      .attr("class", "axis");
    vis.axis.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", function(d, i){ return vis.radiusScale(1) * Math.cos(Math.PI*2/7*i - Math.PI/2); })
      .attr("y2", function(d, i){ return vis.radiusScale(1) * Math.sin(Math.PI*2/7*i - Math.PI/2); })
      .attr("class", "line")
      .style("stroke", d => vis.colorScale(d))
      .attr('opacity', 0.8)
      .style("stroke-width", "2px");
    // text
    vis.g.append('text').text('Percentile Visualization')
    .attr('font-size', '30px')
    .attr('font-family', 'Marker Felt')
    .attr('transform', `translate(${-vis.config.containerWidth/2+10}, ${-vis.config.containerHeight+90})`);
    vis.g.append('text').text('The radar chart encode CO2 emission')
    .attr('fill', '#5a5a5a').attr('font-size', '15px')
    .attr('transform', `translate(${-vis.config.containerWidth/2+10}, ${-vis.config.containerHeight+120})`);
    vis.g.append('text').text('of the selected food at each stage. The')
    .attr('fill', '#5a5a5a').attr('font-size', '15px')
    .attr('transform', `translate(${-vis.config.containerWidth/2+10}, ${-vis.config.containerHeight+140})`);
    vis.g.append('text').text('percentile of emission value is shown')
    .attr('fill', '#5a5a5a').attr('font-size', '15px')
    .attr('transform', `translate(${-vis.config.containerWidth/2+10}, ${-vis.config.containerHeight+160})`);
  }

  updateVis() {
    let vis = this;
    vis.intermediate_result = [];
    const percentile = (arr, val) => (arr.reduce((acc, v) => acc + (v < val ? 1 : 0) + (v === val ? 0.5 : 0),0)) /arr.length;
    function generateInter(d) {
      let res = [
        {axis:'farm', value:percentile(vis.data.map(d => d.farm), d.farm)},
        {axis:'land_use_change', value:percentile(vis.data.map(d => d.land_use_change), d.land_use_change)},
        {axis:'transport', value:percentile(vis.data.map(d => d.transport), d.transport)},
        {axis:'retail', value:percentile(vis.data.map(d => d.retail), d.retail)},
        {axis:'packging', value:percentile(vis.data.map(d => d.packging), d.packging)},
        {axis:'animal_feed', value:percentile(vis.data.map(d => d.animal_feed), d.animal_feed)},
        {axis:'processing', value:percentile(vis.data.map(d => d.processing), d.processing)},
      ];
      return res;
    }
    vis.target = vis.data.filter(d=>d.name==vis.selection)[0];
    if(vis.selection) {
      vis.intermediate_result.push(generateInter(vis.target));
    }
    vis.renderVis();
  }

  renderVis() {
    let vis = this;
    d3.selectAll('.radarWrapper').remove();
    d3.selectAll('.iconindicator').remove();
    if(vis.selection) {
      vis.g.append('circle').attr('class', 'iconindicator')
        .attr('transform', `translate(${vis.config.containerWidth/2-45}, ${-vis.config.containerHeight+200})`)
        .transition()
        .duration(500)
        .attr('r', 40).attr('fill', d => vis.drawIcon(vis.target.id))
      var radarLine = d3.lineRadial()
        .radius(d => vis.radiusScale(d.value))
        .angle((d,i) => i*Math.PI*2/7)
        .curve(d3.curveCardinalClosed);
      vis.blobWrapper = vis.g.selectAll(".radarWrapper")
        .data(vis.intermediate_result)
        .enter().append("g")
        .attr("class", "radarWrapper");
      vis.blobWrapper
        .append("path")
        .attr("class", "radarArea")
        .attr("d", function(d,i) { return radarLine(d); })
        .attr("fill", 'white')
        .style("fill-opacity", 0.3)
        .on('mouseover', function (){
          d3.select(this)
            .style("fill-opacity", 0.7);	
        })
        .on('mouseout', function(){
          d3.selectAll(".radarArea")
            .style("fill-opacity", 0.3);
        });
      vis.blobWrapper.append("path")
        .attr("class", "radarStroke")
        .attr("d", function(d,i) { return radarLine(d); })
        .attr("stroke-width", '3px')
        .attr("stroke", 'white')
        .attr("fill", 'none')
        .attr("filter" , "url(#glow)");

      vis.blobWrapper.selectAll(".radarCircle")
        .data(function(d,i) { return d; })
        .enter().append("circle")
        .attr("class", "radarCircle")
        .attr("r", 4)
        .attr("cx", function(d,i){ return vis.radiusScale(d.value) * Math.cos(Math.PI*2/7*i - Math.PI/2); })
        .attr("cy", function(d,i){ return vis.radiusScale(d.value) * Math.sin(Math.PI*2/7*i - Math.PI/2); })
        .style("fill", d => {return vis.colorScale2(d.axis)})
        .style("fill-opacity", 0.9);
    }
  }
}
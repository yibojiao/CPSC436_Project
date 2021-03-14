class BubbleChart {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _dispatcher, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 815,
      containerHeight: 650,
    }
    this.selected = null;
    this.dispatcher = _dispatcher;
    this.data = _data;
    this.initVis();
  }
  
  /**
   * Create scales, axes, and append static elements
   */
  initVis() {
    let vis = this;

    // areas
    vis.width = vis.config.containerWidth;
    vis.height = vis.config.containerHeight;
    vis.center = {x: 312, y: 312};
    vis.svg = d3.select(vis.config.parentElement)
        .append('svg').attr('class', 'chart')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight)
        .append('g')
        .attr('transform', `translate(${vis.center.x}, ${vis.center.y})`);

    // scales
    vis.radiusScale = d3.scalePow().exponent(0.5).range([15, 95])
      .domain([d3.min(vis.data, d => d.total_emissions), d3.max(vis.data, d => d.total_emissions)]);
    vis.colorScale = d3.scaleOrdinal()
      .domain(['Farm','Land use change','Transport','Retail','Packging', 'Animal feed', 'Processing'])
      .range(["#e1874b","#3e95c2","#d86860","#446276","#bebada","#b4de68", "#fccde5"]);
    // simulation
    vis.sim = d3.forceSimulation()
        .force('x', d3.forceX(0).strength(0.0001))
        .force('y', d3.forceY(0).strength(0.0001))
        .force('collision', d3.forceCollide(d => vis.radiusScale(d.total_emissions)+1));

    // defs
    var defs = vis.svg.append('defs');
    vis.drawIcon = function(id) {
      defs.append('pattern').attr('id', id).attr('height', '100%').attr('width', '100%')
        .attr('patternContentUnits', 'objectBoundingBox').append('image').attr('height', 1)
        .attr('width', 1).attr('preserveAspectRatio', 'none').attr('xlink:href', `icon/${id}.png`)
      return `url(#${id})`;
    }

    // defs
    vis.glow = vis.svg.append('defs').append('filter').attr('id','glow'),
    vis.glow.append('feGaussianBlur').attr('stdDeviation','0.5').attr('result','coloredBlur').append('feMerge')
    vis.feMerge = vis.glow.append('feMerge'),
    vis.feMerge.append('feMergeNode').attr('in','coloredBlur'),
    vis.feMerge.append('feMergeNode').attr('in','SourceGraphic');

    // background circle
    vis.svg.append('circle').transition().duration(200).attr('r', 310)
      .attr('fill', 'none')
      .attr('stroke', '#999999')
      .attr('stroke-width', '3px');
    
    // color legend
    vis.legend_color = vis.svg
      .append('g').attr('class', 'legend')
      .attr('transform', `translate(${vis.height/2},${-vis.height/2+20} )`);
    vis.legend_color.append('text').text('Most Emission Stage')
      .attr('font-size', '20px').attr('alignment-baseline', 'central')
      .attr('font-family', 'Marker Felt').attr('transform', `translate(0, 10)`);
    const stages = ['farm','land_use_change','transport','retail','packging', 'animal_feed', 'processing'];
    const stages_names = ['Farm','Land use change','Transport','Retail','Packging', 'Animal feed', 'Processing'];
    for (let i=0; i < stages.length; i++) {
      vis.legend_color.append('rect').attr('width', 15).attr('height', 15)
        .attr('fill', vis.colorScale(stages[i]))
        .attr('opacity', 0.6)
        .attr('transform', `translate(0, ${20+i*20})`)

      vis.legend_color.append('text').text(stages_names[i])
        .attr('transform', `translate(18, ${27+i*20})`)
        .attr('fill', '#5a5a5a').attr('font-size', '13px').attr('alignment-baseline', 'central')
    }

    // size legend
    vis.legend_size = vis.svg
      .append('g').attr('class', 'legend').attr('transform', `translate(${vis.center.x}, ${vis.center.y-200})`);
    vis.legend_size.append('text').text('Total Emission (kg)')
      .attr('font-size', '20px').attr('alignment-baseline', 'central')
      .attr('font-family', 'Marker Felt').attr('transform', `translate(0, 10)`);
    vis.legend_size.append('circle')
      .attr('r', vis.radiusScale(30))
      .attr('fill', 'none')
      .attr('stroke', '#999999')
      .attr('stroke-width', '3px')
      .attr('transform', `translate(${vis.radiusScale(30)-10}, ${vis.radiusScale(30)+35})`)
    vis.legend_size.append('circle')
      .attr('r', vis.radiusScale(10))
      .attr('fill', 'none')
      .attr('stroke', '#999999')
      .attr('stroke-width', '3px')
      .attr('transform', `translate(${vis.radiusScale(30)-10}, ${vis.radiusScale(30)+vis.radiusScale(2)+35})`)
    vis.legend_size.append('circle')
      .attr('r', vis.radiusScale(1))
      .attr('fill', 'none')
      .attr('stroke', '#999999')
      .attr('stroke-width', '3px')
      .attr('transform', `translate(${vis.radiusScale(30)-10}, ${vis.radiusScale(30)+vis.radiusScale(12.5)+35})`)
    vis.legend_size.append('line')
      .attr('x1', vis.radiusScale(30)-10).attr('x2', vis.radiusScale(30)+110)
      .attr('y1', 35).attr('y2', 35)
      .attr('stroke-width', '3px')
      .attr('stroke', '#999999')
    vis.legend_size.append('text').text('30')
      .attr('fill', '#5a5a5a').attr('font-size', '15px').attr('alignment-baseline', 'central')
      .attr('transform', `translate(${vis.radiusScale(30)+85}, 45)`)
    vis.legend_size.append('line')
      .attr('x1', vis.radiusScale(30)-10).attr('x2', vis.radiusScale(30)+110)
      .attr('y1', vis.radiusScale(30)+15.7).attr('y2', vis.radiusScale(30)+15.7)
      .attr('stroke-width', '3px')
      .attr('stroke', '#999999')
    vis.legend_size.append('text').text('10')
      .attr('fill', '#5a5a5a').attr('font-size', '15px').attr('alignment-baseline', 'central')
      .attr('transform', `translate(${vis.radiusScale(30)+85}, ${vis.radiusScale(30)+25.7})`)
    vis.legend_size.append('line')
      .attr('x1', vis.radiusScale(30)-10).attr('x2', vis.radiusScale(30)+110)
      .attr('y1', vis.radiusScale(30)+62.8).attr('y2', vis.radiusScale(30)+62.8)
      .attr('stroke-width', '3px')
      .attr('stroke', '#999999')
    vis.legend_size.append('text').text('1')
      .attr('fill', '#5a5a5a').attr('font-size', '15px').attr('alignment-baseline', 'central')
      .attr('transform', `translate(${vis.radiusScale(30)+93}, ${vis.radiusScale(30)+72.8})`)
    
    // icon legend
    vis.legend_icon = vis.svg
      .append('g').attr('class', 'legend').attr('transform', `translate(${vis.center.x}, ${vis.center.y-280})`);
    vis.legend_icon.append('circle')
      .attr('fill', vis.drawIcon('Icon')).attr('r', 20).attr('stroke', '#5a5a5a').attr('stroke-width', '3px')
      .attr('transform', 'translate(20,20)');
    vis.legend_icon.append('text').text('icon indicates the')
      .attr('fill', '#5a5a5a').attr('font-size', '15px')
      .attr('transform', 'translate(45, 40)');
    vis.legend_icon.append('text').text('emission of CO2 > 1.5 kg')
      .attr('fill', '#5a5a5a').attr('font-size', '15px')
      .attr('transform', 'translate(0, 60)');
    vis.svg.append('g').attr('transform', `translate(500, ${vis.center.y-1000})`).append('line')
      .attr('x1', 0).attr('x2', 0)
      .attr('y1', 0).attr('y2', 1100)
      .attr('stroke-width', '3px')
      .attr('stroke', '#999999');
    
    // page button
    vis.button = vis.svg
      .append('g').attr('class', 'legend').attr('transform', `translate(${-vis.center.x+80}, ${vis.center.y-6})`);
    vis.button.append('circle').attr('class', 'pagebtn').classed('one', true)
      .attr('r', 30).attr('stroke', '#5a5a5a').attr('stroke-width', '3px').attr('fill', vis.drawIcon('One'))
      .on('click', function(event) {
        let page = 1;
        if (d3.select(this).classed('two')) {
          page = 2;
        } if (d3.select(this).classed('three')) {
          page = 3;
        }
        switch(page) {
          case 1:
            d3.select(this).classed('one', false).classed('two', true)
              .attr('fill', vis.drawIcon('Two'));
            vis.dispatcher.call('toP2', event);
            break;
          case 2:
            d3.select(this).classed('two', false).classed('three', true)
              .attr('fill', vis.drawIcon('Three'));
            vis.dispatcher.call('toP3', event);
            break;
          case 3:
            d3.select(this).classed('three', false).classed('one', true)
              .attr('fill', vis.drawIcon('One'));
            vis.dispatcher.call('toP1', event);
            break;
        }
      });
      vis.buttonlabel = vis.svg
        .append('g').attr('class', 'legend').attr('transform', `translate(${-vis.center.x+120}, ${vis.center.y})`);
      vis.buttonlabel.append('text')
        .text('Switch Page')
        .attr('font-size', '20px')
        .attr('fill', '#5a5a5a')
        .attr('alignment-baseline', 'central')
  }


  updateVis() {
    let vis = this;
    vis.renderVis();
  }


  renderVis() {
    let vis = this;
    let circles = vis.svg.selectAll('.food').data(vis.data, d => d.name);
    let circlesEnter = circles.enter().append('circle').attr('class', 'food');
    circlesEnter.merge(circles)
      .attr('r', d => vis.radiusScale(d.total_emissions))
      .attr('fill', d => vis.colorScale(d.most_stage))
      .attr('opacity', 0.6)

    let icons = vis.svg.selectAll('.icon').data(vis.data, d => d.name);
    let iconsEnter = icons.enter().append('circle').attr('class', 'icon');
    iconsEnter.merge(icons)
      .attr('r', d => vis.radiusScale(d.total_emissions))
      .attr('opacity', d => {return d.total_emissions >= 1.5? 1:0})
      .attr('fill', d => vis.drawIcon(d.id))
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 1);
      })
      .on('mouseleave', function() {
        if (!d3.select(this).classed('active')) {
          d3.select(this).transition().duration(500).attr('opacity', d => {return d.total_emissions >= 1.5? 1:0});
        }
      })
      .on('click', function(event) {
        const isActive = d3.select(this).classed('active');
        vis.svg.selectAll('.icon.active').classed('active', false);
        vis.svg.selectAll('.icon').attr('stroke', 'none').attr('filter', 'none');
        d3.select(this).classed('active', !isActive);
        if(!isActive) {
          d3.select(this)
          .attr('opacity', 1)
          .attr("stroke-width", '5px')
          .attr("stroke", d => vis.colorScale(d.most_stage))
          .attr("filter" , "url(#glow)");
          const selectedFood = vis.svg.selectAll('.icon.active').data().map(d => d.name)
          vis.dispatcher.call('select', event, selectedFood);
        } else {
          vis.svg.selectAll('.icon.active').classed('active', false);
          vis.svg.selectAll('.icon').attr('stroke', 'none').attr('filter', 'none');
          vis.dispatcher.call('reset', event);
        }
      });

    vis.sim.nodes(vis.data).on('tick', ticked)
    function ticked(){
      circlesEnter.attr('cx', d => d.x).attr('cy', d => d.y);
      iconsEnter.attr('cx', d => d.x).attr('cy', d => d.y);
    };

    icons.exit().remove();
    iconsEnter.exit().remove();
    circles.exit().remove();
    circlesEnter.exit().remove();
  }
}
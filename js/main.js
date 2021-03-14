let bubblechart, radarchart, ringchart, alldata;
const dispatcher = d3.dispatch('select', 'reset',
                               'toP1', 'toP2', 'toP3');
/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv('data/Food_Production.csv').then(data => {
  // Convert columns to numerical values
  data.forEach(d => {
    Object.keys(d).forEach(attr => {
      if (attr != 'name' && attr != 'most_stage' && attr != 'id') {
        d[attr] = +d[attr];
      }
    });
  });
  data = data.sort(function (a, b) { return a.total_emissions-b.total_emissions; })
  alldata = data;
  bubblechart = new BubbleChart({
    parentElement: '#left',
  }, dispatcher, data);
  bubblechart.updateVis();


  radarchart = new RadarChart({
    parentElement: '#radar',
    width: 300,
    height: 300,
    select: null,
  }, data);
  radarchart.updateVis();

  ringchart = new RingChart({
   parentElement: '#ring',
   width: 300,
   height: 350,
   selection: null,
  }, data);
  ringchart.updateVis();

  d3.select('#paras').append('p').text("As the world’s population has expanded and gotten richer,\
    the demand for food, energy and water has seen a rapid increase.\
    Not only has demand for all three increased, but they are also strongly interlinked: food \
    production requires water and energy; traditional energy production demands water resources;\
    agriculture provides a potential energy source. This article focuses on the environmental impacts of food. \
    CO2 is one of the greatest challenges we face. Carbon dioxide is a greenhouse gas: a gas that absorbs and radiates heat.\
    Increases in greenhouse gases have tipped the Earth's energy budget out of balance, \
    trapping additional heat and raising Earth's average temperature.");
});

// Dispatcher
dispatcher.on('select', selectedFood => {
  radarchart.selection = selectedFood;
  radarchart.updateVis();

  let target = alldata.filter(d => d.name==selectedFood)[0];
  let selectedCate = null;
  switch (target.food_group) {
    case 1: selectedCate = 'protein';
    break;
    case 2: selectedCate = 'fruit';
    break;
    case 3: selectedCate = 'grains';
    break;
    case 4: selectedCate = 'oils';
    break;
  }
  ringchart.selection = selectedCate;
  console.log(selectedCate)
  ringchart.updateVis();
});

dispatcher.on('reset', () => {
  radarchart.selection = null;
  radarchart.updateVis();
  ringchart.selection = null;
  ringchart.updateVis();
});

dispatcher.on('toP2', () => {
  d3.select('#right1').style('display', 'none');
  d3.select('#right2').style('display', 'flex');
  d3.select('#right3').style('display', 'none');
})

dispatcher.on('toP3', () => {
  d3.select('#right1').style('display', 'none');
  d3.select('#right2').style('display', 'none');
  d3.select('#right3').style('display', 'flex');
})

dispatcher.on('toP1', () => {
  d3.select('#right1').style('display', 'flex');
  d3.select('#right2').style('display', 'none');
  d3.select('#right3').style('display', 'none');
})
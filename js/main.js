let bubblechart,
    radarchart,
    ringchart,
    alldata,
    expandedData,
    cloudSelectedFood,
    co2CloudProtein,
    co2CloudFruitVeg,
    co2CloudGrain,
    co2CloudOilOther,
    histogram;
const dispatcher = d3.dispatch("select", "reset", "toP1", "toP2", "toP3", "stageSelect");
/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv("data/Food_Production.csv").then((data) => {
    // Convert columns to numerical values
    data.forEach((d) => {
        Object.keys(d).forEach((attr) => {
            if (attr != "name" && attr != "most_stage" && attr != "id") {
                d[attr] = +d[attr];
            }
        });
    });
    data = data.sort(function (a, b) {
        return a.total_emissions - b.total_emissions;
    });
    alldata = data;
    bubblechart = new BubbleChart(
        {
            parentElement: "#left",
            calltooltip: calltooltip1,
        },
        dispatcher,
        data
    );
    bubblechart.updateVis();

    radarchart = new RadarChart(
        {
            parentElement: "#radar",
            width: 300,
            height: 300,
            select: null,
            calltooltip: calltooltip1,
        },
        data
    );
    radarchart.updateVis();

    ringchart = new RingChart(
        {
            parentElement: "#ring",
            width: 300,
            height: 350,
            selection: null,
        },
        data
    );
    ringchart.updateVis();

    d3.select("#paras")
        .append("p")
        .text(
            "As the world’s population has expanded and gotten richer,\
    the demand for food, energy, and water has seen a rapid increase.\
    Not only has demand for all three increased, but they are also strongly interlinked: food \
    production requires water and energy; traditional energy production demands water resources;\
    agriculture provides a potential energy source. This visualization will focus on the environmental impacts of food. \
    Carbon dioxide is a greenhouse gas (it absorbs and radiates heat) and reducing CO₂ is one of the greatest challenges humans face.\
    The first 2 pages of this project focus on the impact of different foods on CO₂ emissions, while the 3rd page provides additional environmental \
    information for these foods."
        );

    // create new data points for each stage of each food
    expandedData = [];
    data.forEach((f) => {
        expandedData.push({
            id: f.id,
            name: f.name,
            stage: "farm",
            emissions: f.farm,
            diet: f.diet,
            food_group: f.food_group,
        });
        expandedData.push({
            id: f.id,
            name: f.name,
            stage: "land",
            emissions: f.land_use_change,
            diet: f.diet,
            food_group: f.food_group,
        });
        expandedData.push({
            id: f.id,
            name: f.name,
            stage: "trans",
            emissions: f.transport,
            diet: f.diet,
            food_group: f.food_group,
        });
        expandedData.push({
            id: f.id,
            name: f.name,
            stage: "pack",
            emissions: f.packaging,
            diet: f.diet,
            food_group: f.food_group,
        });
        expandedData.push({
            id: f.id,
            name: f.name,
            stage: "retail",
            emissions: f.retail,
            diet: f.diet,
            food_group: f.food_group,
        });
        expandedData.push({
            id: f.id,
            name: f.name,
            stage: "feed",
            emissions: f.animal_feed,
            diet: f.diet,
            food_group: f.food_group,
        });
        expandedData.push({
            id: f.id,
            name: f.name,
            stage: "process",
            emissions: f.processing,
            diet: f.diet,
            food_group: f.food_group,
        });
    });
    // create individual charts for each food group
    co2CloudProtein = new CO2CloudChart(
        {
            parentElement: "#cloud-protein",
            width: 350,
            height: 300,
            calltooltip: calltooltipCloud,
        },
        "High Protein",
        dispatcher,
        expandedData.filter((f) => f.food_group == 1),
        90
    );
    co2CloudFruitVeg = new CO2CloudChart(
        {
            parentElement: "#cloud-fruit-veg",
            width: 250,
            height: 300,
            calltooltip: calltooltipCloud,
        },
        "Fruits & Vegetables",
        dispatcher,
        expandedData.filter((f) => f.food_group == 2),
        20
    );
    co2CloudGrain = new CO2CloudChart(
        {
            parentElement: "#cloud-grain",
            width: 200,
            height: 300,
            calltooltip: calltooltipCloud,
        },
        "Grains",
        dispatcher,
        expandedData.filter((f) => f.food_group == 3),
        35
    );
    co2CloudOilOther = new CO2CloudChart(
        {
            parentElement: "#cloud-oil-other",
            width: 250,
            height: 300,
            calltooltip: calltooltipCloud,
        },
        "Oils & Other",
        dispatcher,
        expandedData.filter((f) => f.food_group == 4),
        45
    );
    co2CloudProtein.renderVis();
    co2CloudFruitVeg.renderVis();
    co2CloudGrain.renderVis();
    co2CloudOilOther.renderVis();

    data = alldata.filter(function (d) {
        return (
            d.eutrophying_emissions_per_1000kcal !== 0 &&
            d.freshwater_withdrawals_per_kilogram !== 0 &&
            d.land_use_per_kilogram !== 0 &&
            d.scarcity_weighted_water_use_per_kilogram !== 0
        );
    });

    histogram = new Histogram(
        {
            parentElement: "#histogram",
            width: 600,
            height: 650,
            selection: null,
            calltooltip: calltooltip2,
        },
        data
    );
    histogram.updateVis();
});

const calltooltip1 = function (event, data, vis) {
    d3.select("#tooltip1").style("display", "inline-block").style("opacity", 0.95);
    d3.select("#tooltip1")
        .html(
            `<img src='icon/${data.id}.png' width=100 height=100>
                <div style='font-size:15px;font-family:Marker Felt'>${data.name}</div>
                <div>
                <p><text style='color:${vis.colorScale("Farm")}'>Farming: ${data.farm}</text></p>
                <p><text style='color:${vis.colorScale("Land use change")}'>Land use change:${
                data.land_use_change
            }</text></p>
                <p><text style='color:${vis.colorScale("Animal feed")}'>Animal feed:${
                data.animal_feed
            }</text></p>
                <p><text style='color:${vis.colorScale("Processing")}'>Processing:${
                data.processing
            }</text></p>
                <p><text style='color:${vis.colorScale("Packaging")}'>Packaging:${
                data.packaging
            }</text></p>
                <p><text style='color:${vis.colorScale("Transport")}'>Transport:${
                data.transport
            }</text></p>
                <p><text style='color:${vis.colorScale("Retail")}'>Retail:${data.retail}</text></p>
                </div>`
        )
        .style("left", event.pageX + 50 + "px")
        .style("top", event.pageY - 210 + "px");
};

const calltooltip2 = function (event, data, text, number, i) {
    let unit;
    switch (i) {
        case 1:
            unit = "gPO<sub>4</sub>eq";
            break;
        case 3:
            unit = "m<sup>2</sup>";
            break;
        case 2:
        case 4:
            unit = "L";
            break;
        default:
            unit = "gPO<sub>4</sub>eq";
            break;
    }
    d3.select("#tooltip2").style("display", "inline-block").style("opacity", 0.95);
    d3.select("#tooltip2")
        .html(
            `<img src='icon/${data.id}.png' width=100 height=100>
                <div style='font-size:15px;font-family:Marker Felt'>${data.name}</div>
                <div>
                <p><text>${text}</text></p>
                <p><text style='font-size:15px; font-family:Marker Felt'>${number}</text></p>
                <p><text>${unit} / Kg product</text></p>
                </div>`
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px");
};

const calltooltipCloud = function (event, data) {
    d3.select("#tooltip-cloud").style("display", "inline-block").style("opacity", 0.75);
    d3.select("#tooltip-cloud")
        .html(
            `<div>
                <p><text style='font-size:12px;font-family:Marker Felt'>${data.name}</text></p>
                <p><text>CO<sub>2</sub>: ${data.emissions} kg</text></p>
            </div>`
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px");
};

// Dispatcher
dispatcher.on("select", (selectedFood) => {
    radarchart.selection = selectedFood.id;
    radarchart.updateVis();

    let target = alldata.filter((d) => d.id == selectedFood.id)[0];
    let selectedCate = null;
    switch (target.food_group) {
        case 1:
            selectedCate = "protein";
            break;
        case 2:
            selectedCate = "fruit";
            break;
        case 3:
            selectedCate = "grains";
            break;
        case 4:
            selectedCate = "oils";
            break;
    }
    ringchart.selection = selectedCate;
    ringchart.updateVis();

    cloudSelectedFood = selectedFood.id;
    co2CloudProtein.selected = selectedFood.id;
    co2CloudFruitVeg.selected = selectedFood.id;
    co2CloudGrain.selected = selectedFood.id;
    co2CloudOilOther.selected = selectedFood.id;
    // select circles in CO2 cloud related to selected food and highlight
    d3.selectAll("#cloud-" + selectedFood.id)
        .attr("opacity", 1)
        .attr("stroke-width", "2px")
        .attr("stroke", "#676565");
});

dispatcher.on("reset", () => {
    radarchart.selection = null;
    radarchart.updateVis();
    ringchart.selection = null;
    ringchart.updateVis();

    // select circles in CO2 cloud related to selected food and highlight
    d3.selectAll("#cloud-" + cloudSelectedFood)
        .attr("opacity", 0.6)
        .attr("stroke", "transparent");
    cloudSelectedFood = null;
    co2CloudProtein.selected = null;
    co2CloudFruitVeg.selected = null;
    co2CloudGrain.selected = null;
    co2CloudOilOther.selected = null;
});

dispatcher.on("toP2", () => {
    d3.select("#right1").style("display", "none");
    d3.select("#right2").style("display", "flex");
    d3.select("#right3").style("display", "none");
});

dispatcher.on("toP3", () => {
    d3.select("#right1").style("display", "none");
    d3.select("#right2").style("display", "none");
    d3.select("#right3").style("display", "flex");
});

dispatcher.on("toP1", () => {
    d3.select("#right1").style("display", "flex");
    d3.select("#right2").style("display", "none");
    d3.select("#right3").style("display", "none");
});

dispatcher.on("stageSelect", (selectedStages) => {
    if (
        selectedStages === undefined ||
        selectedStages.length === 0 ||
        selectedStages.length === 7
    ) {
        co2CloudProtein.data = expandedData.filter((d) => d.food_group == 1);
        co2CloudFruitVeg.data = expandedData.filter((d) => d.food_group == 2);
        co2CloudGrain.data = expandedData.filter((d) => d.food_group == 3);
        co2CloudOilOther.data = expandedData.filter((d) => d.food_group == 4);
    } else {
        co2CloudProtein.data = expandedData.filter(
            (d) => d.food_group == 1 && selectedStages.includes(d.stage)
        );
        co2CloudFruitVeg.data = expandedData.filter(
            (d) => d.food_group == 2 && selectedStages.includes(d.stage)
        );
        co2CloudGrain.data = expandedData.filter(
            (d) => d.food_group == 3 && selectedStages.includes(d.stage)
        );
        co2CloudOilOther.data = expandedData.filter(
            (d) => d.food_group == 4 && selectedStages.includes(d.stage)
        );
    }

    co2CloudProtein.updateVis();
    co2CloudFruitVeg.updateVis();
    co2CloudGrain.updateVis();
    co2CloudOilOther.updateVis();
});

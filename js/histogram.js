class Histogram {
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
            calltooltip: _config.calltooltip,
        };
        this.margin = { top: 50, right: 50, bottom: 50, left: 50 };
        this.data = _data;
        this.selection = (d) => d.eutrophying_emissions_per_kilogram;
        this.scaledData = (d) => this.xScale(d.eutrophying_emissions_per_kilogram);
        this.initVis();
    }

    /**
     * Create scales, axes, and append static elements
     */
    initVis() {
        let vis = this;
        // areas
        vis.width = vis.config.containerWidth - vis.margin.left - vis.margin.right;
        vis.height = vis.config.containerHeight - vis.margin.top - vis.margin.bottom;

        // scale
        vis.xScale = d3.scaleSqrt().range([0, vis.width]);

        vis.yScale = d3.scaleBand().range([0, vis.height]).padding(1);

        vis.colorScale = d3
            .scaleOrdinal()
            .domain([
                "Farm",
                "Land use change",
                "Transport",
                "Retail",
                "Packaging",
                "Animal feed",
                "Processing",
            ])
            .range(["#e1874b", "#1f78b4", "#bfc27d", "#446276", "#fccde5", "#b4de68", "#668fff"]);

        vis.xAxis = d3.axisBottom(vis.xScale);

        vis.yAxis = d3.axisLeft(vis.yScale);

        vis.svg = d3
            .select(vis.config.parentElement)
            .append("svg")
            .attr("class", "histogramSvg")
            .attr("width", vis.config.containerWidth)
            .attr("height", vis.config.containerHeight);

        vis.chart = vis.svg
            .append("g")
            .attr("class", "axis-chart")
            .attr("transform", `translate(${90}, ${40})`);

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart
            .append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0,${vis.height})`);

        // Append y-axis group
        vis.yAxisG = vis.chart.append("g").attr("class", "axis y-axis");

        // Append axis title
        vis.svg
            .append("text")
            .attr("class", "axis-title")
            .attr("x", 70)
            .attr("y", 20)
            .attr("dy", ".71em")
            .attr("font-size", "14px")
            .attr("alignment-baseline", "central")
            .attr("font-family", "Marker Felt")
            .text("Food Category");

        // Append axis title
        vis.svg
            .append("text")
            .attr("class", "axis-title")
            .attr("x", 520)
            .attr("y", 614)
            .attr("dy", ".71em")
            .attr("font-size", "14px")
            .attr("alignment-baseline", "central")
            .attr("font-family", "Marker Felt")
            .text("per kilogram");

        // defs
        var defs = vis.svg.append("defs");
        vis.drawIcon = function (id) {
            defs.append("pattern")
                .attr("id", id)
                .attr("height", "100%")
                .attr("width", "100%")
                .attr("patternContentUnits", "objectBoundingBox")
                .append("image")
                .attr("height", 1)
                .attr("width", 1)
                .attr("preserveAspectRatio", "none")
                .attr("xlink:href", `icon/${id}.png`);
            return `url(#${id})`;
        };

        // button one
        vis.buttonOne = vis.svg
            .append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${300}, ${25})`);
        vis.buttonOne
            .append("circle")
            .attr("class", "btn")
            .attr("id", "eutro")
            .attr("r", 20)
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", "4px")
            .attr("fill", vis.drawIcon("Emission"))
            .on("click", function (event) {
                const isActive = d3.selectAll(".btn").classed("active");
                vis.svg.selectAll(".btn.active").classed("active", false);
                vis.svg.selectAll(".btn").attr("stroke", "#5a5a5a").attr("stroke-width", "2px");
                d3.select(this).classed("active", !isActive);
                if (!isActive) {
                    d3.select(this).attr("stroke", "#69b3a2").attr("stroke-width", "4px");
                    vis.selection = (d) => d.eutrophying_emissions_per_kilogram;
                    vis.scaledData = (d) => vis.xScale(d.eutrophying_emissions_per_kilogram);
                    vis.updateVis();
                    return vis.selection;
                } else {
                    vis.svg.selectAll(".btn.active").classed("active", false);
                    vis.svg.selectAll(".btn").attr("stroke", "#5a5a5a").attr("stroke-width", "2px");
                    d3.select(this).classed("active", !isActive);
                }
            });

        vis.buttonOne
            .append("text")
            .attr("x", -30)
            .attr("y", 30)
            .attr("fill", "#5a5a5a")
            .text("eutrophying")
            .append("tspan")
            .text("emissions")
            .attr("fill", "#5a5a5a")
            .attr("x", -30)
            .attr("y", 45);

        // button two
        vis.buttonTwo = vis.svg
            .append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${380}, ${25})`);
        vis.buttonTwo
            .append("circle")
            .attr("class", "btn")
            .attr("id", "landuse")
            .attr("r", 20)
            .attr("stroke", "#5a5a5a")
            .attr("stroke-width", "2px")
            .attr("fill", vis.drawIcon("Land"))
            .on("click", function (event) {
                const isActive = d3.selectAll(".btn").classed("active");
                vis.svg.selectAll(".btn.active").classed("active", false);
                vis.svg.selectAll(".btn").attr("stroke", "#5a5a5a").attr("stroke-width", "2px");
                d3.select(this).classed("active", !isActive);
                if (!isActive) {
                    d3.select(this).attr("stroke", "#69b3a2").attr("stroke-width", "4px");
                    vis.selection = (d) => d.land_use_per_kilogram;
                    vis.scaledData = (d) => vis.xScale(d.land_use_per_kilogram);
                    vis.updateVis();
                    return vis.selection;
                } else {
                    vis.svg.selectAll(".btn.active").classed("active", false);
                    vis.svg.selectAll(".btn").attr("stroke", "#5a5a5a").attr("stroke-width", "2px");
                    d3.select(this).classed("active", !isActive);
                }
            });
        vis.buttonTwo
            .append("text")
            .attr("x", -20)
            .attr("y", 30)
            .attr("fill", "#5a5a5a")
            .text("land use");

        // button three
        vis.buttonThree = vis.svg
            .append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${460}, ${25})`);
        vis.buttonThree
            .append("circle")
            .attr("class", "btn")
            .attr("id", "freshwater")
            .attr("r", 20)
            .attr("stroke", "#5a5a5a")
            .attr("stroke-width", "2px")
            .attr("fill", vis.drawIcon("Water"))
            .on("click", function (event) {
                const isActive = d3.selectAll(".btn").classed("active");
                vis.svg.selectAll(".btn.active").classed("active", false);
                vis.svg.selectAll(".btn").attr("stroke", "#5a5a5a").attr("stroke-width", "2px");
                d3.select(this).classed("active", !isActive);
                if (!isActive) {
                    d3.select(this).attr("stroke", "#69b3a2").attr("stroke-width", "4px");
                    vis.selection = (d) => d.freshwater_withdrawals_per_kilogram;
                    vis.scaledData = (d) => vis.xScale(d.freshwater_withdrawals_per_kilogram);
                    vis.updateVis();
                    return vis.selection;
                } else {
                    vis.svg.selectAll(".btn.active").classed("active", false);
                    vis.svg.selectAll(".btn").attr("stroke", "#5a5a5a").attr("stroke-width", "2px");
                    d3.select(this).classed("active", !isActive);
                }
            });
        vis.buttonThree
            .append("text")
            .attr("x", -20)
            .attr("y", 30)
            .attr("fill", "#5a5a5a")
            .text("freshwater")
            .append("tspan")
            .text("withdrawals")
            .attr("fill", "#5a5a5a")
            .attr("x", -20)
            .attr("y", 45);

        // button four
        vis.buttonFour = vis.svg
            .append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${540}, ${25})`);
        vis.buttonFour
            .append("circle")
            .attr("class", "btn")
            .attr("id", "sarcity")
            .attr("r", 20)
            .attr("stroke", "#5a5a5a")
            .attr("stroke-width", "2px")
            .attr("fill", vis.drawIcon("Scarcity_water"))
            .on("click", function (event) {
                const isActive = d3.selectAll(".btn").classed("active");
                vis.svg.selectAll(".btn.active").classed("active", false);
                vis.svg.selectAll(".btn").attr("stroke", "#5a5a5a").attr("stroke-width", "2px");
                d3.select(this).classed("active", !isActive);
                if (!isActive) {
                    d3.select(this).attr("stroke", "#69b3a2").attr("stroke-width", "4px");
                    vis.selection = (d) => d.scarcity_weighted_water_use_per_kilogram;
                    vis.scaledData = (d) => vis.xScale(d.scarcity_weighted_water_use_per_kilogram);
                    vis.updateVis();
                    return vis.selection;
                } else {
                    vis.svg.selectAll(".btn.active").classed("active", false);
                    vis.svg.selectAll(".btn").attr("stroke", "#5a5a5a").attr("stroke-width", "2px");
                    d3.select(this).classed("active", !isActive);
                }
            });
        vis.buttonFour
            .append("text")
            .attr("x", -20)
            .attr("y", 30)
            .attr("fill", "#5a5a5a")
            .text("scarcity")
            .append("tspan")
            .text("weighted water")
            .attr("fill", "#5a5a5a")
            .attr("x", -20)
            .attr("y", 45);

        vis.fruits_line = vis.svg
            .append("line")
            .attr("class", "cutOff")
            .attr("x1", 90)
            .attr("x2", 600)
            .attr("y1", 215)
            .attr("y2", 215)
            .attr("stroke", "#141414")
            .attr("stroke-width", "1px")
            .attr("stroke-dasharray", "4")
            .attr("stroke-opacity", 0.8);

        vis.fruits_text = vis.svg
            .append("text")
            .attr("x", 520)
            .attr("y", 150)
            .attr("fill", "#5a5a5a")
            .attr("font-size", "13px")
            .attr("stroke", "3px")
            .text("fruits & vegs");

        vis.grains_line = vis.svg
            .append("line")
            .attr("class", "cutOff")
            .attr("x1", 90)
            .attr("x2", 600)
            .attr("y1", 248)
            .attr("y2", 248)
            .attr("stroke", "#141414")
            .attr("stroke-width", "1px")
            .attr("stroke-dasharray", "4")
            .attr("stroke-opacity", 0.8);

        vis.grains_text = vis.svg
            .append("text")
            .attr("x", 520)
            .attr("y", 235)
            .attr("fill", "#5a5a5a")
            .attr("font-size", "13px")
            .attr("stroke", "3px")
            .text("grains");

        vis.protein_line = vis.svg
            .append("line")
            .attr("class", "cutOff")
            .attr("x1", 90)
            .attr("x2", 600)
            .attr("y1", 448)
            .attr("y2", 448)
            .attr("stroke", "#141414")
            .attr("stroke-width", "1px")
            .attr("stroke-dasharray", "4")
            .attr("stroke-opacity", 0.8);

        vis.protein_text = vis.svg
            .append("text")
            .attr("x", 520)
            .attr("y", 350)
            .attr("fill", "#5a5a5a")
            .attr("font-size", "13px")
            .attr("stroke", "3px")
            .text("high protein");

        vis.oils_line = vis.svg
            .append("line")
            .attr("class", "cutOff")
            .attr("x1", 90)
            .attr("x2", 600)
            .attr("y1", 582)
            .attr("y2", 582)
            .attr("stroke", "#141414")
            .attr("stroke-width", "1px")
            .attr("stroke-dasharray", "4")
            .attr("stroke-opacity", 0.8);

        vis.oils_text = vis.svg
            .append("text")
            .attr("x", 520)
            .attr("y", 515)
            .attr("fill", "#5a5a5a")
            .attr("font-size", "13px")
            .attr("stroke", "3px")
            .text("oils & others");
        d3.select(".page").append("div").attr("id", "tooltip2");
    }

    updateVis() {
        let vis = this;
        //
        let protein = vis.data.filter((d) => d.food_group === 1);
        let fruits_veggies = vis.data.filter((d) => d.food_group === 2);
        let grains = vis.data.filter((d) => d.food_group === 3);
        let oils_other = vis.data.filter((d) => d.food_group === 4);
        let sortedData = [];
        fruits_veggies.forEach((d) => sortedData.push(d));
        grains.forEach((d) => sortedData.push(d)); //5
        protein.forEach((d) => sortedData.push(d)); //15
        oils_other.forEach((d) => sortedData.push(d)); //10
        vis.data = sortedData;

        // Set the scale input domains
        vis.xScale.domain([0, d3.max(vis.data, vis.selection) + 20]);

        vis.yScale.domain(
            vis.data.map(function (d) {
                return d.name;
            })
        );

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        // line
        vis.lines = vis.chart.selectAll(".myline").data(vis.data, (d) => d.id);
        vis.lines
            .enter()
            .append("line")
            .attr("class", "myline")
            .merge(vis.lines)
            .attr("opacity", 1)
            .on("mousemove", function (event, data) {
                d3.select(this).transition().duration(100).attr("opacity", 0.2);
                let i = 0;
                if (d3.select(".btn#eutro").classed("active")) {
                    i = 1;
                } else if (d3.select(".btn#freshwater").classed("active")) {
                    i = 2;
                } else if (d3.select(".btn#landuse").classed("active")) {
                    i = 3;
                } else if (d3.select(".btn#sarcity").classed("active")) {
                    i = 4;
                }

                let text = "";
                switch (i) {
                    case 1:
                        text =
                            "Eutrophying emissions: \n" + data.eutrophying_emissions_per_kilogram;
                        break;
                    case 3:
                        text = "Land use: \n" + data.land_use_per_kilogram;
                        break;
                    case 2:
                        text =
                            "Freshwater withdrawasl: \n" + data.freshwater_withdrawals_per_kilogram;
                        break;
                    case 4:
                        text =
                            "Scarcity weighted water use: \n" +
                            data.scarcity_weighted_water_use_per_kilogram;
                        break;
                    default:
                        text =
                            "Eutrophying emissions: \n" + data.eutrophying_emissions_per_kilogram;
                        break;
                }
                vis.config.calltooltip(event, data, text.split("\n")[0], text.split("\n")[1], i);
            })
            .on("mouseout", function () {
                d3.select(this).transition().duration(100).attr("opacity", 1);
                d3.select("#tooltip2").style("opacity", 0);
            })
            .transition()
            .duration(500)
            .attr("x1", (d) => vis.scaledData(d))
            .attr("x2", vis.xScale(0))
            .attr("y1", function (d) {
                return vis.yScale(d.name);
            })
            .attr("y2", function (d) {
                return vis.yScale(d.name);
            })
            .attr("stroke", "#5a5a5a")
            .attr("stroke-width", "11px")
            .attr("stroke-opacity", 0.3);

        // Circles
        vis.circles = vis.chart.selectAll(".mycircle").data(vis.data, (d) => d.id);
        vis.circles
            .enter()
            .append("circle")
            .attr("class", "mycircle")
            .merge(vis.circles)
            .transition()
            .duration(500)
            .attr("cx", (d) => vis.scaledData(d))
            .attr("cy", function (d) {
                return vis.yScale(d.name);
            })
            .attr("r", "5.5")
            .style("fill", "#69b3a2")
            .attr("stroke", "#69b3a2")
            .attr("stroke-opacity", 0.3);

        vis.circles.exit().remove();
        vis.lines.exit().remove();

        vis.xAxisG.call(vis.xAxis).call((g) => g.select(".domain").remove());

        vis.yAxisG.call(vis.yAxis).call((g) => g.select(".domain").remove());

        // Update axes
        vis.xAxisG.transition().duration(500).call(vis.xAxis);
        vis.yAxisG.transition().duration(500).call(vis.yAxis);
    }
}

class CO2CloudChart {
    /**
     * Class constructor with initial configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _foodType, _dispatcher, _data, _spacing) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.width,
            containerHeight: _config.height,
        };
        this.margin = { top: 50, right: 50, bottom: 50, left: 50 };
        this.selected = null;
        this.foodType = _foodType;
        this.spacing = _spacing;
        this.dispatcher = _dispatcher;
        this.calltooltip = _config.calltooltip;
        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth;
        vis.height = vis.config.containerHeight;
        vis.center = { x: 150, y: 150 };
        vis.svg = d3
            .select(vis.config.parentElement)
            .append("svg")
            .attr("class", "chart")
            .attr("width", vis.config.containerWidth)
            .attr("height", vis.config.containerHeight);
        vis.g = vis.svg
            .append("g")
            .attr(
                "transform",
                `translate(${vis.config.containerWidth / 2}, ${vis.config.containerHeight / 2})`
            );

        // scales
        vis.radiusScale = d3
            .scaleSqrt()
            // using hard coded values to keep consistency across all clouds
            .domain([0.1, 39.4]) // lowest positive value, highest value (between all clouds)
            .range([6, 30])
            .clamp(true); // using clamp because some values have negative values
        vis.colorScale = d3
            .scaleOrdinal()
            .domain(["farm", "land", "feed", "process", "pack", "trans", "retail"])
            .range(["#e1874b", "#1f78b4", "#b4de68", "#668fff", "#fccde5", "#bfc27d", "#446276"]);
        // simulation
        vis.sim = d3
            .forceSimulation()
            .force("x", d3.forceX().strength(0.01))
            .force("y", d3.forceY().strength(0.05))
            .force(
                "collision",
                d3.forceCollide((d) => vis.radiusScale(d.emissions))
            );

        vis.g
            .append("text")
            .text("CO₂ Cloud for " + vis.foodType)
            .attr("font-size", "16px")
            .attr("font-family", "Marker Felt")
            .attr(
                "transform",
                `translate(${-vis.config.containerWidth / 2 + this.spacing}, ${
                    -vis.config.containerHeight / 2 + 20
                })`
            );

        // Legend for cloud bubbles' size
        // (only rendering for protein so only one legend is rendered)
        if (vis.foodType === "High Protein") {
            vis.cloudLegend = d3
                .select("#cloud-legend")
                .append("svg")
                .attr("width", 150)
                .attr("height", 300);
            vis.cloudLegend.append("g").attr("class", "legend");
            vis.cloudLegend
                .append("text")
                .text("Total Emission for Stage ")
                .attr("font-size", "12px")
                .attr("alignment-baseline", "central")
                .attr("font-family", "Marker Felt")
                .attr("transform", `translate(5, 10)`);
            vis.cloudLegend
                .append("text")
                .text("(kg CO₂ / kg product)")
                .attr("font-size", "12px")
                .attr("alignment-baseline", "central")
                .attr("font-family", "Marker Felt")
                .attr("transform", `translate(5, 25)`);
            vis.cloudLegend
                .append("circle")
                .attr("r", vis.radiusScale(25))
                .attr("cx", 45)
                .attr("cy", 70)
                .attr("fill", "none")
                .attr("stroke", "#999999")
                .attr("stroke-width", "3px");
            vis.cloudLegend
                .append("text")
                .text("25")
                .attr("fill", "#5a5a5a")
                .attr("font-size", "12px")
                .attr("alignment-baseline", "central")
                .attr("x", 75)
                .attr("y", 70);
            vis.cloudLegend
                .append("circle")
                .attr("r", vis.radiusScale(5))
                .attr("cx", 45)
                .attr("cy", 125)
                .attr("fill", "none")
                .attr("stroke", "#999999")
                .attr("stroke-width", "3px");
            vis.cloudLegend
                .append("text")
                .text("5")
                .attr("fill", "#5a5a5a")
                .attr("font-size", "12px")
                .attr("alignment-baseline", "central")
                .attr("x", 70)
                .attr("y", 125);
            vis.cloudLegend
                .append("circle")
                .attr("r", vis.radiusScale(1))
                .attr("cx", 45)
                .attr("cy", 170)
                .attr("fill", "none")
                .attr("stroke", "#999999")
                .attr("stroke-width", "3px");
            vis.cloudLegend
                .append("text")
                .text("1")
                .attr("fill", "#5a5a5a")
                .attr("font-size", "12px")
                .attr("alignment-baseline", "central")
                .attr("x", 65)
                .attr("y", 170);
            vis.cloudLegend
                .append("circle")
                .attr("r", vis.radiusScale(0.1))
                .attr("cx", 45)
                .attr("cy", 210)
                .attr("fill", "none")
                .attr("stroke", "#999999")
                .attr("stroke-width", "3px");
            vis.cloudLegend
                .append("text")
                .text("0.1")
                .attr("fill", "#5a5a5a")
                .attr("font-size", "12px")
                .attr("alignment-baseline", "central")
                .attr("x", 55)
                .attr("y", 210);

            d3.select(".page").append("div").attr("id", "tooltip-cloud");
        }
    }

    updateVis() {
        let vis = this;

        vis.sim.alpha(1).alphaTarget(0).restart().force("collision").initialize(vis.data);

        vis.renderVis();
    }

    renderVis() {
        let vis = this;
        d3.selectAll(`.food-stage-co2-${vis.foodType[0]}`).remove();
        let circles = vis.g.selectAll(`.food-stage-co2-${vis.foodType[0]}`).data(vis.data);
        let circlesEnter = circles
            .enter()
            .append("circle")
            .attr("class", `food-stage-co2-${vis.foodType[0]}`)
            .attr("id", (d) => "cloud-" + d.id);
        circlesEnter
            .merge(circles)
            .attr("r", (d) => vis.radiusScale(d.emissions))
            .attr("fill", (d) => vis.colorScale(d.stage))
            .attr("opacity", (d) => (vis.selected === d.id ? 1 : 0.6))
            .attr("stroke-width", "2px")
            .attr("stroke", (d) => (vis.selected === d.id ? "#676565" : "transparent"))
            .on("mousemove", function (event, data) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("opacity", vis.selected === data.id ? 1 : 0.8);
                vis.calltooltip(event, data);
            })
            .on("mouseout", function (event, data) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("opacity", (d) => (vis.selected === data.id ? 1 : 0.6));
                d3.select("#tooltip-cloud").style("opacity", 0);
            });

        vis.sim.nodes(vis.data).on("tick", ticked);

        function ticked() {
            circlesEnter.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        }

        d3.selectAll(".pipeline-input").on("change", function (event) {
            let newSelected = [];
            d3.selectAll(".pipeline-input").each(function (_, i) {
                if (this.checked) {
                    newSelected.push(this.id);
                }
            });
            vis.dispatcher.call("stageSelect", event, newSelected);
        });

        circles.exit().remove();
        circlesEnter.exit().remove();
    }
}

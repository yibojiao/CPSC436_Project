class RingChart {
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
        };
        (this.margin = { top: 50, right: 50, bottom: 50, left: 50 }), (this.data = _data);
        this.selection = null;
        this.initVis();
    }

    initVis() {
        let vis = this;

        // areas
        vis.width = vis.config.containerWidth - vis.margin.left - vis.margin.right;
        vis.height = vis.config.containerHeight - vis.margin.top - vis.margin.bottom;
        vis.svg = d3
            .select(vis.config.parentElement)
            .append("svg")
            .attr("class", "chart")
            .attr("width", vis.config.containerWidth)
            .attr("height", vis.config.containerHeight + 100);
        vis.g = vis.svg.append("g");

        // defs
        var defs = vis.svg.append("defs");
        vis.drawIcon = function (name) {
            defs.append("pattern")
                .attr("id", name)
                .attr("height", "100%")
                .attr("width", "100%")
                .attr("patternContentUnits", "objectBoundingBox")
                .append("image")
                .attr("height", 1)
                .attr("width", 1)
                .attr("preserveAspectRatio", "none")
                .attr("xlink:href", `icon/${name}.png`);
            return `url(#${name})`;
        };

        vis.g
            .append("circle")
            .attr("cx", 150)
            .attr("cy", 245)
            .transition()
            .duration(800)
            .attr("r", 40)
            .attr("fill", "url(#Icon)");
        vis.g
            .append("text")
            .text("Food Groups")
            .attr("font-size", "30px")
            .attr("font-family", "Marker Felt")
            .attr("transform", `translate(20, 35)`);
        vis.g
            .append("text")
            .text("We devied all 43 foods into 4 groups:")
            .attr("fill", "#5a5a5a")
            .attr("font-size", "15px")
            .attr("transform", `translate(20, 65)`);
        vis.g
            .append("text")
            .text("high proteins, fruits & veggies,")
            .attr("fill", "#5a5a5a")
            .attr("font-size", "15px")
            .attr("transform", `translate(20, 85)`);
        vis.g
            .append("text")
            .text("grains, oils & others.")
            .attr("fill", "#5a5a5a")
            .attr("font-size", "15px")
            .attr("transform", `translate(20, 105)`);
    }

    updateVis() {
        let vis = this;
        let protein = vis.data.filter((d) => d.food_group == 1).length;
        let fruits_veggies = vis.data.filter((d) => d.food_group == 2).length;
        let grains = vis.data.filter((d) => d.food_group == 3).length;
        let oils_other = vis.data.filter((d) => d.food_group == 4).length;
        vis.ringData = [
            { id: "protein", name: "high protein", value: protein },
            { id: "fruit", name: "fruit & veggies", value: fruits_veggies },
            { id: "grains", name: "grains", value: grains },
            { id: "oils", name: "oils & other", value: oils_other },
        ];
        vis.pie = d3.pie().value((d) => d.value);
        vis.arcData = vis.pie(vis.ringData);
        vis.arc = d3.arc().outerRadius(100).innerRadius(40);
        vis.renderVis();
    }

    renderVis() {
        let vis = this;
        vis.rings = vis.g
            .selectAll(".cateArea")
            .data(vis.arcData)
            .join("path")
            .attr("class", "cateArea")
            .attr("id", (d) => d.data.id)
            .attr("transform", `translate(150, 245)`)
            .attr("fill", "#999999")
            .attr("d", vis.arc)
            .attr("stroke", "#f1f1f1")
            .attr("stroke-width", "5px");

        vis.g
            .selectAll(".cateLabel")
            .data(vis.arcData)
            .join("text")
            .attr("class", "cateLabel")
            .text((d) => d.data.value)
            .attr("fill", "#5a5a5a")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central")
            .attr(
                "transform",
                (d) => `translate(${vis.arc.centroid(d)[0] + 150}, ${vis.arc.centroid(d)[1] + 245})`
            )
            .attr("font-size", "30px");

        vis.g
            .selectAll(".cateName")
            .data(vis.arcData)
            .join("text")
            .attr("class", "cateName")
            .append("textPath")
            .attr("xlink:href", (d) => `#${d.data.id}`)
            .text((d) => d.data.name)
            .attr("fill", "#5a5a5a")
            .attr("startOffset", "2%")
            .attr(
                "transform",
                (d) =>
                    `translate(${1.5 * vis.arc.centroid(d)[0] + 150}, ${
                        1.5 * vis.arc.centroid(d)[1] + 245
                    })`
            )
            .attr("font-size", "15px");
        if (vis.selection) {
            d3.selectAll(`.cateArea#${vis.selection}`)
                .attr("fill", "white")
                .transition()
                .duration(500)
                .attr("d", d3.arc().outerRadius(120).innerRadius(40));
        } else {
            vis.rings.attr("fill", "#999999").attr("d", d3.arc().outerRadius(100).innerRadius(40));
        }
    }
}

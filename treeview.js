export class TreeView {
    constructor(svgNode) {
        this.svgSelection = svgNode;
        this.edgesGroup = this.svgSelection.append("g");
        this.nodesGroup = this.svgSelection.append("g");
    }

    update(tree) {
        const dag = d3.dagHierarchy()(tree.toDag());
        const nodeRadius = 40;
        const layout = d3
            .sugiyama() // base layout
            .coord(d3.coordQuad())
            .nodeSize(node => [(node ? 3.2 : 0.25) * nodeRadius, 2.5 * nodeRadius]);
        const {width, height} = layout(dag);

        this.svgSelection.attr("viewBox", [0, 0, width, height].join(" "));

        const transition = d3.transition()
            .duration(250)
            .ease(d3.easeCubic);

        // How to draw edges
        const line = d3
            .line()
            .curve(d3.curveCatmullRom)
            .x(d => d.x)
            .y(d => d.y);

        // Plot edges
        const edges = this.edgesGroup
            .selectAll("path")
            .data(dag.links());
        edges
            .enter()
            .append("path")
            .classed("edge", true)
            .merge(edges)
            .transition(transition)
            .attr("d", ({points}) => line(points));
        edges.exit().remove();

        // Select nodes
        const nodes = this.nodesGroup
            .selectAll("g")
            .data(dag.descendants());
        nodes.exit().remove();
        const nodesEnter = nodes
            .enter()
            .append("g")
            .classed("node", true);
        nodesEnter
            .attr("transform", ({x, y}) => `translate(${x}, ${y})`);
        nodes
            .transition(transition)
            .attr("transform", ({x, y}) => `translate(${x}, ${y})`);

        // Plot node circles
        nodesEnter.append("circle")
            .merge(nodes.select("circle"))
            .classed("leaf", n => n.data.leaf)
            .classed("backref", n => n.data.backref)
            .transition(transition)
            .attr("r", n => {
                if (n.data.root) return nodeRadius / 4;
                if (!n.data.leaf) return nodeRadius * 2 / 4;
                return nodeRadius;
            });

        // Add text to nodes
        nodesEnter
            .append("text")
            .classed("token", true)
            .attr("transform", `translate(0,-${nodeRadius / 3})`)
            .attr("font-size", `${nodeRadius/2}px`)
            .merge(nodes.select("text.token"))
            .text(d => d.data.token);
        nodesEnter
            .append("text")
            .classed("id", true)
            .merge(nodes.select("text.id"))
            .attr("font-size", `${nodeRadius/3}px`)
            .attr("transform", n => {
                const pos = n.data.leaf ? nodeRadius / 3 : 0;
                return `translate(0,${pos})`
            })
            .text(d => d.data.id);
    }
}
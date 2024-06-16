

window.dropdown = new Dropdown();



window.rootDiagram = new Diagram({
    nodeContainer: document.getElementById("nodes"),
    edgeContainer: document.getElementById("edges"),
    panInput: document.getElementById("pan"),
    zoomInput: document.getElementById("zoom"),
    coordsLive: true,
    coordinateContainer: document.getElementById("coordinates"),
    background: {
        type: "grid",
        // type: "mandelbrot",
        svg_element: svg,
        svg_bg_element: svg.getElementById("bg"),
        svg_viewmat_element: svg.getElementById("viewmatrix"),
        svg_mousePath_element: svg.getElementById("mousePath"),
    },
    id: 0
})
Node.DEFAULT_CONFIGURATION.diagram = rootDiagram;


window.dropdownPanel = new DropdownPanel();


// From embeddingsdb.js
for (let key in rootDiagram.nodes) {
    let nodeTitle = rootDiagram.nodes[key].title;
    let nodeContent = rootDiagram.nodes[key].plainText;
    nodeTitlesAndContent.push({
        title: nodeTitle,
        content: nodeContent
    });
}

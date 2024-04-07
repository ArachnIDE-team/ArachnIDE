

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
        svg_element: svg,
        svg_bg_element: svg.getElementById("bg"),
        svg_viewmat_element: svg.getElementById("viewmatrix"),
        svg_mousePath_element: svg.getElementById("mousePath"),
    },
    id: 0
})
Node.DEFAULT_CONFIGURATION.diagram = rootDiagram;


window.dropdownPanel = new DropdownPanel();

// FROM functioncallingpanel.js
// Add event listeners to the node panel for different types of events
dropdown.nodePanel.addEventListener('click', handlePanelEvent);
dropdown.nodePanel.addEventListener('mousedown', handlePanelEvent); // For drag (mousedown)
dropdown.nodePanel.addEventListener('mousemove', handlePanelMouseMove);
dropdown.nodePanel.addEventListener('wheel', handlePanelEvent);     // For scroll (wheel event)
dropdown.nodePanel.addEventListener('dragstart', handlePanelEvent); // Prevents dragging from propagating
dropdown.nodePanel.addEventListener('dragend', handlePanelEvent);   // Optional, handle end of drag
const functionCallPanel = dropdown.nodePanel.querySelector('.function-call-panel');

// From embeddingsdb.js
for (let key in rootDiagram.nodes) {
    let nodeTitle = rootDiagram.nodes[key].title;
    let nodeContent = rootDiagram.nodes[key].plainText;
    nodeTitlesAndContent.push({
        title: nodeTitle,
        content: nodeContent
    });
}

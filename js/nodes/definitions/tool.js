class ToolNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        description: "",
        saved: undefined,
        saveData: undefined,
    }

    static SAVE_PROPERTIES = ['name', 'description', 'index'];

    static OBSERVERS = {}


    constructor(configuration = ToolNode.DEFAULT_CONFIGURATION) {
        configuration = {...ToolNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.sources = {...ToolNode.DEFAULT_CONFIGURATION.sources, ...configuration.sources}
        configuration.index = configuration.saved ? configuration.saveData.json.index : generateUUID();
        configuration.content = [];//ToolNode._getContentElement(configuration.index);
        if (!configuration.saved) {// Create ToolNode
            super({...configuration, title: "Tool: " + configuration.name, ...WindowedNode.getNaturalScaleParameters()});
            this.followingMouse = 1;
        } else {// Restore ToolNode
            configuration.name = configuration.saveData.json.name;
            super({...configuration, title: "Tool: " + configuration.name, scale: true});
        }
        this.diagram.addNode(this);
        this._initialize(configuration.name, configuration.description, configuration.index, configuration.saved)

    }

    _initialize(name, description, index, saved){
        this.anchorForce = 1;
        this.toggleWindowAnchored(true);

        if(!saved){
            this.name = name;
            this.description = description;
            this.index = index;
        }
        this._addDescription();
        this._addCustomInterface();
        this._addPerformButton();
        super.afterInit();
    }
    _addDescription(){
        this.descriptionPanel = document.createElement("div");
        this.descriptionPanel.className = "code";
        this.descriptionPanel.innerText = this.description;
        this.descriptionPanel.style.width = "100%"
        this.innerContent.append(this.descriptionPanel);
    }
    _addPerformButton(){
        this.performButton = document.createElement("button");
        this.performButton.className = "footer-button";
        this.performButton.innerText = "Perform"
        this.performButton.style.width = "100%"
        this.performButton.onclick = this.perform.bind(this);
        this.innerContent.style.width = "100%";
        this.innerContent.append(this.performButton);
    }
    getInputNodes(){
        let inputs = [];
        for (let edge of this.edges) {
            if (edge.directionality.end !== this) {
                if(edge.pts[0] === this) inputs.push(edge.pts[1])
                if(edge.pts[1] === this) inputs.push(edge.pts[0])
            }
        }
        return inputs;
    }

    getOutputNodes(){
        let outputs = [];
        for (let edge of this.edges) {
            if (edge.directionality.start !== this) {
                if(edge.pts[0] === this) outputs.push(edge.pts[1])
                if(edge.pts[1] === this) outputs.push(edge.pts[0])
            }
        }
        return outputs;
    }

    error(name, message){
        let errorNode = createTextNode("Error: "+ name, message);
        connectDistance(this, errorNode,0.1, {
            stroke: "none",
            "stroke-width": "0.005",
            fill: "rgb(250,220,220)",
            opacity: "0.5"
        } )
    }

    //override
    _addCustomInterface(){}

    perform(){}

}

function createToolNode(name, description){
    return new ToolNode({name, description})
}
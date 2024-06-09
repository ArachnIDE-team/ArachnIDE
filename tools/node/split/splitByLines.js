import CONFIGURATION from './splitByLines.json'


class SplitByLines extends ToolNode {
    constructor() {
        super(CONFIGURATION);
    }
    perform() {
        let inputNodes = this.getInputNodes();
        if(inputNodes.length === 0) return this.error("Connect a node", "This tool takes one input node.\nPlease connect it to a text or code node.")
        if(inputNodes.length > 1) return this.error("Too many input nodes", "This tool takes only one input node")
        let node = inputNodes[0]
        let source = node instanceof TextNode ? node.text : node.code;
        let lines = source.split("\n");
        let radius = node.scale * 2;
        if(lines.length > 15) radius *= lines.length / 48*Math.PI
        lines.forEach((line, index) => {
            let configuration = node.constructor.DEFAULT_CONFIGURATION;
            if(node instanceof TextNode) {
                configuration.text = line;
            } else {
                configuration.code = line;
            }
            let otherFileNode = new node.constructor(configuration);
            connectDistance(node, otherFileNode)
            let circularDisplacement = new vec2(radius * Math.cos(2 * Math.PI * (index/lines.length)), radius * Math.sin(2 * Math.PI * (index/lines.length)))
            otherFileNode.pos = otherFileNode.pos.minus(circularDisplacement);
        });
    }
}

export default SplitByLines;
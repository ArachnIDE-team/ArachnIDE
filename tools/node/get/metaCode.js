import CONFIGURATION from './metaCode.json'


class MetaCode extends ToolNode {
    constructor() {
        super(CONFIGURATION);
    }
    perform() {
        let inputNodes = this.getInputNodes();
        for (let node of inputNodes) {
            let source = node.getExtendedClasses().reverse().join("\n\n");
            let javascriptNode = createJavascriptNode("Code of: " + node.title, source);
            let distance = javascriptNode.pos.minus(this.pos).scale(2);
            javascriptNode.pos = javascriptNode.pos.minus(distance)
            connectDistance(this, javascriptNode);
        }
    }
}

export default MetaCode;
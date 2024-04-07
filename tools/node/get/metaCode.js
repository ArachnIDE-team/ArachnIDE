import CONFIGURATION from './metaCode.json'


class MetaCode extends ToolNode {
    constructor() {
        super(CONFIGURATION);
    }
    perform() {
        let inputNodes = this.getInputNodes();
        for (let node of inputNodes) {
            let source = node.getExtendedClasses().reverse().join("\n\n");
            createJavascriptNode("Code of: " + node.title, source);
        }
    }
}

export default MetaCode;
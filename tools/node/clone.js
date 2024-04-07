import CONFIGURATION from './clone.json'

class Clone extends ToolNode {
    constructor() {
        super(CONFIGURATION);
    }
    perform() {
        let inputNodes = this.getInputNodes();
        let newNodes = cloneNodes(inputNodes, this.diagram);
        for (let copy of newNodes) {
            let distance = copy.pos.minus(this.pos).scale(2);
            copy.pos = copy.pos.minus(distance)
        }
    }
}

export default Clone;
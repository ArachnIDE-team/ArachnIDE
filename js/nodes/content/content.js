// Hendles different types of node contents, editors and display
class Content {
    constructor(object) {
        this.object = object;
        this.type = this.constructor.name;
    }
}

class RawTextContent extends Content{
    constructor(text) {
        super(text);
    }
    render(){

    }
}


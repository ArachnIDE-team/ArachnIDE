// Probably useless
// class HTMLTemplate {
//     constructor(container, clone=true) {
//         this.container = container;
//         this.backup = container;
//         if (clone) {
//             this.container = container.cloneNode(true);
//             if(this.container.style.display === "none") this.container.style.display = "";
//         } else {
//             this.backup = container.cloneNode(true);
//         }
//     }
//
//     getContainer() {
//         return this.container
//     }
//
//     static byId(id, clone = true) {
//         return new HTMLTemplate(document.getElementById(id), clone).getContainer();
//     }
// }


class HTMLNode extends Node {
    static DEFAULT_CONFIGURATION = {
        content: undefined,
        container: undefined,
        // templates: []
    }
    // constructor(title, content, scaleProportions) {
    constructor(configuration = HTMLNode.DEFAULT_CONFIGURATION) {
        configuration = {...HTMLNode.DEFAULT_CONFIGURATION, ...configuration};
        if(configuration.content) {
            HTMLNode.proxyMethods(configuration.content, configuration.container);
        } else {
            configuration.content = configuration.container;
        }
        // HTMLNode.proxyMethods(configuration.container, configuration.content);
        super({title: configuration.title, content: configuration.content, pos: rootDiagram.background.pan, scale: (rootDiagram.background.zoom.mag2() ** settings.zoomContentExp), intrinsicScale: 1, addFullScreenButton: false, addCollapseButton: false, addSettingsButton: false, addFileButton: false});
        this.container = configuration.container;
        // this.templates = configuration.templates;
        // HTMLNode.proxyMethods(this, this.container);
        HTMLNode.proxyMethods(this, this.content);
        // this.diagram.addNode(this);
        // WindowedNode.makeContentScrollable(this.innerContent, true)
        this._initializeUI()
    }

    static proxyMethods(proxy, content){
        let properties = Array.from(Object.getOwnPropertyNames(content));
        let proto = content.__proto__;
        let name = proto.constructor.name;
        while(name !== "Object"){
            properties.push(...Object.getOwnPropertyNames(proto))
            proto = proto.__proto__;
            name = proto.constructor.name;
        }
        properties = properties.filter((property) => {
            return typeof content[property] === 'function'// && content.hasOwnProperty(property)
        })
        for(let key of properties){
            proxy[key] = content[key].bind(content)
        }
    }

    _initializeUI(){
        this.afterInit();
    }

    afterInit(){
        super.afterInit();
    }
    save() {
        return null;
    }
}


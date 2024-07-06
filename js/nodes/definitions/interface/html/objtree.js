
// https://github.com/daweilv/treejs/tree/master
class ObjectTreeHTML extends Tree {
    static DEFAULT_CONFIGURATION = {
        container: undefined,
        treeObject: undefined,
        defaultTree: undefined, // For not awaiting in constructor
        selection: false,
        multiple: false,
        eventListeners: {
            switcher: [],
            value: []
        },
        afterInit: () => {},
    }

    constructor(configuration= ObjectTreePanel.DEFAULT_CONFIGURATION) {
        configuration = {...ObjectTreeHTML.DEFAULT_CONFIGURATION, ...configuration}
        const treeData = ObjectTreeHTML._build_tree(configuration.defaultTree);
        // const treeData = ObjectTreeHTML._build_tree(configuration.treeObject.getTree("", 2));
        super(configuration.container, {
            data: treeData,
            loaded: function() {
                this.selection = configuration.selection;
                this.multiple = configuration.multiple;
                this.treeObject = configuration.treeObject;
                this.lastSelection = [];
                this.eventListeners = {}; // prevent undesirable sharing of event listener
                this.eventListeners.value = [...configuration.eventListeners.value]
                this.eventListeners.switcher = [...configuration.eventListeners.switcher]
                this.afterInit = configuration.afterInit;
                // Don't worry about the warning
                this.onLoaded();
            },
            onChange:  function() {
                this.onChanged()
            }
        });


    }

    onSwitcherClick(switcherElement) {
        let liElement = switcherElement.parentElement;
        // console.log("Clicked on switcher:", switcherElement)
        let found = false;
        for(let key of Object.keys(this.liElementsById)){
            if(this.liElementsById[key] === liElement) found = key;
        }
        if(found) {
            if(liElement.classList.contains('treejs-node__close')) {
                // console.log("Opening: ", found )
                this.reloadNode(found, liElement).then((switchForReal) => {
                    if(switchForReal) super.onSwitcherClick(switcherElement);
                });
            } else {
                super.onSwitcherClick(switcherElement);
            }
        } else {
            super.onSwitcherClick(switcherElement);
        }
        for(let listener of this.eventListeners.switcher){
            listener(found)
        }
    }

    async reloadNode(rootPath, liElement){
        this.lastSelection = [...this.values];

        let nodeItem = this.nodesById[rootPath];
        if(nodeItem?.attributes?.isGetter){
            // opened getter property
            let value = this.treeObject.getProperty(rootPath);
            if(typeof value !== "object") {
                this.addKeyValueLabel(liElement, nodeItem.attributes.key, value)//nodeItem.attributes.getter()
                return false;
            }
        }

        let objTree = await this.treeObject.getTree(rootPath.length > 0 && rootPath.length < 3 && !rootPath.endsWith("/") ? rootPath + "/" : rootPath, 2);
        const treeData = ObjectTreeHTML._build_tree(objTree, rootPath);
        // Node data replacement
        nodeItem.children = treeData;
        const treeElement =  this.buildTree(treeData, 1);
        // console.log("reloaded: ", rootPath , " with data: ", treeData, "element:", liElement.querySelector("ul.treejs-node"), "with" , this.buildTree(treeData, 1))
        // HTML Node replacement
        liElement.querySelector("ul.treejs-nodes").replaceWith(treeElement)
        // Update Tree data
        let {
            treeNodes,
            nodesById,
            leafNodesById
        } = Tree.parseTreeData(JSON.parse(JSON.stringify(this.treeNodes, (k, v) => k === "parent" ? undefined : v)));
        this.treeNodes = treeNodes;
        this.nodesById = nodesById;
        this.leafNodesById = leafNodesById;
        // Collapse subnodes
        Array.from(treeElement.getElementsByClassName('treejs-switcher')).forEach((switcher) => switcher.click());
        this.decorateNodes();
        this.values = this.lastSelection;
        return true;
    }

    onChanged(){
        // console.log("Checkbox changed: ", this.values);
        let newSelection = [...this.values]
        for(let prevId of this.lastSelection){
            if(newSelection.includes(prevId)) newSelection.splice(newSelection.indexOf(prevId), 1)
        }
        this.lastSelection = [...this.values];
        function callListeners() {
            for (let listener of this.eventListeners.value) {
                listener(this.values, newSelection)
            }
        }
        if(!this.multiple) {
            if(this.values.length > 1) {
                newSelection = [newSelection[newSelection.length - 1]];
                this.values = newSelection;
            }else{
                callListeners.call(this);
            }
        } else{
            callListeners.call(this);
        }
    }
    // override walkDown
    walkDown(node, changeState) {
        if (node.children && node.children.length) {
            node.children.forEach(child => {
                if ((changeState === 'status' && child.disabled)) return;
                child[changeState] = node[changeState];
                this.markWillUpdateNode(child);
                this.walkDown(child, changeState);
            });
        }
    };
    // override getValues
    getValues() {
        const values = [];
        for (let id in this.nodesById) {
            if (this.nodesById.hasOwnProperty(id)) {
                const node = this.nodesById[id];
                if (
                    (node.status === 1 ||
                    node.status === 2) &&
                    node.children.every(child => child.status !== 1 && child.status !== 2)
                ) {
                    values.push(id);
                }
            }
        }
        return values;
    };

    onLoaded(){
        this.collapseAll();
        this.decorateNodes();
        if(this.afterInit && typeof this.afterInit === "function") this.afterInit.bind(this)();
    }

    removeCheckboxes(){
        let container_div = document.querySelector(this.container);
        container_div.querySelectorAll(".treejs-checkbox").forEach((span) => {
            if(this.isCheckboxDisabled()){
                span.style.display = "none";
            }
        })
    }

    isCheckboxDisabled() {
        return !this.selection;
    }

    addKeyValueLabel(liElement, key, value) {
        let label = liElement.querySelector("span.treejs-label");
        label.innerHTML = "";
        let keySpan = document.createElement("span")
        keySpan.className = "key"
        let valueSpan = document.createElement("span")
        valueSpan.className = "value"
        keySpan.innerText = key + ": ";
        valueSpan.innerText = value;
        label.append(keySpan, valueSpan)
    }

    decorateNodes(){
        for (let id of Object.keys(this.liElementsById)){
            let liElement = this.liElementsById[id];
            let node = this.nodesById[id];
            if(!node) {
                console.log("Node not found for ID:" , id)
                continue;
            }
            if(!liElement.querySelector("span.treejs-label>span.key") && node.attributes?.key !== undefined){
            // if(!liElement.querySelector("span.treejs-label>span.key") && !node?.parent?.attributes?.isGetter){
                this.addKeyValueLabel(liElement, node.attributes.key, node.attributes.value)
            }
            // let iconSpan = liElement.querySelector(".treejs-icons");
            // if(!iconSpan){
            //     iconSpan = document.createElement("span");
            //     iconSpan.className = "treejs-icons";
            //     let checkbox = liElement.querySelector(".treejs-checkbox")
            //     checkbox.after(iconSpan);
            // }
            // if(node.attributes.isObject){
            //     // let folderIcon = document.getElementById("folderIcon").cloneNode(true);
            //     // folderIcon.setAttribute('id', '');
            //     // folderIcon.style.display = '';
            //     // iconSpan.append(folderIcon);
            // }
            // if(!node.attributes.isObject){ // && !liElement.querySelector("svg.file-icon")
            //     // let fileIcon = document.getElementById("fileIcon").cloneNode(true);
            //     // fileIcon.setAttribute('id', '');
            //     // fileIcon.style.display = '';
            //     // iconSpan.append(fileIcon);
            // }
        }
        this.removeCheckboxes()
    }

    // Override Tree bindEvent to disable checkboxes (https://github.com/daweilv/treejs/blob/master/src/index.js)
    bindEvent(ele) {
        ele.addEventListener(
            'click',
            this.onTreeClick.bind(this),
            false
        );
    };

    onTreeClick(e) {
        const {target} = e;
        if (
            target.nodeName === 'SPAN' &&
            (target.classList.contains('treejs-checkbox') ||
                target.classList.contains('treejs-label'))
        ) {
            const id = target.parentNode.nodeId;
            if(!this.isCheckboxDisabled()) this.onItemClick(id);
        } else if (
            target.nodeName === 'LI' &&
            target.classList.contains('treejs-node')
        ) {
            const id = target.nodeId;
            if(!this.isCheckboxDisabled()) this.onItemClick(id);
        } else if (
            target.nodeName === 'SPAN' &&
            target.classList.contains('treejs-switcher')
        ) {
            this.onSwitcherClick(target);
        }
    }

    addValueListener(callback){
        this.eventListeners.value.push(callback);
    }

    removeValueListener(callback){
        this.eventListeners.value.splice(this.eventListeners.value.indexOf(callback), 1)
    }

    addSwitchListener(callback){
        this.eventListeners.switcher.push(callback);
    }

    removeSwitchListener(callback){
        this.eventListeners.switcher.splice(this.eventListeners.switcher.indexOf(callback), 1)
    }

    static isObject(text){
        return text === "{...}" || text === "{ }" ||
            text === "[...]" || text === "[ ]" ||
            text.match(/<.*[...]>/gm);
        // Parsing HTML is bad (https://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags)
        // Be careful not to summon Cthulhu
    }

    static _build_tree(objTree, currentPosition=""){
        let tree_root = [];
        // do {
        //     console.log("Building tree from: ", currentPosition, "objTree: ", objTree ,"(", objTree.constructor?.name,")")
            for (let node of Object.getOwnPropertyNames(objTree)) {
                if(node === "__proto__") continue;
                // for(let node of Object.keys(objTree)){
                const currentNode = currentPosition !== "" ? currentPosition + "." + node : node;
                let text = node;
                let key = node;
                let value;
                if(Object.getOwnPropertyDescriptor(objTree, key).get !== undefined) {
                    text = text + ": (...)";
                    value = "get (...)"
                }else if (typeof objTree[node] === "object" || objTree[node] === "{...}" || objTree[node] === "[...]") {
                    if (objTree[node] !== "{...}" && objTree[node] !== "{ }" && (Array.isArray(objTree[node]) || objTree[node] === "[...]" || objTree[node] === "[ ]")) {
                        if ((Array.isArray(objTree[node]) && objTree[node].length === 0) || objTree[node] === "[ ]") {
                            text = text + ": [ ]";
                            value = "[ ]"
                        } else {
                            text = text + ": [...]";
                            value = "[...]"
                        }
                    } else {
                        if (objTree[node] instanceof HTMLElement) {
                            text = text + ": <" + objTree[node].tagName.toLowerCase() + "...>"
                            value = "<" + objTree[node].tagName.toLowerCase() + "...>"
                        } else if (node !== "__proto__" && Object.keys(objTree[node]).length === 0) {
                            text = text + ": { }";
                            value = "{ }"
                        } else {
                            text = text + ": {...}";
                            value = "{...}"
                        }
                    }
                } else if (typeof objTree[node] === "function") {
                    text = text + ": " + objTree[node].toString()
                    value = objTree[node].toString()
                } else {
                    text = text + ": " + objTree[node]
                    value = objTree[node]
                }
                let item = {
                    id: currentNode,
                    text,
                };
                if(Object.getOwnPropertyDescriptor(objTree, key).get !== undefined) {
                    item.children = [{id: "get", text: ""}]; // dummy children object
                    item.attributes = {isObject: true, isGetter: true, key, value}//, getter: Object.getOwnPropertyDescriptor(objTree, key).get};
                } else if (typeof objTree[node] === "string") {
                    item.children = [];
                    item.attributes = {isObject: ObjectTreeHTML.isObject(objTree[node]), isGetter: false, key, value}
                } else if (node !== "__proto__" && typeof objTree[node] === "object") {
                    item.children = ObjectTreeHTML._build_tree(objTree[node], currentNode)
                    item.attributes = {isObject: true, isGetter: false, key, value};
                } else {
                    item.attributes = {isObject: false, isGetter: false, key, value};
                }
                tree_root.push(item);
            }
        // } while(objTree.constructor.name !== "Object" && (objTree = Object.getPrototypeOf(objTree)) && objTree !== true)
        return tree_root;
    }


}

class ObjectTreePanel extends HTMLNode{
    static DEFAULT_CONFIGURATION = {
        container: undefined,
        treeObject: undefined,
        defaultTree: undefined, // For not awaiting in constructor
        selection: false,
        multiple: false,
        eventListeners: {
            switcher: [],
            value: []
        },
        afterInit: () => {},
    }
    // constructor(container, jsTree, root, selection=true) {
    constructor(configuration= ObjectTreePanel.DEFAULT_CONFIGURATION) {
        configuration = {...ObjectTreePanel.DEFAULT_CONFIGURATION, ...configuration}
        let content = new ObjectTreeHTML(configuration);
        let container = document.querySelector(configuration.container)
        super({content, container})
    }

    disableReloadOnExpand(){
        this.content.reloadNode = async () => {}
    }

    // static async getFSTree(rootPath){
    //     let jsTree = await FileManagerAPI.getFSTree(rootPath, 2)
    //     let root = Object.keys(jsTree)[0]
    //     jsTree = jsTree[root]
    //     return {jsTree, root};
    // }
    // static async getJSTree(inspected){ // inspected: <?> extends ObjectTreeUtils
    //     let jsTree = await inspected.getTree(2)
    //     let root = Object.keys(jsTree)[0]
    //     jsTree = jsTree[root]
    //     return {jsTree, root};
    // }
}

class ObjectTreeUtils {

    constructor(root){
        this.type = this.constructor.name;
        this.root = root;
    }
    async getTree(expressionPath, depth){
        // Given an expression path returns object Properties/Fields/Attributes at given depth from evaluated root
        // Override in extending classes
    }
}

// async function createWorkspaceFSTree(elementID, afterInit){
//     let {jsTree, root} = await ObjectTreePanel.getFSTree(selectedWorkspacePath);
//     return new ObjectTreePanel({
//             container: "#" + elementID,
//             jsTree,
//             root,\
//             selection: true,
//             multiple: false,
//             afterInit
//         })
//     // return new ObjectTreePanel("#" + elementID, jsTree, root, true)
// }
//
// async function createModuleFSTree(elementID, path, includes, excludes, forceFSTree=null, configuration, afterInit) {
//     let jsTree, root;
//     if(forceFSTree === null) {
//         let getFSTree = async function(){
//             let jsTree = await FileManagerAPI.getFSTreeGLOB(path, includes, excludes);
//             let root = Object.keys(jsTree)[0]
//             jsTree = jsTree[root]
//             return {jsTree, root};
//         }
//
//         forceFSTree = await getFSTree(path, includes, excludes);
//         // {jsTree, root} = await getFSTree(path, includes, excludes); // for what reason this should not work?
//     }
//     jsTree = forceFSTree.jsTree;
//     root = forceFSTree.root;
//
//     let fileSystemTree = new ObjectTreePanel({
//         container: "#" + elementID,
//         jsTree,
//         root,
//         ...configuration,
//         afterInit
//     });
//
//     fileSystemTree.disableReloadOnExpand();
//     return {fileSystemTree, jsTree}
//     // return new ObjectTreePanel("#" + elementID, jsTree, root, true)
// }
//
// async function createFilePickerFSTree(elementID, root, multiple, files, folders, afterInit){
//     let tree = await ObjectTreePanel.getFSTree(root);
//     return new ObjectTreePanel({
//         container: "#" + elementID,
//         jsTree: tree.jsTree,
//         root: tree.root,
//         selection: true,
//         multiple: multiple,
//         afterInit
//     })
//     // return new ObjectTreePanel("#" + elementID, jsTree, root, true)
// }
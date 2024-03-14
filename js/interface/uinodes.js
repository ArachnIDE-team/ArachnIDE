


class WindowedUI extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        title: "",
        content: undefined,
        scaleProportions: undefined,
    }
    // constructor(title, content, scaleProportions) {
    constructor(configuration = WindowedUI.DEFAULT_CONFIGURATION) {
        configuration = {...WindowedUI.DEFAULT_CONFIGURATION, ...configuration};
        super({title: configuration.title, content: [configuration.content], pos: pan, scale: (zoom.mag2() ** settings.zoomContentExp), intrinsicScale: 1, addFullScreenButton: false, addCollapseButton: false, addSettingsButton: false });
        htmlnodes_parent.appendChild(this.content);
        registernode(this);
        WindowedNode.makeContentScrollable(this.innerContent, true)
        this._initialize(configuration.scaleProportions)
    }

    _initialize(scaleProportions){
        this.anchorForce = 1;
        this.toggleWindowAnchored(true);
        // this.windowDiv.style.maxWidth = window.innerWidth * scaleProportions.x + "px";
        // this.windowDiv.style.width = window.innerWidth * scaleProportions.x + "px";
        // this.windowDiv.style.maxHeight = window.innerHeight * scaleProportions.y + "px";
        // this.windowDiv.style.height = window.innerHeight * scaleProportions.y + "px";
        this.setMinSize(420)

        this.afterInit();
    }
    draw() {
        if(this.pos.x < 0) this.pos.x = 0;
        if(this.pos.y < 0) this.pos.y = 0;
        super.draw();
    }
    afterInit(){
        this.recenter()
    }
    recenter() {
        this.anchor = pan;
        this.pos = pan;
    }
    save() {
        return null;
    }
}

class FilePicker extends WindowedUI {
    static DEFAULT_CONFIGURATION = {
        title: "",
        home: "",
        onSelect:() => {},
        pickFolder: true,
    }
    // constructor(title='', home='', onSelect=() => {}, pickFolder=true) {
    constructor(configuration= FilePicker.DEFAULT_CONFIGURATION) {
        super({title: configuration.title ? configuration.title : "Pick a " + configuration.pickFolder ? "folder" : "file", content: FilePicker._getContentElement(configuration.home),scaleProportions:  new vec2(0.8,0.8)});
        this.innerContent.style.width = "100%";
        this.pickFolder = configuration.pickFolder;
        this.onSelect = configuration.onSelect;
    }
    static _getContentElement(home){
        let content = document.createElement("div");
        WindowedNode.makeContentScrollable(content);
        let pathBarContainer = document.createElement("div");
        pathBarContainer.style.display = "flex";

        let rootPathInput = document.createElement("input");
        rootPathInput.type = "text";
        rootPathInput.style.marginBottom = "5px";
        rootPathInput.value = home;
        rootPathInput.id = "rootPathInput";
        pathBarContainer.append(rootPathInput);

        let rootPathButton = document.createElement("button");
        rootPathButton.style.marginBottom = "5px";
        rootPathButton.innerText = "GO";
        rootPathButton.className = "linkbuttons";
        rootPathButton.id = "rootPathButton";

        pathBarContainer.append(rootPathButton);
        content.append(pathBarContainer)

        let fsNodeContainer = document.createElement("div");
        WindowedNode.makeContentScrollable(fsNodeContainer);
        fsNodeContainer.id = "fsNodeContainer"
        content.append(fsNodeContainer)

        return content;
    }
    afterInit() {
        super.afterInit();
        let rootPathButton = this.innerContent.querySelector("#rootPathButton");
        rootPathButton.addEventListener("click", this.fetchFSNodes.bind(this))
        this.fetchFSNodes();
    }
    fetchFSNodes(){
        let fsNodeContainer = this.innerContent.querySelector("#fsNodeContainer");
        let rootPathInput = this.innerContent.querySelector("#rootPathInput");
        this.home = rootPathInput.value.replace(/^[A-Z][:]\/[.][.]$/g, "");
        FileManagerAPI.getFSTree(this.home, 1).then((fsTree) => {
            let rootKey = Object.keys(fsTree)[0];
            rootPathInput.value = rootKey;
            this.home = rootKey;
            // console.log("FS TREE: ", fsTree, "root key: ", rootKey);
            fsNodeContainer.innerHTML = "";
            if(this.home !== ""){
                fsNodeContainer.append(this.getFSNodeLine("DIR", ".."));
                fsNodeContainer.append(this.getFSNodeLine("DIR", "."));
            }
            for(let node of Object.keys(fsTree[rootKey])){
                let nodeElement = this.getFSNodeLine(fsTree[rootKey][node], node);

                fsNodeContainer.append(nodeElement)
            }
        })
    }
    getFSNodeLine(type, node){
        let nodeElement = document.createElement("div")
        if(type === "DIR"){
            nodeElement.innerHTML = "&#128193; ";
        }else{
            nodeElement.innerHTML = "&#128195; "
        }
        nodeElement.innerHTML += node;
        nodeElement.style.margin = "10px"
        nodeElement.style.padding = "3px"
        WindowedNode.makeContentScrollable(nodeElement)
        nodeElement.style.backgroundColor = "rgb(31,31,31)";

        let selectButton = document.createElement("button");
        selectButton.className = "linkbuttons select-button";
        if (this.pickFolder && type !== "DIR") selectButton.disabled = true;
        selectButton.style.marginRight = "5px";
        selectButton.innerText = "select";
        nodeElement.prepend(selectButton)

        selectButton.addEventListener("click", (event) => {
            this.onSelect(this._getUpdatedPath(node));
            this.onDelete();
            cancel(event);
        });
        nodeElement.addEventListener("click", (e) => {
            if(e.target.tagName.toLowerCase() !== 'button'){
                this.innerContent.querySelector("#rootPathInput").value = this._getUpdatedPath(node);
                this.fetchFSNodes();
            };
        });
        return nodeElement
    }

    _getUpdatedPath(node) {
        return this.innerContent.querySelector("#rootPathInput").value + (this.home.endsWith("/") || this.home === "" ? "" : "/") + node + (this.home === "" ? "/" : "");
    }
}

let wn1 = new FilePicker({title: "Choose the workspace folder", home: ".", onSelect: (node) => {console.log("SELECTED", node);}})

//
// function testNode(a,b,c) {
//     let content3 = document.createElement("textarea");
//     content3.classList.add('custom-scrollbar', 'node-textarea');
//     content3.setAttribute("type", "text");
//     content3.setAttribute("size", "11");
//     //n.setAttribute("style", "background-color: #222226; color: #bbb; overflow-y: scroll; resize: both; width: 259px; line-height: 1.4; display: none;");
//     content3.style.position = "absolute";
//     let wn3 = new WindowedNode("UI", [content3], pan, 4*(zoom.mag2() ** settings.zoomContentExp), 1);
//     htmlnodes_parent.appendChild(wn3.content);
//     registernode(wn32)
// }
// function testNode(scale) {
//     let content3 = document.createElement("textarea");
//     content3.classList.add('custom-scrollbar', 'node-textarea');
//     content3.setAttribute("type", "text");
//     content3.setAttribute("size", "11");
//     content3.value = "blablabla";
//     //n.setAttribute("style", "background-color: #222226; color: #bbb; overflow-y: scroll; resize: both; width: 259px; line-height: 1.4; display: none;");
//     content3.style.position = "absolute";
//     let wn3 = new WindowedNode("UI", [content3], pan, scale*(zoom.mag2() ** settings.zoomContentExp), 1);
//     htmlnodes_parent.appendChild(wn3.content);
//     registernode(wn3)
//     wn3.anchorForce = 1
//     wn3.content.style.left = window.innerWidth * 0.1 + "px";
//     wn3.content.style.top = window.innerHeight * 0.1 + "px";
//     wn3.windowDiv.style.maxWidth = window.innerWidth * 0.8 + "px";
//     wn3.windowDiv.style.width = window.innerWidth * 0.8 + "px";
//     wn3.windowDiv.style.height = window.innerHeight * 0.8 + "px";
//     return wn3;
// }
// function testNode() {
//     let content3 = document.createElement("textarea");
//     content3.classList.add('custom-scrollbar', 'node-textarea');
//     content3.setAttribute("type", "text");
//     content3.setAttribute("size", "11");
//     content3.value = "blablabla";
//     //n.setAttribute("style", "background-color: #222226; color: #bbb; overflow-y: scroll; resize: both; width: 259px; line-height: 1.4; display: none;");
//     content3.style.position = "absolute";
//     let wn3 = new WindowedUI("UI", content3, new vec2(0.8, 0.8));
//     return wn3;
// }
// let wn1 = new FilePicker("Choose the workspace folder")

// class FileSystemTree extends Tree{
//     constructor(container, fsTree) {
//         const treeData = FileSystemTree._build_tree(fsTree);
//         let configuration = {
//             data: treeData,
//             loaded: function() {
//                 // this.patcher = patcher;
//                 // this.patcher.drawDiff2Html = this.drawDiff2Html.bind(this);
//                 // this.patcher.afterPatchChanged = this.afterPatchChanged.bind(this);
//                 // this.filePatcherUiById = {};
//                 // this.collapseAll();
//                 // this.decorateNodes();
//             }
//         }
//         super(container, configuration);
//
//     }
//     decorateNodes(){
//         let container_div = $(this.container)[0];
//         let root_button_div = document.createElement("div");
//         root_button_div.className = "treejs-root_button_panel";
//         let root_patch_button = document.createElement("button");
//         root_patch_button.className = "patch_button detailvalue_warn"
//         root_patch_button.innerHTML = "&#x1FA79; apply all patches";
//         root_patch_button.style.display = 'none';
//         let patcher = this.patcher
//         root_patch_button.onclick = function(){
//             patcher.apply_patches("/");
//         }
//         root_button_div.append(root_patch_button)
//         container_div.prepend(root_button_div);
//
//         let node_elements = this.liElementsById;
//         let node_ids = Object.keys(node_elements)
//         for(let node_id of node_ids){
//             let is_directory_in_line_patches = this.patcher.is_directory_in_line_patches(node_id);
//             let node_element = node_elements[node_id];
//             let node = this.nodesById[node_id];
//             let label = $(node_element).children(".treejs-label")[0];
//             if(node.attributes.isDeleted) label.className += " treejs-label-deleted"
//             if(node.attributes.isNew) label.className += " treejs-label-new"
//             let button_panel = document.createElement("span");
//
//             let add_to_gitignore_button = document.createElement("button");
//             add_to_gitignore_button.className = "add_to_gitignore_button detailvalue_ignore"
//             add_to_gitignore_button.innerHTML = "&#x21CE;"
//             if(is_directory_in_line_patches) add_to_gitignore_button.style.display = 'none';
//
//             let tooltip = document.createElement("span")
//             tooltip.className = "white_text";
//             tooltip.innerHTML = "add to .gitignore";
//             $(add_to_gitignore_button).tooltip({title:tooltip.outerHTML, html: true})
//             button_panel.append(add_to_gitignore_button);
//             let space_panel = document.createElement("span")
//             space_panel.innerHTML = "&emsp;";
//             let icon = document.createElement("span");
//             icon.className = "treejs-icon";
//             icon.onclick = () => {label.click()};
//             if(node.children.length > 0){
//                 // Directory
//                 icon.innerHTML = " &#x1F4C1; " //open
//                 // icon.innerHTML = " &#x1F4C2; " //close
//
//                 let downgrade_button = document.createElement("button");
//                 downgrade_button.className = "downgrade_button detailvalue_error"
//                 downgrade_button.innerHTML = "&#129088; keep";
//                 let patcher = this.patcher;
//                 downgrade_button.onclick = function () {
//                     patcher.add_directory_patch('keep', node_id, {})
//                 }
//                 if(is_directory_in_line_patches) downgrade_button.style.display = 'none';
//                 button_panel.append(downgrade_button);
//
//                 let update_button = document.createElement("button");
//                 update_button.className = "update_button detailvalue_success"
//                 update_button.innerHTML = "update &#129094;";
//                 update_button.onclick = function () {
//                     patcher.add_directory_patch('update', node_id, {})
//                 }
//                 if(is_directory_in_line_patches) update_button.style.display = 'none';
//                 button_panel.append(update_button);
//
//                 let patch_button = document.createElement("button");
//                 patch_button.className = "patch_button detailvalue_warn"
//                 patch_button.innerHTML = "&#x1FA79; apply patch";
//                 patch_button.onclick = function () {
//                     let patcher = this.patcher
//                     patch_button.onclick = function(){
//                         patcher.apply_patches(node_id);
//                     }
//                 }
//                 if(!is_directory_in_line_patches) patch_button.style.display = 'none';
//                 button_panel.append(patch_button);
//
//             }else{
//                 // file
//                 icon.innerHTML = " &#x1F4CB; "
//             }
//             node_element.insertBefore(icon, label)
//             node_element.insertBefore(button_panel, label.nextSibling)
//             node_element.insertBefore(space_panel, button_panel)
//
//         }
//     }
//     refreshFSTreeButtons(){
//         let container_div = $(this.container)[0];
//         let root_button_div = container_div.getElementsByClassName("treejs-root_button_panel")[0];
//         let root_patch_button = root_button_div.getElementsByClassName("patch_button")[0]
//         if(this.patcher.patches.length > 0){
//             root_patch_button.style.display = 'none';
//         }else{
//             root_patch_button.style.display = '';
//         }
//         let node_elements = this.liElementsById;
//         let node_ids = Object.keys(node_elements)
//         for(let node_id of node_ids){
//             let node_element = node_elements[node_id];
//             let node = this.nodesById[node_id];
//             let label = $(node_element).children(".treejs-label")[0];
//             let add_to_gitignore_button = node_element.getElementsByClassName("add_to_gitignore_button")[0];
//             if(node.children.length > 0){
//                 // Directory
//                 let is_directory_in_line_patches = this.patcher.is_directory_in_line_patches(node_id);
//                 let downgrade_button = node_element.getElementsByClassName("downgrade_button")[0];
//                 let update_button = node_element.getElementsByClassName("update_button")[0];
//                 let patch_button = node_element.getElementsByClassName("patch_button")[0];
//                 if(is_directory_in_line_patches){
//                     add_to_gitignore_button.style.display = 'none';
//                     downgrade_button.style.display = 'none';
//                     update_button.style.display = 'none';
//                     patch_button.style.display = '';
//                     if(!label.className.includes("detailvalue_warn")){
//                         label.className += " detailvalue_warn";
//                     }
//                 } else {
//                     add_to_gitignore_button.style.display = '';
//                     downgrade_button.style.display = '';
//                     update_button.style.display = '';
//                     patch_button.style.display = 'none';
//                     if(label.className.includes("detailvalue_warn")){
//                         label.className = label.className.replace("detailvalue_warn","");
//                     }
//                 }
//
//             }else{
//                 // file
//                 let is_file_in_line_patches = this.patcher.is_file_in_line_patches(node_id);
//                 if(is_file_in_line_patches){
//                     add_to_gitignore_button.style.display = '';
//                 } else {
//                     add_to_gitignore_button.style.display = 'none';
//                 }
//             }
//         }
//     }
//     afterPatchChanged(patched_files){
//         let node_elements = this.liElementsById;
//         for(let patched_file of patched_files){
//             let node_element = node_elements[patched_file];
//             let label = $(node_element).children(".treejs-label")[0];
//             let filePatcherUi = this.filePatcherUiById[patched_file];
//             let icon = $(node_element).children(".treejs-icon")[0];
//             if(filePatcherUi){
//                 // remove keep update buttons
//                 filePatcherUi.refreshFileButtons();
//                 filePatcherUi.refreshLineButtons();
//             }
//             // set yellow background on label
//             if(!label.className.includes("detailvalue_warn")){
//                 label.className += " detailvalue_warn";
//             }
//         }
//         this.refreshFSTreeButtons();
//     }
//     redrawIcon(node_id){
//         let node_elements = this.liElementsById;
//         let node = this.nodesById[node_id];
//         let node_element = node_elements[node_id];
//         let icon = $(node_element).children(".treejs-icon")[0];
//         if(!icon) return;
//         if(node.children.length > 0){
//             // Directory
//             if(node_element.className.includes("treejs-node__close")){
//                 icon.innerHTML = " &#x1F4C2; "
//             }else{
//                 icon.innerHTML = " &#x1F4C1; "
//             }
//         }else{
//             // File
//             let li = this.liElementsById[node_id];
//             if(li.className.includes("treejs-node__checked")){
//                 icon.innerHTML = " &#x274C; "
//             }else{
//                 icon.innerHTML = " &#x1F4CB; "
//             }
//
//         }
//     }
//     idByElement(element){
//         let node_elements = this.liElementsById;
//         let node_ids = Object.keys(node_elements)
//         for(let node_id of node_ids){
//             let node_element = node_elements[node_id];
//             if(node_element === element){
//                 return node_id;
//             }
//         }
//         return null;
//     }
//     drawDiff2Html(node_id){
//         let diff_container = document.createElement("div");
//         let diff_line = document.createElement('li');
//         diff_line.className = "treejs-node treejs-placeholder treejs-diff2html"
//         diff_container.innerHTML = "";
//         const configuration = {
//             drawFileList: false,
//             fileListToggle: false,
//             fileListStartVisible: false,
//             fileContentToggle:false,
//             outputFormat: 'side-by-side',
//             highlight: true,
//             matching: 'lines',
//         };//, highlight: true
//         this.filePatcherUiById[node_id] = new FilePatcherUi(this.patcher, node_id, diff_container, configuration);
//         diff_line.append(diff_container);
//         let node =  this.liElementsById[node_id];
//         let diff2Html = node.nextSibling;
//         if(diff2Html && diff2Html.className.includes("treejs-diff2html")){
//             diff2Html.replaceWith(diff_line)
//         }else{
//             node.after(diff_line)
//         }
//     }
//     hideDiff2Html(node_id){
//         if(this.filePatcherUiById.hasOwnProperty(node_id)){
//             let diff2Html = this.filePatcherUiById[node_id];
//             diff2Html.targetElement.parentElement.outerHTML = "";
//             delete this.filePatcherUiById[node_id]
//         }
//
//     }
//     onItemClick(node_id){
//         // console.log("Clicked on id:", node_id)
//         let node = this.nodesById[node_id];
//         if(node.children.length > 0){
//             // Directory
//             let li = this.liElementsById[node_id];
//             let switcher = $(li).children(".treejs-switcher")[0];
//             this.onSwitcherClick(switcher)
//             // Tree.prototype.onSwitcherClicked.bind(this).call(this, switcher)
//             // this.redrawIcon(node_id);
//         }else{
//             // file
//             Tree.prototype.onItemClick.bind(this).call(this, node_id)
//             let li = this.liElementsById[node_id];
//             if(li.className.includes("treejs-node__checked")){
//                 this.drawDiff2Html(node_id)
//             }else{
//                 this.hideDiff2Html(node_id)
//             }
//             this.redrawIcon(node_id);
//
//         }
//     }
//     getChild(directory_id){
//         let node_elements = this.liElementsById;
//         let node_ids = Object.keys(node_elements);
//         return node_ids.filter(function (node_id) {
//             return node_id.startsWith(directory_id)
//         });
//     }
//     onSwitcherClick(element){
//         // console.log("onSwitcherClick", element);
//         let node_id = this.idByElement(element.parentNode);
//         for(let sub_node_id of this.getChild(node_id)){
//             if(this.filePatcherUiById.hasOwnProperty(sub_node_id)){
//                 // this.hideDiff2Html(sub_node_id);
//                 // this.redrawIcon(sub_node_id);
//                 this.onItemClick(sub_node_id);
//             }
//         }
//         Tree.prototype.onSwitcherClick.bind(this).call(this, element);
//         this.redrawIcon(node_id);
//     }
//     static _split_path(directory){
//         let split = [];
//         let parsed = path.parse(directory);
//         while(parsed.dir !== "/"){
//             split.push(parsed)
//             parsed = path.parse(parsed.dir);
//         }
//         split.push(parsed)
//         split.reverse()
//         return split;
//     }
//     static _build_tree(fsTree){
//         let tree_root = [];
//         let node = tree_root;
//         for(let node of Object.keys(fsTree)){
//             let position = difference.id;
//             node = tree_root;
//             let split_position = FileSystemTree._split_path(position);
//             for(let parsed_position of split_position){
//                 let item = {
//                     id: path.join(parsed_position.dir, parsed_position.base),
//                     text:  parsed_position.base,
//                     attributes: {
//                         isNew: difference.isNew,
//                         isDeleted: difference.isDeleted
//                     },
//                     children: [],
//                 };
//                 let duplicates = node.filter(function(element){
//                     return element.id === item.id;
//                 });
//                 if(duplicates.length > 0){
//                     node = duplicates[0].children;
//                 }else{
//                     node.push(item)
//                     node = item.children;
//                 }
//             }
//         }
//         return tree_root;
//     }
// }

class Tool {
    constructor(name, codePath, descPath) {
        this.name = name;
        this.codePath = codePath;
        this.code = null;
        this.downloadedCode = false;
        this.descriptionPath = descPath;
        this.description = null;
        this.downloadedDescription = false;
    }
    async downloadDescription() {
        this.description = JSON.parse((await FileManagerAPI.loadFile(this.descriptionPath)).content)
        this.downloadedDescription = true;
    }
    async downloadCode() {
        if(this.code === null){
            let importPath = path.relative( 'H:/projects/ChrysalIDE/js/dropdown/tabs', this.codePath)
            this.code = (await import(importPath  /*  @vite-ignore */)).default
            // Becomes:
            // import { injectQuery as __vite__injectQuery } from "/@vite/client";
            // let Tool = (await import(__vite__injectQuery(importPath, 'import'))).default
        }
        let codeTool = new this.code()

        this.downloadedCode = true;
    }
}

// Keeps track of downloaded tools
class ToolsBox {

    constructor() {
        this.tools = [];
    }

    addTool(tool) {
        this.tools.push(tool);
    }

    removeTool(tool) {

    }
    hasTool(tool) {
        return this.tools.includes(tool)
    }
    getToolByDescriptionPath(descriptionPath) {
        for (let tool of this.tools) {
            if(tool.descriptionPath === descriptionPath) {
                return tool;
            }
        }
        return -1;
    }
}

class ToolsTab {
    constructor() {
        this.toolTreeContainerId = "tool-tree-container";
        this.toolTreeContainer = document.getElementById(this.toolTreeContainerId);
        this.tree = null;
        this.selectedTool = null;
        this.toolBox = new ToolsBox();;
        this.descriptionContainer = document.createElement("div");
        document.addEventListener('DOMContentLoaded', this.updateTreeContainer.bind(this));
    }

    updateTreeContainer(){
        this.moduleNode = new ModulePanel({name: "tools", sources: {dir: "../../tools", includes:["**/**.json"]}})
        this.toolTreeContainer.append(this.moduleNode.container)
        this.moduleNode.reloadModule(() => {
            this.moduleNode.content.headerContainer.innerText = "Available tools: (" + this.moduleNode.sources.files.length + ")"
            this.moduleNode.content.moduleContainer.querySelector(".metadata-container").remove();
            dropdown.toolsTab.moduleNode.content.moduleContainer.append(this.descriptionContainer);
            let descriptionFiles = Array.from(Object.keys(this.moduleNode.content.fileSystemTree.content.leafNodesById))
            for (let descriptionFile of descriptionFiles) {
                let label = this.moduleNode.content.fileSystemTree.content.liElementsById[descriptionFile].querySelector("span.treejs-label");
                if (label.innerText.endsWith(".json")) {
                    label.setAttribute("data-file-name", descriptionFile);
                    let toolName = label.innerText.substr(0, label.innerText.length - ".json".length);
                    label.innerText = toolName
                    let codePath = descriptionFile.substr(0, descriptionFile.length - ".json".length) + ".js";
                    this.toolBox.addTool(new Tool(toolName, codePath, descriptionFile));
                    // label.style.color = "red";
                }
            }
            let footerPanels = this.moduleNode.content.footerContainer.children;//.querySelectorAll("button.footer-button");
            footerPanels[0].innerHTML = footerPanels[1].innerHTML = "";
            this._createToolButtons(footerPanels)
            this.moduleNode.content.fileSystemTree.addValueListener(this.onToolSelectionChange.bind(this))
        });
    }

    _createToolButtons(footerPanels) {
        let useToolButton = document.createElement("button");
        useToolButton.innerText = "Use"
        useToolButton.className = "footer-button"
        useToolButton.onclick = this.onUseToolButtonClick.bind(this)
        useToolButton.setAttribute("disabled", "")
        footerPanels[0].append(useToolButton)
        // let downloadToolButton = document.createElement("button");
        // downloadToolButton.innerText = "Download"
        // downloadToolButton.className = "footer-button"
        // downloadToolButton.setAttribute("disabled", "")
        // footerPanels[1].append(downloadToolButton)
        this.useToolButton = useToolButton;
        // this.downloadToolButton = downloadToolButton;
    }

    onToolSelectionChange(selection) {
        console.log("ToolsTab, changed tool selection: ", selection);
        if(selection.length === 0) {
            this.useToolButton.setAttribute("disabled", "");
            // this.downloadToolButton.setAttribute("disabled", "");
            this.descriptionContainer.innerText = "";
            this.selectedTool = null;
        } else {
            this.useToolButton.removeAttribute("disabled");
            // this.downloadToolButton.removeAttribute("disabled");

            this.selectedTool = this.toolBox.getToolByDescriptionPath(selection[0]);
            this.selectedTool.downloadDescription().then(() => {
                let selectedLiElement = this.moduleNode.content.fileSystemTree.content.liElementsById[selection[0]]
                // selectedLiElement.querySelector("span.treejs-label").style.color = "yellow";
                this.descriptionContainer.innerText = "";
                for (let key of Object.keys(this.selectedTool.description)) {
                    this.descriptionContainer.innerText += key + ": " + this.selectedTool.description[key] + "\n"
                }
            })
        }
    }

    onUseToolButtonClick() {
        if(this.selectedTool === null) return;
        this.selectedTool.downloadCode();
    }
}


window.ToolsTab = ToolsTab;
window.ToolsBox = ToolsBox;
window.Tool = Tool;
// export default {ToolsTab, ToolsBox, Tool}
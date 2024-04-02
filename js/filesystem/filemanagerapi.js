

class FileManagerAPI {

    static async loadWorkspaces(){
       return await (await fetch("http://localhost:7000/workspaces")).json();
    }

    // savenet & loadnet
    static async loadWorkspace(name){
        return await (await fetch("http://localhost:7000/workspace?name=" + encodeURIComponent(name))).json()
    }

    static async saveWorkspace(name, diagram){
        return await fetch("http://localhost:7000/workspace", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                diagram: diagram
            })
        });
    }

    static async createWorkspace(name, folder, diagram){
        let body = {
            name,
            folder,
            diagram
        };
        // console.log("Sending body: ", body)
        return await fetch("http://localhost:7000/workspaces", {
            method: "PUT",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(body)
        });
    }

    static async deleteWorkspace(name, soft=true){
        return await fetch("http://localhost:7000/workspace?name=" + encodeURIComponent(name) + "&soft=" + soft, {
            method: "DELETE",
            headers: {
                "content-type": "application/json"
            }
        });
    }

    // FilePicker > WindowedUI
    // FileSystemTree > HTMLNode
    static async getFSTree(root, depth=1){
        return await (await fetch("http://localhost:7000/fs-tree?path=" + encodeURIComponent(root) + "&depth=" + depth)).json()
    }

    // FileSystemTree > HTMLNode
    static async getFSTreeGLOB(path, includes, excludes){
        return await (await fetch("http://localhost:7000/fs-tree", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({path, includes, excludes})
        })).json()
    }

    // WorkspaceExplorerNode
    static async loadFile(filePath){
        return await (await fetch("http://localhost:7000/read-file?path=" + encodeURIComponent(filePath))).json()
    }
    static async loadBinary(filePath){
        const blob = await (await fetch("http://localhost:7000/read-binary?path=" + encodeURIComponent(filePath))).blob();
        blob.name = path.basename(filePath);
        return blob;
    }

    // NodeFilesUI
    static async saveFile(filePath, fileContent){
        return await (await fetch("http://localhost:7000/write-file",{
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                path: filePath,
                content: fileContent
            })
        })).json()
    }
    static async saveBinary(filePath, fileContent) {
        if(typeof fileContent === "string") fileContent = new Blob([fileContent], {type: 'text/plain'});
        if(!(fileContent instanceof Blob) && typeof fileContent === "object") fileContent = new Blob([JSON.stringify(fileContent)], {type: 'application/json'});
        const formData = new FormData();
        formData.append('path', filePath); // Add text parameter
        formData.append('file', fileContent, filePath); // Add file content and filename

        return await fetch("http://localhost:7000/write-binary", { // Update endpoint to match server-side setup
            method: "POST",
            body: formData
        }).then(response => response.json());
    }

    static addFileToAutoSave(node, fileObject, batchTime=4000) {
        let autoSaveFile = {
            timeout: null,
            node,
            key: fileObject.key,
            path: fileObject.path,
            batchTime
        };
        autoSaveFile.saveToFile = function() {
            if(this.timeout) clearTimeout(this.timeout)
            this.timeout = setTimeout(() => this.node.savePropertyToFile(this.key, this.path), this.batchTime)
        }.bind(autoSaveFile);
        autoSavedFiles.push(autoSaveFile);
        node.observeProperty(fileObject.key, autoSaveFile.saveToFile)
    }
    static removeFileFromAutoSave(node, fileObject){
        let removeIndex = autoSavedFiles.findIndex((autoSavedFile) => autoSavedFile.node === node);
        if(removeIndex !== -1) {
            let autoSaveFile = autoSavedFiles[removeIndex];
            node.stopObservingProperty(fileObject.key, autoSaveFile.saveToFile);
            autoSavedFiles.splice(removeIndex, 1);
        }
    }
    static async addFileToAutoLoad(node, fileObject, batchTime=4000) {
        const observer = {
            path: fileObject.path,
            key: fileObject.key,
            create: true,
            batchTime
        };
        observer.load = function() {
            node.loadPropertyFromFile(fileObject.key, fileObject.path);
        }
        autoLoadedFiles.push(observer) // Setup on open connection
        if(autoLoadWebsocket.readyState === 1) autoLoadWebsocket.send(JSON.stringify(observer));
    }

    static removeFileFromAutoLoad(node, fileObject){
        const cancelObserver = {
            path: fileObject.path,
            key: fileObject.key,
            remove: true
        };
        if(autoLoadWebsocket.readyState === 1){
            autoLoadWebsocket.send(JSON.stringify(cancelObserver));
        } else {
            // Remove from the list of restored autoLoadedFiles
            let deadObserver =  autoLoadedFiles.findIndex((autoLoadedFile) => autoLoadedFile.key === cancelObserver.key && autoLoadedFile.path === cancelObserver.path);
            if(deadObserver !== -1) autoLoadedFiles.splice(deadObserver, 1)
        }
    }
    static clearAutoFiles(){
        for (let autoSavedFile of autoSavedFiles){
            autoSavedFile.node.stopObservingProperty(autoSavedFile.key, autoSavedFile.saveToFile);
        }
        autoSavedFiles = [];
        for(let autoLoadedFile of autoLoadedFiles){
            const cancelObserver = {
                path: autoLoadedFile.path,
                key: autoLoadedFile.key,
                remove: true
            };
            autoLoadWebsocket.send(JSON.stringify(cancelObserver));
        }
        autoLoadedFiles = [];
    }
}

window.getFSTree = async function (root, depth=1) {
    return (await FileManagerAPI.getFSTree(root, depth))[root]
}


class AutoLoadWebsocket extends WebSocket{

    constructor() {
        super('ws://localhost:7000');
        super.onopen = this.onopen.bind(this);
        super.onmessage = this.onmessage.bind(this);
        super.onclose = this.onclose.bind(this);
        super.onerror = this.onerror.bind(this);

    }
    onopen(event) {
        // reload autoLoadedFiles server-side
        for (let autoLoadedFile of autoLoadedFiles) {
            this.send(JSON.stringify(autoLoadedFile));
        }
    }

    onmessage(event) {
        let observer = JSON.parse(event.data);
        console.log("Observer:", observer)
        if(observer.contentUpdate) {
            for (let autoLoadedFile of autoLoadedFiles) {
                // console.log("autoLoadedFile: ", autoLoadedFile, " observer: ", observer)
                if (autoLoadedFile.path === observer.path) {
                    autoLoadedFile.load()
                }
            }
        } else if(observer.remove) {
            let deadObserver = autoLoadedFiles.findIndex((autoLoadedFile) => autoLoadedFile.key === observer.key && autoLoadedFile.path === observer.path);
            if(deadObserver !== -1) autoLoadedFiles.splice(deadObserver, 1)
        }
    }

    onclose(event) {
        console.log('Socket is closed. Reconnect will be attempted in 10 second.', event.reason);
        setTimeout(function() {
            connectAutoLoadWebsocket();
        }, 10000);
    }

    onerror(err) {
        console.error('Socket encountered error: ', err.message, 'Closing socket');
        autoLoadWebsocket.close();
    }

    startLoad(path, batchTime){
        const observer = {
            path,
            create: true,
            batchTime,
            callback
        };
        autoLoadedFiles.push(observer)
        this.send(JSON.stringify(observer));

    }
}


globalThis.autoSavedFiles = [];

globalThis.autoLoadedFiles = [];

globalThis.autoLoadWebsocket = null;

function connectAutoLoadWebsocket() {
    autoLoadWebsocket = new AutoLoadWebsocket();
}

connectAutoLoadWebsocket()
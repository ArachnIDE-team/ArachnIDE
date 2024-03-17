const express = require('express');
const cors = require('cors');
const fs = require('./fsNode')
const path = require('path')
const app = express();
const { v4: uuidv4 } = require('uuid');


app.use(cors());
app.use(express.json({ limit: '10mb' }));

let workspacesJSONFile = new fs.Node("../../workspaces.json");
if(!workspacesJSONFile.exists) workspacesJSONFile.content = "{}";
console.log("Startup filemanager: ", JSON.parse(workspacesJSONFile.content));

function initializeWorkspaceFolder(folder, diagram) {
    let workspaceID = uuidv4();
    let workspaceExternalFolder = new fs.Node(path.join(folder, ".neurIDE." + workspaceID));
    workspaceExternalFolder.mkdir();
    let workspaceJSONFile = new fs.Node(path.join(workspaceExternalFolder.path,  "neurIDE.workspace.json"));
    let folderNode = new fs.Node(folder);
    workspaceJSONFile.content = JSON.stringify({rootFolder: folderNode.path, id: workspaceID, diagram}, null, 2)
    return workspaceJSONFile.path;
}

// get all workspaces
app.get('/workspaces', async (req, res) => {
    res.send(workspacesJSONFile.content);
});

// add a new workspace
app.put('/workspaces', (req, res) => {
    const { name, folder, diagram } = req.body;
    let workspaces = JSON.parse(workspacesJSONFile.content);
    if(Object.keys(workspaces).includes(name)){
        console.error('Error PUT workspaces: the workspace already exists');
        return res.status(409).send("Error while adding a new workspace '" + name +"' already exists");
    }
    workspaces[name] = initializeWorkspaceFolder(folder, diagram);
    workspacesJSONFile.content = JSON.stringify(workspaces, null, 2);
    res.send();
});

app.delete('/workspace', async (req, res) => {
    let { name, soft } = req.query;
    soft = soft === "true";
    let workspaces = JSON.parse(workspacesJSONFile.content);

    if(!Object.keys(workspaces).includes(name)){
        console.error('Error DELETE workspaces: the workspace does not exists');
        return res.status(404).send("Error while deleting a workspace '" + name +"' does exists");
    }
    if(!soft) {
        let workspaceFile = new fs.Node(workspaces[name]);
        if (!workspaceFile.isFile) {
            console.error('Error DELETE workspace: the workspace does not exists');
            return res.status(404).send("Error while deleting a workspace '" + name +"' does not exists");
        }
        let workspaceFolder = workspaceFile.parent;
        console.log("Hard delete workspace:", name, "at directory", workspaceFolder.path)
        await workspaceFolder.delete()
    }else{
        console.log("Soft delete workspace:", name)

    }
    delete workspaces[name];
    workspacesJSONFile.content = JSON.stringify(workspaces, null, 2);
    res.send();
});

app.get('/workspace', (req, res) => {
    const { name } = req.query;
    let workspaces = JSON.parse(workspacesJSONFile.content);
    if(!Object.keys(workspaces).includes(name)){
        console.error('Error GET workspace: the workspace does not exists');
        return res.status(404).send("Error while getting a workspace '" + name +"' does not exists");
    }
    let workspaceFile = new fs.Node(workspaces[name]);
    if (!workspaceFile.isFile) {
        console.error('Error GET workspace: the workspace does not exists');
        return res.status(404).send("Error while getting a workspace '" + name +"' does not exists");
    }
    res.send(workspaceFile.content)
});
app.post('/workspace', (req, res) => {
    const { name, diagram } = req.body;
    let workspaces = JSON.parse(workspacesJSONFile.content);
    if(!Object.keys(workspaces).includes(name)){
        console.error('Error POST workspace: the workspace does not exists');
        return res.status(404).send("Error while saving a workspace '" + name +"' does not exists");
    }
    let workspaceFile = new fs.Node(workspaces[name]);
    if (!workspaceFile.isFile) {
        console.error('Error POST workspace: the workspace does not exists');
        return res.status(404).send("Error while getting a workspace '" + name +"' does not exists");
    }
    let workspace = JSON.parse(workspaceFile.content);
    workspace.diagram = diagram;
    workspaceFile.content = JSON.stringify(workspace);
    res.send()
})

app.get('/fs-tree', async (req, res) => {
    try {
        const folderPath = req.query.path;
        const depth = req.query.depth;
        let fsNode = new fs.Node(folderPath)
        if(!fsNode.exists) {
            console.error('Error GET fs-tree: the directory does not exist');
            return res.status(404).send("Error getting the filesystem tree, directory '" + folderPath +"' not found");
        }
        let response = {};
        response[fsNode.path] = await fsNode.getFSTree(depth)
        res.send(response);
    } catch (error) {
        console.error('Error GET fs-tree:', error);
        res.status(500).send('Error GET fs-tree');
    }

});

app.get('/read-file', async (req, res) => {
    try {
        const filePath = req.query.path;
        let fsNode = new fs.Node(filePath);

        if(!fsNode.exists) {
            console.error('Error GET read-file: the file does not exist');
            return res.status(404).send("Error getting the file: '" + filePath +"' not found");
        }
        if(!fsNode.isFile){
            console.error('Error GET read-file: the file is not a file. It is a directory.');
            return res.status(404).send("Error getting the file: '" + filePath +"' is a directory");
        }
        let response = {
            ...fsNode,
            content: fsNode.content
        }
        res.send(response);
    } catch (error) {
        console.error('Error GET fs-tree:', error);
        res.status(500).send('Error GET fs-tree');
    }
});


app.post('/write-file', (req, res) => {
    const filePath = req.body.path;
    const fileContent = req.body.content;
    let file = new fs.Node(filePath);
    file.content = fileContent;
    res.send({message: "success"})
})



let autoLoadedFiles = [];

// app.get('/file-observer', async (req, res) => {
//     try {
//         const filePath = req.query.path;
//         let fsNode = new fs.Node(filePath);
//
//         if(!fsNode.exists) {
//             console.error('Error GET file-observer: the file does not exist');
//             return res.status(404).send("Error getting the file: '" + filePath +"' not found");
//         }
//         if(!fsNode.isFile){
//             console.error('Error GET file-observer: the file is not a file. It is a directory.');
//             return res.status(404).send("Error getting the file: '" + filePath +"' is a directory");
//         }
//         let fileObserver = {
//             path: fsNode.path,
//             id: autoLoadedFiles.length
//         }
//         autoLoadedFiles.push(fileObserver)
//         res.send(fileObserver);
//     } catch (error) {
//         console.error('Error GET file-observer:', error);
//         res.status(500).send('Error GET file-observer');
//     }
// });


// Start the server
const PORT = process.env.PORT || 7000;
let server = app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});


var WebSocketServer = require('websocket').server;
// File change observer websocket
fileObserverWebsocket = new WebSocketServer({
    httpServer: server
});


fileObserverWebsocket.on('request', function(request) {
    var connection = request.accept(null, request.origin);
    connection.on('message', function(message) {
        console.log('Received a message: ' + message.utf8Data);
        let observer = JSON.parse(message.utf8Data);
        let fsNode = new fs.Node(observer.path);
        if(observer.create){
            let fileObserver = {
                path: fsNode.path,
                key: observer.key
            }
            autoLoadedFiles.push(fileObserver)
            connection.sendUTF(JSON.stringify(fileObserver));
            fileObserver.onchange = function() {
                console.log("Observed a change:", fsNode.path)
                this.contentUpdate = true;
                connection.sendUTF(JSON.stringify(this));
            }.bind(fileObserver);
            fsNode.watch(fileObserver.onchange)
            console.log("START observing file: ", fsNode.path)
        } else if(observer.remove){
            let fileObserver = autoLoadedFiles.find((autoLoadedFile) => autoLoadedFile.path === observer.path && autoLoadedFile.key === observer.key);
            if(fileObserver) {
                fsNode.unwatchFile(fileObserver.onchange);
                console.log("STOP observing file: ", fsNode.path)
            }
            connection.sendUTF(JSON.stringify(observer)); // Send it back for front-end removal
        }



        // connection.sendBytes(message.binaryData);
    });
    connection.on('close', function(connection) {
        console.log("Connection closed, closing", autoLoadedFiles )
        for(let autoLoadedFile of autoLoadedFiles) {
            let fsNode = new fs.Node(autoLoadedFile.path);
            fsNode.unwatchFile(autoLoadedFile.onchange);
        }
        autoLoadedFiles = [];
    });
});
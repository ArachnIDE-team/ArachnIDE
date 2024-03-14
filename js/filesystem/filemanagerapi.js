

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
    static async getFSTree(root, depth=1){
        return await (await fetch("http://localhost:7000/fs-tree?path=" + encodeURIComponent(root) + "&depth=" + depth)).json()
    }
}

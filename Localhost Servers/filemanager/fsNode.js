import fs from 'fs'
import path from 'path'
import drivelist from 'drivelist';
import mime from 'mime';



fs.DIRECTORY = "DIR"
fs.FILE = "FILE"
fs.NONE = "NONE"

fs.Node = function(filepath) {
    this.path =  filepath === "" ? filepath : path.resolve(path.normalize(filepath)).replace(/\\/g,"/");
    this.name = path.basename(this.path);
    if(this.name === "" && this.path !== "") this.name = this.path.replace(/\//g, "");
    this.ext = path.extname(this.path);
    // this.exists = fs.existsSync(this.path);
    // if(this.exists){
    //     this.type = fs.lstatSync(this.path).isDirectory() ? fs.DIRECTORY : fs.FILE;
    // }else{
    //     this.type = fs.NONE;
    // }
}

let proto = fs.Node.prototype;



Object.defineProperty(proto, "exists", {
    get: function () {
        return this.path === "" || fs.existsSync(this.path);
    }
});

Object.defineProperty(proto, "type", {
    get: function () {
        if(this.exists){
            return this.path === "" || fs.lstatSync(this.path).isDirectory() ? fs.DIRECTORY : fs.FILE;
        }else{
            return fs.NONE;
        }
    }
});
Object.defineProperty(proto, "contentType", {
    get: function () {
       if(this.isFile) return mime.getType(this.path);
       if(!this.exists) return "none"
       return "folder"
    }
});

Object.defineProperty(proto, "isDirectory", {
    get: function () {
        if(this.exists){
            return this.path === "" || fs.lstatSync(this.path).isDirectory();
        }else{
            return false;
        }
    }
});
Object.defineProperty(proto, "isFile", {
    get: function () {
        if(this.exists){
            return this.path !== "" && !fs.lstatSync(this.path).isDirectory();
        }else{
            return false;
        }
    }
});
Object.defineProperty(proto, "isNone", {
    get: function () {
        return !this.exists
    }
});

Object.defineProperty(proto, "children", {
    get: function() {
        if (this.isDirectory){
            if(this.path === "") return drivelist.list().then((drives) => {
                console.log("DRIVELIST: ", drivelist)
                let mountpoints = []
                for (let drive of drives){
                    mountpoints.push(...drive.mountpoints.map((mountpoint) => new fs.Node(mountpoint.path)));
                }
                console.log("MOUNTPOINTS: ", mountpoints)
                return mountpoints;
            });// Return promise
            return [...fs.readdirSync(this.path).map(children => new fs.Node(path.join(this.path, children)))];
        }
        return [];
    }
});


Object.defineProperty(proto, "parent", {
    get: function() {
        let dirname = path.dirname(this.path);
        if (dirname === this.path) return this;
        return new fs.Node(dirname);
    }
});

Object.defineProperty(proto, "content", {
    get: function() {
        if(this.isFile){
            return fs.readFileSync(this.path, "utf8");
        }
        return null;
    },
    set: function(content){
        if(!this.isDirectory){
            fs.writeFileSync(this.path, content, "utf8")
            return true;
        }
        return false;
    }

});
Object.defineProperty(proto, "binary", {
    get: function() {
        if(this.isFile){
            return fs.readFileSync(this.path);
        }
        return null;
    },
    set: function(content){
        if(!this.isDirectory){
            fs.writeFileSync(this.path, content)
            return true;
        }
        return false;
    }

});



proto.getFSTree = async function(depth, tree = {}) {
    if (this.isDirectory) {
        if (depth === 0) return "DIR";

        for(let childNode of (await this.children)){
            tree[childNode.name] = await childNode.getFSTree( depth - 1);
        }
        if (Object.keys(tree).length === 0) {
            tree = "DIR";
        }
    } else {
        if (depth === 0) return "FILE";
        tree = "FILE";
    }

    return tree;
}

proto.mkdir = function() {
    return fs.mkdirSync(this.path);
}
proto.delete = async function () {
    if (this.isDirectory) {
        for (let childNode of (await this.children)){
            await childNode.delete()
        }
        fs.rmdirSync(this.path);
    } else if (this.isFile) {
        fs.rmSync(this.path);
    }
}
proto.watch = function (callback){
    if (this.isDirectory) {
        fs.watch(this.path, callback);
    } else {
        fs.watchFile(this.path, callback);
    }
}
proto.unwatchFile = function (callback){
    if (this.isFile) {
        fs.unwatchFile(this.path, callback);
    }
}

fs.Node.chunkPath = function(dirOrFile){
    let array = [];
    // dirOrFile = new fs.Node(dirOrFile).path;
    while (!dirOrFile.startsWith(".")){//path.join(dirOrFile, "..") ){
        // console.log(dirOrFile)
        array.push(path.basename(dirOrFile));
        dirOrFile = path.join(dirOrFile, "..")
    }
    return array.reverse();
}
fs.Node.toFSTree = function(root, array){
    let response = {};
    response[root] = {};
    for(let dirOrFilePath of array){
        let pathChunks = fs.Node.chunkPath(dirOrFilePath);
        let dirOrFile = new fs.Node(path.join(root, dirOrFilePath))
        let responseCursor = response[root];
        let i = 0;
        for(let chunk of pathChunks){
            if(!responseCursor.hasOwnProperty(chunk)) {
                if(i === pathChunks.length - 1) {
                    responseCursor[chunk] = dirOrFile.isFile ? "FILE" : "DIR";
                } else {
                    responseCursor[chunk] = {};
                }
            } else if (responseCursor[chunk] === "DIR") {
                responseCursor[chunk] = {};
            }
            responseCursor = responseCursor[chunk];
            i++;
        }
    }
    return response;
}

export default fs;
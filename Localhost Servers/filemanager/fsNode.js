const fs = require('fs')
const path = require('path')
const drivelist = require('drivelist');

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
module.exports = fs;
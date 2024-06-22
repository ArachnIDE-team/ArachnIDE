

class AudioNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        audioUrl: "",
        blob: undefined,
        sx: undefined,
        sy: undefined,
        x: undefined,
        y: undefined,
        saved: undefined,
        saveData: undefined
    }
    static SAVE_PROPERTIES = ['audioUrl', 'audioBlob'];
    // constructor(name = '', content = undefined, imageSrc = '', sx = undefined, sy = undefined, x = undefined, y = undefined, isUrl = false){
    static INTERFACE_CONFIGURATION = {
        insertable: true,
        iconID: "audio-icon-symbol",
        name: "Audio Node",
        defaultFavourite: -1
    }

    constructor(configuration = AudioNode.DEFAULT_CONFIGURATION){
        configuration = {...AudioNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.content = AudioNode._getContentElement(configuration.audioUrl, configuration.blob);
        if (!configuration.saved) {// Create AudioNode
            super({...configuration, title: configuration.name, ...WindowedNode.getNaturalScaleParameters() });
            this.followingMouse = 1;
        } else {// Restore AudioNode
            configuration.audioUrl = configuration.saveData.json.audioUrl;
            super({...configuration, title: configuration.name, scale: true})
        }

        this.diagram.addNode(this);
        this._initialize(configuration.audioUrl, configuration.blob, configuration.saved);
    }

    get audioBlob() {
        return this._audioBlob;
    }

    set audioBlob(v) {
        if(v === null || !(v instanceof Blob)) return;
        if(this.initialized){
            this.audioUrl = URL.createObjectURL(v);
            this._audioBlob = v;
            this.innerContent.querySelector("audio[src]").src = this.audioUrl
        } else {
            this.addAfterInitCallback(() => {
                this.audioUrl = URL.createObjectURL(v);
                this._audioBlob = v;
                this.innerContent.querySelector("audio[src]").src = this.audioUrl
            })
        }
    }

    setMainContentFile(filePath, fileName){
        this.files.push({ key: "audioBlob", path: filePath, name: fileName, autoLoad: false, autoSave: false})
    }

    static _getContentElement(url, blob){
        if(!url) url = URL.createObjectURL(blob);
        const audio = new Audio();
        audio.setAttribute("controls", "");
        //let c = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        //c.setAttribute("viewBox","0 0 128 64");
        //let name = document.createElementNS("http://www.w3.org/2000/svg","text");
        //name.setAttribute("x","0");name.setAttribute("y","0");
        //name.appendChild(document.createTextNode(files[i].name));
        //c.appendChild(name);
        audio.style = "display: block";
        //div.appendChild(c);
        audio.src = url;
        return [ audio ];
    }

    _initialize(audioUrl, blob, saved){
        this.draw();
        if(!saved){
            if(audioUrl) {
                this.audioUrl = audioUrl;
                fetch(this.audioUrl).then(response =>
                    response.blob().then((extracted) =>
                        this._audioBlob = extracted));
            } else {
                this.audioUrl = this.innerContent.querySelector("audio[src]").src
                this._audioBlob = blob;
            }
        }

        this.mouseAnchor = this.diagram.background.toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));
        this.afterInit();
    }

    afterInit() {
        super.afterInit();
    }

    static ondrop() {
        new MediaInput({
            title:"Add audio node",
            message: "Enter a link, the file path or drop an audio file:",
            image: false,
            audio: true,
            video: false,
            onConfirm: (audioUrl) => {
                if (audioUrl) {
                    if(isUrl(audioUrl)) {
                        let node = createAudioNode(audioUrl, undefined, audioUrl);
                        node.followingMouse = 1;
                        node.mouseAnchor = node.diagram.background.toDZ(new vec2(0, -node.content.offsetHeight / 2 + 6));
                    } else {
                        FileManagerAPI.loadBinary(audioUrl).then((file) => {
                            createNodesFromFiles([file], (node) => {
                                node.setMainContentFile(audioUrl, audioUrl);
                                node.followingMouse = 1;
                                node.mouseAnchor = node.diagram.background.toDZ(new vec2(0, -node.content.offsetHeight / 2 + 6));
                            })
                        });

                    }

                }
            }})
    }

}

function createAudioNode(name, blob=undefined, url=undefined){
    const configuration = {
        name: name,
    };
    if(blob) configuration.blob = blob
    if(url)  configuration.audioUrl = url;
    return new AudioNode(configuration)
}

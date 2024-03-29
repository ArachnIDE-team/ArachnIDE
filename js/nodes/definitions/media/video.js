
class VideoNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        videoUrl: "",
        blob: undefined,
        sx: undefined,
        sy: undefined,
        x: undefined,
        y: undefined,
        saved: undefined,
        saveData: undefined,
    }
    static SAVE_PROPERTIES = ['videoUrl', 'videoBlob'];//, 'videoBlob'
    // constructor(name = '', content = undefined, imageSrc = '', sx = undefined, sy = undefined, x = undefined, y = undefined, isUrl = false){


    constructor(configuration = VideoNode.DEFAULT_CONFIGURATION){
        configuration = {...VideoNode.DEFAULT_CONFIGURATION, ...configuration}
        if (!configuration.saved) {// Create VideoNode
            super({ title: configuration.name, content: VideoNode._getContentElement(configuration.videoUrl, configuration.blob), ...WindowedNode.getNaturalScaleParameters() });
            this.followingMouse = 1;
        } else {// Restore VideoNode
            // configuration.videoUrl = configuration.saveData.json.videoUrl;
            super({ title: configuration.name, content: VideoNode._getContentElement(configuration.videoUrl, configuration.blob), scale: true, saved: true, saveData: configuration.saveData })
        }

        htmlnodes_parent.appendChild(this.content);
        registernode(this);
        this._initialize(configuration.videoUrl, configuration.blob, configuration.saved);
    }


    get videoBlob() {
        return this._videoBlob;
    }

    set videoBlob(v) {
        if(v === null || !(v instanceof Blob)) return;
        if(this.initialized){
            this.videoUrl = URL.createObjectURL(v);
            this._videoBlob = v;
            this.innerContent.querySelector("video[src]").src = this.videoUrl
            this.innerContent.querySelector("a[href]").href = this.videoUrl
        } else {
            this.addAfterInitCallback(() => {
                this.videoUrl = URL.createObjectURL(v);
                this._videoBlob = v;
                this.innerContent.querySelector("video[src]").src = this.videoUrl
                this.innerContent.querySelector("a[href]").href = this.videoUrl
            })
        }
    }

    setMainContentFile(filePath, fileName){
        this.files.push({ key: "videoBlob", path: filePath, name: fileName, autoLoad: false, autoSave: false})
    }

    static _getContentElement(url, blob){
        if(!url && blob) url = URL.createObjectURL(blob);
        if(!url) url = "";
        // Create a video element to play the blob
        const video = document.createElement('video');
        video.src = url;
        video.controls = true;
        video.style.width = '800px';  // Adjust as needed
        video.style.height = 'auto';  // This will maintain aspect ratio

        // Create a download link for the video
        const videoDownloadLink = document.createElement('a');
        videoDownloadLink.href = url;
        videoDownloadLink.download = "chrysaliderecord.webm";

        // Set fixed width and height for the button to create a square around the SVG
        videoDownloadLink.style.width = "40px";  // Width of the SVG + some padding
        videoDownloadLink.style.height = "40px";
        videoDownloadLink.style.display = "flex";  // Use flexbox to center the SVG
        videoDownloadLink.style.alignItems = "center";
        videoDownloadLink.style.justifyContent = "center";
        videoDownloadLink.style.borderRadius = "5px";  // Optional rounded corners
        videoDownloadLink.style.transition = "background-color 0.2s";  // Smooth transition for hover and active states
        videoDownloadLink.style.cursor = "pointer";  // Indicate it's clickable

        // Handle hover and active states using inline event listeners
        videoDownloadLink.onmouseover = function () {
            this.style.backgroundColor = "#e6e6e6";  // Lighter color on hover
        }
        videoDownloadLink.onmouseout = function () {
            this.style.backgroundColor = "";  // Reset on mouse out
        }
        videoDownloadLink.onmousedown = function () {
            this.style.backgroundColor = "#cccccc";  // Middle color on click (mousedown)
        }
        videoDownloadLink.onmouseup = function () {
            this.style.backgroundColor = "#e6e6e6";  // Back to hover color on mouse release
        }

        // Clone the SVG from the HTML
        const downloadSVG = document.querySelector('#download-icon').cloneNode(true);
        downloadSVG.style.display = "inline";  // Make the cloned SVG visible

        // Append the SVG to the download link and set link styles
        videoDownloadLink.appendChild(downloadSVG);
        videoDownloadLink.style.textDecoration = "none"; // to remove underline
        videoDownloadLink.style.color = "#000";  // Set color for SVG

        // Update the content array to include both the video and download link
        return [video, videoDownloadLink];
    }


    _initialize(videoUrl, blob, saved){
        this.draw();
        if(!saved){
            if(videoUrl) {
                this.videoUrl = videoUrl;
                fetch(this.videoUrl).then(response =>
                    response.blob().then((extracted) =>
                        this._videoBlob = extracted));
            } else {
                this.videoUrl = this.innerContent.querySelector("video[src]").src
                this._videoBlob = blob;
            }
        }
        this.mouseAnchor = background.toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));
        this.afterInit();
    }

    afterInit() {
        super.afterInit();
    }

}

function createVideoNode(name, blob=undefined, url=undefined){
    const configuration = {
        name: name,
    };
    if(blob) configuration.blob = blob
    if(url)  configuration.videoUrl = url;
    return new VideoNode(configuration)
}

function loadScript(src, onload, onerror) {
    let script = document.createElement('script');
    let errorHandler = (event) => {
        console.log("Error while laoading :", src, " error: ", event)
        event.preventDefault();
    };

    script.onload = onload ? onload : function(e) {
        console.log(e.target.src + ' is loaded.');
        removeEventListener("error", errorHandler);
    };
    script.async = false;
    document.currentScript.parentNode.insertBefore(
        script,
        document.currentScript,
    );
    addEventListener("error", errorHandler);
    script.src = src;
}
document.addEventListener("DOMContentLoaded", () => {
    let scripts = document.body.getElementsByTagName("script");
    let srcs = [];
    for(let script of scripts){
        if(script !== document.createElement) srcs.push(script.src)
    }
    console.log(srcs)
    loadScript("js/nodes/diagram.js");// (e) => console.log("loaded diagrams.js ###########", e),(e) => console.log("Error while loading diagrams ###############", e))
})
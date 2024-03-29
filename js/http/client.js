
class HTTPWorkerController {
    constructor() {
        this.worker = new Worker("js/http/worker.js");
        this.oldFetch = fetch;
        fetch = (...args) => {
            return this.fetch(...args)
        }
    }
    fetch(...args){
        return new Promise(function(resolve, reject){
            this.worker.postMessage(JSON.stringify(...args));
            this.worker.onmessage = function(event) {
                // console.log("TERMINATED GET ")
                resolve(event.data);
            };
            this.worker.onerror = function(error) {
                console.log("HTTPWorkerController error:", error.message);
                reject(error)
            };
        }.bind(this))
    }
}
// Auto-manages override of the fetch method
new HTTPWorkerController();
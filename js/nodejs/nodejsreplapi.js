// Remote execute Node.js in websocket




class NodeREPLWebsocket extends WebSocket {

    constructor() {
        super('ws://localhost:2000');
        this.runtimes = {};
        super.onopen = this.onopen.bind(this);
        super.onmessage = this.onmessage.bind(this);
        super.onclose = this.onclose.bind(this);
        super.onerror = this.onerror.bind(this);
        this.creationCallback = null;
        this.evaluationCallback = null;
    }

    onopen(event) {
        console.log('Node.js REPL Socket is connected');
    }

    createREPLRuntime(creationCallback=null) {
        let sendRequest = () => {
            this.send(JSON.stringify({action: "open"}))
        }

        if(creationCallback !== null) {
            if(this.creationCallback !== null) {
                // wait last creation to be completed
                let lastCreationCallback = this.creationCallback;
                this.creationCallback = (createdRuntime) => {
                    lastCreationCallback(createdRuntime);
                    this.creationCallback = creationCallback;
                    sendRequest();
                }
            } else {
                // send creation operation
                this.creationCallback = (createdRuntime) => {
                    creationCallback(createdRuntime);
                    this.creationCallback = null;
                }
                sendRequest();
            }
        } else {
            if(this.creationCallback !== null) {
                // wait last creation to be completed
                let lastCreationCallback = this.creationCallback;
                this.creationCallback = (createdRuntime) => {
                    lastCreationCallback(createdRuntime);
                    sendRequest();
                }
            } else { // No callback and not waiting, be careful with incoming requests before this one is fulfilled
                // send creation operation
                this.creationCallback = () => {
                    this.creationCallback = null;
                }
                sendRequest();
            }
        }
    }

    evalInRuntime(runtimeID, code, evaluationCallback) {
        let sendRequest = () => {
            this.runtimes[runtimeID].lines.push({type: "code", text: code})
            this.send(JSON.stringify({
                action: "eval",
                id: runtimeID,
                code,
            }));
        };
        if(evaluationCallback !== null) {
            if(this.evaluationCallback !== null) {
                // wait last creation to be completed
                let lastEvaluationCallback = this.evaluationCallback;
                this.evaluationCallback = (createdRuntime) => {
                    lastEvaluationCallback(createdRuntime);
                    this.evaluationCallback = evaluationCallback;
                    sendRequest();
                }
            } else {
                // send creation operation
                this.evaluationCallback = (createdRuntime) => {
                    evaluationCallback(createdRuntime);
                    this.evaluationCallback = null;
                }
                sendRequest();
            }
        } else {
            if(this.evaluationCallback !== null) {
                // wait last creation to be completed
                let lastEvaluationCallback = this.evaluationCallback;
                this.evaluationCallback = (createdRuntime) => {
                    lastEvaluationCallback(createdRuntime);
                    sendRequest();
                }
            } else { // No callback and not waiting, be careful with incoming requests before this one is fulfilled
                // send creation operation
                this.evaluationCallback = () => {
                    this.evaluationCallback = null;
                }
                sendRequest();
            }
        }
    }

    onmessage(event) {
        let operation = JSON.parse(event.data);
        if(operation.action === "open") {
            this.runtimes[operation.id] = {id: operation.id, lines: []};
            if(this.creationCallback !== null) this.creationCallback(this.runtimes[operation.id])
        } else if (operation.action === "eval") {
            this.runtimes[operation.id].lines.push({type: "result", text: operation.result})
            if(this.evaluationCallback !== null) this.evaluationCallback(operation.result)
        }

        console.log('Node.js REPL Socket response: ', operation)
    }

    onclose(event) {
        console.log('Node.js REPL Socket is closed. Reconnect will be attempted in 10 second.', event.reason);
        this.runtimes = {}; // Clear open sessions
        setTimeout(function() {
            connectNodeREPLWebsocket();
        }, 10000);
    }

    onerror(err) {
        console.error('Node.js REPL Socket encountered error: ', err.message, 'Closing socket');
        nodeREPLWebsocket.close();
    }
}


globalThis.nodeREPLWebsocket = null;

function connectNodeREPLWebsocket() {
    nodeREPLWebsocket = new NodeREPLWebsocket();
}

connectNodeREPLWebsocket()
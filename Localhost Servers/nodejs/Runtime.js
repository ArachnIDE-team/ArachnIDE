
import repl from 'repl';
import stream from 'stream';
import vm from 'vm';
import fs from "fs";

function readFileOrNull(filepath, fallback = null) {
    try {
        return fs.readFileSync(filepath, "utf8");
    } catch(e) {
        // do nothing
    }
    return fallback;
}


class Runtime {
    constructor(loadList=null, context=null) {
        this.console = this.initREPL(context === null);
        if(loadList !== null){
            this.loadFiles(loadList)
        }
        if(context !== null) {
            this.setContext(context);
        }
    }

    initREPL(useGlobal) {
        // Create a custom writable stream for stdin
        const customInput = new stream.Readable({
            read() {}
        });
        // Create a callback for stdout
        const customOutput = { };
        // Handle the data as needed, e.g., log it or send it to another location
        customOutput.write = this.output.bind(this);

        // Start the custom REPL with custom input and output
        return repl.start({
            prompt: 'Runtime > ',
            input: customInput,
            output: customOutput,
            // eval: customEval,
            useGlobal: useGlobal
        });
    }

    loadFiles(files){
        if(!Array.isArray(files)) files = [files];
        for(let loadFile of files){
            this.execute(readFileOrNull(loadFile))
            // this.execute(".load " + loadFile)
        }
    }
    setInContext(callback){
        this.console.context = callback(this.console.context)
    }

    setContext(context){
        this.console.context = vm.createContext(context);
    }

    execute(data, callback){//, trace=true) {
        let oldOutput = this.console.output.write;
        let lines = data.split("\n");
        lines.forEach((line, index) => {
            if(callback && index === lines.length - 1) { // Activate the callback only for the last line
                this.setOutput(function(response){
                    callback(response);
                    this.setOutput(oldOutput);
                }.bind(this))
            }
            this.console.write(line + "\n");
        });
    }

    output(data){
        console.log("Runtime output:", data.toString());
    }
    setOutput(output){
        this.console.output.write = output;
    }
}

export default Runtime;

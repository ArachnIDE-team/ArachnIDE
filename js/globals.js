window.initialProperties = Object.keys(window);
window.getNewProperties = function(){
    let newProperties = Object.keys(window).filter(property => !initialProperties.includes(property))
    let newWindow = {}
    for(let prop of newProperties){
        newWindow[prop] = window[prop];
    }
    return newWindow;
}
window.startedViaPlaywright = window.startedViaPlaywright || false;

var settings = {
    zoomSpeed: 0.0005,
    panSpeed: 1,
    zoomContentExp: 0.5,
    gestureZoomSpeed: 0.001,
    gestureRotateSpeed: Math.PI / 180,
    scroll: ('GestureEvent' in window) ? "pan" : "zoom",
    nodeModeKey: "Shift", //"CapsLock",
    nodeModeTrigger: "down", //"toggle"

    //slider adjustment
    maxLines: 128,
    renderWidthMult: 0.3, //1,
    regenDebtAdjustmentFactor: 1,

    renderStepSize: 0.1, //0.25,
    renderSteps: 16, //64,
    renderDChar: "L",
    opacity: 1,


    rotateModifier: "Alt",
    rotateModifierSpeed: Math.PI / 180 / 36,

    iterations: 256,

    //autopilotRF_Pscale:1,
    autopilotRF_Iscale: 0.5,
    //autopilotRF_Dscale:0.1,
    autopilotSpeed: 0.1,
    autopilotMaxSpeed: 0.1,

    buttonGraphics: {
        hover: ["RGB(100,100,100)", "RGB(200,200,255)"],
        click: ["RGB(70,70,70)", "RGB(100,100,100)"],
        initial: ["none", "RGB(170,170,170)"],
        focus: ["none", "RGB(200,200,255)"] // Assuming this is your focus state
    },

    maxDist: 4,
    orbitStepRate: 2,

    innerOpacity: 1,
    outerOpacity: 1
}

var flashlight_stdev = 0.25; // this is the radius of the flashlight
var flashlight_fraction = 0.73; // this is what fraction of samples are diverted to the flashlight


//interface

const overlays = [];

const autoToggleAllOverlays = () => {
    for (const overlay of overlays) {
        if (altHeld || nodeMode === 1) {
            overlay.style.display = 'block';
        } else {
            overlay.style.display = 'none';
        }
    }
};

let altHeld = false;

// Global event listeners to set the altHeld flag
document.addEventListener('keydown', function (event) {
    if (event.altKey) {
        altHeld = true;
        autoToggleAllOverlays();
        event.preventDefault();  // Prevent default behavior like focusing on the iframe
    }
});

document.addEventListener('keyup', function (event) {
    if (!event.altKey) {
        altHeld = false;
        autoToggleAllOverlays();
    }
});

window.addEventListener('message', function (event) {
    if (typeof event.data.altHeld !== 'undefined') {
        altHeld = event.data.altHeld;
        autoToggleAllOverlays();
    }
    if (typeof event.data.nodeMode !== 'undefined') {
        nodeMode = event.data.nodeMode;
    } else {
        // TO-DO: Understand why next instruction abruptly interrupt edge dragging
        // nodeMode = 0;
    }
});

var nodes = [];
var edges = [];
var nodeMode_v = 0;
var nodeMode = 0;

var movingNode = undefined;
var NodeUUID = 0;
var nodeMap = {};
var draggedNode = null;
var mousedownNode = undefined;

let htmlnodes_parent = document.getElementById("nodes");
let htmlnodes = htmlnodes_parent.children;
let htmledges = document.getElementById("edges");

//Zettelkasten

var nodeTagInput;
var refTagInput;

// Globally available variables for the tags
var nodeTag = "";
var refTag = "";

nodeTagInput = document.getElementById('node-tag');
refTagInput = document.getElementById('ref-tag');

nodeTag = nodeTagInput.value;
refTag = refTagInput.value;


// Event listeners for the input changes to keep the global variables updated
nodeTagInput.addEventListener('input', function () {
    nodeTag = nodeTagInput.value;
});

refTagInput.addEventListener('input', function () {
    refTag = refTagInput.value;
});

const LLM_TAG = "AI:";

let processAll = false;//set to true until made more robust.

let restoreZettelkastenEvent = false; 

let bypassZettelkasten = false;

const bracketsMap = {
    '(': ')',
    '[': ']',
    '{': '}',
    '<': '>',
    '((': '))',
    '[[': ']]',
    '{{': '}}',
    '<<': '>>',
    '�': '�',      // Guillemet
    '/*': '*/',
    '<!--': '-->',
    '#[': ']#',
    '<%': '%>',
    '(*': '*)',
    '`': '`',
    '```': '```',
    '${': '}',
    '|': '|'
};

const sortedBrackets = Object.keys(bracketsMap).sort((a, b) => b.length - a.length);

const getClosingBracket = (openingBracket) => {
    return bracketsMap[openingBracket];
};

const PROMPT_IDENTIFIER = "Prompt:";

//Codemirror
var textarea = document.getElementById('note-input');
var myCodeMirror = CodeMirror.fromTextArea(textarea, {
    lineWrapping: true,
    scrollbarStyle: 'simple',
    theme: 'default',
});

window.myCodemirror = myCodeMirror;

document.addEventListener("DOMContentLoaded", function() {
    // Check if CodeMirror instance exists
    if (myCodeMirror) {
        myCodeMirror.setValue('');  // Clear the content (prevents chaching on Firefox)
    }
});

//ai.js

let isBracketLinks = false;

const tagValues = {
    get nodeTag() {
        return document.getElementById("node-tag").value;
    },
    get refTag() {
        const refValue = document.getElementById("ref-tag").value;
        isBracketLinks = Object.keys(bracketsMap).includes(refValue);
        return refValue;
    }
};

// definition.js ainodemessage.js
let llmNodeCount = 0;

//ai.js and interface.js
class LRUCache {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }

    get(key) {
        const value = this.cache.get(key);
        if (value !== undefined) {
            this.cache.delete(key);
            this.cache.set(key, value);
        }
        return value;
    }

    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        this.cache.set(key, value);
    }
}

function encodeHTML(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function decodeHTML(html) {
    let txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

//editornode.js

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// tree-sitter
const Parser = window.TreeSitter;
// (async () => {
//     await Parser.init();
//     const parser = new Parser();
//     const Lang = await Parser.Language.load('tree-sitter-javascript.wasm');
//     parser.setLanguage(Lang);
//     const tree = parser.parse('let x = 1;');
//     console.log(tree.rootNode.toString());
// })();
Parser.init().then(async function (){
    window.jsParser = new Parser;
    const JavaScript = await Parser.Language.load('/js/external/tree-sitter-javascript.wasm');
    jsParser.setLanguage(JavaScript);
});

function parseJs(code){
    if(code instanceof Node) code = code.code;
    return jsParser.parse(code).rootNode;
}
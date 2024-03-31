
// Check if a string is valid JSON
function isJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

// Check if the user's message is a URL
const isUrl = (text) => {
    try {
        const url = new URL(text);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

const isIframe = (text) => {
    try {
        const doc = new DOMParser().parseFromString(text, "text/html");
        return doc.body.childNodes[0] && doc.body.childNodes[0].nodeName.toLowerCase() === 'iframe';
    } catch (_) {
        return false;
    }
}

function getIframeUrl(iframeContent) {
    // Function to extract URL from the iframe content
    // Using a simple regex to get the 'src' attribute value
    const match = iframeContent.match(/src\scale*=\scale*"([^"]+)"/);
    return match ? match[1] : null; // Return URL or null if not found
}

// WARNING: this was commented without reference
// function nodemousedown(id) {
//     if (id < nodes.length) {
//         nodes[id].mousedown();
//     }
// }
//
// function nodemouseup(id) {
//     if (id < nodes.length) {
//         nodes[id].mouseup();
//     }
// }
//
// function nodemousemove(id) {
//     if (id < nodes.length) {
//         nodes[id].mousemove();
//     }
// }
//
// function nodeclick(id) {
//     if (id < nodes.length) {
//         nodes[id].mouseclick();
//     }
// }


function cancel(event) {
    if (event.stopPropagation) {
        event.stopPropagation(); // W3C model
    } else {
        event.cancelBubble = true; // IE model
    }
}

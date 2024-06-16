//

// let textNode = createNodeFromWindow("test", "text content", false);
// textNode.files.push({"key":"text","path":"D:/Projects/ArachnIDE/samples/ztext.txt", "name":"ztext.txt","autoLoad":false,"autoSave":false})
// textNode.files.push({"key":"title","path":"D:/Projects/ArachnIDE/samples/ztext.txt", "name":"ztext.txt","autoLoad":false,"autoSave":false})
// textNode.files.push({"key":"uuid","path":"D:/Projects/ArachnIDE/samples/ztext.txt", "name":"ztext.txt","autoLoad":false,"autoSave":false})
//
// new NodeFilesUI({node: textNode});


let subd = createDiagram(1, rootDiagram);
subd.pos = rootDiagram.background.pan;
// //
// let subd2 = createDiagram(2, subd.innerDiagram);
// subd2.pos = rootDiagram.background.pan;
//
// let subd3 = createDiagram(3, subd2.innerDiagram);
// subd3.pos = subd.innerDiagram.background.pan;


// let code = "const fsTree = await getFSTree(selectedWorkspacePath + \"/js\", 5);\nfunction listFiles(tree, parent) {\n\tif(typeof tree === \"string\") return [];\n  \tlet result = [];\n  \tfor(let key of Object.keys(tree)){\n      if(typeof tree[key] === \"string\") result.push(path.join(parent, key));\n      result.push(...listFiles(tree[key], path.join(parent, key)));\n    }\n  \treturn result;\n}\n\nlet fileList = listFiles(fsTree, selectedWorkspacePath + \"/js\");\nlet fileObject = {};\nfor(let fileName of fileList){\n \tfileObject[fileName] =  (await FileManagerAPI.loadFile(fileName)).content\n}\n\nconsole.log(fileObject)\n\n\nfunction getScopeUsage(scopeFile, otherFiles){\n  let scopeCode = parseJs(scopeFile);\n  let functionDeclarations = jsParser.language.query(`\n    (program\n      (function_declaration\n        name: (identifier) @function-name))\n  `).matches(scopeCode).map((match) => match.captures[0].node.text);\n  let variableDeclarations = jsParser.language.query(`\n    (program\n      (variable_declaration\n        (variable_declarator\n          name: (identifier) @variable-name)))\n  `).matches(scopeCode).map((match) => match.captures[0].node.text);\n  \n\tconsole.log(\"Searching for function: \", functionDeclarations, \" and variables\", variableDeclarations, \"in \" + otherFiles.length + \" files\");\n  let usages = {};\n  let functions = {};\n  let variables = {};\n   // Iterate through each file in otherFiles\n  for (let fileName in otherFiles) {\n    let fileCode = otherFiles[fileName]\n    let ast = parseJs(fileCode);\n\n    // Querying variable and function usages in the current file\n    let variableUsages = jsParser.language.query(`\n      (identifier) @variable-usage\n    `).matches(ast).map((match) => match.captures[0].node.text);\n\n    let functionUsages = jsParser.language.query(`\n      (call_expression\n        function: (identifier) @function-usage)\n    `).matches(ast).map((match) => match.captures[0].node.text);\n\n    //console.log(\"File:\", fileCode);\n\n    // Check if variable usages match variable declarations\n    for (let usage of variableUsages) {\n      if (variableDeclarations.includes(usage)) {\n        if(!usages.hasOwnProperty(fileName)) usages[fileName] = {}\n        if(!usages[fileName].hasOwnProperty(\"variables\")) usages[fileName].variables = {};\n        if(!usages[fileName].variables.hasOwnProperty(usage)) usages[fileName].variables[usage] = 0;\n        usages[fileName].variables[usage]++;\n        if(!variables.hasOwnProperty(usage)) variables[usage] = {}\n        if(!variables[usage].hasOwnProperty(fileName)) variables[usage][fileName] = 0;\n        variables[usage][fileName]++;\n        console.log(\"Variable Usage:\", usage, \" in file:\", fileName);\n      }\n    }\n\n    // Check if function usages match function declarations\n    for (let usage of functionUsages) {\n      if (functionDeclarations.includes(usage)) {\n        if(!usages.hasOwnProperty(fileName)) usages[fileName] = {}\n        if(!usages[fileName].hasOwnProperty(\"functions\")) usages[fileName].functions = {};\n        if(!usages[fileName].functions.hasOwnProperty(usage)) usages[fileName].functions[usage] = 0;\n        usages[fileName].functions[usage]++;\n        if(!functions.hasOwnProperty(usage)) functions[usage] = {}\n        if(!functions[usage].hasOwnProperty(fileName)) functions[usage][fileName] = 0;\n        functions[usage][fileName]++;\n        console.log(\"Function Usage:\", usage, \" in file:\", fileName);\n      }\n    }\n  }\n  return {files: usages, variables, functions};\n}\n\n// let mandelcode = fileObject['H:/projects/ArachnIDE/js/mandelbrot/mandelbrot_v1_0_1.js'];\n// delete fileObject['H:/projects/ArachnIDE/js/mandelbrot/mandelbrot_v1_0_1.js'];\n\n// let mandelcode = fileObject['H:/projects/ArachnIDE/js/interface/interface_v2.js'];\n// delete fileObject['H:/projects/ArachnIDE/js/interface/interface_v2.js'];\n\n\nlet mandelcode = fileObject['H:/projects/ArachnIDE/js/globals.js'];\ndelete fileObject['H:/projects/ArachnIDE/js/globals.js'];\n//let otherFiles = Array.from(Object.keys(fileObject))\n//\t\t\t\t\t.filter((fileName) => !fileName.endsWith(\"mandelbrot_v1_0_1.js\"))\n//\t\t\t\t\t.map((fileName) => fileObject[fileName]);\n\nconsole.log(getScopeUsage(mandelcode, fileObject))"
// createJavascriptNode("code", code)

// ArachnIDE Module and project
// let arachnIDENode = createProjectNode("ArachnIDE", "../..")
// arachnIDENode.pos = rootDiagram.background.pan;
// arachnIDENode.followingMouse = 0;
//
let arachnIDEFrontend = createJavascriptFrontendModuleNode("Frontend", [], "../..",  ["js/**/**.js", "**/**.html"],["dist/**", "Localhost Servers/**", "Automation/**", "**/node_modules/**"])
arachnIDEFrontend.pos = rootDiagram.background.pan.plus(new vec2(1,0));
arachnIDEFrontend.followingMouse = 0;

// let genericTool = createToolNode("clone", "Clone a node")

// // Dynamic Tool import:
// let Clone = (await import('/tools/node/clone.js')).default
//
// let cloneTool = new Clone({name: "clone", description: "Clone a node"})
//
// connectDistance(cloneTool, arachnIDEFrontend)
// connectDistance(cloneTool, arachnIDENode)

// // Get node code:
// let MetaCode = (await import('/tools/node/get/metaCode.js')).default
//
// let codeTool = new MetaCode({name: "clone", description: "Clone a node"})
//
// connectDistance(codeTool, arachnIDEFrontend)
// connectDistance(codeTool, arachnIDENode)

// // Get JavascriptFrontend File Declaration Usages:
// let FileDeclarationUsages = (await import('/tools/module/javascript/frontend/fileDeclarationUsages.js')).default
//
// let codeTool = new FileDeclarationUsages()
//
// connectDistance(codeTool, arachnIDEFrontend)
// // connectDistance(codeTool, arachnIDENode)

// // Get JavascriptFrontend File merge:
// let MergedCode = (await import('/tools/module/javascript/get/mergedCode.js')).default
// let Tool = (await import("/tools/module/javascript/get/mergedCode.js")).default
//
// let codeTool = new Tool()


// // Get JavascriptFrontend File merge:
// let MergedCode = (await import('/tools/module/javascript/get/mergedCode.js')).default
// let Tool = (await import("/tools/module/javascript/frontend/get/toplevelClassDeclarations.js")).default
// // let Tool = (await import("/tools/node/get/nodeClassDeclarations.js")).default
//
// let codeTool = new Tool()
//
// connectDistance(codeTool, arachnIDEFrontend)
// connectDistance(codeTool, arachnIDENode)


// let text = createTextNode("hello", "world!")
// let text = createPythonNode("hello", "\"world!\"")
// let text = createHTMLEditorNode("hello", "<div>world!</div>")
// let text = createMarkdownNode("hello", "# World!\n\nIm proud to announce\n\n\tnothing at all!\n\n\nCodeblock: \n\n```md\n\n\\`\\`\\`html\nHello world!\n\\`\\`\\`\n```")

// Different Code languages (md + js)
// let text = createMarkdownNode("hello", "# World!\n\nIm proud to announce\n\nCodeblock: \n\n```md hello nested world\n# md 2\n\\`\\`\\`html more and more\nHello world!\n\\`\\`\\`\n```")
// let code = "this;"
// createJavascriptNode("code", code)

// globalThis.textNode = "still undefined";
// textNode = createNodeFromWindow(null, null, "simple text", true)


// Terminals
// let frontendTerminal = createJavascriptTerminalNode("Frontend terminal");
//
// let backendTerminal = createNodeJSTerminalNode("Backend terminal");

// window.llmNode = createLLMOldNode("Old LLM for testing purposes")
window.llmNode = createLLMNode("LLM for testing purposes")
window.llmNode.promptTextArea.value = "Hello there!"
// // Let's use a mutation observer to see what's going on
// const targetNode = llmNode.localLLMSelect;
// // Options for the observer (which mutations to observe)
// const config = { attributes: false, childList: true, subtree: true };
// const callback = (mutationList, observer) => {
//     for (const mutation of mutationList) {
//         if (mutation.type === "childList") {
//             console.log("A child node has been added or removed.");
//         }
//     }
// };
// // Create an observer instance linked to the callback function
// const observer = new MutationObserver(callback);
// // Start observing the target node for configured mutations
// observer.observe(targetNode, config);
// llmNode.promptTextArea.value = "Write a README.md file for the ArachnIDE project"

// llmNode.promptTextArea.value = "You are an ArachnIDE developer. ArachnIDE is a diagramming tool and IDE equipped with " +
//     "lots of generative AI features. The Edge class renders an edge connecting two Nodes. The Edge starts in the center " +
//     "of a node and ends in the center of the second node. Write the code to render a Bézier curve and North-South" +
//     " West-East lines instead of a straight line."
// llmNode.localLLMSelect.value = 'cohere:command-r-plus'
// dropdown.menuButton.dispatchEvent(new MouseEvent("click"));
//
// let textNode = createJavascriptNode("edge.js", "this", "text content", false);
// textNode.loadPropertyFromFile("code", "../../js/nodes/edge.js" )
// connectDistance(textNode, llmNode)
//
// textNode.pos.x = textNode.pos.x + 0.1
// textNode.pos.y = textNode.pos.y + 2

rootDiagram.background.pan = new vec2(-2.32, -0.65)

let simpleAgent = createLLMAgentNode( "Chat explaining Agent")
simpleAgent.promptTextArea.value =  "Given the following definition of an LLM Agent interaction with the user through a " +
    "conversation (or chat), determine the logic flow of messages and their function. For example, if the user's asks to" +
    " translate a text into another language, one flow block might be \"User prompt\": \"Translate the following text to" +
    " Italian:\nHave a nice day\", \"User prompt function\": \"The prompt is used to translate text from English to " +
    "Italian. More specifically, the first line includes the human language instruction while the following ones are " +
    "used to indicate which English sentence must be translated by the AI Assistant.\" "

let simpleAgent2 = createLLMAgentNode( "Explain Smol-dev-js Agent")
simpleAgent2.promptTextArea.value =  "How can we represent smol-dev-js using a diagram? the questions we want to answer " +
    "through the diagram are the following: what kind of blocks could we use to provide insight into the relationship " +
    "between the various interactions between machine and AI and between user and AI? What assumptions have been made to" +
    " allow the user to link functionality and code, specifications and implementation? "

let simpleAgent3 = createLLMAgentNode( "Explain Smol-dev-js Agent")
simpleAgent3.promptTextArea.value = `
    You are an assistant specialized in prompt engineering. We are designing and developing an IDE platform together.

    The uniqueness lies in the fact that this tool can be used for both text and code. We wrote this prompt together to provide a general overview of the platform. This overview is addressed to both the user and the AI (text generation model).

    In the platform, there is no distinction between a user and a developer. Unlike many companies in the sector, we consider the user as a responsible adult capable of reading programming code and assuming the risk associated with executing it.

    The IDE platform can, starting from a prompt, execute its content or perform the inverse task of extracting the intention behind the prompt. The intention or specification of the prompt is what allows us to reconstruct the prompt given a specific context. The selection of the context is the most difficult and fundamental part of the process.

    For this reason, it is possible to split the text and annotate the various parts so as to intersperse parts of a given text with "meta-information," which are data that allow us to specify the intention of the operation we are performing on the text.

    For example, thanks to this tool, it is possible to work on textual descriptions of any type of project, whether narrative, technical documentation, component lists, or simply cooking recipes.

    The platform introduces the ability to break down into "atoms" (for example, for a simple text, the choice could be between words, sentences, paragraphs, or using commas, or require a specific subdivision from the AI itself) on which to operate substitutions, improvements, dependency analyses, and relationships, etc.

    In code, the text breakdown is programmatic; thanks to its structured nature, it is much easier to perform subdivisions based on design elements such as classes in object-oriented programming.

    The process leverages the high expressiveness of diagrams: after the breakdown into "atoms," nodes and edges are used to represent the text and the relationships derived from it. From the generated diagram, it is possible to extract additional nodes, i.e., the "meta-information" or "metadata" discussed earlier, or to operate on the structure itself, on the edges, and on the nodes.
`

// let simpleAgent4 = createLLMAgentNode( "Create an SVG icon")
// simpleAgent4.promptTextArea.value =   `
// You are a developer assistant specialized in writing code that draws SVGs.
// Your method mixes writing plain SVG in xml language and JavaScript code for creating points, variables etc.
// Your task is to write the code that draws the icon the user asks for. When writing the code you should always comment
// each element you are adding to the image.
// The following example shows how you should draw:
//
// > Task: write a squared svg HTML minimalistic "Gear" icon. Do not use borders and use the color "#888"
//
// <html>
// <head>
//     <meta charset="UTF-8">
//     <title>GEAR</title>
// </head><body>
// <svg width="24" height="24" viewBox="0 0 16 16" fill="#888">
//     <path id="gearPath" d=""/>
// </svg>
// <script>
//
//     function createGearPath(x, y, radius, teeth, toothHeight) {
//         // Initialize an empty string to store the SVG path data
//         let path = '';
//
//         // Calculate the angle between each gear tooth
//         const angleStep = (2 * Math.PI) / teeth;
//
//         // Calculate the distance from the center of the gear to the base of the teeth
//         const baseRadius = radius - toothHeight;
//
//         // Start by moving to the initial point of the first tooth
//         const startX = x + radius * Math.cos(0);
//         const startY = y + radius * Math.sin(0);
//         path += \`M ${startX} ${startY}\`;
//
//         // Loop through each gear tooth
//         for (let i = 0; i < teeth; i++) {
//             // Calculate the angle for the current tooth
//             const angle = i * angleStep;
//
//             // Calculate the coordinates of the outer point of the tooth
//             const outerX = x + radius * Math.cos(angle + angleStep / teeth);
//             const outerY = y + radius * Math.sin(angle + angleStep / teeth);
//
//             // Calculate the coordinates of the first tip of the tooth
//             const tip1X = x + (radius + toothHeight) * Math.cos(angle);
//             const tip1Y = y + (radius + toothHeight) * Math.sin(angle);
//
//             // Calculate the coordinates of the inner point of the tooth
//             const innerX = x + radius * Math.cos(angle + angleStep / 2 - angleStep / teeth);
//             const innerY = y + radius * Math.sin(angle + angleStep / 2 - angleStep / teeth);
//             // Calculate the coordinates of the second tip of the tooth
//             const tip2X = x + (radius + toothHeight) * Math.cos(angle + angleStep / 2);
//             const tip2Y = y + (radius + toothHeight) * Math.sin(angle + angleStep / 2);
//
//             // Draw a line to the first tip of the tooth
//             path += \`L ${tip1X} ${tip1Y}\`;
//
//             // Draw a line to the outer point of the tooth
//             path += \`L ${outerX} ${outerY}\`;
//
//             // Draw a line to the inner point of the tooth
//             path += \`L ${innerX} ${innerY}\`;
//
//             // Draw a line to the second tip of the tooth
//             path += \`L ${tip2X} ${tip2Y}\`;
//         }
//         let i = teeth;
//         // Calculate the angle for the current tooth
//         const angle = i * angleStep;
//
//         // Calculate the coordinates of the outer point of the tooth
//         const outerX = x + radius * Math.cos(angle + angleStep / teeth);
//         const outerY = y + radius * Math.sin(angle + angleStep / teeth);
//
//         // Calculate the coordinates of the first tip of the tooth
//         const tip1X = x + (radius + toothHeight) * Math.cos(angle);
//         const tip1Y = y + (radius + toothHeight) * Math.sin(angle);
//         // Draw a line to the first tip of the tooth
//         path += \`L ${tip1X} ${tip1Y}\`;
//
//         // Draw a line to the outer point of the tooth
//         path += \`L ${outerX} ${outerY}\`;
//
//         // Close the path
//         path += 'Z';
//
//         path += \`M ${x} ${y} m ${-radius / 4} 0 a ${radius / 4} ${radius / 4} 0 1 0 ${radius / 2} 0 a ${radius / 4} ${radius / 4} 0 1 0 ${-radius / 2} 0\`;
//
//         // Return the SVG path data
//         return path;
//     }
//
//     // Example usage:
//     // const svgPath = createGearPath(16, 16, 12, 6, 2);
//     const svgPath = createGearPath(8, 8, 6, 6, 1);
//     console.log(svgPath);
//     window.onload = function () {
//         document.getElementById("gearPath").setAttribute("d", svgPath)
//     }
// </script>
// </body>
// </html>
//
// > Task: Draw a speaker icon for representing "Audio", without filling the shape, use only borders
// `


let todoNode = createMarkdownNode("ArachnIDE development TO-DO", "", "text content", false);
todoNode.loadPropertyFromFile("code", "../../TO-DO.md" )

let jsNode = createJavascriptNode("Get the root diagram", "rootDiagram", "text content", false);

let inceptionNode = createMarkdownNode("Inception prompt", zettelkastenDiagramming(), "text content", false);


// inceptionNode.addAfterInitCallback(() => {
//     inceptionNode.code += "\n\n[[Get the root diagram]]";
//     inceptionNode.code += "\n\n[[ArachnIDE development TO-DO]]\n\n";
//     inceptionNode.code += myCodemirror.getValue();
// })
// inceptionNode.code += "[[ArachnIDE development TO-DO]]";
// inceptionNode.code += "[[Get the root diagram]]";

// addEdgeToZettelkasten("ArachnIDE development TO-DO", "Inception prompt", myCodeMirror)
// addEdgeToZettelkasten("Get the root diagram", "Inception prompt", myCodeMirror)

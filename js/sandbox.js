//

// let textNode = createNodeFromWindow("test", "text content", false);
// textNode.files.push({"key":"text","path":"D:/Projects/ArachnIDE/samples/ztext.txt", "name":"ztext.txt","autoLoad":false,"autoSave":false})
// textNode.files.push({"key":"title","path":"D:/Projects/ArachnIDE/samples/ztext.txt", "name":"ztext.txt","autoLoad":false,"autoSave":false})
// textNode.files.push({"key":"uuid","path":"D:/Projects/ArachnIDE/samples/ztext.txt", "name":"ztext.txt","autoLoad":false,"autoSave":false})
//
// new NodeFilesUI({node: textNode});


// let subd = createDiagram(1, rootDiagram);
// subd.pos = rootDiagram.background.pan;
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
// let arachnIDEFrontend = createJavascriptFrontendModuleNode("Frontend", [], "../..",  ["js/**/**.js", "**/**.html"],["dist/**", "Localhost Servers/**", "Automation/**", "**/node_modules/**"])
// arachnIDEFrontend.pos = rootDiagram.background.pan.plus(new vec2(1,0));
// arachnIDEFrontend.followingMouse = 0;

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

llmNode.promptTextArea.value = "You are an ArachnIDE developer. ArachnIDE is a diagramming tool and IDE equipped with lots of generative AI features. The Edge class renders an edge connecting two Nodes. The Edge starts in the center of a node and ends in the center of the second node. Write the code to render a Bézier curve and North-South West-East lines instead of a straight line."
llmNode.localLLMSelect.value = 'cohere:command-r-plus'
dropdown.menuButton.dispatchEvent(new MouseEvent("click"));


// let textNode = createNodeFromWindow("javascript", "test", "text content", false);
let textNode = createJavascriptNode("edge.js", "this", "text content", false);
textNode.loadPropertyFromFile("code", "../../js/nodes/edge.js" )
// textNode.files.push({"key":"code", "path":"../../js/nodes/edge.js", "name":"edge.js","autoLoad":true,"autoSave":false})
// connectDistance(llmNode, textNode)
connectDistance(textNode, llmNode)

textNode.pos.x = textNode.pos.x + 0.1
textNode.pos.y = textNode.pos.y + 2
// textNode.content.querySelector("iframe").remove()

rootDiagram.background.pan = new vec2(-2.32, -0.65)

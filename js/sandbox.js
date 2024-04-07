//

// let textNode = createNodeFromWindow("test", "text content", false);
// textNode.files.push({"key":"text","path":"D:/Projects/ChrysalIDE/samples/ztext.txt", "name":"ztext.txt","autoLoad":false,"autoSave":false})
// textNode.files.push({"key":"title","path":"D:/Projects/ChrysalIDE/samples/ztext.txt", "name":"ztext.txt","autoLoad":false,"autoSave":false})
// textNode.files.push({"key":"uuid","path":"D:/Projects/ChrysalIDE/samples/ztext.txt", "name":"ztext.txt","autoLoad":false,"autoSave":false})
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


let code = "const fsTree = await getFSTree(selectedWorkspacePath + \"/js\", 5);\nfunction listFiles(tree, parent) {\n\tif(typeof tree === \"string\") return [];\n  \tlet result = [];\n  \tfor(let key of Object.keys(tree)){\n      if(typeof tree[key] === \"string\") result.push(path.join(parent, key));\n      result.push(...listFiles(tree[key], path.join(parent, key)));\n    }\n  \treturn result;\n}\n\nlet fileList = listFiles(fsTree, selectedWorkspacePath + \"/js\");\nlet fileObject = {};\nfor(let fileName of fileList){\n \tfileObject[fileName] =  (await FileManagerAPI.loadFile(fileName)).content\n}\n\nconsole.log(fileObject)\n\n\nfunction getScopeUsage(scopeFile, otherFiles){\n  let scopeCode = parseJs(scopeFile);\n  let functionDeclarations = jsParser.language.query(`\n    (program\n      (function_declaration\n        name: (identifier) @function-name))\n  `).matches(scopeCode).map((match) => match.captures[0].node.text);\n  let variableDeclarations = jsParser.language.query(`\n    (program\n      (variable_declaration\n        (variable_declarator\n          name: (identifier) @variable-name)))\n  `).matches(scopeCode).map((match) => match.captures[0].node.text);\n  \n\tconsole.log(\"Searching for function: \", functionDeclarations, \" and variables\", variableDeclarations, \"in \" + otherFiles.length + \" files\");\n  let usages = {};\n  let functions = {};\n  let variables = {};\n   // Iterate through each file in otherFiles\n  for (let fileName in otherFiles) {\n    let fileCode = otherFiles[fileName]\n    let ast = parseJs(fileCode);\n\n    // Querying variable and function usages in the current file\n    let variableUsages = jsParser.language.query(`\n      (identifier) @variable-usage\n    `).matches(ast).map((match) => match.captures[0].node.text);\n\n    let functionUsages = jsParser.language.query(`\n      (call_expression\n        function: (identifier) @function-usage)\n    `).matches(ast).map((match) => match.captures[0].node.text);\n\n    //console.log(\"File:\", fileCode);\n\n    // Check if variable usages match variable declarations\n    for (let usage of variableUsages) {\n      if (variableDeclarations.includes(usage)) {\n        if(!usages.hasOwnProperty(fileName)) usages[fileName] = {}\n        if(!usages[fileName].hasOwnProperty(\"variables\")) usages[fileName].variables = {};\n        if(!usages[fileName].variables.hasOwnProperty(usage)) usages[fileName].variables[usage] = 0;\n        usages[fileName].variables[usage]++;\n        if(!variables.hasOwnProperty(usage)) variables[usage] = {}\n        if(!variables[usage].hasOwnProperty(fileName)) variables[usage][fileName] = 0;\n        variables[usage][fileName]++;\n        console.log(\"Variable Usage:\", usage, \" in file:\", fileName);\n      }\n    }\n\n    // Check if function usages match function declarations\n    for (let usage of functionUsages) {\n      if (functionDeclarations.includes(usage)) {\n        if(!usages.hasOwnProperty(fileName)) usages[fileName] = {}\n        if(!usages[fileName].hasOwnProperty(\"functions\")) usages[fileName].functions = {};\n        if(!usages[fileName].functions.hasOwnProperty(usage)) usages[fileName].functions[usage] = 0;\n        usages[fileName].functions[usage]++;\n        if(!functions.hasOwnProperty(usage)) functions[usage] = {}\n        if(!functions[usage].hasOwnProperty(fileName)) functions[usage][fileName] = 0;\n        functions[usage][fileName]++;\n        console.log(\"Function Usage:\", usage, \" in file:\", fileName);\n      }\n    }\n  }\n  return {files: usages, variables, functions};\n}\n\n// let mandelcode = fileObject['H:/projects/ChrysalIDE/js/mandelbrot/mandelbrot_v1_0_1.js'];\n// delete fileObject['H:/projects/ChrysalIDE/js/mandelbrot/mandelbrot_v1_0_1.js'];\n\n// let mandelcode = fileObject['H:/projects/ChrysalIDE/js/interface/interface_v2.js'];\n// delete fileObject['H:/projects/ChrysalIDE/js/interface/interface_v2.js'];\n\n\nlet mandelcode = fileObject['H:/projects/ChrysalIDE/js/globals.js'];\ndelete fileObject['H:/projects/ChrysalIDE/js/globals.js'];\n//let otherFiles = Array.from(Object.keys(fileObject))\n//\t\t\t\t\t.filter((fileName) => !fileName.endsWith(\"mandelbrot_v1_0_1.js\"))\n//\t\t\t\t\t.map((fileName) => fileObject[fileName]);\n\nconsole.log(getScopeUsage(mandelcode, fileObject))"
createJavascriptNode("code", code)

let chrysalIDENode = createProjectNode("ChrysalIDE", "H:/projects/ChrysalIDE")
chrysalIDENode.pos = rootDiagram.background.pan;
chrysalIDENode.followingMouse = 0;

let chrysalIDEFrontend = createJavascriptFrontendModuleNode("Frontend", [], "H:/projects/ChrysalIDE",  ["js/**/**.js", "**/**.html"],["dist/**", "Localhost Servers/**", "Automation/**", "**/node_modules/**"])
chrysalIDEFrontend.pos = rootDiagram.background.pan.plus(new vec2(1,0));
chrysalIDEFrontend.followingMouse = 0;

// let genericTool = createToolNode("clone", "Clone a node")

// // Dynamic Tool import:
// let Clone = (await import('/tools/node/clone.js')).default
//
// let cloneTool = new Clone({name: "clone", description: "Clone a node"})
//
// connectDistance(cloneTool, chrysalIDEFrontend)
// connectDistance(cloneTool, chrysalIDENode)

// // Get node code:
// let MetaCode = (await import('/tools/node/get/metaCode.js')).default
//
// let codeTool = new MetaCode({name: "clone", description: "Clone a node"})
//
// connectDistance(codeTool, chrysalIDEFrontend)
// connectDistance(codeTool, chrysalIDENode)

// // Get JavascriptFrontend File Declaration Usages:
// let FileDeclarationUsages = (await import('/tools/module/javascript/frontend/fileDeclarationUsages.js')).default
//
// let codeTool = new FileDeclarationUsages()
//
// connectDistance(codeTool, chrysalIDEFrontend)
// // connectDistance(codeTool, chrysalIDENode)

// // Get JavascriptFrontend File merge:
// let MergedCode = (await import('/tools/module/javascript/get/mergedCode.js')).default
// let Tool = (await import("H:/projects/ChrysalIDE/tools/module/javascript/get/mergedCode.js")).default
//
// let codeTool = new Tool()


// // Get JavascriptFrontend File merge:
// let MergedCode = (await import('/tools/module/javascript/get/mergedCode.js')).default
// let Tool = (await import("H:/projects/ChrysalIDE/tools/module/javascript/frontend/get/toplevelClassDeclarations.js")).default
let Tool = (await import("H:/projects/ChrysalIDE/tools/node/get/nodeClassDeclarations.js")).default

let codeTool = new Tool()

connectDistance(codeTool, chrysalIDEFrontend)
// connectDistance(codeTool, chrysalIDENode)

dropdown.menuButton.dispatchEvent(new MouseEvent("click"))
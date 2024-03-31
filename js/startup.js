//

// let textNode = createNodeFromWindow("test", "text content", false);
// textNode.files.push({"key":"text","path":"D:/Projects/ChrysalIDE/samples/ztext.txt", "name":"ztext.txt","autoLoad":false,"autoSave":false})
// textNode.files.push({"key":"title","path":"D:/Projects/ChrysalIDE/samples/ztext.txt", "name":"ztext.txt","autoLoad":false,"autoSave":false})
// textNode.files.push({"key":"uuid","path":"D:/Projects/ChrysalIDE/samples/ztext.txt", "name":"ztext.txt","autoLoad":false,"autoSave":false})
//
// new NodeFilesUI({node: textNode});


let subd = createDiagram(1, rootDiagram);
subd.pos = rootDiagram.background.pan;
//
let subd2 = createDiagram(2, subd.innerDiagram);
subd2.pos = rootDiagram.background.pan;

let subd3 = createDiagram(3, subd2.innerDiagram);
subd3.pos = subd.innerDiagram.background.pan;

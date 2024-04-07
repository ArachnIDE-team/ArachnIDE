class DropdownPanel extends HTMLNode {
    constructor() {

        let content = dropdown;
        let container = document.getElementById("dropdowndiv");
        super({content, container});
    }
}
//
// window.dropdownPanel = new DropdownPanel()
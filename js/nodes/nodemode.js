
const edgesIcon = document.querySelector('.edges-icon');
let lockedNodeMode = false;

function toggleNodeModeState() {
    if (rootDiagram.nodeMode) {
        edgesIcon.classList.add('edges-active');
    } else {
        edgesIcon.classList.remove('edges-active');
    }
}

function toggleNodeMode() {
    rootDiagram.nodeMode = 1 - rootDiagram.nodeMode;
    lockedNodeMode = !!rootDiagram.nodeMode;  // Lock it only if activated by button
    toggleNodeModeState();
}

edgesIcon.addEventListener('click', toggleNodeMode);

addEventListener("keydown", (event) => {
    if (event.key === settings.nodeModeKey) {
        const isCapsLockMode = settings.nodeModeKey === "CapsLock" && event.getModifierState("CapsLock");

        if (lockedNodeMode && !rootDiagram.nodeMode) {
            // If nodeMode was deactivated by the key while it was locked, unlock it
            lockedNodeMode = false;
        }

        if (settings.nodeModeTrigger === "down" && !isCapsLockMode) {
            rootDiagram.nodeMode = 1;
            toggleNodeModeState();
            autoToggleAllOverlays();
        } else if (settings.nodeModeTrigger === "toggle" || isCapsLockMode) {
            toggleNodeMode();
        }
    } else if (event.key === "Escape") {
        for (let n of rootDiagram.nodes) {
            n.followingMouse = 0;
        }
    }
});

addEventListener("keyup", (event) => {
    if (event.key === settings.nodeModeKey && settings.nodeModeTrigger === "down") {
        if (lockedNodeMode) {
            return;  // Don't allow the keyup event to deactivate nodeMode if it's locked
        }

        rootDiagram.nodeMode = 0;
        toggleNodeModeState();
        autoToggleAllOverlays();
        cancel(event);
    }
});
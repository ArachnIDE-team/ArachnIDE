
const selectIcon = document.querySelector('#selectIcon');
const moveIcon = document.querySelector('#moveIcon');
const zoomIcon = document.querySelector('#zoomIcon');
const edgesIcon = document.querySelector('#edgesIcon');
let lockedNodeMode = false;

function toggleNodeModeState() {
    if (nodeMode) {
        edgesIcon.classList.add('cursor-icon-active');
    } else {
        edgesIcon.classList.remove('cursor-icon-active');
    }
}

function toggleSelectIconState(active) {
    if (active) {
        selectIcon.classList.add('cursor-icon-active');
    } else {
        selectIcon.classList.remove('cursor-icon-active');
    }
}

function toggleMoveIconState(active) {
    if (active) {
        moveIcon.classList.add('cursor-icon-active');
    } else {
        moveIcon.classList.remove('cursor-icon-active');
    }
}

let zoomIconTimeout = -1;
function activateZoomIcon() {
    if(zoomIconTimeout !== -1){
        clearTimeout(zoomIconTimeout);
    }
    zoomIconTimeout = setTimeout(() => {
        zoomIcon.classList.remove('cursor-icon-active');
        zoomIconTimeout = -1;
    }, 300)
    zoomIcon.classList.add('cursor-icon-active');
}

function toggleNodeMode() {
    nodeMode = 1 - nodeMode;
    lockedNodeMode = !!nodeMode;  // Lock it only if activated by button
    toggleNodeModeState();
}

edgesIcon.addEventListener('click', toggleNodeMode);

addEventListener("keydown", (event) => {
    if (event.key === settings.nodeModeKey) {
        const isCapsLockMode = settings.nodeModeKey === "CapsLock" && event.getModifierState("CapsLock");

        if (lockedNodeMode && !nodeMode) {
            // If nodeMode was deactivated by the key while it was locked, unlock it
            lockedNodeMode = false;
        }

        if (settings.nodeModeTrigger === "down" && !isCapsLockMode) {
            nodeMode = 1;
            toggleNodeModeState();
            autoToggleAllOverlays();
        } else if (settings.nodeModeTrigger === "toggle" || isCapsLockMode) {
            toggleNodeMode();
            console.log("Toggled node mode")

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

        nodeMode = 0;
        toggleNodeModeState();
        autoToggleAllOverlays();
        cancel(event);
    }
});
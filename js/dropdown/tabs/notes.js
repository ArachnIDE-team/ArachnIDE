
class NotesTab {
    constructor() {
        // Override default CodeMirror undo/redo handlers
        myCodeMirror.setOption('extraKeys', {
            'Ctrl-Z': (cm) => { /* Do nothing */ },
            'Cmd-Z': (cm) => { /* Do nothing */ },
            'Ctrl-Y': (cm) => { /* Do nothing */ },
            'Cmd-Y': (cm) => { /* Do nothing */ },
            'Shift-Ctrl-Z': (cm) => { /* Do nothing */ },
            'Shift-Cmd-Z': (cm) => { /* Do nothing */ }
        });
        NotesTab._captureDocumentUndoRedoEventsAndApplyToCodeMirror(myCodeMirror);
        this.maxWidth = undefined;
        this.maxHeight = undefined;
        this.updateMaxDimensions();
        window.addEventListener("resize", this.updateMaxDimensions.bind(this));

        // Horizontal drag handle
        this.zetHorizDragHandle = document.getElementById("zetHorizDragHandle");
        this.zetIsHorizResizing = false;
        this.initialX = undefined;
        this.initialWidth = undefined;

        this.zetHorizDragHandle.addEventListener("mousedown", this.onZetHorizDragHandleMouseDown.bind(this) );

        // Vertical drag handle
        this.zetVertDragHandle = document.getElementById("zetVertDragHandle");
        this.zetIsVertResizing = false;
        this.initialY = undefined;
        this.initialHeight = undefined;

        this.zetVertDragHandle.addEventListener("mousedown", this.onZetVertDragHandleMouseDown.bind(this));


        window.addEventListener("resize", this.updateZetDimension.bind(this));

        document.addEventListener('DOMContentLoaded', () => {
            const promptInput = document.getElementById('prompt');
            if (promptInput) {
                promptInput.addEventListener('keydown', this.handleKeyDown.bind(this));
            }
        });
    }

    // added static _
    static _captureDocumentUndoRedoEventsAndApplyToCodeMirror(codeMirrorInstance) {
        document.addEventListener('keydown', function (event) {
            if (event.ctrlKey || event.metaKey) {  // Works for both Ctrl (Windows/Linux) and Cmd (macOS)
                let didOperation = false;

                if (event.key === 'z') {
                    if (event.shiftKey) {
                        // Redo for Ctrl+Shift+Z or Cmd+Shift+Z
                        codeMirrorInstance.redo();
                        didOperation = true;
                    } else {
                        // Undo for Ctrl+Z or Cmd+Z
                        codeMirrorInstance.undo();
                        didOperation = true;
                    }
                } else if (event.key === 'y') {
                    // Redo for Ctrl+Y or Cmd+Y
                    codeMirrorInstance.redo();
                    didOperation = true;
                }

                if (didOperation && (event.target.closest('.CodeMirror') || event.target.tagName.toLowerCase() !== 'textarea' && event.target.tagName.toLowerCase() !== 'input')) {
                    event.preventDefault();  // Prevent the default undo/redo behavior in the document or CodeMirror
                    setTimeout(() => codeMirrorInstance.refresh(), 0);  // Refresh the CodeMirror instance
                }
            }
        });
    }

    updateMaxDimensions() {
        this.maxWidth = window.innerWidth * 0.9;
        this.maxHeight = window.innerHeight * 0.7;
    }

    // Previously anonymous inline
    onZetHorizDragHandleMouseDown(event) {
        this.updateMaxDimensions(); // Update dimensions at the start of each drag
        this.zetIsHorizResizing = true;
        this.initialX = event.clientX;
        let cmElement = myCodeMirror.getWrapperElement();
        this.initialWidth = cmElement.offsetWidth;

        // Prevent text selection while resizing
        document.body.style.userSelect = 'none';

        document.addEventListener("mousemove", this.onZetHandleHorizMouseMove.bind(this));
        document.addEventListener("mouseup", function () {
            this.zetIsHorizResizing = false;

            // Enable text selection again after resizing
            document.body.style.userSelect = '';

            document.removeEventListener("mousemove", this.onZetHandleHorizMouseMove.bind(this));
        }.bind(this));

    }

    // Previously zetHandleHorizMouseMove
    onZetHandleHorizMouseMove(event) {
        if (this.zetIsHorizResizing) {
            requestAnimationFrame(() => {
                // Calculate the difference in the x position
                let dx = event.clientX - this.initialX;
                let cmElement = myCodeMirror.getWrapperElement();
                let newWidth = this.initialWidth - dx;

                // Update the width if within the boundaries
                if (newWidth > 50 && newWidth <= this.maxWidth) {
                    cmElement.style.width = newWidth + "px";
                    document.getElementById('prompt').style.width = newWidth + 'px';
                    myCodeMirror.refresh();
                }
            });
        }
    }

    // Previously anonymous inline
    onZetVertDragHandleMouseDown() {
        this.updateMaxDimensions(); // Update dimensions at the start of each drag
        this.zetIsVertResizing = true;
        this.initialY = event.clientY;
        let cmElement = myCodeMirror.getWrapperElement();
        this.initialHeight = cmElement.offsetHeight;

        // Prevent text selection while resizing
        document.body.style.userSelect = 'none';

        document.addEventListener("mousemove", this.onZetHandleVertMouseMove.bind(this));
        document.addEventListener("mouseup", function () {
            this.zetIsVertResizing = false;

            // Enable text selection again after resizing
            document.body.style.userSelect = '';

            document.removeEventListener("mousemove", this.onZetHandleVertMouseMove.bind(this));
        });
    }

    // Previously zetHandleVertMouseMove
    onZetHandleVertMouseMove(event) {
        if (this.zetIsVertResizing) {
            requestAnimationFrame(() => {
                // Calculate the difference in the y position
                let dy = event.clientY - this.initialY;
                let cmElement = myCodeMirror.getWrapperElement();
                let newHeight = this.initialHeight + dy;

                // Update the height if within the boundaries
                if (newHeight > 50 && newHeight <= this.maxHeight) {
                    cmElement.style.height = newHeight + "px";
                    myCodeMirror.refresh();
                }
            });
        }
    }

    // Previously anonymous inline
    updateZetDimension() {
        this.maxWidth = window.innerWidth * 0.9;
        this.maxHeight = window.innerHeight * 0.9;

        let cmElement = myCodeMirror.getWrapperElement();

        if (cmElement.offsetHeight > this.maxHeight) {
            cmElement.style.height = this.maxHeight + "px";
        }

        if (cmElement.offsetWidth > this.maxWidth) {
            cmElement.style.width = this.maxWidth + "px";
        }

        myCodeMirror.refresh();
    }

    handleKeyDown(event) {
        if (event.key === 'Enter') {
            const localLLMCheckbox = document.getElementById("localLLM");

            if (event.shiftKey) {
                // Shift + Enter was pressed, insert a newline
                event.preventDefault();
                // insert a newline at the cursor
                const cursorPosition = event.target.selectionStart;
                event.target.value = event.target.value.substring(0, cursorPosition) + "\n" + event.target.value.substring(cursorPosition);
                // position the cursor after the newline
                event.target.selectionStart = cursorPosition + 1;
                event.target.selectionEnd = cursorPosition + 1;
                // force the textarea to resize
                this.autoGrow.bind(event.target).call(event);
            } else {
                // Enter was pressed without Shift
                event.preventDefault();

                // If localLLM checkbox is enabled, submit the form (which triggers LLM code).
                if (localLLMCheckbox.checked) {
                    document.getElementById('prompt-form').dispatchEvent(new Event('submit'));
                } else {
                    // Otherwise, call sendMessage function
                    sendMessage(event);
                }
            }
        }
        return true;
    }
}
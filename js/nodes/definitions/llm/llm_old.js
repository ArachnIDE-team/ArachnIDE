
class LLMOldNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        sx: undefined,
        sy: undefined,
        x: undefined,
        y: undefined,
        saved: undefined,
        saveData: undefined,
    }
    static SAVE_PROPERTIES = ['chat', 'LocalLLMSelectID', 'aiResponding', 'aiResponseHalted', 'codeBlockCount', 'id',
        'index', 'latestUserMessage', 'localAiResponding', 'savedCheckboxStates', 'savedCustomInstructions',
        'savedTemperature', 'savedLocalLLMSelect', 'savedLLMSelection', 'savedMaxContextSize', 'savedMaxTokens', 'savedTextContent',
        'shouldAppendQuestion', 'shouldContinue', 'userHasScrolled', 'isLLM', 'isLLMNode'];

    // constructor(name = '', content = undefined, sx = undefined, sy = undefined, x = undefined, y = undefined){

    constructor(configuration = LLMOldNode.DEFAULT_CONFIGURATION){
        configuration = {...LLMOldNode.DEFAULT_CONFIGURATION, ...configuration}
        let [ainodewrapperDiv, aiResponseTextArea] = LLMOldNode._getContentElement(configuration);
        if (!configuration.saved) {// Create LLMOldNode
            super({title: configuration.name, content: [], ...WindowedNode.getNaturalScaleParameters()});
        } else {// Restore LLMOldNode
            super({
                title: configuration.name,
                content: [],
                scale: true,
                saved: true,
                saveData: configuration.saveData
            })
        }
        this.diagram.addNode(this);
        this._initialize(ainodewrapperDiv, aiResponseTextArea, configuration.saved)
    }

    get chat(){
        const responseHandler = nodeResponseHandlers.get(this);
        return responseHandler.saveAiResponseDiv()
    }

    set chat(value){
        const setChat = function(chat) {
            const responseHandler = nodeResponseHandlers.get(this);
            responseHandler.handleSystemPrompt(this.savedCustomInstructions)
            if(chat.length > 0){
                if(chat[0].role === 'assistant') this.aiResponding = true;
            }
            for (let message of chat) {
                if(message.role === 'user') {
                    this.aiResponding = false;
                    responseHandler.handleUserPrompt(message.message);
                }
                if(message.role === 'assistant' && message.message) {
                    this.aiResponding = true;
                    responseHandler.handleMarkdown(message.message);
                }
                if(message.role === 'assistant' && message.code && message.language) {
                    this.aiResponding = true;
                    responseHandler.currentLanguage = message.language;
                    responseHandler.renderCodeBlock("\n" + message.code, true);
                }

            }
        }.bind(this)
        if(this.initialized){
            setChat(value);
        } else {
            this.addAfterInitCallback(() => {
                setChat(value);
            })
        }
    }

    set savedLocalLLMSelect(value) {
        const setSavedModelLLMSelect = function(selection) {
            this.localLLMSelect.value = selection;
            // Force a UI update for select
            const optionsReplacer = this.localLLMSelect.parentNode.querySelector(".options-replacer");
            const selectReplacer = this.localLLMSelect.parentNode.querySelector(".select-replacer");
            optionsReplacer.querySelector(".selected").classList.remove("selected")
            const selectedOption = optionsReplacer.querySelector("[data-value='" + this.localLLMSelect.value + "']");
            selectedOption.classList.add("selected")
            selectReplacer.children[0].innerText = selectedOption.innerText;
        }.bind(this)
        if(this.initialized){
            setSavedModelLLMSelect(value);
        } else {
            this.addAfterInitCallback(() => {
                setSavedModelLLMSelect(value);

            })
        }
    }

    get savedLocalLLMSelect() {
        return this.localLLMSelect.value;
    }

    static _getContentElement(configuration = LLMOldNode.DEFAULT_CONFIGURATION){

        // Create the AI response textarea
        let aiResponseTextArea = document.createElement("textarea");
        const index = configuration.saved ? configuration.saveData.json.index : llmNodeCount;
        aiResponseTextArea.id = `LLMnoderesponse-${index}`;  // Assign unique id to each aiResponseTextArea
        aiResponseTextArea.style.display = 'none';  // Hide the textarea

        // Create the AI response container
        let aiResponseDiv = document.createElement("div");
        aiResponseDiv.id = `LLMnoderesponseDiv-${index}`;  // Assign unique id to each aiResponseDiv
        aiResponseDiv.classList.add('custom-scrollbar', 'ai-response-div');
        aiResponseDiv.setAttribute("style", "background: linear-gradient(to bottom, rgba(34, 34, 38, 0), #222226); color: inherit; border: none; border-color: #8882; width: 100%; max-height: 80%; height: 80%; overflow-y: auto; overflow-x: hidden; resize: none; word-wrap: break-word; user-select: none; line-height: 1.75;");

        // Create the user prompt textarea
        let promptTextArea = document.createElement("textarea");
        promptTextArea.id = `nodeprompt-${index}`;
        promptTextArea.classList.add('custom-scrollbar', 'custom-textarea'); // Add the class here

        // Create the send button
        let sendButton = document.createElement("button");
        sendButton.type = "submit";
        sendButton.id = `prompt-form-${index}`;
        sendButton.style.cssText = "display: flex; justify-content: center; align-items: center; padding: 3px; z-index: 1; font-size: 14px; cursor: pointer; background-color: #222226; transition: background-color 0.3s; border: inset; border-color: #8882; width: 30px; height: 30px;";

        sendButton.innerHTML = `
    <svg width="24" height="24">
        <use xlink:href="#play-icon"></use>
    </svg>`;

        // Create the regenerate button
        let regenerateButton = document.createElement("button");
        regenerateButton.type = "button";
        regenerateButton.id = "prompt-form";
        regenerateButton.style.cssText = "display: flex; justify-content: center; align-items: center; padding: 3px; z-index: 1; font-size: 14px; cursor: pointer; background-color: #222226; transition: background-color 0.3s; border: inset; border-color: #8882; width: 30px; height: 30px; border-radius: 50%;";
        regenerateButton.innerHTML = `
    <svg width="24" height="24">
        <use xlink:href="#refresh-icon"></use>
    </svg>`;

        // Create settings button
        const aiNodeSettingsButton = document.createElement('button');
        aiNodeSettingsButton.type = "button";
        aiNodeSettingsButton.id = 'aiNodeSettingsButton';
        aiNodeSettingsButton.style.cssText = "display: flex; justify-content: center; align-items: center; padding: 3px; z-index: 1; font-size: 14px; cursor: pointer; background-color: #222226; transition: background-color 0.3s; border: inset; border-color: #8882; width: 30px; height: 30px;";

        // Clone the SVG element
        const settingsIcon = document.getElementById('aiNodeSettingsIcon').cloneNode(true);
        settingsIcon.style.display = 'inline-block';

        // Append the SVG to the button
        aiNodeSettingsButton.appendChild(settingsIcon);

        // Initialize the button's active state as false
        aiNodeSettingsButton.isActive = false;

        // Create the loader and error icons container
        let statusIconsContainer = document.createElement("div");
        statusIconsContainer.className = 'status-icons-container';
        statusIconsContainer.style.cssText = 'position: absolute; top: 40px; right: 80px; width: 20px; height: 20px;';

        // Create the loader icon
        let aiLoadingIcon = document.createElement("div");
        aiLoadingIcon.className = 'loader';
        aiLoadingIcon.id = `aiLoadingIcon-${index}`; // Assign unique id
        aiLoadingIcon.style.display = 'none';

        // Create the error icon
        let aiErrorIcon = document.createElement("div");
        aiErrorIcon.className = 'error-icon-css';
        aiErrorIcon.id = `aiErrorIcon-${index}`; // Assign unique id
        aiErrorIcon.style.display = 'none';

        // Create the 'X' mark inside the error icon
        let xMark = document.createElement("div");
        xMark.className = 'error-x-mark';

        let xMarkLeft = document.createElement("div");
        xMarkLeft.className = 'error-x-mark-left';

        let xMarkRight = document.createElement("div");
        xMarkRight.className = 'error-x-mark-right';

        xMark.appendChild(xMarkLeft);
        xMark.appendChild(xMarkRight);
        aiErrorIcon.appendChild(xMark); // Append the 'X' mark to the error icon

        // Append loader and error icons to container
        statusIconsContainer.appendChild(aiLoadingIcon);
        statusIconsContainer.appendChild(aiErrorIcon);

        // Create a div to wrap prompt textarea and buttons
        let buttonDiv = document.createElement("div");
        buttonDiv.appendChild(sendButton);
        buttonDiv.appendChild(regenerateButton);
        buttonDiv.appendChild(aiNodeSettingsButton);
        buttonDiv.style.cssText = "display: flex; flex-direction: column; align-items: flex-end; margin-bottom: 12px; margin-top: 4px;";

        // Create the promptDiv with relative position
        let promptDiv = document.createElement("div");
        promptDiv.style.cssText = "display: flex; flex-direction: row; justify-content: space-between; align-items: center; position: relative;"; // Added position: relative;

        // Append statusIconsContainer to the promptDiv instead of wrapperDiv
        promptDiv.appendChild(statusIconsContainer);
        promptDiv.appendChild(promptTextArea);
        promptDiv.appendChild(buttonDiv);

        // Wrap elements in a div
        let ainodewrapperDiv = document.createElement("div");
        ainodewrapperDiv.className = 'ainodewrapperDiv';
        ainodewrapperDiv.style.position = 'relative'; // <-- Add this line to make sure the container has a relative position
        ainodewrapperDiv.style.width = "500px";
        ainodewrapperDiv.style.height = "520px";

        ainodewrapperDiv.appendChild(aiResponseTextArea);
        ainodewrapperDiv.appendChild(aiResponseDiv);
        ainodewrapperDiv.appendChild(promptDiv);

        const initialTemperature = document.getElementById('model-temperature').value;
        const initialMaxTokens = document.getElementById('max-tokens-slider').value;
        const initialMaxContextSize = document.getElementById('max-context-size-slider').value;

        // Create and configure the settings
        const LocalLLMSelect = LLMOldNode._createAndConfigureLocalLLMDropdown(index);

        const temperatureSliderContainer = LLMOldNode._createSlider(`node-temperature-${index}`, 'Temperature', initialTemperature, 0, 1, 0.1);
        const maxTokensSliderContainer = LLMOldNode._createSlider(`node-max-tokens-${index}`, 'Max Tokens', initialMaxTokens, 10, 16000, 1);
        const maxContextSizeSliderContainer = LLMOldNode._createSlider(`node-max-context-${index}`, 'Max Context', initialMaxContextSize, 1, initialMaxTokens, 1);


        // Create settings container
        const aiNodeSettingsContainer = LLMOldNode._createSettingsContainer();


        // Add the dropdown (LocalLLMSelect) into settings container
        aiNodeSettingsContainer.appendChild(LocalLLMSelect);  // LocalLLMSelect is the existing dropdown
        aiNodeSettingsContainer.appendChild(temperatureSliderContainer);
        aiNodeSettingsContainer.appendChild(maxTokensSliderContainer);
        aiNodeSettingsContainer.appendChild(maxContextSizeSliderContainer);

        const firstSixOptions = llmOptions.slice(0, 6);
        const checkboxArray1 = LLMOldNode._createCheckboxArray(index, firstSixOptions);
        aiNodeSettingsContainer.appendChild(checkboxArray1);

        const customInstructionsTextarea = LLMOldNode._createCustomInstructionsTextarea(index);
        aiNodeSettingsContainer.appendChild(customInstructionsTextarea);

        // Add settings container to the ainodewrapperDiv
        ainodewrapperDiv.appendChild(aiNodeSettingsContainer);

        return [ainodewrapperDiv, aiResponseTextArea];
    }

    static _createSettingsContainer() {
        const settingsContainer = document.createElement('div');
        settingsContainer.className = 'ainode-settings-container';
        settingsContainer.style.display = 'none';  // Initially hidden

        return settingsContainer;
    }

    static _createSlider(id, label, initialValue, min, max, step) {
        const sliderDiv = document.createElement('div');
        sliderDiv.classList.add('slider-container');

        const sliderLabel = document.createElement('label');
        sliderLabel.setAttribute('for', id);
        sliderLabel.innerText = `${label}: ${initialValue}`;

        const sliderInput = document.createElement('input');
        sliderInput.type = 'range';
        sliderInput.id = id;

        // First, set the min and max
        sliderInput.min = min;
        sliderInput.max = max;

        // Then, set the step and initial value
        sliderInput.step = step;
        sliderInput.value = initialValue;

        sliderDiv.appendChild(sliderLabel);
        sliderDiv.appendChild(sliderInput);

        return sliderDiv;
    }

    static _createAndConfigureLocalLLMDropdown(index) {
        // Create the Local LLM dropdown
        let LocalLLMSelect = document.createElement("select");
        LocalLLMSelect.id = `dynamicLocalLLMselect-${index}`;
        LocalLLMSelect.classList.add('inline-container');
        LocalLLMSelect.style.backgroundColor = "#222226";
        LocalLLMSelect.style.border = "none";

        let localLLMCheckbox = document.getElementById("localLLM");


        // Create an array to store the options
        let options = [
            new Option('OpenAI', 'OpenAi', false, true),
            new Option('Red Pajama 3B f32', 'RedPajama-INCITE-Chat-3B-v1-q4f32_0', false, false),
            new Option('Vicuna 7B f32', 'vicuna-v1-7b-q4f32_0', false, false),
            new Option('Llama 2 7B f32', 'Llama-2-7b-chat-hf-q4f32_1', false, false),
            //new Option('Llama 2 13B f32', 'Llama-2-13b-chat-hf-q4f32_1', false, false),
            new Option('Llama 2 70B f16', 'Llama-2-70b-chat-hf-q4f16_1', false, false),
            //new Option('WizardCoder 15B f32', '"WizardCoder-15B-V1.0-q4f32_1', false, false),
            new Option('gpt-3.5-turbo', 'gpt-3.5-turbo', false, false),
            //new Option('gpt-3.5-turbo-16k', 'gpt-3.5-turbo-16k', false, false),
            //new Option('gpt-3.5-turbo-0613', 'gpt-3.5-turbo-0613', false, false),
            new Option('gpt-3.5-16k-0613', 'gpt-3.5-turbo-16k-0613', false, false),
            new Option('gpt-4', 'gpt-4', false, false),
            new Option('gpt-4-0613', 'gpt-4-0613', false, false),
            new Option('gpt-4-vision', 'gpt-4-vision-preview', false, false),
            new Option('gpt-3.5-1106', 'gpt-3.5-turbo-1106', false, false),
            new Option('gpt-4-1106', 'gpt-4-1106-preview', false, false)
        ];

        // Add options to the select
        options.forEach((option, index) => {
            LocalLLMSelect.add(option, index);
        });

        // Initial setup based on checkbox state
        options.forEach((option) => {
            if (option.value === 'OpenAi' || option.value.startsWith('gpt-')) {
                option.hidden = false;  // Always show
            } else {
                option.hidden = !localLLMCheckbox.checked;  // Show or hide based on checkbox initial state
            }
        });

        return LocalLLMSelect;
    }

    static _createCheckboxArray(index, subsetOptions) {
        const checkboxArrayDiv = document.createElement('div');
        checkboxArrayDiv.className = 'checkboxarray';

        for (const option of subsetOptions) {
            const checkboxDiv = document.createElement('div');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${option.id}-checkbox-${index}`;
            checkbox.name = `${option.id}-checkbox-${index}`;

            const label = document.createElement('label');
            label.setAttribute('for', checkbox.id);
            label.innerText = option.label;

            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(label);
            checkboxArrayDiv.appendChild(checkboxDiv);
        }

        return checkboxArrayDiv;
    }

    static _createCustomInstructionsTextarea(index) {
        const textareaDiv = document.createElement('div');
        textareaDiv.className = 'textarea-container';

        const textarea = document.createElement('textarea');
        textarea.id = `custom-instructions-textarea-${index}`;
        textarea.className = 'custom-scrollbar';  // Apply the custom-scrollbar class here
        textarea.placeholder = 'Enter custom instructions here...';

        textareaDiv.appendChild(textarea);

        return textareaDiv;
    }

    _initialize(ainodewrapperDiv, aiResponseTextArea, saved){
        let windowDiv = this.windowDiv;
        windowDiv.style.resize = 'both';

        // Append the ainodewrapperDiv to windowDiv of the node
        windowDiv.appendChild(ainodewrapperDiv);
        if(!saved){
            // Additional configurations
            this.id = aiResponseTextArea.id;  // Store the id in the node object
            this.index = llmNodeCount;
            this.aiResponding = false;
            this.localAiResponding = false;
            this.latestUserMessage = null;
            this.shouldContinue = true;
            this.LocalLLMSelectID = `dynamicLocalLLMselect-${this.index}`;
            this.isLLMNode = true;
            this.shouldAppendQuestion = false;
            this.aiResponseHalted = false;
            this.savedCheckboxStates = {};
            this.savedCustomInstructions = '';
            this.savedLLMSelection = '';
            this.savedTextContent = '';
            this.isLLM = true;
        }
        this.afterInit();
    }

    afterInit() {
        llmNodeCount++;

        this.ainodewrapperDiv = this.content.querySelector('.ainodewrapperDiv');

        this.aiResponseDiv = this.content.querySelector('[id^="LLMnoderesponseDiv-"]');

        this.aiResponseTextArea = this.content.querySelector('[id^="LLMnoderesponse-"]');

        this.promptTextArea = this.content.querySelector('[id^="nodeprompt-"]');

        this.sendButton = this.content.querySelector('[id^="prompt-form-"]');

        this.haltCheckbox = this.content.querySelector('input[id^="halt-questions-checkbox"]');

        this.regenerateButton = this.content.querySelector('#prompt-form');

        this.localLLMSelect = this.content.querySelector(`[id^="dynamicLocalLLMselect-"]`);

        // Setup event listeners
        this._setupAiResponseTextAreaListener();
        this._setupAiNodeResponseDivListeners();
        this._setupAiNodePromptTextAreaListeners();
        this._setupAiNodeSendButtonListeners();
        this._setupAiNodeRegenerateButtonListeners();
        this._setupAiNodeSettingsButtonListeners();
        this._setupAiNodeLocalLLMDropdownListeners();
        this._setupAiNodeSliderListeners()
        this._setupAiNodeCheckBoxArrayListeners()
        this._setupAiNodeCustomInstructionsListeners()

        // Functions

        this.controller = new AbortController();

        //Handles parsing of conversation divs.
        let responseHandler = new ResponseHandler(this);
        nodeResponseHandlers.set(this, responseHandler); // map response handler to this

        this.removeLastResponse = responseHandler.removeLastResponse.bind(responseHandler);
        responseHandler.restoreAiResponseDiv()


        this.haltResponse = () => this._aiNodeHaltResponse();

        super.afterInit();
    }

    _aiNodeHaltResponse() {
        if (this.aiResponding) {
            // AI is responding, so we want to stop it
            this.controller.abort(); // Send the abort signal to the fetch request
            this.aiResponding = false;
            this.shouldContinue = false;
            this.regenerateButton.innerHTML = `
            <svg width="24" height="24" class="icon">
                <use xlink:href="#refresh-icon"></use>
            </svg>`;
            this.promptTextArea.value = this.latestUserMessage; // Add the last user message to the prompt input

            // Access the responseHandler from the nodeResponseHandlers map
            let responseHandler = nodeResponseHandlers.get(this);

            // If currently in a code block
            if (responseHandler && responseHandler.inCodeBlock) {
                // Add closing backticks to the current code block content
                responseHandler.codeBlockContent += '```\n';

                // Render the final code block
                responseHandler.renderCodeBlock(responseHandler.codeBlockContent, true);

                // Reset the code block state
                responseHandler.codeBlockContent = '';
                responseHandler.codeBlockStartIndex = -1;
                responseHandler.inCodeBlock = false;

                // Clear the textarea value to avoid reprocessing
                this.aiResponseTextArea.value = responseHandler.previousContent + responseHandler.codeBlockContent;

                // Update the previous content length
                responseHandler.previousContentLength = this.aiResponseTextArea.value.length;
                this.aiResponseTextArea.dispatchEvent(new Event('input'));
            }
            this.aiResponseHalted = true;
        }

        // Update the halt checkbox to reflect the halted state
        const haltCheckbox = this.haltCheckbox;
        if (haltCheckbox) {
            haltCheckbox.checked = true;
        }
    }

    _setupAiNodeResponseDivListeners() {
        let aiResponseDiv = this.aiResponseDiv;
        let aiResponseTextArea = this.aiResponseTextArea;
        aiResponseDiv.onmousedown = function (event) {
            if (!event.altKey) {
                cancel(event);
            }
        };

        aiResponseDiv.addEventListener('mouseenter', () => {
            aiResponseDiv.style.userSelect = "text";
        });
        aiResponseDiv.addEventListener('mouseleave', () => {
            aiResponseDiv.style.userSelect = "none";
        });

        // Add a 'wheel' event listener
        aiResponseDiv.addEventListener('wheel', () => {
            // If the Shift key is not being held down, stop the event propagation
            if (!event.shiftKey) {
                event.stopPropagation();
            }
        }, { passive: false });

        let userHasScrolled = false;

        // Function to scroll to bottom
        const scrollToBottom = () => {
            if (!userHasScrolled) {
                setTimeout(() => {
                    aiResponseDiv.scrollTo({
                        top: aiResponseDiv.scrollHeight,
                        behavior: 'smooth'
                    });
                }, 0);
            }
        };

        // Call scrollToBottom whenever there's an input
        aiResponseTextArea.addEventListener('input', scrollToBottom);


        // Tolerance in pixels
        const epsilon = 5;

        // Function to handle scrolling
        const handleScroll = () => {
            if (Math.abs(aiResponseDiv.scrollTop + aiResponseDiv.clientHeight - aiResponseDiv.scrollHeight) > epsilon) {
                userHasScrolled = true;
            } else {
                userHasScrolled = false;
            }
        };

        // Event listener for scrolling
        aiResponseDiv.addEventListener('scroll', handleScroll);

        // Disable text highlighting when Alt key is down and re-enable when it's up
        document.addEventListener('keydown', (event) => {
            if (event.altKey) {
                aiResponseDiv.style.userSelect = 'none';
            }
        });

        document.addEventListener('keyup', (event) => {
            if (!event.altKey) {
                aiResponseDiv.style.userSelect = 'text';
            }
        });

        // ... other event listeners for aiResponseDiv ...
    }

    // Function to handle setup of aiResponseTextArea listener
    _setupAiResponseTextAreaListener() {
        const aiResponseTextArea = this.content.querySelector('[id^="LLMnoderesponse-"]');
        this.aiResponseTextArea = aiResponseTextArea;

        // Restore saved text content if available
        if (this.savedTextContent !== undefined) {
            aiResponseTextArea.value = this.savedTextContent;
        }

        // Function to save text content
        const saveTextContent = () => {
            this.savedTextContent = aiResponseTextArea.value;
        };

        // Attach debounced event listener
        aiResponseTextArea.addEventListener('input', debounce(saveTextContent, 300));
    }

    _setupAiNodePromptTextAreaListeners() {
        let promptTextArea = this.promptTextArea

        promptTextArea.onmousedown = cancel;  // Prevent dragging
        promptTextArea.addEventListener('input', autoGrow);
        promptTextArea.addEventListener('mouseenter', () => {
            promptTextArea.style.userSelect = "text";
        });
        promptTextArea.addEventListener('mouseleave', () => {
            promptTextArea.style.userSelect = "none";
        });
        promptTextArea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendLLMNodeMessage();
            }
        });
        promptTextArea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (e.shiftKey) {
                    // Allow the new line to be added
                } else {
                    e.preventDefault();
                    this.sendLLMNodeMessage();
                }
            }
        });

        // ... other event listeners for promptTextArea ...
    }

    _setupAiNodeSendButtonListeners() {
        let sendButton = this.sendButton;

        let haltCheckbox = this.haltCheckbox;

        sendButton.addEventListener('mouseover', function () {
            this.style.backgroundColor = '#293e34';
            this.style.color = '#222226';
        });

        sendButton.addEventListener('mouseout', function () {
            this.style.backgroundColor = '#222226';
            this.style.color = '#ddd';
        });
        sendButton.addEventListener('mousedown', function () {
            this.style.backgroundColor = '#45a049';
        });
        sendButton.addEventListener('mouseup', function () {
            this.style.backgroundColor = '#ddd';
        });

        sendButton.addEventListener("click", (e) => {
            e.preventDefault();

            // Reset the flag and uncheck the checkbox
            this.aiResponseHalted = false;

            if (haltCheckbox) {
                haltCheckbox.checked = false;
            }

            this.sendLLMNodeMessage();
        });

        if (haltCheckbox) {
            haltCheckbox.addEventListener('change', () => {
                this.aiResponseHalted = this.checked;
                if (this.checked) {
                    this.haltResponse();
                }
            });
        }
    }

    _setupAiNodeRegenerateButtonListeners() {
        let regenerateButton = this.regenerateButton;

        regenerateButton.addEventListener('mouseover', function () {
            this.style.backgroundColor = '#333';
        });
        regenerateButton.addEventListener('mouseout', function (){
            this.style.backgroundColor = '#222226';
        });
        regenerateButton.addEventListener('mousedown', function () {
            this.style.backgroundColor = '#45a049';
        });
        regenerateButton.addEventListener('mouseup', function () {
            this.style.backgroundColor = '#222226';
        });


        this.regenerateResponse = function () {
            if (!this.aiResponding) {
                // AI is not responding, so we want to regenerate
                this.removeLastResponse(); // Remove the last AI response
                this.promptTextArea.value = this.latestUserMessage; // Restore the last user message into the input prompt
                this.regenerateButton.innerHTML = `
    <svg width="24" height="24" class="icon">
        <use xlink:href="#refresh-icon"></use>
    </svg>`;
            }
        };

        regenerateButton.addEventListener("click", () => {
            if (this.aiResponding) {
                // If the AI is currently responding, halt the response
                this.haltResponse();
            } else {
                // Otherwise, regenerate the response
                this.regenerateResponse();
            }
        });
    }

    _setupAiNodeSettingsButtonListeners() {
        let aiNodeSettingsButton = this.content.querySelector('#aiNodeSettingsButton');
        let aiNodeSettingsContainer = this.content.querySelector('.ainode-settings-container');

        aiNodeSettingsButton.addEventListener('mouseover', function () {
            this.style.backgroundColor = this.isActive ? '#1e3751' : '#333';
        });
        aiNodeSettingsButton.addEventListener('mouseout', function () {
            this.style.backgroundColor = this.isActive ? '#1e3751' : '#222226';
        });
        aiNodeSettingsButton.addEventListener('mousedown', function () {
            this.style.backgroundColor = '#1e3751';
        });
        aiNodeSettingsButton.addEventListener('mouseup', function () {
            this.style.backgroundColor = this.isActive ? '#1e3751' : '#333';
        });
        aiNodeSettingsButton.addEventListener('click', function (event) {
            this.isActive = !this.isActive;  // Toggle the active state
            LLMOldNode._toggleSettings(event, aiNodeSettingsContainer);  // Call your existing function
            // Set the background color based on the new active state
            this.style.backgroundColor = this.isActive ? '#1e3751' : '#333';
        });

        // Add the listener for mousedown event
        aiNodeSettingsContainer.addEventListener('mousedown', LLMOldNode._conditionalStopPropagation, false);

        // Add the listener for dblclick event
        aiNodeSettingsContainer.addEventListener('dblclick', LLMOldNode._conditionalStopPropagation, false);
    }

    static _conditionalStopPropagation(event) {
        if (!altHeld) {
            event.stopPropagation();
        }
    }

    static _toggleSettings(event, settingsContainer) {
        event.stopPropagation();
        const display = settingsContainer.style.display;
        settingsContainer.style.display = display === 'none' || display === '' ? 'grid' : 'none';
    }

    _setupAiNodeLocalLLMDropdownListeners() {
        let selectElement = this.localLLMSelect;

        const localLLMCheckbox = document.getElementById("localLLM");

        localLLMCheckbox.addEventListener('change', () => {
            // Access the options from the selectElement
            const options = selectElement.options;

            for (let i = 0; i < options.length; i++) {
                let option = options[i];
                if (option.value === 'OpenAi' || option.value.startsWith('gpt-')) {
                    option.hidden = false;  // Always show
                } else {
                    option.hidden = !this.checked;  // Show or hide based on checkbox
                }
            }

            // Also update the visibility of custom options
            const customOptions = document.querySelectorAll('.options-replacer div');
            customOptions.forEach((customOption) => {
                const value = customOption.getAttribute('data-value');
                if (value === 'OpenAi' || value.startsWith('gpt-')) {
                    customOption.style.display = 'block';  // Always show
                } else {
                    customOption.style.display = this.checked ? 'block' : 'none';  // Show or hide based on checkbox
                }
            });
        });

        setupCustomDropdown(selectElement, true);
    }

    _setupAiNodeSliderListeners() {
        // Assuming 'this.content' is the main container of your node
        const sliders = this.content.querySelectorAll('input[type=range]');

        sliders.forEach(slider => {
            // Attach event listener to each slider
            slider.addEventListener('input',  () => {
                // Retrieve the associated label within the node
                const label = this.content.querySelector(`label[for='${slider.id}']`);
                if (label) {
                    // Extract the base label text (part before the colon)
                    const baseLabelText = label.innerText.split(':')[0];
                    label.innerText = `${baseLabelText}: ${slider.value}`;

                    setSliderBackground(slider);  // Assuming this is a predefined function
                }
                // Additional logic for each slider, if needed
            });

            // Trigger the input event to set initial state
            slider.dispatchEvent(new Event('input'));
        });

        this._setupContextSpecificSliderListeners();
    }

    _setupContextSpecificSliderListeners() {
        // Fetch default values from DOM elements and sliders
        const defaultTemperature = document.getElementById('model-temperature').value;
        const defaultMaxTokens = document.getElementById('max-tokens-slider').value;
        const defaultMaxContextSize = document.getElementById('max-context-size-slider').value;

        const temperatureSlider = this.content.querySelector('#node-temperature-' + this.index);
        const maxTokensSlider = this.content.querySelector('#node-max-tokens-' + this.index);
        const maxContextSizeSlider = this.content.querySelector('#node-max-context-' + this.index);

        // Set initial values and add event listeners
        if (temperatureSlider) {
            temperatureSlider.value = this.savedTemperature ?? defaultTemperature;
            temperatureSlider.dispatchEvent(new Event('input'));

            temperatureSlider.addEventListener('input', () => {
                this.savedTemperature = temperatureSlider.value;
            });
        }

        if (maxTokensSlider) {
            maxTokensSlider.value = this.savedMaxTokens ?? defaultMaxTokens;
            maxTokensSlider.dispatchEvent(new Event('input'));

            maxTokensSlider.addEventListener('input', () => {
                this.savedMaxTokens = parseInt(maxTokensSlider.value, 10);
            });
        }

        if (maxContextSizeSlider) {
            maxContextSizeSlider.value = this.savedMaxContextSize ?? defaultMaxContextSize;
            maxContextSizeSlider.dispatchEvent(new Event('input'));

            maxContextSizeSlider.addEventListener('input', () => {
                this.savedMaxContextSize = parseInt(maxContextSizeSlider.value, 10);
            });
        }


        // Event listener for maxContextSizeSlider
        if (maxContextSizeSlider) {
            maxContextSizeSlider.addEventListener('input', () => {
                const maxContextSizeLabel = this.content.querySelector(`label[for='node-max-context-${this.index}']`);
                if (maxContextSizeLabel) {
                    const maxContextValue = parseInt(maxContextSizeSlider.value, 10);
                    const maxContextMax = parseInt(maxContextSizeSlider.max, 10);
                    const ratio = Math.round((maxContextValue / maxContextMax) * 100);
                    maxContextSizeLabel.innerText = `Context: ${ratio}% (${maxContextValue} tokens)`;
                }
            });
        }

        // Handle synchronization if both sliders are present
        if (maxTokensSlider && maxContextSizeSlider) {
            autoContextTokenSync(maxTokensSlider, maxContextSizeSlider);
        }

        // Additional specific behaviors for other sliders can be added here
    }

    _setupAiNodeCheckBoxArrayListeners() {
        // Assuming each checkbox has a unique ID formatted as `${option.id}-checkbox-${llmNodeCount}`
        const checkboxes = this.content.querySelectorAll('.checkboxarray input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            // Check if savedCheckboxStates exists and then restore the saved state
            if (this.savedCheckboxStates && this.savedCheckboxStates.hasOwnProperty(checkbox.id)) {
                const savedState = this.savedCheckboxStates[checkbox.id];
                checkbox.checked = savedState;
            }

            // Attach event listener to save state on change
            checkbox.addEventListener('change', () => {
                if (!this.savedCheckboxStates) {
                    this.savedCheckboxStates = {};
                }
                this.savedCheckboxStates[checkbox.id] = checkbox.checked;
            });
        });
    }

    _setupAiNodeCustomInstructionsListeners() {
        // Fetch the custom instructions textarea
        const customInstructionsTextarea = this.content.querySelector(`#custom-instructions-textarea-${this.index}`);

        if (customInstructionsTextarea) {
            // Restore the saved value if it exists
            if (this.savedCustomInstructions !== undefined) {
                customInstructionsTextarea.value = this.savedCustomInstructions;
            }

            // Attach event listener to save value on input
            customInstructionsTextarea.addEventListener('input', () => {
                this.savedCustomInstructions = customInstructionsTextarea.value;
            });
        }
    }

    onResize(newWidth, newHeight) {
        super.onResize(newWidth, newHeight);
        // Find the aiNodeWrapperDiv for this specific node. Use a more specific selector if needed.
        const aiNodeWrapperDiv = this.ainodewrapperDiv;

        // If aiNodeWrapperDiv exists, set its dimensions
        if (aiNodeWrapperDiv) {
            aiNodeWrapperDiv.style.width = `${newWidth}px`;
            aiNodeWrapperDiv.style.height = `${newHeight}px`;
        }
    }

    async sendLLMNodeMessage( message = null) {
        if (this.aiResponding) {
            console.log('AI is currently responding. Please wait for the current response to complete before sending a new message.');
            return;
        }

        const nodeIndex = this.index;

        const maxTokensSlider = this.content.querySelector('#node-max-tokens-' + this.index);
        //Initalize count for message trimming
        let contextSize = 0;

        // Checks if all connected nodes should be sent or just nodes up to the first found ai node in each branch. connected nodes (default)
        const useAllConnectedNodes = document.getElementById('use-all-connected-ai-nodes').checked;

        // Choose the function based on checkbox state
        let allConnectedNodes = useAllConnectedNodes ? getAllConnectedNodes(this) : getAllConnectedNodes(this, true);

        // Determine if there are any connected AI nodes
        let hasConnectedAiNode = allConnectedNodes.some(n => n.isLLMNode);


        //Use Prompt area if message is not passed.
        this.latestUserMessage = message ? message : this.promptTextArea.value;
        // Clear the prompt textarea
        this.promptTextArea.value = '';
        this.promptTextArea.dispatchEvent(new Event('input'));

        //Initialize messages array.
        let nodeTitle = this.getTitle();
        let aiIdentity = nodeTitle ? `${nodeTitle} (Ai)` : "Ai";


        let messages = [
            {
                role: "system",
                content: `YOU (${aiIdentity}) are responding within an Ai node. CONNECTED NODES are SHARED as system messages. Triple backtick and label any codeblocks`
            },
        ];

        let LocalLLMSelect = document.getElementById(this.LocalLLMSelectID);
        const LocalLLMSelectValue = LocalLLMSelect.value;
        let selectedModel;

        // Logic for dynamic model switching based on connected nodes
        const hasImageNodes = allConnectedNodes.some(node => node.isImageNode);
        selectedModel = determineModel(LocalLLMSelectValue, hasImageNodes);

        function determineModel(LocalLLMValue, hasImageNodes) {
            if (hasImageNodes) {
                return 'gpt-4-vision-preview'; // Switch to vision model if image nodes are present
            } else if (LocalLLMValue === 'OpenAi') {
                const globalModelSelect = document.getElementById('model-select');
                return globalModelSelect.value; // Use global model selection
            } else {
                return LocalLLMValue; // Use the local model selection
            }
        }

        const isVisionModel = selectedModel.includes('gpt-4-vision');
        const isAssistant = selectedModel.includes('1106');
        console.log('Selected Model:', selectedModel, "Vision", isVisionModel, "Assistant", isAssistant);
        // Fetch the content from the custom instructions textarea using the nodeIndex
        const customInstructionsTextarea = document.getElementById(`custom-instructions-textarea-${nodeIndex}`);
        const customInstructions = customInstructionsTextarea ? customInstructionsTextarea.value.trim() : "";

        // Append custom instructions if they exist.
        if (customInstructions.length > 0) {
            messages.push({
                role: "system",
                content: `RETRIEVE INSIGHTS FROM and ADHERE TO the following user-defined CUSTOM INSTRUCTIONS: ${customInstructions}`
            });
        }

        if (hasConnectedAiNode) {
            this.shouldAppendQuestion = true;
        } else {
            this.shouldAppendQuestion = false;
        }

        if (this.shouldAppendQuestion) {
            messages.push({
                role: "system",
                content: `LAST LINE of your response PROMPTS CONNECTED Ai nodes.
ARCHITECT profound, mission-critical QUERIES to Ai nodes.
SYNTHESIZE cross-disciplinary CONVERSATIONS.
Take INITIATIVE to DECLARE the TOPIC of FOCUS.`
            });
        }


        if (document.getElementById(`code-checkbox-${nodeIndex}`).checked) {
            messages.push(aiNodeCodeMessage());
        }

        if (document.getElementById("instructions-checkbox").checked) {
            messages.push(instructionsMessage());
        }

        const truncatedRecentContext = getLastPromptsAndResponses(2, 150, this.id);

        let wikipediaSummaries;
        let keywordsArray = [];
        let keywords = '';

        if (isWikipediaEnabled(nodeIndex)) {

            // Call generateKeywords function to get keywords
            const count = 3; // Change the count value as needed
            keywordsArray = await generateKeywords(this.latestUserMessage, count, truncatedRecentContext);

            // Join the keywords array into a single string
            keywords = keywordsArray.join(' ');
            const keywordString = keywords.replace("Keywords: ", "");
            const splitKeywords = keywordString.split(',').map(k => k.trim());
            const firstKeyword = splitKeywords[0];
            // Convert the keywords string into an array by splitting on spaces

            wikipediaSummaries = await getWikipediaSummaries([firstKeyword]);
            console.log("wikipediasummaries", wikipediaSummaries);
        } else {
            wikipediaSummaries = "Wiki Disabled";
        }


        //console.log("Keywords array:", keywords);

        const wikipediaMessage = {
            role: "system",
            content: `Wikipedia Summaries (Keywords: ${keywords}): \n ${Array.isArray(wikipediaSummaries)
                ? wikipediaSummaries
                    .filter(s => s !== undefined && s.title !== undefined && s.summary !== undefined)
                    .map(s => s.title + " (Relevance Score: " + s.relevanceScore.toFixed(2) + "): " + s.summary)
                    .join("\n\n")
                : "Wiki Disabled"
            } END OF SUMMARIES`
        };

        if (isWikipediaEnabled(nodeIndex)) {
            messages.push(wikipediaMessage);
        }

        // Use the node-specific recent context when calling constructSearchQuery
        const searchQuery = await constructSearchQuery(this.latestUserMessage, truncatedRecentContext, this);
        if (searchQuery === null) {
            return; // Return early if a link node was created directly
        }

        let searchResultsData = null;
        let searchResults = [];

        if (isGoogleSearchEnabled(nodeIndex)) {
            searchResultsData = await performSearch(searchQuery);
        }

        if (searchResultsData) {
            searchResults = processSearchResults(searchResultsData);
            searchResults = await getRelevantSearchResults(this.latestUserMessage, searchResults);
        }

        displaySearchResults(searchResults);

        const searchResultsContent = searchResults.map((result, index) => {
            return `Search Result ${index + 1}: ${result.title} - ${result.description.substring(0, 100)}...\n[Link: ${result.link}]\n`;
        }).join('\n');

        const googleSearchMessage = {
            role: "system",
            content: "Google Search RESULTS displayed to user:" + searchResultsContent
        };

        if (document.getElementById(`google-search-checkbox-${nodeIndex}`).checked) {
            messages.push(googleSearchMessage);
        }

        if (isEmbedEnabled(this.index)) {
            // Obtain relevant keys based on the user message and recent context
            const relevantKeys = await getRelevantKeys(this.latestUserMessage, truncatedRecentContext, searchQuery);

            // Get relevant chunks based on the relevant keys
            const relevantChunks = await getRelevantChunks(this.latestUserMessage, searchResults, topN, relevantKeys);
            const topNChunksContent = groupAndSortChunks(relevantChunks, MAX_CHUNK_SIZE);

            // Construct the embed message
            const embedMessage = {
                role: "system",
                content: `Top ${topN} MATCHED chunks of TEXT from extracted WEBPAGES:\n` + topNChunksContent + `\n Use the given chunks as context. CITE your sources!`
            };

            messages.push(embedMessage);
        }

        let allConnectedNodesData = getAllConnectedNodesData(this, true);
        let totalTokenCount = getTokenCount(messages);
        let remainingTokens = Math.max(0, maxTokensSlider.value - totalTokenCount);
        const maxContextSize = this.savedMaxContextSize;
        // const maxContextSize = document.getElementById(`node-max-context-${nodeIndex}`).value;

        let textNodeInfo = [];
        let llmNodeInfo = [];
        let imageNodeInfo = [];

        const TOKEN_COST_PER_IMAGE = 150; // Flat token cost assumption for each image


        if (isVisionModel) {
            allConnectedNodes.forEach(connectedNode => {
                if (connectedNode.isImageNode) {
                    const imageData = getImageNodeData(connectedNode);
                    if (imageData && remainingTokens >= TOKEN_COST_PER_IMAGE) {
                        // Construct an individual message for each image
                        messages.push({
                            role: 'user',
                            content: [imageData] // Contains only the image data
                        });
                        remainingTokens -= TOKEN_COST_PER_IMAGE; // Deduct the token cost for this image
                    } else {
                        console.warn('Not enough tokens to include the image:', connectedNode);
                    }
                }
            });
        }


        let messageTrimmed = false;

        allConnectedNodesData.sort((a, b) => a.isLLM - b.isLLM);

        allConnectedNodesData.forEach(info => {
            if (info.data && info.data.replace) {
                let tempInfoList = info.isLLM ? llmNodeInfo : textNodeInfo;
                [remainingTokens, totalTokenCount, messageTrimmed] = LLMOldNode._updateInfoList(
                    info, tempInfoList, remainingTokens, totalTokenCount, maxContextSize
                );
            }
        });

        // For Text Nodes
        if (textNodeInfo.length > 0) {
            let intro = "Text nodes CONNECTED to MEMORY:";
            messages.push({
                role: "system",
                content: intro + "\n\n" + textNodeInfo.join("\n\n")
            });
        }

        // For LLM Nodes
        if (llmNodeInfo.length > 0) {
            let intro = "All AI nodes you are CONVERSING with:";
            messages.push({
                role: "system",
                content: intro + "\n\n" + llmNodeInfo.join("\n\n")
            });
        }

        if (messageTrimmed) {
            messages.push({
                role: "system",
                content: "Previous messages trimmed."
            });
        }

        totalTokenCount = getTokenCount(messages);
        remainingTokens = Math.max(0, maxTokensSlider.value - totalTokenCount);

        // calculate contextSize again
        contextSize = Math.min(remainingTokens, maxContextSize);

        // Init value of getLastPromptsAndResponses
        let lastPromptsAndResponses;
        lastPromptsAndResponses = getLastPromptsAndResponses(20, contextSize, this.id);

        // Append the user prompt to the AI response area with a distinguishing mark and end tag
        this.aiResponseTextArea.value += `\n\n${PROMPT_IDENTIFIER} ${this.latestUserMessage}\n`;
        // Trigger the input event programmatically
        this.aiResponseTextArea.dispatchEvent(new Event('input'));

        let wolframData;
        if (document.getElementById(`enable-wolfram-alpha-checkbox-${nodeIndex}`).checked) {
            const wolframContext = getLastPromptsAndResponses(2, 300, this.id);
            wolframData = await fetchWolfram(this.latestUserMessage, true, this, wolframContext);
        }

        if (wolframData) {
            const { wolframAlphaTextResult } = wolframData;
            createWolframNode("", wolframData);

            const wolframAlphaMessage = {
                role: "system",
                content: `The Wolfram result has ALREADY been returned based off the current user message. INSTEAD of generating a new query, USE the following Wolfram result as CONTEXT: ${wolframAlphaTextResult}`
            };

            console.log("wolframAlphaTextResult:", wolframAlphaTextResult);
            messages.push(wolframAlphaMessage);

            // Redefine lastPromptsAndResponses after Wolfram's response.
            lastPromptsAndResponses = getLastPromptsAndResponses(10, contextSize, this.id);
        }

        if (lastPromptsAndResponses.trim().length > 0) {
            messages.push({
                role: "system",
                content: `CONVERSATION HISTORY:${lastPromptsAndResponses}`
            });
        }


        //Finally, send the user message last.
        messages.push({
            role: "user",
            content: this.latestUserMessage
        });


        this.aiResponding = true;
        this.userHasScrolled = false;

        // Get the loading and error icons
        let aiLoadingIcon = document.getElementById(`aiLoadingIcon-${nodeIndex}`);
        let aiErrorIcon = document.getElementById(`aiErrorIcon-${nodeIndex}`);

        // Hide the error icon and show the loading icon
        aiErrorIcon.style.display = 'none'; // Hide error icon
        aiLoadingIcon.style.display = 'block'; // Show loading icon


        // Re-evaluate the state of connected AI nodes
        function updateConnectedAiNodeState() {
            let allConnectedNodes = useAllConnectedNodes ? getAllConnectedNodes(this) : getAllConnectedNodes(this, true);
            return allConnectedNodes.some(n => n.isLLMNode);
        }

        const clickQueues = {};  // Contains a click queue for each AI node
        // Initiates helper functions for aiNode Message loop.
        const aiNodeMessageLoop = new AiNodeMessageLoop(this, allConnectedNodes, clickQueues);

        const haltCheckbox = this.haltCheckbox;

        // Local LLM call
        if (document.getElementById("localLLM").checked && selectedModel !== 'OpenAi') {
            window.generateLocalLLMResponse(this, messages)
                .then(async (fullMessage) => {
                    this.aiResponding = false;
                    aiLoadingIcon.style.display = 'none';

                    hasConnectedAiNode = updateConnectedAiNodeState(); // Update state right before the call

                    if (this.shouldContinue && this.shouldAppendQuestion && hasConnectedAiNode && !this.aiResponseHalted) {
                        await aiNodeMessageLoop.questionConnectedAiNodes(fullMessage);
                    }
                })
                .catch((error) => {
                    if (haltCheckbox) {
                        haltCheckbox.checked = true;
                    }
                    console.error(`An error occurred while getting response: ${error}`);
                    aiErrorIcon.style.display = 'block';
                });
        } else {
            // AI call
            callchatLLMnode(messages, this, true, selectedModel)
                .finally(async () => {
                    this.aiResponding = false;
                    aiLoadingIcon.style.display = 'none';

                    hasConnectedAiNode = updateConnectedAiNodeState(); // Update state right before the call

                    if (this.shouldContinue && this.shouldAppendQuestion && hasConnectedAiNode && !this.aiResponseHalted) {
                        const aiResponseText = this.aiResponseTextArea.value;
//                    const quotedTexts = await getQuotedText(aiResponseText);

                        let textToSend = await getLastLineFromTextArea(this.aiResponseTextArea);

                        await aiNodeMessageLoop.questionConnectedAiNodes(textToSend);
                    }
                })
                .catch((error) => {
                    if (haltCheckbox) {
                        haltCheckbox.checked = true;
                    }
                    console.error(`An error occurred while getting response: ${error}`);
                    aiErrorIcon.style.display = 'block';
                });
        }
    }

    static _updateInfoList(info, tempInfoList, remainingTokens, totalTokenCount, maxContextSize) {
        let cleanedData = info.data.replace("Text Content:", "");

        if (cleanedData.trim()) {
            let tempString = tempInfoList.join("\n\n") + "\n\n" + cleanedData;
            let tempTokenCount = getTokenCount([{ content: tempString }]);

            if (tempTokenCount <= remainingTokens && totalTokenCount + tempTokenCount <= maxContextSize) {
                tempInfoList.push(cleanedData);
                remainingTokens -= tempTokenCount;
                totalTokenCount += tempTokenCount;
                return [remainingTokens, totalTokenCount, false];
            } else {
                return [remainingTokens, totalTokenCount, true];
            }
        }
        return [remainingTokens, totalTokenCount, false];
    }
}

function createLLMOldNode(name = '', sx = undefined, sy = undefined, x = undefined, y = undefined) {
    return new LLMOldNode({
        name: name,
        sx: sx,
        sy: sy,
        x: x,
        y: y
    });
    // return new LLMOldNode(name, undefined, sx, sy, x, y);
}

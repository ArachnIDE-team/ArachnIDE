
const llmOptions = [
    { id: 'google-search', label: 'Search' },
    { id: 'code', label: 'Code' },
    { id: 'halt-questions', label: 'Halt' },
    { id: 'embed', label: 'Data' },
    { id: 'enable-wolfram-alpha', label: 'Wolfram' },
    { id: 'wiki', label: 'Wiki' }
];

class AiNodeMessageLoop {
    constructor(node, allConnectedNodes, clickQueues) {
        this.node = node;
        this.allConnectedNodes = allConnectedNodes;
        this.clickQueues = clickQueues || {}; // If clickQueues is not passed, _initialize as an empty object
    }

    updateConnectedNodes() {
        const useAllConnectedNodes = document.getElementById('use-all-connected-ai-nodes').checked;
        this.allConnectedNodes = useAllConnectedNodes
            ? getAllConnectedNodes(this.node)
            : getAllConnectedNodes(this.node, true);
    }

    async processClickQueue(nodeId) {
        const queue = this.clickQueues[nodeId] || [];
        while (true) {
            if (queue.length > 0) {
                const connectedNode = queue[0].connectedNode;

                // If the node is not connected or the response is halted,
                // break out of the loop to stop processing this node's queue.
                if (connectedNode.aiResponseHalted) {
                    break;
                }

                // Check if AI is not responding to attempt the click again
                if (!connectedNode.aiResponding) {
                    const { sendButton } = queue.shift();
                    sendButton.click();
                }
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    async questionConnectedAiNodes(lastLine) {
        // Retrieve edge directionalities for the main node
        const edgeDirectionalities = this.node.getEdgeDirectionalities();

        this.updateConnectedNodes();

        for (const connectedNode of this.allConnectedNodes) {
            if (connectedNode.isLLMNode) {
                let uniqueNodeId = connectedNode.index;

                // Find the edge directionality related to the connected node
                const edgeDirectionality = edgeDirectionalities.find(ed => ed.edge.pts.includes(connectedNode));

                // Skip sending message if the directionality is outgoing from the main node
                if (edgeDirectionality && edgeDirectionality.directionality === "outgoing") {
                    console.log(`Skipping node ${uniqueNodeId} due to outgoing directionality.`);
                    continue;
                }

                if (connectedNode.aiResponseHalted || this.node.aiResponseHalted) {
                    console.warn(`AI response for node ${uniqueNodeId} or its connected node is halted. Skipping this node.`);
                    continue;
                }

                let promptElement = document.getElementById(`nodeprompt-${uniqueNodeId}`);
                let sendButton = document.getElementById(`prompt-form-${uniqueNodeId}`);

                if (!promptElement || !sendButton) {
                    console.error(`Elements for ${uniqueNodeId} are not found`);
                    continue;
                }

                if (promptElement instanceof HTMLTextAreaElement) {
                    promptElement.value += `\n${lastLine}`;
                } else if (promptElement instanceof HTMLDivElement) {
                    promptElement.innerHTML += `<br>${lastLine}`;
                } else {
                    console.error(`Element with ID prompt-${uniqueNodeId} is neither a textarea nor a div`);
                }

                promptElement.dispatchEvent(new Event('input', { 'bubbles': true, 'cancelable': true }));

                if (!this.clickQueues[uniqueNodeId]) {
                    this.clickQueues[uniqueNodeId] = [];
                    this.processClickQueue(uniqueNodeId);  // Start processing this node's click queue
                }

                this.clickQueues[uniqueNodeId].push({ sendButton, connectedNode });
            }
        }
    }
}

class LLMNode extends LLMAgentNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        sx: undefined,
        sy: undefined,
        x: undefined,
        y: undefined,
        saved: undefined,
        saveData: undefined,
    }
    static SAVE_PROPERTIES = [ 'savedCheckboxStates' ];

    // constructor(name = '', content = undefined, sx = undefined, sy = undefined, x = undefined, y = undefined){

    constructor(configuration = LLMNode.DEFAULT_CONFIGURATION){
        configuration = {...LLMNode.DEFAULT_CONFIGURATION, ...configuration}
        let content = LLMNode._getContentElement(configuration);
        if (!configuration.saved) {// Create LLMNode
            super({...configuration, content, ...WindowedNode.getNaturalScaleParameters()});
        } else {// Restore LLMNode
            super({ content, ...configuration })
        }
    }

    static _getContentElement(configuration = LLMNode.DEFAULT_CONFIGURATION){

        // Create the AI response textarea
        let aiResponseTextArea = document.createElement("textarea");
        const index = configuration.saved ? configuration.saveData.json.index : generateUUID();
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
        const LocalLLMSelect = LLMNode._createAndConfigureLocalLLMDropdown(index);

        const temperatureSliderContainer = LLMNode._createSlider(`node-temperature-${index}`, 'Temperature', initialTemperature, 0, 1, 0.1);
        const maxTokensSliderContainer = LLMNode._createSlider(`node-max-tokens-${index}`, 'Max Tokens', initialMaxTokens, 10, 16000, 1);
        const maxContextSizeSliderContainer = LLMNode._createSlider(`node-max-context-${index}`, 'Max Context', initialMaxContextSize, 1, initialMaxTokens, 1);


        // Create settings container
        const aiNodeSettingsContainer = LLMNode._createSettingsContainer();


        // Add the dropdown (LocalLLMSelect) into settings container
        aiNodeSettingsContainer.appendChild(LocalLLMSelect);  // LocalLLMSelect is the existing dropdown
        aiNodeSettingsContainer.appendChild(temperatureSliderContainer);
        aiNodeSettingsContainer.appendChild(maxTokensSliderContainer);
        aiNodeSettingsContainer.appendChild(maxContextSizeSliderContainer);

        const firstSixOptions = llmOptions.slice(0, 6);
        const checkboxArray1 = LLMNode._createCheckboxArray(index, firstSixOptions);
        aiNodeSettingsContainer.appendChild(checkboxArray1);

        const customInstructionsTextarea = LLMNode._createCustomInstructionsTextarea(index);
        aiNodeSettingsContainer.appendChild(customInstructionsTextarea);

        // Add settings container to the ainodewrapperDiv
        ainodewrapperDiv.appendChild(aiNodeSettingsContainer);

        return [ainodewrapperDiv, aiResponseTextArea, index];
    }

    afterInit() {
        this.haltCheckbox = this.content.querySelector('input[id^="halt-questions-checkbox"]');
        // Setup event listeners
        this._setupAiNodeCheckBoxArrayListeners()
        super.afterInit();
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
            const relevantChunks = await getRelevantChunks(this.latestUserMessage, searchResults, dropdown.dataTab.topN, relevantKeys);
            const topNChunksContent = groupAndSortChunks(relevantChunks, dropdown.dataTab.maxChunkSize);

            // Construct the embed message
            const embedMessage = {
                role: "system",
                content: `Top ${dropdown.dataTab.topN} MATCHED chunks of TEXT from extracted WEBPAGES:\n` + topNChunksContent + `\n Use the given chunks as context. CITE your sources!`
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
                [remainingTokens, totalTokenCount, messageTrimmed] = LLMNode._updateInfoList(
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
                    console.log("callchatLLMnode.finally, this:", this)
                    this.aiResponding = false;
                    aiLoadingIcon.style.display = 'none';

                    hasConnectedAiNode = updateConnectedAiNodeState.bind(this)(); // Update state right before the call

                    if (this.shouldContinue && this.shouldAppendQuestion && hasConnectedAiNode && !this.aiResponseHalted) {
                        const aiResponseText = this.aiResponseTextArea.value;
//                    const quotedTexts = await getQuotedText(aiResponseText);

                        let textToSend = await getLastLineFromTextArea(this.aiResponseTextArea);

                        await aiNodeMessageLoop.questionConnectedAiNodes(textToSend);
                    }
                })
                .catch((error) => {
                    console.log("callchatLLMnode.catch, this:", this)
                    if (haltCheckbox) {
                        haltCheckbox.checked = true;
                    }
                    console.error(`An error occurred while getting response: ${error}\n${error.stack}`);
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

function createLLMNode(name = '', sx = undefined, sy = undefined, x = undefined, y = undefined) {
    return new LLMNode({
        name: name,
        sx: sx,
        sy: sy,
        x: x,
        y: y
    });
    // return new LLMNode(name, undefined, sx, sy, x, y);
}

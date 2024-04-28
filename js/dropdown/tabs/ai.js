
class AITab {
    constructor() {
        document.addEventListener('DOMContentLoaded', this.updateCustomOptions.bind(this));

        document.getElementById('model-temperature').addEventListener('input', this.updateLabel.bind(this));

        document.getElementById('Google-search-api-key-input').value = localStorage.getItem('googleSearchApiKey') || '';
        document.getElementById('Google-search-engine-id-input').value = localStorage.getItem('googleSearchEngineId') || '';
        document.getElementById('OpenAI-api-key-input').value = localStorage.getItem('openaiApiKey') || '';
        document.getElementById('HuggingFace-api-key-input').value = localStorage.getItem('huggingfaceApiKey') || '';
        document.getElementById('Anthropic-api-key-input').value = localStorage.getItem('anthropicApiKey') || '';
        document.getElementById('GoogleGemini-api-key-input').value = localStorage.getItem('googleApiKey') || '';
        document.getElementById('Mistral-api-key-input').value = localStorage.getItem('mistralApiKey') || '';
        document.getElementById('Cohere-api-key-input').value = localStorage.getItem('cohereApiKey') || '';
        document.getElementById('Wolfram-api-key-input').value = localStorage.getItem('wolframApiKey') || '';

        document.getElementById('node-count-slider').addEventListener('input', function(e) {
            document.getElementById('node-slider-label').innerText = 'Top ' + this.value + '\nnodes';
        }); // Element bound
    }

    // TO-DO: Review
    setupCustomDropdown(select, aiNode = false) {
        // Create the main custom dropdown container
        let selectReplacer = document.createElement('div');
        selectReplacer.className = 'select-replacer closed'; // add 'closed' class by default

        // Create the currently selected value container
        let selectedDiv = document.createElement('div');
        selectedDiv.innerText = select.options[select.selectedIndex].innerText;
        selectReplacer.appendChild(selectedDiv);

        // Create the dropdown options container
        let optionsReplacer = document.createElement('div');
        optionsReplacer.className = 'options-replacer custom-scrollbar scrollable-content';
        optionsReplacer.style.height = "200px";
        optionsReplacer.style.overflowY = "scroll";

        // Append the options container to the main dropdown container
        selectReplacer.appendChild(optionsReplacer);


        // Replace the original select with the custom dropdown
        let container = document.createElement('div');
        container.className = 'select-container';
        select.parentNode.insertBefore(container, select);
        container.appendChild(selectReplacer);
        container.appendChild(select);
        select.style.display = 'none'; // Hide the original select

        this.addEventListenersToCustomDropdown(select, aiNode);

    }

    // TO-DO: Review
    addEventListenersToCustomDropdown(select, aiNode) {
        let container = select.parentNode;
        let selectReplacer = container.querySelector('.select-replacer');
        let optionsReplacer = selectReplacer.querySelector('.options-replacer');
        let selectedDiv = selectReplacer.querySelector('div');

        // Reference to local LLM Checkbox
        let localLLMCheckbox = document.getElementById("localLLM");

        // Toggle dropdown on click
        let isPendingFrame = false;

        // Create individual options
        Array.from(select.options).forEach((option, index) => {
            let optionDiv = document.createElement('div');
            optionDiv.innerText = option.innerText;
            optionDiv.setAttribute('data-value', option.value);
            optionDiv.className = option.className;

            // Highlight the selected option
            if (select.selectedIndex === index) {
                optionDiv.classList.add('selected');
            }

            if (aiNode) {  // AI node specific logic
                // Initial visibility based on checkbox state
                if (option.value === 'Default' ||
                    (!option.value.startsWith('webllm:') && !localLLMCheckbox.checked) ||
                    (option.value.startsWith('webllm:') && localLLMCheckbox.checked)) {
                    optionDiv.style.display = 'block';
                } else {
                    optionDiv.style.display = 'none';
                }
            }

            optionDiv.addEventListener('click', function (event) {
                event.stopPropagation(); // Stops the event from bubbling up

                select.value = option.value;
                selectedDiv.innerText = option.innerText;

                // Remove `selected` class from previously selected option
                const previousSelected = optionsReplacer.querySelector('.selected');
                if (previousSelected) {
                    previousSelected.classList.remove('selected');
                }
                // Add `selected` class to the new selected option
                optionDiv.classList.add('selected');

                // Trigger the original dropdown's change event
                let changeEvent = new Event('change', {
                    'bubbles': true,
                    'cancelable': true
                });
                select.dispatchEvent(changeEvent);
            });
            optionsReplacer.appendChild(optionDiv);
        });

        selectReplacer.addEventListener('click', function (event) {
            // Get all the select containers
            const selectContainers = document.querySelectorAll('.select-container');
            // Reset z-index for all
            selectContainers.forEach((el) => el.style.zIndex = "20");

            if (optionsReplacer.classList.contains('show')) {
                if (!event.target.closest('.options-replacer')) {
                    // Dropdown is open and click was outside of the options, so close it
                    window.requestAnimationFrame(() => {
                        optionsReplacer.classList.remove('show');
                        selectReplacer.classList.add('closed');
                        container.style.zIndex = "20"; // reset the z-index of the parent container
                        isPendingFrame = false;
                    });
                    isPendingFrame = true;
                }
            } else {
                // Dropdown is closed, so open it
                container.style.zIndex = "30"; // increase the z-index of the parent container
                if (!isPendingFrame) {
                    window.requestAnimationFrame(() => {
                        optionsReplacer.classList.add('show');
                        selectReplacer.classList.remove('closed');
                        isPendingFrame = false;
                    });
                    isPendingFrame = true;
                }
            }
        });
    }

    // Previously anonymous inline
    updateCustomOptions(){
        // Setup for all existing custom-selects
        let selects = document.querySelectorAll('select.custom-select');
        selects.forEach(select => this.setupModelSelect(select, select.id === 'embeddingsModelSelect'));
    }

    // TO-DO: Get rid of localStorage
    setupModelSelect(selectElement, isEmbeddingsSelect = false) {
        if (selectElement) {
            this.setupCustomDropdown(selectElement);

            // Restore selection from local storage
            const storedValue = localStorage.getItem(selectElement.id);
            if (storedValue) {
                selectElement.value = storedValue;
                AITab.updateSelectedOptionDisplay(selectElement);
                if (isEmbeddingsSelect) {
                    AITab.checkLocalEmbeddingsCheckbox(selectElement);
                }
            }

            // Set change event listener for caching selected value and updating display
            selectElement.addEventListener('change', function () {
                localStorage.setItem(this.id, this.value);
                AITab.updateSelectedOptionDisplay(this);
                if (isEmbeddingsSelect) {
                    AITab.checkLocalEmbeddingsCheckbox(this);
                }
            });
        }
    }

    //Added static
    static updateSelectedOptionDisplay(selectElement) {
        // Update the custom dropdown display to show the selected value
        let selectedDiv = selectElement.parentNode.querySelector('.select-replacer > div');
        if (selectedDiv) {
            selectedDiv.innerText = selectElement.options[selectElement.selectedIndex].innerText;
        }

        // Update highlighting in the custom dropdown options
        let optionsReplacer = selectElement.parentNode.querySelector('.options-replacer');
        if (optionsReplacer) {
            let optionDivs = optionsReplacer.querySelectorAll('div');
            optionDivs.forEach(div => {
                if (div.getAttribute('data-value') === selectElement.value) {
                    div.classList.add('selected');
                } else {
                    div.classList.remove('selected');
                }
            });
        }
    }

    //Added static
    static checkLocalEmbeddingsCheckbox(selectElement) {
        const localEmbeddingsCheckbox = document.getElementById('local-embeddings-checkbox');
        localEmbeddingsCheckbox.checked = selectElement.value === 'local-embeddings';
    }

    updateLabel() {
        const temperature = document.getElementById('model-temperature').value;
        document.getElementById('model-temperature-label').innerText = 'Temperature:\n ' + temperature;
    }

    saveKeys() {
        // Save keys to local storage
        localStorage.setItem('googleSearchApiKey', document.getElementById('Google-search-api-key-input').value);
        localStorage.setItem('googleSearchEngineId', document.getElementById('Google-search-engine-id-input').value);
        localStorage.setItem('openaiApiKey', document.getElementById('OpenAI-api-key-input').value);
        localStorage.setItem('huggingfaceApiKey', document.getElementById('HuggingFace-api-key-input').value);
        localStorage.setItem('anthropicApiKey', document.getElementById('Anthropic-api-key-input').value);
        localStorage.setItem('googleApiKey', document.getElementById('GoogleGemini-api-key-input').value);
        localStorage.setItem('mistralApiKey', document.getElementById('Mistral-api-key-input').value);
        localStorage.setItem('cohereApiKey', document.getElementById('Cohere-api-key-input').value);
        localStorage.setItem('wolframApiKey', document.getElementById('Wolfram-api-key-input').value);
    }

    async saveKeysToFile() {
        // Gather the keys



        const keys = {
            googleSearchApiKey: document.getElementById('Google-search-api-key-input').value || '',
            googleSearchEngineId: document.getElementById('Google-search-engine-id-input').value || '',
            openaiApiKey: document.getElementById('OpenAI-api-key-input').value || '',
            huggingfaceApiKey: document.getElementById('HuggingFace-api-key-input').value || '',
            anthropicApiKey: document.getElementById('Anthropic-api-key-input').value || '',
            googleApiKey: document.getElementById('GoogleGemini-api-key-input').value || '',
            mistralApiKey: document.getElementById('Mistral-api-key-input').value || '',
            cohereApiKey: document.getElementById('Cohere-api-key-input').value || '',
            wolframApiKey: document.getElementById('Wolfram-api-key-input').value || '',
        };

        try {
            if ('showSaveFilePicker' in window) {
                const handle = await window.showSaveFilePicker({
                    types: [
                        {
                            description: 'Text Files',
                            accept: {
                                'text/plain': ['.txt'],
                            },
                        },
                    ],
                });
                const writable = await handle.createWritable();
                await writable.write(JSON.stringify(keys));
                await writable.close();
            } else {
                // Handle lack of support for showSaveFilePicker
                alert('Your browser does not support saving files.');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                alert('An error occurred while saving: ' + error);
            }
        }
    }

    async loadKeysFromFile() {
        try {
            if ('showOpenFilePicker' in window) {
                const [fileHandle] = await window.showOpenFilePicker();
                const file = await fileHandle.getFile();
                const contents = await file.text();

                const keys = JSON.parse(contents);
                document.getElementById('Google-search-api-key-input').value = keys.googleSearchApiKey || '';
                document.getElementById('Google-search-engine-id-input').value = keys.googleSearchEngineId || '';
                document.getElementById('OpenAI-api-key-input').value = keys.openaiApiKey || '';
                document.getElementById('HuggingFace-api-key-input').value = keys.huggingfaceApiKey || '';
                document.getElementById('Anthropic-api-key-input').value = keys.anthropicApiKey || '';
                document.getElementById('GoogleGemini-api-key-input').value = keys.googleApiKey || '';
                document.getElementById('Mistral-api-key-input').value = keys.mistralApiKey || '';
                document.getElementById('Cohere-api-key-input').value = keys.cohereApiKey || '';
                document.getElementById('Wolfram-api-key-input').value = keys.wolframApiKey || '';
            } else {
                // Handle lack of support for showOpenFilePicker
                alert('Your browser does not support opening files.');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                alert('An error occurred while loading: ' + error);
            }
        }
    }

    clearKeys() {
        // Clear keys from local storage
        localStorage.removeItem('googleSearchApiKey');
        localStorage.removeItem('googleSearchEngineId');
        localStorage.removeItem('openaiApiKey');

        localStorage.removeItem('huggingfaceApiKey');
        localStorage.removeItem('anthropicApiKey');
        localStorage.removeItem('googleApiKey');
        localStorage.removeItem('mistralApiKey');
        localStorage.removeItem('cohereApiKey');
        localStorage.removeItem('wolframApiKey');

        // Clear input fields
        document.getElementById('Google-search-api-key-input').value = '';
        document.getElementById('Google-search-engine-id-input').value = '';

        document.getElementById('OpenAI-api-key-input').value = '';

        document.getElementById('HuggingFace-api-key-input').value = '';
        document.getElementById('Anthropic-api-key-input').value = '';
        document.getElementById('GoogleGemini-api-key-input').value = '';
        document.getElementById('Mistral-api-key-input').value = '';
        document.getElementById('Cohere-api-key-input').value = '';

        document.getElementById('Wolfram-api-key-input').value = '';
    }

    autoGrow(event) {
        const textarea = event.target;
        // Temporarily make the height 'auto' so the scrollHeight is not affected by the current height
        textarea.style.height = 'auto';
        let maxHeight = 200;
        if (textarea.scrollHeight < maxHeight) {
            textarea.style.height = textarea.scrollHeight + 'px';
            textarea.style.overflowY = 'hidden';
        } else {
            textarea.style.height = maxHeight + 'px';
            textarea.style.overflowY = 'auto';
        }
    }

}
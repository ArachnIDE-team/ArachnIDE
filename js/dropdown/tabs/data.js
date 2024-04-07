class DataTab {
    constructor() {
        this.maxChunkSize = 400;
        let that = this;

        const maxChunkSizeSlider = document.getElementById('maxChunkSizeSlider');
        const maxChunkSizeValue = document.getElementById('maxChunkSizeValue');

        // Display the initial slider value
        maxChunkSizeValue.textContent = maxChunkSizeSlider.value;

        // Update the current slider value (each time you drag the slider handle)
        maxChunkSizeSlider.oninput = function () {
            that.maxChunkSize = this.value;
            maxChunkSizeValue.textContent = this.value;
        } // Element bound

        this.topN = 5;
        const topNSlider = document.getElementById('topNSlider');
        const topNValue = document.getElementById('topNValue');

        topNSlider.addEventListener('input', function () {
            that.topN = this.value;
            topNValue.textContent = this.value;
        }); // Element bound


        // Usage
        const maxTokensSlider = document.getElementById('max-tokens-slider');
        const maxContextSizeSlider = document.getElementById('max-context-size-slider');

        this.autoContextTokenSync(maxTokensSlider, maxContextSizeSlider);

        // UI updates for max tokens
        const maxTokensDisplay = document.getElementById('max-tokens-display');
        maxTokensSlider.addEventListener('input', function () {
            maxTokensDisplay.innerText = this.value;
        }); // Element bound

        // UI updates for max context size
        const maxContextSizeDisplay = document.getElementById('max-context-size-display');
        maxContextSizeSlider.addEventListener('input', function () {
            const maxContextValue = parseInt(this.value, 10);
            const maxContextMax = parseInt(this.max, 10);
            const ratio = Math.round((maxContextValue / maxContextMax) * 100);
            maxContextSizeDisplay.innerText = `Context: ${ratio}% \n(${maxContextValue} tokens)`;
        }); // Element bound

        maxContextSizeSlider.dispatchEvent(new Event('input'));

    }

    handleEmbeddingsSelection(selectElement) {
        const localEmbeddingsCheckbox = document.getElementById('local-embeddings-checkbox');

        if (selectElement.value === 'local-embeddings') {
            // Check the hidden checkbox when local embeddings is selected
            localEmbeddingsCheckbox.checked = true;
        } else {
            // Uncheck the hidden checkbox for other selections
            localEmbeddingsCheckbox.checked = false;
        }

        // Additional logic here if needed, e.g., saving the selection to localStorage
    }

    autoContextTokenSync(tokenSlider, contextSlider) {
        let lastUserSetRatio = parseInt(contextSlider.value, 10) / parseInt(contextSlider.max, 10);
        let isProgrammaticChange = false;

        // Listen to changes on tokenSlider
        tokenSlider.addEventListener('input', function () {
            const newMaxTokens = parseInt(this.value, 10);
            contextSlider.max = newMaxTokens;

            // Calculate the new value based on the last user-set ratio and the new max
            const newContextValue = Math.round(lastUserSetRatio * newMaxTokens);

            // Make the change and indicate that it's a programmatic change
            isProgrammaticChange = true;
            contextSlider.value = newContextValue;
            isProgrammaticChange = false;

            // Force a UI update for contextSlider
            contextSlider.dispatchEvent(new Event('input'));
        });

        // Listen to changes on contextSlider
        contextSlider.addEventListener('input', function () {
            // Update the last user-set ratio, but only if the change was not programmatic
            if (!isProgrammaticChange) {
                lastUserSetRatio = parseInt(this.value, 10) / parseInt(this.max, 10);
            }
        });
    }



}
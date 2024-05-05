// Using window as global scope (just for coherence, I would prefer globalThis)
window.modelOptions = () => [
    // new Option('Default', 'Default', false, true),

    // WebLLM
    new Option('Red Pajama 3B f32', 'webllm:RedPajama-INCITE-Chat-3B-v1-q4f32_0', false, false),
    new Option('Vicuna 7B f32', 'webllm:vicuna-v1-7b-q4f32_0', false, false),
    new Option('Llama 2 7B f32', 'webllm:Llama-2-7b-chat-hf-q4f32_1', false, false),
    new Option('Llama 2 13B f32', 'webllm:Llama-2-13b-chat-hf-q4f32_1', false, false),
    new Option('Llama 2 70B f16', 'webllm:Llama-2-70b-chat-hf-q4f16_1', false, false),
    new Option('WizardCoder 15B f32', 'webllm:WizardCoder-15B-V1.0-q4f32_1', false, false),


    // OpenAI
    new Option('GPT-3.5-turbo', 'openai:gpt-3.5-turbo', false, false),
    //new Option('GPT-3.5-turbo-16k', 'openai:gpt-3.5-turbo-16k', false, false),
    //new Option('GPT-3.5-turbo-0613', 'openai:gpt-3.5-turbo-0613', false, false),
    new Option('GPT-3.5-16k-0613', 'openai:gpt-3.5-turbo-16k-0613', false, false),
    new Option('GPT-4', 'openai:gpt-4', false, false),
    new Option('GPT-4-0613', 'openai:gpt-4-0613', false, false),
    new Option('GPT-4-vision', 'openai:gpt-4-vision-preview', false, false),
    new Option('GPT-3.5-1106', 'openai:gpt-3.5-turbo-1106', false, false),
    new Option('GPT-4-1106', 'openai:gpt-4-1106-preview', false, false),

    // HuggingFace
    new Option('BigScience Bloom', 'huggingface:bigscience/bloom', false, false),
    new Option('Meta Llama 3 8B', 'huggingface:meta-llama/Meta-Llama-3-8B', false, false),
    new Option('Meta Llama 3 8B', 'huggingface:meta-llama/Meta-Llama-3-8B-Instruct', false, false),
    new Option('Meta Code Llama 34B', 'huggingface:codellama/CodeLlama-34b-Instruct-hf', false, false),
    new Option('Mixtral 8x22B Instruct v0.1', 'huggingface:mistralai/Mixtral-8x22B-Instruct-v0.1', false, false),
    new Option('Mistral 7B Instruct v0.2', 'huggingface:mistralai/Mistral-7B-Instruct-v0.2', false, false),
    new Option('Mistral 7B Instruct v0.1', 'huggingface:mistralai/Mistral-7B-Instruct-v0.1', false, false),
    new Option('Mistral 7B v0.1', 'huggingface:mistralai/Mistral-7B-v0.1', false, false),
    new Option('Mixtral 8x22B v0.1', 'huggingface:mistralai/Mixtral-8x22B-v0.1', false, false),
    new Option('Mixtral 8x7B Instruct v0.1', 'huggingface:mistralai/Mixtral-8x7B-Instruct-v0.1', false, false),
    new Option('Mixtral 8x7B v0.1', 'huggingface:mistralai/Mixtral-8x7B-v0.1', false, false),
    new Option('BigCode Starcoder2 7B', 'huggingface:bigcode/starcoder2-7b', false, false),
    new Option('Bakllava 7B', 'huggingface:TIGER-Lab/Mantis-bakllava-7b', false, false),
    new Option('Falcon 7B', 'huggingface:tiiuae/falcon-7b', false, false),
    new Option('Falcon 7B Instruct', 'huggingface:tiiuae/falcon-7b-instruct', false, false),
    new Option('Falcon 40B', 'huggingface:tiiuae/falcon-40b', false, false),
    new Option('Falcon 40B Instruct', 'huggingface:tiiuae/falcon-40b-instruct', false, false),
    new Option('Llava 13B v1.5', 'huggingface:liuhaotian/llava-v1.5-13b', false, false),
    new Option('Llava 7B v1.5', 'huggingface:liuhaotian/llava-v1.5-7b', false, false),
    new Option('Llava 34B v1.6', 'huggingface:liuhaotian/llava-v1.6-34b', false, false),
    new Option('Llava-mistral 7B v1.6', 'huggingface:liuhaotian/llava-v1.6-mistral-7b', false, false),
    new Option('Llava-vicuna 13B v1.6', 'huggingface:liuhaotian/llava-v1.6-vicuna-13b', false, false),
    new Option('Llava-vicuna 7B v1.6', 'huggingface:liuhaotian/llava-v1.6-vicuna-7b', false, false),
    new Option('Neural-chat 7B v3-3', 'huggingface:Intel/neural-chat-7b-v3-3', false, false),
    new Option('Neural-chat 7B v3-1', 'huggingface:Intel/neural-chat-7b-v3-1', false, false),
    new Option('Openchat 7B 3.5 v0106', 'huggingface:openchat/openchat-3.5-0106', false, false),
    new Option('Openchat 7B 3.5 v1210', 'huggingface:openchat/openchat-3.5-1210', false, false),
    new Option('Vicuna 13B v1.5', 'huggingface:lmsys/vicuna-13b-v1.5', false, false),
    new Option('Vicuna 7B v1.5', 'huggingface:lmsys/vicuna-7b-v1.5', false, false),
    new Option('Vicuna 13B v1.5', 'huggingface:lmsys/vicuna-13b-v1.5-16k', false, false),
    new Option('Vicuna 7B v1.5', 'huggingface:lmsys/vicuna-7b-v1.5-16k', false, false),
    new Option('Vicuna 33B v1.3', 'huggingface:lmsys/vicuna-33b-v1.3', false, false),
    new Option('WizardCoder Python 34B v1.0', 'huggingface:jartine/WizardCoder-Python-34B-V1.0-llamafile', false, false),
    new Option('WizardLM v2 8x22B', 'huggingface:dreamgen/WizardLM-2-8x22B', false, false),
    new Option('WizardLM v2 7B', 'huggingface:dreamgen/WizardLM-2-7B', false, false),
    new Option('WizardLM uncensored 7B', 'huggingface:cognitivecomputations/WizardLM-7B-Uncensored', false, false),
    new Option('WizardLM uncensored 13B', 'huggingface:cognitivecomputations/WizardLM-13B-Uncensored', false, false),
    new Option('Zephyr beta 7B', 'huggingface:HuggingFaceH4/zephyr-7b-beta', false, false),
    new Option('Zephyr alpha 7B', 'huggingface:HuggingFaceH4/zephyr-7b-alpha', false, false),

    // Anthropic
    new Option('Anthropic Claude instant 1.2', 'anthropic:claude-instant-1.2', false, false),
    new Option('Anthropic Claude 2.0', 'anthropic:claude-2.0', false, false),
    new Option('Anthropic Claude 2.1', 'anthropic:claude-2.1', false, false),
    new Option('Anthropic Claude 3 Opus', 'anthropic:claude-3-opus-20240229', false, false),
    new Option('Anthropic Claude 3 Sonnet', 'anthropic:claude-3-sonnet-20240229', false, false),
    new Option('Anthropic Claude 3 Haiku', 'anthropic:claude-3-haiku-20240307', false, false),

    // Google
    new Option('Google Gemini 1.0 PRO', 'google:gemini-1.0-pro', false, false),
    new Option('Google Gemini 1.0 Vision PRO', 'google:gemini-1.0-pro-vision', false, false),

    // Mistral
    new Option('Open Mistral 7B', 'mistral:open-mistral-7b', false, false),
    new Option('Open Mixtral 8x7B', 'mistral:open-mixtral-8x7b', false, false),
    new Option('Open Mixtral 8x22B', 'mistral:open-mixtral-8x22b', false, false),
    new Option('Mistral Small', 'mistral:mistral-small', false, false),
    new Option('Mistral Medium', 'mistral:mistral-medium', false, false),
    new Option('Mistral Large', 'mistral:mistral-large', false, false),

    // Cohere
    new Option('Cohere Command', 'cohere:command', false, false),
    new Option('Cohere Command R', 'cohere:command-r', false, false),
    new Option('Cohere Command R+', 'cohere:command-r-plus', false, false),
].map((option) => {
    for (let modelWrapper of modelWrappers) {
        if(option.value.startsWith(modelWrapper.PREFIX)) option.className = modelWrapper.CLASSNAME
    }
    return option;
});

class ModelWrapper {
    // Handles the remote LLM model API call, for different providers and different models.
    // Encapsulates the complexity of message/chat/instruction handling, as well as providing the right keys etc...
    constructor(selectedOption) {
        this.selectedOption = selectedOption;
        this.failedAttempts = 0;
    }

    getAPIKey(){
        return "";
    }

    getAPIEndpoint(){
        return "";
    }

    async sendChat(messages, temperature, maxTokens, abortSignal, stream){
        return {};
    }

    async getTokenCount(messages){
        let text = "";
        for(let message of messages) {
            text += (message.content || message.message || message.code) + "\n";
        }
        let response = await fetch("http://localhost:1000/count-tokens",{
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                model: this.constructor.PREFIX + this.selectedOption,
                text
            })
        })
        if(!response.ok && this.failedAttempts === 0) {
            this.failedAttempts = 1;
            return await new Promise((resolve, reject) =>{
                this.setAPIKeyAndRetry(() => {
                    this.getTokenCount(messages).then((result) => {
                        resolve(result);
                    });
                })
            })
        }
        this.failedAttempts = 0;
        // const { count, approximation, model_info } = (await response.json());
        // return  (approximation ? "≈" : "") + count;
        return (await response.json());
    }

    setAPIKeyAndRetry(callback){
        let provider = this.constructor.PREFIX.replace(":", "")
        let key = this.getAPIKey();
        fetch("http://localhost:1000/set-api-key", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                provider,
                key
            })
        }).then(callback)
    }

    static getWrapper(selectedOption){
        for(let modelWrapper of modelWrappers) {
            if(selectedOption.startsWith(modelWrapper.PREFIX)) {
                return new modelWrapper(selectedOption);
            }
        }
        throw new TypeError("No model wrapper found for selected model: " + selectedOption);
    }

    supportsStreaming(){
        return false;
    }

    async handleStreamingForLLMNode(response, node) {
        throw new Error("Streaming not supported")
    }

    async handleResponseForLLMNode(response, node) {
        return "";
    }
}

class OpenAIModelWrapper extends ModelWrapper {
    static PREFIX = "openai:"
    static CLASSNAME = "openai-model-option"

    constructor(selectedOption) {
        super(selectedOption.substr(OpenAIModelWrapper.PREFIX.length))
    }

    getAPIKey(){
        return document.getElementById("OpenAI-api-key-input").value;
    }

    getAPIEndpoint(){
        return "https://api.openai.com/v1/chat/completions";
    }

    async sendChat(messages, temperature, maxTokens, abortSignal, stream){

        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", `Bearer ${this.getAPIKey()}`);

        const requestOptions = {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                model: this.selectedOption,
                messages: messages,
                max_tokens: maxTokens,
                temperature: temperature,
                stream: stream,
            }),
            signal: abortSignal,
        };

        return await fetch(this.getAPIEndpoint(), requestOptions);
    }

    supportsStreaming() {
        return true;
    }

    async handleStreamingForLLMNode(response, node) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let fullResponse = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done || !node.shouldContinue) break;

            buffer += decoder.decode(value, { stream: true });

            let contentMatch;
            while ((contentMatch = buffer.match(/"content":"((?:[^\\"]|\\.)*)"/)) !== null) {
                const content = JSON.parse('"' + contentMatch[1] + '"');
                if (!node.shouldContinue) break;

                if (content.trim() !== "[DONE]") {
                    await appendWithDelay(content, node, 30);
                }
                fullResponse += content; // append content to fullResponse
                buffer = buffer.slice(contentMatch.index + contentMatch[0].length);
            }
        }
        return fullResponse; // return the entire response
    }

    async handleResponseForLLMNode(response, node) {
        const data = await response.json();
        let fullResponse = `${data.choices[0].message.content.trim()}`;
        node.aiResponseTextArea.value += fullResponse;
        node.aiResponseTextArea.dispatchEvent(new Event("input"));
        return fullResponse;
    }
}

class HuggingFaceModelWrapper extends ModelWrapper {
    static PREFIX = "huggingface:"
    static CLASSNAME = "huggingface-model-option"

    constructor(selectedOption) {
        super(selectedOption.substr(HuggingFaceModelWrapper.PREFIX.length))
    }

    getAPIKey(){
        return document.getElementById("HuggingFace-api-key-input").value;
    }

    getAPIEndpoint(){
        return "https://api-inference.huggingface.co/models/" + this.selectedOption;
    }

    supportsStreaming(){
        return false;
    }

    async sendChat(messages, temperature, maxTokens, abortSignal, stream){

        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", `Bearer ${this.getAPIKey()}`);

        let inputs = await this.applyChatTemplate(messages);
        console.log("Sending chat to HuggingFace: ", inputs)
        const requestOptions = {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                    inputs,
                    parameters: {
                        max_new_tokens: maxTokens,
                        num_return_sequences: 1,
                        temperature: temperature,
                        return_full_text: false,
                    },
                    options: {
                        use_cache: false,
                        wait_for_model: true,
                    }
                }),
            signal: abortSignal,
        };

        return await fetch(this.getAPIEndpoint(), requestOptions);
    }

    async handleStreamingForLLMNode(response, node) {
        throw new Error("Streaming not supported")
    }

    async handleResponseForLLMNode(response, node) {
        const data = await response.json();
        let fullResponse = `${data[0].generated_text.trim()}`;
        node.aiResponseTextArea.value += fullResponse;
        node.aiResponseTextArea.dispatchEvent(new Event("input"));
        return fullResponse;
    }

    async applyChatTemplate(messages){

        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        let js = await fetch("http://localhost:1000/apply-chat-template", {method: "POST", headers: headers, body: JSON.stringify({model: this.selectedOption, messages})})
        return await js.json();

    }
}

class AnthropicModelWrapper extends ModelWrapper {
    static PREFIX = "anthropic:"
    static CLASSNAME = "anthropic-model-option"

    constructor(selectedOption) {
        super(selectedOption.substr(AnthropicModelWrapper.PREFIX.length))
    }

    getAPIKey(){
        return document.getElementById("Anthropic-api-key-input").value;
    }

    getAPIEndpoint(){
        return "http://localhost:1000/anthropic-proxy"
    }

    async sendChat(messages, temperature, maxTokens, abortSignal, stream){
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        messages = messages.filter((message) => message.role !== "system")

        const requestOptions = {
            method: "POST",
            headers,
            body: JSON.stringify({
                model: this.selectedOption,
                messages,
                max_tokens: maxTokens,
                // temperature,
                // stream,
            }),
            // signal: abortSignal,
        };
        return await fetch(this.getAPIEndpoint(), requestOptions);
    }

    supportsStreaming() {
        return false;
    }

    async handleStreamingForLLMNode(response, node) {
        throw new Error("Streaming not supported")
    }

    async handleResponseForLLMNode(response, node) {
        const data = await response.json();
        let fullResponse = `${data.content[0].text.trim()}`;
        node.aiResponseTextArea.value += fullResponse;
        node.aiResponseTextArea.dispatchEvent(new Event("input"));
        return fullResponse;
    }
}

// Add logic, waiting to start my free trial
class GoogleModelWrapper extends ModelWrapper {
    static PREFIX = "google:"
    static CLASSNAME = "google-model-option"

    constructor(selectedOption) {
        super(selectedOption.substr(GoogleModelWrapper.PREFIX.length))
    }

    // getAPIKey(){
    //     return document.getElementById("GoogleGemini-api-key-input").value;
    // }

    getProjectID(){
        return document.getElementById("GoogleGemini-project-id-input").value;
    }
    getLocation(){
        return "us-central1";
    }

    getAPIEndpoint(){
        return "http://localhost:1000/gemini-proxy"
        // return `https://${this.getLocation()}-aiplatform.googleapis.com/v1/projects/${this.getProjectID()}/locations/${this.getLocation()}/publishers/google/models/${this.selectedOption}:streamGenerateContent`
    }

    async getTokenCount(messages){
        let text = "";
        for(let message of messages) {
            text += (message.content || message.message || message.code) + "\n";
        }
        let response = await fetch("http://localhost:1000/count-tokens",{
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                model: this.constructor.PREFIX + this.selectedOption,
                location: this.getLocation(),
                projectID: this.getProjectID(),
                text
            })
        })
        if(!response.ok && this.failedAttempts === 0) {
            this.failedAttempts = 1;
            return await new Promise((resolve, reject) =>{
                this.setAPIKeyAndRetry(() => {
                    this.getTokenCount(messages).then((result) => {
                        resolve(result);
                    });
                })
            })
        }
        this.failedAttempts = 0;
        // const { count, approximation, model_info } = (await response.json());
        // return  (approximation ? "≈" : "") + count;
        return (await response.json());
    }

    async sendChat(messages, temperature, maxTokens, abortSignal, stream){
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", `Bearer ${this.getAPIKey()}`);

        messages = messages.map((message) => message.content)

        const requestOptions = {
            method: "POST",
            headers,
            body: JSON.stringify({
                model: this.selectedOption,
                location: this.getLocation(),
                projectID: this.getProjectID(),
                messages,
                max_tokens: maxTokens,
                temperature
            }),
        };

        return await fetch(this.getAPIEndpoint(), requestOptions);
    }

    supportsStreaming() {
        return false;
    }

    async handleStreamingForLLMNode(response, node) {
        throw new Error("Streaming not supported")
    }

    // TO-DO: Review proxy
    async handleResponseForLLMNode(response, node) {
        const data = await response.json();
        let fullResponse = data[0];
        node.aiResponseTextArea.value += fullResponse;
        node.aiResponseTextArea.dispatchEvent(new Event("input"));
        return fullResponse;
    }
}

// To fix: streaming API are not just json, review
class MistralModelWrapper extends ModelWrapper {
    static PREFIX = "mistral:"
    static CLASSNAME = "mistral-model-option"

    constructor(selectedOption) {
        super(selectedOption.substr(MistralModelWrapper.PREFIX.length))
    }

    getAPIKey(){
        return document.getElementById("Mistral-api-key-input").value;
    }

    getAPIEndpoint(){
        return "https://api.mistral.ai/v1/chat/completions"
    }

    async sendChat(messages, temperature, maxTokens, abortSignal, stream){
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", `Bearer ${this.getAPIKey()}`);


        messages = messages.filter((message) => message.role !== "system")

        const requestOptions = {
            method: "POST",
            headers,
            body: JSON.stringify({
                model: this.selectedOption,
                messages,
                max_tokens: maxTokens,
                temperature,
                stream,
            }),
            // signal: abortSignal,
        };

        return await fetch(this.getAPIEndpoint(), requestOptions);
    }

    async getTokenCount(messages){
        let response = await fetch("http://localhost:1000/count-tokens",{
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                model: this.constructor.PREFIX + this.selectedOption,
                messages
            })
        })

        // const { count, approximation } = (await response.json());
        // return  (approximation ? "≈" : "") + count;
        return (await response.json());

    }

    supportsStreaming() {
        return true;
    }

    async handleStreamingForLLMNode(response, node) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let fullResponse = "";
        let contentAccumulator = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done || !node.shouldContinue) break;

            buffer += decoder.decode(value, { stream: true });

            let contentMatch;
            while ((contentMatch = buffer.match(/^data: [^\n]+\n\n/)) !== null) {
                let unparsed = contentMatch[0].substr("data: ".length);

                if (!node.shouldContinue) break;

                if (unparsed !== "[DONE]\n\n") {
                    const content = JSON.parse(unparsed)
                    if(content.choices[0].finish_reason === null) {
                        contentAccumulator += content.choices[0].delta.content;
                        if(!contentAccumulator.includes("`") || contentAccumulator.includes("```")
                            || contentAccumulator.lastIndexOf("\n") > contentAccumulator.lastIndexOf("`")) {
                            await appendWithDelay(contentAccumulator, node, 30);
                            fullResponse += contentAccumulator; // append content to fullResponse
                            contentAccumulator = "";
                        }
                    }
                } else if (contentAccumulator.length > 0){
                    await appendWithDelay(contentAccumulator, node, 30);
                    fullResponse += contentAccumulator; // append content to fullResponse
                    contentAccumulator = "";
                }
                buffer = buffer.slice(contentMatch.index + contentMatch[0].length);
            }
        }
        return fullResponse; // return the entire response
    }

    async handleResponseForLLMNode(response, node) {
        const data = await response.json();
        let fullResponse = `${data.choices[0].message.content.trim()}`;
        node.aiResponseTextArea.value += fullResponse;
        node.aiResponseTextArea.dispatchEvent(new Event("input"));
        return fullResponse;
    }
}

class CohereModelWrapper extends ModelWrapper {
    static PREFIX = "cohere:"
    static CLASSNAME = "cohere-model-option"

    constructor(selectedOption) {
        super(selectedOption.substr(CohereModelWrapper.PREFIX.length))
    }

    getAPIKey(){
        return document.getElementById("Cohere-api-key-input").value;
    }

    getAPIEndpoint(){
        return "https://api.cohere.ai/v1/chat"
    }

    async sendChat(messages, temperature, maxTokens, abortSignal, stream){
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Accept", "application/json");
        headers.append("Authorization", `Bearer ${this.getAPIKey()}`);


        messages = messages.map((message) => {
            if(message.role === "assistant") message.role = "CHATBOT"
            message.role = message.role.toUpperCase();
            message.message = message.content;
            delete message.content;
            return message;
        })
        let message;
        if(messages[messages.length - 1].role === "USER") {
            message = messages[messages.length - 1].message;
            messages.splice(messages.length - 1);
        } else {
            message = "";
        }
        const requestOptions = {
            method: "POST",
            headers,
            body: JSON.stringify({
                model: this.selectedOption,
                chat_history: messages,
                message,
                max_tokens: maxTokens,
                temperature,
                stream,
            }),
            // signal: abortSignal,
        };

        return await fetch(this.getAPIEndpoint(), requestOptions);
    }

    supportsStreaming() {
        return true;
    }

    async handleStreamingForLLMNode(response, node) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let fullResponse = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done || !node.shouldContinue) break;

            buffer += decoder.decode(value, { stream: true });

            let contentMatch;
            while ((contentMatch = buffer.match(/[^\n]+\n/)) !== null) {
                let unparsed = contentMatch[0].substr(0,  contentMatch[0].length - 1)
                const content = JSON.parse(unparsed);

                if (!node.shouldContinue) break;

                if (!content.is_finished && content.text) {
                    await appendWithDelay(content.text, node, 30);
                    fullResponse += content.text; // append content to fullResponse
                }

                buffer = buffer.slice(contentMatch.index + contentMatch[0].length);
            }
        }
        return fullResponse; // return the entire response
    }

    async handleResponseForLLMNode(response, node) {
        const data = await response.json();
        let fullResponse = `${data.text.trim()}`;
        node.aiResponseTextArea.value += fullResponse;
        node.aiResponseTextArea.dispatchEvent(new Event("input"));
        return fullResponse;
    }
}



window.modelWrappers = [OpenAIModelWrapper, HuggingFaceModelWrapper, AnthropicModelWrapper, GoogleModelWrapper, MistralModelWrapper, CohereModelWrapper]

window.defaultOption = new Option('Default', 'Default', false, true);

window.globalModelOptions = modelOptions().filter((option) => !option.value.startsWith("webllm:"))

window.localModelOptions = [defaultOption, ...modelOptions()]


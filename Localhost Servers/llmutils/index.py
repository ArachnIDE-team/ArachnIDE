from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from transformers import AutoTokenizer, AutoConfig
from tiktoken import encoding_for_model
import cohere
from mistral_common.tokens.tokenizers.mistral import MistralTokenizer
from mistral_common.tokens.instruct.normalize import ChatCompletionRequest
from mistral_common.protocol.instruct.messages import (
    AssistantMessage,
    UserMessage,
)
import sys

import requests

import vertexai
# from vertexai.generative_models import GenerativeModel
import vertexai.preview.generative_models as generative_models

app = Flask(__name__)
CORS(app)

# Load credentials from a secure location (e.g., encrypted file)
# credentials = Credentials.from_service_account_file("../../client_secret.json")
# Build Vertex AI service object using the loaded credentials
# service = build("aiplatform", "v1", credentials=credentials)
#  "H:\\projects\\ArachnIDE\\client_secret.json"
newpath = os.path.join(os.path.dirname(__file__), "..\\..\\", "client_secret.json")
newpath = os.path.normpath(newpath)
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = newpath

gemini_safety_settings = [
    generative_models.SafetySetting(
        category=generative_models.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold=generative_models.HarmBlockThreshold.BLOCK_ONLY_HIGH,
    ),
    generative_models.SafetySetting(
        category=generative_models.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold=generative_models.HarmBlockThreshold.BLOCK_ONLY_HIGH,
    ),
    generative_models.SafetySetting(
        category=generative_models.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold=generative_models.HarmBlockThreshold.BLOCK_ONLY_HIGH,
    ),
    generative_models.SafetySetting(
        category=generative_models.HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold=generative_models.HarmBlockThreshold.BLOCK_ONLY_HIGH,
    )
]

# {
#     generative_models.HarmCategory.HARM_CATEGORY_HATE_SPEECH: generative_models.HarmBlockThreshold.BLOCK_ONLY_HIGH,
#     generative_models.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: generative_models.HarmBlockThreshold.BLOCK_ONLY_HIGH,
#     generative_models.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: generative_models.HarmBlockThreshold.BLOCK_ONLY_HIGH,
#     generative_models.HarmCategory.HARM_CATEGORY_HARASSMENT: generative_models.HarmBlockThreshold.BLOCK_ONLY_HIGH,
# }
# gemini_safety_settings = {
#     generative_models.HarmCategory.HARM_CATEGORY_HATE_SPEECH: generative_models.HarmBlockThreshold.BLOCK_NONE,
#     generative_models.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: generative_models.HarmBlockThreshold.BLOCK_NONE,
#     generative_models.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: generative_models.HarmBlockThreshold.BLOCK_NONE,
#     generative_models.HarmCategory.HARM_CATEGORY_HARASSMENT: generative_models.HarmBlockThreshold.BLOCK_NONE,
# }


@app.route('/anthropic-proxy', methods=['POST'])
def anthropic_proxy():
    data = request.json
    messages = data.get('messages')
    model = data.get('model')
    max_tokens = data.get('max_tokens')
    endpoint = "https://api.anthropic.com/v1/messages"
    headers = {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "messages-2023-12-15",
        "x-api-key": os.getenv('ANTHROPIC_API_KEY')  # Don't forget to set this environment variable
    }
    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens
    }

    try:
        response = requests.post(endpoint, json=payload, headers=headers)
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/gemini-proxy', methods=['POST'])
def gemini_proxy():
    data = request.json
    project_id = data.get('projectID')
    location = data.get('location')
    messages = data.get('messages')
    model_name = data.get('model')
    max_tokens = data.get('max_tokens')
    temperature = data.get('temperature')
    vertexai.init(project=project_id, location=location)
    model = generative_models.GenerativeModel(model_name=model_name)
    # try:
    # response = model.generate_content(messages)

    generation_config = generative_models.GenerationConfig(
        max_output_tokens=max_tokens,
        temperature=temperature,
        candidate_count=1,
        top_p=0.95,
    )
    # generation_config = {
    #     "max_output_tokens": max_tokens,
    #     "temperature": temperature,
    #     "candidate_count": 1,
    #     "top_p": 0.95,
    # }
    response = model.generate_content(
        messages,
        generation_config=generation_config,
        safety_settings=gemini_safety_settings,
        stream=False
    )
    # return jsonify(convert_gemini_response(response)) # THIS ONE DOES NOT WORK
    gemini_response_array = convert_gemini_response(response)
    print("response from gemini proxy: " + str(response), flush=True)
    return gemini_response_array  # THIS ONE DOES NOT WORK
    # return json.dumps(convert_gemini_response(response))  # THIS ONE WORKS
    # return jsonify(json.dumps(convert_gemini_response(response)))  # THIS ONE WORKS
    # except Exception as e:
    #     return jsonify({'error': str(e)})

# Chat templates for HuggingFace models
@app.route('/apply-chat-template', methods=['POST'])
def apply_chat_template():
    data = request.json
    messages = data.get('messages')
    model = data.get('model')
    tokenizer = AutoTokenizer.from_pretrained(model, token=os.getenv('HF_API_KEY'))
    chat = None
    if model.startswith('mistralai'):
        with open("./chat_templates/mistral.jinja", "r") as template_file:
            template = template_file.read()
        print("Apply chat template for model: ", model)
        chat = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True,  chat_template=template)
    else:
        chat = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    return jsonify(chat)


# {
# "text": "text to tokenize"
# [or] "messages": "chat messages to tokenize" (only for mistral)
# "model": "the provider and model to use (separated by ':')"
# ["projectID"]: Google API project ID
# ["location"]: Google API location
# }
@app.route('/count-tokens', methods=['POST'])
def count_tokens():
    data = request.json
    text = data.get('text')
    model = data.get('model')
    approximation = False
    with open(os.path.join(os.path.dirname(__file__), "model_prices.json"), "r") as f:
        model_info = json.load(f)
    # Before model name translation
    model_info = model_info.get(model)
    if(model.startswith("anthropic:")):
        approximation = True
    model = apply_model_mapping(model) # Anthropic does not have a tokenizer
    if model.startswith('openai:'):
        tokenizer = encoding_for_model(model[len('openai:'):])
        tokens = tokenizer.encode(text)
        return jsonify({"count": len(tokens), "approximation": approximation, "model_info": model_info})
    elif model.startswith('huggingface:'):
        tokenizer = None
        try:
            huggingface_model = model[len('huggingface:'):]
            tokenizer = AutoTokenizer.from_pretrained(huggingface_model, token=os.getenv('HF_API_KEY'))
            config = AutoConfig.from_pretrained(huggingface_model, token=os.getenv('HF_API_KEY'))
            print("Loaded config: ", config)
            model_info = {
                "max_tokens": config.max_position_embeddings,
                "max_input_tokens":  config.max_position_embeddings,
                "max_output_tokens":  config.max_position_embeddings,
                "input_cost_per_token": 0,
                "output_cost_per_token": 0,
                "litellm_provider": "huggingface",
                "mode": "chat"
            }
            tokens = tokenizer.encode(text)
            return jsonify({"count": len(tokens), "approximation": False, "model_info": model_info})
        except Exception as e:
            # Use tiktoken gpt-4 by default
            tokenizer = encoding_for_model("gpt-4")
            tokens = tokenizer.encode(text)
            return jsonify({"count": len(tokens), "approximation": True, "model_info": model_info})
    elif model.startswith('google:'):
        project_id = data.get('projectID')
        location = data.get('location')
        vertexai.init(project=project_id, location=location)
        model = generative_models.GenerativeModel(model_name=model[len('google:'):])
        count_tokens = model.count_tokens(text)
        return jsonify({"count": count_tokens.total_tokens, "approximation": False, "model_info": model_info})
    elif model.startswith('mistral:'):
        ## Cant use already encoded tokens (we need to pass messages instead)
        # v1: open-mistral-7b, open-mixtral-8x7b, mistral-embed
        # v2: mistral-small-latest, mistral-large-latest
        # v3: open-mixtral-8x22b
        messages = data.get('messages')
        tokenizer = None
        approximation = False
        if "open-mistral-7b" in model or "open-mixtral-8x7b" in model:
            tokenizer = MistralTokenizer.v1()
        elif "mistral-small" in model or "mistral-medium" in model or "mistral-large" in model:
            # Medium model is not specified in the documentation (looks like providers do not care)
            tokenizer = MistralTokenizer.v2()
            if "mistral-medium" in model:
                approximation = True
        elif "open-mixtral-8x22b" in model:
            tokenizer = MistralTokenizer.v3()

        tokenized = tokenizer.encode_chat_completion(
            ChatCompletionRequest(
                messages=get_mistral_messages(messages)
            )
        )
        tokens, text = tokenized.tokens, tokenized.text
        return jsonify({"count": len(tokens), "approximation": approximation, "model_info": model_info})
    elif model.startswith('cohere:'):
        client = cohere.Client(os.getenv('CO_API_KEY'))
        tokens = client.tokenize(text=text, model=model[len('cohere:'):])
        return jsonify({"count": len(tokens.tokens), "approximation": False, "model_info": model_info})
    else:
        return jsonify({'error': f'Tokenizer not found for model: {model}'})

@app.route('/set-api-key', methods=['POST'])
def set_api_key():
    data = request.json
    key = data.get('key')
    provider = data.get('provider')
    if provider == 'cohere':
        os.environ['CO_API_KEY'] = key
    elif provider == 'huggingface':
        os.environ['HF_API_KEY'] = key
        os.environ['HF_TOKEN'] = key
    elif provider == 'anthropic':
        os.environ['ANTHROPIC_API_KEY'] = key
    return jsonify({'result': 'success'})

def get_mistral_messages(messages):
    result = []

    for idx, message in enumerate(messages):
        if message.get("role") == "system":
            result.append(UserMessage(content=message.get("content")))
        if message.get("role") == "user":# and message.get("content") != ""
            if result[idx - 1].role == 'user':
                result[idx - 1].content += message.get("content")
            else:
                result.append(UserMessage(content=message.get("content")))
        elif message.get("role") == "assistant":
            result.append(AssistantMessage(content=message.get("content")))
    return result

def convert_gemini_response(response):
    chat = []
    for candidate in response.candidates:
        if len(candidate.content.parts) > 0:
            response_part = candidate.content.parts[0]
            chat.append(response_part.text)
    return chat

# new Option('Anthropic Claude instant 1.2', 'anthropic:claude-instant-1.2', false, false),
# new Option('Anthropic Claude 2.0', 'anthropic:claude-2.0', false, false),
# new Option('Anthropic Claude 2.1', 'anthropic:claude-2.1', false, false),
# new Option('Anthropic Claude 3 Opus', 'anthropic:claude-3-opus-20240229', false, false),
# new Option('Anthropic Claude 3 Sonnet', 'anthropic:claude-3-sonnet-20240229', false, false),
# new Option('Anthropic Claude 3 Haiku', 'anthropic:claude-3-haiku-20240307', false, false),

# new Option('Open Mistral 7B', 'mistral:open-mistral-7b', false, false),
# new Option('Open Mixtral 8x7B', 'mistral:open-mixtral-8x7b', false, false),
# new Option('Open Mixtral 8x22B', 'mistral:open-mixtral-8x22b', false, false),
# new Option('Mistral Small', 'mistral:mistral-small', false, false),
# new Option('Mistral Medium', 'mistral:mistral-medium', false, false),
# new Option('Mistral Large', 'mistral:mistral-large', false, false),

model_map = {
    "anthropic:claude-instant-1.2": "openai:gpt-4",
    "anthropic:claude-2.0": "openai:gpt-4",
    "anthropic:claude-2.1": "openai:gpt-4",
    "anthropic:claude-3-opus-20240229": "openai:gpt-4",
    "anthropic:claude-3-sonnet-20240229": "openai:gpt-4",
    "anthropic:claude-3-haiku-20240307": "openai:gpt-4",
    "openai:gpt-4o": "openai:gpt-4",
    "openai::gpt-4o-2024-05-13": "openai:gpt-4",
    # "mistral:open-mistral-7b" : "huggingface:mistralai/Mistral-7B-v0.1",
    # "mistral:open-mixtral-8x7b" : "huggingface:mistralai/Mixtral-8x7B-v0.1",
    # "mistral:open-mixtral-8x22b" : "huggingface:mistralai/Mixtral-8x22B-v0.1",
    # "mistral:mistral-small" : "openai:gpt-4",
    # "mistral:mistral-medium" : "openai:gpt-4",
    # "mistral:mistral-large" : "openai:gpt-4",
}

def apply_model_mapping(model):
    if model_map.get(model):
        return model_map.get(model)
    else:
        return model


if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 1000))
    app.run(port=PORT)


## Test gemini
# import vertexai
# import json
# from vertexai.generative_models import GenerativeModel
# import vertexai.preview.generative_models as generative_models
# os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "H:\\projects\\ArachnIDE\\client_secret.json"
# project_id = "encoded-net-422415-c1"
# location = "us-central1"
# model_name = "gemini-1.5-pro-preview-0409"
# vertexai.init(project=project_id, location=location)
# model = GenerativeModel(model_name=model_name)
# with open("H:\\projects\\ArachnIDE\\samples\\test.json", "r") as f:
#     messages = json.load(f)
# response = model.generate_content(messages, safety_settings={
#      generative_models.HarmCategory.HARM_CATEGORY_HATE_SPEECH: generative_models.HarmBlockThreshold.BLOCK_NONE,
#      generative_models.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: generative_models.HarmBlockThreshold.BLOCK_NONE,
#      generative_models.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: generative_models.HarmBlockThreshold.BLOCK_NONE,
#      generative_models.HarmCategory.HARM_CATEGORY_HARASSMENT: generative_models.HarmBlockThreshold.BLOCK_NONE,
# }, generation_config={
#     "max_output_tokens": 8192,
#     "temperature": 1,
#     "top_p": 0.95,
# })

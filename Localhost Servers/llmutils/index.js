import express from 'express';
import cors from 'cors';
import { AutoTokenizer } from '@xenova/transformers';
import fs from 'fs';

process.env.HF_TOKEN = process.env.HF_API_KEY;

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));


// create/save a workspace network file
app.post('/apply-chat-template', async (req, res) => {
    const { messages, model } = req.body;
    const tokenizer = await AutoTokenizer.from_pretrained(model);
    let chat
    // workaround for mistral
    if(model.startsWith('mistralai')) {
        let template = await fs.readFileSync("./chat_templates/mistral.jinja", "utf8")
        // console.log("Loaded override chat template\n"+ template)
        chat = tokenizer.apply_chat_template(messages, {tokenize: false, add_generation_prompt: true,  chat_template: template})
        // chat = tokenizer.apply_chat_template(messages, {tokenize: false, chat_template: template})
    } else {
        chat = tokenizer.apply_chat_template(messages, {tokenize: false, add_generation_prompt: true})
    }
    // let chat = tokenizer.apply_chat_template(messages, {tokenize: false})
    res.send(JSON.stringify(chat));
})




// import { AutoTokenizer } from '@xenova/transformers';
//
// // Load tokenizer for a gated repository.
// const tokenizer = await AutoTokenizer.from_pretrained('meta-llama/Llama-2-7b-hf');
//
// // Encode text.
// const text = 'Hello world!';
// const encoded = tokenizer.encode(text);
// console.log(encoded);

// Start the server
const PORT = process.env.PORT || 1000;
app.listen(PORT, () => {
    console.log(`LLM Utils server is listening on port ${PORT}`);
});

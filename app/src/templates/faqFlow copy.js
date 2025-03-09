import { addKeyword, EVENTS } from "@builderbot/bot";
import aiServices from "~/services/aiServices";
import sheetsService from "~/services/sheetsService";
import { config } from "../config";
import path from "path";
import fs from "fs";
import { createMessageQueue } from "fast";
const queueConfig = { gapMilliseconds: 15000 };
const enqueueMessage = createMessageQueue(queueConfig);
const pathPrompt = path.join(process.cwd(), "assets/prompts", "prompt_OpenAi.txt");
const prompt = fs.readFileSync(pathPrompt, "utf8");
export const faqFlowcopia = addKeyword(EVENTS.ACTION).addAction(async (ctx, { endFlow, flowDynamic, gotoFlow }) => {
    enqueueMessage(ctx, async (body) => {
        const EnqueueMessageBody = body;
        console.log('Processed messages:', EnqueueMessageBody, ctx.from);
        const history = await sheetsService.getUserConv(ctx.from);
        history.push({ role: "user", content: EnqueueMessageBody });
        try {
            const AI = new aiServices(config.ApiKey);
            const response = await AI.chat(prompt, history);
            await sheetsService.addConverToUser(ctx.from, [
                { role: "user", content: EnqueueMessageBody },
                { role: "assistant", content: response },
            ]);
            const responseformatted = response.replace(/\*\*(.*?)\*\*/g, '*$1*');
            return endFlow(responseformatted);
        }
        catch (error) {
            console.log("Error en llamada GPT", error);
            return endFlow("Por favor, intenta de nuevo");
        }
    });
});

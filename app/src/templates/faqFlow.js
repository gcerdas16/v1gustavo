import { addKeyword, EVENTS } from "@builderbot/bot";
import aiServices from "~/services/aiServices";
import sheetsService from "~/services/sheetsService";
import { config } from "../config";
import path from "path";
import fs from "fs";
import { createMessageQueue } from "fast";
import { flowpedidofinal } from "./flowpedidos";
const queueConfig = { gapMilliseconds: 15000 };
const enqueueMessage = createMessageQueue(queueConfig);
const pathPrompt = path.join(process.cwd(), "assets/prompts", "prompt_OpenAi.txt");
const prompt = fs.readFileSync(pathPrompt, "utf8");
export const faqFlow = addKeyword(EVENTS.ACTION).addAction(async (ctx, { endFlow, flowDynamic, gotoFlow }) => {
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
            if (responseformatted.includes("Estoy lista para tomar") ||
                responseformatted.includes("Estoy aquí para ayudarle a")) {
                console.log("Voy para el flujo de pedido");
                await flowDynamic(responseformatted);
                return gotoFlow(flowpedidofinal);
            }
            else {
                console.log("Me mantengo en este flujo");
                return endFlow(responseformatted);
            }
        }
        catch (error) {
            console.log("Error en llamada GPT", error);
            return endFlow("Por favor, intenta de nuevo");
        }
    });
});

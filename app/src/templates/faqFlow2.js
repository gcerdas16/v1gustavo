import { addKeyword, EVENTS } from "@builderbot/bot";
import aiServices from "~/services/aiServices";
import { config } from "../config";
import path from "path";
import fs from "fs";
import { createMessageQueue } from "fast";
import excelread from "~/services/excelread";
const queueConfig = { gapMilliseconds: 15000 };
const enqueueMessage = createMessageQueue(queueConfig);
const pathPrompt = path.join(process.cwd(), "assets/prompts", "prompt_OpenAi.txt");
const prompt = fs.readFileSync(pathPrompt, "utf8");
export const faqFlow2 = addKeyword(EVENTS.ACTION).addAction(async (ctx, { endFlow, flowDynamic, gotoFlow }) => {
    enqueueMessage(ctx, async (body) => {
        const EnqueueMessageBody = body;
        console.log('Processed messages:', EnqueueMessageBody, ctx.from);
        const gastos = await excelread.readSheetGustavo("Gastos!A1:D1000");
        const gastosJSON = gastos.slice(1).map(row => ({
            fecha: row[0],
            comercio: row[1],
            monto: Number(row[2])
        }));
        const history = await excelread.getUserConv("Historial!A1:B100");
        history.push({ role: "user", content: EnqueueMessageBody + "\nDatos en JSON: " + JSON.stringify({ gastos: gastosJSON }) });
        try {
            const AI = new aiServices(config.ApiKey);
            const response = await AI.chat(prompt, history);
            await excelread.addConverToUser("Historial!A1:C10", [
                { role: "user", content: EnqueueMessageBody },
                { role: "assistant", content: response },
            ]);
            console.log(response);
            const numerosEncontrados = response.match(/\d{1,3}(?:,\d{3})*/g);
            if (numerosEncontrados && numerosEncontrados.length > 0) {
                const ultimoNumero = parseInt(numerosEncontrados[numerosEncontrados.length - 1].replace(/,/g, ""), 10);
                console.log("Números encontrados:", ultimoNumero);
            }
            else {
                return endFlow(response);
            }
        }
        catch (error) {
            console.log("Error en llamada GPT", error);
            return endFlow("Por favor, intenta de nuevo");
        }
    });
});

import { addKeyword, EVENTS } from "@builderbot/bot";
import path from "path";
import fs from "fs";
import { chat } from "~/services/chatgpt";
import excelread from "~/services/excelread";
import { createMessageQueue } from "fast";
const queueConfig = { gapMilliseconds: 15000 };
const enqueueMessage = createMessageQueue(queueConfig);
const pathPrompt = path.join(process.cwd(), "assets/prompts", "prompt_OpenAi.txt");
const prompt = fs.readFileSync(pathPrompt, "utf8");
export const gastosflow = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, ctxFn) => {
    enqueueMessage(ctx, async (body) => {
        const EnqueueMessageBody = body;
        console.log('Processed messages:', EnqueueMessageBody, ctx.from);
        const gastos = await excelread.readSheetGustavo("Gastos!A1:C10");
        const gastosJSON = gastos.slice(1).map(row => ({
            fecha: row[0],
            comercio: row[1],
            monto: Number(row[2])
        }));
        const text = ctx.body + "\nDatos en JSON: " + JSON.stringify({ gastos: gastosJSON });
        const response = await chat(prompt, text);
        await ctxFn.flowDynamic(response);
    });
});

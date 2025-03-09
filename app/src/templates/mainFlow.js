import { addKeyword, EVENTS } from "@builderbot/bot";
import { registerFlow } from "./registerFlow";
import sheetsService from "../services/sheetsService";
import { createMessageQueue } from "fast";
import { voiceflow } from "./voiceflow";
import { faqFlowcopia } from "./faqFlow copy";
const queueConfig = { gapMilliseconds: 15000 };
const enqueueMessage = createMessageQueue(queueConfig);
const mainFlow = addKeyword([
    EVENTS.WELCOME,
    EVENTS.MEDIA,
    EVENTS.DOCUMENT,
    EVENTS.VOICE_NOTE
]).addAction(async (ctx, ctxFn) => {
    const isUser = await sheetsService.userExists(ctx.from);
    if (ctx.body.includes("_event_voice") && (!isUser)) {
        return ctxFn.gotoFlow(registerFlow);
    }
    if (ctx.body.includes("_event_voice") && (isUser)) {
        return ctxFn.gotoFlow(voiceflow);
    }
    if (!isUser) {
        return ctxFn.gotoFlow(registerFlow);
    }
    else {
        return ctxFn.gotoFlow(faqFlowcopia);
    }
});
export { mainFlow, };

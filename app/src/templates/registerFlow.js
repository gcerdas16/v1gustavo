import { addKeyword, EVENTS } from "@builderbot/bot";
import sheetsService from "../services/sheetsService";
const registerFlow = addKeyword(EVENTS.ACTION)
    .addAnswer(`¡Hola! 🐾 Soy SARA, 😊`, null, async (ctx, ctxFn) => {
    await sheetsService.createUser(ctx.from, ctx.name);
});
export { registerFlow };

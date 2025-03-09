import { addKeyword } from "@builderbot/bot";
import { reset, start, stop } from "~/services/idle";
const flowInfo = addKeyword("hello")
    .addAnswer('Your info:', null, async (_, { flowDynamic, state }) => {
    const data = state.getMyState();
    await flowDynamic(`*Name:* ${data.name}\n*Pedido:* ${data.cantidadysabores}`);
});
const flowpedidofinal = addKeyword("hello")
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, 300000))
    .addAnswer("What's your name?", { capture: true }, async (ctx, { gotoFlow, state }) => {
    reset(ctx, gotoFlow, 300000);
    await state.update({ name: ctx.body });
})
    .addAnswer("¿Qué sabores y cantidad va a querer?", { capture: true }, async (ctx, { gotoFlow, state }) => {
    reset(ctx, gotoFlow, 300000);
    await state.update({ cantidadysabores: ctx.body });
})
    .addAnswer("¿Quiere editar su pedido?", { capture: true }, async (ctx, { state, gotoFlow, endFlow, fallBack }) => {
    await state.update({ email: ctx.body });
    reset(ctx, gotoFlow, 300000);
    switch (ctx.body.trim().toLowerCase()) {
        case "si":
            stop(ctx);
            return gotoFlow(editarPedidoFlow);
        case "no":
            stop(ctx);
            return gotoFlow(flowInfo);
        default:
            return fallBack(`Solo acepto "Si" o "No" como respuestas.`);
    }
});
const editarPedidoFlow = addKeyword("editar")
    .addAnswer("Entendido. Por favor, indique nuevamente qué sabores y cantidad desea:", { capture: true }, async (ctx, { gotoFlow, state }) => {
    reset(ctx, gotoFlow, 300000);
    await state.update({ cantidadysabores: ctx.body });
    return gotoFlow(flowInfo);
});
export { flowpedidofinal, flowInfo, editarPedidoFlow };

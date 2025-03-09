import { EVENTS, addKeyword } from '@builderbot/bot';
const timers = {};
const idleFlow = addKeyword(EVENTS.ACTION).addAction(async (_, { endFlow }) => {
    return endFlow("Response time has expired");
});
const start = (ctx, gotoFlow, ms) => {
    timers[ctx.from] = setTimeout(() => {
        console.log(`User timeout: ${ctx.from}`);
        return gotoFlow(idleFlow);
    }, ms);
};
const reset = (ctx, gotoFlow, ms) => {
    stop(ctx);
    if (timers[ctx.from]) {
        console.log(`reset countdown for the user: ${ctx.from}`);
        clearTimeout(timers[ctx.from]);
    }
    start(ctx, gotoFlow, ms);
};
const stop = (ctx) => {
    if (timers[ctx.from]) {
        clearTimeout(timers[ctx.from]);
    }
};
export { start, reset, stop, idleFlow, };

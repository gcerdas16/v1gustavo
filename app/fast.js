function createInitialState() {
    return {
        queues: new Map()
    };
}
function resetTimer(userQueue) {
    if (userQueue.timer) {
        clearTimeout(userQueue.timer);
    }
    return { ...userQueue, timer: null };
}
function processQueue(messages) {
    const result = messages.map(message => message.text).join(" ");
    console.log('Accumulated messages:', result);
    return result;
}
function createMessageQueue(config) {
    const state = createInitialState();
    return function enqueueMessage(ctx, callback) {
        const from = ctx.from;
        const messageBody = ctx.body;
        if (!from || !messageBody) {
            console.error('Invalid message context:', ctx);
            return;
        }
        console.log('Enqueueing:', messageBody, 'from:', from);
        let userQueue = state.queues.get(from);
        if (!userQueue) {
            userQueue = { messages: [], timer: null, callback: null };
            state.queues.set(from, userQueue);
        }
        userQueue = resetTimer(userQueue);
        userQueue.messages.push({ text: messageBody, timestamp: Date.now() });
        userQueue.callback = callback;
        console.log('Messages for', from, ':', userQueue.messages);
        if (!userQueue.timer) {
            userQueue.timer = setTimeout(() => {
                const currentQueue = state.queues.get(from);
                if (currentQueue) {
                    const result = processQueue(currentQueue.messages);
                    if (currentQueue.callback) {
                        currentQueue.callback(result, from);
                    }
                    state.queues.set(from, { ...currentQueue, messages: [], timer: null });
                }
            }, config.gapMilliseconds);
        }
        state.queues.set(from, userQueue);
    };
}
export { createMessageQueue };

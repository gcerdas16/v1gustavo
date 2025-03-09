import OpenAI from "openai";
import { config } from "~/config";
class aiServices {
    static apiKey;
    openAI;
    constructor(apiKey) {
        aiServices.apiKey = apiKey;
        this.openAI = new OpenAI({
            apiKey: aiServices.apiKey,
        });
    }
    async chat(prompt, messages) {
        try {
            const completion = await this.openAI.chat.completions.create({
                model: config.Model,
                messages: [
                    { role: "system", content: prompt },
                    ...messages,
                ],
            });
            const answer = completion.choices[0].message?.content || 'No response';
            return answer;
        }
        catch (err) {
            console.error("Error al conectar con OpenAI:", err);
            return "ERROR";
        }
    }
}
export default aiServices;

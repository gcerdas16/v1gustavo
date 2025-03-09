import { google } from "googleapis";
import { config } from "../config";
class SheetManager {
    sheets;
    spreadsheetId;
    constructor(spreadsheetId, privateKey, clientEmail) {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                private_key: privateKey,
                client_email: clientEmail,
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        this.sheets = google.sheets({ version: "v4", auth });
        this.spreadsheetId = spreadsheetId;
    }
    async userExists(number) {
        try {
            const result = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: 'Users!A:A',
            });
            const rows = result.data.values;
            if (rows) {
                const numbers = rows.map(row => row[0]);
                return numbers.includes(number);
            }
            return false;
        }
        catch (error) {
            console.error("Error al verificar si el usuario existe:", error);
            return false;
        }
    }
    async createUser(number, name) {
        try {
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: 'Users!A:C',
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[number, name]],
                },
            });
            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                requestBody: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: number,
                                },
                            },
                        },
                    ],
                },
            });
        }
        catch (error) {
            console.error("Error al crear usuario o nueva pestaña:", error);
        }
    }
    async getUserConv(number) {
        try {
            const result = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${number}!A:B`,
            });
            const rows = result.data.values;
            if (!rows || rows.length === 0) {
                return [];
            }
            const lastConversations = rows.slice(-20).reverse();
            const formattedConversations = [];
            for (let i = 0; i < lastConversations.length; i++) {
                const [userQuestion, assistantAnswer] = lastConversations[i];
                formattedConversations.push({ role: "user", content: userQuestion }, { role: "assistant", content: assistantAnswer });
            }
            return formattedConversations;
        }
        catch (error) {
            console.error("Error al obtener la conversación del usuario:", error);
            return [];
        }
    }
    async addConverToUser(number, conversation) {
        try {
            const question = conversation.find(c => c.role === "user")?.content;
            const answer = conversation.find(c => c.role === "assistant")?.content;
            const date = new Date().toISOString();
            if (!question || !answer) {
                throw new Error("La conversación debe contener tanto una pregunta como una respuesta.");
            }
            const sheetData = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${number}!A:C`,
            });
            const rows = sheetData.data.values || [];
            rows.unshift([question, answer, date]);
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${number}!A:C`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: rows,
                },
            });
        }
        catch (error) {
            console.error("Error al agregar la conversación:", error);
        }
    }
}
export default new SheetManager(config.spreadsheetId, config.privateKey, config.clientEmail);

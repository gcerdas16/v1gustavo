import { google } from "googleapis";
import { config } from "../config";
class SheetManagerGustavo {
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
    async getUserConv(range) {
        try {
            const result = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range
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
    async addConverToUser(range, conversation) {
        try {
            const question = conversation.find(c => c.role === "user")?.content;
            const answer = conversation.find(c => c.role === "assistant")?.content;
            const date = new Date().toISOString();
            if (!question || !answer) {
                throw new Error("La conversación debe contener tanto una pregunta como una respuesta.");
            }
            const sheetData = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range
            });
            const rows = sheetData.data.values || [];
            rows.unshift([question, answer, date]);
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range,
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
    async readSheetGustavo(range) {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId, range
            });
            const rows = response.data.values;
            return rows;
        }
        catch (error) {
            console.error('error', error);
        }
    }
}
export default new SheetManagerGustavo(config.spreadsheetId, config.privateKey, config.clientEmail);

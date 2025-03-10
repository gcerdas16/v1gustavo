import fs from "fs";

export const removeFile = async (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
            //console.log(`File at ${filePath} deleted successfully.`);
        } else {
            console.log(`File at ${filePath} does not exist.`);
        }
    } catch (error) {
        console.error(`Error deleting file at ${filePath}: ${error.message}`);
    }
};
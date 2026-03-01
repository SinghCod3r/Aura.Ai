// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;
// @ts-ignore
let bot: any = null;

if (token) {
    bot = new TelegramBot(token, { polling: false });
} else {
    console.warn("TELEGRAM_BOT_TOKEN is not set.");
}

export const sendTelegramMessage = async (telegramId: string, message: string) => {
    if (!bot) {
        console.log(`Telegram Bot not initialized. Skipping message to ${telegramId}: ${message}`);
        return;
    }

    try {
        await bot.sendMessage(telegramId, message);
        console.log(`Telegram message sent to ${telegramId}`);
    } catch (error) {
        console.error(`Failed to send Telegram message to ${telegramId}:`, error);
    }
};

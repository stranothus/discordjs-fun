import discord from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new discord.Client({
    intents: [
        "GUILD_MESSAGES",
        "DIRECT_MESSAGES",
        "GUILDS",
        "GUILD_WEBHOOKS"
    ]
});

client.login(process.env.TOKEN);
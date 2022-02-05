import discord from "discord.js";
import dotenv from "dotenv";
import asUser from "./fun-stuff/asUser.js";

dotenv.config();

const client = new discord.Client({
    intents: [
        "GUILD_MESSAGES",
        "DIRECT_MESSAGES",
        "GUILDS",
        "GUILD_WEBHOOKS"
    ]
});

client.on("messageCreate", async msg => {
    if(msg.content.startsWith("webhook:")) asUser(msg.channel, msg.author, msg.content.replace("webhook:", ""), true);
});

client.login(process.env.TOKEN);
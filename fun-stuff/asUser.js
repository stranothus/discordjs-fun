import { MessageCollector } from "discord.js";

const allowedMentions = {
    roles: [],
    users: [],
    parse: []
};

/**
 * Sends a message as a user through a webhook
 * 
 * @typedef { import("discord.js") } discord
 * 
 * @param { discord.TextChannel } channel - the channel to message
 * @param { discord.User } author - the user to message as
 * @param { string } content - the content to send
 * 
 * @returns { void }
 */
async function asUser(channel, author, content, allowEdits) {
    const guild = channel.guild || channel.parent.guild;
    const permissions = guild.me.permissions;
    if(!permissions.has("MANAGE_WEBHOOKS") || !permissions.has("MANAGE_MESSAGES")) return;
    if(channel.type === "GUILD_PUBLIC_THREAD" || channel.type === "GUILD_PRIVATE_THREAD") {
        const webhook = (await channel.parent.fetchWebhooks()).filter(webhook => webhook.name === channel.client.user.tag).first() || await channel.parent.createWebhook(channel.client.user.tag);

        const webhookMsg = await webhook.send({
            content: content,
            avatarURL: `https://cdn.discordapp.com/avatars/${author.id || author.user.id}/${author.avatar || author.user.avatar}.png`,
            username: author.displayName || author.username,
            allowedMentions: allowedMentions,
            threadId: channel.id
        });

        if(!allowEdits) return webhookMsg;

        const collector = new MessageCollector(channel, {
            time: 1000 * 60,
            filter: msg => {
                if(!msg.reference) return false;
                if(msg.reference.messageId !== webhookMsg.id) return false;
                if(msg.author.id !== author.id) return false;

                return true;
            }
        });

        collector.on("collect", async msg => {
            const action = msg.content.match(/^(allowEdits|delete):?/i);

            if(!action) return;

            switch(action[0].replace(/:/, )) {
                case "edit": 
                    await webhook.editMessage(webhookMsg.id, {
                        content: msg.content.replace(/^edit:/, ),
                        avatarURL: `https://cdn.discordapp.com/avatars/${author.id || author.user.id}/${author.avatar || author.user.avatar}.png`,
                        username: author.displayName || author.username,
                        allowedMentions: allowedMentions,
                        threadId: channel.id
                    });
                break;
                case "*":
                    await webhook.editMessage(webhookMsg.id, {
                        content: msg.content.replace(/^edit:/, ),
                        avatarURL: `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png`,
                        username: author.username,
                        allowedMentions: allowedMentions
                    });
                break;
                case "delete":
                    await webhook.deleteMessage(webhookMsg.id, channel.id);
                break;
            }

            await msg.delete();
            collector.stop();
        });

        return webhookMsg;
    } else {
        const webhook = (await channel.fetchWebhooks()).filter(webhook => webhook.name === channel.client.user.tag).first() || await channel.createWebhook(channel.client.user.tag);

        const webhookMsg =  await webhook.send({
            content: content,
            avatarURL: `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png`,
            username: author.username,
            allowedMentions: allowedMentions
        });

        if(!allowEdits) return webhookMsg;

        const collector = new MessageCollector(channel, {
            time: 1000 * 60,
            filter: msg => {
                if(!msg.reference) return false;
                if(msg.reference.messageId !== webhookMsg.id) return false;
                if(msg.author.id !== author.id) return false;

                return true;
            }
        });

        collector.on("collect", async msg => {
            const action = msg.content.match(/^(allowEdits|delete):?/i);

            if(!action) return;

            switch(action[0].replace(/:/, ).toLowerCase()) {
                case "edit": 
                    await webhook.editMessage(webhookMsg.id, {
                        content: msg.content.replace(/^edit:/, ),
                        avatarURL: `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png`,
                        username: author.username,
                        allowedMentions: allowedMentions
                    });
                break;
                case "*":
                    await webhook.editMessage(webhookMsg.id, {
                        content: msg.content.replace(/^edit:/, ),
                        avatarURL: `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png`,
                        username: author.username,
                        allowedMentions: allowedMentions
                    });
                break;
                case "delete":
                    await webhook.deleteMessage(webhookMsg.id);
                break;
            }

            msg.delete();
        });

        return webhookMsg;
    }
}

export default asUser;
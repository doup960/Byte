require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

let versionFile = 'version.txt';
let Version = 'v0';

// Read and bump version
if (fs.existsSync(versionFile)) {
    let currentVersion = parseInt(fs.readFileSync(versionFile, 'utf8').replace('v', '')) || 0;
    Version = `v${currentVersion + 1}`;
    fs.writeFileSync(versionFile, Version);
} else {
    fs.writeFileSync(versionFile, Version);
}

// Admin roles map (server ID => Set of role IDs)
const adminRoles = new Map();

client.once('ready', () => {
    console.log('Bot is ready!');

    const channel = client.channels.cache.get('1363672290872656136');
    if (channel) {
        channel.send(`🟢 Bot is online! (${Version})`);
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();

    // hi message (no prefix)
    if (content === 'hi') {
        return message.reply('Hello! How may I help you?');
    }

    const prefix = 'b!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const guildId = message.guild.id;

    // Ensure adminRoles has an entry for the current guild
    if (!adminRoles.has(guildId)) {
        adminRoles.set(guildId, new Set());
    }

    // b!admin <roleID>
    if (command === 'admin') {
        if (message.guild.ownerId !== message.author.id) {
            return message.reply('Only the server owner can use this command.');
        }

        const roleId = args[0];
        if (!roleId) return message.reply('Please provide a role ID.');

        adminRoles.get(guildId).add(roleId);
        return message.reply(`Role <@&${roleId}> has been granted admin permissions for this bot.`);
    }

    // b!role <roleID>
    if (command === 'role') {
        const roleId = args[0];
        if (!roleId) return message.reply('Please provide a role ID.');

        const member = message.member;
        const adminSet = adminRoles.get(guildId);
        const hasAdminRole = member.roles.cache.some(role => adminSet.has(role.id));

        if (!hasAdminRole) {
            return message.reply('You do not have permission to use this command.');
        }

        const roleToGive = message.guild.roles.cache.get(roleId);
        if (!roleToGive) return message.reply('Role not found in this server.');

        if (member.roles.cache.has(roleId)) {
            return message.reply(`You already have the role **${roleToGive.name}**.`);
        }

        try {
            await member.roles.add(roleToGive);
            message.reply(`You have been given the **${roleToGive.name}** role.`);
        } catch (error) {
            console.error(error);
            message.reply('An error occurred while trying to assign the role.');
        }
    }
});

client.login(process.env.token);

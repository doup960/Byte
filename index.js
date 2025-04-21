const { Client, GatewayIntentBits, MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Load admin roles from file
const ADMIN_FILE = './adminRoles.json';
let adminRoles = {};
if (fs.existsSync(ADMIN_FILE)) {
    adminRoles = JSON.parse(fs.readFileSync(ADMIN_FILE));
}

// Load embed data from embeds.json
const EMBEDS_FILE = './embeds.json';
let embeds = {};
if (fs.existsSync(EMBEDS_FILE)) {
    embeds = JSON.parse(fs.readFileSync(EMBEDS_FILE));
}

// Versioning
const VERSION_FILE = './version.txt';
let Version = 'v0';
if (fs.existsSync(VERSION_FILE)) {
    let versionText = fs.readFileSync(VERSION_FILE, 'utf-8').trim();
    let num = parseInt(versionText.replace('v', '')) + 1;
    Version = 'v' + num;
    fs.writeFileSync(VERSION_FILE, Version);
} else {
    fs.writeFileSync(VERSION_FILE, Version);
}

client.once('ready', () => {
    console.log('Bot is ready!');
    const channel = client.channels.cache.get('1363672290872656136');
    if (channel) {
        channel.send(`🟢 Bot is online! (Version: ${Version})`);
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const prefix = 'b!';
    if (!message.content.toLowerCase().startsWith(prefix)) {
        if (message.content.toLowerCase() === 'hi') {
            return message.reply('Hello! How may I help you?');
        }
        return;
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // b!admin <roleId>
    if (command === 'admin') {
        if (!args[0]) return message.reply('Usage: b!admin <roleId> or b!admin list');

        if (args[0].toLowerCase() === 'list') {
            const roles = adminRoles[message.guild.id] || [];
            if (roles.length === 0) return message.reply('No admin roles set for this server.');
            const roleNames = roles.map(r => `<@&${r}>`).join(', ');
            return message.reply(`Admin roles: ${roleNames}`);
        }

        if (message.guild.ownerId !== message.author.id) return message.reply('Only the server owner can set admin roles.');
        
        const roleId = args[0];
        if (!message.guild.roles.cache.has(roleId)) return message.reply('That role ID does not exist.');

        if (!adminRoles[message.guild.id]) adminRoles[message.guild.id] = [];
        if (!adminRoles[message.guild.id].includes(roleId)) {
            adminRoles[message.guild.id].push(roleId);
            fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminRoles, null, 2));
            return message.reply(`Added <@&${roleId}> as an admin role.`);
        } else {
            return message.reply('That role is already an admin role.');
        }
    }

    // b!role <roleId>
    if (command === 'role') {
        const roleId = args[0];
        if (!roleId) return message.reply('Usage: b!role <roleId>');

        const role = message.guild.roles.cache.get(roleId);
        if (!role) return message.reply('That role does not exist.');

        const userRoles = message.member.roles.cache;
        const serverAdmins = adminRoles[message.guild.id] || [];

        const isAdmin = userRoles.some(r => serverAdmins.includes(r.id));
        if (!isAdmin) return message.reply('You do not have permission to use this command.');

        if (userRoles.has(roleId)) {
            return message.reply(`You already have the role <@&${roleId}>`);
        }

        try {
            await message.member.roles.add(roleId);
            message.reply(`You have been given the role <@&${roleId}>`);
        } catch (err) {
            console.error(err);
            message.reply('There was an error giving you the role.');
        }
    }

    // b!embed <embed_name>
    if (command === 'embed') {
        const embedName = args[0]?.toLowerCase();

        if (!embedName || !embeds[embedName]) {
            return message.reply('Invalid embed name or no embed found.');
        }

        const embedData = embeds[embedName];

        // Create the embed
        const embedMessage = {
            content: embedData.content || null,
            embeds: embedData.embeds || []
        };

        // Create buttons for the main rules if needed
        if (embedName === 'mainrules') {
            const row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('serverrules')
                    .setLabel('📜 Server Rules')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('voicechatrules')
                    .setLabel('🎧 Voice Chat Rules')
                    .setStyle('PRIMARY')
            );

            embedMessage.components = [row];
        }

        try {
            const sentMessage = await message.channel.send(embedMessage);
            if (embedName === 'mainrules') {
                const filter = (interaction) => interaction.isButton() && interaction.user.id === message.author.id;
                const collector = sentMessage.createMessageComponentCollector({ filter, time: 15000 });

                collector.on('collect', async (interaction) => {
                    if (interaction.customId === 'serverrules') {
                        await interaction.reply({ embeds: embeds['serverrules'].embeds, ephemeral: true });
                    } else if (interaction.customId === 'voicechatrules') {
                        await interaction.reply({ embeds: embeds['vc_rules'].embeds, ephemeral: true });
                    }
                });
            }
        } catch (error) {
            console.error(error);
            message.reply('There was an error sending the embed.');
        }
    }
});

client.login(process.env.token);

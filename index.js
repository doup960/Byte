const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const adminRoles = new Set();  // Define adminRoles here

// When bot goes online
client.once('ready', () => {
    console.log('Bot is ready!');
    // Send the version message in a specific channel when the bot is online
    const channel = client.channels.cache.get('1363672290872656136');
    channel.send(`🟢 Bot is online! Version: v${getCurrentVersion()}`);
});

// Command handling
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const prefix = 'b!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Handle "hi" command
    if (command === 'hi') {
        await message.reply('Hello! How may I help you?');
    }

    // Handle "admin" command
    if (command === 'admin') {
        if (message.author.id !== message.guild.ownerId) {
            return message.reply('Only the server owner can use this command.');
        }

        const roleId = args[0];
        if (!roleId) return message.reply('Please provide a role ID.');

        adminRoles.add(roleId);
        message.reply(`Role <@&${roleId}> can now run special commands.`);
    }

    // Handle "role" command
    if (command === 'role') {
        const roleId = args[0];
        if (!roleId) return message.reply('Please provide a role ID.');

        // Check if the role is authorized
        if (!adminRoles.has(roleId)) return message.reply('You do not have permission to use this command.');

        try {
            const role = message.guild.roles.cache.get(roleId);
            if (!role) return message.reply('Role not found in this server.');

            await message.member.roles.add(role);
            message.reply(`You have been given the <@&${roleId}> role.`);
        } catch (error) {
            console.error(error);
            message.reply('An error occurred while processing the role command.');
        }
    }
});

// Bot login
client.login(process.env.token);

// Version management (read from version.txt)
function getCurrentVersion() {
    const fs = require('fs');
    const versionFile = './version.txt';

    if (!fs.existsSync(versionFile)) {
        fs.writeFileSync(versionFile, '0'); // Create version file if it doesn't exist
    }

    let version = fs.readFileSync(versionFile, 'utf-8').trim();
    version = parseInt(version) + 1; // Increment version by 1
    fs.writeFileSync(versionFile, version.toString()); // Save updated version to file

    return version;
}

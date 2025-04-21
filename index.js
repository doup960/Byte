// Import the necessary libraries
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();  // Load the .env file

// Create a new Discord client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Version variable
let version = 0;  // Start at v0

// Store roles with admin privileges
const adminRoles = new Map();  // Map to store which role IDs can use specific commands

// Function to increment the version
function incrementVersion() {
    version++;
}

// Bot event when it's ready
client.once('ready', async () => {
    console.log('Bot is ready!');

    // Increment the version every time the bot starts
    incrementVersion();

    // Find the guild (server) by ID
    const guild = await client.guilds.fetch('1360706850042941500');
    
    // Find the specific channel to send the message to
    const channel = await guild.channels.fetch('1363672290872656136');  // Updated channel ID
    
    // Send the "Bot is online!" message along with the version
    channel.send(`🟢 Bot is online! Current Version: v${version}`);
});

// Bot event when it receives a message
client.on('messageCreate', async (message) => {
    // Prevent the bot from responding to its own messages
    if (message.author.bot) return;

    // Set the prefix
    const prefix = 'b!';

    // Ignore messages that don't start with the prefix
    if (!message.content.startsWith(prefix)) return;

    // Get the command part of the message
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Check if the message is "hi", case-insensitive
    if (command === 'hi') {
        message.reply('Hello! How may I help you?');
    }

    // Admin command to set roles with special permissions
    if (command === 'admin') {
        // Only allow server owner to use this command
        if (message.author.id === message.guild.ownerId) {
            // Get the role ID from the arguments
            const roleId = args[0];
            if (!roleId) return message.reply('Please provide a role ID.');

            // Store the role ID with the permission
            adminRoles.set(roleId, true);
            message.reply(`Role <@&${roleId}> can now run special commands.`);
        } else {
            message.reply('Only the server owner can set admin roles.');
        }
    }

    // Role command to give the role to the user
    if (command === 'role') {
        // Check if the user has the correct admin role
        const roleId = args[0];
        if (!roleId) return message.reply('Please provide a role ID.');

        // Check if the role has admin permissions
        if (!adminRoles.has(roleId)) return message.reply('You do not have permission to use this command.');

        // Check if the role exists in the server
        const role = message.guild.roles.cache.get(roleId);
        if (!role) return message.reply('Role not found in this server.');

        // Add the role to the user
        try {
            await message.member.roles.add(role);
            message.reply(`You have been given the <@&${roleId}> role.`);
        } catch (error) {
            message.reply('There was an error adding the role.');
        }
    }
});

// Log in to Discord with the token from the .env file
client.login(process.env.token);  // Replace with your token variable name

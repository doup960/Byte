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
client.on('messageCreate', (message) => {
    // Prevent the bot from responding to its own messages
    if (message.author.bot) return;

    // Check if the message is "hi", case-insensitive
    if (message.content.toLowerCase() === 'hi') {
        message.reply('Hello! How may I help you?');
    }
});

// Log in to Discord with the token from the .env file
client.login(process.env.token);  // Replace with your token variable name

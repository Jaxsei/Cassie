import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('messageCreate', message => {
  if (message.author.bot) return;


  //Embed URL
  if (message.content.startsWith('?embed')) {
    const url = message.content.split("?embed")[1];
    return message.reply({
      content: url
    })
  }
  // Say
  if (message.content.startsWith('?say')) {
    const str = message.content.slice(5); // Removes '?say ' part
    message.reply(str);
  }
  // Ping Pong!
  if (message.content.startsWith('?ping')) return message.reply({ content: "Pong!!" })
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'say') {
    const message = options.getString('message'); // Get the argument value

    if (!message) return interaction.reply('Please provide a message.');
    await interaction.reply(message); // Reply with the argument value
  }

  if (commandName === "embed") {
    const url = options.getString('url');
    if (!url) return interaction.reply('Please provide an url.')
    await interaction.reply(url)
  }
});

client.login(process.env.TOKEN)

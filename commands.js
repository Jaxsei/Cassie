import { REST, Routes } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders'; // Import SlashCommandBuilder
import dotenv from 'dotenv';
dotenv.config();


const commands = [

  //Ping Pong
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

  new SlashCommandBuilder()
    .setName('pong')
    .setDescription('Replies with Ping!'),



  //Say 
  new SlashCommandBuilder()
    .setName('say')
    .setDescription('Copies you.')
    .addStringOption(option =>
      option
        .setName('message') // Name of the argument
        .setDescription('The message to repeat') // Description of the argument
        .setRequired(true) // Whether the argument is required
    ),

  // Embed URL 
  new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Embeds URL')
    .addStringOption(option => option
      .setName('url')
      .setDescription('Url to embed')
      .setRequired(true)
    ),

  // Wikipedia
  new SlashCommandBuilder()
    .setName('wikipedia')
    .setDescription('Search a wikipedia')
    .addStringOption(option => option
      .setName('search')
      .setDescription('Text to search')
      .setRequired(true)
    ),

  // Random number generator
  new SlashCommandBuilder()
    .setName('rng')
    .setDescription('Generate a random number')
    .addStringOption(option => option
      .setName('minimum')
      .setDescription('Minimum number to generate')
      .setRequired(true)
    )
    .addStringOption(option => option
      .setName('maximum')
      .setDescription('Maximum number to generate')
      .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Gives a random quote'),

  new SlashCommandBuilder()
  .setName('weather')
  .setDescription('Search weather for a location')
  .addStringOption(option => option
    .setName('city')
    .setDescription('name of the city')
  )

];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN); // Don't expose token

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // Replace with your actual client ID
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Welcome And Goodbye Messages
const WELCOME_AND_GOODBYE_CHANNEL_ID = process.env.MESSAGE_CHANNEL_ID;

// Trigger when a user joins
client.on('guildMemberAdd', async (member) => {
  const channel = member.guild.channels.cache.get(WELCOME_AND_GOODBYE_CHANNEL_ID);
  if (!channel) return;

  channel.send(`Welcome to the server, <@${member.id}>! 🎉 Make yourself at home`);
});

// Trigger when a user leaves
client.on('guildMemberRemove', async (member) => {
  const channel = member.guild.channels.cache.get(WELCOME_AND_GOODBYE_CHANNEL_ID);
  if (!channel) return;

  channel.send(`Goodbye, ${member.user.tag}. We'll miss you! 😢`);
});


// Message Commands
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

  // Pong Ping!
  if (message.content.startsWith('?pong')) return message.reply({ content: "Ping!!" })


});


// Interaction Commands
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

  if (commandName === 'ping') {
    await interaction.reply('Pong!!')
  }

  if (commandName === 'pong') {
    await interaction.reply('ping!!')
  }

  if (commandName === 'wikipedia') {
    const searchText = options.getString('search');
    if (!searchText) return interaction.reply('Please provide a search term.');

    const wikiApiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&redirects=1&titles=${encodeURIComponent(searchText)}`;

    try {
      // Fetch Wikipedia summary
      const response = await fetch(wikiApiUrl);
      const data = await response.json();

      // Extract the page content
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];

      if (pageId === '-1') {
        return interaction.reply(`No results found for "${searchText}".`);
      }

      const page = pages[pageId];
      const summary = page.extract;

      // Reply with the summary and link
      await interaction.reply({
        content: `**${page.title}**\n\n${summary.slice(0, 1500)}\n\nRead more: https://en.wikipedia.org/wiki/${encodeURIComponent(searchText)}`,
      });
    } catch (error) {
      console.error('Error fetching Wikipedia data:', error);
      await interaction.reply('An error occurred while fetching data. Please try again later.');
    }
  }

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  if (commandName === 'rng') {
    const minimum = parseInt(options.getString('minimum'), 10); // Convert to integer
    const maximum = parseInt(options.getString('maximum'), 10); // Convert to integer

    if (isNaN(minimum) || isNaN(maximum)) {
      return interaction.reply('Invalid minimum or maximum number provided!');
    }

    const RNG = getRandomNumber(minimum, maximum);

    await interaction.reply(RNG.toString());
  }


  if (commandName === 'quote') {
    try {
      // Fetch a random quote from ZenQuotes API
      const response = await fetch('https://zenquotes.io/api/random');
      const data = await response.json();
      const quote = `${data[0].q} — ${data[0].a}`;

      // Reply with the fetched quote
      await interaction.reply(quote);
    } catch (error) {
      console.error('Error fetching quote:', error);
      await interaction.reply('Sorry, I could not fetch a quote at the moment.');
    }
  }


  if (commandName === 'weather') {
    const city = options.getString('city');

    if (!city) {
      return interaction.reply('Please provide a city name! 🌍');
    }

    try {
      const cityName = encodeURIComponent(city.trim()); // Encode city name for URL
      const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${WEATHER_API_KEY}&units=metric`);
      const weatherData = await weatherResponse.json();

      if (weatherData.cod !== 200) {
        return interaction.reply('Sorry, I couldn\'t find weather information for that city. Please check the spelling or try with the country code (e.g., "London,GB"). 😕');
      }

      const temperature = weatherData.main.temp;
      const weather = weatherData.weather[0].description;
      const humidity = weatherData.main.humidity;
      const windSpeed = weatherData.wind.speed;

      // Emojis to express the data
      const temperatureEmoji = temperature > 25 ? '🔥' : temperature < 10 ? '❄️' : '🌡️';
      const weatherEmoji = weather.includes('clear') ? '☀️' : weather.includes('cloud') ? '☁️' : weather.includes('rain') ? '🌧️' : '🌤️';
      const windEmoji = windSpeed > 5 ? '💨' : '🌬️';

      const weatherMessage = `
       🌍 **Weather Update for ${city}:**  ${weatherEmoji}

       🌡️  **Temperature:** ${temperature}°C  ${temperatureEmoji}  
       ☁️  **Weather:** ${weather}  🌦️  
       💧  **Humidity:** ${humidity}%  💦  
       🌬️  **Wind Speed:** ${windSpeed} m/s  ${windEmoji}

       Stay safe and take care! 💙
`;
      await interaction.reply(weatherMessage);
    } catch (error) {
      console.error('Error fetching weather:', error);
      await interaction.reply('Sorry, something went wrong while fetching the weather. 😔');
    }
  }

});

client.login(process.env.TOKEN)

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
client.on('messageCreate', async message => {
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

  // Snippet Sharing
  if (message.content.startsWith('!snippet')) {
    const args = message.content.split(' ');
    const language = args[1]; // First argument is the language
    const code = args.slice(2).join(' '); // The rest is the code

    if (!language || !code) {
      return message.reply(
        'Usage: `!snippet <language> <code>`\nExample: `!snippet javascript console.log("Hello, world!");`'
      );
    }

    // Send the formatted code block
    message.channel.send(`\`\`\`${language}\n${code}\n\`\`\``);
  }


  if (message.content.startsWith('!cat')) {
    try {
      const res = await fetch('https://api.thecatapi.com/v1/images/search');
      const data = await res.json();
      const imageUrl = data[0]?.url;

      if (imageUrl) {
        message.reply(imageUrl);
      } else {
        message.reply('**Error finding cat image**');
      }
    } catch (error) {
      console.error('Error fetching cats:', error);
      message.reply('**Error fetching cat images**');
    }
  }

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
      return interaction.reply('🌍 **Please provide a city name!**');
    }

    try {
      const cityName = encodeURIComponent(city.trim());
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${WEATHER_API_KEY}&units=metric`
      );

      if (!weatherResponse.ok) {
        return interaction.reply('⚠️ **Unable to fetch weather data. Try again later!**');
      }

      const weatherData = await weatherResponse.json();

      if (weatherData.cod !== 200) {
        return interaction.reply(
          '❌ **City not found!** Check spelling or try using a country code (e.g., `London,GB`).'
        );
      }

      // Extracting weather details
      const { temp, feels_like, humidity } = weatherData.main;
      const { speed: windSpeed } = weatherData.wind;
      const visibility = weatherData.visibility / 1000; // Convert to km
      const weatherDesc = weatherData.weather[0].description;
      const weatherIcon = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`;

      // Emoji conditions
      const tempEmoji = temp > 30 ? '🔥' : temp < 10 ? '❄️' : '🌡️';
      const windEmoji = windSpeed > 5 ? '💨' : '🍃';
      const visibilityEmoji = visibility < 2 ? '🌫️' : '👀';
      const weatherEmoji = weatherDesc.includes('clear')
        ? '☀️'
        : weatherDesc.includes('cloud')
          ? '☁️'
          : weatherDesc.includes('rain')
            ? '🌧️'
            : '🌤️';

      // **Advanced Markdown Message**
      const weatherMessage = `
        > 🏙️ **Weather Report for \`${city}\`** ${weatherEmoji}
        > 
        > 🔥 **Temperature:** \`${temp}°C\` ${tempEmoji} *(Feels like \`${feels_like}°C\`)*
        > ☁️ **Condition:** \`${weatherDesc}\`
        > 💧 **Humidity:** \`${humidity}%\` 💦
        > 🌬️ **Wind Speed:** \`${windSpeed} m/s\` ${windEmoji}
        > 👁️ **Visibility:** \`${visibility} km\` ${visibilityEmoji}
        >
        > ![Weather Icon](${weatherIcon})
        > 
        > 📝 ***Stay safe and dress accordingly!*** 💙
        `;

      await interaction.reply(weatherMessage);
    } catch (error) {
      console.error('❌ Error fetching weather:', error);
      await interaction.reply('⚠️ **Something went wrong. Try again later!**');
    }

    if (commandName === "cat") {

      const API_URL = `https://api.thecatapi.com/v1/images/search`;

      try {
        const res = await fetch(API_URL);
        const data = res.json();

        await interaction.reply(data.url)

      } catch (error) {
        console.error('Error fetching cats:', error);
        await interaction.reply('**Error fetching cat images**');
      }

    }
  }

});

client.login(process.env.TOKEN)

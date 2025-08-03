import { Client, Events, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import { commands, registerCommands } from './commands/index.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (_readyClient) => {
  void (async () => {
    try {
      const token = process.env.TOKEN;
      const clientId = process.env.CLIENT_ID;
      const guildId = process.env.GUILD_ID;

      if (!token || !clientId || !guildId) {
        console.error('Missing required environment variables:');
        if (!token) console.error('- TOKEN is missing');
        if (!clientId) console.error('- CLIENT_ID is missing');
        if (!guildId) console.error('- GUILD_ID is missing');
        throw new Error(
          'Missing TOKEN, CLIENT_ID, or GUILD_ID environment variables'
        );
      }

      await registerCommands(token, clientId, guildId);
    } catch (error) {
      console.error('Error during initialization:', error);
      process.exit(1);
    }
  })();
});

// Handle slash command interactions
client.on(Events.InteractionCreate, (interaction) => {
  void (async () => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);

    if (!command) {
      return;
    }

    try {
      await command.execute(interaction);
    } catch {
      const errorMessage = 'There was an error while executing this command!';

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  })();
});

// Log in to Discord with your client's token
void client.login(process.env.TOKEN);

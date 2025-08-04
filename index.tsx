import { Client, Events, GatewayIntentBits } from 'discord.js';
import { commands, registerCommands } from './commands/index.js';
import 'dotenv/config';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, () => {
  void (async () => {
    try {
      const token = process.env.TOKEN;
      const clientId = process.env.CLIENT_ID;
      const guildId = process.env.GUILD_ID;

      if (!token || !clientId || !guildId) {
        throw new Error(
          'Missing required environment variables: TOKEN, CLIENT_ID, or GUILD_ID'
        );
      }

      await registerCommands(token, clientId, guildId);
    } catch {
      process.exit(1);
    }
  })();
});

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
        await interaction.followUp({ content: errorMessage, flags: 64 });
      } else {
        await interaction.reply({ content: errorMessage, flags: 64 });
      }
    }
  })();
});

void client.login(process.env.TOKEN);

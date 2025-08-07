import { Client, Events, GatewayIntentBits } from 'discord.js';
import { commands, registerCommands } from './commands/index.js';
import { ENV } from './types/env.ts';
import {
  connectToDatabase,
  closeDatabaseConnection,
} from './database/connection.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once(Events.ClientReady, () => {
  void (async () => {
    try {
      await connectToDatabase();
      await registerCommands(ENV.TOKEN, ENV.CLIENT_ID, ENV.GUILD_ID);
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

process.on('SIGINT', () => {
  void (async () => {
    await closeDatabaseConnection();
    await client.destroy();
    process.exit(0);
  })();
});

process.on('SIGTERM', () => {
  void (async () => {
    await closeDatabaseConnection();
    await client.destroy();
    process.exit(0);
  })();
});

import { Collection, REST, Routes, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import * as pingCommand from './ping.js';
import * as dailyCommand from './daily.js';

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export const commands = new Collection<string, Command>();

commands.set(pingCommand.data.name, pingCommand);
commands.set(dailyCommand.data.name, dailyCommand);

export async function registerCommands(token: string, clientId: string, guildId: string): Promise<void> {
  const rest = new REST().setToken(token);
  
  const commandData = Array.from(commands.values()).map(command => command.data.toJSON());

  try {
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commandData },
    );
  } catch (error) {
    throw new Error(`Failed to register commands: ${String(error)}`);
  }
}

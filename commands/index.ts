import { Collection, REST, Routes, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import * as pingCommand from './ping.js';

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export const commands = new Collection<string, Command>();

// Manually register commands to avoid dynamic imports
commands.set(pingCommand.data.name, pingCommand);

// Register slash commands with Discord
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
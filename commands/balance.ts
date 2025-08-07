import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { UserDataModel } from '../database/models.js';

export const data = new SlashCommandBuilder()
  .setName('balance')
  .setDescription('Check your current coin balance');

export async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.user.id;
  const userDataModel = new UserDataModel();

  try {
    const userData = await userDataModel.findOrCreateUser(userId);

    await interaction.reply({
      content: `💰 You have **${userData.currency.toString()} coins** 🪙`,
      flags: 64,
    });
  } catch {
    await interaction.reply({
      content: 'Failed to retrieve your balance. Please try again later!',
      flags: 64,
    });
  }
}

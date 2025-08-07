import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { UserDataModel } from '../database/models.js';

const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getNextResetTime = (): Date => {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow;
};

export const data = new SlashCommandBuilder()
  .setName('daily')
  .setDescription('Claim your daily reward');

export async function execute(interaction: ChatInputCommandInteraction) {
  const member = interaction.member;
  const userId = interaction.user.id;

  if (!member || !('voice' in member)) {
    await interaction.reply({
      content: 'Unable to check your voice status!',
      flags: 64,
    });
    return;
  }

  const todayKey = getTodayKey();
  const userDataModel = new UserDataModel();

  try {
    const userData = await userDataModel.findOrCreateUser(userId);

    if (userData.lastDailyClaimDate === todayKey) {
      const nextReset = getNextResetTime();
      const hoursUntilReset = Math.ceil(
        (nextReset.getTime() - Date.now()) / (60 * 60 * 1000)
      );

      await interaction.reply({
        content: `⏰ You already claimed your daily! Resets in ${hoursUntilReset.toString()} hour(s).`,
        flags: 64,
      });
      return;
    }

    if (!member.voice.channel) {
      await interaction.reply({
        content: '🔇 You must be in a voice channel to claim your daily!',
        flags: 64,
      });
      return;
    }

    const voiceChannel = member.voice.channel;
    const memberCount = voiceChannel.members.size;

    if (memberCount < 2) {
      await interaction.reply({
        content: `👥 You need at least 2 people in **${voiceChannel.name}** to claim your daily!`,
        flags: 64,
      });
      return;
    }

    const reward = 100;
    await userDataModel.setLastDailyClaimDate(userId, todayKey);
    const updatedUser = await userDataModel.updateUserCurrency(userId, reward);

    if (!updatedUser) {
      await interaction.reply({
        content: 'Failed to update your balance. Please try again!',
        flags: 64,
      });
      return;
    }

    await interaction.reply({
      content: `🎉 Daily claimed! You earned **${reward.toString()} coins** 🪙\nYou were in **${voiceChannel.name}** with ${memberCount.toString()} people.\nBalance: **${updatedUser.currency.toString()} coins**`,
      flags: 64,
    });
  } catch {
    await interaction.reply({
      content: 'Failed to process your daily reward. Please try again later!',
      flags: 64,
    });
  }
}

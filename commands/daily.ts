import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

const dailyClaims = new Set<string>();

const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
}

const getNextResetTime = (): Date => {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow;
}

export const data = new SlashCommandBuilder()
  .setName('daily')
  .setDescription('Claim your daily reward');

export async function execute(interaction: ChatInputCommandInteraction) {
  const member = interaction.member;
  const userId = interaction.user.id;
  
  if (!member || !('voice' in member)) {
    await interaction.reply({ content: 'Unable to check your voice status!', flags: 64 });
    return;
  }

  const todayKey = getTodayKey();
  const userTodayKey = `${userId}-${todayKey}`;
  
  if (dailyClaims.has(userTodayKey)) {
    const nextReset = getNextResetTime();
    const hoursUntilReset = Math.ceil((nextReset.getTime() - Date.now()) / (60 * 60 * 1000));
    
    await interaction.reply({ 
      content: `⏰ You already claimed your daily! Resets in ${hoursUntilReset.toString()} hour(s).`, 
      flags: 64 
    });
    return;
  }

  if (!member.voice.channel) {
    await interaction.reply({ 
      content: '🔇 You must be in a voice channel to claim your daily!', 
      flags: 64 
    });
    return;
  }

  const voiceChannel = member.voice.channel;
  const memberCount = voiceChannel.members.size;
  
  if (memberCount < 2) {
    await interaction.reply({ 
      content: `👥 You need at least 2 people in **${voiceChannel.name}** to claim your daily!`, 
      flags: 64 
    });
    return;
  }

  dailyClaims.add(userTodayKey);
  
  await interaction.reply({ 
    content: `🎉 Daily claimed! You were in **${voiceChannel.name}** with ${memberCount.toString()} people.`, 
    flags: 64 
  });
}
import * as dotenv from 'dotenv'
import { Client, Events, GatewayIntentBits } from 'discord.js'
import { CronJob } from 'cron'

dotenv.config()

const { TOKEN } = process.env
const claims = new Set()

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
})

client.once(Events.ClientReady, () => {
  const open = new CronJob(
    '0 */5 17-23,0-5 * * *',
    () => {
      client.guilds.cache.forEach((guild) => {
        guild.members.cache.filter((member) => member.voice.channel).forEach((member) => {
          if (claims.has(member.id)) {
            claims.add(member.id)
          }
        })
      })
    },
    null,
    false,
    'America/Los_Angeles'
  )

  open.start()
})

void client.login(TOKEN)

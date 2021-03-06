import 'module-alias/register';

import dotenv from 'dotenv';
import Discord from 'discord.js';

import { formatUpcomingEvent } from './event';
import { checkForNewContests, getUpcomingEvents } from './notify';

import '@/platforms/codeforces';

dotenv.config();
if (!process.env.DISCORD_TOKEN) {
  throw Error('No DIRCORD_TOKEN variable found in .env file');
}

const client = new Discord.Client();
export const subscribedChannels: (
  | Discord.TextChannel
  | Discord.DMChannel
)[] = [];

client.once('ready', () => {
  setInterval(checkForNewContests, 60 * 60 * 1000);
  checkForNewContests();
});

client.on('message', async message => {
  if (message.author.bot) return;

  // eslint-disable-next-line default-case
  switch (message.content) {
    case '!subscribe':
      message.channel.send(
        'Okay, I will notify you about upcoming contests here!',
      );
      subscribedChannels.push(message.channel);
      break;
    case '!upcoming':
      message.channel.send('Okay, let me check for upcoming events...');
      (await getUpcomingEvents())
        .map(formatUpcomingEvent)
        .forEach(eventMessage => message.channel.send(eventMessage));
      break;
    case '!help':
      message.channel.send(
        '!upcoming - Upcoming contests\n' +
          '!subscribe - Notify upcoming events in this channel',
      );
      break;
  }
});

client.login(process.env.DISCORD_TOKEN);

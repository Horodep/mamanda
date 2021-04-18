import { MessageEmbed } from "discord.js";
import { GetDiscordMemberByMention } from "../clan/clanMember/clanMember.js";
import config from "../config.json";

export function GiveVyakbanAndCreateEmbed(message, args) {
    if (args.length < 4) throw "Указано недостаточно данных.";

    var discordMember = GetDiscordMemberByMention(message.guild, args[1]);
    var delta = args[2];
    var reason = args[3];

    discordMember.roles.add(config.roles.vyakban);

    var channel = message.client.channels.cache.get(config.channels.vyakbans);
    channel.send(CreateVyakbanEmbed(discordMember, new Date, CountDeltaTime(delta), reason)).then(msg => {
        msg.pin();
    })
}

function CountDeltaTime(delta) {
    var number = delta.slice(0, -1);
    var now = new Date();
    switch (delta.slice(-1)) {
        case "m":
            return new Date(now.getTime() + number * 60 * 1000);
        case "h":
            return new Date(now.getTime() + number * 60 * 60 * 1000);
        case "d":
            return new Date(now.getTime() + number * 24 * 60 * 60 * 1000);
    }
}

function CreateVyakbanEmbed(member, now, limit, reason) {
    return new MessageEmbed()
        .setAuthor(member.displayName)
        .setColor(0xDE0C00)
        .setDescription(":information_source: **" + reason + "**\n" + no + " " + now + "\n" + yes + " " + limit)
        .setFooter(member.id + " " + limit.getTime(), "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
}

export function CheckVyakbansLimitations(client) {
    var channel = client.channels.cache.get(config.channels.vyakbans);
    channel.messages.fetchPinned()
        .then(messages => messages.forEach(message => {
            if (message.author.bot && message.embeds.length > 0) {
                var data = message.embeds[0].footer.text.split(' ');
                var memberId = data[0];
                var date = new Date(parseInt(data[1]));

                if(date < new Date()) {
                    var member = channel.guild.members.cache.find(m => m.id == memberId);
                    member.roles.remove(config.roles.vyakban);
                    message.unpin();
                }
            }
        }))
}

const no = "<:no:769922772549632031>";
const yes = "<:yes:769922757592612874>";
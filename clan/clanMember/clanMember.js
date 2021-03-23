import { MessageEmbed } from "discord.js";
import { DiscordClanMember } from "./discordClanMember.js";

export class ClanMember extends DiscordClanMember {
    voiceOnline = 0;
    gameOnline = 0;
    accessToGameOnline = true;

    get percentage() {
        return (this.gameOnline == 0) ? 0 : Math.floor(100 * this.voiceOnline / this.gameOnline);
    }
    get isLowGame() {
        return this.gameOnline < 5 * 60 * 60;
    }
    get isZeroGame() {
        return this.gameOnline == 0;
    }
    get isZeroVoice() {
        return this.voiceOnline == 0;
    }

    AddToVoiceOnline(deltaTime) {
        if (!deltaTime) return;
        var deltaSeconds = (((deltaTime.hours ?? 0) * 60) + (deltaTime.minutes ?? 0)) * 60 + (deltaTime.seconds ?? 0);
        this.voiceOnline += deltaSeconds;
    }
    AddToGameOnline(deltaTime) {
        this.gameOnline += deltaTime;
    }

    GetPercentageLine() {
        var percentage = this.percentage;
        if (percentage < 100) { percentage = "0" + percentage; }
        if (percentage < 10) { percentage = "0" + percentage; }
        return percentage + "%";
    }

    GetTimeLine(seconds) {
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        if (hours < 10) { hours = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }
        return hours + ":" + minutes;
    }

    GetGameTimeLine() {
        return this.accessToGameOnline ? this.GetTimeLine(this.gameOnline) : "--:--";
    }

    GetVoiceTimeLine() {
        return this.GetTimeLine(this.voiceOnline);
    }

    GetMemberTimeString() {
        if (this.accessToGameOnline == false)
            return "**" + this.displayName + "** :: профиль закрыт; в войсе — " + this.GetVoiceTimeLine();
        else
            return "**" + this.displayName + "** :: " +
                this.GetVoiceTimeLine() + " / " +
                this.GetGameTimeLine() + " = " + this.percentage + "%";
    }

    FormLinesForDetailedVoice(results) {
        var lines = []
        results?.rows?.forEach((row) => {
            lines.push(new Date(row.datetime.getTime() + 3 * 60 * 60 * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(5, 16) + "   " +
                new Date(row.next_datetime_fixed.getTime() + 3 * 60 * 60 * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(5, 16) + "   " +
                PeriodValueToLine(row.period.hours) + ":" + PeriodValueToLine(row.period.minutes));
        });
        function PeriodValueToLine(value) {
            return value ? (value < 10 ? "0" + value : value) : "00";
        }
        return lines;
    }

    FillStringWithData(stringLine) {
        if (!stringLine) stringLine = "`$percent $voice $game $role`$tag";
        return stringLine
            .replace("$name", this.displayName)
            .replace("$tag", this.discordTag)
            .replace("$role", this.GetRoleMark())
            .replace("$game", this.GetGameTimeLine())
            .replace("$voice", this.GetVoiceTimeLine())
            .replace("$percent", this.GetPercentageLine())
    }

    GetMemberTimeEmbed(detailedLines) {
        const embed = new MessageEmbed()
            .setAuthor(this.displayName + " — " + this.percentage + "%")
            .setColor(0x00AE86)
            .setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
            .setTimestamp()
            .addField("Game online", this.accessToGameOnline == false ? "Classified" : (this.GetTimeLine(this.gameOnline) +
                " [(детальная статистика)](https://chrisfried.github.io/secret-scrublandeux/guardian/" + this.membershipType + "/" + this.membershipId + ")"))
        var body = this.GetTimeLine(this.voiceOnline) + "```";
        detailedLines.forEach(line => {
            if ((body + line).length > 1010) {
                embed.addField("Voice online", body + "\u200B```");
                body = "```" + line;
            } else {
                body += "\n" + line;
            }

        });
        embed.addField("Voice online", body + "\u200B```");
        return embed;
    }
}

export function GetDiscordMemberByMention(guild, discordMention) {
    var discordId = discordMention.replace(/\D/g, '');
    var discordMember = guild.members.cache.find(member => member.user.id == discordId);
    if (discordMember == null) throw 'Дискорд профиль не найден.';
    console.log(discordMember.displayName);
    return discordMember;
}

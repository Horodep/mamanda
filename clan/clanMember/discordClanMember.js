import { BungieApiClanMember } from "./bungieApiClanMember.js";
import config from "../../config.json";

//TODO@Horodep: #53 Extend or child variable? 
export class DiscordClanMember extends BungieApiClanMember {
    discordMember;

    constructor(apiMember, context) {
        super(apiMember);
        switch (context?.constructor?.name) {
            case "GuildMember":
                this.SetDiscordMember(context);
                break;
            case "Guild":
                this.FetchDiscordMember(context);
                break;
        }
    }

    get discordMemberExists() {
        return this.discordMember != null;
    }
    get discordMemberId() {
        return this.discordMember?.id;
    }
    get discordTag() {
        return "<@" + this.discordMember?.id + ">";
    }
    get joined() {
        return this.discordMember == null ? 0 :
            Math.floor((Date.now() - this.discordMember.joinedTimestamp) / (1000 * 60 * 60 * 24));
    }

    SetDiscordMember(discordMember) {
        this.discordMember = discordMember;
    }
    FetchDiscordMember(guild) {
        this.discordMember =
            guild.members.cache.find(member => (member.displayName.startsWith(this.displayName + " ")
                || member.displayName == this.displayName));
    }

    HasDiscordRole(roleId) {
        if (!this.discordMemberExists)
            return false;
        return this.discordMember.roles.cache.find(role => role.id == roleId) != null;
    }
    GetRoleMark() {
        if (this.HasDiscordRole(config.roles.newbie)) return "📗" + this.joined + "d";
        if (this.HasDiscordRole(config.roles.guardians[0])) return "📘";
        if (this.HasDiscordRole(config.roles.guardians[1])) return "📒";
        if (this.HasDiscordRole(config.roles.guardians[2])) return "📙";
        if (this.HasDiscordRole(config.roles.guardians[3])) return "📕";
        if (this.HasDiscordRole(config.roles.guildmaster)) return "👑";
        if (this.HasDiscordRole(config.roles.afk)) return "💤";
        if (this.HasDiscordRole(config.roles.raidleader)) return "🎓";
        return "❌";
    }

}

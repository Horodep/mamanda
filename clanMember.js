export class ClanMember {
    #destinyUserInfo;
    #clanId;/*
    #crossSaveOverride;
    #applicableMembershipTypes;
    #isPublic;
    #membershipType;
    #membershipId;
    #displayName;*/
    discordMember;

    constructor(member) {
        this.#destinyUserInfo = member.destinyUserInfo ?? member.userInfo;
        this.#clanId = member.groupId;
    }

    get membershipType() {
        return this.#destinyUserInfo.membershipType;
    }
    get membershipId() {
        return this.#destinyUserInfo.membershipId;
    }
    get displayName() {
        if (this.#destinyUserInfo.lastSeenDisplayName != null) {
            return this.#destinyUserInfo.lastSeenDisplayName;
        }
        return this.#destinyUserInfo.displayName;
    }

    get clanId() {
        return this.#clanId;
    }

    get discordMemberExists() {
        return this.discordMember != null;
    }
    get discordMemberId() {
        return this.discordMember.id != null;
    }
    SetDiscordMember(_discordMember) {
        this.discordMember = _discordMember;
    }
    LookForDiscordMember(guild) {
        this.discordMember =
            guild.members.cache.find(member => (member.displayName.startsWith(this.displayName + " ") 
                || member.displayName == this.displayName));
    }
}
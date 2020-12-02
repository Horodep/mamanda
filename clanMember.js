export class ClanMember{
    #destinyUserInfo;
    #clanId;/*
    #crossSaveOverride;
    #applicableMembershipTypes;
    #isPublic;
    #membershipType;
    #membershipId;
    #displayName;*/
    discordMember;

    constructor(destinyUserInfo, groupId){
        this.#destinyUserInfo = destinyUserInfo;
        this.#clanId = groupId;
    }

    get membershipType(){
        return this.#destinyUserInfo.membershipType;
    }
    get membershipId(){
        return this.#destinyUserInfo.membershipId;
    }
    get displayName(){
        return this.#destinyUserInfo.displayName;
    }

    get clanId(){
        return this.#clanId;
    }

    get discordMemberExists(){
        return this.discordMember != null;
    }
    get discordMemberId(){
        return this.discordMember.id != null;
    }
    SetDiscordMember(_discordMember) {
        this.discordMember = _discordMember;
    }
}
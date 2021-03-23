import { AsyncGetCoreMemberData, AsyncGetProfileData } from "../../http/bungieApi.js";

export class BungieApiClanMember {
    #destinyUserInfo;
    clanId;
    activeScore;
    characterIds;

    constructor(apiMember) {
        this.#destinyUserInfo = apiMember.destinyUserInfo ?? apiMember.userInfo;
        this.clanId = apiMember.groupId;
    }

    get membershipType() {
        return this.#destinyUserInfo.membershipType;
    }
    get membershipId() {
        return this.#destinyUserInfo.membershipId;
    }
    get displayName() {
        if (this.#destinyUserInfo.LastSeenDisplayName != null) {
            return this.#destinyUserInfo.LastSeenDisplayName;
        }
        return this.#destinyUserInfo.displayName;
    }

    async FetchCharacterIds() {
        var profileWithCharacters = await AsyncGetProfileData(this.#destinyUserInfo.membershipType, this.#destinyUserInfo.membershipId);
        this.characterIds = profileWithCharacters.data.characterIds;
    }
    async FetchActiveScore() {
        var coreMemberData = await AsyncGetCoreMemberData(this.#destinyUserInfo.membershipType, this.#destinyUserInfo.membershipId);
        this.activeScore = coreMemberData?.profileRecords?.data?.activeScore ?? 0;
    }
    async GetRecordDataState(triumphId) {
        var coreData = await AsyncGetCoreMemberData(this.#destinyUserInfo.membershipType, this.#destinyUserInfo.membershipId);

        return coreData?.profileRecords?.data?.records[triumphId]?.state % 2 == 1;
    }
}

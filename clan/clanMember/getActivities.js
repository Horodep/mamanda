import { AsyncGetActivitiesFromApi } from "../../http/bungieApi.js";


export async function AsyncGetAllActivities(clanMember, days) {
    var deltaDate = new Date();
    deltaDate.setDate(deltaDate.getDate() - days);

    var activities = [];
    var promises = clanMember.characterIds.map(async (characterId) => {
        Array.prototype.push.apply(activities, await AsyncGetCharacterActivities(clanMember, characterId, 0, 'None', deltaDate));
    });
    await Promise.all(promises);
    return activities;
}

async function AsyncGetCharacterActivities(clanMember, characterId, page, mode, deltaDate) {
    var filteredActivities = [];
    var responceActivities = await AsyncGetActivitiesFromApi(clanMember.membershipType, clanMember.membershipId, characterId, page, mode);

    if (responceActivities.ErrorCode == 1665) {
        clanMember.access = false;
        return [];
    }
    if (!responceActivities.Response?.activities) {
        return [];
    }

    var isLastPage = false;
    responceActivities.Response.activities.forEach(function (activity) {
        if (deltaDate < new Date(activity.period)) {
            filteredActivities.push(activity);
        } else {
            isLastPage = true;
        }
    });
    if (!isLastPage)
        Array.prototype.push.apply(filteredActivities, await AsyncGetCharacterActivities(clanMember, characterId, ++page, mode, deltaDate));
    return filteredActivities;
}

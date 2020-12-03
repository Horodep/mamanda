import { GetMemberByDiscordName } from "./clan.js";
import { GetClanVoiceSummary } from "./sql.js"
/*
#crossSaveOverride;
#applicableMembershipTypes;
#isPublic;
#membershipType;
#membershipId;
#displayName;*/
export class ClanMember {
    #destinyUserInfo;
    #clanId;
    discordMember;

    #voiceOnline = 0;
    #gameOnline = 0;

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
        return this.discordMember?.id;
    }
    SetDiscordMember(_discordMember) {
        this.discordMember = _discordMember;
    }
    LookForDiscordMember(guild) {
        this.discordMember =
            guild.members.cache.find(member => (member.displayName.startsWith(this.displayName + " ") 
                || member.displayName == this.displayName));
    }

    AddToVoiceOnline(addedTime) {
        this.#voiceOnline += addedTime;
    }

    GetMemberTimeString(){
        return "##:## / " + this.#voiceOnline;
    }
}

export async function GetClanMemberOnlineTime(message, args){
	var clanVoiceSummary = await GetClanVoiceSummary(7);
    var apiMember = await GetMemberByDiscordName(message.member.displayName);
	if (apiMember == null) {
		channel.send('Игровой профиль не найден.');
		return;
	}
    var clanMember = new ClanMember(apiMember);
    clanMember.LookForDiscordMember(message.guild);
    clanMember.AddToVoiceOnline(clanVoiceSummary[clanMember.discordMemberId]);

    message.send(clanMember.GetMemberTimeString());
}
/*
function member_request(found_member) {
    var membershipType = found_member.destinyUserInfo.membershipType;
    var membershipId = found_member.destinyUserInfo.membershipId;
    var displayName = found_member.destinyUserInfo.LastSeenDisplayName;
    finmember = new Member(membershipType, membershipId, displayName, 0);

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.bungie.net/Platform/Destiny2/" + membershipType + "/Profile/" + membershipId + "/?components=Profiles", true);
    xhr.timeout = 5000;
    xhr.setRequestHeader("X-API-Key", d2apiKey);
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var json = JSON.parse(this.responseText);
            if (typeof (json.Response.profile.data) == 'undefined') {
                console.log('name: ' + displayName + ' id: ' + membershipId + ' - access closed');
                finmember.setAccess(false);
            } else {
                var characterIds = json.Response.profile.data.characterIds;
                characterIds.forEach(function (characterId) {
                    c_size++;
                    character_page_request11111(membershipType, membershipId, characterId, 0, function () {
                        if (c_counter == c_size) {
                            , function (err, results, fields) {
                                if (err) console.log(err);
                                else {
                                    //console.log(pool);	
                                    text = "";
                                    text1 = "";
                                    text2 = "";
                                    results.forEach(function (line) {
                                        addon =
                                            new Date(line.datetime.getTime() + 3 * 60 * 60 * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(5, 16) + "   " +
                                            new Date(line.next_datetime_fixed.getTime() + 3 * 60 * 60 * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(5, 16) + "   " +
                                            line.td.substring(0, 5) + "\n";

                                        if ((text + addon).length > 1010) {
                                            if ((text1 + addon).length > 1010) {
                                                text2 += addon;
                                            } else {
                                                text1 += addon;
                                            }
                                        } else {
                                            text += addon;
                                        }
                                    });

                                    finmember.setDiscord(id);
                                    finmember.setDiscordTime(voice_online[id] ? voice_online[id] : 1);

                                    if (doFull) {
                                        const embed = new Discord.RichEmbed()
                                            .setAuthor(displayName + " — " + finmember.getPercentage() + "%")
                                            .setColor(0x00AE86)
                                            .addField("Game online", finmember.access == false ? "Classified" :
                                                (createLine(message, finmember, "solo") +
                                                    " [(детальная статистика)](https://chrisfried.github.io/secret-scrublandeux/guardian/" + membershipType + "/" + membershipId + ")"))
                                            .addField("Voice online", createLine(message, finmember, "solotime") + "```" + (text.length > 0 ? text : " ") + "```")
                                        if (text1.length > 0) embed.addField("Voice online", "```" + (text1.length > 0 ? text1 : " ") + "```")
                                        if (text2.length > 0) embed.addField("Voice online", "```" + (text2.length > 0 ? text2 : " ") + "```")
                                        embed
                                            .setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
                                            .setTimestamp()
                                        message.channel.send({ embed });
                                    } else {
                                        if (finmember.access == false)
                                            message.channel.send("**" + displayName + "** :: профиль закрыт; в войсе — " + createLine(message, finmember, "solotime"));
                                        else
                                            message.channel.send("**" + displayName + "** :: " +
                                                createLine(message, finmember, "solotime") + " / " +
                                                createLine(message, finmember, "solo") + " = " + finmember.getPercentage() + "%");
                                    }
                                    connection.release();
*/
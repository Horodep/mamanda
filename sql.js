import pkg from 'pg';
const { Pool } = pkg;
import config from "./config.json";

const pool = new Pool({
    host: config.sql.host,
    database: config.sql.database,
    user: config.sql.username,
    password: config.sql.password,
    port: 5432,
    max: 10
});

export async function GetClanVoiceSummary(days) {
    try{
        var clanVoiceSummary = [];
        var results = await pool.query(guildVoiceSummaryQuery, []);
        results.forEach(function (row) {
            clanVoiceSummary[row.id] = row.online;
        });
        console.log("guild voice online - ok");
    } catch (err) {
        console.log(err.stack)
    }
    return clanVoiceSummary;
}
export function GetVoiceTimeOld(days, voice_online) {
    pool.getConnection(function (err, connection) {
        if (err) console.log(err); // not connected!
        else {
            connection.query("SELECT " +
                "    CAST(t1.member_id as CHAR(50)) as id, " +
                "    SUM(TIME_TO_SEC(TIMEDIFF(t1.next_datetime_fixed, t1.datetime))) AS online " +
                "FROM( " +
                "    SELECT  " +
                "      t.*, " +
                "      CASE WHEN t.next_datetime IS NOT NULL  " +
                "          THEN t.next_datetime " +
                "          ELSE NOW() " +
                "      END AS next_datetime_fixed " +
                "    FROM ( " +
                "        SELECT  " +
                "            l.member_id, " +
                "            l.datetime, " +
                "            l.state, " +
                "            LEAD(datetime, 1) OVER ( " +
                "                PARTITION BY member_id " +
                "                ORDER BY datetime " +
                "            ) next_datetime, " +
                "            LEAD(state, 1) OVER ( " +
                "                PARTITION BY member_id " +
                "                ORDER BY datetime " +
                "            )next_state " +
                "        FROM log l) AS t) AS t1 " +
                "WHERE t1.datetime > NOW() - INTERVAL " + days + " DAY " +
                "AND state = 1 " +
                "GROUP BY t1.member_id;", [], function (err, results, fields) {
                    if (err) console.log(err);
                    else {
                        results.forEach(function (row) {
                            voice_online[row.id] = row.online;
                        });
                        connection.release();
                        console.log("guild voice online - ok");
                    }
                });
        }
    });
}
/*
var query2 = connection.query('SELECT * FROM members WHERE id = ?',  id, function(err, results, fields) {
    if (err) throw err;
    else {
        if(results.length > 0){
            results.forEach(function (line){
                if (line.membershipId == null) channel.send('Пользователь не найден.');
                else member_request(
                    {"destinyUserInfo" : {
                        "membershipType" : line.membershipType,
                        "membershipId" : line.membershipId,
                        "LastSeenDisplayName" : d_member.displayName
                        }
                    });
            });
        }else{
            channel.send('Пользователь не найден.');
        }
        connection.release();
    }
});*/

function bruh() {
    pool.query('SELECT * FROM public.members WHERE id = $1', [member.id], (err, results) => {
        if (err) throw err;
        if (results.length == 0) {
            pool.connect().query('INSERT INTO public.members (id, name, inVoice) VALUES ($1, $2, false)', [member.id, ''], (err) => {
                if (err) throw err;
                console.log("WaitingQuery: " + pool.waitingCount + "; insert member " + member.displayName);
            });
        }


        pool.query('UPDATE public.members SET inVoice=$1 WHERE id = $2', [inVoice, member.id], (err) => {
            if (err) throw err;
            console.log("WaitingQuery: " + pool.waitingCount + "; update member " + member.displayName);
        });
    });
}
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
                            pool.getConnection(function (err, connection) {
                                if (err) console.log(err); // not connected!
                                else {
                                    connection.query("SELECT " +
                                        "    t1.datetime, " +
                                        "    t1.next_datetime_fixed, " +
                                        "    TIMEDIFF(t1.next_datetime_fixed, t1.datetime) AS td " +
                                        "FROM( " +
                                        "    SELECT " +
                                        "      t.*, " +
                                        "      CASE WHEN t.next_datetime IS NOT NULL  " +
                                        "          THEN t.next_datetime " +
                                        "          ELSE NOW() " +
                                        "      END AS next_datetime_fixed " +
                                        "    FROM ( " +
                                        "        SELECT  " +
                                        "            l.member_id, " +
                                        "            l.datetime, " +
                                        "            l.state, " +
                                        "            LEAD(datetime, 1) OVER ( " +
                                        "                PARTITION BY member_id " +
                                        "                ORDER BY datetime " +
                                        "            ) next_datetime, " +
                                        "            LEAD(state, 1) OVER ( " +
                                        "                PARTITION BY member_id " +
                                        "                ORDER BY datetime " +
                                        "            )next_state " +
                                        "        FROM log l) AS t) AS t1 " +
                                        "WHERE t1.datetime > NOW() - INTERVAL " + days + " DAY " +
                                        "AND state = 1 " +
                                        "AND t1.member_id = " + id + ";", [], function (err, results, fields) {
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
                                            }
                                        });
                                }
                            });
                        }
                    });
                });
            }
        }
    }
    xhr.send();
}
//SUM(t1.next_datetime_fixed - t1.datetime) AS online 
const guildVoiceSummaryQuery =
    `SELECT 
    CAST(t1.member_id as CHAR(50)) as id, 
    SUM(t1.next_datetime_fixed - t1.datetime) AS online  
FROM( 
    SELECT  
      t.*, 
      CASE WHEN t.next_datetime IS NOT NULL  
          THEN t.next_datetime 
          ELSE NOW() 
      END AS next_datetime_fixed 
    FROM ( 
        SELECT  
            l.member_id, 
            l.datetime, 
            l.state, 
            LEAD(datetime, 1) OVER ( 
                PARTITION BY member_id 
                ORDER BY datetime 
            ) next_datetime, 
            LEAD(state, 1) OVER ( 
                PARTITION BY member_id 
                ORDER BY datetime 
            )next_state 
        FROM log l) AS t) AS t1 
WHERE t1.datetime > NOW() - INTERVAL '7 DAYS' 
AND state = true 
GROUP BY t1.member_id;`;
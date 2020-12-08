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

export async function GetMemberDetailedVoice(days, discordMemberId) {
    try {
        var results = await pool.query(memberVoiceDetailsQuery.replace('$2', days), [discordMemberId]);
        console.log("member voice online - ok");
    } catch (err) {
        console.log(err.stack)
    }
    return results;
}

export async function GetClanVoiceSummary(days) {
    try {
        var clanVoiceSummary = [];
        var results = await pool.query(guildVoiceSummaryQuery.replace('$2', days), []);
        results.rows.forEach(function (row) {
            clanVoiceSummary[row.id] = row.online;
        });
        console.log("guild voice online - ok");
    } catch (err) {
        console.log(err.stack)
    }
    return clanVoiceSummary;
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


const memberVoiceDetailsQuery =
    `SELECT 
    t1.datetime, 
    t1.next_datetime_fixed, 
    (t1.next_datetime_fixed - t1.datetime) AS period 
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
WHERE t1.datetime > NOW() - INTERVAL '$2 DAYS' 
AND state = true 
AND t1.member_id = $1;`;

const guildVoiceSummaryQuery =
    `SELECT 
    t1.member_id as id, 
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
WHERE t1.datetime > NOW() - INTERVAL '$2 DAYS' 
AND state = true 
GROUP BY t1.member_id;`;
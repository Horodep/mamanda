# mamanda
This is a discord bot created to manage a clan in the game Destiny 2. In fact it is designed to manage two clans as if it is one.
The most important features are voice control and roles granting.

## Short list of commands:
* show member voice statistics;
* show clan voice summary statistics;
* show member or top clan achievements;
* show player or clan ingame statistics;
* shedule and manage raids;
* show game data: vendor sales, sector rotation;
* change discord voice room cap;
* grant guest role to a friend;
* change discord region;
* different roles management;
* different notafications, public or in direct messages.

## example config.json
```json
{
    "credentials":{
        "discordApiKey" : "########################################################",
        "BotName"       : "Gladd you here",
        "d2apiKey"      : "#################################",
        "client_secret" : "###########################################",
        "client_id"     : "00000",
        "directory"     : "/home/user/",
        "game_defaults" : {
            "membershipType" : "3",
            "membershipId"   : "0000000000000000000",
            "characterId"    : "0000000000000000000"
        }

    },
        
    "sql"      :{
        "host"          : "examplehostname",
        "username"      : "username",
        "password"      : "password",
        "database"      : "database",
        "charset"       : "utf8"
    },
 
    "minimal_light" : "1200",

    "clans"         : [
        {
            "id"         : "0000000",
            "name"       : "First"
        },
        {
            "id"         : "0000000",
            "name"       : "Second"
        }
    ],
    
    "guilds"        :{
        "main"          : "000000000000000000", 
        "emojis"        : "000000000000000000"
    },
    "users"         :{
        "boss"          : "000000000000000000",
        "bot"           : "000000000000000000",
        "developer"     : "000000000000000000"
    },
    "roles"         :{
        "guildleader"   : "000000000000000000",
        "guildmaster"   : "000000000000000000",
        "raidleader"    : "000000000000000000",
        "guardians"      :[
            "000000000000000000",
            "000000000000000000",
            "000000000000000000",
            "000000000000000000"
        ],
        "newbie"        : "000000000000000000",
        "afk"           : "000000000000000000",
        "guest"         : "000000000000000000",
        "queue"         : "000000000000000000",
        "separators"    :{
            "clanname"      : "000000000000000000",
            "characters"    : "000000000000000000",
            "medals"        : "000000000000000000",
            "footer"        : "000000000000000000"
        },
        "clans"    :[
            "000000000000000000",
            "000000000000000000"
        ],
        "characters"    :{
            "warlock"       : "000000000000000000",
            "hunter"        : "000000000000000000",
            "titan"         : "000000000000000000"
        },
        "medals"        :{
            "specific"      :{
                "day1"          : "000000000000000000",
                "poi"           : "000000000000000000",
                "solo"          : "000000000000000000",
                "soloflawless"  : "000000000000000000"
            },
            "category_first_role"     :{
                "raids"          : "000000000000000000",
                "seals"          : "000000000000000000",
                "legacy_seals"   : "000000000000000000",
                "locations"      : "000000000000000000",
                "triumphs"       : "000000000000000000",
                "legacy_triumphs": "000000000000000000",
                "crucible"       : "000000000000000000",
                "season"         : "000000000000000000",
                "extralegacy"    : "000000000000000000"
            }
        },
        "wishes"        :{
            "lw"            : "000000000000000000",
            "gos"           : "000000000000000000",
            "dsc"           : "000000000000000000"
        },
        "no_medals"     : "000000000000000000",
        "forum_tag"     : "000000000000000000"
    },
    "channels"      :{
        "admintext"     : "000000000000000000",
        "suggestions"   : "000000000000000000",
        "deleted"       : "000000000000000000",
        "sandbox"       : "000000000000000000",
        "logging"       : "000000000000000000",
        "clankick"      : "000000000000000000",

        "afk"           : "000000000000000000",
        
        "gamenews"      : "000000000000000000",
        "clannews"      : "000000000000000000",
        
        "entrance"      : "000000000000000000",
        "flood"         : "000000000000000000",
        "statistics"    : "000000000000000000",
        "raids"         : "000000000000000000",
        "lfg"           : "000000000000000000",
        "wishes"        : "000000000000000000"
    },
    "categories"    :{
        "limited"       : "000000000000000000"
    }
 }
```

## Database
```sql
CREATE TABLE members (
    id VARCHAR(255) NOT NULL, /*I had some troubles with requesting bigint so it is string*/
    name BINARY(50) NOT NULL,
    inVoice BINARY NOT NULL,
    membershipId VARCHAR(255) DEFAULT NULL,
    membershipType INT UNSIGNED DEFAULT NULL,
    PRIMARY KEY (id)
)

CREATE TABLE log (
    id INT NOT NULL AUTO_INCREMENT,
    member_id BIGINT NOT NULL,
    datetime DATETIME NOT NULL,
    state BINARY NOT NULL,
    PRIMARY KEY (id),
    UNIQUE INDEX id_UNIQUE(id)
)

CREATE 
	DEFINER = 'root'@'localhost'
TRIGGER onInVoiceUpdate
	AFTER UPDATE
	ON members
	FOR EACH ROW
BEGIN
    IF NEW.inVoice <> OLD.inVoice THEN
        INSERT INTO auroras.log (member_id, datetime, state) VALUES (NEW.id, NOW(), NEW.inVoice);
    END IF;
END
```

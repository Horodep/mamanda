# mamanda
clan discord bot for two clans

## example config.json
```json
{
    "_comment": "This is an example file. Here should be your data.",
   
	"discordApiKey" : "000000000000000000000000000000000000000000000000000",
	"BotName"       : "Gladd you here",

	"d2apiKey"      : "00000000000000000000000000000000",
	"d2clientId"    : "00000",

	"guild"			: "000000000000000000",
	"clan1"         : "0000000",
	"clan2"         : "0000000",

	"roles"         :{
		"gm"            : "000000000000000000"
	},
	
	"users"         :{
		"boss"          : "000000000000000000",
		"bot"           : "000000000000000000",
        "developer"     : "000000000000000000"
	},

	"channels"      :{
		"admintext"     : "000000000000000000",
		"suggestions"   : "000000000000000000",
		"deleted"       : "000000000000000000",
		"sandbox"       : "000000000000000000",
		"afk"           : "000000000000000000",
		
		"gamenews"      : "000000000000000000",
		"clannews"      : "000000000000000000",
		
		"entrance"      : "000000000000000000",
		"flood"         : "000000000000000000",
		"statistics"    : "000000000000000000",
		"raids"         : "000000000000000000",
		"lfg"           : "000000000000000000"
	},

	"mysql"      :{
		"host"          : "localhost",
		"username"      : "username",
		"password"      : "password",
		"database"      : "database",
		"charset"       : "utf8"
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

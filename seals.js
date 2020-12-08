var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Discord = require("discord.js");
const keys = require('./keys');
var fs = require('fs');
var d2apiKey = keys.d2apiKey();

exports.seals = function(message) {
	var bot_msg = message;
	var members;
	var authorName = "";
	
	function request_clan(callback) { //// 1
		var xhr_clan = new XMLHttpRequest();
		xhr_clan.open("GET", "https://www.bungie.net/Platform/GroupV2/3055823/Members/", true);
		xhr_clan.setRequestHeader("X-API-Key", d2apiKey);
		xhr_clan.onreadystatechange = function(){
			if(this.readyState === 4 && this.status === 200){
				var json = JSON.parse(this.responseText);
				
				members = json.Response.results;
				var size = 0;
				members.forEach(function(member, i, members) { size++; });
				
				var xhr_clan1 = new XMLHttpRequest();
				xhr_clan1.open("GET", "https://www.bungie.net/Platform/GroupV2/3858144/Members/", true);
				xhr_clan1.setRequestHeader("X-API-Key", d2apiKey);
				xhr_clan1.onreadystatechange = function(){
					if(this.readyState === 4 && this.status === 200){
						var json = JSON.parse(this.responseText);
						
						members1 = json.Response.results;
						members1.forEach(function(member, i, members1) { 
							members.push(member);
							size++; 
						});
						
						const embed = new Discord.RichEmbed()
							  .setAuthor("Clan seals — request in progress: [00/"+size+"]")
							  .setColor(0x00AE86)
							  .setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
							  .setTimestamp()
						message.channel.send({embed}).then((msg)=>{
							bot_msg = msg;
						});
						callback(members, size);
					}
				}
				xhr_clan1.send();
			}
		}
		xhr_clan.send();
	}
	
	function handle_members(callback){
		request_clan(function handleMembersList(members, size) {  //// 2
			var seals = [[], [], [], [], [], [], [], [], [], []]
			
			var completed = 0;
			var i = 0;
			var check = function(){
				if(i == size){
					
				}
				else {
					member_request(members[i], i, seals, callback, size);
					i++;
					setTimeout(check, 100); 
				}
			}

			check();
		})
	}
	
	function member_request(member, i, seals, callback, size){  //// 3
		var membershipId = member.destinyUserInfo.membershipId;
		var displayName = member.destinyUserInfo.displayName;
		
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "https://www.bungie.net/Platform/Destiny2/3/Profile/"+membershipId+"/?components=Records", true);
		xhr.timeout = 5000;
		xhr.setRequestHeader("X-API-Key", d2apiKey);
		xhr.onreadystatechange = function(){
			if(this.readyState === 4 && this.status === 200){
				var json = JSON.parse(this.responseText);
				if(typeof(json.Response.profileRecords.data) == 'undefined'){
					console.log('name: '+displayName+' id: '+membershipId+': undefined');									
				}else{
					if(message.member.displayName.includes(displayName)) authorName = displayName;
					if (json.Response.profileRecords.data.records[2182090828].state == 67) seals[0].push(displayName);
					if (json.Response.profileRecords.data.records[1693645129].state == 67) seals[1].push(displayName);
					if (json.Response.profileRecords.data.records[3369119720].state == 67) seals[2].push(displayName);
					if (json.Response.profileRecords.data.records[1754983323].state == 67) seals[3].push(displayName);
					if (json.Response.profileRecords.data.records[3798931976].state == 67) seals[4].push(displayName);
					if (json.Response.profileRecords.data.records[2757681677].state == 67) seals[5].push(displayName);
					if (json.Response.profileRecords.data.records[2053985130].state == 67) seals[6].push(displayName);
					if (json.Response.profileRecords.data.records[1313291220].state == 67) seals[7].push(displayName);
					if (json.Response.profileRecords.data.records[1883929036].state == 67) seals[8].push(displayName);
					var character;
					Object.keys(json.Response.characterRecords.data).forEach(function(key) {
						character = json.Response.characterRecords.data[key];
					});
					if (character.records[2254764897].state == 67) seals[9].push(displayName);
				}
				counter++;
				console.log('counter: '+counter+' size: '+size+' name: '+displayName);
				if (counter % 10 == 0 || counter == size) callback(seals, size, counter == size);
			}
		}
		xhr.send();
	}
	
	
	var counter = 0;
	handle_members(function reportData(seals, size, isLast) { //// 4
		var seal_titles = ['Rivensbane: ', 'Cursebreaker: ', 'Unbroken: ', 'Chronicler: ',
					 'Dredgen: ', 'Wayfarer: ', 'Blacksmith: ', 'Reckoner: ', 'Shadow: ', 'MMXIX: ']
					 
		const embed = new Discord.RichEmbed()
		  .setAuthor("Clan seals" + (isLast ? "" : " — request in progress: ["+counter+"/"+size+"]"))
		  .setColor(0x00AE86)
		  //.setDescription(seals.join('\n'))
		  .setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
		  //.setImage("http://i.imgur.com/yVpymuV.png")
		  .setTimestamp()
		for(var i=0; i<seal_titles.length; i++){
			embed.addField(
				seal_titles[i], 
				seals[i].length == 0 ? "-" : seals[i].sort().join(' ').replace(authorName, "<@"+message.member.id+">"), true)
		}
		bot_msg.edit({embed});
	});
}				
exports.triumph = function(message, triumphid) {
	if (triumphid == 0){
		message.channel.send("Вы не обозначили искомый триумф.");
		return;
	}
	
	var bot_msg = message;
	var members;
	let rawdata = fs.readFileSync('destiny2.json');
	let manifest = JSON.parse(rawdata);
	var tmpnames = [];
	
	try{
		var a = manifest.Record[triumphid].displayProperties.name;
	} catch(e) {
		message.channel.send("Триумф не найден.");
		return;
	}
	
	function request_clan(callback) { //// 1
		var xhr_clan = new XMLHttpRequest();
		xhr_clan.open("GET", "https://www.bungie.net/Platform/GroupV2/3055823/Members/", true);
		xhr_clan.setRequestHeader("X-API-Key", d2apiKey);
		xhr_clan.onreadystatechange = function(){
			if(this.readyState === 4 && this.status === 200){
				var json = JSON.parse(this.responseText);
				
				members = json.Response.results;
				var size = 0;
				members.forEach(function(member, i, members) { size++; });
				
				var xhr_clan1 = new XMLHttpRequest();
				xhr_clan1.open("GET", "https://www.bungie.net/Platform/GroupV2/3858144/Members/", true);
				xhr_clan1.setRequestHeader("X-API-Key", d2apiKey);
				xhr_clan1.onreadystatechange = function(){
					if(this.readyState === 4 && this.status === 200){
						var json = JSON.parse(this.responseText);
						
						members1 = json.Response.results;
						members1.forEach(function(member, i, members1) { 
							members.push(member);
							size++; 
						});
						
						const embed = new Discord.RichEmbed()
							  .setAuthor("Clan triumph — request in progress: [00/"+size+"]")
							  .setColor(0x00AE86)
							  .setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
							  .setTimestamp()
						message.channel.send({embed}).then((msg)=>{
							bot_msg = msg;
						});
						callback(members, size);
					}
				}
				xhr_clan1.send();
			}
		}
		xhr_clan.send();
	}
	
	function handle_members(callback){
		request_clan(function handleMembersList(members, size) {  //// 2
			var triu = []
			
			var completed = 0;
			var i = 0;
			var check = function(){
				if(i == size){
					
				}
				else {
					member_request(members[i], i, triu, callback, size);
					i++;
					setTimeout(check, 200); 
				}
			}

			check();
		})
	}
	
	function member_request(member, i, triu, callback, size){  //// 3
		var membershipType = member.destinyUserInfo.membershipType;
		var membershipId = member.destinyUserInfo.membershipId;
		var displayName = member.destinyUserInfo.LastSeenDisplayName;
		//tmpnames.push(displayName);
		
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "https://www.bungie.net/Platform/Destiny2/"+membershipType+"/Profile/"+membershipId+"/?components=Records", true);
		xhr.timeout = 5000;
		xhr.setRequestHeader("X-API-Key", d2apiKey);
		xhr.onreadystatechange = function(){
			if(this.readyState === 4 && this.status === 200){
				var json = JSON.parse(this.responseText);
				counter++;
				//tmpnames = tmpnames.filter(function(tmpnames, index, arr){ return tmpnames != displayName;});
				if(typeof(json.Response.profileRecords.data) == 'undefined'){
					console.log('name: '+displayName+' id: '+membershipId+': undefined');									
				}else{
					try{
						if (json.Response.profileRecords.data.records[triumphid].state%2 == 1) triu.push(displayName);
						console.log('first  check OK - counter: '+counter+' size: '+size+' name: '+displayName);
					} catch(e) {
						try{
							var character;
							Object.keys(json.Response.characterRecords.data).forEach(function(key) {
								character = json.Response.characterRecords.data[key];
							});
							if (character.records[triumphid].state%2 == 1) triu.push(displayName);
							console.log('second check OK - counter: '+counter+' size: '+size+' name: '+displayName);
						} catch(e) {
							console.log('all checks FAIL - counter: '+counter+' size: '+size+' name: '+displayName);
						}
					}
					
				}
				/*
A Flags enumeration/bitmask where each bit represents a possible state that a Record/Triumph can be in.

None: 0
If there are no flags set, the record is in a state where it *could* be redeemed, but it has not been yet.
RecordRedeemed: 1
If this is set, the completed record has been redeemed.
RewardUnavailable: 2
If this is set, there's a reward available from this Record but it's unavailable for redemption.
ObjectiveNotCompleted: 4
If this is set, the objective for this Record has not yet been completed.
Obscured: 8
If this is set, the game recommends that you replace the display text of this Record with DestinyRecordDefinition.stateInfo.obscuredString.
Invisible: 16
If this is set, the game recommends that you not show this record. Do what you will with this recommendation.
EntitlementUnowned: 32
If this is set, you can't complete this record because you lack some permission that's required to complete it.
CanEquipTitle: 64
If this is set, the record has a title (check DestinyRecordDefinition for title info) and you can equip it.
				*/
				
				//console.log(tmpnames);
				if (counter % 10 == 0 || counter == size) callback(triu, size, counter == size);
			}
		}
		xhr.send();
	}
	
	
	var counter = 0;
	handle_members(function reportData(triu, size, isLast) { //// 4
		try{
			const embed = new Discord.RichEmbed()
			  .setAuthor(manifest.Record[triumphid].displayProperties.name + (isLast ? "" : " — request in progress: ["+counter+"/"+size+"]"))
			  .setColor(0x00AE86)
			  .setThumbnail('https://www.bungie.net' + manifest.Record[triumphid].displayProperties.icon)
			  //.setDescription(seals.join('\n'))
			  //.setImage("http://i.imgur.com/yVpymuV.png")
			  .setFooter(manifest.Record[triumphid].displayProperties.description, "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
			
			if (triu.length > 0) embed.addField("1 - "+Math.round(triu.length/2), 					triu.sort().filter((_,i) => i <  triu.length/2).join("\n"), true)
			if (triu.length > 1) embed.addField((Math.round(triu.length/2)+1)+" - "+triu.length, 	triu.sort().filter((_,i) => i >= triu.length/2).join("\n"), true)
			
			bot_msg.edit({embed});
		} catch(e) {
			message.channel.send('Ошибка ' + e.name + ":" + e.message + "\n<@149245139389251584> \n" + e.stack);
		}
	});
}				
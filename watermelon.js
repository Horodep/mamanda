var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Discord = require("discord.js");
const keys = require('./keys');
var numeral = require('numeral');
var d2apiKey = keys.d2apiKey();

var bot_msg;
	
exports.watermelon = function(channel, battleTag, isOsiris) {
	if(battleTag.startsWith("id:")){
		var steam_id = battleTag.replace(/\D/g,'');
		var discord_id = null;
		console.log(discord_id);
		var d_member = null;
		
		check_history(channel, 3, steam_id, null);
		
	}else{
		var discord_id = battleTag.replace(/\D/g,'');
		console.log(discord_id);
		var d_member = channel.guild.members.find(member => member.user.id == discord_id);
		
		if(d_member == null){
			channel.send('Дискорд пользователь не найден.');
			return;
		}
		
		var clan = new XMLHttpRequest();
		clan.open("GET", "https://www.bungie.net/Platform/GroupV2/3055823/Members/", true);
		clan.setRequestHeader("X-API-Key", d2apiKey);
		clan.onreadystatechange = function(){
			if(this.readyState === 4 && this.status === 200){
				var json = JSON.parse(this.responseText);
			
				var found_member = null;
				var members = json.Response.results;
				members.forEach(function(member) { 
					if(d_member.displayName.startsWith(member.destinyUserInfo.LastSeenDisplayName + " ") || d_member.displayName == member.destinyUserInfo.LastSeenDisplayName){
						found_member = member;
					}
				});
				
				if(found_member != null){
					console.log(found_member.destinyUserInfo.LastSeenDisplayName);
					check_history(channel, 
								found_member.destinyUserInfo.membershipType, 
								found_member.destinyUserInfo.membershipId, 
								found_member.destinyUserInfo.LastSeenDisplayName);
				}else{
					var clan1 = new XMLHttpRequest();
					clan1.open("GET", "https://www.bungie.net/Platform/GroupV2/3858144/Members/", true);
					clan1.setRequestHeader("X-API-Key", d2apiKey);
					clan1.onreadystatechange = function(){
						if(this.readyState === 4 && this.status === 200){
							var json = JSON.parse(this.responseText);
						
							var members1 = json.Response.results;
							members1.forEach(function(member) { 
								if(d_member.displayName.startsWith(member.destinyUserInfo.LastSeenDisplayName + " ") || d_member.displayName == member.destinyUserInfo.LastSeenDisplayName){
									found_member = member;
								}
							});
							
							if(found_member == null){
								channel.send('Пользователь не найден.');									
							}else{
								console.log(found_member.destinyUserInfo.LastSeenDisplayName);
								check_history(channel, 
											found_member.destinyUserInfo.membershipType, 
											found_member.destinyUserInfo.membershipId, 
											found_member.destinyUserInfo.LastSeenDisplayName);
							}
						}
					}
					clan1.send();
				}
			}
		}
		clan.send();
	}
}

function check_history(channel, membershipType, membershipId, displayName){
	
	var watermelon_counter = {};
	var c_size = 0;
	var c_counter = 0;
	var errors = 0;
	
	var xhr0 = new XMLHttpRequest();
	xhr0.open("GET", "https://www.bungie.net/Platform/Destiny2/"+membershipType+"/Account/"+membershipId+"/Stats/", true);
	//xhr0.open("GET", "https://www.bungie.net/Platform/Destiny2/"+membershipType+"/Profile/"+membershipId+"/?components=Profiles", true);
	xhr0.timeout = 5000;
	xhr0.setRequestHeader("X-API-Key", d2apiKey);
	xhr0.onreadystatechange = function(){
		if(this.readyState === 4 && this.status === 200){
			var json = JSON.parse(this.responseText);
			if(typeof(json.Response.characters) == 'undefined'){
				console.log('name: '+displayName+' id: '+membershipId+' - access closed');
				channel.send('История активностей закрыта.');
			}else{
				var characters = json.Response.characters;
				characters.forEach(function(character){
					c_size++;
					character_page_request(membershipType, membershipId, character.characterId, 0);
				});
			}
		}else if (this.readyState === 4 && this.status != 200){
			console.log('name: '+displayName+' id: '+membershipId+' - access closed');
			channel.send('История активностей закрыта.');
		}
	}
	xhr0.send();
	
	function character_page_request(membershipType, membershipId, characterId, page){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "https://www.bungie.net/Platform/Destiny2/"+membershipType+"/Account/"+membershipId+"/Character/"+characterId+"/Stats/Activities/?mode=69&count=250&page="+page, true);
		xhr.timeout = 5000;
		xhr.setRequestHeader("X-API-Key", d2apiKey);
		xhr.onreadystatechange = function(){
			if(this.readyState === 4 && this.status === 200){
				var json = JSON.parse(this.responseText);
				if(json.ErrorCode != 1){
					console.log("json err");
				}
				if(typeof(json.Response) == 'undefined' || typeof(json.Response.activities) == 'undefined'){
					c_counter++;
					console.log(membershipId+' characterId: '+characterId+' page: '+page+' name: '+ displayName +' - empty page');
					create_output();
				}else{
					console.log(membershipId+' characterId: '+characterId+' page: '+page+' name: '+ displayName );
					var activities = json.Response.activities;
					activities.forEach(function(act){
						//console.log(act.period, act.values.kills.basic.value, act.values.deaths.basic.value, act.values.assists.basic.value)
						//member_time[membershipId].addTime(act.values.timePlayedSeconds.basic.value);
						if (act.values.kills.basic.value == 0 &&
							act.values.deaths.basic.value == 0 && 
							act.values.assists.basic.value == 0) {
								var date_cut = new Date(act.period.substring(0,4) , act.period.substring(5,7)-1, act.period.substring(8,10));
								//var date_cut = act.period.substring(0,10);
								if (watermelon_counter[date_cut] == null) watermelon_counter[date_cut] = 0;
								watermelon_counter[date_cut]++;
						}
					});

					character_page_request(membershipType, membershipId, characterId, page+1);
				}
			}else if (this.readyState === 4 && this.status != 200){
				c_counter++;
				console.log(membershipId+' characterId: '+characterId+' page: '+page+' name: '+ displayName +' - HTTP ERROR');
			}
		}
		xhr.send();
	}
	
	function create_output() {
		if(c_counter == c_size){
			var date_s4  = new Date(2018 ,  9-1, 4);
			var date_s6  = new Date(2018 , 12-1, 4);
			var date_s5  = new Date(2019 ,  3-1, 5);
			var date_s7  = new Date(2019 ,  6-1, 4);
			var date_s8  = new Date(2019 , 10-1, 1);
			var date_s9  = new Date(2019 , 12-1, 10);
			var date_s10 = new Date(2020 ,  3-1, 10);
			var date_s11 = new Date(2020 ,  6-1, 9);
			var date_s12 = new Date(2020 , 11-1, 10);
			
			console.log(watermelon_counter);
			var block = {};
			for (var key in watermelon_counter) {
				var date = new Date(key);
				
				if(date > date_s11 && watermelon_counter[key] > 2){
					if (block[11] == null) block[11] = "";
					block[11] = block[11] + "`" + key.substring(4,10) + "` • " + watermelon_counter[key] + "\n";
				} else if(date > date_s10 && watermelon_counter[key] > 2){
					if (block[10] == null) block[10] = "";
					block[10] = block[10] + "`" + key.substring(4,10) + "` • " + watermelon_counter[key] + "\n";
				} else if(date > date_s9 && watermelon_counter[key] > 2){
					if (block[9] == null) block[9] = "";
					block[9] = block[9] + "`" + key.substring(4,10) + "` • " + watermelon_counter[key] + "\n";
				} else if(date > date_s8 && watermelon_counter[key] > 2){
					if (block[8] == null) block[8] = "";
					block[8] = block[8] + "`" + key.substring(4,10) + "` • " + watermelon_counter[key] + "\n";
				} else if(date > date_s7 && watermelon_counter[key] > 2){
					if (block[7] == null) block[7] = "";
					block[7] = block[7] + "`" + key.substring(4,10) + "` • " + watermelon_counter[key] + "\n";
				} else if(date > date_s6 && watermelon_counter[key] > 2){
					if (block[6] == null) block[6] = "";
					block[6] = block[6] + "`" + key.substring(4,10) + "` • " + watermelon_counter[key] + "\n";
				} else if(date > date_s5 && watermelon_counter[key] > 2){
					if (block[5] == null) block[5] = "";
					block[5] = block[5] + "`" + key.substring(4,10) + "` • " + watermelon_counter[key] + "\n";
				} else if(date > date_s4 && watermelon_counter[key] > 2){
					if (block[4] == null) block[4] = "";
					block[4] = block[4] + "`" + key.substring(4,10) + "` • " + watermelon_counter[key] + "\n";
				} 
			};
			
			const embed = new Discord.RichEmbed()
				  .setAuthor(displayName == null ? "---" : displayName)
				  .setColor(0x00AE86)
				  .setFooter("Количество матчей с 0/0/0")
				  .setTimestamp()//🔷🔶
			
			for (var key in block) {
				embed.addField("Сезон " + key, block[key], true)
			}
			
			channel.send(embed);
		}
	}
};



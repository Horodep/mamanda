var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Discord = require("discord.js");
const keys = require('./keys');
var d2apiKey = keys.d2apiKey();
var fs = require('fs');

let rawdata = fs.readFileSync('destiny2.json');  
let manifest = JSON.parse(rawdata);
	
class Member {
	constructor(type, id, displayName, time) {
		this.type = type;
		this.id = id;
		this.displayName = displayName;
		this.time = time;
		this.access = true;
		this.discordId = null;
		this.discordTime = 1;
		this.inClan = 999;
	}
	
	getPercentage(){
		if (this.time == 0)
			return 0;
		else
			return Math.floor(100*this.discordTime/this.time);
	}
	
	addTime(deltaTime) {
		this.time += deltaTime;
	}
	
	setAccess(b) {
		this.access = b;
		if(b == false) this.time = 2;
	}
	
	setDiscord(id) {
		this.discordId = id;
	}
	
	setDiscordTime(discordNewTime) {
		this.discordTime = discordNewTime;
	}
	
	setInClan(_inClan) {
		this.inClan = _inClan;
	}
}

exports.rl = function(channel, discordTag, days) {
	rl_core(channel, discordTag, days);
	//rl_bybattlenet(channel, discordTag, days);
}
function rl_bybattlenet(channel, battleTag, days){
	var member_id = new XMLHttpRequest();
	member_id.open("GET", "https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/3/"+encodeURI(battleTag).replace("#", "%23")+"/", true);
	member_id.setRequestHeader("X-API-Key", d2apiKey);
	member_id.onreadystatechange = function(){
		if(this.readyState === 4 && this.status === 200){
			var json = JSON.parse(this.responseText);
						
			if(typeof(json.Response[0]) == 'undefined'){
				message.channel.send('Пользователь не найден.');									
			}else{
				var resp = json.Response[0];
				get_rl(channel, resp.membershipId, resp.displayName, days);
			}
		}
	}
	member_id.send();
}
function rl_core(channel, discordTag, days){
	var discord_id = discordTag.replace(/\D/g,'');
	var d_member = channel.guild.members.find(member => member.user.id == discord_id);
	
	var clan = new XMLHttpRequest();
	clan.open("GET", "https://www.bungie.net/Platform/GroupV2/3055823/Members/", true);
	clan.setRequestHeader("X-API-Key", d2apiKey);
	clan.onreadystatechange = function(){
		if(this.readyState === 4 && this.status === 200){
			console.log("answer");
			var json = JSON.parse(this.responseText);
		
			var found_member = null;
			var members = json.Response.results;
			members.forEach(function(member) { 
				if(d_member.displayName.startsWith(member.destinyUserInfo.displayName)){
					found_member = member;
				}
			});
			
			if(found_member == null){
				var clan1 = new XMLHttpRequest();
				clan1.open("GET", "https://www.bungie.net/Platform/GroupV2/3858144/Members/", true);
				clan1.setRequestHeader("X-API-Key", d2apiKey);
				clan1.onreadystatechange = function(){
					if(this.readyState === 4 && this.status === 200){
						console.log("answer");
						var json = JSON.parse(this.responseText);
					
						var members1 = json.Response.results;
						members1.forEach(function(member) { 
							if(d_member.displayName.startsWith(member.destinyUserInfo.displayName)){
								found_member = member;
							}
						});
						
						if(found_member == null){
							channel.send('Пользователь не найден.');									
						}else{
							get_rl(channel, found_member.destinyUserInfo.membershipType, found_member.destinyUserInfo.membershipId, found_member.destinyUserInfo.displayName, days);
						}
					}
				}
				clan1.send();								
			}else{
				get_rl(channel, found_member.destinyUserInfo.membershipType, found_member.destinyUserInfo.membershipId, found_member.destinyUserInfo.displayName, days);
			}
		}
	}
	clan.send();
}

function get_rl(channel, membershipType, membershipId, displayName, days){//days = 7
	var raids = [];
	var member_info = [];
	
	var chars = 0;
	var counter = 0;
	
	var r_num = 0;
	var r_counter = 0;
	
	var s_chars = 0;
	var s_counter = 0;
	
	var member_chars = 0;
	var member_counter = 0;
	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://www.bungie.net/Platform/Destiny2/"+membershipType+"/Profile/"+membershipId+"/?components=Profiles", true);
	xhr.timeout = 5000;
	xhr.setRequestHeader("X-API-Key", d2apiKey);
	xhr.onreadystatechange = function(){
		if(this.readyState === 4 && this.status === 200){
			var json = JSON.parse(this.responseText);
			if(typeof(json.Response.profile.data) == 'undefined'){
				console.log('name: '+displayName+' id: '+membershipId+' - access closed');
				channel.send(displayName + ' — доступ к профилю закрыт');
			}else{
				var characterIds = json.Response.profile.data.characterIds;
				characterIds.forEach(function(characterId){
					chars++;
					character_page_request(membershipType, membershipId, characterId, 0);
				});
			}
		}
	}
	xhr.send();
	
	function character_page_request(membershipType, membershipId, characterId, page){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "https://www.bungie.net/Platform/Destiny2/"+membershipType+"/Account/"+membershipId+"/Character/"+characterId+"/Stats/Activities/?mode=raid&count=250&page="+page, true);
		xhr.timeout = 5000;
		xhr.setRequestHeader("X-API-Key", d2apiKey);
		xhr.onreadystatechange = function(){
			if(this.readyState === 4 && this.status === 200){
				var json = JSON.parse(this.responseText);
				if(typeof(json.Response) == 'undefined' || typeof(json.Response.activities) == 'undefined'){
					counter++;
					console.log('characterId: '+characterId+' name: '+displayName +' - no actions');
				}else{
					var activities = json.Response.activities;
					
					var delta = new Date();
					delta.setDate(delta.getDate()-days);
					
					console.log('characterId: '+characterId+' name: '+displayName);
					counter++;
					activities.forEach(function(act){
						if(delta < new Date(act.period)){
							r_num++;
							raid_request(act.activityDetails.instanceId); 
						}
					});
				}
			}else if (this.readyState === 4 && this.status != 200){
				counter++;
				channel.send(displayName + ' — доступ к истории активностей закрыт');
				console.log('characterId: '+characterId+' name: '+displayName +' - HTTP ERROR');
			}
		}
		xhr.send();
	}
	
	function raid_request(instanceId){
		var xhr1 = new XMLHttpRequest();
		xhr1.open("GET", "https://stats.bungie.net/Platform/Destiny2/Stats/PostGameCarnageReport/"+instanceId+"/", true);
		xhr1.timeout = 5000;
		xhr1.setRequestHeader("X-API-Key", d2apiKey);
		xhr1.onreadystatechange = function(){
			if(this.readyState === 4 && this.status === 200){
				var json = JSON.parse(this.responseText);
				if(json.ErrorCode != 1){
					console.log("err");
				}
				if(typeof(json.Response) == 'undefined'){
					console.log('err - rl raid_request');
				}else{
					var entries = json.Response.entries;
					
					raids[instanceId] = {
						'name': manifest.Activity[json.Response.activityDetails.referenceId].originalDisplayProperties.name,
						'date': json.Response.period.replace(/T/, ' ').replace(/\..+/, '').slice(5, -4),
						'activityId': instanceId,
						'referenceId': json.Response.activityDetails.referenceId,
						'roster': []
					};
					
					r_counter++;
					console.log('raid: '+instanceId);
					entries.forEach(function(guardian){
						check_member(
							instanceId, 
							guardian.player.destinyUserInfo.membershipType, 
							guardian.player.destinyUserInfo.displayName, 
							guardian.player.destinyUserInfo.membershipId, 
							guardian.values.completed.basic.displayValue == 'Yes')
					});
				}
			}
		}
		xhr1.send();
	}
	
	function check_member(activityId, membershipType, displayName, membershipId, completed){
		raids[activityId].roster.push({
			'name': displayName,
			'membershipId': membershipId,
			'completed': completed
		});
		
		if(typeof(member_info[membershipId]) == 'undefined'){
			s_chars++;
			member_info[membershipId] = {
				'Leviathan' : 0,
				'Leviathan, Eater of Worlds' : 0,
				'Leviathan, Spire of Stars' : 0,
				'Last Wish' : 0,
				'Scourge of the Past' : 0,
				'Crown of Sorrow' : 0,
				'Garden of Salvation' : 0
			};
			
			var member_xhr = new XMLHttpRequest();
			member_xhr.open("GET", "https://stats.bungie.net/Platform/Destiny2/"+membershipType+"/Account/"+membershipId+"/Stats/", true);
			member_xhr.timeout = 5000;
			member_xhr.setRequestHeader("X-API-Key", d2apiKey);
			member_xhr.onreadystatechange = function(){
				if(this.readyState === 4 && this.status === 200){
					s_counter++;
					var json = JSON.parse(this.responseText);
					if(typeof(json.Response) == 'undefined'){
						console.log(displayName + ' err - member access');
					}else{
						var characters = json.Response.characters;
						characters.forEach(function(character){
							member_chars++;
							count_character_raids(activityId, membershipType, displayName, membershipId, completed, character);
						});
					}
				}else if (this.readyState === 4 && this.status != 200){
					s_counter++;
					console.log(displayName + ' err - member access');
					member_info[membershipId]['Leviathan, Eater of Worlds'] = -1;
					member_info[membershipId]['Leviathan, Spire of Stars'] = -1;
					member_info[membershipId]['Leviathan'] = -1;
					member_info[membershipId]['Last Wish'] = -1;
					member_info[membershipId]['Scourge of the Past'] = -1;
					member_info[membershipId]['Crown of Sorrow'] = -1;
					member_info[membershipId]['Garden of Salvation'] = -1;
				}
			}
			member_xhr.send();
		}else{
			feedback();
		}
	}
	function count_character_raids(activityId, membershipType, displayName, membershipId, completed, character){
		var member_char_xhr = new XMLHttpRequest();
		member_char_xhr.open("GET", "https://stats.bungie.net/Platform/Destiny2/"+membershipType+"/Account/"+membershipId+"/Character/"+character.characterId+"/Stats/AggregateActivityStats/", true);
		member_char_xhr.timeout = 5000;
		member_char_xhr.setRequestHeader("X-API-Key", d2apiKey);
		member_char_xhr.onreadystatechange = function(){
			if(this.readyState === 4 && this.status === 200){
				var json = JSON.parse(this.responseText);
				if(typeof(json.Response) == 'undefined'){
					console.log('err - member character access');
					member_counter++;
				}else{
					var activities = json.Response.activities;
					
					activities.forEach(function(activity){
						var name = typeof(manifest.Activity[activity.activityHash]) == "undefined" ? 
									activity.activityHash.toString() :
									manifest.Activity[activity.activityHash].displayProperties.name;
						if(typeof(name) != 'undefined'){
							var value = activity.values.activityCompletions.basic.value
							if(name.includes('Leviathan, Eater of Worlds')){
								member_info[membershipId]['Leviathan, Eater of Worlds'] += value;
							}else if(name.includes('Leviathan, Spire of Stars')){
								member_info[membershipId]['Leviathan, Spire of Stars'] += value;
							}else if(name.includes('Leviathan')){
								member_info[membershipId]['Leviathan'] += value;
							}else if(name.includes('Last Wish')){
								member_info[membershipId]['Last Wish'] += value;
							}else if(name.includes('Scourge of the Past')){
								member_info[membershipId]['Scourge of the Past'] += value;
							}else if(name.includes('Crown of Sorrow')){
								member_info[membershipId]['Crown of Sorrow'] += value;
							}else if(name.includes('Garden of Salvation')){
								member_info[membershipId]['Garden of Salvation'] += value;
							}
						}
					});
					member_counter++;
					
					feedback();
				}
			}
		}
		member_char_xhr.send();
	}
	function feedback(){
		//console.log(s_chars, s_counter, r_num, r_counter, member_chars , member_counter);
		if (s_chars == s_counter && r_num == r_counter && member_chars == member_counter){
			const embed = new Discord.RichEmbed()
			  .setAuthor("Raid Leader — " + displayName)
			  .setColor(0x00AE86)
			  .setFooter("Horobot :: ✅ — рейд истинного РЛ-а; ❌ — обычный рейд", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
			  .setTimestamp()
			
			var isRL = false;
			for (var activityId in raids) {
				var raid = raids[activityId];
				var textbody = "";
				
				var finished = 0;
				var novice_raid = 0;
				raid.roster.forEach(function(guardian) {
					if (member_info[guardian.membershipId][raid.name] < 4) novice_raid++;
					if (guardian.completed) finished++;
					textbody += '`' + (guardian.completed ? '✅' : '❌') + 
								' [' + (member_info[guardian.membershipId][raid.name] > 9 || member_info[guardian.membershipId][raid.name] < 0 ?
										member_info[guardian.membershipId][raid.name] :
										' ' + member_info[guardian.membershipId][raid.name]) + ']` ' + guardian.name + '\n';
				});
				if(novice_raid > 2) isRL = true;
				if(finished) embed.addField(raid.name + ' ' + (novice_raid > 2 ? '`✅`' : '`❌`'), textbody + '`' + raid.date + ' ` [link](https://raid.report/pgcr/' + raid.activityId + ')', true);
			};
			//if (isRL) embed.setThumbnail('https://cdn.discordapp.com/attachments/232823880031535107/616349912770150491/yes.png')
			channel.send({embed});
		}
	}
}

exports.rls = function(channel, days) {
	var leaders = channel.guild.roles.find(role => role.name == "Наставник Света");
	leaders.members.forEach(function(member){
		rl_core(channel, member.user.id, days);
	});
}
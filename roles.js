var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Discord = require("discord.js");
const keys = require('./keys');
var numeral = require('numeral');
var iconv = require('iconv-lite');
var d2apiKey = keys.d2apiKey();

const mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit : 10,
	host     : '127.0.0.1',
	user     : 'horodep',
	password : 'sql12345',
	database : 'auroras',
	charset  : 'utf8'
});


var bot_msg;
var minlight = 1041;

exports.roles_bytag = function(channel, battleTag, sync) {
	if(battleTag.startsWith("id:")){
		var steam_id = battleTag.replace(/\D/g,'');
		var discord_id = null;
		console.log(discord_id);
		var d_member = null;
		
		roles(channel, 3, steam_id, null, "-", false);
		
	}else{
		var discord_id = battleTag.replace(/\D/g,'');
		console.log(discord_id);
		var d_member = channel.guild.members.find(member => member.user.id == discord_id);
		
		if(d_member == null){
			channel.send('Дискорд пользователь не найден.');
			return;
		}
		
		console.log("Check in Penumbra;");
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
					if (sync == true) CreateSync(channel, discord_id, found_member.destinyUserInfo.membershipType, found_member.destinyUserInfo.membershipId, found_member.destinyUserInfo.LastSeenDisplayName);
					roles(channel, found_member.destinyUserInfo.membershipType, found_member.destinyUserInfo.membershipId, found_member.destinyUserInfo.LastSeenDisplayName, "3055823");
				}else{
					console.log("Check in Antumbra;");
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
								console.log("Check in Database;");
								pool.getConnection(function(err, connection) {
									if (err) throw err; // not connected!
									
									var query2 = connection.query('SELECT * FROM members WHERE id = ?',  discord_id, function(err, results, fields) {
										if (err) throw err;
										else {
											if(results.length > 0){
												results.forEach(function (line){
													if (line.membershipId == null) channel.send('Пользователь не найден.');
													else roles(channel, line.membershipType, line.membershipId, d_member.displayName, null);
												});
											}else{
												channel.send('Пользователь не найден.');
											}
											connection.release();
										}
									});
								});								
							}else{
								console.log(found_member.destinyUserInfo.LastSeenDisplayName);
								if (sync == true) CreateSync(channel, discord_id, found_member.destinyUserInfo.membershipType, found_member.destinyUserInfo.membershipId, found_member.destinyUserInfo.LastSeenDisplayName);
								roles(channel, found_member.destinyUserInfo.membershipType, found_member.destinyUserInfo.membershipId, found_member.destinyUserInfo.LastSeenDisplayName, "3858144");
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

exports.set_clan_roles = function(channel){
	var xhr_clan = new XMLHttpRequest();
	xhr_clan.open("GET", "https://www.bungie.net/Platform/GroupV2/3858144/Members/", true);
	xhr_clan.setRequestHeader("X-API-Key", d2apiKey);
	xhr_clan.onreadystatechange = function(){
		if(this.readyState === 4 && this.status === 200){
			var json = JSON.parse(this.responseText);
			
			var size = 0;
			members = json.Response.results;
			members.forEach(function(member, i, members) { 
				size++;
			});
			
			var xhr_clan1 = new XMLHttpRequest();
			xhr_clan1.open("GET", "https://www.bungie.net/Platform/GroupV2/3055823/Members/", true);
			xhr_clan1.setRequestHeader("X-API-Key", d2apiKey);
			xhr_clan1.onreadystatechange = function(){
				if(this.readyState === 4 && this.status === 200){
					var json = JSON.parse(this.responseText);
					
					var size = 0;
					members1 = json.Response.results;
					members1.forEach(function(member, i, members1) {
						members.push(member);
						size++; 
					});
					
					var i = 0;
					
					var check = function(){
						if(i < members.length){
							roles(channel,
									members[i].destinyUserInfo.membershipType, 
									members[i].destinyUserInfo.membershipId, 
									members[i].destinyUserInfo.LastSeenDisplayName, 
									members[i].groupId,
									true);
							i++;
							setTimeout(check, 5000); 
						}
					}
					check();
				}
			}
			xhr_clan1.send();
		}
	}
	xhr_clan.send();
}

function CreateSync(channel, discord_id, membershipType, membershipId, LastSeenDisplayName){
	pool.getConnection(function(err, connection) {
		if (err) throw err; // not connected!
		
		var enc_buf = iconv.encode(LastSeenDisplayName, 'cp1251')[0] == 0x3f ?
					iconv.encode(LastSeenDisplayName, 'cp1253') :
					iconv.encode(LastSeenDisplayName, 'cp1251');
					
		var query = connection.query('UPDATE members SET membershipType=?, membershipId=?, name=? WHERE id = ?', 
									 [membershipType, 
									  membershipId, 
									  enc_buf, 
									  discord_id], 
													function(err, result) {
			if (err) throw err;
			else {
				console.log(new Date() + " Free: "+pool._freeConnections.length + "; " + LastSeenDisplayName + " synched");
				connection.release();
				
				pool.getConnection(function(err, connection) {
					if (err) throw err; // not connected!
					var query2 = connection.query('SELECT * FROM members WHERE id = ?',  discord_id, function(err, results, fields) {
						if (err) throw err;
						else {
							results.forEach(function (line){
								var buffer = Buffer.from( line.name, 'binary' );
								console.log(line);
								var i = buffer.indexOf(0x00);
								channel.send("name: " + iconv.decode(buffer, line.membershipId == '4611686018484533589' ? 'cp1253' : 'cp1251').toString().slice(0, i) + "\n"+
											 "bungie: " + line.membershipType + "/"+ line.membershipId + "\n"+
											 "discord: <@" + line.id + ">" );
							});
							
							
							
							connection.release();
						}
					});
				});
			}
		});
	});
}

function roles(channel, membershipType, membershipId, displayName, clanid, doNotMessage) {
	var bot_msg = "";
	var fulldata = new XMLHttpRequest();
	fulldata.open("GET", "https://www.bungie.net/Platform/Destiny2/"+membershipType+"/Profile/"+membershipId+"/?components=Profiles,Characters,CharacterProgressions,PresentationNodes,Records,Collectibles", true);
	fulldata.setRequestHeader("X-API-Key", d2apiKey);
	fulldata.onreadystatechange = function(){
		if(this.readyState === 4 && this.status === 200){
			var jsondata = JSON.parse(this.responseText);
						
			if(typeof(jsondata.Response.profileRecords.data) == 'undefined'){
				console.log(displayName + ' '.repeat(48-displayName.length), "NO DATA");
				if(!doNotMessage) channel.send('Данные профиля не были получены. Профиль закрыт настройками приватности.\n'+
											   'Настройки приватности: https://www.bungie.net/ru/Profile/Settings/?category=Privacy');
			}else{
				if (displayName == null) displayName = jsondata.Response.profile.data.userInfo.displayName;
				
				var characterIds = jsondata.Response.profile.data.characterIds;
				var characters = jsondata.Response.characters.data;
				
				var titan = -1;
				var hunter = -1;
				var warlock = -1;
				
				characterIds.forEach(function(characterId){
					switch(characters[characterId].classType){
						case 0:
							titan = characters[characterId].light;
							break;
						case 1:
							hunter = characters[characterId].light;
							break;
						case 2:
							warlock = characters[characterId].light;
							break;
					}
				});
				
				//				ROLES
				var characterPresentationNodes = [];
				for (var characterID in jsondata.Response.characterPresentationNodes.data) characterPresentationNodes.push([characterID, jsondata.Response.characterPresentationNodes.data[characterID]]);
				
				var characterRecords = [];
				for (var characterID in jsondata.Response.characterRecords.data) characterRecords.push([characterID, jsondata.Response.characterRecords.data[characterID]]);
				
				var characterProgressions = [];
				for (var characterID in jsondata.Response.characterProgressions.data) characterProgressions.push([characterID, jsondata.Response.characterProgressions.data[characterID]]);
				
				var characterCollectibles = [];
				for (var characterID in jsondata.Response.characterProgressions.data) characterCollectibles.push([characterID, jsondata.Response.characterCollectibles.data[characterID]]);
				
				var data = {};
						
				//day1
				try{
					//day1_bool = jsondata.Response.profileRecords.data.records[1558682422].state == 67 ||
					//			jsondata.Response.profileRecords.data.records[97558110].state == 67;
					//day1 = (day1_bool ? "🔶 " : "🔷 ") +
					//		(jsondata.Response.profileRecords.data.records[1558682422].state == 67 ? "КС за 24 " : "") + 
					//		(jsondata.Response.profileRecords.data.records[97558110].state == 67 ? "СС за 24 " : "") + 
					//		(day1_bool ? "" : "не получено");
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}	
				//raid
				/*try{
					rait1_bool = jsondata.Response.profilePresentationNodes.data.nodes[4170729318].objective.progress >= 
									 jsondata.Response.profilePresentationNodes.data.nodes[4170729318].objective.completionValue &&
									 jsondata.Response.profileCollectibles.data.collectibles[3125541834].state%2 != 1 &&
									 jsondata.Response.profileCollectibles.data.collectibles[3125541835].state%2 != 1 &&
									 jsondata.Response.profileCollectibles.data.collectibles[3125541832].state%2 != 1 &&
									 jsondata.Response.profileCollectibles.data.collectibles[3125541833].state%2 != 1;
					rait1 = (rait1_bool ? "🔶 " : "🔷 ") + "Левиафан: " + 
							(jsondata.Response.profilePresentationNodes.data.nodes[4170729318].objective.progress + 
							(jsondata.Response.profileCollectibles.data.collectibles[3125541834].state%2 == 1 ? 0 : 1) + 
							(jsondata.Response.profileCollectibles.data.collectibles[3125541835].state%2 == 1 ? 0 : 1) + 
							(jsondata.Response.profileCollectibles.data.collectibles[3125541832].state%2 == 1 ? 0 : 1) + 
							(jsondata.Response.profileCollectibles.data.collectibles[3125541833].state%2 == 1 ? 0 : 1)) + "/10";
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}*/
				try{
					data.raids.lw={
						state: 
							jsondata.Response.profilePresentationNodes.data.nodes[1500485992].objective.progress >= 
							jsondata.Response.profilePresentationNodes.data.nodes[1500485992].objective.completionValue,
						text:
							"ПЖ: " + 
							jsondata.Response.profilePresentationNodes.data.nodes[1500485992].objective.progress + "/" +
							jsondata.Response.profilePresentationNodes.data.nodes[1500485992].objective.completionValue
					};
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					rait3_bool = jsondata.Response.profilePresentationNodes.data.nodes[4214538151].objective.progress >= 
								 jsondata.Response.profilePresentationNodes.data.nodes[4214538151].objective.completionValue;
					rait3 = (rait3_bool ? "🔶 " : "🔷 ") + "ИП: " + 
							jsondata.Response.profilePresentationNodes.data.nodes[4214538151].objective.progress + "/" +
							jsondata.Response.profilePresentationNodes.data.nodes[4214538151].objective.completionValue;
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					rait4_bool = jsondata.Response.profilePresentationNodes.data.nodes[1891105980].objective.progress >= 
								 jsondata.Response.profilePresentationNodes.data.nodes[1891105980].objective.completionValue;
					rait4 = (rait4_bool ? "🔶 " : "🔷 ") + "КС: " + 
							jsondata.Response.profilePresentationNodes.data.nodes[1891105980].objective.progress + "/" +
							jsondata.Response.profilePresentationNodes.data.nodes[1891105980].objective.completionValue;
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					rait5_bool = jsondata.Response.profilePresentationNodes.data.nodes[1314921749].objective.progress >= 
								 jsondata.Response.profilePresentationNodes.data.nodes[1314921749].objective.completionValue;
					rait5 = (rait5_bool ? "🔶 " : "🔷 ") + "СС: " + 
							jsondata.Response.profilePresentationNodes.data.nodes[1314921749].objective.progress + "/" +
							jsondata.Response.profilePresentationNodes.data.nodes[1314921749].objective.completionValue;
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}

				try{
					poi = ((jsondata.Response.profileRecords.data.records[3420353827].state == 67 ||
							 jsondata.Response.profileRecords.data.records[940998165].state  == 67 ? 1 : 0) + 
							(jsondata.Response.profileRecords.data.records[2602370549].state == 67 ||
							 jsondata.Response.profileRecords.data.records[3861076347].state == 67 ? 1 : 0) + 
							(jsondata.Response.profileRecords.data.records[1742345588].state == 67 ||
							 jsondata.Response.profileRecords.data.records[2923250426].state == 67 ? 1 : 0) + 
							(jsondata.Response.profileRecords.data.records[2195455623].state == 67 ? 1 : 0) + 
							(jsondata.Response.profileRecords.data.records[4060320345].state == 67 ? 1 : 0) + 
							(jsondata.Response.profileRecords.data.records[1558682421].state == 67 ? 1 : 0) + 
							(jsondata.Response.profileRecords.data.records[1120290476].state == 67 ? 1 : 0)) < 7;
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				//gambit
				try{
					gamt1_bool = jsondata.Response.profileRecords.data.records[3798931976].state == 67;
					gamt1_bool = jsondata.Response.profileRecords.data.records[3798931976].objectives[0].progress == 
								 jsondata.Response.profileRecords.data.records[3798931976].objectives[0].completionValue ? 1 : 0;
					gamt1 = (gamt1_bool ? "🔶 " : "🔷 ") +
								"Дреджен: " + jsondata.Response.profileRecords.data.records[3798931976].objectives[0].progress 
										 + "/" + jsondata.Response.profileRecords.data.records[3798931976].objectives[0].completionValue;
					//gamt1 = (gamt1_bool ? "🔶 " : "🔷 ") + 
					//"Дреджен: " + (jsondata.Response.profileRecords.data.records[3798931976].state == 67 ? "1/1" : "0/1");
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					gamt2_bool = jsondata.Response.profileRecords.data.records[1313291220].state == 67;
					gamt2_bool = jsondata.Response.profileRecords.data.records[1313291220].objectives[0].progress == 
								 jsondata.Response.profileRecords.data.records[1313291220].objectives[0].completionValue ? 1 : 0;
					gamt2 = (gamt2_bool ? "🔶 " : "🔷 ") +
								"Вершитель: " + jsondata.Response.profileRecords.data.records[1313291220].objectives[0].progress 
										 + "/" + jsondata.Response.profileRecords.data.records[1313291220].objectives[0].completionValue;
					//gamt2 = (gamt1_bool && gamt2_bool ? "🔶 " : "🔷 ") +
					//"Вершитель: " + (jsondata.Response.profileRecords.data.records[1313291220].state == 67 ? "1/1" : "0/1");
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					gamt3_bool = jsondata.Response.profilePresentationNodes.data.nodes[2600659924].objective.progress >= 
								 jsondata.Response.profilePresentationNodes.data.nodes[2600659924].objective.completionValue;
					gamt3 = (gamt1_bool && gamt2_bool && gamt3_bool ? "🔶 " : "🔷 ") + 
					"Гамбит: " + jsondata.Response.profilePresentationNodes.data.nodes[2600659924].objective.progress + "/" + 
									 jsondata.Response.profilePresentationNodes.data.nodes[2600659924].objective.completionValue;
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				//PVP
				try{
					pvpt1_bool = characterProgressions[0][1].progressions[2000925172].currentProgress >= 2100;
					pvpt1 = (pvpt1_bool ? "🔶 " : "🔷 ") +
					"Ранкед: " + characterProgressions[0][1].progressions[2000925172].currentProgress + "/2100";
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					pvpt2_bool = characterProgressions[0][1].progressions[2000925172].currentProgress >= 3500;
					pvpt2 = (pvpt2_bool ? "🔶 " : "🔷 ") +
					"Ранкед: " + characterProgressions[0][1].progressions[2000925172].currentProgress + "/3500";
					//2679551909
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					pvpt3_bool = characterProgressions[0][1].progressions[2000925172].currentProgress >= 5450;
					pvpt3 = (pvpt3_bool ? "🔶 " : "🔷 ") +
					"Ранкед: " + characterProgressions[0][1].progressions[2000925172].currentProgress + "/5450";
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					pvpt4_bool = jsondata.Response.profileRecords.data.records[3369119720].state == 67 >= 5400;
					pvpt4 = (pvpt4_bool ? "🔶 " : "🔷 ") +
					"Непокоренный: " + (jsondata.Response.profileRecords.data.records[3369119720].state == 67 ? "1" : "0") + "/1";
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					pvpt5_bool = jsondata.Response.profilePresentationNodes.data.nodes[1603584640].objective.progress >= 
								 jsondata.Response.profilePresentationNodes.data.nodes[1603584640].objective.completionValue;
					pvpt5 = (pvpt5_bool ? "🔶 " : "🔷 ") +
					"Горнило: " + jsondata.Response.profilePresentationNodes.data.nodes[1603584640].objective.progress + "/" + 
											 jsondata.Response.profilePresentationNodes.data.nodes[1603584640].objective.completionValue;
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					pvpt6_bool = jsondata.Response.profilePresentationNodes.data.nodes[2418157809].progressValue >= 
								 jsondata.Response.profilePresentationNodes.data.nodes[2418157809].completionValue;
					pvpt6 = (pvpt6_bool ? "🔶 " : "🔷 ") +
					"Flawless: " + jsondata.Response.profilePresentationNodes.data.nodes[2418157809].progressValue + "/" + 
											 jsondata.Response.profilePresentationNodes.data.nodes[2418157809].completionValue;
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				//PVE
				try{
					trit1_bool = jsondata.Response.profileRecords.data.score >= 95000;
					trit1 = (trit1_bool ? "🔶 " : "🔷 ") 
								+ jsondata.Response.profileRecords.data.score + "/95k";
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					trit2_bool = jsondata.Response.profileRecords.data.score >= 105000;
					trit2 = (trit2_bool ? "🔶 " : "🔷 ") 
								+ jsondata.Response.profileRecords.data.score + "/105k";
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					trit3_bool = jsondata.Response.profileRecords.data.score >= 115000;
					trit3 = (trit3_bool ? "🔶 " : "🔷 ") 
								+ jsondata.Response.profileRecords.data.score + "/115k";
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					var maxS6card = jsondata.Response.profilePresentationNodes.data.nodes[272447096].progressValue;
					if (jsondata.Response.profilePresentationNodes.data.nodes[397176300].progressValue > maxS6card) maxS6card = jsondata.Response.profilePresentationNodes.data.nodes[397176300].progressValue;
					if (jsondata.Response.profilePresentationNodes.data.nodes[7761993].progressValue > maxS6card) maxS6card = jsondata.Response.profilePresentationNodes.data.nodes[7761993].progressValue;
					
					trit4_bool = maxS6card == 25;
					trit4 = (trit4_bool ? "🔶 " : "🔷 ") + "Кузница: " + maxS6card + "/25";
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					trit5_bool = jsondata.Response.profilePresentationNodes.data.nodes[286969093].progressValue 
										>= jsondata.Response.profilePresentationNodes.data.nodes[286969093].completionValue;
					trit5 = (trit5_bool ? "🔶 " : "🔷 ") 
								+ "Город Грез: " + jsondata.Response.profilePresentationNodes.data.nodes[286969093].progressValue 
										+ "/" + jsondata.Response.profilePresentationNodes.data.nodes[286969093].completionValue;
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					trit6_bool = jsondata.Response.profilePresentationNodes.data.nodes[1117466231].progressValue 
										>= jsondata.Response.profilePresentationNodes.data.nodes[1117466231].completionValue;
					trit6 = (trit6_bool ? "🔶 " : "🔷 ") 
								+ "Паноптикум: "+ jsondata.Response.profilePresentationNodes.data.nodes[1117466231].progressValue 
										+ "/" + jsondata.Response.profilePresentationNodes.data.nodes[1117466231].completionValue;
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					trit7_bool = jsondata.Response.profilePresentationNodes.data.nodes[4017869588].progressValue 
										>= jsondata.Response.profilePresentationNodes.data.nodes[4017869588].completionValue;
					trit7 = (trit7_bool ? "🔶 " : "🔷 ") 
								+ "Луна: "+ jsondata.Response.profilePresentationNodes.data.nodes[4017869588].progressValue 
										+ "/" + jsondata.Response.profilePresentationNodes.data.nodes[4017869588].completionValue ;
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					trit8_bool = (jsondata.Response.profilePresentationNodes.data.nodes[1916634524].progressValue + ((jsondata.Response.profileRecords.data.records[1721328830].state == 67) ? 0 : 1))
										>= jsondata.Response.profilePresentationNodes.data.nodes[1916634524].completionValue;
					trit8 = (trit8_bool ? "🔶 " : "🔷 ") 
								+ "Налеты: " + jsondata.Response.profilePresentationNodes.data.nodes[1916634524].progressValue
										+ "/" + jsondata.Response.profilePresentationNodes.data.nodes[1916634524].completionValue;
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				
				try{
					solothrone1 = jsondata.Response.profileRecords.data.records[851701008].state == 67;
					solothrone2 = jsondata.Response.profileRecords.data.records[1290451257].state == 67;
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				
				//LORE
				try{
					lort1_bool = jsondata.Response.profileRecords.data.records[2757681677].state == 67 ? 1 : 0;
					lort1_bool = jsondata.Response.profileRecords.data.records[2757681677].objectives[0].progress == 
								 jsondata.Response.profileRecords.data.records[2757681677].objectives[0].completionValue ? 1 : 0;
					lort1 = (lort1_bool ? "🔶 " : "🔷 ") +
								"Путник: " + jsondata.Response.profileRecords.data.records[2757681677].objectives[0].progress 
								 + "/" + jsondata.Response.profileRecords.data.records[2757681677].objectives[0].completionValue;
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					lort2_bool = jsondata.Response.profileRecords.data.records[1693645129].state == 67 ? 1 : 0;
					lort2_bool = jsondata.Response.profileRecords.data.records[1693645129].objectives[0].progress == 
								 jsondata.Response.profileRecords.data.records[1693645129].objectives[0].completionValue ? 1 : 0;
					lort2 = (lort2_bool ? "🔶 " : "🔷 ") +
								"Гроза: " + jsondata.Response.profileRecords.data.records[1693645129].objectives[0].progress 
								 + "/" + jsondata.Response.profileRecords.data.records[1693645129].objectives[0].completionValue;
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					lort3_bool = jsondata.Response.profilePresentationNodes.data.nodes[2209950401].state == 67 ? 1 : 0;
					
					lort3_bool = jsondata.Response.profilePresentationNodes.data.nodes[2209950401].progressValue == 
								 jsondata.Response.profilePresentationNodes.data.nodes[2209950401].completionValue ? 1 : 0;
					lort3 = (lort3_bool ? "🔶 " : "🔷 ") +
								"Посланник: " + jsondata.Response.profilePresentationNodes.data.nodes[2209950401].progressValue 
										 + "/" + jsondata.Response.profilePresentationNodes.data.nodes[2209950401].completionValue;
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					//characterPresentationNodes[0][1].nodes[564676571].progressValue
					lor =   characterPresentationNodes[0][1].nodes[1582800871].progressValue + 
							characterPresentationNodes[0][1].nodes[3062577328].progressValue + 
							characterPresentationNodes[0][1].nodes[1975975321].progressValue;
					lort4_bool = lor >= 350;
					lort4 = (lort4_bool ? "🔶 " : "🔷 ") +
								"Лор: " + lor + "/350";
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					lor =   characterPresentationNodes[0][1].nodes[1582800871].progressValue + 
							characterPresentationNodes[0][1].nodes[3062577328].progressValue + 
							characterPresentationNodes[0][1].nodes[1975975321].progressValue;
					lort5_bool = lor >= 450;
					lort5 = (lort5_bool ? "🔶 " : "🔷 ") +
								"Лор: " + lor + "/450";
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				
				//SEASONAL
				try{
					season8_t1_bool = jsondata.Response.profilePresentationNodes.data.nodes[3303651244].progressValue == 
								 jsondata.Response.profilePresentationNodes.data.nodes[3303651244].completionValue ? 1 : 0;
					season8_t2_bool = jsondata.Response.profilePresentationNodes.data.nodes[2802172173].progressValue == 23 ? 1 : 0;
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				try{
					season9_t1_bool = jsondata.Response.profilePresentationNodes.data.nodes[3303651245].progressValue == 
								 jsondata.Response.profilePresentationNodes.data.nodes[3303651245].completionValue ? 1 : 0;
					season9_t2_bool = jsondata.Response.profilePresentationNodes.data.nodes[959627408].progressValue == 51 ? 1 : 0;
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				
				season10_t2_bool = false;
				try{
					season10_t1_bool = jsondata.Response.profilePresentationNodes.data.nodes[2699827343].progressValue == 
								 jsondata.Response.profilePresentationNodes.data.nodes[2699827343].completionValue ? 1 : 0;
					season10_t1 = (season10_t1_bool ? "🔶 " : "🔷 ") +
									"Всемогущий: " + jsondata.Response.profilePresentationNodes.data.nodes[2699827343].progressValue 
										 + "/" + jsondata.Response.profilePresentationNodes.data.nodes[2699827343].completionValue;
										 
					season10_t2_bool = jsondata.Response.profilePresentationNodes.data.nodes[2998268400].progressValue >= 27 ? 1 : 0;
					season10_t2 = (season10_t2_bool ? "🔶 " : "🔷 ") +
								"Триумфы: " + jsondata.Response.profilePresentationNodes.data.nodes[2998268400].progressValue + "/27";
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				
				try{
					season11_t1_bool = jsondata.Response.profilePresentationNodes.data.nodes[2699827342].progressValue == 
								 jsondata.Response.profilePresentationNodes.data.nodes[2699827342].completionValue ? 1 : 0;
					season11_t2_bool = jsondata.Response.profilePresentationNodes.data.nodes[1852271144].progressValue == 
								 (jsondata.Response.profilePresentationNodes.data.nodes[1852271144].completionValue - 
								  ((jsondata.Response.profileRecords.data.records[1733601101].state == 67) ? 0 : 1) - 
								  ((jsondata.Response.profileRecords.data.records[1615925500].state == 67) ? 0 : 1) - 
								  ((jsondata.Response.profileRecords.data.records[3933956825].state == 67) ? 0 : 1) - 
								  ((jsondata.Response.profileRecords.data.records[2398535304].state == 67) ? 0 : 1)) &&
								 jsondata.Response.profilePresentationNodes.data.nodes[1852271144].completionValue > 0 ? 1 : 0;
						
					season11_t1 = (season11_t1_bool ? "🔶 " : "🔷 ") +
									"Предвестник: " + jsondata.Response.profilePresentationNodes.data.nodes[2699827342].progressValue 
										 + "/" + jsondata.Response.profilePresentationNodes.data.nodes[2699827342].completionValue;		 
					season11_t2 = (season11_t2_bool ? "🔶 " : "🔷 ") +
								"Триумфы: " + jsondata.Response.profilePresentationNodes.data.nodes[1852271144].progressValue + "/" + 
								(jsondata.Response.profilePresentationNodes.data.nodes[1852271144].completionValue - 
								  ((jsondata.Response.profileRecords.data.records[1733601101].state == 67) ? 0 : 1) - 
								  ((jsondata.Response.profileRecords.data.records[1615925500].state == 67) ? 0 : 1) - 
								  ((jsondata.Response.profileRecords.data.records[3933956825].state == 67) ? 0 : 1) - 
								  ((jsondata.Response.profileRecords.data.records[2398535304].state == 67) ? 0 : 1));
				}catch(e){	console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);}
				
				var d_member = channel.guild.members.find(member => member.displayName.startsWith(displayName + " "));
				if (d_member == null) d_member = channel.guild.members.find(member => member.displayName == displayName);
				
				//❌️ 
				if(!doNotMessage){
					var medals_role = d_member.guild.roles.find(role => role.name.includes("медали"));
					var top_position = medals_role.position;
					
					/*var sum = 
						(rait1_bool?1:0) + (rait2_bool?1:0) + (rait3_bool?1:0) + (rait4_bool?1:0) + (rait5_bool?1:0) + (day1_bool?1:0) +
						(lort1_bool?1:0) + (lort2_bool?1:0) + (lort3_bool?1:0) +
						(trit4_bool?1:0) + (trit5_bool?1:0) + (trit6_bool?1:0) + (trit7_bool?1:0) + 
						(lort4_bool?1:0) + (lort5_bool?1:0) + 
						(trit1_bool?1:0) + (trit2_bool?1:0) + (trit3_bool?1:0) + 
						(trit8_bool?1:0) + (pvpt5_bool?1:0) + (gamt3_bool?1:0) + 
						(gamt1_bool?1:0) + (gamt2_bool?1:0) + 
						(season10_t1_bool?1:0) + (season10_t2_bool?1:0) +
						(season11_t1_bool?1:0) + (season11_t2_bool?1:0) +
						(d_member.roles.find(role => role.position == (top_position - 22)) != null ? 3 : 0) + 
						(d_member.roles.find(role => role.position == (top_position - 23)) != null ? 1 : 0) + 
						(d_member.roles.find(role => role.position == (top_position - 24)) != null ? 2 : 0) +  
						(d_member.roles.find(role => role.position == (top_position - 25)) != null ? 3 : 0) +
						(d_member.roles.find(role => role.position == (top_position - 26)) != null ? 2 : 0) + 
						(d_member.roles.find(role => role.position == (top_position - 27)) != null ? 3 : 0) +  
						(d_member.roles.find(role => role.position == (top_position - 28)) != null ? 4 : 0);
					*/
					
					const embed = new Discord.RichEmbed()
						  .setAuthor(displayName + " 💠" + 0 + "💠")
						  .setColor(0x00AE86)
						  .setFooter("ПВП медали выдают гм-ы; ранжирование ролей: 8/17/26 • id: "+d_member.user.id, "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
						  .addField("Рейды",   			data.raids.lw.state + ": " + data.raids.lw.text + "\n" + rait2 + "\n" + rait3 + "\n" + rait4 + "\n" + rait5 + "\n" + day1, true)
						  .addField("Триумфы, лор", 	trit1 + "\n" + trit2 + "\n" + trit3 + "\n" + lort4 + "\n" + lort5, true)
						  .addField("Пункты назначения",lort1 + "\n" + lort2 + "\n" + lort3 + "\n" + trit5 + "\n" + trit6 + "\n" + trit7 , true)
						  .addField("Мастерство", 		trit8 + "\n" + pvpt5 + "\n" + gamt3, true)
						  .addField("Горнило", 			pvpt1 + "\n" + pvpt2 + "\n" + pvpt3 + "\n" + pvpt6, true)
						  .addField("Гамбит",  			gamt1 + "\n" + gamt2, true)
						  .addField("Кузница",			trit4 + "\n" , true)
						  .addField("Сезон 10", 			season10_t1 + "\n" + season10_t2, true)
						  .addField("Сезон 11", 		season11_t1 + "\n" + season11_t2, true)
					embed.addField("Ссылки", "[Raid Report](https://raid.report/pc/"+membershipId+")"
											+" | [Braytech](https://beta.braytech.org/"+membershipType+"/"+membershipId+"/"+characterIds[0]+"/)"
											+" | [D2 Checklist](https://www.d2checklist.com/"+membershipType+"/"+membershipId+"/triumphs)"
											+" | [Destiny Tracker](https://destinytracker.com/destiny-2/profile/steam/"+membershipId+"/overview)")
					channel.send({embed});
					
					
						" [(детальная статистика)](https://chrisfried.github.io/secret-scrublandeux/guardian/"+membershipType+"/"+membershipId+")"
				}
				return;
				setRole(d_member, 
				{
					"titan": titan,
					"hunter": hunter,
					"warlock": warlock
				},
				{
					raid: 		[rait1_bool, rait2_bool, rait3_bool, rait4_bool, rait5_bool],
					day1: 		[day1_bool],
					seals: 		[lort1_bool, lort2_bool, lort3_bool],
					lore: 		[lort4_bool, lort5_bool],
					triumphs: 	[trit1_bool, trit2_bool, trit3_bool],
					places:		[trit4_bool, trit5_bool, trit6_bool, trit7_bool],
					drozch: 	[trit8_bool, pvpt5_bool, gamt3_bool],
					gornilo: 	[pvpt1_bool, pvpt2_bool, pvpt3_bool, pvpt4_bool, pvpt6_bool],
					gambit: 	[gamt1_bool, gamt2_bool],
					season8: 	[season8_t1_bool,  season8_t2_bool ],
					season9: 	[season9_t1_bool,  season9_t2_bool ],
					season10: 	[season10_t1_bool, season10_t2_bool],
					season11: 	[season11_t1_bool, season11_t2_bool],
					extra: 		[solothrone1, solothrone2, poi]
				}, 
				clanid, 
				displayName);
			}
		}
	}
	fulldata.send();
}

function check_role(discord_member, position, dontHasRole, medal, medalNext, title){
	if(dontHasRole){
		if(medal == true) {
			if(medalNext == true){
				//console.log("don't do any with "+title);
			}else{
				discord_member.addRole(discord_member.guild.roles.find(role => role.position == position));
				//console.log("add role "+title);
			}
		}else{
			//console.log("don't do any with "+title);
		}
	}else{
		if(medal == false || medalNext == true) {
			//console.log("remove role "+title);
			discord_member.removeRole(discord_member.guild.roles.find(role => role.position == position));
			
		}
		//else console.log("don't do any with "+title);
	}
}

function setRole(discord_member, charactersLight, medals, clanid, displayName){
	try{
		if(discord_member != null){
			var penumbra = discord_member.guild.roles.find(role => role.name === "Penumbra");
			var antumbra = discord_member.guild.roles.find(role => role.name === "Antumbra");
			var clan_role = discord_member.guild.roles.find(role => role.name.includes("состав"));
			if (clanid == "3055823") {
				if(discord_member.roles.find(role => role.name ===   clan_role.name) == null) discord_member.addRole(clan_role);
				if(discord_member.roles.find(role => role.name === penumbra.name) == null) discord_member.addRole(penumbra);
				if(discord_member.roles.find(role => role.name === antumbra.name) != null) discord_member.removeRole(antumbra);
			}else if (clanid == "3858144"){
				if(discord_member.roles.find(role => role.name ===   clan_role.name) == null) discord_member.addRole(clan_role);
				if(discord_member.roles.find(role => role.name === antumbra.name) == null) discord_member.addRole(antumbra);
				if(discord_member.roles.find(role => role.name === penumbra.name) != null) discord_member.removeRole(penumbra);
			}
			var header_role = discord_member.guild.roles.find(role => role.name.includes("персонажи"));
			var t_role = discord_member.guild.roles.find(role => role.name === "Титан");
			var h_role = discord_member.guild.roles.find(role => role.name === "Охотник");
			var w_role = discord_member.guild.roles.find(role => role.name === "Варлок");
			var medals_role = discord_member.guild.roles.find(role => role.name.includes("медали"));
			var top_position = medals_role.position;
			var footer_role = discord_member.guild.roles.find(role => role.name == "⁣                             ⁣");
			var footer_position = footer_role.position;
			if(discord_member.roles.find(role => role.name === header_role.name) == null) discord_member.addRole(header_role);
			if(discord_member.roles.find(role => role.name === footer_role.name) == null) discord_member.addRole(footer_role);
			if(discord_member.roles.find(role => role.name === medals_role.name) == null) discord_member.addRole(medals_role);
			
			var poi = discord_member.guild.roles.find(role => role.name == "person of interest");
			check_role(discord_member, poi.position, discord_member.roles.find(role => role.position == poi.position) == null, medals.extra[2], false, "poi");
			
			var sum = 
				(medals.raid[0]?1:0) + (medals.raid[1]?1:0) + (medals.raid[2]?1:0) + (medals.raid[3]?1:0) + (medals.raid[4]?1:0) + (medals.day1[0]?1:0) +
				(medals.seals[0]?1:0) + (medals.seals[1]?1:0) + (medals.seals[2]?1:0) +
				(medals.places[0]?1:0) + (medals.places[1]?1:0) + (medals.places[2]?1:0) + (medals.places[3]?1:0) + 
				(medals.lore[0]?1:0) + (medals.lore[1]?1:0) + 
				(medals.triumphs[0]?1:0) + (medals.triumphs[1]?1:0) + (medals.triumphs[2]?1:0) + 
				(medals.drozch[0]?1:0) + (medals.drozch[1]?1:0) + (medals.drozch[2]?1:0) + 
				(medals.gambit[0]?1:0) + (medals.gambit[1]?1:0) + 
				(medals.season10[0]?1:0) + (medals.season10[1]?1:0) +
				(medals.season11[0]?1:0) + (medals.season11[1]?1:0) +
				(discord_member.roles.find(role => role.position == (top_position - 22)) != null ? 3 : 0) + 
				(discord_member.roles.find(role => role.position == (top_position - 23)) != null ? 1 : 0) + 
				(discord_member.roles.find(role => role.position == (top_position - 24)) != null ? 2 : 0) +  
				(discord_member.roles.find(role => role.position == (top_position - 25)) != null ? 3 : 0) +
				(discord_member.roles.find(role => role.position == (top_position - 26)) != null ? 2 : 0) + 
				(discord_member.roles.find(role => role.position == (top_position - 27)) != null ? 3 : 0) +  
				(discord_member.roles.find(role => role.position == (top_position - 28)) != null ? 4 : 0);
			/*
			var given_medals = 
				(medals.raid[0]?1:0) + (medals.raid[1]?1:0) + (medals.raid[2]?1:0) + (medals.raid[3]?1:0) + (medals.raid[4]?1:0) + (medals.day1[0]?1:0) +
				(medals.seals[0]?1:0) + (medals.seals[1]?1:0) + (medals.seals[2]?1:0) +
				(medals.places[0]?1:0) + (medals.places[1]?1:0) + (medals.places[2]?1:0) + (medals.places[3]?1:0) + 
				(medals.lore[0]?1:0) + (medals.lore[1]?1:0) + 
				(medals.triumphs[0]?1:0) + (medals.triumphs[1]?1:0) + (medals.triumphs[2]?1:0) + 
				(medals.drozch[0]?1:0) + (medals.drozch[1]?1:0) + (medals.drozch[3]?1:0) + 
				(medals.gambit[0]?1:0) + (medals.gambit[1]?1:0) + 
				(medals.season9[0]?1:0) + (medals.season9[1]?1:0) +
				(medals.season10[0]?1:0) + (medals.season10[1]?1:0) +
				(discord_member.roles.find(role => role.position == (top_position - 27)) != null ? 1 : 0) + 
				(discord_member.roles.find(role => role.position == (top_position - 28)) != null ? 2 : 0) +  
				(discord_member.roles.find(role => role.position == (top_position - 29)) != null ? 3 : 0) +
				(discord_member.roles.find(role => role.position == (top_position - 30)) != null ? 2 : 0) + 
				(discord_member.roles.find(role => role.position == (top_position - 31)) != null ? 3 : 0) +  
				(discord_member.roles.find(role => role.position == (top_position - 32)) != null ? 4 : 0);
			*/
			//for(ei = 1; ei < (20+1); ei++){
			//	var role = discord_member.guild.roles.find(role => role.position == (top_position - ei));
			//	var count = (role.name.match(/💠/g)||[]).length;
			//	given_medals += (discord_member.roles.find(role => role.position == (top_position - ei)) != null ? count : 0);
			//}
			console.log(displayName+ ' '.repeat((20-displayName.length > 0) ? 20-displayName.length : 0 ), 
						" " + (sum < 10 ? (" " + sum) : sum),
						"r:" + (medals.raid[0]?1:0) + (medals.raid[1]?1:0) + (medals.raid[2]?1:0) + (medals.raid[3]?1:0) + (medals.raid[4]?1:0) + (medals.day1[0]?1:0), 
						"t:" + (medals.triumphs[0]?1:0) + (medals.triumphs[1]?1:0) + (medals.triumphs[2]?1:0) + (medals.lore[0]?1:0) + (medals.lore[1]?1:0), 
						"s:" + (medals.seals[0]?1:0) + (medals.seals[1]?1:0) + (medals.seals[2]?1:0) + (medals.places[1]?1:0) + (medals.places[2]?1:0) + (medals.places[3]?1:0), 
						"d:" + (medals.drozch[0]?1:0) + (medals.drozch[1]?1:0) + (medals.drozch[2]?1:0),
						"p:" + 	(discord_member.roles.find(role => role.position == (top_position - 23)) != null ? "100-0" : 
								(discord_member.roles.find(role => role.position == (top_position - 24)) != null ? "110-0" : 
								(discord_member.roles.find(role => role.position == (top_position - 25)) != null ? "111-0" : 
								(discord_member.roles.find(role => role.position == (top_position - 26)) != null ? "100-1" : 
								(discord_member.roles.find(role => role.position == (top_position - 27)) != null ? "110-1" : 
								(discord_member.roles.find(role => role.position == (top_position - 28)) != null ? "111-1" : "000-0")))))),
						"g:" + (medals.gambit[0]?1:0) + (medals.gambit[1]?1:0), 
						"k:" + (medals.places[0]?1:0), 
						"s8:" + (medals.season8[0]?1:0) + (medals.season8[1]?1:0),
						"s9:" + (medals.season9[0]?1:0) + (medals.season9[1]?1:0),
						"s10:" + (medals.season10[0]?1:0) + (medals.season10[1]?1:0),
						"t:" + (charactersLight.titan === -1 ? ' - ' : numeral(charactersLight.titan).format('0000')) + ' ' + 
						"h:" + (charactersLight.hunter === -1 ? ' - ' : numeral(charactersLight.hunter).format('0000')) + ' ' + 
						"w:" + (charactersLight.warlock === -1 ? ' - ' : numeral(charactersLight.warlock).format('0000'))); 
			if(charactersLight.titan >= minlight   && discord_member.roles.find(role => role.name === t_role.name) == null) discord_member.addRole(t_role);
			if(charactersLight.hunter >= minlight  && discord_member.roles.find(role => role.name === h_role.name) == null) discord_member.addRole(h_role);
			if(charactersLight.warlock >= minlight && discord_member.roles.find(role => role.name === w_role.name) == null) discord_member.addRole(w_role);
			if(charactersLight.titan < minlight   && discord_member.roles.find(role => role.name === t_role.name) != null) discord_member.removeRole(t_role);
			if(charactersLight.hunter < minlight  && discord_member.roles.find(role => role.name === h_role.name) != null) discord_member.removeRole(h_role);
			if(charactersLight.warlock < minlight && discord_member.roles.find(role => role.name === w_role.name) != null) discord_member.removeRole(w_role);
			
			return;
			
			if (discord_member.roles.find(role => role.name.includes("frozen")) != null) return;
			
			var raid_sum     = (medals.raid[0]?1:0) + (medals.raid[1]?1:0) + (medals.raid[2]?1:0) + (medals.raid[3]?1:0) + (medals.raid[4]?1:0);
			var triumphs_sum = (medals.triumphs[0]?1:0) + (medals.triumphs[1]?1:0) + (medals.triumphs[2]?1:0) + (medals.lore[0]?1:0) + (medals.lore[1]?1:0);
			var seals_sum    = (medals.seals[0]?1:0) + (medals.seals[1]?1:0) + (medals.seals[2]?1:0) + (medals.places[1]?1:0) + (medals.places[2]?1:0) + (medals.places[3]?1:0);
			var drozch_sum   = (medals.drozch[0]?1:0) + (medals.drozch[1]?1:0) + (medals.drozch[2]?1:0);
			
			check_role(discord_member, top_position -  1, discord_member.roles.find(role => role.position == (top_position -  1)) == null, raid_sum > 0, raid_sum > 1, "t1");
			check_role(discord_member, top_position -  2, discord_member.roles.find(role => role.position == (top_position -  2)) == null, raid_sum > 1, raid_sum > 2, "t2");
			check_role(discord_member, top_position -  3, discord_member.roles.find(role => role.position == (top_position -  3)) == null, raid_sum > 2, raid_sum > 3, "t3");
			check_role(discord_member, top_position -  4, discord_member.roles.find(role => role.position == (top_position -  4)) == null, raid_sum > 3, raid_sum > 4, "t4");
			check_role(discord_member, top_position -  5, discord_member.roles.find(role => role.position == (top_position -  5)) == null, raid_sum > 4, raid_sum > 5, "t5");
			
			check_role(discord_member, top_position -  7, discord_member.roles.find(role => role.position == (top_position -  7)) == null, medals.day1[0], false, "day 1");
			
			check_role(discord_member, top_position -  8, discord_member.roles.find(role => role.position == (top_position -  8)) == null, triumphs_sum > 0, triumphs_sum > 1, "t1");
			check_role(discord_member, top_position -  9, discord_member.roles.find(role => role.position == (top_position -  9)) == null, triumphs_sum > 1, triumphs_sum > 2, "t2");
			check_role(discord_member, top_position - 10, discord_member.roles.find(role => role.position == (top_position - 10)) == null, triumphs_sum > 2, triumphs_sum > 3, "t3");
			check_role(discord_member, top_position - 11, discord_member.roles.find(role => role.position == (top_position - 11)) == null, triumphs_sum > 3, triumphs_sum > 4, "t4");
			check_role(discord_member, top_position - 12, discord_member.roles.find(role => role.position == (top_position - 12)) == null, triumphs_sum > 4, triumphs_sum > 5, "t5");
			
			check_role(discord_member, top_position - 13, discord_member.roles.find(role => role.position == (top_position - 13)) == null, seals_sum > 0, seals_sum > 1, "t1");
			check_role(discord_member, top_position - 14, discord_member.roles.find(role => role.position == (top_position - 14)) == null, seals_sum > 1, seals_sum > 2, "t2");
			check_role(discord_member, top_position - 15, discord_member.roles.find(role => role.position == (top_position - 15)) == null, seals_sum > 2, seals_sum > 3, "t3");
			check_role(discord_member, top_position - 16, discord_member.roles.find(role => role.position == (top_position - 16)) == null, seals_sum > 3, seals_sum > 4, "t4");
			check_role(discord_member, top_position - 17, discord_member.roles.find(role => role.position == (top_position - 17)) == null, seals_sum > 4, seals_sum > 5, "t5");
			check_role(discord_member, top_position - 18, discord_member.roles.find(role => role.position == (top_position - 18)) == null, seals_sum > 5, seals_sum > 6, "t6");
			
			check_role(discord_member, top_position - 19, discord_member.roles.find(role => role.position == (top_position - 19)) == null, drozch_sum > 0, drozch_sum > 1, "t1");
			check_role(discord_member, top_position - 20, discord_member.roles.find(role => role.position == (top_position - 20)) == null, drozch_sum > 1, drozch_sum > 2, "t2");
			check_role(discord_member, top_position - 21, discord_member.roles.find(role => role.position == (top_position - 21)) == null, drozch_sum > 2, drozch_sum > 3, "t3");
			
			check_role(discord_member, top_position - 29, discord_member.roles.find(role => role.position == (top_position - 29)) == null, medals.extra[0], medals.extra[1], "solothrone1");
			check_role(discord_member, top_position - 30, discord_member.roles.find(role => role.position == (top_position - 30)) == null, medals.extra[1], false, "solothrone2");
			
			check_role(discord_member, top_position - 31, discord_member.roles.find(role => role.position == (top_position - 31)) == null, medals.gambit[0], medals.gambit[1], "дреджен");
			check_role(discord_member, top_position - 32, discord_member.roles.find(role => role.position == (top_position - 32)) == null, medals.gambit[1], false, "вершитель");
			
			check_role(discord_member, top_position - 33, discord_member.roles.find(role => role.position == (top_position - 33)) == null, medals.places[0], false, "кузнец");
			
			check_role(discord_member, top_position - 34, discord_member.roles.find(role => role.position == (top_position - 34)) == null, medals.season10[0] || medals.season10[1],  medals.season10[0] && medals.season10[1], "10");
			check_role(discord_member, top_position - 35, discord_member.roles.find(role => role.position == (top_position - 35)) == null, medals.season10[0] && medals.season10[1], false, "10+");
			
			check_role(discord_member, top_position - 36, discord_member.roles.find(role => role.position == (top_position - 36)) == null, medals.season11[0] || medals.season11[1],  medals.season11[0] && medals.season11[1], "11");
			check_role(discord_member, top_position - 37, discord_member.roles.find(role => role.position == (top_position - 37)) == null, medals.season11[0] && medals.season11[1], false, "11+");
			
			//OLD
			check_role(discord_member, footer_position - 1, discord_member.roles.find(role => role.position == (footer_position - 1)) == null, medals.season8[0] || medals.season8[1], medals.season8[0] && medals.season8[1], "8");
			check_role(discord_member, footer_position - 2, discord_member.roles.find(role => role.position == (footer_position - 2)) == null, medals.season8[0] && medals.season8[1], false, "8+");
			
			check_role(discord_member, footer_position - 3, discord_member.roles.find(role => role.position == (footer_position - 1)) == null, medals.season9[0] || medals.season9[1], medals.season9[0] && medals.season9[1], "9");
			check_role(discord_member, footer_position - 4, discord_member.roles.find(role => role.position == (footer_position - 2)) == null, medals.season9[0] && medals.season9[1], false, "9+");
			
			/*
			var shift = 23;
			for(ei = 1; ei < 13; ei++){
				if(sum - given_medals < 0){
					if(discord_member.roles.find(role => role.position == (top_position - shift - ei)) != null) discord_member.removeRole(discord_member.guild.roles.find(role => role.position == (top_position - shift - ei)));
				}else{
					if(sum - given_medals == ei){
						if(discord_member.roles.find(role => role.position == (top_position - shift - ei)) == null) discord_member.addRole(discord_member.guild.roles.find(role => role.position == (top_position - shift - ei)));
					}else{
						if(discord_member.roles.find(role => role.position == (top_position - shift - ei)) != null) discord_member.removeRole(discord_member.guild.roles.find(role => role.position == (top_position - shift - ei)));
					}
				}
			}*/
			
			if (discord_member.roles.find(role => role.name.includes("Атлон")) != null ||
				discord_member.roles.find(role => role.name.includes("Света")) != null ||
				discord_member.roles.find(role => role.name.includes("Guardian is down")) != null ||
				discord_member.roles.find(role => role.name.includes("Восставший")) != null ||
				discord_member.roles.find(role => role.name.includes("Путник")) != null) return;
			if(sum < 8){
				if(discord_member.roles.find(role => role.name == "Страж") == null) {
					discord_member.addRole(discord_member.guild.roles.find(role => role.name == "Страж"));
					if(discord_member.roles.find(role => role.name == "Опытный Страж") != null)
						discord_member.removeRole(discord_member.guild.roles.find(role => role.name == "Опытный Страж"));
					if(discord_member.roles.find(role => role.name == "Страж ветеран") != null)
						discord_member.removeRole(discord_member.guild.roles.find(role => role.name == "Страж ветеран"));
					if(discord_member.roles.find(role => role.name == "Страж легенда") != null)
						discord_member.removeRole(discord_member.guild.roles.find(role => role.name == "Страж легенда"));
				}
			}else if(sum < 17){
				if(discord_member.roles.find(role => role.name == "Опытный Страж") == null) {
					discord_member.addRole(discord_member.guild.roles.find(role => role.name == "Опытный Страж"));
					if(discord_member.roles.find(role => role.name == "Страж") != null)
						discord_member.removeRole(discord_member.guild.roles.find(role => role.name == "Страж"));
					if(discord_member.roles.find(role => role.name == "Страж ветеран") != null)
						discord_member.removeRole(discord_member.guild.roles.find(role => role.name == "Страж ветеран"));
					if(discord_member.roles.find(role => role.name == "Страж легенда") != null)
						discord_member.removeRole(discord_member.guild.roles.find(role => role.name == "Страж легенда"));
				}
			}else if(sum < 26){
				if(discord_member.roles.find(role => role.name == "Страж ветеран") == null) {
					discord_member.addRole(discord_member.guild.roles.find(role => role.name == "Страж ветеран"));
					if(discord_member.roles.find(role => role.name == "Страж") != null)
						discord_member.removeRole(discord_member.guild.roles.find(role => role.name == "Страж"));
					if(discord_member.roles.find(role => role.name == "Опытный Страж") != null)
						discord_member.removeRole(discord_member.guild.roles.find(role => role.name == "Опытный Страж"));
					if(discord_member.roles.find(role => role.name == "Страж легенда") != null)
						discord_member.removeRole(discord_member.guild.roles.find(role => role.name == "Страж легенда"));
				}
			}else{
				if(discord_member.roles.find(role => role.name == "Страж легенда") == null) {
					discord_member.addRole(discord_member.guild.roles.find(role => role.name == "Страж легенда"));
					if(discord_member.roles.find(role => role.name == "Страж") != null)
						discord_member.removeRole(discord_member.guild.roles.find(role => role.name == "Страж"));
					if(discord_member.roles.find(role => role.name == "Опытный Страж") != null)
						discord_member.removeRole(discord_member.guild.roles.find(role => role.name == "Опытный Страж"));
					if(discord_member.roles.find(role => role.name == "Страж ветеран") != null)
						discord_member.removeRole(discord_member.guild.roles.find(role => role.name == "Страж ветеран"));
				}
			}
		}else{
			console.log(displayName + ' '.repeat(40-displayName.length), "DISCORD MEMBER NOT FOUND");
		}
	}catch(e){
		console.log(displayName + ' Ошибка ' + e.name + ":" + e.message + "\n<@149245139389251584> \n" + e.stack);
	}
}
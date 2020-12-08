var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Discord = require("discord.js");
const keys = require('./keys');
var d2apiKey = keys.d2apiKey();

var jimp = require('jimp');
const fs = require('fs');

var toload = 0;
var loaded = 0;
var messageSent = false;

function addText(font_file, channel, x, y, mainImage, text_to_print, text, export_string) {
	toload++;
	
	jimp.loadFont(font_file)
		.then(function (font) {
			mainImage.print(font, x, y, text_to_print)
		})
		.then(function (){
			loaded++;
			if (toload == loaded) mainImage.write(export_string);
		})
		.then(function (){
			if (toload == loaded) {
				if(messageSent == false){
					messageSent = true;
					setTimeout(function(){
						channel.send(text, {files: [export_string]});
					}, 500);
				}
			}
		})
}
function addStat(filename, channel, x, y, mainImage, width, height, text, export_string) {
	toload++;
	
	var whiteImage; 
	jimp.read(filename)
		.then(function (image) {
			whiteImage = image;
			whiteImage.resize(width, height);
		})
		.then(function (image) {
			mainImage.composite( whiteImage, x, y )
		})
		.then(function (){
			loaded++;
			if (toload == loaded) mainImage.write(export_string);
		})
		.then(function (){
			if (toload == loaded) {
				if(messageSent == false){
					messageSent = true;
					setTimeout(function(){
						channel.send(text, {files: [export_string]});
					}, 500);
				}
			}
		})
}

exports.triumphs = function(message, isImg) {
	var bot_msg = message;
	triumphs = [];	
	
	var loadedImage;
	var max = 128760;
	
	if(isImg != null){
		var fileName = 'bg.png';
		jimp.read(fileName)
			.then(function (image) {
				loadedImage = image;
			})
			
		fs.readFile("maxtriumphs.txt", 'utf8', function(err, data) {
			if (err) throw err;
			max = data;
		});
	}
	
	function request_clan_t(callback) {
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
							  .setAuthor("Triumphs score [top 15]:")
							  .setColor(0x00AE86)
							  .setDescription("loading...")
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
	
	function member_request_t(member, i, triumphs, callback, size){
		var membershipType = member.destinyUserInfo.membershipType;
		var membershipId = member.destinyUserInfo.membershipId;
		var displayName = member.destinyUserInfo.displayName;
		
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "https://www.bungie.net/Platform/Destiny2/"+membershipType+"/Profile/"+membershipId+"/?components=Records", true);
		xhr.timeout = 5000;
		xhr.setRequestHeader("X-API-Key", d2apiKey);
		xhr.onreadystatechange = function(){
			if(this.readyState === 4 && this.status === 200){
				var json = JSON.parse(this.responseText);
				if(typeof(json.Response.profileRecords.data) == 'undefined'){
					console.log('name: '+displayName+' id: '+membershipId+': undefined');									
				}else{
					triumphs[displayName] = json.Response.profileRecords.data.score;
				}
				counter++;
				console.log('counter: '+counter+' size: '+size+' name: '+displayName);
				if (counter == size) callback(triumphs, size, counter == size);
			}else if (this.readyState === 4 && this.status != 200){
				counter++;
				console.log('name: '+displayName+' id: '+membershipId+' - access closed');
				if (counter == size) callback(triumphs, size, counter == size);
			}
		}
		xhr.send();
	}
	
	var members;
	function handle_members_t(callback){
		request_clan_t(function handleMembersList_t(members, size) {
			var triumphs = []
			
			var completed = 0;
			var i = 0;
			var check = function(){
				if(i == size){
					
				}
				else {
					member_request_t(members[i], i, triumphs, callback, size);
					i++;
					setTimeout(check, 150); 
				}
			}

			check();
		})
	}
							
	var counter = 0;
	handle_members_t(
		function reportData_t(triumphs, size, isLast) {
			var tuples = [];
			for (var key in triumphs) tuples.push([key, triumphs[key]]);

			
			console.log("tuples size: " + tuples.length);
			tuples.sort(function(a, b) {
				return a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0
			});
			
			//console.log(tuples);
			
			var text = "";
			
			for (var i = 0; i < tuples.length && i < 15; i++) {
				text+= "`[" + tuples[i][1] + "]` " + tuples[i][0] + "\n";
			}		
			
			messageSent = false;
			if(isImg == null){
				const embed = new Discord.RichEmbed()
				  .setAuthor("Triumphs score [top 15]:")
				  .setColor(0x00AE86)
				  .setDescription(text)
				  .setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
				  .setTimestamp()
				bot_msg.edit({embed});
			}else{
				var min = tuples[14][1] - 1000;
				var size = max-min;
				var channel = bot_msg.channel;
				bot_msg.delete();
				
				for (var i = 0; i < tuples.length && i < 15; i++) {
					//addStat('black.png', channel, 
					//		185, 20 + (12+5)*i, 
					//		loadedImage, 170, 12,
					//		"", "export.png");
					addText('fonts/calibri_light_22.fnt', 
							channel, 
							10, 20 + 17*i-5, 
							loadedImage, tuples[i][0], 
							"", "export.png");
					addText('fonts/calibri_light_22.fnt', 
							channel, 
							120, 20 + (17)*i-5, 
							loadedImage, tuples[i][1], 
							"", "export.png");
					addStat('white.png', channel, 
							185, 20 + (12+5)*i, 
							loadedImage, ((tuples[i][1]-min)*170)/size, 12,
							"", "export.png");
				}
			}
		}
	);
}				
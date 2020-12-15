var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Discord = require("discord.js");
const keys = require('./keys');

var d2apiKey = keys.d2apiKey();
var fs = require('fs');
//var http = require('http');
var jimp = require('jimp');
var request = require('request');
var AdmZip = require('adm-zip');

var tokenObject = null;
var toload = 0;
var loaded = 0;

var messageSent = false;

function create_reset_img(reset, channel){
	toload = 0;
	loaded = 0;
	console.log("    "+"image");

	var fileName = 'reset.png';
	var loadedImage;

	var v_m = 45, v_m_2 = 75, height = 75, v_delta=115, v_r_delta=90;
	var h_m = 105, width = 420;

	jimp.read(fileName)
		.then(function (image) {
			loadedImage = image;
		})
		.then(function () {
			if(typeof(reset.nf1) != 'undefined') return jimp.read(reset.nf1.imag);
			else return '';
		})
		.then(function (newimg) {
			if(newimg != '') loadedImage.composite( newimg, 840, 95 )
			if(typeof(reset.nf1) != 'undefined') return jimp.read(reset.nf3.imag);
			else return '';
		})
		.then(function (newimg) {
			if(newimg != '') loadedImage.composite( newimg, 840, 95+250 )
			if(typeof(reset.nf1) != 'undefined') return jimp.read(reset.nf2.imag.replace(".png", "_a.png"));
			else return '';
		})
		.then(function (newimg) {
			if(newimg != '') loadedImage.composite( newimg, 840, 95+125 )
			return jimp.read('reset.png');
		})
		.then(function (newimg) {
			loadedImage.composite( newimg, 0, 0 )
			return jimp.read(reset.dc.mission_img);
		})
		.then(function (newimg) {
			loadedImage.composite( newimg, 420, 220 )
			return jimp.read(reset.flashpoint_img);
		})
		.then(function (newimg) {
			loadedImage.composite( newimg, 0, 0 )
			// overlay
			return jimp.read('reset_overlay.png');
		})
		.then(function (newimg) {
			loadedImage.composite( newimg, 0, 0 )
			return jimp.read(reset.protocol.weapon == 'SG' || reset.protocol.weapon == 'all' ? 'reset/sg.jpg' : 'reset/sg.png');
		})
		.then(function (newimg) {
			loadedImage.composite( newimg.resize(50, jimp.AUTO), 1*width+h_m, 7*height+v_m_2+5 )
			return jimp.read(reset.protocol.weapon == 'SMG' || reset.protocol.weapon == 'all' ? 'reset/smg.jpg' : 'reset/smg.png');
		})
		.then(function (newimg) {
			loadedImage.composite( newimg.resize(50, jimp.AUTO), 1*width+h_m+60, 7*height+v_m_2+5 )
			return jimp.read(reset.protocol.weapon == 'SR' || reset.protocol.weapon == 'all' ? 'reset/sr.jpg' : 'reset/sr.png');
		})
		.then(function (newimg) {
			loadedImage.composite( newimg.resize(50, jimp.AUTO), 1*width+h_m+120, 7*height+v_m_2+5 )
			return jimp.read('reset/missing_icon_d2.png');
		})
		.then(function (newimg) {
			loadedImage.composite( newimg.resize(50, jimp.AUTO), 2*width+h_m+0, 7*height+v_m_2+5 )
			loadedImage.composite( newimg.resize(50, jimp.AUTO), 2*width+h_m+60, 7*height+v_m_2+5 )
			loadedImage.composite( newimg.resize(50, jimp.AUTO), 2*width+h_m+120, 7*height+v_m_2+5 )
			loadedImage.composite( newimg.resize(50, jimp.AUTO), 2*width+h_m+180, 7*height+v_m_2+5 )
			loadedImage.composite( newimg.resize(50, jimp.AUTO), 2*width+h_m+240, 7*height+v_m_2+5 )

			return jimp.loadFont('fonts/AvanteTitler28.fnt');
		})
		.then(function (font) { //AvanteTitler28
			loadedImage
					   .print(font, 0*width+h_m, 0*height+v_m, "ГОРЯЧАЯ ТОЧКА")
					   .print(font, 1*width+h_m, 0*height+v_m, "ГОРНИЛО")
					   .print(font, 2*width+h_m, 0*height+v_m, "ГЕРОИЧЕСКИЕ МИССИИ")

					   .print(font, 0*width+h_m, 2*height+v_m+0*v_r_delta, reset.lw.name)
					   .print(font, 0*width+h_m, 2*height+v_m+1*v_r_delta, reset.sotp.name)
					   .print(font, 0*width+h_m, 2*height+v_m+2*v_r_delta, reset.cos.name)
					   .print(font, 0*width+h_m, 2*height+v_m+3*v_r_delta, reset.lv.name)

					   .print(font, 1*width+h_m, 2*height+v_m+0*v_delta, "Город грез")
					   .print(font, 1*width+h_m, 2*height+v_m+1*v_delta, "Миссия")
					   .print(font, 1*width+h_m, 2*height+v_m+2*v_delta, "Высшее испытание")

					   .print(font, 1*width+h_m, 7*height+v_m, "Эскалационный протокол")
					   .print(font, 2*width+h_m, 7*height+v_m, "Суд: ?????")

		    if(typeof(reset.nf1) != 'undefined') loadedImage.print(font, 2*width+h_m, 2*height+v_m+0*v_delta, reset.nf1.name)
		    if(typeof(reset.nf2) != 'undefined') loadedImage.print(font, 2*width+h_m, 2*height+v_m+1*v_delta, reset.nf2.name)
		    if(typeof(reset.nf3) != 'undefined') loadedImage.print(font, 2*width+h_m, 2*height+v_m+2*v_delta, reset.nf3.name)
		})
		.then(function () {
			return jimp.loadFont('fonts/AvanteTitler26.fnt');
		})
		.then(function (font) { //AvanteTitler26
			loadedImage
					   .print(font, 0*width+h_m, 0*height+v_m_2, reset.flashpoint)
					   .print(font, 1*width+h_m, 0*height+v_m_2, reset.pvp)
					   .print(font, 2*width+h_m, 0*height+v_m_2, reset.heroic_mod)

					   .print(font, 1*width+h_m, 2*height+v_m_2+0*v_delta, (reset.dc.week==1 ? "Первая" : (reset.dc.week==2 ? "Вторая" : "Третья")) + " неделя проклятия")
					   .print(font, 1*width+h_m, 2*height+v_m_2+1*v_delta, reset.dc.mission)
					   .print(font, 1*width+h_m, 2*height+v_m_2+2*v_delta, reset.dc.ascendent)
		})
		.then(function () {
			return jimp.loadFont('fonts/AvanteTitler23.fnt');
		})
		.then(function (font) { //AvanteTitler23
			if(typeof(reset.nf1) != 'undefined') loadedImage.print(font, 2*width+h_m, 2*height+v_m_2+0*v_delta, reset.nf1.drop)
			if(typeof(reset.nf2) != 'undefined') loadedImage.print(font, 2*width+h_m, 2*height+v_m_2+1*v_delta, reset.nf2.drop)
			if(typeof(reset.nf3) != 'undefined') loadedImage.print(font, 2*width+h_m, 2*height+v_m_2+2*v_delta, reset.nf3.drop)
		})
		.then(function () {
			return jimp.loadFont('fonts/calibri_light_24.fnt');
		})
		.then(function (font) { //calibri_light_24
			loadedImage
					   .print(font, 0*width+h_m, 2*height+v_m+0*v_r_delta+5+20, reset.lw.todo.split('\n')[0])
					   .print(font, 0*width+h_m, 2*height+v_m+0*v_r_delta+5+40, reset.lw.todo.split('\n')[1])
					   .print(font, 0*width+h_m, 2*height+v_m+1*v_r_delta+5+20, reset.sotp.todo.split('\n')[0])
					   .print(font, 0*width+h_m, 2*height+v_m+1*v_r_delta+5+40, reset.sotp.todo.split('\n')[1])
					   .print(font, 0*width+h_m, 2*height+v_m+2*v_r_delta+5+20, reset.cos.todo.split('\n')[0])
					   .print(font, 0*width+h_m, 2*height+v_m+2*v_r_delta+5+40, reset.cos.todo.split('\n')[1])
					   .print(font, 0*width+h_m, 2*height+v_m+3*v_r_delta+5+20, reset.lv.todo.split('\n')[0])
					   .print(font, 0*width+h_m, 2*height+v_m+3*v_r_delta+5+40, reset.lv.todo.split('\n')[1])

					   .print(font, 0*width+h_m, 2*height+v_m+4*v_r_delta+5, reset.leviathan_prestige.modifier)
					   .print(font, 0*width+h_m, 2*height+v_m+4*v_r_delta+5+20, reset.leviathan_prestige.armsmaster.split('\n')[0])
					   .print(font, 0*width+h_m, 2*height+v_m+4*v_r_delta+5+40, reset.leviathan_prestige.armsmaster.split('\n')[1])
					   .print(font, 0*width+h_m, 2*height+v_m+4*v_r_delta+5+60, reset.leviathan_prestige.armsmaster.split('\n')[2])

					   .print(font, 1*width+h_m, 2*height+v_m_2+2*v_delta+5+20, reset.dc.place)
		})
		.then(function () {
			return jimp.loadFont('fonts/calibri_light_22.fnt');
		})
		.then(function (font) { //calibri_light_22
			if(typeof(reset.nf1) != 'undefined') loadedImage.print(font, 2*width+h_m, 2*height+v_m_2+0*v_delta+20, reset.nf1.type.split('-')[0])
			if(typeof(reset.nf2) != 'undefined') loadedImage.print(font, 2*width+h_m, 2*height+v_m_2+1*v_delta+20, reset.nf2.type.split('-')[0])
			if(typeof(reset.nf3) != 'undefined') loadedImage.print(font, 2*width+h_m, 2*height+v_m_2+2*v_delta+20, reset.nf3.type.split('-')[0])
			loadedImage.write('reset_export.png');
		})
		.then(function () {
			return jimp.loadFont('fonts/calibri_light_24.fnt');
		})
		.then(function (font) {
			var i = 0;
			console.log("    "+"everis");
			reset.everis.forEach(function(saleItem){
				var margin = 0;
				if(saleItem.cost < 100) margin = 10;
				else if(saleItem.cost < 1000) margin = 5;
				if(i < 8){
					loadedImage.print(font, margin+15+250+i*100, 75*10+20, saleItem.cost);
					saveImageToDisk(saleItem.icon,  saleItem.hash, channel,
							250+i*100, 75*10-50,
							loadedImage, 70, "", "reset_export.png");
				}else{
					loadedImage.print(font, margin+15+i*100-500, 75*10+120, saleItem.cost);
					saveImageToDisk(saleItem.icon,  saleItem.hash, channel,
							i*100-500, 75*10+50,
							loadedImage, 70, "", "reset_export.png");
				};
				i++;
			});
		})
		.then(function () {
			//channel.send("", {files: ["reset_export.png"]});
		})
		.catch(function (err) {
			console.error(err);
		});
};

function saveImageToDisk(url, itemHash, channel, x, y, mainImage, resize, text, export_string) {
	var uri = 'https://www.bungie.net'+url;
	var filename = 'img/'+itemHash+'.png';
	var images = {};

	toload++;
	request.head(uri, function(err, res, body){
		request(uri).pipe(fs.createWriteStream(filename))
			.on('close', function(){
				//console.log("    "+'done '+url+' -> '+filename);
				jimp.read(filename)
					.then(function (image) {
						images[itemHash] = image;
						if(resize != 0) images[itemHash].resize(resize, jimp.AUTO);
					})
					.then(function (image) {
						mainImage.composite( images[itemHash], x, y )
					})
					.then(function (){
						loaded++;
						if (toload == loaded) mainImage.write(export_string);
					})
					.then(function (){
						if (toload == loaded) {
							if(messageSent == false){
								channel.send(text, {files: [export_string]});
								messageSent = true;
							}
						}
					})
			});
	});
}

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
					channel.send(text, {files: [export_string]});
					messageSent = true;
				}
			}
		})
}
function addStat(channel, x, y, mainImage, width, height, text, export_string) {
	toload++;
	
	var filename = 'white.png';
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
					channel.send(text, {files: [export_string]});
					messageSent = true;
				}
			}
		})
}
function translate(text){
	var dictionary = {
		"FLASHPOINT: EDZ" 			: "Емз",
		"FLASHPOINT: TITAN" 		: "Титан",
		"FLASHPOINT: IO" 			: "Ио",
		"FLASHPOINT: NESSUS" 		: "Несс",
		"FLASHPOINT: MERCURY" 		: "Меркурий",
		"FLASHPOINT: MARS" 			: "Марс",
		"FLASHPOINT: TANGLED SHORE" : "Спутанные берега",
		"FLASHPOINT: MOON" 			: "Луна",

		"Kinetic"					: "1",
		"Energy" 					: "2",
		"Power" 					: "3",

		"Anything" 				 	: "Любое",
		"Auto Rifle" 				: "Автомат",
		"Scout Rifle" 				: "Винтовка разведчика",
		"Pulse Rifle" 				: "Импульсная винтовка",
		"Hand Cannon" 				: "Револьвер",
		"Submachine Gun" 			: "Пистолет-пулемет",
		"Sidearm" 					: "Пистолет",
		"Bow" 						: "Лук",
		"Shotgun"	 				: "Дробовик",
		"Grenade Launcher"			: "Гранатомет",
		"Fusion Rifle" 				: "Плазменная винтовка",
		"Sniper Rifle" 				: "Снайперская винтовка",
		"Sword"					 	: "Меч",
		"Rocket Launcher" 		 	: "Ракетная установка",
		"Linear Fusion Rifle"	 	: "Линейно-плазменная винтовка",
		"Machine Gun"			 	: "Пулемет",

		"Prism" 					: "Призма",
		"Prestige"					: "Престиж",
		"Gladiator"					: "Гладиатор",
		"Arsenal"					: "Арсенал",
		"Armsmaster"				: "Оружие",

		"The Gauntlet Challenge" 			: "Турнир",
		"The Pleasure Gardens Challenge" 	: "Сады удовольствий",
		"The Royal Pools Challenge" 		: "Королевские купальни",
		"Throne Challenge" 					: "Трон",
	};

	var ru = text;
	Object.keys(dictionary).forEach(function (key){
		ru = ru.replace(key, dictionary[key]);
	})
	Object.keys(dictionary).forEach(function (key){
		ru = ru.replace(key, dictionary[key]);
	})

	return ru;
}

exports.auth = async function auth(boss){
/*	Ключ API							f4e47f14143e418bb0f76a700ee6147c
	OAuth client_id						26315
	OAuth client_secret					zl4fzwG4uBgWCnE6jOkRL1R-SshXjPpt2ZGwAvxd79M
	redirect							https://www.bungie.net/ru/ClanV2/Chat?groupId=3055823
*/
	tokenObject = JSON.parse(fs.readFileSync('lasttoken.json'));

	var body = "grant_type=refresh_token&refresh_token="+tokenObject["refresh_token"]+"&client_id=26315&client_secret=zl4fzwG4uBgWCnE6jOkRL1R-SshXjPpt2ZGwAvxd79M";
	var authpost = new XMLHttpRequest();
	authpost.open("POST", "https://www.bungie.net/Platform/App/OAuth/Token/", true);
	authpost.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	authpost.onreadystatechange = function(){
		if(this.readyState === 4 && this.status === 200){
			var json = JSON.parse(this.responseText);
			if(typeof(json.access_token) != 'undefined'){
				fs.writeFile('lasttoken.json', JSON.stringify(json), function(err, result) {
					if(err) console.log('error', err);
			    });
			}
			console.log("REFRESHED!");
			tokenObject = json;
		}else{
			console.log("    "+this.readyState + ' ' + this.status + ' ' + this.responseText);
		}
	}
	authpost.send(body);
}

exports.newToken = function(message, code){
	//https://www.bungie.net/ru/OAuth/Authorize?response_type=code&client_id=26315&state=12345
	var body = "grant_type=authorization_code&code="+code+"&client_id=26315&client_secret=zl4fzwG4uBgWCnE6jOkRL1R-SshXjPpt2ZGwAvxd79M";
	var authpost = new XMLHttpRequest();
	authpost.open("POST", "https://www.bungie.net/Platform/App/OAuth/Token/", true);
	authpost.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	authpost.onreadystatechange = function(){
		if(this.readyState === 4 && this.status === 200){
			var json = JSON.parse(this.responseText);
			if(typeof(json.access_token) != 'undefined'){
				fs.writeFile('lasttoken.json', JSON.stringify(json), function(err, result) {
					if(err) console.log('error', err);
			    });
			}
			console.log("NEW TOKEN!");
			tokenObject = json;
		}else{
			//console.log("    "+this.readyState + ' ' + this.status + ' ' + this.responseText);
		}
	}
	authpost.send(body);
}

exports.xur = function (channel){
	messageSent = false;
	var loadedImage;
	toload = 0;
	loaded = 0;
	let rawdata = fs.readFileSync('destiny2.json');
	let manifest = JSON.parse(rawdata);

	var endpoint = "https://www.bungie.net/Platform/Destiny2/3/Profile/4611686018484533589/Character/2305843009409595202/Vendors/?components=400,402,300,301,302,304,305,306,307,308,600";

	var fileName = 'xur.png';
	jimp.read(fileName)
		.then(function (image) {
			loadedImage = image;
		})

	var second = new XMLHttpRequest();
	second.open("GET", endpoint, true);
	second.setRequestHeader("Authorization", "Bearer "+tokenObject["access_token"]);
	second.setRequestHeader("X-API-Key", d2apiKey);
	second.onreadystatechange = async function(){
		if(this.readyState === 4 && this.status === 200){
			var json2 = JSON.parse(this.responseText);

			if(typeof(json2.Response) == 'undefined'){
				if(channel != null) channel.send('ШТО.');
				else boss.send('ШТО.');
			}else{
				var vendors 		= json2.Response.vendors.data;
				var sales   		= json2.Response.sales.data;
				var itemComponents 	= json2.Response.itemComponents;

				Object.keys(sales).forEach(function (saleHash){
					if(saleHash == 2190858386){
						var i = 0;
						//coords =   [{x: 10,  y: 10},
						//			{x: 110, y: 10},
						//			{x: 210, y: 10},
						//			{x: 310, y: 10}];
						coords =   [{x: 280, y: 126},
									{x:  10, y:  10},
									{x:  10, y: 126},
									{x: 280, y:  10}];

						var saleItems = sales[saleHash].saleItems;

						Object.keys(saleItems).forEach(function (saleItemsHash){
							if(saleItems[saleItemsHash].costs.length > 0){
								console.log("    "+"==========");
								console.log("    "+
										manifest.InventoryItem[saleItems[saleItemsHash].itemHash].displayProperties.name +
										" " + saleItems[saleItemsHash].itemHash);

								var col = 0;
								var stats = itemComponents[2190858386].stats.data[saleItems[saleItemsHash].vendorItemIndex].stats;
								
								if(stats[2996146975] != null){
									var armor_stat = [];
									armor_stat[0] = stats[2996146975].value; //mobility
									armor_stat[1] = stats[392767087].value;  //resilience
									armor_stat[2] = stats[1943323491].value; //recovery
									armor_stat[3] = stats[1735777505].value; //discipline
									armor_stat[4] = stats[144602215].value;  //intellect
									armor_stat[5] = stats[4244567218].value; //strength
									
									var left = 130;
									var height = 12;
									var margin = 5;
									
									for(var k = 0; k < 6; k++){
										addStat(channel, 
												coords[i].x + left, coords[i].y + (height+margin)*k, 
												loadedImage, 4*armor_stat[k], height,
												"Зур приехал", "export.png");
										addText('fonts/calibri_light_22.fnt', 
												channel, 
												coords[i].x + left-24, coords[i].y + (height+margin)*k-5, 
												loadedImage, (armor_stat[k] < 10 ? "  "+armor_stat[k] : armor_stat[k]), 
												"Зур приехал", "export.png");
									}
									addText('fonts/calibri_light_22.fnt', 
											channel, 
											coords[i].x + 235, coords[i].y + (height+margin)*5-5, 
											loadedImage, armor_stat.reduce((a, b) => a + b, 0), 
											"Зур приехал", "export.png");
									/*
									addStat(channel, coords[i].x + left, coords[i].y + (height+margin)*0, loadedImage, 4*mobility,   "Зур приехал", "export.png");
									addStat(channel, coords[i].x + left, coords[i].y + (height+margin)*1, loadedImage, 4*resilience, "Зур приехал", "export.png");
									addStat(channel, coords[i].x + left, coords[i].y + (height+margin)*2, loadedImage, 4*recovery,   "Зур приехал", "export.png");
									addStat(channel, coords[i].x + left, coords[i].y + (height+margin)*3, loadedImage, 4*discipline, "Зур приехал", "export.png");
									addStat(channel, coords[i].x + left, coords[i].y + (height+margin)*4, loadedImage, 4*intellect,  "Зур приехал", "export.png");
									addStat(channel, coords[i].x + left, coords[i].y + (height+margin)*5, loadedImage, 4*strength,   "Зур приехал", "export.png");
									
									addText('fonts/calibri_light_24.fnt', channel, coords[i].x + left, coords[i].y, mainImage, mobility, "Зур приехал", "export.png");
									addText('fonts/calibri_light_24.fnt', channel, coords[i].x + left, coords[i].y, mainImage, resilience, "Зур приехал", "export.png");
									addText('fonts/calibri_light_24.fnt', channel, coords[i].x + left, coords[i].y, mainImage, recovery, "Зур приехал", "export.png");
									addText('fonts/calibri_light_24.fnt', channel, coords[i].x + left, coords[i].y, mainImage, discipline, "Зур приехал", "export.png");
									addText('fonts/calibri_light_24.fnt', channel, coords[i].x + left, coords[i].y, mainImage, intellect, "Зур приехал", "export.png");
									addText('fonts/calibri_light_24.fnt', channel, coords[i].x + left, coords[i].y, mainImage, strength, "Зур приехал", "export.png");
									*/
								}
								/*
								var sockets = itemComponents[2190858386].sockets.data[saleItems[saleItemsHash].vendorItemIndex].sockets;
								sockets.forEach(function (socket){
									if(socket.plugHash != 2600899007 &&
										socket.plugHash != 702981643 &&
										socket.plugHash != 4248210736 &&
										socket.plugHash != 2931483505 &&
										socket.plugHash != 2285418970 &&
										socket.plugHash != 615063267 &&
										socket.plugHash != 3459475454 && //3459475454    837509459   Upgrade Masterwork
										socket.plugHash != 1959648454 && //1959648454    1959648454   Default Ornament
										typeof(socket.reusablePlugHashes) != 'undefined'){
										var reusablePlugHashes = socket.reusablePlugHashes;

										console.log("    "+"-----");

										var row = 0;
										reusablePlugHashes.forEach(function(reusablePlugHash){
											console.log("    "+socket.plugHash + "    " + reusablePlugHash + "   " + manifest.InventoryItem[reusablePlugHash].displayProperties.name);

											saveImageToDisk(
													manifest.InventoryItem[reusablePlugHash].displayProperties.icon,
													reusablePlugHash,
													channel,
													coords[i].x + 106 + col*50,
													coords[i].y + row*50,
													loadedImage,
													43,
													"Зур приехал",
													"export.png");
											row++;
										});
										col++;
									}
								});*/

								saveImageToDisk(
										manifest.InventoryItem[saleItems[saleItemsHash].itemHash].displayProperties.icon,
										saleItems[saleItemsHash].itemHash,
										channel,
										coords[i].x,
										coords[i].y,
										loadedImage,
										0,
										"Зур приехал",
										"export.png");
								i++;
							}
						});
					}
				});

			}
		}
	}
	second.send();
}

exports.weeklyreset = function(channel, boss) {
	var uri = "https://www.d2checklist.com/assets/destiny2.zip";
	var filename = 'destiny2.zip';
	request.head(uri, function(err, res, body){
		request(uri).pipe(fs.createWriteStream(filename))
			.on('close', function(){
				var zip = new AdmZip("./destiny2.zip");
				var zipEntries = zip.getEntries(); // an array of ZipEntry records
				zip.extractAllTo("./", /*overwrite*/true);
				
	
	
	messageSent = false;
	var reset = {};

	var nulldate = new Date(2018, 11, 4, 20, 0, 0);
	var now = new Date();
	var weeks = Math.floor((now - nulldate)/(1000*60*60*24*7));
	//var ascendent  = ['Forfeit Shrine', 'Shattered Ruins', 'Keep of Hones Edges', 'Agonarch Abyss', 'Cimmerian Garrison', 'Ouroborea'];
	//var location = ['Garden’s of Esila', 'Spine of Keres', 'Harbinger’s Seclude', 'Bay of Drowned Wishes', 'Chamber of Starlight', 'Aphelion’s Rest'];
	//var mission = ['Corsair Down', 'Oracle engine', 'Dark monastery']
	//var boss = ['Nur Abath, Crest of Xol', 'Kathok, Roar of Xol', 'Damkath, The Mask', 'Naksud, the Famine', 'Bok Litur, Hunger of Xol']

	var ascendent  = ['Потерянное святилище', 'Расколотые руины', 'Крепость отточенной кромки', 'Бездна Агонарха', 'Киммерийский гарнизон', 'Уроборея'];
	var location = ['Сады Эсилы', 'Хребет Керы', 'Закоулок посланника', 'Залив утонувших желаний', 'Зал звездного света', 'Могила Афелии'];
	var mission = ['Сломленный курьер', 'Машина пророчеств', 'Темный монастырь']
	var mission_img = ['reset/m_tunnel.png', 'reset/m_demontower.png', 'reset/m_bridge.png']
	var boss = ['Нур Абат', 'Каток', 'Дамкат', 'Наксуд', 'Бок Литур']
	var weapon = ['дробовик', 'ПП', 'снайперка', 'всё', 'всё']
	var menagerie_boss = ['Арунак', 'Пагури', 'Хасапико']
	var heroic_mod = ['Пустотный ожог', 'Электрический ожог', 'Огненный ожог']
	var nightmare_walker = ['Кошмар Оркиса, грозы Митракса', 'Кошмар Джакса, когтя Зиву Арат', 'Совет падших', 'Кошмар Ксортала, верного слуги Кроты']

	var gos_name = ["Я буду жить", "Звено в цепочке", "К вершине", "От одного до ста"]
	var gos_todo = ["Нельзя убивать циклопов в комнате с боссом",
					"Обновлять баф одновременно всеми игроками",
					"Каждый раз в шпиль должно быть внесено 10 частиц",
					"Каждый шпиль должен быть заполнен за 10 секунд"]

	reset["gos"] = {
		"name" : gos_name[weeks%4],
		"todo" : gos_todo[weeks%4]
	};

	var dc = {
		"week" : 1+weeks%3,
		"mission" : mission[weeks%3],
		"mission_img" : mission_img[weeks%3],
		"ascendent" : ascendent[weeks%6],
		"place" : location[weeks%6]
	};
	reset["dc"] = dc;

	var protocol = {
		"boss" : boss[weeks%5],
		"weapon" : weapon[weeks%5]
	};
	reset["protocol"] = protocol;

	var menagerie = {
		"boss" : menagerie_boss[weeks%3],
	};
	reset["menagerie"] = menagerie;
	reset["heroic_mod"] = heroic_mod[weeks%3];
	reset["nightmare_walker"] = nightmare_walker[weeks%4];

	let rawdata = fs.readFileSync('destiny2.json');
	let manifest = JSON.parse(rawdata);
	var nightmare_loot = {
		"Nightmare Hunt: Anguish: Hero": {
			name: "Боль",
			boss: "Омнигул",
			drop: "Ботинки",
			type: "броня"},
		"Nightmare Hunt: Brutality: Hero": {
			name: "Жестокость",
			boss: "???",
			drop: "Колыбельный рок",
			type: "револьвер"},
		"Nightmare Hunt: Despair: Hero": {
			name: "Отчаяние",
			boss: "Крота",
			drop: "Классовый предмет",
			type: "броня"},
		"Nightmare Hunt: Envy: Hero": {
			name: "Зависть",
			boss: "???",
			drop: "Предвестие",
			type: "импульсная винтовка"},
		"Nightmare Hunt: Failure: Hero": {
			name: "Провал",
			boss: "???",
			drop: "Логика молнии",
			type: "автомат"},
		"Nightmare Hunt: Fear: Hero": {
			name: "Страх",
			boss: "Фагот",
			drop: "Нагрудник",
			type: "броня"},
		"Nightmare Hunt: Greed: Hero": {
			name: "Алчность",
			boss: "???",
			drop: "Надежный памятник",
			type: "пулемет"},
		"Nightmare Hunt: Insanity: Hero": {
			name: "Безумие",
			boss: "???",
			drop: "Любовь и смерть",
			type: "гранатомет"},
		"Nightmare Hunt: Isolation: Hero": {
			name: "Одиночество",
			boss: "Таникс",
			drop: "Перчатки",
			type: "броня"},
		"Nightmare Hunt: Jealousy: Hero": {
			name: "Ревность",
			boss: "???",
			drop: "Ужас ночи",
			type: "меч"},
		"Nightmare Hunt: Obscurity: Hero": {
			name: "Скрытность",
			boss: "???",
			drop: "Каждый момент жизни",
			type: "пистолет-пулемет"},
		"Nightmare Hunt: Pride: Hero": {
			name: "Гордыня",
			boss: "Сколас",
			drop: "Шлем",
			type: "броня"},
		"Nightmare Hunt: Rage: Hero": {
			name: "Гнев",
			boss: "Гоул",
			drop: "Маленький шаг",
			type: "дробовик"},
		"Nightmare Hunt: Servitude: Hero": {
			name: "Неволя",
			boss: "Зидрон",
			drop: "Разрушитель надежд",
			type: "плазменная винтовка"},
		"Nightmare Hunt: Vanity: Hero": {
			name: "Тщеславие",
			boss: "???",
			drop: "Покой",
			type: "снайперская винтовка"}
	}
	var nightfall_loot = {
		"Nightfall: The Inverted Spire": {
			name: "Вывернутый шпиль",
			imag: "reset/nf_inverted_spire.png",
			drop: "Троецветие",
			icon: "/common/destiny2_content/icons/bb72e6b7b2a7ac6165431d4a47171b2f.jpg",
			type: "Оболочка призрака"},
		"Nightfall: The Pyramidion": {
			name: "Пирамидион",
			imag: "reset/nf_the_pyramdion.png",
			drop: "Силиконовая неврома",
			icon: "/common/destiny2_content/icons/77364d95fdc16bb1d23f6f00817dc6ab.jpg",
			type: "Снайперская винтовка - Кинетическое"},
		"Nightfall: Exodus Crash": {
			name: "Место крушения Исхода",
			imag: "reset/nf_exodus_crash.png",
			drop: "Скорость соударения",
			icon: "/common/destiny2_content/icons/4d0ecd27dd8a6d02a8a0f3b2618a097e.jpg",
			type: "Спэрроу"},
		"Nightfall: The Arms Dealer": {
			name: "Торговец оружием",
			imag: "reset/nf_the_arms_dealer.png",
			drop: "Скоростной запал",
			icon: "/common/destiny2_content/icons/a2dd642b18b15f764db069f845f5173c.jpg",
			type: "Спэрроу"},
		"Nightfall: Savathûn's Song": {
			name: "Песнь Саватун",
			imag: "reset/nf_savanthuns_song.png",
			drop: "Служебный долг",
			icon: "/common/destiny2_content/icons/0497af906c184a43fa7e2accae899c35.jpg",
			type: "Автомат - Кинетическое"},
		"Nightfall: Tree of Probabilities": {
			name: "Древо вероятностей",
			imag: "reset/nf_tree_of_probabilities.png",
			drop: "Смерть с небес",
			icon: "/common/destiny2_content/icons/6e692a14162839d0489e11cf9d84746e.jpg",
			type: "Револьвер - Кинетическое"},
		"Nightfall: A Garden World": {
			name: "Сад",
			imag: "reset/nf_garden_world.png",
			drop: "Универсальная ампл. вероятности",
			icon: "/common/destiny2_content/icons/d6c77755df5761e5626b052d440cf5c7.jpg",
			type: "Корабль"},
		"Nightfall: Will of the Thousands": {
			name: "Повелитель тысяч армий",
			imag: "reset/nf_xol.png",
			drop: "Воплощение червебога",
			icon: "/common/destiny2_content/icons/2d6ff9e9e65253a82ec0856f310e2b94.jpg",
			type: "Телепортационный эффект"},
		"Nightfall: Strange Terrain": {
			name: "Глубины Марса",
			imag: "reset/nf_nokris.png",
			drop: "Ястреб Брея",
			icon: "/common/destiny2_content/icons/659ebe95206951d7c97022b47a93c459.jpg",
			type: "Ракетная установка - Мощное"},
		"Nightfall: Lake of Shadows": {
			name: "Озеро теней",
			imag: "reset/nf_lake_of_shadows.png",
			drop: "Дружинное право",
			icon: "/common/destiny2_content/icons/39b67dae56153d70e935bfad21faecc7.jpg",
			type: "Гранатомет - Кинетическое"},
		"Nightfall: The Insight Terminus": {
			name: "Терминал знаний",
			imag: "reset/nf_glee.png",
			drop: "Долгое прощание",
			icon: "/common/destiny2_content/icons/fe07633a2ee87f0c00d5b0c0f3838a7d.jpg",
			type: "Снайперская винтовка - Энергетическое"},
		"Nightfall: The Corrupted": {
			name: "Оскверненная",
			imag: "reset/nf_gemini.png",
			drop: "Малый ужас",
			icon: "/common/destiny2_content/icons/c5454c80b15ecb3b3abf2d69d4bfe5ff.jpg",
			type: "Импульсная винтовка - Энергетическое"},
		"Nightfall: The Hollowed Lair": {
			name: "Полое логово",
			imag: "reset/nf_taurus.png",
			drop: "Замысел покорителя разума",
			icon: "/common/destiny2_content/icons/0d39a47ea705e188a3674fa5f41b99a5.jpg",
			type: "Дробовик - Энергетическое"},
		"Nightfall: Warden of Nothing": {
			name: "Надзиратель пустоты",
			imag: "reset/nf_aries.png",
			drop: "Правило надзирателя",
			icon: "/common/destiny2_content/icons/89a68f864854dd80155eb194ee8f5cb7.jpg",
			type: "Револьвер - Кинетическое"},
		"Nightfall: The Scarlet Keep": {
			name: "Алая крепость",
			imag: "reset/nf_the_pyramdion.png",
			drop: "unknown",
			icon: "/img/misc/missing_icon_d2.png",
			type: "unknown"},
		"Nightfall: Broodhold": {
			name: "Убежище роя",
			imag: "reset/nf_the_pyramdion.png",
			drop: "unknown",
			icon: "/img/misc/missing_icon_d2.png",
			type: "unknown"},
		"Nightfall: The Festering Core": {
			name: "Гниющее ядро",
			imag: "reset/nf_the_pyramdion.png",
			drop: "unknown",
			icon: "/img/misc/missing_icon_d2.png",
			type: "unknown"},
		"unknown": {
			name: "unknown",
			imag: "reset/nf_the_pyramdion.png",
			drop: "unknown",
			icon: "/img/misc/missing_icon_d2.png",
			type: "unknown"},
	};

	/*	links
	https://www.bungie.net/en/oauth/authorize?client_id=26315&response_type=code&state=zl4fzwG4uBgWCnE6jOkRL1R-SshXjPpt2ZGwAvxd79M
	https://www.bungie.net/Platform/App/OAuth/Token/?client_id=26315&grant_type=authorization_code&code=1dd34f50ca2c753764a802b2010cad11
	https://lowlidev.com.au/destiny/authentication-2
	https://github.com/Bungie-net/api/wiki/OAuth-Documentation
	https://www.npmjs.com/package/simple-oauth2
	*/

	console.log("1.1 milestones request");
	var member_id = new XMLHttpRequest();
	member_id.open("GET", "https://www.bungie.net/Platform/Destiny2/Milestones/", true);
	member_id.setRequestHeader("X-API-Key", d2apiKey);
	member_id.setRequestHeader("Authorization", "Bearer "+tokenObject["access_token"]);
	member_id.onreadystatechange = function(){
		if(this.readyState === 4 && this.status === 200){
			var json = JSON.parse(this.responseText);

			if(typeof(json.Response) == 'undefined'){
				if(message != null) message.channel.send('ШТО.');
				else boss.send('ШТО.');
			}else{
				console.log("1.2 milestones answer");

				var raw_milestones = json.Response;
				//flashpoint - 463010297 (need name)
				//nightfall  - 2171429505
				//nightfallsc- 2853331463 (need activities names)
				//eater      - 2986584050 (need activities modifiers)
				//lv         - 3660836525 (need phase order & modifiers)

				Object.keys(raw_milestones).forEach(function (id){
					console.log("    "+manifest.Milestone[id].displayProperties.name);
					if(id == 463010297 || id == 2853331463 || id == 2986584050 || id == 3660836525){
						//console.log("    "+manifest.Milestone[id].displayProperties.name);
						if(id == 463010297 && typeof(raw_milestones[id].availableQuests) != 'undefined'){ // only flashpoint
							raw_milestones[id].availableQuests.forEach(function (quest){
								//console.log("    "+'                                ' + manifest.Milestone[id].quests[quest.questItemHash].displayProperties.name);
								reset["flashpoint"] = translate(manifest.Milestone[id].quests[quest.questItemHash].displayProperties.name);
								reset["flashpoint_img"] = "reset/fp_" +
															manifest.Milestone[id].quests[quest.questItemHash].displayProperties.name.replace("FLASHPOINT: ", "").toLowerCase()+
															".png";
							});
						}
						else if(typeof(raw_milestones[id].activities) != 'undefined')
						{ // leviathan && nightfall
							raw_milestones[id].activities.forEach(function (activity){
								console.log("    "+manifest.Activity[activity.activityHash].displayProperties.name);
								//console.log("    "+activity);

								if(activity.activityHash == 809170886){ // leviathan_prestige
									reset['leviathan_prestige'] = {};
									if(typeof(activity.modifierHashes) != 'undefined'){
										activity.modifierHashes.forEach(function (modifier){
											//console.log("    "+manifest.ActivityModifier[modifier].displayProperties.name);
											//console.log("    "+manifest.ActivityModifier[modifier].displayProperties.description);
											if(manifest.ActivityModifier[modifier].displayProperties.name == 'Armsmaster'){
												reset.leviathan_prestige['armsmaster'] = translate(manifest.ActivityModifier[modifier].displayProperties.name) +
														"\nБудет добавлено позже"+
														"\n";
													//translate(manifest.ActivityModifier[modifier].displayProperties.description
													//.replace('You\'ve been challenged to wield the following:\n\n', ''));
											}else{
												reset.leviathan_prestige['modifier'] = translate(manifest.ActivityModifier[modifier].displayProperties.name);
											}
										});
									}
									if(typeof(activity.phaseHashes) != 'undefined'){// leviathan_order
										//console.log("    "+activity.phaseHashes);
									}
								}else if(manifest.Milestone[id].displayProperties.name == "Leviathan Raid"){ // leviathan_challenge
									if(typeof(activity.modifierHashes) != 'undefined'){
										var todo = {
											"The Gauntlet Challenge" 			: "Ни один игрок не должен дважды стоять на одной платформе",
											"The Pleasure Gardens Challenge" 	: "Игроки с семечкой должны активировать по одному цветку",
											"The Royal Pools Challenge" 		: "Один игрок не должен никогда сходить с платформы",
											"Throne Challenge" 					: "Наносить урон одновременно со всех платформ, убить за фазу",
										}
										activity.modifierHashes.forEach(function (modifier){
											var name = manifest.ActivityModifier[modifier].displayProperties.name;
											//console.log("    "+name);
											reset['lv'] = {
												"name" : translate(name),
												"todo" : todo[name]
											};
											//console.log("    "+reset.lv);
										});
									}
								}
							});
						}
					}
				});

				var endpoint = "https://www.bungie.net/Platform/Destiny2/3/Profile/4611686018484533589/Character/2305843009409595202/Vendors/?components=400,402,300,301,302,304,305,306,307,308,600";

				console.log("2.1 quests request");
				var second = new XMLHttpRequest();
				second.open("GET", endpoint, true);
				second.setRequestHeader("Authorization", "Bearer "+tokenObject["access_token"]);
				second.setRequestHeader("X-API-Key", d2apiKey);
				second.onreadystatechange = function(){
					if(this.readyState === 4 && this.status === 200){
						var json2 = JSON.parse(this.responseText);

						if(typeof(json2.Response) == 'undefined'){
							if(message != null) message.channel.send('ШТО.');
							else boss.send('ШТО.');
						}else{
							console.log("2.2 quests answer");
							//console.log("    "+json2.Response.itemComponents['69482069']);

							var vendors 		= json2.Response.vendors.data;
							var sales   		= json2.Response.sales.data;
							var itemComponents 	= json2.Response.itemComponents.data;

							//3361454721           Tess Everis
							//863940356            Spider
							//3347378076           Suraya Hawthorne
							//880202832            Werner 99-40
							//1841717884           Petra Venj
							//672118013			   Banshee-44

							reset["everis"] = [];

							Object.keys(sales).forEach(function (saleHash){
								if(saleHash == 3347378076 || saleHash == 863940356 || saleHash == 880202832 || saleHash == 672118013){
									//console.log("    "+manifest.Vendor[saleHash].displayProperties.name);
									var saleItems = sales[saleHash].saleItems;
									Object.keys(saleItems).forEach(function (saleItemsHash){
										if((saleHash == 863940356 && saleItems[saleItemsHash].costs[0].quantity == 5) || saleHash != 863940356){
											if(manifest.InventoryItem[saleItems[saleItemsHash].itemHash].itemTypeAndTierDisplayName.includes("Legendary Weekly Bounty") ||
												manifest.InventoryItem[saleItems[saleItemsHash].itemHash].itemTypeAndTierDisplayName.includes("Rare Weekly Bounty")){
												//console.log("    "+saleItems[saleItemsHash].itemHash + "         " +
												//	manifest.InventoryItem[saleItems[saleItemsHash].itemHash].displayProperties.name);
												switch(saleHash){
													case "3347378076":  //Suraya Hawthorne
														switch(manifest.InventoryItem[saleItems[saleItemsHash].itemHash].displayProperties.name){
															case "Strength of Memory":
																reset["lw"] = {
																	"name" : "Сила Памяти",
																	"todo" : "Каждому игроку нельзя стрелить дважды в один глаз Ривен"
																};
																break;
															case "Keep Out":
																reset["lw"] = {
																	"name" : "Не влезать",
																	"todo" : "Одержимые рыцари не должны выйти за пределы комнаты"
																};
																break;
															case "Forever Fight":
																reset["lw"] = {
																	"name" : "Вечная война",
																	"todo" : "Не убить ни одного огра в бою с Моргетом"
																};
																break;
															case "Which Witch":
																reset["lw"] = {
																	"name" : "Шабаш ведьм",  // Шабаш ведьм
																	"todo" : "Не попасть под точный выстрел Шуро Чи более одного раза"
																};
																break;
															case "Coliseum Champion":
																reset["lw"] = {
																	"name" : "Чемпион колизея",  // Шабаш ведьм
																	"todo" : "Не попасть под точный выстрел Шуро Чи более одного раза"
																};
																break;
															case "Summoning Ritual":
																reset["lw"] = {
																	"name" : "Ритуал призыва",
																	"todo" : "Призвать и убить трех огров, убить Калли за одну фазу"
																};
																break;
															case "Hold the Line":
																reset["sotp"] = {
																	"name" : "Нужно держать строй",
																	"todo" : "Таймер заряда не должен опуститься ниже половины"
																};
																break;
															case "All for One, One for All":
																reset["sotp"] = {
																	"name" : "Один за всех,все за одного",
																	"todo" : "Каждый игрок должен сдать три разных бафа\n"
																};
																break;
															case "To Each Their Own":
																reset["sotp"] = {
																	"name" : "Каждому свое",
																	"todo" : "Каждый игрок должен уничтожить свою болевую точку босса"
																};
																break;
															case "Limited Blessings":
																reset["cos"] = {
																	"name" : "Огранич. благословения",
																	"todo" : "Не более двух игроков с бафом единовременно на первом этапе"
																};
																break;
															case "Total Victory":
																reset["cos"] = {
																	"name" : "Безоговорочная победа",
																	"todo" : "Снять 5 щитов с проекции за одну фазу урона"
																};
																break;
															case "With Both Hands":
																reset["cos"] = {
																	"name" : "Обеими руками",
																	"todo" : "На фазе урона каждый отстреливает по одной руке"
																};
															case "Staying Alive":
																reset["gos"] = {
																	"name" : "Я буду жить",
																	"todo" : "Нельзя убивать циклопов в комнате с боссом"
																};
															case "A Link to the Chain":
																reset["gos"] = {
																	"name" : "Звено в цепочке",
																	"todo" : "Обновлять баф одновременно всеми игроками"
																};
															case "To the Top":
																reset["gos"] = {
																	"name" : "К вершине",
																	"todo" : "Каждый раз в шпиль должно быть внесено 10 частиц"
																};
															case "Zero to One Hundred":
																reset["gos"] = {
																	"name" : "От одного до ста",
																	"todo" : "Каждый шпиль должен быть заполнен за 10 секунд"
																};
															break;
														}
														break;
													case "863940356":   //Spider
														reset["spider"] = translate(manifest.InventoryItem[saleItems[saleItemsHash].itemHash].displayProperties.name)
																				.replace("WANTED: ", "");
														break;
													case "880202832":   //Werner 99-40
														break;
													case "672118013":   //banshee-44
														break;
												}
											}
										}
									});
								}else if(saleHash == 3361454721){
									//2474106502 - category of dust
									//2817410917 - dust hash /common/destiny2_content/icons/00b8fd588be5678ad3f94d75dc6a3b19.png
									//console.log("    "+manifest.Vendor[saleHash].displayProperties.name);
									var saleItems = sales[saleHash].saleItems;
									Object.keys(saleItems).forEach(function (saleItemsHash){
										if(typeof(saleItems[saleItemsHash].costs) != undefined){
											if(saleItems[saleItemsHash].costs.length == 0){
												//console.log("    "+saleItems[saleItemsHash]);
											}else if((saleItems[saleItemsHash].costs[0].itemHash == 2817410917)){
												//console.log("    "+"    "+saleItems[saleItemsHash].itemHash +
												//			"                     "+
												//			manifest.InventoryItem[saleItems[saleItemsHash].itemHash].itemTypeAndTierDisplayName +
												//			"                     "+
												//			manifest.InventoryItem[saleItems[saleItemsHash].itemHash].displayProperties.name);
												if(saleItems[saleItemsHash].itemHash != 4101386442 &&
													saleItems[saleItemsHash].itemHash != 3260482534 &&
													saleItems[saleItemsHash].itemHash != 3536420626){
													reset["everis"].push({
														"hash" : saleItems[saleItemsHash].itemHash,
														"name" : manifest.InventoryItem[saleItems[saleItemsHash].itemHash].displayProperties.name,
														"icon" : manifest.InventoryItem[saleItems[saleItemsHash].itemHash].displayProperties.icon,
														"cost" : saleItems[saleItemsHash].costs[0].quantity});
												}
											}
										}
									});
								}
							});

							console.log("3.1 CharacterActivities request");
							var third = new XMLHttpRequest();
							third.open("GET", "https://www.bungie.net/Platform/Destiny2/3/Profile/4611686018484533589/?components=CharacterActivities", true);
							third.setRequestHeader("Authorization", "Bearer "+tokenObject["access_token"]);
							third.setRequestHeader("X-API-Key", d2apiKey);
							third.onreadystatechange = function(){
								if(this.readyState === 4 && this.status === 200){
									var json3 = JSON.parse(this.responseText);
									if(typeof(json3.Response) == 'undefined'){
										if(message != null) message.channel.send('ШТО3.');
										else boss.send('ШТО3.');
									}else{
										console.log("3.2 CharacterActivities answer");
										var raw_activities = json3.Response.characterActivities.data["2305843009409595202"].availableActivities;
										var all_activities = "";
										var nf_raw = [];
										var ordeal = "";
										var nm_hunt = [];
										raw_activities.forEach(function (activity){
											console.log("    "+activity.activityHash, manifest.Activity[activity.activityHash].displayProperties.name);
											all_activities += manifest.Activity[activity.activityHash].displayProperties.name;

											if (manifest.Activity[activity.activityHash].displayProperties.name.includes("Nightfall") &&
												!manifest.Activity[activity.activityHash].displayProperties.name.includes("The Ordeal")){
												nf_raw.push(manifest.Activity[activity.activityHash].displayProperties.name);
											}
											if (manifest.Activity[activity.activityHash].displayProperties.name.includes("Nightfall: The Ordeal")){
												ordeal = manifest.Activity[activity.activityHash].displayProperties.description;
											}
											if (manifest.Activity[activity.activityHash].displayProperties.name.includes("Nightmare Hunt") &&
												manifest.Activity[activity.activityHash].displayProperties.name.includes("Hero")){
												nm_hunt.push(manifest.Activity[activity.activityHash].displayProperties.name);
											}
										});
										console.log(nf_raw);
										console.log(nm_hunt);
										nf_raw.forEach(function (nf_next){
											if(typeof(reset.nf1) == 'undefined'){
												if (typeof(nightfall_loot[nf_next]) != 'undefined')
													reset['nf1'] = nightfall_loot[nf_next];
												else
													reset['nf1'] = nightfall_loot['unknown'];
											}else if(typeof(reset.nf2) == 'undefined'){
												if (typeof(nightfall_loot[nf_next]) != 'undefined')
													reset['nf2'] = nightfall_loot[nf_next];
												else
													reset['nf2'] = nightfall_loot['unknown'];
											}else if(typeof(reset.nf3) == 'undefined'){
												if (typeof(nightfall_loot[nf_next]) != 'undefined')
													reset['nf3'] = nightfall_loot[nf_next];
												else
													reset['nf3'] = nightfall_loot['unknown'];
											}else if(typeof(reset.nf4) == 'undefined'){
												if (typeof(nightfall_loot[nf_next]) != 'undefined')
													reset['nf4'] = nightfall_loot[nf_next];
												else
													reset['nf4'] = nightfall_loot['unknown'];
											}
										});

										if (typeof(nightfall_loot["Nightfall: " + ordeal]) != 'undefined')
											reset['ordeal'] = nightfall_loot["Nightfall: " + ordeal];
										else
											reset['ordeal'] = nightfall_loot['unknown'];


										nm_hunt.forEach(function (nm_next){
											if(typeof(reset.nm1) == 'undefined'){
												if (typeof(nightmare_loot[nm_next]) != 'undefined')
													reset['nm1'] = nightmare_loot[nm_next];
												else
													reset['nm1'] = nightmare_loot['unknown'];
											}else if(typeof(reset.nm2) == 'undefined'){
												if (typeof(nightmare_loot[nm_next]) != 'undefined')
													reset['nm2'] = nightmare_loot[nm_next];
												else
													reset['nm2'] = nightmare_loot['unknown'];
											}else if(typeof(reset.nm3) == 'undefined'){
												if (typeof(nightmare_loot[nm_next]) != 'undefined')
													reset['nm3'] = nightmare_loot[nm_next];
												else
													reset['nm3'] = nightmare_loot['unknown'];
											}
										});

										//x, Labs: Elimination, x
										//Rumble, Control, Survival, Survival: Freelance
										//Private Match, Classic Mix

										reset["pvp"] = "";
										if(all_activities.includes("Breakthrough"))		reset["pvp"] += "Рывок\n";
										if(all_activities.includes("Clash"))			reset["pvp"] += "Столкновение\n";
										if(all_activities.includes("Countdown"))		reset["pvp"] += "Обратный отсчет\n";
										if(all_activities.includes("Team Scorched"))	reset["pvp"] += "Командный ожог\n";
										if(all_activities.includes("Crimson Days"))		reset["pvp"] += "Лучшие напарники\n";
										if(all_activities.includes("Lockdown"))			reset["pvp"] += "Изоляция\n";
										if(all_activities.includes("Doubles"))			reset["pvp"] += "Напарники\n";
										if(all_activities.includes("Mayhem"))			reset["pvp"] += "Хаос\n";
										//if(all_activities.includes("Rumble"))			reset["pvp"] += "Стычка";
										if(all_activities.includes("Showdown"))			reset["pvp"] += "Поединок\n";
										if(all_activities.includes("Supremacy"))		reset["pvp"] += "Превосходство\n";
										if(all_activities.includes("Iron Banner"))		reset["pvp"] += "Железное знамя\n";
										if(all_activities.includes("Momentum Control"))	reset["pvp"] += "Управление инерцией\n";
										

										//create_reset_img(reset, channel);
										//	  .setThumbnail('https://images-ext-1.discordapp.net/external/veZptUu_KDKmwtUJX5QT3QxESYCaRp4_k0XUwEQxubo/https/i.imgur.com/e9DIB8e.png')
										var embed = new Discord.RichEmbed()
											  .setAuthor(".                                                      Ресет — сезонное")
											  .setColor(0xbbbbbb)
											  
											  .addField("Бродячий кошмар", 			"" + reset.nightmare_walker, true)
											  .addField("Кошмары", 			reset.nm1.name + " (" + reset.nm1.boss + "): " + reset.nm1.drop + " (" + reset.nm1.type + ")\n" +
																			reset.nm2.name + " (" + reset.nm2.boss + "): " + reset.nm2.drop + " (" + reset.nm2.type + ")\n" +
																			reset.nm3.name + " (" + reset.nm3.boss + "): " + reset.nm3.drop + " (" + reset.nm3.type + ")\n", true)
											  .addField("Налет: Побоище", 	reset.ordeal.name + ": " + reset.ordeal.drop + " (" + reset.ordeal.type.split(' -')[0] + ")", true)
											  
										channel.send({embed});
										embed = new Discord.RichEmbed()
											  .setAuthor(".                                                        Ресет — разное")
											  .setColor(0x23cedf)
											  
											  .addField("Горячая точка", reset.flashpoint, true)
											  .addField("Горнило", reset.pvp, true)
											  .addField("Эскалационный протокол", 	"Босс: " + reset.protocol.boss + "\nОружие: " + reset.protocol.weapon, true)
										//	  .addField("Cюжетные миссии", reset.heroic_mod, true)
											  .addField("Город Грез", (reset.dc.week==1 ? "Первая" : (reset.dc.week==2 ? "Вторая" : "Третья")) + " неделя проклятия\n"+
																	   /*"Миссия: " + reset.dc.mission + "\n" + */
																	   "Высшее испытание: " + reset.dc.ascendent + " (" + reset.dc.place + ")", true)
										//	  .addField("Суд", "???", true)
										//	  .addField("Паноптикум", 				"Босс: " + reset.menagerie.boss, true)
											  .addField("Сумрачные налеты", reset.nf1.name + ": " + reset.nf1.drop + " (" + reset.nf1.type.split(' -')[0] + ")\n" +
																			reset.nf2.name + ": " + reset.nf2.drop + " (" + reset.nf2.type.split(' -')[0] + ")\n" + //
																			reset.nf3.name + ": " + reset.nf3.drop + " (" + reset.nf3.type.split(' -')[0] + ")\n" + //.split('-')[0]
																			reset.nf4.name + ": " + reset.nf4.drop + " (" + reset.nf4.type.split(' -')[0] + ") — проводник", true)
										channel.send({embed});
										embed = new Discord.RichEmbed()
											  .setAuthor(".                                                      Ресет — испытания")
											  .setColor(0xff8800)
											  .setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")				
											  .addField("ЛВ: "+reset.lv.name, 		reset.lv.todo, true)
											  .addField("ЛВ: престиж",    reset.leviathan_prestige.modifier + "\n"+ reset.leviathan_prestige.armsmaster , true)
											  .addField("ПЖ: "+reset.lw.name,     	reset.lw.todo, true)
											  .addField("ИП: "+reset.sotp.name, 	reset.sotp.todo, true)
											  .addField("КС: "+reset.cos.name, 	    reset.cos.todo, true)
											  .addField("СС: "+reset.gos.name, 	    reset.gos.todo, true)
										channel.send({embed});
									}
								}
							}
							third.send();
						}
					}
				}
				second.send();
			}
		}
	}
	member_id.send();
	
	
			});
	});
}
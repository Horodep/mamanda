import { InviteFriend, ChangeChannelCap, ChangeRegion } from "./discordFeatures.js"
import { Roles } from "./roles.js"

export class CommandManager{
    static commandList = [];

    static Run(args, message){
        var command = this.FindCommand(args[0]);
        command?.callback(args, message);
    }
    static AddCommand(name, rights, description, callback){
        this.commandList.push({
            name: name,
            rights: rights,
            description: description,
            callback: callback
        });
    }
    static FindCommand(commandName){
        var foundCommands = this.commandList.filter(c => c.name === commandName);
        return foundCommands.length > 0 ? foundCommands[0] : null;
    }
    static CheckRights(commandName, rights){
        var command = this.FindCommand(commandName);
        return command?.rights == rights;
    }
    static IsGuildMasterCommand(commandName){
        return this.CheckRights(commandName, 'guildmaster');
    }
    static IsRestrictedCommand(commandName){
        return this.CheckRights(commandName, 'restricted');
    }
    static IsCommonCommand(commandName){
        return this.CheckRights(commandName, 'common');
    }
    static IsDeveloperCommand(commandName){
        return this.CheckRights(commandName, 'developer');
    }
    static Init(){
        this.AddCommand("ping", "common", "testing functionality", function(args, message){
            message.channel.send('pong'+args[0]);});
    }
}
/*
RESTRICTED

    case 'cap':         	ChangeChannelCap(message, (args.length > 1 ? args[1] : 0)); break;
    //case 'сбор':			raid.create_raid(message, args);							break;
    //case 'mymt':			clantime.membertime(message, message.member.id, (args.length > 1 ? args[1] : 7), false);	break;
    //case 'medals':		medalstat.medals(message);									break;
    case 'region':			ChangeRegion(message); break;
    case 'roles':			Roles(message, args); break;
    //case 'triumph':		seals.triumph(message, (args.length > 1 ? args[1] : 0));	break;
    //case 'triumphs':		triumphs.triumphs(message, (args.length > 1 ? 1 : null));	break;
    //case 'rl':			raidleader.rl(message.channel, (args.length > 1 ? args[1] : message.member.user.id), (args.length > 2 ? args[2] : 7));	break;
    case 'invitefriend':	InviteFriend(message, (args.length > 1 ? args[1] : "")); break;
    //case 'horohelp':		help(message);												break;
    //case 'help':			help(message);												break;
            
ALL 
    case 'ping': message.channel.send('pong'); break;
    case 'rand': message.channel.send(emoji.random().emoji); break;
    case 'clown': message.channel.send('🤡'); break;

\DEV
    
    case 'oauth2': message.channel.send(`https://www.bungie.net/ru/OAuth/Authorize?response_type=code&client_id=${config.d2clientId}&state=12345`); break;
    case 'code': reset.newToken(message, args[1]); break;
    case 'status': ShowStatus(message.channel); break;

GM
    case 'checksync':	checksync.checksync(message.channel);					break;
    case 'sync':		roles.roles_bytag(message.channel, args.length > 1 ? args[1] : message.member.id, true);					break;
    case 'message':
        channel = client.channels.get(args[1]);
        var message = args.filter((_,i) => i > 1).join(" ");
        channel.send(message);
        break;
    case 'pmspam':
        var userlist = message.guild.roles.find(role => role.name == "Путник").members;
        
        users_to_send = [];
        userlist.forEach(function(user1111, i, userlist) { 
            users_to_send.push(user1111);
        });
        
        var i = 0;
        
        var pm_spam = function(){
            if(i < users_to_send.length){
                var member = users_to_send[i];
                var member_message_text = "Уважаемый Путник, ознакомьтесь, пожалуйста, с объявлением.\nhttps://discordapp.com/channels/471020862045290496/479684908806307840/715354406735970345";
                member.send(member_message_text);
                console.log("pm "+ member.displayName);
                i++;
                setTimeout(pm_spam, 2000); 
            }
        }
        pm_spam();
        break;
    case 'watermelon':		watermelon.watermelon(message.channel, args.length > 1 ? args[1] : message.member.id);
        break;
    case 'setmaxtriumphs':
        if(args.length > 1){
            fs.writeFile('maxtriumphs.txt', args[1], function(error){
                if(error) throw error; // если возникла ошибкаS
            });
        }else{
            message.channel.send("нет данных!");
        }
        break;
    case 'forum':
        fs.writeFile('forumlink.txt', message.content.slice(7), function(error){
            if(error) throw error; // если возникла ошибка
        });
        channel_news = client.channels.get("479684908806307840");
        channel_news.send(
            "Уважаемые <@&471048548318969888>и, <@&564787660745605120>и и @everyone остальные, кому не безразлична судьба нашего клана! <@&572759337836216330>\n"+
            "Поднимите, пожалуйста, пост о наборе нажатием на стрелочку вверх на форуме.\n"+
            message.content.slice(7)).then((msg)=>{
            msg.react("🆗");
        });
        break;
    case 'forumtime':
        var userlistraw = message.guild.roles.find(role => role.id == "572759337836216330").members;
        userlist = [];
        userlistraw.forEach(function(user1111, i, userlistraw) { 
            userlist.push(user1111);
        });
        
        var i = 0;
        var seaker = message.guild.roles.find(role => role.name == "не апнул тему на форуме");
        var giverole = function(){
            if(i < userlist.length){
                var member = userlist[i];
                member.addRole(seaker);
                console.log("setRole forum (" + i + "/" + userlist.length + ")", member.displayName); 
                i++;
                setTimeout(giverole, 1000); 
                if (i == userlist.length) message.channel.send("роли выданы!");
            }
        }
        giverole();
        break;
    case 'testreset':
        var yyyy = date.getFullYear();
        var dd = date.getDate();
        if(dd<10) { dd='0'+dd; }
        var mm = date.getMonth()+1; 
        if(mm<10) { mm='0'+mm; } 
        
        message.channel.send(
            "Reset by Kyber3000\n"+
            "https://kyberscorner.files.wordpress.com/"+yyyy+"/"+mm+"/destiny-2-weekly-reset-summary-"+mm+"-"+dd+"-"+yyyy+".png\n"+
            "https://kyberscorner.files.wordpress.com/"+yyyy+"/"+mm+"/destiny-2-weekly-raid-challenges-by-kyber3000-"+mm+"-"+dd+"-"+yyyy+".png");
        break;
    case 'xur':
        reset.auth(boss);
        setTimeout(function (){
            reset.xur(message.channel);
        }, 2000); 
        break;
    case 'reset':
        reset.auth(boss);
        setTimeout(function (){
            reset.weeklyreset(message.channel);
        }, 2000); 
        break;
    case 'membertime':
        clantime.membertime(message, (args.length > 1 ? args[1].replace(/\D/g,'') : message.member.id), (args.length > 2 ? args[2] : 7), true);
        break;
    case 'copy':					raid.copy(client);					break;
    case 'raidadd':
        if(args.length > 2){
            var chan = client.channels.get("626432384643891220");
            chan.fetchMessage(args[1]).then(msg => {
                raid.yes(msg, client.users.get(args[2]), null);
                setTimeout(function (){
                    message.delete();
                }, 5000);
            });
        }else{
            message.channel.send('Указаны не все параметры');
        };
        break;
    case 'raidkick':							
        if(args.length > 2){
            var chan = client.channels.get("626432384643891220");
            chan.fetchMessage(args[1]).then(msg => {
                raid.no(msg, client.users.get(args[2]), null);
                setTimeout(function (){
                    message.delete();
                }, 5000);
            });
        }else{
            message.channel.send('Указаны не все параметры');
        };
        break;
    case 'size':			count.count(message);														break;
    case 'ck':
    case 'clankick':		clantime.clantime(message, (args.length > 1 ? args[1] : 7), 'full');		break;
    case 'ckp':
    case 'clankickpub':		clantime.clantime(message, (args.length > 1 ? args[1] : 7), 'pub');			break;
    case 'csr':				roles.set_clan_roles(message.channel);										break;
    case 'nicknames':		dclan.dclan(message, true, message.channel);								break;
    case 'q':				query.q(message);															break;
    case 'qq':				query.qq(message);															break;
    case 'n':				query.n(message);															break;
    case 'pvpdrop':
        var t1 = message.guild.roles.find(role => role.name == "💠 Левая рука Шакса");
        t1.members.forEach(function(member) {
            setTimeout(function (){
                member.removeRole(t1);
            }, 5000);
        });
        var t2 = message.guild.roles.find(role => role.name == "💠💠 Правая рука Шакса");
        t2.members.forEach(function(member) {
            setTimeout(function (){
                member.removeRole(t2);
            }, 5000);
        });
        var t3 = message.guild.roles.find(role => role.name == "💠💠💠 Машина");
        t3.members.forEach(function(member) {
            setTimeout(function (){
                member.removeRole(t3);
            }, 5000);
        });
        break;
    case 'gmhelp':				gmhelp(message);					break;
}*/
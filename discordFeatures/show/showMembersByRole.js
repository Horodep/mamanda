export function ShowMembersByRole(channel, args){
    if (args.length < 2) throw 'Указаны не все параметры.';
    var roleId = args[1].replace(/\D/g, '');

	channel.send(channel.guild.roles.cache.find(r => r.id == roleId).members.map(m => "<@"+m.id+">").join("\n"));
}
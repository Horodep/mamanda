import config from "../config.json" assert {type: "json"};


export function DropPvpRole(message) {
	var list = [];
	var topPvpRole = message.guild.roles.cache.find(role => role.id == config.roles.medals.category_first_role.crucible);
	for (var rolePosition = topPvpRole.position - 1; rolePosition > topPvpRole.position - 7; rolePosition--) {
		var role = message.guild.roles.cache.find(role => role.position == rolePosition);
		role.members.forEach(member => { list.push({ member: member, role: role }); });
	}
	var i = 0;
	var dropRole = function () {
		if (i < list.length) {
			list[i].member.roles.remove(list[i].role);
			i++;
			setTimeout(dropRole, 1000);
		} else {
			message.channel.send("Пвп роли сняты");
		}
	};
	dropRole();
}

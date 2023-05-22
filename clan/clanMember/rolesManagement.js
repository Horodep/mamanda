import config from "../../config.json" assert {type: "json"};

export function LogRolesGranting(displayName, isDiscordMemberFound, medals) {
	if (medals == null) {
		console.log(displayName + ' '.repeat(40 - displayName.length), "NO DATA");
	} else if (isDiscordMemberFound == false) {
		console.log(displayName + ' '.repeat(40 - displayName.length), "DISCORD MEMBER NOT FOUND");
	} else {
		console.log(displayName + ' '.repeat(40 - displayName.length), "set roles and it's details");
	}
}

export function CheckAndProcessRole(discord_member, roleId, grantRole, grantNextRole, role) {
	if (role == null)
		role = discord_member.guild.roles.cache.find(r => r.id == roleId);
	if (role == null)
		return;
	if (discord_member.roles.cache.find(r => r.position == role.position) == null) {
		if (grantRole == true && grantNextRole == false) {
			discord_member.roles.add(role);
		}
	} else {
		if (grantRole == false || grantNextRole == true) {
			discord_member.roles.remove(role);
		}
	}
}

export function CheckAndProcessRoleBlock(discord_member, firstRoleId, blockSize, data) {
	var role = discord_member.guild.roles.cache.find(r => r.id == firstRoleId);
	if (role == null)
		return;

	var i = 0;
	var sum = SumSubcategory(data);
	while (i < blockSize) {
		var nextRole = discord_member.guild.roles.cache.find(r => r.position == (role.position - i));
		CheckAndProcessRole(discord_member, null, sum > i, sum > i + 1, nextRole);
		i++;
	}
}

export function SumMedals(discord_member, medals) {
	var sum = 0;
	for (let subcategoryName of Object.keys(medals)) {
		if (subcategoryName != "crucible" && subcategoryName != "extra")
			sum = sum + SumSubcategory(medals[subcategoryName]);
	};
	return sum + SumCrucible(discord_member);
}

function SumSubcategory(subcategory) {
	var sum = 0;
	for (let child of Object.values(subcategory)) {
		sum = sum + (child.state ? 1 : 0);
	};
	return sum;
}

function SumCrucible(discord_member) {
	if (discord_member == null)
		return 0;
	var pvp_top_role = discord_member.guild.roles.cache.find(role => role.id == config.roles.medals.category_first_role.crucible);

	for (let i = 0; i < 9; i++) {
		var role = discord_member.roles.cache.find(role => role.position == (pvp_top_role.position - i));
		if (role != null)
			return (role.name.match(/💠/g)?.length*2 ?? 0) + (role.name.match(/🔷/g)?.length ?? 0);
	}
	return 0;
}
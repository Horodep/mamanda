
//var iconv = require('iconv-lite');
// redundant
function OLD_database_stuff(channel, battleTag, sync) {

	if (sync == true) CreateSync(channel, discord_id, found_member.destinyUserInfo.membershipType, found_member.destinyUserInfo.membershipId, found_member.destinyUserInfo.LastSeenDisplayName);

	if (found_member == null) {
		console.log("Check in Database;");
		pool.getConnection(function (err, connection) {
			if (err) throw err; // not connected!

			var query2 = connection.query('SELECT * FROM members WHERE id = ?', discord_id, function (err, results, fields) {
				if (err) throw err;
				else {
					if (results.length > 0) {
						results.forEach(function (line) {
							if (line.membershipId == null) channel.send('Пользователь не найден.');
							else roles(channel, line.membershipType, line.membershipId, d_member.displayName, null);
						});
					} else {
						channel.send('Пользователь не найден.');
					}
					connection.release();
				}
			});
		});
	} else {
		console.log(found_member.destinyUserInfo.LastSeenDisplayName);
		if (sync == true) CreateSync(channel, discord_id, found_member.destinyUserInfo.membershipType, found_member.destinyUserInfo.membershipId, found_member.destinyUserInfo.LastSeenDisplayName);
		roles(channel, found_member.destinyUserInfo.membershipType, found_member.destinyUserInfo.membershipId, found_member.destinyUserInfo.LastSeenDisplayName, "3858144");
	}
}
// needs refactoring
function OLD_CreateSync(channel, discord_id, membershipType, membershipId, LastSeenDisplayName) {
	pool.getConnection(function (err, connection) {
		if (err) throw err; // not connected!

		var enc_buf = iconv.encode(LastSeenDisplayName, 'cp1251')[0] == 0x3f ?
			iconv.encode(LastSeenDisplayName, 'cp1253') :
			iconv.encode(LastSeenDisplayName, 'cp1251');

		var query = connection.query('UPDATE members SET membershipType=?, membershipId=?, name=? WHERE id = ?',
			[membershipType,
				membershipId,
				enc_buf,
				discord_id],
			function (err, result) {
				if (err) throw err;
				else {
					console.log(new Date() + " Free: " + pool._freeConnections.length + "; " + LastSeenDisplayName + " synched");
					connection.release();

					pool.getConnection(function (err, connection) {
						if (err) throw err; // not connected!
						var query2 = connection.query('SELECT * FROM members WHERE id = ?', discord_id, function (err, results, fields) {
							if (err) throw err;
							else {
								results.forEach(function (line) {
									var buffer = Buffer.from(line.name, 'binary');
									console.log(line);
									var i = buffer.indexOf(0x00);
									channel.send("name: " + iconv.decode(buffer, line.membershipId == '4611686018484533589' ? 'cp1253' : 'cp1251').toString().slice(0, i) + "\n" +
										"bungie: " + line.membershipType + "/" + line.membershipId + "\n" +
										"discord: <@" + line.id + ">");
								});



								connection.release();
							}
						});
					});
				}
			});
	});
}
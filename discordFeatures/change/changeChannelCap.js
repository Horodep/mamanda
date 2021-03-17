import config from "../../config.json";

export function ChangeChannelCap(message, limit) {
	if (message.member.voice.channel == null)
		throw 'Вы не в голосовом канале.';
	if (message.member.voice.channel.parent.id == config.categories.limited)
		throw 'Вы не можете изменить размер данной комнаты.';
	if (limit > -1 && limit < 100) {
		message.member.voice.channel.setUserLimit(limit);
	} else {
		throw 'Введено некорректное значение.';
	}
}

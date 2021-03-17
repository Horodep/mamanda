import fs from "fs";
import { FetchFullPath } from "../../directories.js";


export function ChangeMaxTriumphsScore(message, args) {
	if (args.length < 2)
		throw "Укажите значение.";
	var score = Number(args[1]);
	if (Number.isNaN(score))
		throw "Введенное значение не является числом.";
	fs.writeFileSync(FetchFullPath(".data/maxtriumphs.json"), score.toString());
}

import { Command } from "./command.js";
import config from "../config.json";

import { NewAuthToken } from "../http/httpCore.js"

class DeveloperCommand extends Command {
    Run(args, message) {
        if (message.author.id != config.users.developer) return;
        Command.prototype.SaveRun.call(this, args, message);
    }
}

export function GetDeveloperCommandsArray() {
    const on = 0;
    const wip = 1;
    const off = 2;
    var array = [];

    array.push(new DeveloperCommand("!test", wip, false, "тестовая команда;", async function (args, message) {
        console.log("test"); // empty for any test code
    }));
    array.push(new DeveloperCommand("!ping", on, false, "testing functionality", async function (args, message) {
        message.channel.send('pong');
    }));
    array.push(new DeveloperCommand("!oauth2", on, false, "выслать команду авторизации;", async function (args, message) {
        message.channel.send(`https://www.bungie.net/ru/OAuth/Authorize?response_type=code&client_id=${config.credentials.client_id}&state=12345`);
    }));
    array.push(new DeveloperCommand("!code", on, false, "сохранить код авторизации;", async function (args, message) {
        NewAuthToken(args[1]);
    }));

    return array;
}
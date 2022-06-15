import config from "./config.json" assert {type: "json"};
import nodePackage from "./package.json" assert {type: "json"};
import { execSync } from "child_process";
import { MessageEmbed } from "discord.js";
import { AsyncGetGlobalAlerts } from "./http/bungieApi.js";
import { GetAuthorisationStatus } from "./http/httpCore.js";
import { GetDeveloperCommandsArray } from "./commands/developerCommand.js";
import { GetRestrictedCommandsArray } from "./commands/restrictedCommand.js";
import { GetGuildmasterCommandsArray } from "./commands/guildmasterCommand.js";

export class CommandManager {
    static commandList = [];

    static FindCommand(commandName) {
        var foundCommands = this.commandList.filter(c => c.name === commandName && c.callback != null);
        return foundCommands.length > 0 ? foundCommands[0] : null;
    }

    static GetEmojiStatus(command, apiAlerts) {
        switch (command.status) {
            case 0:
                if (command.apiDependency == true && apiAlerts.ErrorCode != 1) return ":warning:";
                return "<:yes:769922757592612874>";
            case 1:
                return "<:reload:781107772224962561>";
            default:
                return "<:no:769922772549632031>";
        }
    }
    static AddFieldsWithCommands(embed, title, constructorName, apiAlerts) {
        var commands = this.commandList
            .filter(c => c.constructor.name == constructorName && c.name != "" && c.callback != null)
            .map(c => this.GetEmojiStatus(c, apiAlerts) + " " + c.name);
        embed.addField(title, commands.filter((_, i) => i < commands.length / 3).join("\n"), true)
        embed.addField('\u200B', commands.filter((_, i) => i < 2 * commands.length / 3 && i >= commands.length / 3).join("\n"), true)
        embed.addField('\u200B', commands.filter((_, i) => i >= 2 * commands.length / 3).join("\n"), true)
    }
    static async GetStatus(isGuildmaster) {
        var apiAlerts = await AsyncGetGlobalAlerts();
        const gitLogRequest = "git log $(git describe --abbrev=0 --tags $(git describe --abbrev=0)^)..HEAD --oneline --format='%s'";
        const gitSaveLogRequest = process.platform == "win32" ? "git log -n5 --oneline --format='%s'" : gitLogRequest;
        var gitLog = execSync(gitSaveLogRequest).toString();
        var uptime = process.uptime()

        var embed = new MessageEmbed()
            .setAuthor({ name: nodePackage.name + " v" + nodePackage.version })
            .setColor(0x11de1b)//0x00AE86
            .setDescription("[баг-трекер](https://github.com/Horodep/mamanda/issues)")
            .addField("Authorisation status", GetAuthorisationStatus(), true)
            .addField("Uptime", Math.floor(uptime / 86400) + ' days ' + Math.floor((uptime / 3600) % 24) + ' hours', true)
            .addField("Git log", "```" + gitLog.replace(/'/g, '') + "```")

        this.AddFieldsWithCommands(embed, "Command list", "RestrictedCommand", apiAlerts);
        if (isGuildmaster) this.AddFieldsWithCommands(embed, "Guildmaster", "GuildmasterCommand", apiAlerts);

        return { embeds: [embed] };
    }

    static GetRestrictedHelp() {
        return this.GetHelp("Horobot :: Список доступных команд:", 'RestrictedCommand');
    }
    static GetGuildMasterHelp() {
        return this.GetHelp("Horobot :: Список ГМ-ских команд:", 'GuildmasterCommand');
    }
    static GetHelp(title, constructorName) {
        var embed = new MessageEmbed()
            .setAuthor({ name: title })
            .setDescription("[Issues tracker](https://github.com/Horodep/mamanda/issues)")
            .setColor(0x00AE86)
            .setThumbnail('https://images-ext-1.discordapp.net/external/veZptUu_KDKmwtUJX5QT3QxESYCaRp4_k0XUwEQxubo/https/i.imgur.com/e9DIB8e.png')
            .setFooter({ text: 'Horobot', iconURL: 'https://cdn.discordapp.com/avatars/564870880853753857/127385781e26e7dcfdbe312de1843ddf.png' })
            .setTimestamp()
        this.commandList
            .filter(c => (c.constructor.name === constructorName && c.status == 0 && c.description != ''))
            .sort((a, b) => a.name > b.name ? 1 : -1)
            .forEach(command => {
                embed.addField(command.usage, command.description);
            });
        return { embeds: [embed] };
    }

    static Init() {
        Array.prototype.push.apply(this.commandList, GetDeveloperCommandsArray());
        Array.prototype.push.apply(this.commandList, GetRestrictedCommandsArray());
        Array.prototype.push.apply(this.commandList, GetGuildmasterCommandsArray());
    }
}
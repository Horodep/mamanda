export class RaidData {
    header;
    description;
    descriptionWithoutRoleTag;
    fields = [];
    left;
    numberOfPlaces;
    roleTag;
    footerText;
    iconURL;

    constructor(object) {
        this.header = object.header;
        this.description = object.description;
        this.descriptionWithoutRoleTag = object.descriptionWithoutRoleTag;
        this.fields = object.fields;
        this.left = object.left;
        this.numberOfPlaces = object.numberOfPlaces;
        this.roleTag = object.roleTag;
        this.footerText = object.footerText;
        this.iconURL = object.iconURL;
    }

    AddRaidMember(userId) {
        if (this.fields[0].includes(userId) || this.fields[1].includes(userId))
            return;
        if (this.fields[0].includes("слот свободен")) {
            this.fields[0] = this.fields[0].replace("слот свободен", "<@" + userId + ">");
        } else if (this.fields[1].includes("слот свободен")) {
            this.fields[1] = this.fields[1].replace("слот свободен", "<@" + userId + ">");
        }
    }

    RemoveRaidMember(userId) {
        this.fields[0] = this.fields[0].replace("<@" + userId + ">", "слот свободен");
        this.fields[1] = this.fields[1].replace("<@" + userId + ">", "слот свободен");
    }

    RemoveFromLeftField(userId) {
        var regexpUserId = new RegExp("\`.*?\` <@" + userId + ">");
        this.left = this.left.replace(regexpUserId, '').replace('\n\n', '\n');
    }

    AddToLeftField(userId) {
        if (this.left.includes(userId))
            return;
        var tzoffset = (new Date()).getTimezoneOffset() * 60000;
        var leaver = "\n`" + (new Date(Date.now() - tzoffset)).toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(5, 16) + "` <@" + userId + ">";
        this.left += leaver;
    }

    GetUserIdByPosition(position) {
        var linesInFirstField = (this.fields[0].match(/\n/g) || []).length + 1;
        var line = "";
        if (position > linesInFirstField) {
            line = this.fields[1].split('\n')[position - linesInFirstField - 1];
        } else {
            line = this.fields[0].split('\n')[position - 1];
        }
        return line.replace(/\D/g, '');
    }
}

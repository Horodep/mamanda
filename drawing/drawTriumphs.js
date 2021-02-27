import jimp from "jimp";
import fs from "fs";
import { FetchFullPath } from "../directories.js";
import { AsyncDrawText, AsyncDrawWhiteRectangle } from "./drawing.js";

export async function AsyncDrawTriumphs(members, channel) {
    var top = members
        .sort((a, b) => (a.activeScore > b.activeScore ? -1 : 1))
        .filter((_, i) => i < 15);
    var min = top[top.length - 1].activeScore - 100;
    var maxtriumphs = fs.readFileSync(FetchFullPath(".data/maxtriumphs.json"), 'utf8');
    var delta = maxtriumphs - min;

    var image = await jimp.read(FetchFullPath(".data/templates/bg.png"));
    for (var i = 0; i < top.length; i++) {
        await AsyncDrawText(image, 10, 20 + 17 * i - 5, FetchFullPath('.data/fonts/calibri_light_22.fnt'), top[i].displayName);
        await AsyncDrawText(image, 130, 20 + 17 * i - 5, FetchFullPath('.data/fonts/calibri_light_22.fnt'), top[i].activeScore);
        await AsyncDrawWhiteRectangle(image, 185, 20 + (12 + 5) * i, ((top[i].activeScore - min) * 170) / delta, 12);
    }

    image.write(FetchFullPath('.data/images/toptriumphs.png'));
    channel.send("", { files: [FetchFullPath('.data/images/toptriumphs.png')] });
}

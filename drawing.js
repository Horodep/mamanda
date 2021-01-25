//TODO@Horodep #34 reading json triumphs with import do not work
import maxtriumphs from "./.data/maxtriumphs.json";
import config from "./config.json";
import jimp from "jimp";
import fs from "fs";
import fetch from "node-fetch";
import { CatchError } from "./catcherror.js";
import { AsyncGetXurData } from "./bungieApi.js";
import { ManifestManager } from "./manifest.js";
import { AsyncRefreshAuthToken } from "./httpCore.js";
import { FetchFullPath } from "./directories.js";

export async function AsyncDrawTriumphs(members, channel) {
    try /*need to check if needed*/{
        var top = members
            .sort((a, b) => (a.activeScore > b.activeScore ? -1 : 1))
            .filter((_, i) => i < 15);
        var min = top[top.length - 1].activeScore - 100;
        var delta = maxtriumphs - min;

        var image = await jimp.read(FetchFullPath(".data/templates/bg.png"));
        for (var i = 0; i < top.length; i++) {
            await AsyncDrawText(image, 10, 20 + 17 * i - 5, FetchFullPath('.data/fonts/calibri_light_22.fnt'), top[i].displayName);
            await AsyncDrawText(image, 130, 20 + 17 * i - 5, FetchFullPath('.data/fonts/calibri_light_22.fnt'), top[i].activeScore);
            await AsyncDrawWhiteRectangle(image, 185, 20 + (12 + 5) * i, ((top[i].activeScore - min) * 170) / delta, 12);
        }

        image.write(FetchFullPath('.data/images/toptriumphs.png'));
        channel.send("", { files: [FetchFullPath('.data/images/toptriumphs.png')] });
    } catch (e) {
        CatchError(e);
    }
}

export async function AsyncDrawXur(channel) {
    try /*need to check if needed*/{
        await AsyncRefreshAuthToken();
        var data = await AsyncGetXurData();
        var sales = data.Response.sales.data;
        var allStats = data.Response.itemComponents.stats.data;
        var vendorItemIndexes = Object.keys(allStats);

        const box_coords = [
            { x: 280, y: 126 },
            { x: 10, y: 10 },
            { x: 10, y: 126 },
            { x: 280, y: 10 }
        ];

        const statHashes = [
            2996146975,
            392767087,
            1943323491,
            1735777505,
            144602215,
            4244567218
        ];

        const left_margin = 130;
        const line_height = 12;
        const line_spacing = 5;

        var image = await jimp.read(FetchFullPath('.data/templates/xur.png'));
        for (var i = 0; i < vendorItemIndexes.length; i++) {
            var vendorItemIndex = vendorItemIndexes[i];
            var stats = allStats[vendorItemIndex].stats;
            var item = sales[vendorItemIndex];
            var itemImageUrl = ManifestManager.GetItemData(item.itemHash)?.icon;
            var itemImage = await AsyncCacheOrGetImage(item.itemHash, itemImageUrl);

            await AsyncDrawImage(image, box_coords[i].x, box_coords[i].y, 0, itemImage);

            if (!stats[statHashes[0]]) continue;
            for (var k = 0; k < 6; k++) {
                var stat = stats[statHashes[k]].value;

                var left = box_coords[i].x + left_margin;
                var top = box_coords[i].y + (line_height + line_spacing) * k;
                var space = stat < 10 ? 9 : 0;

                await AsyncDrawText(image, left - 24 + space, top - 5,
                    FetchFullPath('.data/fonts/calibri_light_22.fnt'), stat);
                await AsyncDrawWhiteRectangle(image,
                    left, top, 4 * stat, line_height);
            }
            await AsyncDrawText(image,
                box_coords[i].x + 235,
                box_coords[i].y + (line_height + line_spacing) * 5 - 5,
                FetchFullPath('.data/fonts/calibri_light_22.fnt'),
                statHashes.map(s => stats[s].value).reduce((a, b) => a + b, 0));

        }
        image.write(FetchFullPath('.data/images/xur_filled.png'));
        channel.send("Зур приехал", { files: [FetchFullPath('.data/images/xur_filled.png')] });
    } catch (e) {
        CatchError(e);
    }
}

async function AsyncCacheOrGetImage(hash, img_url) {
    var filename = '.data/images/' + hash + '.png';

    if (fs.existsSync(FetchFullPath(filename))){
        return (await jimp.read(FetchFullPath(filename)));
    }else{
        var url = 'https://www.bungie.net' + img_url;
        var response = await fetch(url);
        var buffer = await response.buffer();
        fs.writeFile(FetchFullPath(filename), buffer, () => {});
        return jimp.read(buffer);
    }
}

async function AsyncDrawImage(mainImage, x, y, resize, image) {
    if (resize != 0) await image.resize(resize, jimp.AUTO)
    await mainImage.composite(image, x, y);
}

async function AsyncDrawText(mainImage, x, y, font_url, text) {
    var font = await jimp.loadFont(font_url)
    await mainImage.print(font, x, y, text);
}

async function AsyncDrawWhiteRectangle(mainImage, x, y, width, height) {
    var filename = FetchFullPath('.data/templates/white.png');
    var whiteImage = await jimp.read(filename);
    whiteImage.resize(width, height);
    mainImage.composite(whiteImage, x, y);
}
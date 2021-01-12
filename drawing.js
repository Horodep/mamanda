import maxtriumphs from "./.data/maxtriumphs.json"; //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
import config from "./config.json";
import jimp from "jimp";
import fs from "fs";
import fetch from "node-fetch";
import { CatchError } from "./catcherror.js";
import { GetXur } from "./bungieApi.js";
import { ManifestManager } from "./manifest.js";
import { RefreshAuthToken } from "./httpCore.js";

export async function DrawTriumphs(members, channel) {
    try {
        var directory = config.credentials.directory ?? "./";
        var top = members
            .sort((a, b) => (a.activeScore > b.activeScore ? -1 : 1))
            .filter((_, i) => i < 15);
        var min = top[top.length - 1].activeScore - 100;
        var delta = maxtriumphs - min;

        var image = await jimp.read(directory + '.data/templates/bg.png');
        for (var i = 0; i < top.length; i++) {
            await DrawText(image, 10, 20 + 17 * i - 5, directory + '.data/fonts/calibri_light_22.fnt', top[i].displayName);
            await DrawText(image, 130, 20 + 17 * i - 5, directory + '.data/fonts/calibri_light_22.fnt', top[i].activeScore);
            await DrawWhiteRectangle(image, 185, 20 + (12 + 5) * i, ((top[i].activeScore - min) * 170) / delta, 12);
        }

        image.write(directory + '.data/images/toptriumphs.png');
        channel.send("", { files: [directory + '.data/images/toptriumphs.png'] });
    } catch (e) {
        CatchError(e);
    }
}

export async function Xur(channel) {
    try {
        await RefreshAuthToken();
        var directory = config.credentials.directory ?? "./";
        // 1. refresh manifest
        var data = await GetXur();
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

        var image = await jimp.read(directory + '.data/templates/xur.png');
        for (var i = 0; i < vendorItemIndexes.length; i++) {
            var vendorItemIndex = vendorItemIndexes[i];
            var stats = allStats[vendorItemIndex].stats;
            var item = sales[vendorItemIndex];
            var itemImageUrl = ManifestManager.GetItemData(item.itemHash)?.icon;
            var itemImage = await CacheOrGetImage(item.itemHash, itemImageUrl);

            await DrawImage(image, box_coords[i].x, box_coords[i].y, 0, itemImage);

            if (!stats[statHashes[0]]) continue;
            for (var k = 0; k < 6; k++) {
                var stat = stats[statHashes[k]].value;

                var left = box_coords[i].x + left_margin;
                var top = box_coords[i].y + (line_height + line_spacing) * k;
                var space = stat < 10 ? 9 : 0;

                await DrawText(image, left - 24 + space, top - 5,
                    directory + '.data/fonts/calibri_light_22.fnt', stat);
                await DrawWhiteRectangle(image,
                    left, top, 4 * stat, line_height);
            }
            await DrawText(image,
                box_coords[i].x + 235,
                box_coords[i].y + (line_height + line_spacing) * 5 - 5,
                directory + '.data/fonts/calibri_light_22.fnt',
                statHashes.map(s => stats[s].value).reduce((a, b) => a + b, 0));

        }
        image.write(directory + '.data/images/xur_filled.png');
        channel.send("Зур приехал", { files: [directory + '.data/images/xur_filled.png'] });
    } catch (e) {
        CatchError(e);
    }
}

async function CacheOrGetImage(hash, img_url) {
    var directory = config.credentials.directory ?? "./";
    var filename = '.data/images/' + hash + '.png';

    if (fs.existsSync(directory + filename)){
        return (await jimp.read(directory + filename));
    }else{
        var url = 'https://www.bungie.net' + img_url;
        var response = await fetch(url);
        var buffer = await response.buffer();
        fs.writeFile(directory + filename, buffer, () => {});
        return jimp.read(buffer);
    }
}

async function DrawImage(mainImage, x, y, resize, image) {
    if (resize != 0) await image.resize(resize, jimp.AUTO)
    await mainImage.composite(image, x, y);
}

async function DrawText(mainImage, x, y, font_url, text) {
    var font = await jimp.loadFont(font_url)
    await mainImage.print(font, x, y, text);
}

async function DrawWhiteRectangle(mainImage, x, y, width, height) {
    var directory = config.credentials.directory ?? "./";
    var filename = directory + '.data/templates/white.png';
    var whiteImage = await jimp.read(filename);
    await whiteImage.resize(width, height);
    mainImage.composite(whiteImage, x, y);
}


/*
function xur(channel) {
    messageSent = false;
    var loadedImage;
    toload = 0;
    loaded = 0;
    let rawdata = fs.readFileSync('destiny2.json');
    let manifest = JSON.parse(rawdata);

    var endpoint = "https://www.bungie.net/Platform/Destiny2/3/Profile/4611686018484533589/Character/2305843009409595202/Vendors/?components=400,402,300,301,302,304,305,306,307,308,600";

    var fileName = 'xur.png';
    jimp.read(fileName)
        .then(function (image) {
            loadedImage = image;
        })

    var second = new XMLHttpRequest();
    second.open("GET", endpoint, true);
    second.setRequestHeader("Authorization", "Bearer " + tokenObject["access_token"]);
    second.setRequestHeader("X-API-Key", d2apiKey);
    second.onreadystatechange = async function () {
        if (this.readyState === 4 && this.status === 200) {
            var json2 = JSON.parse(this.responseText);

            if (typeof (json2.Response) == 'undefined') {
                if (channel != null) channel.send('ШТО.');
                else boss.send('ШТО.');
            } else {
                var vendors = json2.Response.vendors.data;
                var sales = json2.Response.sales.data;
                var itemComponents = json2.Response.itemComponents;

                Object.keys(sales).forEach(function (saleHash) {
                    if (saleHash == 2190858386) {
                        var i = 0;
                        coords = [{ x: 280, y: 126 },
                        { x: 10, y: 10 },
                        { x: 10, y: 126 },
                        { x: 280, y: 10 }];

                        var saleItems = sales[saleHash].saleItems;

                        Object.keys(saleItems).forEach(function (saleItemsHash) {
                            if (saleItems[saleItemsHash].costs.length > 0) {
                                console.log("    " + "==========");
                                console.log("    " +
                                    manifest.InventoryItem[saleItems[saleItemsHash].itemHash].displayProperties.name +
                                    " " + saleItems[saleItemsHash].itemHash);

                                var col = 0;
                                var stats = itemComponents[2190858386].stats.data[saleItems[saleItemsHash].vendorItemIndex].stats;

                                if (stats[2996146975] != null) {
                                    var armor_stat = [];
                                    armor_stat[0] = stats[2996146975].value; //mobility
                                    armor_stat[1] = stats[392767087].value;  //resilience
                                    armor_stat[2] = stats[1943323491].value; //recovery
                                    armor_stat[3] = stats[1735777505].value; //discipline
                                    armor_stat[4] = stats[144602215].value;  //intellect
                                    armor_stat[5] = stats[4244567218].value; //strength

                                    var left = 130;
                                    var height = 12;
                                    var margin = 5;

                                    for (var k = 0; k < 6; k++) {
                                        DrawRectangle(channel,
                                            coords[i].x + left, coords[i].y + (height + margin) * k,
                                            loadedImage, 4 * armor_stat[k], height,
                                            "Зур приехал", "export.png");
                                        DrawText('fonts/calibri_light_22.fnt',
                                            channel,
                                            coords[i].x + left - 24, coords[i].y + (height + margin) * k - 5,
                                            loadedImage, (armor_stat[k] < 10 ? "  " + armor_stat[k] : armor_stat[k]),
                                            "Зур приехал", "export.png");
                                    }
                                    DrawText('fonts/calibri_light_22.fnt',
                                        channel,
                                        coords[i].x + 235, coords[i].y + (height + margin) * 5 - 5,
                                        loadedImage, armor_stat.reduce((a, b) => a + b, 0),
                                        "Зур приехал", "export.png");
                                }
                                saveImageToDisk(
                                    manifest.InventoryItem[saleItems[saleItemsHash].itemHash].displayProperties.icon,
                                    saleItems[saleItemsHash].itemHash,
                                    channel,
                                    coords[i].x,
                                    coords[i].y,
                                    loadedImage,
                                    0,
                                    "Зур приехал",
                                    "export.png");
                                i++;
                            }
                        });
                    }
                });

            }
        }
    }
    second.send();
}*/
import maxtriumphs from "./.data/maxtriumphs.json";
import jimp from "jimp";
import fs from "fs";
import { CatchError } from "./catcherror.js";

export async function DrawTriumphs(members, channel){
    try{
        var top = members
            .sort((a, b) => (a.activeScore > b.activeScore ? -1 : 1))
            .filter((_, i) => i < 15);
        var min = top[top.length - 1].activeScore - 100;
        var delta = maxtriumphs-min;

        var image = await jimp.read('.data/templates/bg.png');
        for (var i = 0; i < top.length; i++) {
            image = await DrawText(image, 10, 20 + 17*i-5, '.data/fonts/calibri_light_22.fnt', top[i].displayName);
            image = await DrawText(image, 130, 20 + 17*i-5, '.data/fonts/calibri_light_22.fnt', top[i].activeScore);
            image = await DrawWhiteRectangle(image, 185, 20 + (12+5)*i, ((top[i].activeScore-min)*170)/delta, 12);
        }

        image.write('.data/images/toptriumphs.png');
        channel.send("", {files: ['.data/images/toptriumphs.png']});
    }catch(e){
        CatchError(e);
    }
}

function WIP_CacheImageToDisk(mainImage, x, y, resize, url, hash) {
    var fullUrl = 'https://www.bungie.net' + url;
    var filename = '/.data/images/' + hash + '.png';
    var images = {};

    toload++;
    request.head(fullUrl, function (err, res, body) {
        request(fullUrl).pipe(fs.createWriteStream(filename))
            .on('close', function () {
                jimp.read(filename)
                    .then(function (image) {
                        images[hash] = image;
                        if (resize != 0) images[hash].resize(resize, jimp.AUTO);
                    })
                    .then(function (image) {
                        mainImage.composite(images[hash], x, y)
                    })
                    .then(() => mainImage)
            });
    });
}

async function DrawText(mainImage, x, y, font_url, text) {
    return jimp
        .loadFont(font_url)
        .then((font) => { mainImage.print(font, x, y, text); })
        .then(() => mainImage)
}

async function DrawWhiteRectangle(mainImage, x, y, width, height) {
    var filename = './.data/templates/white.png';
    var whiteImage;
    return jimp
        .read(filename)
        .then(function (image) {
            whiteImage = image;
            whiteImage.resize(width, height);
        })
        .then(function (image) {
            mainImage.composite(whiteImage, x, y)
        })
        .then(() => mainImage)
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
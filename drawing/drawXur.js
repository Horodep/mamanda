import jimp from "jimp";
import { AsyncGetXurData } from "../http/bungieApi.js";
import { ManifestManager } from "../manifest.js";
import { AsyncRefreshAuthToken } from "../http/httpCore.js";
import { FetchFullPath } from "../directories.js";
import { AsyncCacheOrGetImage, AsyncDrawImage, AsyncDrawText, AsyncDrawWhiteRectangle } from "./drawing.js";

export async function AsyncDrawXur(channel) {
    await AsyncRefreshAuthToken();
    var data = await AsyncGetXurData();
    var sales = data.Response.sales.data;
    var allStats = data.Response.itemComponents.stats.data;
    var vendorItemIndexes = Object.keys(allStats);

    if (vendorItemIndexes.length == 0)
        throw "Зур еще не приехал.";

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

        if (!stats[statHashes[0]])
            continue;
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
}

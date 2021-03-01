import jimp from "jimp";
import config from "../config.json";
import { AsyncGetEververseData, AsyncGetProfileData } from "../http/bungieApi.js";
import { ManifestManager } from "../manifest.js";
import { AsyncRefreshAuthToken } from "../http/httpCore.js";
import { FetchFullPath } from "../directories.js";
import { AsyncCacheOrGetImage, AsyncDrawImage, AsyncDrawText, AsyncDrawWhiteRectangle } from "./drawing.js";

const DUST_HASH = 2817410917;
const SILVER_HASH = 3147280338;
const IGNORED_HASHES = [353932628, 2638689062, 3187955025];
const WEAPON_ORNAMENT = 3124752623;

const SALES_PER_LINE = 6;

const TOTAL_WIDTH = 400;
const ITEM_WIDTH = 48;
const OUTER_PADDING = 21;
const TOP_PADDING = 3;
const HORIZONTAL_SPACING = 14;
const VERTICAL_SPACING = 28;

export async function AsyncDrawEververse(channel) {
    var { armor_sales, common_sales } = await AsyncGetEververseAssortment();

    var image = await jimp.read(FetchFullPath('.data/templates/bg_max.png'));

    var lineNumber = 0;
    for (lineNumber = 0; lineNumber * SALES_PER_LINE < common_sales.length; lineNumber++) {
        await AsyncDrawSalesLine(common_sales, image, lineNumber);
    }
    var sectionPadding = (ITEM_WIDTH + VERTICAL_SPACING) * lineNumber;
    await AsyncDrawSalesLine(armor_sales, image, 0, sectionPadding);

    image.write(FetchFullPath('.data/images/eververse_filled.png'));
    channel.send({ files: [FetchFullPath('.data/images/eververse_filled.png')] });
}

async function AsyncDrawSalesLine(array, image, lineNumber, topPadding) {
    var extraLeftPadding = GetExtraLeftPadding(array, lineNumber);
    for (var j = 0; j < SALES_PER_LINE; j++) {
        var index = lineNumber * SALES_PER_LINE + j;
        if (index >= array.length) break;

        var x = extraLeftPadding + OUTER_PADDING + (ITEM_WIDTH + HORIZONTAL_SPACING) * j;
        var y = (topPadding ?? 0) + TOP_PADDING + (ITEM_WIDTH + VERTICAL_SPACING) * lineNumber;
        await AsyncDrawSalesPosition(array[index], image, x, y);
    }
}

function GetExtraLeftPadding(common, lineNumber) {
    var countOfItemsToPrint = common.length - lineNumber * SALES_PER_LINE;
    return countOfItemsToPrint < SALES_PER_LINE ?
        (TOTAL_WIDTH - 2 * OUTER_PADDING - countOfItemsToPrint * ITEM_WIDTH - (countOfItemsToPrint - 1) * HORIZONTAL_SPACING) / 2 :
        0;
}

async function AsyncDrawSalesPosition(item, image, x, y) {
    var itemImageUrl = item.manifestData.displayProperties.icon;
    var itemImage = await AsyncCacheOrGetImage(item.itemHash, itemImageUrl);
    var price = item.costs[0].quantity;
    console.log(
        item.costs[0].quantity + " - " +
        item.manifestData.itemTypeAndTierDisplayName + ": " +
        item.manifestData.displayProperties.name);

    await AsyncDrawImage(image, x, y, ITEM_WIDTH, itemImage);
    await AsyncDrawText(image,
        x + (ITEM_WIDTH / 2) - (9 * price.toString().length / 2),
        y + (ITEM_WIDTH + 1),
        FetchFullPath('.data/fonts/calibri_light_22.fnt'), price);
}

async function AsyncGetEververseAssortment() {
    var sales = [];
    await AsyncRefreshAuthToken();
    var profile = await AsyncGetProfileData(config.credentials.game_defaults.membershipType, config.credentials.game_defaults.membershipId);
    var promises = profile.data.characterIds.map(async characterId => {
        var data = await AsyncGetEververseData(characterId);
        Array.prototype.push.apply(sales, Object.values(data.Response.sales.data));
    });
    await Promise.all(promises);
    
    var dust_only = sales.filter(i => i.costs[0]?.itemHash == DUST_HASH || i.costs[1]?.itemHash == DUST_HASH);
    var filtered_dust_sales = dust_only.filter((item, index) => dust_only.findIndex(i => i.itemHash === item.itemHash) === index)
        .filter(i => !IGNORED_HASHES.includes(i.itemHash))
        .sort((a, b) => a.costs[0].quantity - b.costs[0].quantity);
    var manifested_sales = filtered_dust_sales.map((e) => {
        e.manifestData = ManifestManager.GetItemData(e.itemHash, true);
        return e;
    });
    var common_sales = manifested_sales.filter(i => !i.manifestData.itemTypeDisplayName.includes("Ornament") || i.manifestData.itemCategoryHashes.includes(WEAPON_ORNAMENT));
    var armor_sales = manifested_sales.filter(i => i.manifestData.itemTypeDisplayName.includes("Ornament") && !i.manifestData.itemCategoryHashes.includes(WEAPON_ORNAMENT));
    return { armor_sales, common_sales };
}
import jimp from "jimp";
import { AsyncGetEververseData } from "../http/bungieApi.js";
import { ManifestManager } from "../manifest.js";
import { AsyncRefreshAuthToken } from "../http/httpCore.js";
import { FetchFullPath } from "../directories.js";
import { AsyncCacheOrGetImage, AsyncDrawImage, AsyncDrawText, AsyncDrawWhiteRectangle } from "./drawing.js";

const DUST_HASH = 2817410917;
const SILVER_HASH = 3147280338;
const IGNORED_HASHES = [353932628, 2638689062, 3187955025];
const WEAPON_ORNAMENT = 3124752623;
const WARLOCK = 3684181176;

export async function AsyncDrawEververse(channel) {
    await AsyncRefreshAuthToken();
    var data = await AsyncGetEververseData();
    var sales = data.Response.sales.data;
    var dust = Object.values(sales)
        .filter(e => e.costs[0]?.itemHash == DUST_HASH)
        .filter(e => !IGNORED_HASHES.includes(e.itemHash))
        .sort((a, b) => a.costs[0].quantity - b.costs[0].quantity);
    var items = dust.map((e) => {
            e.manifestData = ManifestManager.GetItemData(e.itemHash, true);
            return e;
        })
    var common = items.filter(i => !i.manifestData.itemTypeDisplayName.includes("Ornament") || i.manifestData.itemCategoryHashes.includes(WEAPON_ORNAMENT));
    var armor = items.filter(i => i.manifestData.itemTypeDisplayName.includes("Ornament") && !i.manifestData.itemCategoryHashes.includes(WEAPON_ORNAMENT));
    
    console.log(common.map(i => i.costs[0].quantity + " - " + i.manifestData.itemTypeAndTierDisplayName + ": " + i.manifestData.displayProperties.name).join('\n'));
    console.log(armor.map(i => i.costs[0].quantity + " - " + i.manifestData.itemTypeAndTierDisplayName + ": " + i.manifestData.displayProperties.name).join('\n'));
}
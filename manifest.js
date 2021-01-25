import AdmZip from "adm-zip";
import fs from "fs";
import https from "https";
import config from "./config.json";

export class ManifestManager {
    static manifest = null;

    static Refresh() {
        var uri = "https://www.d2checklist.com/assets/destiny2.zip";
        var filename = 'manifest.zip';

        const file = fs.createWriteStream(`./.data/${filename}`);
        https.get(uri, response => {
            response.pipe(file)
                .on("finish", function () {
                    var zip = new AdmZip(`./.data/${filename}`);
                    zip.extractAllTo("./.data/", /*overwrite*/true);
                    console.log("Manifest refreshed!");
                });
        });
    }

    static Cache() {
        this.manifest = JSON.parse(fs.readFileSync(FetchFullPath('.data/destiny2.json')));
    }

    static CleanCache() {
        this.manifest = null;
    }

    static GetData(doNotClean, callback) {
        if (!ManifestManager.manifest) ManifestManager.Cache();
        var data = callback();
        if (!doNotClean) ManifestManager.CleanCache();
        return data;
    }

    static GetRecordData(hash, doNotClean) {
        return this.GetData(doNotClean, function(){
            return ManifestManager.manifest?.Record[hash]?.displayProperties; // name, icon, description
        });
    }

    static GetItemData(hash, doNotClean) {
        return this.GetData(doNotClean, function(){
            return ManifestManager.manifest?.InventoryItem[hash]?.displayProperties; // name, icon, description
        });
    }

    static GetActivityData(hash, doNotClean) {
        return this.GetData(doNotClean, function(){
            return ManifestManager.manifest?.Activity[hash];
        });
    }

    static GetActivityModifierData(hash, doNotClean) {
        return this.GetData(doNotClean, function(){
            return ManifestManager.manifest?.ActivityModifier[hash];
        });
    }
}


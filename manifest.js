import AdmZip from "adm-zip";
import fs from "fs";
import https from "https";

export class ManifestManager {
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

    static GetRecordData(triumphHash) {
        var manifest = JSON.parse(fs.readFileSync('./.data/destiny2.json'));
        return manifest?.Record[triumphHash]?.displayProperties; // name, icon, description
    }
    static GetItemData(itemHash) {
        var manifest = JSON.parse(fs.readFileSync('./.data/destiny2.json'));
        return manifest?.InventoryItem[itemHash]?.displayProperties; // name, icon, description
    }
}


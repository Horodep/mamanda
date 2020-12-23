import AdmZip from "adm-zip";
import fs from "fs";
import https from "https";

export class ManifestManager {
    static manifest = {};

    static Refresh() {
        var uri = "https://www.d2checklist.com/assets/destiny2.zip";
        var filename = 'manifest.zip';

        const file = fs.createWriteStream(`./data/${filename}`);
        https.get(uri, response => {
            response.pipe(file)
                .on("finish", function () {
                    console.log("done");
                    var zip = new AdmZip(`./data/${filename}`);
                    zip.extractAllTo("./data/", /*overwrite*/true);
                    let rawdata = fs.readFileSync('./data/destiny2.json');
                    manifest = JSON.parse(rawdata);
                });
        });
    }

    static GetRecordData(triumphId){
        return manifest?.Record[triumphId]?.displayProperties; // name, icon, description
    }
}


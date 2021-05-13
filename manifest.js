import fs from "fs";
import https from "https";
import fetch from "node-fetch";
import { AsyncGetManifestLinks } from "./http/bungieApi.js";
import { FetchFullPath } from "./directories.js";

export class ManifestManager {
    static manifest = null;

    static async Refresh() {
        var apiLinks = await AsyncGetManifestLinks();
        if (apiLinks.ErrorCode != 1) return;
        var urls = apiLinks.Response?.jsonWorldComponentContentPaths.en;
        
        var manifest = {};
        manifest.version = apiLinks.Response?.version;
	    manifest.Record = await fetch(getFullUrl(urls.DestinyRecordDefinition)).then(res => res.json());
	    manifest.InventoryItem = await fetch(getFullUrl(urls.DestinyInventoryItemDefinition)).then(res => res.json());
	    manifest.Activity = await fetch(getFullUrl(urls.DestinyActivityDefinition)).then(res => res.json());
	    manifest.ActivityModifier = await fetch(getFullUrl(urls.DestinyActivityModifierDefinition)).then(res => res.json());
	    manifest.Destination = await fetch(getFullUrl(urls.DestinyDestinationDefinition)).then(res => res.json());

        fs.writeFileSync(FetchFullPath('.data/destiny2.json'), JSON.stringify(manifest));
        console.log("Manifest refreshed!");

        function getFullUrl(url) { return "https://www.bungie.net" + url;}
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
            return ManifestManager.manifest?.Record[hash];
        });
    }

    static GetItemData(hash, doNotClean) {
        return this.GetData(doNotClean, function(){
            return ManifestManager.manifest?.InventoryItem[hash]; // name, icon, description
        });
    }

    static GetActivityData(hash, doNotClean) {
        return this.GetData(doNotClean, function(){
            return ManifestManager.manifest?.Activity[hash];
        });
    }

    static GetDestinationData(hash, doNotClean) {
        return this.GetData(doNotClean, function(){
            return ManifestManager.manifest?.Destination[hash];
        });
    }

    static GetActivityModifierData(hash, doNotClean) {
        return this.GetData(doNotClean, function(){
            return ManifestManager.manifest?.ActivityModifier[hash];
        });
    }
}


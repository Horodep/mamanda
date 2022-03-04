import config from "./config.json" assert {type: "json"};

export function FetchFullPath(localPath){
	var prefix = config.credentials.directory ?? "./";
    return prefix + localPath;
}
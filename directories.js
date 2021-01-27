import config from "./config.json";

export function FetchFullPath(localPath){
	var prefix = config.credentials.directory ?? "./";
    return prefix + localPath;
}
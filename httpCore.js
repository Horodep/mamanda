import fs from "fs";
import { XMLHttpRequest } from "xmlhttprequest";
import config from "./config.json";
import { CatchError } from "./catcherror.js";
import { FetchFullPath } from "./directories.js";

const accessTokenFileName = '.data/access_token.json';

class AccessToken {
    static #tokenObject = null;

    static get token_exists() {
        return this.#tokenObject != null;
    }
    static SetTokenJson(string) {
        this.#tokenObject = JSON.parse(string);
    }
    static get access_token() {
        return this.#tokenObject.access_token;
    }
    static get refresh_token() {
        return this.#tokenObject.refresh_token;
    }
    static ReadFile() {
        this.#tokenObject = JSON.parse(fs.readFileSync(FetchFullPath(accessTokenFileName)));
    }
    static WriteFile() {
        fs.writeFile(FetchFullPath(accessTokenFileName), JSON.stringify(this.#tokenObject), (err) => {
            if (err) CatchError(err);
        });
    }
}

export async function AsyncRequestWithPromise(method, url, setAuth) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader("X-API-Key", config.credentials.d2apiKey);
        if (setAuth == true) xhr.setRequestHeader("Authorization", "Bearer " + AccessToken.access_token);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                try {
                    var responce = JSON.parse(xhr.responseText);

                    if (xhr.status >= 300) {
                        throw Error('BadResponce');
                    } else {
                        if (responce.ErrorCode != 1) throw Error('BadResponce');
                        resolve(responce);
                    }
                } catch (e) {
                    e.url = url;
                    e.response = responce ?? xhr.responseText;
                    reject(e);
                }
            }
        }
        xhr.send();
    });
}

async function AsyncAuthRequestWithPromise(body) {
    return new Promise(function (resolve, reject) {
        var authpost = new XMLHttpRequest();
        authpost.open("POST", "https://www.bungie.net/Platform/App/OAuth/Token/", true);
        authpost.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        authpost.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                AccessToken.SetTokenJson(this.responseText);
                if (AccessToken.token_exists) {
                    AccessToken.WriteFile();
                }
                console.log("TOKEN!");
                resolve(this.responseText);
            } else {
                console.log(`    ${this.readyState} ${this.status} ${this.responseText}`);
            }
        }
        authpost.send(body);
    });
}

export async function AsyncRefreshAuthToken() {
    AccessToken.ReadFile();
    var body = `grant_type=refresh_token&refresh_token=${AccessToken.refresh_token}&client_id=${config.credentials.client_id}&client_secret=${config.credentials.client_secret}`;
    await AsyncAuthRequestWithPromise(body);
}

export function NewAuthToken(code) {
    var body = `grant_type=authorization_code&code=${code}&client_id=${config.credentials.client_id}&client_secret=${config.credentials.client_secret}`;
    AsyncAuthRequestWithPromise(body);
}
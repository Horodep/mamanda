import fs from "fs";
import { XMLHttpRequest } from "xmlhttprequest";
import config from "./config.json";
import { CatchError } from "../catcherror.js";

class AccessToken{
    static #tokenObject = null;

    SetTokenJson(string) {
        tokenObject = JSON.parse(string);
    }
    get access_token() {
        return tokenObject.access_token;
    }
    get refresh_token() {
        return tokenObject.refresh_token;
    }
    ReadFile(fileName){
        tokenObject = JSON.parse(fs.readFileSync(fileName));
    }
    WriteFile(fileName){
        fs.writeFile(fileName, JSON.stringify(tokenObject), (err) => {
            if (err)  CatchError(err);
        });
    }
}

export async function makeRequestWithPromise(method, url, setAuth) {
    return new Promise(function (resolve, reject) {
		let xhr = new XMLHttpRequest();
		xhr.open(method, url, true);
		xhr.setRequestHeader("X-API-Key", config.credentials.d2apiKey);
        if (setAuth == true) xhr.setRequestHeader("Authorization", "Bearer "+AccessToken.access_token);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
			    if (xhr.status >= 300) {
				    reject("Error, status code = " + xhr.status)
			    } else {
                    try{
                        resolve(JSON.parse(xhr.responseText));
                    }catch(e){
                        CatchError(e);
                        reject("Error name = " + e.name)
                    }
			    }
			}
		  }
        xhr.send();
    });
}

export async function refreshAuthToken(){
    AccessToken.ReadFile('access_token.json');

    var body = `grant_type=refresh_token&refresh_token=${AccessToken.refresh_token}&client_id=${config.client_id}&client_secret=${config.client_secret}`;

    var authpost = new XMLHttpRequest();
    authpost.open("POST", "https://www.bungie.net/Platform/App/OAuth/Token/", true);
    authpost.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    authpost.onreadystatechange = function(){
        if(this.readyState === 4 && this.status === 200){
            AccessToken.SetTokenJson(this.responseText);
            if(typeof(AccessToken.access_token) != 'undefined'){
                AccessToken.WriteFile('access_token.json');
            }
            console.log("TOKEN REFRESHED!");
        }else{
            console.log(`    ${this.readyState} ${this.status} ${this.responseText}`);
        }
    }
    authpost.send(body);
}

export function newAuthToken(code){
    var body = `grant_type=authorization_code&code=${code}&client_id=${config.client_id}&client_secret=${config.client_secret}`;

    var authpost = new XMLHttpRequest();
    authpost.open("POST", "https://www.bungie.net/Platform/App/OAuth/Token/", true);
    authpost.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    authpost.onreadystatechange = function(){
        if(this.readyState === 4 && this.status === 200){
            AccessToken.SetTokenJson(this.responseText);
            if(typeof(AccessToken.access_token) != 'undefined'){
                AccessToken.WriteFile('access_token.json');
            }
            console.log("NEW TOKEN!");
        }
    }
    authpost.send(body);
}
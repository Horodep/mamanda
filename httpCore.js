var fs = require('fs');
import config from "./config.json";

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
            if (err)  console.log('error', err);
        });
    }
}

async export function httpRequest(url, setAuth){
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	if (setAuth == true) request.setRequestHeader("Authorization", "Bearer "+AccessToken.access_token);
	request.setRequestHeader("X-API-Key", config.d2apiKey);
	request.onreadystatechange = function(){
		if(this.readyState === 4 && this.status === 200){
			return JSON.parse(this.responseText);
		}
	}
	request.send();
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
            console.log("REFRESHED!");
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
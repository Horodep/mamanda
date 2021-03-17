import fetch from "node-fetch";


export async function AsyncShowResetEnglish(channel) {
	var response = await fetch("http://kyber3000.com/Reset");
	channel.send("Reset by Kyber3000");
	channel.send(response.url);
}

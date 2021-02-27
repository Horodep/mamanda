import jimp from "jimp";
import fs from "fs";
import fetch from "node-fetch";
import { FetchFullPath } from "../directories.js";

export async function AsyncCacheOrGetImage(hash, img_url) {
    var filename = '.data/images/' + hash + '.png';

    if (fs.existsSync(FetchFullPath(filename))){
        return (await jimp.read(FetchFullPath(filename)));
    }else{
        var url = 'https://www.bungie.net' + img_url;
        var response = await fetch(url);
        var buffer = await response.buffer();
        fs.writeFileSync(FetchFullPath(filename), buffer);
        return jimp.read(buffer);
    }
}

export async function AsyncDrawImage(mainImage, x, y, resize, image) {
    if (resize != 0) await image.resize(resize, jimp.AUTO)
    await mainImage.composite(image, x, y);
}

export async function AsyncDrawText(mainImage, x, y, font_url, text) {
    var font = await jimp.loadFont(font_url)
    await mainImage.print(font, x, y, text);
}

export async function AsyncDrawWhiteRectangle(mainImage, x, y, width, height) {
    var filename = FetchFullPath('.data/templates/white.png');
    var whiteImage = await jimp.read(filename);
    whiteImage.resize(width, height);
    mainImage.composite(whiteImage, x, y);
}
import { gotScraping } from "got-scraping";
import { getSmartProxyUrl } from "./proxies.js";
import * as cheerio from "cheerio";
import fs from "graceful-fs";

function base64ToString(base64) {
  return Buffer.from(base64, "base64").toString("utf-8");
}

const decodeData = (encodedData) => {
  if (encodedData.length === 0 || !encodedData[0])
    throw new Error("String empty. Not valid data.");
  const padding = parseInt(encodedData[0], 10);
  const paddedString = `${[...encodedData.slice(1, -3)]
    .reverse()
    .join("")}${"=".repeat(padding)}`;
  return JSON.parse(decodeURIComponent(base64ToString(paddedString)));
};

(async () => {
  const res = await gotScraping({
    // url: "https://beacons.ai/djeastre",
    url: "https://beacons.ai/studygram_dig",
    proxyUrl: getSmartProxyUrl(),
  });
  console.log("res.statusCode", res.statusCode);
  const $ = cheerio.load(res.body);
  // get __IMAGE__ from the page
  const encodededData = $("script#__image__").html();
  const data = decodeData(encodededData);
  console.log(data);
  fs.writeFileSync("test.json", JSON.stringify(data, null, 2));
})();

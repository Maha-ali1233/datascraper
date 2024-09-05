import { gotScraping } from "got-scraping";
import fs from "graceful-fs";
import { getSmartProxyUrl, getStormProxyUrl } from "./proxies.js";
import * as cheerio from "cheerio";

function jsonify(html) {
  const $ = cheerio.load(html);
  const aTags = $("a");
  const json = [];

  aTags.each((i, aTag) => {
    const href = $(aTag).attr("href");
    // get the h3 tag that is the child of this a tag
    const h3 = $(aTag).children("h3");
    const title = h3.text();
    if (!title) return;
    if (!href) return;
    if (title === "More results") return;
    // const url = href.split("/url?q=")[1].split("&sa=U&")[0];
    const link = {
      title,
      url: href,
    };
    json.push(link);
  });
  return json;
}

async function scrapeGoogle(query, page) {
  try {
    let q = query.split(" ").join("+");
    let start = (page - 1) * 10;
    const res = await gotScraping({
      url: `https://www.google.com/search?q=${q}&start=${start}`,
      proxyUrl: getStormProxyUrl(),
    });
    const html = res.body;
    const json = jsonify(html);
    return json;
  } catch (error) {
    console.log("error at getGoogleFirstPage", error.message);
  }
}

(async () => {
  const query = "web scraping";
  let page = 2;
  const results = await scrapeGoogle(query, page);
  console.log(results);
})();

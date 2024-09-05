import { gotScraping } from "got-scraping";
import fs from "graceful-fs";
import * as cheerio from "cheerio";
import { getSmartProxyUrl, getStormProxyUrl } from "./proxies.js";

async function scrapeCyberBackgroundChecks(street, city, state, retries = 0) {
  try {
    const res = await gotScraping({
      // url: `https://www.cyberbackgroundchecks.com/address/504-Sunny-Ln/austin/tx`,
      url: `https://www.cyberbackgroundchecks.com/address/${street
        .split(" ")
        .join("-")}/${city}/${state}`,
      proxyUrl: getSmartProxyUrl(),
    });
    console.log(res.statusCode);

    fs.writeFileSync("test.html", res.body);

    if (res.statusCode !== 200) {
      throw new Error(`Status is ${res.statusCode}`);
    }

    // application/ld+json
    const $ = cheerio.load(res.body);
    // get script tags that have type application/ld+json
    const scripts = $("script[type='application/ld+json']");

    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      const text = $(script).html();
      const json = JSON.parse(text);
      if (json?.[0]?.["@type"] === "Person") {
        return json;
      }
    }
    return null;
  } catch (error) {
    if (retries < 10) {
      return scrapeCyberBackgroundChecks(street, city, state, retries + 1);
    }
    console.log("error at scrapeCyberBackgroundChecks", error.message);
  }
}

(async () => {
  const street = "500 Sunny Ln";
  const city = "austin";
  const state = "tx";
  const data = await scrapeCyberBackgroundChecks(street, city, state);
  console.log(data);
})();

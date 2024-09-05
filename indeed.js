import fetch from "node-fetch";
import fs from "graceful-fs";
import { getSmartProxyUrl } from "./proxies.js";
import { gotScraping } from "got-scraping";
import * as cheerio from "cheerio";

function jsonify(html) {
  const $ = cheerio.load(html);
  // get the script tag with id=mosaic-data
  const script = $("#mosaic-data");
  // split by new line
  const scriptText = script.html().split("\n");
  // get the line that includes mosaic-provider-jobcards
  const mosaicProviderJobcardsLine = scriptText.find((line) =>
    line.includes("mosaic-provider-jobcards")
  );
  // get rid of the semicolon at the end
  const mosaicProviderJobcardsLineText = mosaicProviderJobcardsLine.slice(
    0,
    mosaicProviderJobcardsLine.length - 1
  );
  // replace window.mosaic.providerData["mosaic-provider-jobcards"]=
  const mosaicProviderJobcardsJSON = JSON.parse(
    mosaicProviderJobcardsLineText.replace(
      'window.mosaic.providerData["mosaic-provider-jobcards"]=',
      ""
    )
  );
  const jobs =
    mosaicProviderJobcardsJSON?.metaData?.mosaicProviderJobCardsModel?.results;
  return jobs;
}

async function getIndeedJobs(query, page = 1, retries = 0) {
  try {
    let start = (page - 1) * 10;
    const res = await gotScraping({
      url: `https://www.indeed.com/jobs?q=${encodeURIComponent(
        query.split(" ").join("+")
      )}&l=Austin%2C+TX&radius=50&start=${start}`,
      proxyUrl: getSmartProxyUrl(),
    });

    if (res.statusCode !== 200) {
      throw new Error("status code not 200");
    }

    return jsonify(res.body);
  } catch (err) {
    if (retries < 5) {
      return getIndeedJobs(query, page, retries + 1);
    }
    console.log("error at getIndeedJobs:", err.message);
  }
}

(async () => {
  const query = "software engineer";
  let page = 4;
  const jobs = await getIndeedJobs(query, page);
  console.log(jobs);
  fs.writeFileSync("test.json", JSON.stringify(jobs, null, 2));
})();

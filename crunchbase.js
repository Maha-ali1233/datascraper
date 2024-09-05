import { gotScraping } from "got-scraping";
import { pipeline as streamPipeline } from "node:stream/promises";
import * as cheerio from "cheerio";
import { getSmartProxyUrl, getStormProxyUrl } from "./proxies.js";
import { promisify } from "util";
import { pipeline } from "stream/promises";
import fs from "graceful-fs";
import { Parser } from "xml2js";
import { createGunzip } from "zlib";

// Function to convert XML to JSON
const convertXmlToJson = async (xmlFilePath) => {
  try {
    // Read the decompressed XML file
    const xmlData = fs.readFileSync(xmlFilePath, "utf-8");

    // Create an instance of the xml2js parser
    const parser = new Parser();

    // Parse the XML to JSON
    const json = await parser.parseStringPromise(xmlData);
    return json;
  } catch (error) {
    console.log("error at convertXmlToJson", error.message);
  }
};

// Function to fetch and decompress the .gz file
const fetchAndDecompressGz = async (xmlUrl, gzFilePath, xmlFilePath) => {
  try {
    // Fetch the .gz file

    // const res = gotScraping.stream(xmlUrl);

    // // console.log("res.status", res.statusCode);

    // // if (res.statusCode !== 200) {
    // //   throw new Error(`Failed to fetch ${xmlUrl}`);
    // // }

    // // Create a temporary directory if it doesn't exist

    // // Write the fetched .gz file to disk
    // const fileStream = fs.createWriteStream(gzFilePath);
    // await pipeline(res.rawBody, fileStream);

    // This example streams the GET response of a URL to a file.
    await streamPipeline(
      gotScraping.stream(xmlUrl),
      fs.createWriteStream(gzFilePath)
    );

    // Decompress the .gz file
    const xmlWriteStream = fs.createWriteStream(xmlFilePath);
    await pipeline(
      fs.createReadStream(gzFilePath),
      createGunzip(),
      xmlWriteStream
    );
  } catch (error) {
    console.log("error at fetchAndDecompressGz", error.message);
  }
};

async function getOrganizationSitemapLinks() {
  try {
    const res = await gotScraping(
      "https://www.crunchbase.com/www-sitemaps/sitemap-index.xml"
    );
    const xmlData = res.body;

    const parser = new Parser();

    // Parse the XML to JSON
    const result = await parser.parseStringPromise(xmlData);

    const companyUrls = result.sitemapindex.sitemap
      .filter((l) => l.loc[0]?.includes("/sitemap-organizations"))
      .map((sitemap) => {
        return sitemap.loc[0];
      });

    return companyUrls;
  } catch (error) {
    console.log("error at getOrganizationSitemapLinks", error.message);
  }
}

async function scrapeOrganizationPage(url, retries = 0) {
  try {
    const res = await gotScraping({
      url: `http://webcache.googleusercontent.com/search?q=cache:${url}`,
      proxyUrl: getSmartProxyUrl(),
    });

    if (res.statusCode !== 200) {
      throw new Error(`Failed to fetch ${res.statusCode}`);
    }

    const html = res.body;
    const $ = cheerio.load(html);
    // get #ng-state
    const ngState = $("#ng-state").html();
    return JSON.parse(ngState);
  } catch (error) {
    if (retries < 15) {
      return scrapeOrganizationPage(url, retries + 1);
    }
    console.log("error at scrapeOrganizationPage", error.message);
  }
}

(async () => {
  // const data = await scrapeOrganizationPage(
  //   "https://www.crunchbase.com/organization/shopify"
  // );
  // console.log("data", data);
  // return;

  const companyUrls = await getOrganizationSitemapLinks();

  for (let i = 0; i < companyUrls.length; i++) {
    const url = companyUrls[i];
    console.log("i", i);

    const filename = url.split("/").pop().split(".")[0];
    await fetchAndDecompressGz(url, `${filename}.xml.gz`, `${filename}.xml`);
    const organizationSitemap = await convertXmlToJson(`${filename}.xml`);
    const orgUrls = organizationSitemap.urlset.url.map((url) => url.loc[0]);
    console.log("orgUrls", orgUrls);
    let batch = [];
    for (let j = 0; j < orgUrls.length; j++) {
      console.log("j", j);
      console.log("orgUrls[j]", orgUrls[j]);
      const orgUrl = orgUrls[j];
      batch.push(scrapeOrganizationPage(orgUrl));
      if (batch.length === 10 || j === orgUrls.length - 1) {
        const results = await Promise.all(batch);
        console.log("results", results);
        fs.writeFileSync("test.json", JSON.stringify(results, null, 2));
        batch = [];
      }
    }
  }

  console.log("done");
})();

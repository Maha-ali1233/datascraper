import { gotScraping } from "got-scraping";
import * as cheerio from "cheerio";
import fetch from "node-fetch";
import fs from "graceful-fs";
import { getSmartProxyAgent, getSmartProxyUrl } from "./proxies.js";

(async () => {
  const res = await fetch(
    "https://www.amazon.com/Huffy-Upshot-Boys-Bike-Green/dp/B09DH98BHQ",
    {
      agent: getSmartProxyAgent(),
      headers: {
        "User-Agent": "Googlebot/2.1 (+http://www.google.com/bot.html)",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "device-memory": "8",
        downlink: "10",
        dpr: "1",
        ect: "4g",
        priority: "u=0, i",
        rtt: "50",
        "sec-ch-device-memory": "8",
        "sec-ch-dpr": "1",
        "sec-ch-ua":
          '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-ch-viewport-width": "1920",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "viewport-width": "1920",
        Referer:
          "https://www.amazon.com/s?k=bikes&page=2&crid=2ZI2Q8OVY7PG4&qid=1717283023&sprefix=%2Caps%2C92&ref=sr_pg_1",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    }
  );
  console.log("res.status", res.status);
  const html = await res.text();
  fs.writeFileSync("test.html", html);

  const $ = cheerio.load(html);
  const price = $(".a-price > span").first().text();
  console.log("price", price);

  const title = $("#productTitle").text()?.trim();
  console.log("title", title);

  const ratings = $("#acrCustomerReviewText").first().text();
  console.log("ratings", ratings);
})();

import fetch from "node-fetch";
import fs from "graceful-fs";
import { getSmartProxyAgent } from "./proxies.js";

(async () => {
  const gameId = "400878160";
  // const gameId = "401547539";
  // const sport = "football";
  const sport = "basketball";
  // const league = "nfl";
  const league = "nba";
  const res = await fetch(
    `https://site.web.api.espn.com/apis/site/v2/sports/${sport}/${league}/summary?region=us&lang=en&contentorigin=espn&event=${gameId}&showAirings=buy%2Clive%2Creplay&showZipLookup=true&buyWindow=1m`,
    {
      agent: getSmartProxyAgent(),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        Referer: "https://www.espn.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    }
  );
  const json = await res.json();
  console.log("json", json);
  fs.writeFileSync("test.json", JSON.stringify(json, null, 2));
})();

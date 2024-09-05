import fetch from "node-fetch";
import fs from "graceful-fs";
import { getSmartProxyAgent } from "./proxies.js";
import { createCSV } from "./utils.js";

async function getSearchResults() {
  const searchQueryState = {
    pagination: {},
    isMapVisible: true,
    pagination: {
      currentPage: 1,
    },
    mapBounds: {
      north: 41.0159577359822,
      south: 40.63666521478589,
      east: -80.5795277558594,
      west: -82.18627824414065,
    },
    regionSelection: [{ regionId: 51260, regionType: 6 }],
    filterState: {
      sortSelection: { value: "globalrelevanceex" },
      isAllHomes: { value: true },
    },
    isEntirePlaceForRent: true,
    isRoomForRent: false,
    isListVisible: true,
  };
  const wants = {
    cat1: ["listResults", "mapResults"],
    cat2: ["total"],
  };
  const res = await fetch(
    "https://www.zillow.com/async-create-search-page-state",
    {
      agent: getSmartProxyAgent(),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        Referer: "https://www.zillow.com/homes/Austin,-TX_rb/",
        "Referrer-Policy": "unsafe-url",
      },
      body: JSON.stringify({
        searchQueryState,
        wants,
      }),
      method: "PUT",
    }
  );
  console.log("res.status:", res.status);
  const json = await res.json();
  fs.writeFileSync("test.json", JSON.stringify(json, null, 2));
  console.log(
    'json.["cat1"].searchResults.listResults:',
    json["cat1"].searchResults.listResults.map((x) => x.address)
  );
  return json["cat1"].searchResults.listResults;
}

async function getListingDetails(zpid) {
  const res = await fetch(
    `https://www.zillow.com/graphql/?extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%2222f1569a25f23a90bb2445ce2fb8f7a3fcf2daedd91fa86e43e7a120a17f6b93%22%7D%7D&variables=%7B%22zpid%22%3A%22${zpid}%22%2C%22zillowPlatform%22%3A%22DESKTOP%22%2C%22altId%22%3Anull%7D`,
    {
      agent: getSmartProxyAgent(),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "client-id": "showcase-subapp-client",
        "content-type": "application/json",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        Referer:
          "https://www.zillow.com/homedetails/4101-Scales-St-Austin-TX-78723/80091206_zpid/",
        "Referrer-Policy": "unsafe-url",
      },
      body: null,
      method: "GET",
    }
  );
  const json = await res.json();
  fs.writeFileSync("test.json", JSON.stringify(json, null, 2));
  console.log(json);
}

(async () => {
  const listings = await getSearchResults();
  // await createCSV(listings, "listings.csv");
  // await getListingDetails(35192848);
  // await getListingDetails(35205694);
})();

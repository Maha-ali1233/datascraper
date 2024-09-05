import fetch from "node-fetch";
import fs from "graceful-fs";
import { getSmartProxyAgent, getSmartProxyUrl } from "./proxies.js";
import { gotScraping } from "got-scraping";
import * as cheerio from "cheerio";

// Function to recursively search for the key
function findKey(obj, keyToFind) {
  try {
    if (obj.hasOwnProperty(keyToFind)) {
      return obj[keyToFind];
    }

    for (let key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        let result = findKey(obj[key], keyToFind);
        if (result !== undefined) {
          return result;
        }
      }
    }

    return undefined;
  } catch (error) {
    console.log("error at findKey", error.message);
    console.log("keyToFind", keyToFind);
  }
}

function searchForValueIncluding(obj, searchString) {
  try {
    if (Array.isArray(obj)) {
      for (let item of obj) {
        if (Array.isArray(item) && item[0] === searchString) {
          return obj;
        } else if (typeof item === "object" && item !== null) {
          let result = searchForValueIncluding(item, searchString);
          if (result) {
            return result;
          }
        }
      }
    } else if (typeof obj === "object" && obj !== null) {
      for (let key in obj) {
        let result = searchForValueIncluding(obj[key], searchString);
        if (result) {
          return result;
        }
      }
    }

    return undefined;
  } catch (error) {
    console.log("error at searchForValueIncluding", error.message);
    console.log("searchString", searchString);
  }
}

function getProps(html) {
  try {
    const $ = cheerio.load(html);
    // find the script tag that includes CountryNamesConfig
    let scriptIWant;
    $("script").each((i, elem) => {
      if ($(elem).html().includes("CountryNamesConfig")) {
        scriptIWant = $(elem).html();
      }
    });
    // parse the script tag
    const scriptJSON = JSON.parse(scriptIWant);

    const nestedContentRoot = searchForValueIncluding(
      scriptJSON,
      "PolarisProfileNestedContentRoot.react"
    );

    const props = findKey(nestedContentRoot, "props");
    return props;
  } catch (error) {
    console.log("error at getProps", error.message);
  }
}

async function getLsdAndUserId(handle) {
  try {
    const res = await gotScraping({
      url: `https://www.instagram.com/${handle}/`,
      proxyUrl: getSmartProxyUrl(),
    });
    const $ = cheerio.load(res.body);
    // get __eqmc
    const script = $("script#__eqmc").html();
    const json = JSON.parse(script);
    const lsd = json?.l;

    const props = getProps(res.body);

    return {
      lsd,
      userId: props?.id,
    };
  } catch (error) {
    console.log("error at getLsdAndUserId", error.message);
  }
}

async function getIGProfileWithId(lsd, userId) {
  try {
    const response = await fetch("https://www.instagram.com/api/graphql", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.142 Safari/537.36",
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded",
        priority: "u=1, i",
        "sec-ch-prefers-color-scheme": "dark",
        "sec-ch-ua":
          '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-full-version-list":
          '"Google Chrome";v="125.0.6422.142", "Chromium";v="125.0.6422.142", "Not.A/Brand";v="24.0.0.0"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-model": '""',
        "sec-ch-ua-platform": '"macOS"',
        "sec-ch-ua-platform-version": '"13.0.1"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-asbd-id": "129477",
        "x-csrftoken": "eThc24IrZmnvLL77Xwv1Le",
        "x-fb-friendly-name": "PolarisProfilePageContentQuery",
        "x-fb-lsd": lsd,
        "x-ig-app-id": "936619743392459",
        Referer: "https://www.instagram.com/adrianhorning/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: `__hs=19885.HYP%3Ainstagram_web_pkg.2.1..0.0&dpr=2&__ccg=UNKNOWN&__rev=1014124795&__s=vvlyey%3Aihdm4v%3A93f9hq&__hsi=7379256038163506741&__dyn=7xe5WwlEnwn8K2Wmm0NonwgU7S6EeUaUco38w5ux609vCwjE1xoswaq0yE1VohwGwQwoEcE2ygao1aU2swc20EUjwGzEaE2iwNwKwHw8W5U4q0PU1bobodEGdwtU662O0Lo6-3u2WE15E6O1FwlE6PhA6bwg8rAwCAxW6Uf9EO17w&__csr=gpOgL9tjN2sG9eX9ZiISHvCAic-QaVvBGuyt5JaUyAhd5h9FLnA-hoCFbV94Hjh6uyCLUzhlGFEkWzrACQJvKil2AbhbDiGUKUKaALDxujBgDS9yaBoGQ9yEGdAxCi9ykdGGGqhzbVqAwBDyofkifAx600lwWvc0gq2W0sSlwwg3lgcU0UW06_Fk17gYysC3yU5jfe6Ed8aUiw8acweq8yGa0bzw27N03pwdK0fJwnE32w08Ym&__comet_req=7&lsd=${lsd}&jazoest=2929&__spin_r=1014124795&__spin_b=trunk&__spin_t=1718116933&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=PolarisProfilePageContentQuery&variables=%7B%22id%22%3A%22${userId}%22%2C%22render_surface%22%3A%22PROFILE%22%7D&server_timestamps=true&doc_id=7537483089632862`,
      method: "POST",
    });
    const json = await response.json();
    return json;
  } catch (error) {
    console.log("error at getIGProfileWithId", error.message);
  }
}

async function getIgProfileWithHandle(handle) {
  try {
    const userAgents = JSON.parse(fs.readFileSync("./iosUserAgents.json"));
    const randomIndex = Math.floor(Math.random() * userAgents.length);
    const userAgent = userAgents[randomIndex];
    const res = await gotScraping({
      url: `https://i.instagram.com/api/v1/users/web_profile_info/?username=${handle}`,
      // proxyUrl: getSmartProxyResi(), // NEED a residential proxy!!
      responseType: "json",
      headers: {
        "User-Agent": userAgent,
        "x-ig-app-id": "936619743392459",
      },
    });
    return res.body;
  } catch (error) {
    console.log("error at getIgProfileWithHandle", error.message);
  }
}

// 2700692569
(async () => {
  // const { lsd, userId } = await getLsdAndUserId("adrianhorning");
  // const { lsd, userId } = await getLsdAndUserId("itsmikepowers");
  // console.log("lsd", lsd);
  // console.log("userId", userId);
  // const profile = await getIgProfileWithHandle("adrianhorning");
})();

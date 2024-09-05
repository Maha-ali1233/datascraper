import fetch from "node-fetch";
import fs from "graceful-fs";
import * as cheerio from "cheerio";
import { getSmartProxyAgent } from "./proxies.js";

async function getCookies() {
  try {
    const res = await fetch(
      "https://kcwaimg.co.kitsap.wa.us/recorder/web/login.jsp",
      {
        agent: getSmartProxyAgent(),
      }
    );
    const cookies = res.headers.raw()["set-cookie"];
    return cookies?.[0];
  } catch (error) {
    console.log("error at getCookies", error.message);
  }
}

(async () => {
  const cookie = await getCookies();
  console.log(cookie);

  const startDate = "01/01/2024";
  const endDate = "01/31/2024";

  const res = await fetch(
    "https://kcwaimg.co.kitsap.wa.us/recorder/eagleweb/docSearchPOST.jsp",
    {
      agent: getSmartProxyAgent(),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "content-type": "application/x-www-form-urlencoded",
        "sec-ch-ua":
          '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        cookie: `${cookie}; isLoggedInAsPublic=true;`,
        Referer:
          "https://kcwaimg.co.kitsap.wa.us/recorder/eagleweb/docSearch.jsp",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: `DocNumID=&BookPageIDBook=&BookPageIDPage=&RecDateIDStart=${encodeURIComponent(
        startDate
      )}&RecDateIDEnd=${encodeURIComponent(
        endDate
      )}&BothNamesIDSearchString=&BothNamesIDSearchType=Basic&PlattedLegalIDSubdivision=&PlattedLegalIDLot=&PlattedLegalIDBlock=&PlattedLegalIDTract=&PlattedLegalIDUnit=&PlssLegalIDTract=&PlssLegalIDSixtyFourthSection=&PlssLegalIDSixteenthSection=&PlssLegalIDQuarterSection=&PlssLegalIDSection=&PlssLegalIDTownship=&PlssLegalIDRange=&LegalRemarksID=&ParcelID=&exciseID=&GroomIDSearchString=&GroomIDSearchType=Starts+With&SubjectIDSearchString=&SubjectIDSearchType=Starts+With&GrantorIDSearchString=&GrantorIDSearchType=Basic+Search&GranteeIDSearchString=&GranteeIDSearchType=Basic+Search&AllDocuments=ALL&docTypeTotal=528`,
      method: "POST",
    }
  );
  console.log(res.status);
  const res1 = await fetch(
    "https://kcwaimg.co.kitsap.wa.us/recorder/eagleweb/docSearchResults.jsp?searchId=0",
    {
      agent: getSmartProxyAgent(),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "sec-ch-ua":
          '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        cookie: `${cookie}; isLoggedInAsPublic=true;`,
        "upgrade-insecure-requests": "1",
        Referer:
          "https://kcwaimg.co.kitsap.wa.us/recorder/eagleweb/docSearch.jsp",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    }
  );
  const html = await res1.text();
  fs.writeFileSync("test.html", html);
  const $ = cheerio.load(html);

  const results = [];

  // grab all the tr's
  const rows = $("table tr");

  // loop through each row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const columns = $(row).find("td");

    const result = {
      date: $(columns[0]).text().trim(),
      type: $(columns[1]).text().trim(),
      name: $(columns[2]).text().trim(),
      description: $(columns[3]).text().trim(),
      doc: $(columns[4]).text().trim(),
      pages: $(columns[5]).text().trim(),
    };

    results.push(result);
  }

  console.log(results);
})();

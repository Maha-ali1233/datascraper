import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "graceful-fs";
import { getSmartProxyAgent, getSmartProxyResiAgent } from "./proxies.js";
import { DateTime } from "luxon";

// Function to convert date string to timestamp
const dateToTimestamp = (dateString) => {
  // Parse the date string using Luxon
  const date = DateTime.fromFormat(dateString, "M/d/yyyy");

  // Convert the parsed date to a timestamp in milliseconds
  return date.toMillis();
};

async function fetchSearchResults(
  viewState,
  viewStateGenerator,
  eventValidation,
  page = 1
) {
  try {
    const startDate = "9/1/2023";
    const endDate = "10/1/2023";
    const startDateTimestamp = dateToTimestamp(startDate);
    const endDateTimestamp = dateToTimestamp(endDate);

    const eventArgument = page !== 1 ? "Page$Next" : "";
    console.log("eventArgument", eventArgument);
    const res = await fetch(
      "https://apps.sarpy.gov/CaptureCZ/CAPortal/CAMA/CAPortal/Custom/CZ_AdvancedSearch27.aspx",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.1619.1 Safari/537.36",
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "max-age=0",
          "content-type": "application/x-www-form-urlencoded",
          priority: "u=0, i",
          "sec-ch-ua":
            '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-origin",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
          Referer:
            "https://apps.sarpy.gov/CaptureCZ/CAPortal/CAMA/CAPortal/Custom/CZ_AdvancedSearch27.aspx",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: `__EVENTTARGET=GridView1&__EVENTARGUMENT=${
          eventArgument || ""
        }&__LASTFOCUS=&__VIEWSTATE=${encodeURIComponent(
          viewState
        )}&__VIEWSTATEGENERATOR=${viewStateGenerator}&__EVENTVALIDATION=${encodeURIComponent(
          eventValidation
        )}&HiddenVal=&HidParcelNo=&SearchType=&InitiateSearch=1&ProcessCommand=&SubdivDDL_VI=-1&SubdivDDL=ALL&SubdivDDL%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&SubdivDDL%24DDD%24L%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&SubdivDDL%24DDD%24L=-1&SubdivNoDDL_VI=-1&SubdivNoDDL=ALL&SubdivNoDDL%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&SubdivNoDDL%24DDD%24L%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&SubdivNoDDL%24DDD%24L=-1&SIDDDL_VI=-1&SIDDDL=ALL&SIDDDL%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&SIDDDL%24DDD%24L%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&SIDDDL%24DDD%24L=-1&TRSDDL_VI=-1&TRSDDL=ALL&TRSDDL%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&TRSDDL%24DDD%24L%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&TRSDDL%24DDD%24L=-1&TRSQDDL_VI=-1&TRSQDDL=ALL&TRSQDDL%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&TRSQDDL%24DDD%24L%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&TRSQDDL%24DDD%24L=-1&TaxDistDDL_VI=-1&TaxDistDDL=ALL&TaxDistDDL%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&TaxDistDDL%24DDD%24L%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&TaxDistDDL%24DDD%24L=-1&PresentUseDDL_VI=-1&PresentUseDDL=ALL&PresentUseDDL%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&PresentUseDDL%24DDD%24L%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&PresentUseDDL%24DDD%24L=-1&StatusDDE%24State=%7B%26quot%3BkeyValue%26quot%3B%3A%26quot%3B%26quot%3B%7D&StatusDDE=&StatusDDE%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&StatusDDE%24DDD%24DDTC%24StatusLB%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&StatusDDE%24DDD%24DDTC%24StatusLB=&AssdValStartTB=&AssdValEndTB=&SaleDateStartTB%24State=%7B%26quot%3BrawValue%26quot%3B%3A%26quot%3B${startDateTimestamp}%26quot%3B%7D&SaleDateStartTB=&SaleDateStartTB%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A126%3A208%3A1%3A%3A%3A1%3A0%3A0%3A0%26quot%3B%7D&SaleDateStartTB%24DDD%24C=%7B%26quot%3BvisibleDate%26quot%3B%3A%26quot%3B03%2F01%2F2024%26quot%3B%2C%26quot%3BinitialVisibleDate%26quot%3B%3A%26quot%3B06%2F01%2F2024%26quot%3B%2C%26quot%3BselectedDates%26quot%3B%3A%5B%26quot%3B03%2F01%2F2024%26quot%3B%5D%7D&SaleDateStartTB%24DDD%24C%24FNPState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&SaleDateEndTB%24State=%7B%26quot%3BrawValue%26quot%3B%3A%26quot%3B${endDateTimestamp}%26quot%3B%7D&SaleDateEndTB=&SaleDateEndTB%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A221%3A208%3A1%3A%3A%3A1%3A0%3A0%3A0%26quot%3B%7D&SaleDateEndTB%24DDD%24C=%7B%26quot%3BvisibleDate%26quot%3B%3A%26quot%3B04%2F01%2F2024%26quot%3B%2C%26quot%3BinitialVisibleDate%26quot%3B%3A%26quot%3B06%2F01%2F2024%26quot%3B%2C%26quot%3BselectedDates%26quot%3B%3A%5B%26quot%3B04%2F30%2F2024%26quot%3B%5D%7D&SaleDateEndTB%24DDD%24C%24FNPState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&SalePriceStartTB=250000&SalePriceEndTB=&QualSaleDDL_VI=-1&QualSaleDDL=NONE&QualSaleDDL%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&QualSaleDDL%24DDD%24L%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&QualSaleDDL%24DDD%24L=-1&LotSizeDDE%24State=%7B%26quot%3BkeyValue%26quot%3B%3A%26quot%3B%26quot%3B%7D&LotSizeDDE=&LotSizeDDE%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&LotSizeDDE%24DDD%24DDTC%24LotSizeLB%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&LotSizeDDE%24DDD%24DDTC%24LotSizeLB=&RecordsDDL=200&TaxYear=2024&DXScript=1_304%2C1_185%2C1_298%2C1_211%2C1_221%2C1_188%2C1_209%2C1_217%2C1_190%2C1_223%2C1_208%2C1_182%2C1_290%2C1_206%2C1_288%2C1_212%2C1_207%2C1_199&DXCss=1_17%2C1_14%2C1_50%2C1_51%2C1_16%2C1_13%2C1_40%2C1_4%2C..%2FCaptureCZ.css`,
        method: "POST",
      }
    );
    // const res = await fetch(
    //   "https://apps.sarpy.gov/CaptureCZ/CAPortal/CAMA/CAPortal/Custom/CZ_AdvancedSearch27.aspx",
    //   {
    //     headers: {
    //       accept:
    //         "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    //       "accept-language": "en-US,en;q=0.9",
    //       "cache-control": "max-age=0",
    //       "content-type": "application/x-www-form-urlencoded",
    //       priority: "u=0, i",
    //       "sec-ch-ua":
    //         '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
    //       "sec-ch-ua-mobile": "?0",
    //       "sec-ch-ua-platform": '"macOS"',
    //       "sec-fetch-dest": "document",
    //       "sec-fetch-mode": "navigate",
    //       "sec-fetch-site": "same-origin",
    //       "sec-fetch-user": "?1",
    //       "upgrade-insecure-requests": "1",
    //       Referer:
    //         "https://apps.sarpy.gov/CaptureCZ/CAPortal/CAMA/CAPortal/Custom/CZ_AdvancedSearch27.aspx",
    //       "Referrer-Policy": "strict-origin-when-cross-origin",
    //     },
    //     body: `__EVENTTARGET=GridView1&__EVENTARGUMENT=${
    //       eventArgument || ""
    //     }&__LASTFOCUS=&__VIEWSTATE=${encodeURIComponent(
    //       viewState
    //     )}&__VIEWSTATEGENERATOR=${viewStateGenerator}&__EVENTVALIDATION=${encodeURIComponent(
    //       eventValidation
    //     )}&HiddenVal=&HidParcelNo=&SearchType=&InitiateSearch=1&ProcessCommand=&SubdivDDL_VI=-1&SubdivDDL=ALL&SubdivDDL%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&SubdivDDL%24DDD%24L%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&SubdivDDL%24DDD%24L=-1&SubdivNoDDL_VI=-1&SubdivNoDDL=ALL&SubdivNoDDL%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&SubdivNoDDL%24DDD%24L%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&SubdivNoDDL%24DDD%24L=-1&SIDDDL_VI=-1&SIDDDL=ALL&SIDDDL%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&SIDDDL%24DDD%24L%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&SIDDDL%24DDD%24L=-1&TRSDDL_VI=-1&TRSDDL=ALL&TRSDDL%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&TRSDDL%24DDD%24L%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&TRSDDL%24DDD%24L=-1&TRSQDDL_VI=-1&TRSQDDL=ALL&TRSQDDL%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&TRSQDDL%24DDD%24L%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&TRSQDDL%24DDD%24L=-1&TaxDistDDL_VI=-1&TaxDistDDL=ALL&TaxDistDDL%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&TaxDistDDL%24DDD%24L%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&TaxDistDDL%24DDD%24L=-1&PresentUseDDL_VI=-1&PresentUseDDL=ALL&PresentUseDDL%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&PresentUseDDL%24DDD%24L%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&PresentUseDDL%24DDD%24L=-1&StatusDDE%24State=%7B%26quot%3BkeyValue%26quot%3B%3A%26quot%3B%26quot%3B%7D&StatusDDE=&StatusDDE%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&StatusDDE%24DDD%24DDTC%24StatusLB%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&StatusDDE%24DDD%24DDTC%24StatusLB=&AssdValStartTB=&AssdValEndTB=&SaleDateStartTB%24State=%7B%26quot%3BrawValue%26quot%3B%3A%26quot%3B1704067200000%26quot%3B%7D&SaleDateStartTB=&SaleDateStartTB%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&SaleDateStartTB%24DDD%24C=%7B%26quot%3BvisibleDate%26quot%3B%3A%26quot%3B01%2F01%2F2024%26quot%3B%2C%26quot%3BinitialVisibleDate%26quot%3B%3A%26quot%3B01%2F01%2F2024%26quot%3B%2C%26quot%3BselectedDates%26quot%3B%3A%5B%26quot%3B01%2F01%2F2024%26quot%3B%5D%7D&SaleDateStartTB%24DDD%24C%24FNPState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&SaleDateEndTB%24State=%7B%26quot%3BrawValue%26quot%3B%3A%26quot%3B1706745600000%26quot%3B%7D&SaleDateEndTB=&SaleDateEndTB%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A221%3A208%3A1%3A%3A%3A1%3A0%3A0%3A0%26quot%3B%7D&SaleDateEndTB%24DDD%24C=%7B%26quot%3BvisibleDate%26quot%3B%3A%26quot%3B02%2F29%2F2024%26quot%3B%2C%26quot%3BinitialVisibleDate%26quot%3B%3A%26quot%3B04%2F01%2F2024%26quot%3B%2C%26quot%3BselectedDates%26quot%3B%3A%5B%26quot%3B02%2F01%2F2024%26quot%3B%5D%7D&SaleDateEndTB%24DDD%24C%24FNPState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&SalePriceStartTB=250000&SalePriceEndTB=&QualSaleDDL_VI=-1&QualSaleDDL=NONE&QualSaleDDL%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&QualSaleDDL%24DDD%24L%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&QualSaleDDL%24DDD%24L=-1&LotSizeDDE%24State=%7B%26quot%3BkeyValue%26quot%3B%3A%26quot%3B%26quot%3B%7D&LotSizeDDE=&LotSizeDDE%24DDDState=%7B%26quot%3BwindowsState%26quot%3B%3A%26quot%3B0%3A0%3A-1%3A0%3A0%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0%26quot%3B%7D&LotSizeDDE%24DDD%24DDTC%24LotSizeLB%24State=%7B%26quot%3BCustomCallback%26quot%3B%3A%26quot%3B%26quot%3B%7D&LotSizeDDE%24DDD%24DDTC%24LotSizeLB=&RecordsDDL=200&TaxYear=2024&DXScript=1_304%2C1_185%2C1_298%2C1_211%2C1_221%2C1_188%2C1_209%2C1_217%2C1_190%2C1_223%2C1_208%2C1_182%2C1_290%2C1_206%2C1_288%2C1_212%2C1_207%2C1_199&DXCss=1_17%2C1_14%2C1_50%2C1_51%2C1_16%2C1_13%2C1_40%2C1_4%2C..%2FCaptureCZ.css`,
    //     method: "POST",
    //   }
    // );
    console.log("res.status", res.status);
    const text = await res.text();
    fs.writeFileSync("test.html", text);
    const newViewState = getViewState(text);
    const newViewStateGenerator = getViewStateGenerator(text);
    const newEventValidation = getEventValidation(text);

    const results = [];

    const $ = cheerio.load(text);
    $(".GridCellBorders").each((i, el) => {
      // get table within each GridCellBorders
      const table = $(el).find("table");
      const rows = table.find("tr");
      rows.each((i, row) => {
        const key = $(row).find("td").eq(1).text();
        const value = $(row).find("td").eq(2).text();
        results.push({
          [key]: value,
        });
      });
    });

    console.log("results", results);

    return { newViewState, newViewStateGenerator, newEventValidation, results };
  } catch (error) {
    console.log("error at fetchSearchResults", error.message);
  }
}

function getViewState(text) {
  return text.match(/id="__VIEWSTATE" value="(.*?)"/)[1];
}

function getViewStateGenerator(text) {
  return text.match(/id="__VIEWSTATEGENERATOR" value="(.*?)"/)[1];
}

function getEventValidation(text) {
  return text.match(/id="__EVENTVALIDATION" value="(.*?)"/)[1];
}

(async () => {
  const res = await fetch(
    "https://apps.sarpy.gov/CaptureCZ/CAPortal/CAMA/CAPortal/Custom/CZ_AdvancedSearch27.aspx"
  );
  console.log("res.status", res.status);
  const text = await res.text();
  const viewState = getViewState(text);
  const viewStateGenerator = getViewStateGenerator(text);
  const eventValidation = getEventValidation(text);

  const { newViewState, newViewStateGenerator, newEventValidation } =
    await fetchSearchResults(viewState, viewStateGenerator, eventValidation, 1);

  console.log("fetching new search results");
  await fetchSearchResults(
    newViewState,
    newViewStateGenerator,
    newEventValidation,
    2
  );
})();

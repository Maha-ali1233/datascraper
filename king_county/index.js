import fetch from "node-fetch";
import * as cheerio from "cheerio";
import chromium from "@sparticuz/chromium";
import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";

const TWO_CAPTCHA_API_KEY = process.env.TWO_CAPTCHA_API_KEY;

async function submitTo2Captcha(siteKey) {
  try {
    const res = await axios({
      method: "post",
      url: `https://2captcha.com/in.php`,
      data: {
        method: "userrecaptcha",
        googlekey: siteKey,
        key: TWO_CAPTCHA_API_KEY,
        pageurl: "https://recordsearch.kingcounty.gov/LandmarkWeb/search/index",
        json: 1,
      },
    });
    const json = res.data;
    console.log("submitTo2Captcha json: ", json);
    const { request, status } = json;
    return request;
  } catch (error) {
    console.log("error at submitTo2Captcha: ", error.message);
  }
}

async function pollFor2CaptchaToken(id) {
  try {
    let status;
    let maxTries = 10;

    while (status !== 1 && maxTries > 0) {
      // await new Promise((resolve) => setTimeout(resolve, 30000));
      await new Promise((resolve) => setTimeout(resolve, 10000));
      const res = await fetch(
        `https://2captcha.com/res.php?key=${TWO_CAPTCHA_API_KEY}&action=get&id=${id}&json=1`
      );
      const json = await res.json();
      console.log("json: ", json);
      const { request, status: newStatus } = json;
      status = newStatus;
      if (status === 1) {
        return request;
      }
      maxTries--;
    }

    return null;
  } catch (error) {
    console.log("error at pollFor2CaptchaToken: ", error.message);
  }
}

async function runPuppeteer(searchTerm, documentType, isLocal = true) {
  try {
    const payload = [];

    const siteKey = "6LePF5clAAAAAHUGpyT_rrTZl48-STa5Rn6_PMTv";

    puppeteerExtra.use(stealthPlugin());

    let browser;

    if (isLocal) {
      browser = await puppeteerExtra.launch({
        headless: false,
        // headless: "new",
        // devtools: true,
        executablePath:
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // your local path to chrome. Use chat gpt for help
      });
    } else {
      console.log("here");
      browser = await puppeteerExtra.launch({
        args: [...chromium.args],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: "new",
        ignoreHTTPSErrors: true,
      });
    }

    const page = await browser.newPage();

    // Set up response interception
    page.on("response", async (response) => {
      const url = response.url();
      if (url?.includes("GetSearchResults")) {
        const responseBody = await response.json();
        payload.push(...responseBody?.data);
      }
    });

    await page.goto(
      `https://recordsearch.kingcounty.gov/LandmarkWeb/search/index`
    );

    const requestId = await submitTo2Captcha(siteKey);
    const twoCaptchaToken = await pollFor2CaptchaToken(requestId);
    console.log("twoCaptchaToken: ", twoCaptchaToken);

    await page.evaluate(
      `document.getElementById("g-recaptcha-response").innerHTML="${twoCaptchaToken}"`
    );

    await page.type("#name-Name", searchTerm);
    console.log("typed in name");

    await page.click("#documentTypeSelection-Name");
    console.log("clicked on documentTypeSelection");

    // let documentType = 'NTS'

    if (documentType === "NTS") {
      // click on checkbox #dt-Name-172 (NTS)
      await page.click("#dt-Name-172");
      console.log("clicked on NTS checkbox");
    } else {
      await page.click("#dt-Name-29");
    }

    // click on the .modal-footer > .btn-primary button
    await page.click(
      "#documentTypeModal-Name > div.modal-footer > a.btn.btn-primary"
    );
    console.log("clicked on modal-footer button");

    await page.click("#beginYesterday-Name");
    console.log("clicked on beginYesterday");
    await page.click("#endYesterday-Name");
    console.log("clicked on endYesterday");

    // submit form
    await page.click("#submit-Name");

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const pages = await browser.pages();
    await Promise.all(pages.map((page) => page.close()));

    await browser.close();

    return payload;
  } catch (error) {
    console.log("error at runPuppeteer: ", error.message);
  }
}

function formatRows(rows) {
  return rows.map((row) => {
    const idRow = row[2];
    const id = idRow.match(/data-documentid='(\d+)'/)[1]; // this could potentially break if they use double quotes
    const searchName = row[4];
    const grantor = row[5]
      .replace("...", "")
      .replaceAll(`<div class='nameSeperator'></div>`, ` `);
    const grantee = row[6]
      .replace("...", "")
      .replaceAll(`<div class='nameSeperator'></div>`, ` `);
    const recordDate = row[7].replace("nobreak_", "");
    const docType = row[8].replace("nobreak_", "");
    const instrumentNumber = row[12].replace("nobreak_", "");
    const docLinks = row[13].replace("nobreak_", "");
    return {
      id,
      document: `https://recordsearch.kingcounty.gov/LandmarkWeb//Document/GetDocumentImage/?documentId=${id}&index=0&pageNum=0&type=normal`,
      searchName,
      grantor,
      grantee,
      recordDate,
      docType,
      instrumentNumber,
      docLinks,
      county: "king",
    };
  });
}

async function getSinglePage(id, cookies) {
  try {
    const res = await fetch(
      "https://recordsearch.kingcounty.gov/LandmarkWeb/Document/Index",
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en-CA;q=0.9,en-AU;q=0.8,en;q=0.7",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-ch-ua":
            '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
          cookie: cookies,
          Referer:
            "https://recordsearch.kingcounty.gov/LandmarkWeb/search/index?theme=.blue&section=searchCriteriaName&quickSearchSelection=",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: `id=${id}&row=1`,
        method: "POST",
      }
    );
    console.log("getSinglePage res: ", res.status);
    const html = await res.text();
    const $ = cheerio.load(html);
    // get for="Number of Pages"
    const numberOfPages = Number(
      $("label[for='Number of Pages ']").parent().next().text().trim()
    );
    const regex = /PID: (.*?) /;
    const pid = html.match(regex)?.[1];

    return {
      id,
      pages: numberOfPages,
      pid: pid?.trim(),
    };
  } catch (error) {
    console.log("error at getSinglePage: ", error.message);
  }
}

async function getCookies() {
  try {
    const res = await axios.get(
      `https://recordsearch.kingcounty.gov/LandmarkWeb/search/index`
    );
    const cookies = res.headers["set-cookie"];

    // turn into a string
    const cookieString = cookies.join("; ");

    return cookieString;
  } catch (error) {
    console.log("error at getCookies: ", error.message);
  }
}

export const handler = async (event, context, callback) => {
  try {
    const body = JSON.parse(event.body);
    const searchTerm = body?.searchTerm;
    const documentType = body?.documentType;
    const isLocal = body?.isLocal;

    const cookies = await getCookies();
    console.log("cookies: ", cookies);

    const payload = await runPuppeteer(searchTerm, documentType, isLocal);
    const records = formatRows(payload);

    return {
      statusCode: 200,
      body: JSON.stringify(records),
    };
  } catch (error) {
    console.log("error at handler: ", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

// uncomment this to run locally
// handler({
//   body: JSON.stringify({
//     searchTerm: "MTC",
//     documentType: "NTS",
//     isLocal: true,
//   }),
// }).then(console.log);

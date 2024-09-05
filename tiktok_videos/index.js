import puppeteerExtra from "puppeteer-extra";
import fs from "graceful-fs";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import chromium from "@sparticuz/chromium";
// even though we aren't importing it, you need to npm install puppeteer-core!
import dotenv from "dotenv";
dotenv.config();

async function runPuppeteer(url, isLocal = true) {
  try {
    puppeteerExtra.use(stealthPlugin());

    console.log("isLocal", isLocal);

    let browser;

    if (isLocal) {
      browser = await puppeteerExtra.launch({
        headless: false,
        // headless: "new",
        args: ["--proxy-server=http://gate.dc.smartproxy.com:20000"],
        // devtools: true,
        executablePath:
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // your local path to chrome. Use chat gpt for help
      });
    } else {
      console.log("here");
      browser = await puppeteerExtra.launch({
        args: [
          "--proxy-server=http://gate.dc.smartproxy.com:20000",
          ...chromium.args,
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: "new",
        ignoreHTTPSErrors: true,
      });
    }

    const page = await browser.newPage();

    await page.authenticate({
      username: process.env.SMARTPROXY_USER, // you need to pass these in directly, or create another .env file in lambda_function_with_puppeteer
      password: process.env.SMARTPROXY_PASS,
    });

    const responses = [];

    page.on("response", async (response) => {
      const url = response.url();
      if (url?.includes("item_list")) {
        let jsonRes = null;
        try {
          const resBody = await response.text();
          jsonRes = JSON.parse(resBody);
        } catch (error) {}
        console.log("jsonRes", jsonRes);
        if (jsonRes) {
          responses.push(jsonRes);
        }
      }
    });

    await page.goto(url);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // get all buttons
    const buttons = await page.$$("button");
    console.log("buttons.length", buttons.length);
    // loop over, get the text of each button
    for (const button of buttons) {
      const text = await page.evaluate((button) => button.textContent, button);
      if (text === "Refresh") {
        console.log("found the refresh button");
        await button.click();
        break;
      }
    }

    let scrolls = 0;

    while (scrolls < 10) {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
      scrolls++;
    }

    // bug that prevents the page from closing, so this is the workaround
    const pages = await browser.pages();
    await Promise.all(pages.map((page) => page.close()));

    await browser.close();
    console.log("browser closed");

    return responses;
  } catch (error) {
    console.log("error at runPuppeteer", error.message);
    throw new Error(error.message);
  }
}

export const handler = async (event) => {
  try {
    const { url, isLocal } = JSON.parse(event.body);

    const html = await runPuppeteer(url, isLocal);

    return {
      statusCode: 200,
      body: JSON.stringify({ html }),
    };
  } catch (error) {
    console.log("error at handler", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

// uncomment this to run locally
// const reses = await runPuppeteer(
//   "https://www.tiktok.com/@stoolpresidente",
//   true
// );
// console.log("reses", reses);
// fs.writeFileSync("test.json", JSON.stringify(reses, null, 2));

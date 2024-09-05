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

    await page.goto(url);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    let scrolls = 0;

    while (scrolls < 10) {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
      scrolls++;
    }

    const html = await page.content();

    // bug that prevents the page from closing, so this is the workaround
    const pages = await browser.pages();
    await Promise.all(pages.map((page) => page.close()));

    await browser.close();
    console.log("browser closed");

    return html;
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

runPuppeteer("https://ipinfo.io/json", true).then(console.log);

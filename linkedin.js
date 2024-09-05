import * as cheerio from "cheerio";
import { gotScraping } from "got-scraping";
import fs from "graceful-fs";
import { getSmartProxyUrl, getStormProxyUrl } from "./proxies.js";

function jsonify(html) {
  const $ = cheerio.load(html);

  // get the application/ld+json script tag
  const ldJson = $("script[type='application/ld+json']").html();
  const ldJsonParsed = JSON.parse(ldJson);

  const person = ldJsonParsed?.["@graph"]?.find((a) => a["@type"] === "Person");
  fs.writeFileSync("test.json", JSON.stringify(person, null, 2));

  const name = $("h1.top-card-layout__title").text().trim();
  const title = $("h2.top-card-layout__headline").text().trim();
  const location = person?.address?.addressLocality;
  const about = person?.description;
  const experience = person?.worksFor?.map((w) => {
    return {
      company: w?.name,
      companyUrl: w?.url,
      location: w?.location,
      // startDate: w?.startDate,
      // endDate: w?.endDate,
    };
  });

  const education = person?.alumniOf?.map((a) => {
    return {
      school: a?.name,
      schoolUrl: a?.url,
      startDate: a?.member?.startDate,
      endDate: a?.member?.endDate,
    };
  });

  const articles = [];
  $("section")
    .find(".core-section-container")
    .eq(1)
    .find("li")
    .each((i, li) => {
      const title = $(li).find("h3").text().trim();
      const author = $(li).find("h4").text().trim();
      const link = $(li).find("a").attr("href")?.split("?")?.[0];
      const date = $(li).find(".base-main-card__metadata").text().trim();
      articles.push({ title, author, link, date });
    });

  const activity = [];
  $("section")
    .find(".core-section-container")
    .eq(2)
    .find("li")
    .each((i, li) => {
      const title = $(li)
        .find("h3")
        .text()
        .trim()
        .split("\n")
        .map((s) => s.trim())
        .join(" ");
      const activityType = $(li)
        .find("h4")
        .text()
        .trim()
        ?.split("\n")
        ?.map((s) => s.trim())
        ?.join(" ");
      const link = $(li).find("a").attr("href")?.split("?")?.[0];
      activity.push({ title, activityType, link });
    });

  return {
    name,
    title,
    location,
    about,
    experience,
    articles,
    activity,
    education,
  };
}

(async () => {
  // honestly, just use https://www.scrapin.io/
  // or https://nubela.co/proxycurl/
  try {
    const url = "https://www.linkedin.com/in/adrianhorning";
    // const url = "https://www.linkedin.com/in/austenallred";
    // const url = "https://www.linkedin.com/in/parrsam";

    // GOT SCRAPING
    const res = await gotScraping({
      url,
      proxyUrl: getStormProxyUrl(),
    });
    fs.writeFileSync("test.html", res.body);
    const json = jsonify(res.body);
    console.log(json);
  } catch (error) {
    console.log("error", error.message);
  }
})();

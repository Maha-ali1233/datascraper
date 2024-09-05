import { gotScraping } from "got-scraping";
import fs from "graceful-fs";
import fetch from "node-fetch";

(async () => {
  let page = 1;
  let query = "nike";

  const res = await gotScraping({
    url: `https://api.poshmark.com/api/posts?request=%7B%22filters%22%3A%7B%22inventory_status%22%3A%5B%22available%22%5D%7D%2C%22query%22%3A%22${query}%22%7D&nm=sl_all&home_domain=us&app_state=acv&end_of_search_v2=true&suggested_filters_count=40&summarize=true&app_version=8.68.02&src=dir&domain=us&device_id=ios2%3A446ed8cd5118e3f96cdca68434650696&format=json&api_version=0.2&app_type=iphone&count=400&exp=all&gst=false&base_exp=all`,
    responseType: "json",
  });
  console.log(res.body.data.length);
  fs.writeFileSync("test.json", JSON.stringify(res.body, null, 2));
})();

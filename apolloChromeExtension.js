import fetch from "node-fetch";
import fs from "graceful-fs";

(async () => {
  const linkedinPeople = [
    {
      href: "https://www.linkedin.com/in/adrianhorning",
    },
    // {
    //   href: "https://www.linkedin.com/in/jevin-sackett-a794807",
    // },
    // {
    //   href: "https://www.linkedin.com/in/mikebarile",
    // },
    // {
    //   href: "https://www.linkedin.com/in/jamessidis",
    // },
    // {
    //   href: "https://www.linkedin.com/in/benjamin-plesser-29119925",
    // },
    // {
    //   href: "https://www.linkedin.com/in/kaulk",
    // },
    // {
    //   href: "https://www.linkedin.com/in/thomas-arms-8a0306170",
    // },
    // {
    //   href: "https://www.linkedin.com/in/frankstein",
    // },
    // {
    //   href: "https://www.linkedin.com/in/calvin-bradley-46a8a3113",
    // },
    // {
    //   href: "https://www.linkedin.com/in/carlossubs",
    // },
  ];

  const response = await fetch(
    "https://app.apollo.io/api/v1/linkedin_chrome_extension/parse_search_page",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        accept: "*/*",
        Origin: "chrome-extension://alhgpfoeiimagjlnfekdhkjlkiomcapa",
        "accept-language": "en-US,en-CA;q=0.9,en-AU;q=0.8,en;q=0.7",
        "client-origin": "linkedin",
        "content-type": "application/json",
        "extension-version": "8.1.0",
        priority: "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "none",
        cookie:
          "remember_token_leadgenie_v2=eyJfcmFpbHMiOnsibWVzc2FnZSI6IklqWXpOalEwWWpJMU1HSXhOVGcyTURCall6UTNZMlF3TWw5c1pXRmtaMlZ1YVdWamIyOXJhV1ZvWVhOb0lnPT0iLCJleHAiOiIyMDI0LTA3LTEzVDIyOjU1OjEwLjkzNFoiLCJwdXIiOiJjb29raWUucmVtZW1iZXJfdG9rZW5fbGVhZGdlbmllX3YyIn19--a47f2fbd13ab7972bc728c22902a4f5211dd22f8;",
      },

      referrerPolicy: "strict-origin-when-cross-origin",
      body: `{"url":"https://www.linkedin.com/search/results/people/?keywords=founders&origin=SWITCH_SEARCH_VERTICAL&page=3&sid=b%3B4","linkedin_people":${JSON.stringify(
        linkedinPeople
      )},"cacheKey":1718319381933}`,
      method: "POST",
    }
  );
  const json = await response.json();
  fs.writeFileSync("test.json", JSON.stringify(json, null, 2));
  console.log(json);
  console.log(json.contacts.length);
})();

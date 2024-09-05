import fetch from "node-fetch";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const res = await fetch("https://ipinfo.io/json", {});
    const json = await res.json();

    // DO NOT return a lot of data in these.
    // It is suuuper expensive. So for example, don't return the whole html of a page.
    // parse it first with cheerio and then return the json

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "success", json }),
    };
  } catch (error) {
    console.log("error at handler", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

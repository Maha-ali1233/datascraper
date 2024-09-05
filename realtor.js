import fetch from "node-fetch";
import fs from "graceful-fs";
import { getSmartProxyAgent } from "./proxies.js";
import jwt from "jsonwebtoken";

// Secret key for signing JWTs
const JWT_SECRET = "17ad51b0-08c3-4263-a711-d94477ad7ea3";

// Function to generate JWT token
const generateToken = () => {
  try {
    // Define token payload
    const payload = {
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // Token expires in 1 hour
      sub: "find_a_realtor",
    };

    // Sign the token
    const token = jwt.sign(payload, JWT_SECRET);

    return token;
  } catch (err) {
    // Handle error
    console.error("Error generating token:", err);
    throw err;
  }
};

(async () => {
  const token = generateToken();
  const res = await fetch(
    `https://www.realtor.com/realestateagents/api/v3/search?nar_only=1&offset=&limit=20&postal_code=78702&is_postal_search=true&name=&types=agent&sort=recent_activity_high&far_opt_out=false&client_id=FAR2.0&recommendations_count_min=&agent_rating_min=&languages=&agent_type=&price_min=&price_max=&designations=&photo=true`,
    {
      agent: getSmartProxyAgent(),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        authorization: `Bearer ${token}`,
        priority: "u=1, i",
        "sec-ch-ua":
          '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-newrelic-id": "VwEPVF5XGwQHXFNTBAcAUQ==",
        Referer: "https://www.realtor.com/realestateagents/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    }
  );
  console.log("res.status", res.status);
  const json = await res.json();
  console.log(json);

  fs.writeFileSync("test.json", JSON.stringify(json, null, 2));
})();

import fetch from "node-fetch";
import fs from "graceful-fs";

async function getAccessToken() {
  try {
    const res = await fetch(
      "https://risweb.vacourts.gov/jsra/sra/srauser/login",
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-US,en-CA;q=0.9,en-AU;q=0.8,en;q=0.7",
          authorization: "Basic c3JhYWRtaW46c3JhYWRtaW4=",
          "cache-control": "no-store",
          "content-type": "application/x-www-form-urlencoded",
          "sec-ch-ua":
            '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          cookie:
            "__cf_bm=mxkWr0jSNpu9bMewFyjBYNl8m3io.EVGQ5rtKOCikXk-1687825700-0-AYtS7XHmy/gssG5y1CN1fB1ND3w/wYCkeur/kBQZbxLv1ucCJVwcjscLarKM95VUPgiHMENhvtH465sKgoHi6pM=",
          Referer: "https://risweb.vacourts.gov/jsra/sra/",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: "username=I&password=I&grant_type=password",
        method: "POST",
      }
    );
    const json = await res.json();
    return json?.access_token;
  } catch (error) {
    console.log("error at getAccessToken", error.message);
  }
}

async function getInstrumentDetailsForLandRecords(
  payload,
  accessToken,
  from,
  to
) {
  try {
    /**
     * Document Types
      Mechanics Lien	
      Memorandum of Lien
      Deed Pursuant to Divorce
      Deed Transfer on Death	
      Notice of Lis Pendens	
      Other
      Quitclaim Deed
     */
    const reqPayload = {
      searchNamesList: [payload],
      searchFormReqParams: {
        book_nbr: "",
        bus_flag: "",
        exactTaxMapNumFlg: "N",
        fips: "680",
        group: ["LR"],
        instr_nbr: "",
        instr_type: [
          "DPD    ",
          "DTD    ",
          "LM     ",
          "MEML   ",
          "NLP    ",
          "OTHER  ",
          "DQC    ",
        ],
        name: "%",
        exactSearchNameFlag: "Y",
        name_type: [],
        navigateFlag: "F",
        orderByDateFlag: "A",
        instrPageCnt: 0,
        referenceName: "%",
        srchDescription: "",
        srchFromDt: from,
        srchToDt: to,
        taxMapNum: "",
        page_nbr: "",
        advSearchFlag: false,
      },
    };

    const res = await fetch(
      "https://risweb.vacourts.gov/jsra/sra/api/search/getInstrDetails",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36",
          accept: "application/json, text/plain, */*",
          "accept-language": "en-US,en-CA;q=0.9,en-AU;q=0.8,en;q=0.7",
          authorization: `Bearer ${accessToken}`,
          "cache-control": "no-store",
          "content-type": "application/json",
          "sec-ch-ua":
            '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          // cookie:
          //   "__cf_bm=UjG4o4sIZUajPlz6LUwIhFchHWQwsDX_LBPx8fVLMCE-1687212490-0-AYW13Q4yWzwOScDQrcSYL39hBwOtB/iyR6NPs9ITdtMw95T/Mlq4k1cD/KtgJ2mIC405JRftVgOD1mWaGz6tTsU=",
          Referer: "https://risweb.vacourts.gov/jsra/sra/",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: JSON.stringify(reqPayload),
        method: "POST",
      }
    );
    const json = await res.json();
    return json;
  } catch (error) {
    console.log("error at getInstrumentDetailsForLandRecords", error.message);
  }
}

async function getSearchNames(from, to) {
  try {
    const body = {
      book_nbr: "",
      bus_flag: "",
      exactTaxMapNumFlg: "N",
      fips: "680",
      group: ["LR"],
      instr_nbr: "",
      instr_type: [
        "DPD    ",
        "DTD    ",
        "LM     ",
        "MEML   ",
        "NLP    ",
        "OTHER  ",
        "DQC    ",
      ],
      name: "%",
      exactSearchNameFlag: "Y",
      name_type: [],
      navigateFlag: "F",
      orderByDateFlag: "A",
      instrPageCnt: 0,
      referenceName: "%",
      srchDescription: "",
      srchFromDt: from,
      srchToDt: to,
      taxMapNum: "",
      page_nbr: "",
      advSearchFlag: false,
    };
    const res = await fetch(
      "https://risweb.vacourts.gov/jsra/sra/api/search/getSearchNames",
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-US,en-CA;q=0.9,en-AU;q=0.8,en;q=0.7",
          // authorization:
          //   "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODczMTk1ODgsInVzZXJfbmFtZSI6Im0uYWRyaWFuLmhvcm5pbmdAZ21haWwuY29tIiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9VU0VSIl0sImp0aSI6IjQxOTJlNjJmLTk4MmItNDAzZi04ODIzLWRiZTM1YjE0YmRlMyIsImNsaWVudF9pZCI6InNyYWFkbWluIiwic2NvcGUiOlsidXNlcl9pbmZvIl19.eptXMPcHC7H1qLpR23S6kfa5E62bCP7PQIgcvk_5Vur0K2xNe2AmrWHqZZgjlvfZPUa0x5kqOlJo3V-vgEkyfOapDdG-Wu4V1j5XNRAaJX6xntx1fbaK2UiGO8jiRndcP-KqGE5ka0_Thz_YdG7TuSQRualNCBf1kTK2lqKz7w438UgiJP6QA2Uk8tB9cEfQ5-W8Pvs2pZYx32mlzvoZXhW072LaWZU8bPRMRN_NEJrD1yrkAHZJSAvoJK00ha6xbiuJWhuTrmCrfQ9O-iIHm_JE2syq0A-L2ZCVPR5k3uFTJh_MwH5ULDF-fxAOo-tNHvHYmI4bP_Rgcnejclk8VA",
          "cache-control": "no-store",
          "content-type": "application/json",
          "sec-ch-ua":
            '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          cookie:
            "__cf_bm=UjG4o4sIZUajPlz6LUwIhFchHWQwsDX_LBPx8fVLMCE-1687212490-0-AYW13Q4yWzwOScDQrcSYL39hBwOtB/iyR6NPs9ITdtMw95T/Mlq4k1cD/KtgJ2mIC405JRftVgOD1mWaGz6tTsU=",
          Referer: "https://risweb.vacourts.gov/jsra/sra/",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: JSON.stringify(body),
        method: "POST",
      }
    );
    const json = await res.json();
    return json;
  } catch (error) {
    console.log("error at getSearchNames", error.message);
  }
}

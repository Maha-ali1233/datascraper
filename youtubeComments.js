import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { getSmartProxyUrl } from "./proxies.js";
import fs from "graceful-fs";
import { gotScraping } from "got-scraping";

function getComments(payload) {
  return payload?.frameworkUpdates?.entityBatchUpdate?.mutations
    ?.map((comment) => {
      return comment?.payload?.commentEntityPayload?.properties?.content
        ?.content;
    })
    .filter((c) => c);
}

function getContinuationToken(commentPageResponse) {
  // code: https://github.com/FreeTubeApp/yt-comment-scraper/
  let commentHtml =
    commentPageResponse?.onResponseReceivedEndpoints?.[1]
      ?.reloadContinuationItemsCommand;

  if (!commentHtml) {
    commentHtml =
      commentPageResponse?.onResponseReceivedEndpoints?.[0]
        ?.appendContinuationItemsAction;
  }

  // Reset to return new token back to caller (or null, in case it doesn't exist)
  let token = null;

  if ("continuationItems" in commentHtml) {
    const continuationElem =
      commentHtml.continuationItems[commentHtml.continuationItems.length - 1];
    if ("continuationItemRenderer" in continuationElem) {
      if (
        typeof continuationElem.continuationItemRenderer
          .continuationEndpoint === "undefined"
      ) {
        token =
          continuationElem.continuationItemRenderer.button.buttonRenderer
            .command.continuationCommand.token;
      } else {
        token =
          continuationElem.continuationItemRenderer.continuationEndpoint
            .continuationCommand.token;
      }
    }
  }

  return token;
}

async function getContinuationTokenFromHtml(shortCode) {
  try {
    const res = await gotScraping({
      url: `https://www.youtube.com/watch?v=${shortCode}`,
      proxyUrl: getSmartProxyUrl(),
    });
    // get the ytInitialData script
    const $ = cheerio.load(res.body);
    const scripts = $("script");
    let ytInitialData = null;
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      if (script.children[0]?.data?.includes("ytInitialData")) {
        ytInitialData = script.children[0]?.data;
        break;
      }
    }
    const start = ytInitialData.indexOf("{");
    const end = ytInitialData.lastIndexOf("}");
    const json = ytInitialData.substring(start, end + 1);
    const data = JSON.parse(json);

    const commentsSection =
      data?.contents.twoColumnWatchNextResults.results.results.contents.find(
        (c) => {
          return c?.itemSectionRenderer?.targetId === "comments-section";
        }
      );
    return commentsSection?.itemSectionRenderer?.contents?.[0]
      ?.continuationItemRenderer?.continuationEndpoint?.continuationCommand
      ?.token;
  } catch (error) {
    console.log("error at getContinuationTokenFromHtml", error.message);
  }
}

(async () => {
  // "targetId": "comments-section"
  // let continuation = await getContinuationTokenFromHtml("E6nMJm0pF6I");
  let continuation = await getContinuationTokenFromHtml("FnKJEZ-Chos");
  console.log(continuation);

  while (continuation) {
    const res = await fetch(
      "https://www.youtube.com/youtubei/v1/next?prettyPrint=false",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/json",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
          "sec-ch-ua-arch": '"arm"',
          "sec-ch-ua-bitness": '"64"',
          "sec-ch-ua-full-version": '"125.0.6422.142"',
          "sec-ch-ua-full-version-list":
            '"Google Chrome";v="125.0.6422.142", "Chromium";v="125.0.6422.142", "Not.A/Brand";v="24.0.0.0"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-model": '""',
          "sec-ch-ua-platform": '"macOS"',
          "sec-ch-ua-platform-version": '"13.0.1"',
          "sec-ch-ua-wow64": "?0",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "same-origin",
          "sec-fetch-site": "same-origin",
          "x-goog-visitor-id":
            "Cgt0dm9PeWtBZW5XbyjZla2zBjIKCgJVUxIEGgAgJA%3D%3D",
          "x-youtube-bootstrap-logged-in": "false",
          "x-youtube-client-name": "1",
          "x-youtube-client-version": "2.20240613.01.00",
          Referer: "https://www.youtube.com/watch?v=E6nMJm0pF6I",
          "Referrer-Policy": "origin-when-cross-origin",
        },
        body: `{"context":{"client":{"hl":"en","gl":"US","remoteHost":"66.90.148.76","deviceMake":"Apple","deviceModel":"","visitorData":"Cgt0dm9PeWtBZW5XbyjZla2zBjIKCgJVUxIEGgAgJA%3D%3D","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36,gzip(gfe)","clientName":"WEB","clientVersion":"2.20240613.01.00","osName":"Macintosh","osVersion":"10_15_7","originalUrl":"https://www.youtube.com/watch?v=E6nMJm0pF6I","platform":"DESKTOP","clientFormFactor":"UNKNOWN_FORM_FACTOR","configInfo":{"appInstallData":"CNmVrbMGEPzwsAUQ4eywBRDO-LAFEJaf_xIQ3P-wBRCI468FEJPvsAUQlpWwBRD2q7AFEKrYsAUQy_KwBRDjrf8SEKDosAUQ0-GvBRCJ6K4FEOvo_hIQ4tSuBRC3q7AFEMnXsAUQnaawBRCa8K8FEOuTrgUQi_KwBRDP-LAFENfprwUQx_2wBRCr77AFEP_ksAUQyvmwBRCK7LAFENjlsAUQzdewBRDe9bAFEKiasAUQz6iwBRDX3bAFEKaasAUQvYqwBRCi6LAFEKz7sAUQvbauBRCd0LAFENL4sAUQkLKwBRC36v4SEPOhsAUQ6sOvBRCIh7AFENWIsAUQ26-vBRCz_rAFEMb_sAUQsdywBRCw7rAFEOX0sAUQo_iwBRC--a8FEI_EsAUQpcL-EhCk7bAFEIO_sAUQjtqwBRCikrAFEPyFsAUQ49GwBRDd6P4SENbnsAUQooGwBRDQjbAFEKfjsAUQ0PqwBRC3768FEJT-sAUQloOxBRDs9rAFEPur_xIQ1t2wBRD0q7AFEO_NsAUQ1KGvBRCLz7AFEPex_xIQvZmwBRCXg7AFEJeBsQUQtbH_EhCCov8SEMzfrgUQjcywBRDZya8FEL2DsQUQ8-uwBRDO67AFEO6irwUQyfevBRD68LAFENHrsAUQ3YKxBSokQ0FNU0Z4VVVwYjJ3RE56a0JxQ1E5QXZiRy1peEJQYnRCaDBI"},"userInterfaceTheme":"USER_INTERFACE_THEME_DARK","timeZone":"America/Chicago","browserName":"Chrome","browserVersion":"125.0.0.0","acceptHeader":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7","deviceExperimentId":"ChxOek00TURBM05EY3hNRFk1TnpVNE56WTFNUT09ENmVrbMGGNmVrbMG","screenWidthPoints":1920,"screenHeightPoints":453,"screenPixelDensity":1,"screenDensityFloat":1,"utcOffsetMinutes":-300,"connectionType":"CONN_CELLULAR_4G","memoryTotalKbytes":"8000000","mainAppWebInfo":{"graftUrl":"https://www.youtube.com/watch?v=E6nMJm0pF6I","pwaInstallabilityStatus":"PWA_INSTALLABILITY_STATUS_UNKNOWN","webDisplayMode":"WEB_DISPLAY_MODE_FULLSCREEN","isWebNativeShareAvailable":false}},"user":{"lockedSafetyMode":false},"request":{"useSsl":true,"internalExperimentFlags":[],"consistencyTokenJars":[{"encryptedTokenJarContents":"AKreu9uI5GnJRPriKSiXca05wwN93ntC8yU5Eu0Q7R9y0UKC-0J9ABPXQhijgSmtAl-Ec0Xrswjx2rvdQAQ_B7nbe8axPzSnWup1wnaAcMt3uSYt5-Nz41SAyK4bytsMJGUzOTT8b729QBZlWd3h6hw","expirationSeconds":"600"}]},"clickTracking":{"clickTrackingParams":"CNoBELsvGAMiEwj76YG3qtmGAxXqqP8EHYIhAHI="},"adSignalsInfo":{"params":[{"key":"dt","value":"1718307546570"},{"key":"flash","value":"0"},{"key":"frm","value":"0"},{"key":"u_tz","value":"-300"},{"key":"u_his","value":"2"},{"key":"u_h","value":"1080"},{"key":"u_w","value":"1920"},{"key":"u_ah","value":"1080"},{"key":"u_aw","value":"1920"},{"key":"u_cd","value":"24"},{"key":"bc","value":"31"},{"key":"bih","value":"453"},{"key":"biw","value":"1920"},{"key":"brdim","value":"0,0,0,0,1920,0,1920,1080,1920,453"},{"key":"vis","value":"1"},{"key":"wgl","value":"true"},{"key":"ca_type","value":"image"}]}},"continuation":"${continuation}"}`,
        method: "POST",
      }
    );
    const data = await res.json();

    const token = getContinuationToken(data);
    console.log(token);
    const comments = getComments(data);
    console.log(comments);
    if (token) {
      continuation = token;
    } else {
      continuation = null;
      break;
    }
  }

  console.log("Done");
})();

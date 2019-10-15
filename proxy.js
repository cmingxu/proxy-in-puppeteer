const url = require("url");
const fs = require("fs");

const usage =
  "node proxy.js target_url proxy\n" +
  "\n" +
  "\ttarget_url - target url connect to\n" +
  "\tproxy - the proxy address use to proxy this very request, no proxy if left empty\n";

if (process.argv.length > 4 || process.argv.length <= 2) {
  console.log(usage);
  console.error("invalid argument list");
  process.exit(1);
}

let target = process.argv[2];
let proxy = process.argv.length == 4 ? process.argv[3] : "";
// no proxy, pass through the request
let noProxy = proxy == "";
// fake user agent
let ua = process.env.USER_AGENT;
let referr = process.env.REFERR;
let isDebug = process.env.DEBUG;
let targetDomain = url.parse(target).host;

console.log(
  `${new Date()} start requesting page ${target} through proxy ${proxy}`
);

const puppeteer = require("puppeteer");

let launchOptions = {
  ignoreHTTPSErrors: true,
  headless: true,
  args: [`--proxy-server=${proxy}`]
};

(async () => {
  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", request => {
    let needAbort = false;
    if (request.resourceType() == "image") {
      needAbort = true;
    }

    if (request.resourceType() == "stylesheet") {
      needAbort = true;
    }

    if (url.parse(request.url()).host.indexOf(targetDomain) < 0) {
      needAbort = true;
    }

    if (needAbort) {
      request.abort();
    } else {
      request.continue();
    }
  });

  try {
    await page.goto(target);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  const body = await page.evaluate(() => {
    return document.body.innerHTML;
  });

  await browser.close();
  process.stdout.write(body.length);
  fs.writeFileSync("./index.html", body);
})();

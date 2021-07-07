import { playAudit } from './playAudit'
import playwright from 'playwright'
import uaParser from 'ua-parser-js'
const chai = require('chai')
const chaiHTTP = require('chai-http')
chai.use(chaiHTTP)
before(async () => {
    let context, device
    global.browser = await playwright.chromium.launch({
        headless: false ,
        args: ['--remote-debugging-port=9222'],
        viewport: {
            width: 1280,
            height: 720,
        },
        deviceScaleFactor: 2.625
    })
    context = await browser.newContext();
    let page = await context.newPage()
    const getUA = await page.evaluate(() => navigator.userAgent);
    global.userAgent = uaParser(getUA).ua;
    global.page = page
    global.isHear = false

})
after(async()=> {
    await page.close()
    await browser.close()
})
it('TC000_Full_Smoke Check Performance', async () => {
    let _requestjs = {"memberId": 1001052,"memberName":"GJ62Pjtn","language":"vi-VN","currency":"$US","seq":"d,y,lumi","siteId":"4100300","ip":"","isMobi":true,"browserUserAgent": userAgent,"auth":{"clientId":"gamesimulator","clientSecret":"gamesimulator@20luminet&"},"token":null,"redirectUrl":"#","verifyResult":null,"gameId":0,"setting":{"owUrl":""},"domain":"example.com","localhost":null,"resource":null}
    let pg = await chai.request("https://gamelobby-simulator.lumigame.com/signin").post("/sso").send(_requestjs)
    console.log(pg.text)
    const obj = JSON.parse(pg.text);
    await page.goto("https://google.com")
    const config = {
        extends: 'lighthouse:default',
        settings: {
          maxWaitForFcp: 15 * 1000,
          maxWaitForLoad: 35 * 1000,
          formFactor: 'desktop',
          screenEmulation: {
            mobile: false,
            deviceScaleFactor: 2.625,
            width: 1280,
            height: 720,
            disabled: false,
          },
          emulatedUserAgent: userAgent
        }
    }
    let defaultThresholds= {
        performance: 0,
        accessibility: 100,
        'best-practices': 100,
        seo: 100,
        pwa: 100,
    }
    await playAudit({
        page: page,
        url : obj.redirectUrl,
        port: 9222,
        reports: {
            formats: {
                json: true, //defaults to false
                html: true, //defaults to false
                csv: true, //defaults to false
            },
            name: `lighthouse-${new Date().getTime()}`, //defaults to `lighthouse-${new Date().getTime()}`
            directory: `${process.cwd()}/lighthouse`, //defaults to `${process.cwd()}/lighthouse`
        },
        thresholds: {
            performance : 0
        },
        opts: {
            disableStorageReset : true
        },
        config: config,
        ua : userAgent
    })
})
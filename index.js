import * as playLight from 'playwright-lighthouse'
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
            width: 720,
            height: 1280,
        },
        deviceScaleFactor: 1
    //  args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-gpu', '--use-gl=swiftshader','--enable-webgl']
    })
    // context = await browser.newContext(device);
    
    context = await browser.newContext();


    let page = await context.newPage()
    const getUA = await page.evaluate(() => navigator.userAgent);
    global.userAgent = uaParser(getUA).ua;
    global.page = page
    global.isHear = false
    // console.log(process.argv)
    // Set balance on Local


})
after(async()=> {
    await page.close()
    await browser.close()
})
it('TC000_Full_Smoke Check Performance', async () => {
    let _requestjs = {"memberId": 1001010,"memberName":"GJ62Pjtn","language":"vi-VN","currency":"$US","seq":"d,y,lumi","siteId":"4100300","ip":"","isMobi":true,"browserUserAgent": userAgent,"auth":{"clientId":"gamesimulator","clientSecret":"gamesimulator@20luminet&"},"token":null,"redirectUrl":"#","verifyResult":null,"gameId":0,"setting":{"owUrl":""},"domain":"example.com","localhost":null,"resource":null}
    let pg = await chai.request("https://gamelobby-simulator.lumigame.com/signin").post("/sso").send(_requestjs)
    console.log(pg.text)
    const obj = JSON.parse(pg.text);
    await page.goto(obj.redirectUrl)
    // await page.close()
    // await lighthouse(obj.redirectUrl, {port: 9222, disableStorageReset: true})
    const config = {
        extends: 'lighthouse:default',
        settings: {
          maxWaitForFcp: 15 * 1000,
          maxWaitForLoad: 35 * 1000,
          formFactor: 'desktop',
          screenEmulation: {
            mobile: false,
            deviceScaleFactor: 1,
            width: 1280,
            height: 720,
            disabled: false,
          },
          emulatedUserAgent: userAgent
        }
    }
    await page.waitForURL(/https:\/\/l1-m.lumigame.com/)
    // await page.waitForLoadState()
    // await page.waitForTimeout(3000)
    await playLight.playAudit({
        page : page,
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
        opts: {
            disableStorageReset : true
        },
        config: config,
    })
})
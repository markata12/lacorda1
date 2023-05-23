import { Builder, By, until, Key, WebDriver } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';

const username = 'lora.georgieva@gmail.com';
const password = 'v9nH5BTv';

export async function fetchAllInformation(uics: string[]) {
    try {
        const result = [];
        console.info('Начало на дърпането');
        
        for(const uic of uics) {
            const data = await fetchInformation(uic)
            const entries = new Map([[uic, data.message]]);
            result.push(Object.fromEntries(entries));
        }
        console.info('Край на операцията');

        return result;

    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'Грешка'
        }
    } 
}

export async function fetchInformation(uic: string): Promise<Record<string, any>> {
    const driver = await new Builder().forBrowser("chrome").setChromeOptions(new Options().headless()).build();

    try {
        console.info(`Старт на дърпането на информация за дружество с ЕИК: ${uic}`);
        await signIn(username, password, driver);
        await clickOnBusinessRegister(driver);
        await navigateToCompanyInformation(uic, driver);
        const result = await getCompanyInformation(driver);
        console.info(`Успешно дръпната информация за дружество с ЕИК ${uic}`);
        return result;
    } catch (error) {
        console.error(`Не успях да дръпна информация за дружество с ЕИК ${uic}`);
        return {
            success: false,
            message: JSON.stringify(error)
        }
    }
    finally {
        await driver.quit();
    }
}

async function signIn(username: string, password: string, driver: WebDriver): Promise<void> {
    await driver.get("https://web.lakorda.com");
    const usernameInput = await driver.findElement(By.name('lakordauser'));
    const passwordInput = await driver.findElement(By.name('lakordapass'));

    await usernameInput.sendKeys(username);
    await passwordInput.sendKeys(password, Key.RETURN);

    await driver.wait(until.elementLocated(By.id('elgen-6')), 10000);
    console.info('Успешно вписване в Лакорда');
}

async function clickOnBusinessRegister(driver: WebDriver): Promise<void> {
    const button = await driver.findElement(By.xpath('/html/body/div[6]/div[2]/div/span[1]/a[4]'));
    await button.click();
    await driver.wait(async () => (await driver.getAllWindowHandles()).length === 2, 5000);

    const handles = await driver.getAllWindowHandles();
    await driver.switchTo().window(handles[1]);
    await driver.wait(until.elementLocated(By.className('ylayout-panel-hd-text')));
    console.info('Успешно отваряне на Бизнес регистъра.')
}

async function navigateToCompanyInformation(uic: string, driver: WebDriver): Promise<void> {
    console.info('Навигиране до страницата на дружеството.')
    const searchInput = await driver.findElement(By.id('edQuery'));
    await searchInput.sendKeys(uic, Key.RETURN);

    await driver.wait(until.elementLocated(By.id('resultbody')));
    const resultElement = await driver.findElement(By.className('oneresfirst'));
    const button = await resultElement.findElement(By.className('restitlelink'));

    await button.click();
    await driver.wait(async () => (await driver.getAllWindowHandles()).length === 3, 5000);
    const handles = await driver.getAllWindowHandles();
    await driver.switchTo().window(handles[2]);
    await driver.wait(until.elementLocated(By.id('doccontent')));
}

async function getCompanyInformation(driver: WebDriver) {
    console.info('Дърпане на информацията за дружеството');
    const iframe = await driver.findElement(By.id('doccontent'));
    await driver.switchTo().frame(iframe);
    const iframeHTML = await driver.findElement(By.tagName('html')).getAttribute('innerHTML');
    
    return {
        message: iframeHTML
    };
}
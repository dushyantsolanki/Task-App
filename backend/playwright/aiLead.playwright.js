// import { chromium } from 'playwright-extra';
// import { GoogleGenAI } from '@google/genai';
// import stealth from 'puppeteer-extra-plugin-stealth';
// import { sendAILeadStatus } from '../sockets/events/lead.event.js';

// const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });
// chromium.use(stealth());

// function sleep(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// async function randomMouseMovement(page, count = 5) {
//   const { width, height } = await page.viewportSize();
//   for (let i = 0; i < count; i++) {
//     const x = Math.random() * width;
//     const y = Math.random() * height;
//     await page.mouse.move(x, y, { steps: Math.floor(10 + Math.random() * 20) });
//     await sleep(200 + Math.random() * 500);
//   }
// }

// function convertToJson(response) {
//   console.log('convertToJson :: ', convertToJson);
//   try {
//     const cleaned = response.replace(/```json|```/g, '').trim();
//     const parsed = JSON.parse(cleaned);

//     const allPhones = parsed.phones || [];
//     let phone = '';
//     let phones = [];

//     if (allPhones.length > 0) {
//       phone = allPhones[0]; // primary phone
//       phones = allPhones.length > 1 ? allPhones.slice(1) : [];
//     }

//     return {
//       ...parsed,
//       leadStatus: 'new',
//       phone,
//       phones,
//     };
//   } catch (error) {
//     console.error('Failed to convert response to JSON:', error);
//     return null;
//   }
// }

// async function humanScroll(page) {
//   let currentScroll = 0;
//   let totalHeight = await page.evaluate(() => document.body.scrollHeight);
//   let baseScrollStep = 200 + Math.floor(Math.random() * 1080);
//   const maxAttempts = 5;
//   let attempts = 0;
//   let lastScrollPosition = 0;
//   const maxExecutionTime = 60000;
//   const startTime = Date.now();

//   // Enable smooth scrolling
//   await page.evaluate(() => {
//     document.documentElement.style.scrollBehavior = 'smooth';
//     document.documentElement.style.setProperty('--scroll-behavior-duration', '0.3s');
//   });

//   // Helper: Wait until scroll settles
//   const waitForScrollEnd = async (page, timeout = 3000) => {
//     let lastY = await page.evaluate(() => window.scrollY);
//     let attempts = 0;
//     const maxAttempts = Math.floor(timeout / 200);

//     while (attempts < maxAttempts) {
//       await page.waitForTimeout(200);
//       const currentY = await page.evaluate(() => window.scrollY);
//       if (Math.abs(currentY - lastY) < 5) break; // settled within 5px
//       lastY = currentY;
//       attempts++;
//     }
//   };

//   const simulateScroll = async (step) => {
//     await page.evaluate((targetY) => {
//       window.scrollTo({
//         top: targetY,
//         behavior: 'smooth',
//       });
//     }, currentScroll + step);
//   };

//   const checkNewContent = async () => {
//     const newHeight = await page.evaluate(() => document.body.scrollHeight);
//     const newScrollPosition = await page.evaluate(() => window.scrollY);

//     if (newHeight > totalHeight || newScrollPosition > lastScrollPosition) {
//       totalHeight = newHeight;
//       lastScrollPosition = newScrollPosition;
//       attempts = 0;
//       return true;
//     }
//     return false;
//   };

//   while (
//     currentScroll < totalHeight &&
//     attempts < maxAttempts &&
//     Date.now() - startTime < maxExecutionTime
//   ) {
//     const progressRatio = currentScroll / totalHeight;
//     const speedMultiplier = 1 + progressRatio * 30.0;
//     let scrollStep = Math.floor(baseScrollStep * speedMultiplier);

//     await simulateScroll(scrollStep);
//     await waitForScrollEnd(page); // Wait for actual scroll to finish
//     currentScroll = await page.evaluate(() => window.scrollY); // Sync with actual position

//     const hasNewContent = await checkNewContent();
//     if (!hasNewContent) {
//       console.log(`\n No new content. Attempt ${attempts + 1}/${maxAttempts}`);
//       attempts++;
//     }

//     if (Math.random() > 0.65) {
//       await page.waitForTimeout(800 + Math.random() * 1500);
//     }

//     if (Math.random() > 0.8 && currentScroll > scrollStep * 2) {
//       const backScroll = scrollStep * (0.3 + Math.random() * 0.5);
//       await page.evaluate((scroll) => {
//         window.scrollTo({
//           top: window.scrollY - scroll,
//           behavior: 'smooth',
//         });
//       }, backScroll);
//       await waitForScrollEnd(page);
//       currentScroll = await page.evaluate(() => window.scrollY); // Re-sync after backscroll
//     }

//     if (attempts > maxAttempts * 0.8) {
//       console.log('\n Force jumping to bottom...');
//       await page.evaluate(() =>
//         window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' }),
//       );
//       await waitForScrollEnd(page, 5000);
//       totalHeight = await page.evaluate(() => document.body.scrollHeight);
//       currentScroll = await page.evaluate(() => window.scrollY);
//     }
//   }

//   if (Date.now() - startTime >= maxExecutionTime || attempts >= maxAttempts) {
//     console.log('\n Scroll terminated: Max execution time or attempts reached.');
//     await page.evaluate(() =>
//       window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' }),
//     );
//     await waitForScrollEnd(page, 5000);
//     totalHeight = await page.evaluate(() => document.body.scrollHeight);
//   }

//   await page.evaluate(() =>
//     window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
//   );
//   await waitForScrollEnd(page, 5000); // Important: wait for final settle
//   totalHeight = await page.evaluate(() => document.body.scrollHeight);

//   // Optional: wait a bit for any lazy content to fully load after final scroll
//   await page.waitForTimeout(2000);

//   console.log('\n Scrolling completed. Final page height:', totalHeight);
//   return totalHeight;
// }

// async function detectAndHandleCaptcha(page) {
//   const captchaSelectors = [
//     'input[type="checkbox"][id*="captcha"]',
//     'div[class*="captcha"]',
//     'iframe[src*="recaptcha"]',
//     '#g-recaptcha',
//   ];

//   for (const selector of captchaSelectors) {
//     const captchaElement = await page.$(selector);
//     if (captchaElement) {
//       console.log('\n Captcha detected! Pausing for manual intervention');
//       // Pause for manual solving (or integrate a captcha-solving service)
//       await page.waitForTimeout(1000);
//       return true;
//     }
//   }
//   return false;
// }

// // async function extractContactInfo(page) {
// //   const content = await page.content();
// //   console.log(content);
// //   const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(?:com|net|org|in|co|edu|gov|io|ai)\b/g;

// //   const phoneRegex = (text.match(/(?:\+?91)?[6-9]\d{9}\b/g) || [])
// //     .map((num) =>
// //       num.replace(/\D/g, '').length === 10 ? '91' + num.replace(/\D/g, '') : num.replace(/\D/g, ''),
// //     )
// //     .filter(Boolean);

// //   const emails = [...content.matchAll(emailRegex)].map((m) => m[0]);
// //   const phones = [...content.matchAll(phoneRegex)].map((m) => m[0]);

// //   return {
// //     emails: [...new Set(emails)],
// //     phones: [...new Set(phones)],
// //   };
// // }

// async function extractContactInfo(page) {
//   const content = await page.content();

//   const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(?:com|net|org|in|co|edu|gov|io|ai)\b/g;
//   const emails = [...content.matchAll(emailRegex)].map((match) => match[0]);

//   // Also extract from mailto: links via DOM evaluation (more reliable)
//   const mailtoEmails = await page.evaluate(() => {
//     const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(?:com|net|org|in|co|edu|gov|io|ai)\b/;
//     const found = new Set();

//     document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
//       const href = a.getAttribute('href');
//       const email = href
//         .replace(/^mailto:/, '')
//         .split('?')[0]
//         .trim(); // Remove params like ?subject
//       if (emailRegex.test(email)) {
//         found.add(email);
//       }
//     });

//     return Array.from(found);
//   });

//   const allEmails = [...new Set([...emails, ...mailtoEmails])];

//   const phoneRegex = /(?:\+?91[-.\s]?)?[6-9]\d{9}\b/g;
//   const rawPhones = [...content.matchAll(phoneRegex)].map((match) => match[0]);

//   // Clean and normalize each phone number
//   const cleanedPhones = rawPhones
//     .map((num) => {
//       let digits = num.replace(/\D/g, '');
//       if (digits.length === 10 && /^[6-9]/.test(digits)) {
//         digits = '91' + digits;
//       }
//       // If it starts with '0' and is 11 digits, remove '0' and prepend '91'
//       else if (digits.length === 11 && digits.startsWith('0') && /^[6-9]/.test(digits[1])) {
//         digits = '91' + digits.slice(1);
//       }
//       // If it starts with '91' and is 12 digits, keep as is
//       else if (digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits[2])) {
//       } else {
//         return null;
//       }
//       return digits;
//     })
//     .filter(Boolean); // Remove nulls

//   const allPhones = [...new Set(cleanedPhones)];

//   return {
//     emails: allEmails,
//     phones: allPhones,
//   };
// }

// async function scrapeCompany(companyName, userId) {
//   console.log(`\n Initiating scraper for: ${companyName}`);
//   sendAILeadStatus({
//     type: 'ai_lead_status',
//     recipient: userId,
//     statusMsg: `Initiating scraper for: ${companyName}`,
//   });

//   const browser = await chromium.launch({
//     headless: true,
//     args: [
//       '--disable-blink-features=AutomationControlled',
//       '--disable-web-security',
//       '--disable-features=IsolateOrigins,site-per-process',
//       '--no-sandbox',
//       '--disable-setuid-sandbox',
//       '--disable-dev-shm-usage',
//     ],
//   });

//   const context = await browser.newContext({
//     viewport: { width: 1920, height: 1080 },
//     userAgent:
//       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
//     locale: 'en-US',
//     timezoneId: 'America/New_York',
//     ignoreHTTPSErrors: true,
//     extraHTTPHeaders: {
//       'Accept-Language': 'en-US,en;q=0.9',
//       Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//     },
//   });

//   const page = await context.newPage();
//   page.setDefaultTimeout(60000);
//   sendAILeadStatus({
//     type: 'ai_lead_status',
//     recipient: userId,
//     statusMsg: `Launching browser instance`,
//   });

//   // Inject stealth script
//   // await page.addInitScript(stealthInitScript);

//   try {
//     // Step 1: Scrape Google Maps
//     sendAILeadStatus({
//       type: 'ai_lead_status',
//       recipient: userId,
//       statusMsg: `Navigating to Google Maps search page`,
//     });
//     console.log('\n Navigating to Google Maps search page');
//     await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(companyName)}`, {
//       waitUntil: 'domcontentloaded',
//       timeout: 30000,
//     });

//     sendAILeadStatus({
//       type: 'ai_lead_status',
//       recipient: userId,
//       statusMsg: `Checking for Captcha challenges`,
//     });
//     // Check for captcha
//     if (await detectAndHandleCaptcha(page)) {
//       console.log('\n Handling for Captcha challenges resuming scraping');
//       sendAILeadStatus({
//         type: 'ai_lead_status',
//         recipient: userId,
//         statusMsg: `Handling for Captcha challenges`,
//       });
//     }

//     await sleep(1500 + Math.random() * 2500);
//     await randomMouseMovement(page, 3);
//     await humanScroll(page);

//     await page.waitForSelector('.DUwDvf', { timeout: 15000 }).catch(() => {
//       throw new Error('Please enter a correct company name.');
//     });

//     sendAILeadStatus({
//       type: 'ai_lead_status',
//       recipient: userId,
//       statusMsg: `Collecting company profile details`,
//     });
//     const result = await page.evaluate(() => {
//       const getText = (selector) => document.querySelector(selector)?.textContent?.trim() || null;
//       const getHref = (selector) => document.querySelector(selector)?.href || null;
//       const addressText = getText('[data-item-id="address"] .Io6YTe') || '';

//       return {
//         title: getText('.DUwDvf'),
//         address: addressText,
//         website: getHref('a[data-item-id="authority"]'),
//         phones: getText('[data-item-id^="phone:tel"] .Io6YTe'),
//         categories: getText('.DkEaL') ? [getText('.DkEaL')] : [],
//       };
//     });

//     if (result.website) {
//       try {
//         const url = new URL(result.website);
//         result.domain = url.hostname;
//       } catch (e) {
//         result.domain = null;
//       }
//     } else {
//       result.domain = null;
//     }

//     result.phones = result.phones ? [result.phones] : [];
//     result.emails = [];

//     // Step 2: Scrape website for contact info
//     if (result.website) {
//       console.log(
//         `\n Collecting company profile details (name, address, category, phone ${result.website}`,
//       );
//       sendAILeadStatus({
//         type: 'ai_lead_status',
//         recipient: userId,
//         statusMsg: `Navigating to company website `,
//       });
//       try {
//         await page.goto(result.website, { waitUntil: 'domcontentloaded', timeout: 60000 });
//         sendAILeadStatus({
//           type: 'ai_lead_status',
//           recipient: userId,
//           statusMsg: `Checking for Captcha challenges`,
//         });
//         if (await detectAndHandleCaptcha(page)) {
//           console.log('\n Captcha handled on website, resuming');
//           sendAILeadStatus({
//             type: 'ai_lead_status',
//             recipient: userId,
//             statusMsg: `Handling for Captcha challenges`,
//           });
//         }

//         await sleep(1000 + Math.random() * 2500);
//         await randomMouseMovement(page, 4);
//         await humanScroll(page);

//         // Simulate human-like interactions (e.g., random link hover or click)
//         // try {
//         //   const links = await page.$$('a[href]:not([href="#"])');
//         //   if (links.length > 0) {
//         //     const randomLink = links[Math.floor(Math.random() * Math.min(5, links.length))];
//         //     await randomLink.hover();
//         //     if (Math.random() > 0.7) {
//         //       await randomLink.click();
//         //       await page.waitForTimeout(1500 + Math.random() * 100);
//         //       await page.goBack({ timeout: 1000 });
//         //     }
//         //   }
//         // } catch (err) {
//         //   console.log('Interaction failed, skipping...');
//         // }

//         const contactInfo = await extractContactInfo(page);
//         sendAILeadStatus({
//           type: 'ai_lead_status',
//           recipient: userId,
//           statusMsg: `Analyzing company website for contact details and relevant data`,
//         });
//         result.emails = contactInfo.emails;
//         result.phones = [...new Set([...result.phones, ...contactInfo.phones])];
//       } catch (e) {
//         sendAILeadStatus({
//           type: 'ai_lead_status',
//           recipient: userId,
//           statusMsg: `Company data successfully extracted and formatted. `,
//         });
//         console.log(`\n Unable to retrieve company details: ${e.message}`);
//       }
//     } else {
//       sendAILeadStatus({
//         type: 'ai_lead_status',
//         recipient: userId,
//         statusMsg: `No website found for the company.`,
//       });
//       console.log('\n No website found for the company.');
//     }

//     // Validate required fields
//     if (!result.title) throw new Error('Company Name is required');
//     if (!result.address) throw new Error('Address is required');
//     if (!result.phones.length) throw new Error('At least one phone is required');
//     if (!result.categories.length) throw new Error('At least one category is required');
//     if (!result.emails.length) console.warn('No emails found');

//     return result;
//   } catch (error) {
//     console.error(`Error scraping ${companyName}: ${error.message}`);
//     return null;
//   } finally {
//     console.log('\n Closing browser session...');

//     await sleep(1500);
//     await browser.close();
//     sendAILeadStatus({
//       type: 'ai_lead_status',
//       recipient: userId,
//       statusMsg: `Closing browser session`,
//     });
//   }
// }

// const AILeadScrapper = async (company, userId) => {
//   if (!!company == false) {
//     throw new Error('Company Name is required');
//   }
//   try {
//     const rawData = await scrapeCompany(company, userId);
//     console.log(rawData);
//     if (rawData) {
//       sendAILeadStatus({
//         type: 'ai_lead_status',
//         recipient: userId,
//         statusMsg: `AI formate a lead`,
//       });
//       const response = await ai.models.generateContent({
//         model: 'gemini-2.5-flash',
//         contents: `You are a data formatting assistant. Your task is to transform raw business or company data into a clean JSON object.context : ${JSON.stringify(
//           rawData,
//           null,
//           0,
//         )} Always output valid JSON only. Use the following structure: {"title": "","address": "","city": "",
// "state": "",postalCode:"","countryCode": "","phones": [],"categories": [],"emails": [],website:''} Rules: 1. "title": Company or business name only.2. "address": Full street address, without city/state duplication.3. "city", "state", "countryCode": Extract and fill if present in the address. Use ISO-2 country codes (e.g., "IN" for India, "US" for United States).4. "phones": Extract all phone numbers, remove duplicates, format consistently with country code if available.5. "emails": Extract all valid emails, remove duplicates.6. "categories": Business categories or industry keywords (keep as an array of strings).7. If a field is missing, return an empty string "" or empty array [].8. Do not add extra fields. Do not include explanations. Return only the JSON object.
//           `,
//       });
//       const formatedJSON = convertToJson(response.text);
//       sendAILeadStatus({
//         type: 'ai_lead_status',
//         recipient: userId,
//         statusMsg: `Company data successfully extracted and formatted. `,
//       });

//       return { formatedJSON, rawData };
//     } else {
//       console.log('\n Scraping failed.');
//       sendAILeadStatus({
//         type: 'ai_lead_status',
//         recipient: userId,
//         statusMsg: `Unable to retrieve company full details`,
//       });
//     }
//   } catch (error) {
//     console.error('Scraping error:', error);
//   }
// };

// export { AILeadScrapper };

import { chromium } from 'playwright-extra';
import { GoogleGenAI } from '@google/genai';
import stealth from 'puppeteer-extra-plugin-stealth';
import { sendAILeadStatus } from '../sockets/events/lead.event.js';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });
chromium.use(stealth());

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function randomMouseMovement(page, count = 5) {
  try {
    const { width, height } = await page.viewportSize();
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      await page.mouse.move(x, y, { steps: Math.floor(10 + Math.random() * 20) });
      await sleep(200 + Math.random() * 500);
    }
  } catch (error) {
    console.error('Error in random mouse movement:', error.message);
  }
}

function convertToJson(response) {
  console.log('Converting response to JSON:', response);
  try {
    const cleaned = response.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const allPhones = parsed.phones || [];
    let phone = '';
    let phones = [];

    if (allPhones.length > 0) {
      phone = allPhones[0]; // primary phone
      phones = allPhones.length > 1 ? allPhones.slice(1) : [];
    }

    return {
      ...parsed,
      leadStatus: 'new',
      phone,
      phones,
    };
  } catch (error) {
    console.error('Failed to convert response to JSON:', error.message);
    return null;
  }
}

async function humanScroll(page) {
  try {
    let currentScroll = 0;
    let totalHeight = await page.evaluate(() => document.body.scrollHeight);
    let baseScrollStep = 200 + Math.floor(Math.random() * 1080);
    const maxAttempts = 5;
    let attempts = 0;
    let lastScrollPosition = 0;
    const maxExecutionTime = 60000;
    const startTime = Date.now();

    // Enable smooth scrolling
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'smooth';
      document.documentElement.style.setProperty('--scroll-behavior-duration', '0.3s');
    });

    // Helper: Wait until scroll settles
    const waitForScrollEnd = async (page, timeout = 3000) => {
      let lastY = await page.evaluate(() => window.scrollY);
      let attempts = 0;
      const maxAttempts = Math.floor(timeout / 200);

      while (attempts < maxAttempts) {
        await page.waitForTimeout(200);
        const currentY = await page.evaluate(() => window.scrollY);
        if (Math.abs(currentY - lastY) < 5) break; // settled within 5px
        lastY = currentY;
        attempts++;
      }
    };

    const simulateScroll = async (step) => {
      await page.evaluate((targetY) => {
        window.scrollTo({
          top: targetY,
          behavior: 'smooth',
        });
      }, currentScroll + step);
    };

    const checkNewContent = async () => {
      const newHeight = await page.evaluate(() => document.body.scrollHeight);
      const newScrollPosition = await page.evaluate(() => window.scrollY);

      if (newHeight > totalHeight || newScrollPosition > lastScrollPosition) {
        totalHeight = newHeight;
        lastScrollPosition = newScrollPosition;
        attempts = 0;
        return true;
      }
      return false;
    };

    while (
      currentScroll < totalHeight &&
      attempts < maxAttempts &&
      Date.now() - startTime < maxExecutionTime
    ) {
      const progressRatio = currentScroll / totalHeight;
      const speedMultiplier = 1 + progressRatio * 30.0;
      let scrollStep = Math.floor(baseScrollStep * speedMultiplier);

      await simulateScroll(scrollStep);
      await waitForScrollEnd(page); // Wait for actual scroll to finish
      currentScroll = await page.evaluate(() => window.scrollY); // Sync with actual position

      const hasNewContent = await checkNewContent();
      if (!hasNewContent) {
        console.log(`No new content. Attempt ${attempts + 1}/${maxAttempts}`);
        attempts++;
      }

      if (Math.random() > 0.65) {
        await page.waitForTimeout(800 + Math.random() * 1500);
      }

      if (Math.random() > 0.8 && currentScroll > scrollStep * 2) {
        const backScroll = scrollStep * (0.3 + Math.random() * 0.5);
        await page.evaluate((scroll) => {
          window.scrollTo({
            top: window.scrollY - scroll,
            behavior: 'smooth',
          });
        }, backScroll);
        await waitForScrollEnd(page);
        currentScroll = await page.evaluate(() => window.scrollY); // Re-sync after backscroll
      }

      if (attempts > maxAttempts * 0.8) {
        console.log('Force jumping to bottom...');
        await page.evaluate(() =>
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' }),
        );
        await waitForScrollEnd(page, 5000);
        totalHeight = await page.evaluate(() => document.body.scrollHeight);
        currentScroll = await page.evaluate(() => window.scrollY);
      }
    }

    if (Date.now() - startTime >= maxExecutionTime || attempts >= maxAttempts) {
      console.log('Scroll terminated: Max execution time or attempts reached.');
      await page.evaluate(() =>
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' }),
      );
      await waitForScrollEnd(page, 5000);
      totalHeight = await page.evaluate(() => document.body.scrollHeight);
    }

    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
    );
    await waitForScrollEnd(page, 5000); // Important: wait for final settle
    totalHeight = await page.evaluate(() => document.body.scrollHeight);

    // Optional: wait a bit for any lazy content to fully load after final scroll
    await page.waitForTimeout(2000);

    console.log('Scrolling completed. Final page height:', totalHeight);
    return totalHeight;
  } catch (error) {
    console.error('Error during human-like scrolling:', error.message);
    throw error; // Re-throw to handle upstream
  }
}

async function detectAndHandleCaptcha(page, userId) {
  const captchaSelectors = [
    'input[type="checkbox"][id*="captcha"]',
    'div[class*="captcha"]',
    'iframe[src*="recaptcha"]',
    '#g-recaptcha',
  ];

  sendAILeadStatus({
    type: 'ai_lead_status',
    recipient: userId,
    statusMsg: `AI is detecting CAPTCHAs.`,
  });

  for (const selector of captchaSelectors) {
    try {
      const captchaElement = await page.$(selector);
      if (captchaElement) {
        console.log('Captcha detected! Pausing for manual intervention.');
        // In a real scenario, integrate a captcha solver service here.
        // For now, wait indefinitely or handle manually; adjust as needed.
        await page.waitForTimeout(30000); // Extended wait; replace with solver
        return true;
      }
    } catch (error) {
      console.error('Error detecting captcha:', error.message);
    }
  }
  return false;
}

async function extractContactInfo(page) {
  try {
    const content = await page.content();

    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(?:com|net|org|in|co|edu|gov|io|ai)\b/g;
    const emails = [...content.matchAll(emailRegex)].map((match) => match[0]);

    // Also extract from mailto: links via DOM evaluation (more reliable)
    const mailtoEmails = await page.evaluate(() => {
      const emailRegex =
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(?:com|net|org|in|co|edu|gov|io|ai)\b/;
      const found = new Set();

      document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
        const href = a.getAttribute('href');
        const email = href
          .replace(/^mailto:/, '')
          .split('?')[0]
          .trim(); // Remove params like ?subject
        if (emailRegex.test(email)) {
          found.add(email);
        }
      });

      return Array.from(found);
    });

    const allEmails = [...new Set([...emails, ...mailtoEmails])];

    const phoneRegex = /(?:\+?91[-.\s]?)?[6-9]\d{9}\b/g;
    const rawPhones = [...content.matchAll(phoneRegex)].map((match) => match[0]);

    // Clean and normalize each phone number
    const cleanedPhones = rawPhones
      .map((num) => {
        let digits = num.replace(/\D/g, '');
        if (digits.length === 10 && /^[6-9]/.test(digits)) {
          digits = '91' + digits;
        } else if (digits.length === 11 && digits.startsWith('0') && /^[6-9]/.test(digits[1])) {
          digits = '91' + digits.slice(1);
        } else if (digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits[2])) {
          // Keep as is
        } else {
          return null;
        }
        return digits;
      })
      .filter(Boolean); // Remove nulls

    const allPhones = [...new Set(cleanedPhones)];

    return {
      emails: allEmails,
      phones: allPhones,
    };
  } catch (error) {
    console.error('Error extracting contact info:', error.message);
    return { emails: [], phones: [] };
  }
}

async function scrapeCompany(companyName, userId) {
  console.log(`Initiating scraper for: ${companyName}`);
  await sendAILeadStatus({
    type: 'ai_lead_status',
    recipient: userId,
    statusMsg: `AI is initiating the scraping process for: ${companyName}.`,
  });

  let browser;
  try {
    browser = await chromium.launch({
      headless: process.env.ISDEVELOPMENT === 'development' ? false : true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      locale: 'en-US',
      timezoneId: 'America/New_York',
      ignoreHTTPSErrors: true,
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    sendAILeadStatus({
      type: 'ai_lead_status',
      recipient: userId,
      statusMsg: `AI has launched a secure browser instance for data collection.`,
    });

    // Step 1: Scrape BING MAPS (not Google)
    sendAILeadStatus({
      type: 'ai_lead_status',
      recipient: userId,
      statusMsg: `AI is navigating to Bing Maps to search for ${companyName}.`,
    });
    console.log('Navigating to Bing Maps search page');

    // 🔍 Bing Maps Search URL
    const searchUrl = `https://www.bing.com/maps?q=${encodeURIComponent(companyName)}`;
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Check for captcha
    if (await detectAndHandleCaptcha(page, userId)) {
      console.log('Handling CAPTCHA challenges, resuming scraping');
      sendAILeadStatus({
        type: 'ai_lead_status',
        recipient: userId,
        statusMsg: `AI is solving the CAPTCHA to proceed.`,
      });
    }

    await sleep(100 + Math.random() * 1000);
    await randomMouseMovement(page, 3);

    await page.screenshot({ path: 'bing-maps-scrape-error.png', fullPage: true });
    // Wait for business info module to appear
    sendAILeadStatus({
      type: 'ai_lead_status',
      recipient: userId,
      statusMsg: `AI is collecting core company profile details from Bing Maps.`,
    });

    try {
      await page.waitForSelector('.infoModule.b_divsec', { state: 'visible', timeout: 30000 });
    } catch (e) {
      throw new Error(
        'Unable to find company details on Bing Maps. Please verify the company name.',
      );
    }

    const result = await page.evaluate(() => {
      const getText = (selector) => document.querySelector(selector)?.textContent?.trim() || null;
      const getHref = (selector) => document.querySelector(selector)?.href || null;

      const title = getText('h1.b_entityTitle') || getText('.b_entityTitle') || null;

      const address = getText('div[aria-label="Address"] .iconDataList') || null;

      const phoneEl = document.querySelector('div[aria-label="Phone"] a[aria-label^="Phone"]');
      const phoneHref = phoneEl?.href || '';
      const phone = phoneHref.startsWith('tel:') ? phoneHref.replace('tel:', '').trim() : null;

      const website = getHref('div[aria-label="Website"] a[aria-label^="Website"]') || null;

      const categoriesText = getText('.b_factrow') || '';
      const categories = categoriesText ? [categoriesText] : [];

      return {
        title,
        address,
        website,
        phones: phone ? [phone] : [],
        categories,
        emails: [], // will populate from website later
        domain: null,
      };
    });

    // Set domain if website found
    if (result.website) {
      try {
        const url = new URL(result.website);
        result.domain = url.hostname;
      } catch (e) {
        result.domain = null;
      }
    }

    // Step 2: Scrape website for contact info (unchanged)
    if (result.website) {
      console.log(
        `Collecting company profile details (name, address, category, phone) from ${result.website}`,
      );
      sendAILeadStatus({
        type: 'ai_lead_status',
        recipient: userId,
        statusMsg: `AI is navigating to the company's website for deeper analysis.`,
      });
      await page.goto(result.website, { waitUntil: 'domcontentloaded', timeout: 60000 });
      sendAILeadStatus({
        type: 'ai_lead_status',
        recipient: userId,
        statusMsg: `AI is performing a security review of the website.`,
      });
      if (await detectAndHandleCaptcha(page)) {
        console.log('CAPTCHA handled on website, resuming');
        sendAILeadStatus({
          type: 'ai_lead_status',
          recipient: userId,
          statusMsg: `AI handled a CAPTCHA on the website and is continuing.`,
        });
      }

      sendAILeadStatus({
        type: 'ai_lead_status',
        recipient: userId,
        statusMsg: `AI is analyzing the website for contact details and other relevant data.`,
      });
      await sleep(1000 + Math.random() * 2500);
      await randomMouseMovement(page, 4);
      await humanScroll(page);

      const contactInfo = await extractContactInfo(page);

      result.emails = contactInfo.emails;
      result.phones = [...new Set([...result.phones, ...contactInfo.phones])];
    } else {
      sendAILeadStatus({
        type: 'ai_lead_status',
        recipient: userId,
        statusMsg: `AI found no website for the company; skipping website analysis.`,
      });
      console.log('No website found for the company.');
    }

    // Validate required fields
    if (!result.title) throw new Error('Company Name is required');
    if (!result.address) throw new Error('Address is required');
    if (!result.phones.length) throw new Error('At least one phone is required');
    if (!result.categories.length) console.warn('No categories found (optional on Bing)');
    if (!result.emails.length) console.warn('No emails found');

    return result;
  } catch (error) {
    console.error(`Error scraping ${companyName}: ${error.message}`);
    sendAILeadStatus({
      type: 'ai_lead_status',
      recipient: userId,
      statusMsg: `AI encountered an error during scraping: ${error.message}. Please try again or check the company name.`,
    });
    return null;
  } finally {
    if (browser) {
      console.log('Closing browser session...');
      await sleep(1500);
      await browser.close();
      sendAILeadStatus({
        type: 'ai_lead_status',
        recipient: userId,
        statusMsg: `AI is closing the browser session securely.`,
      });
    }
  }
}

const AILeadScrapper = async (company, userId, req, res, geo) => {
  if (!company) {
    const errorMsg = 'Company Name is required';
    console.error(errorMsg);
    sendAILeadStatus({
      type: 'ai_lead_status',
      recipient: userId,
      statusMsg: `AI error: ${errorMsg}. Please provide a valid company name.`,
    });
    throw new Error(errorMsg);
  }

  if (geo.name !== 'India') {
    sendAILeadStatus({
      type: 'ai_lead_status',
      recipient: userId,
      statusMsg: `In ${geo.name} Service is temporarily unavailable.`,
    });
    return res.status(406).json({
      success: false,
      message: `Service is temporarily unavailable in ${geo.name} country.`,
    });
  }

  try {
    const rawData = await scrapeCompany(company?.trim(), userId);
    console.log('Raw data scraped:', rawData);
    if (rawData) {
      sendAILeadStatus({
        type: 'ai_lead_status',
        recipient: userId,
        statusMsg: `AI is formatting the scraped data into a structured lead.`,
      });
      const prompt = `You are a data formatting assistant. Your task is to transform raw business or company data into a clean JSON object. Context: ${JSON.stringify(
        rawData,
        null,
        0,
      )}. 
      Always output valid JSON only. Use the following structure: {"title": "","address": "","city": "","state": "","postalCode":"","countryCode": "","phones": [],"categories": [],"emails": [],"website":""}Rules:1. "title": Company or business name only.  2. "address": Full street address, without city/state duplication. 3. "city", "state", "countryCode": Extract and fill if present in the address. Use ISO-2 country codes (e.g., "IN" for India, "US" for United States). 4. "phones": Extract all valid phone numbers, remove duplicates, format consistently with country code if available. Ignore obviously fake or placeholder numbers like 1234567890, 0000000000. 5. "emails": Extract all valid emails, remove duplicates. Ignore generic, placeholder, or obviously fake emails like test@test.com, example@example.com. 6. "categories": Only include business categories or industry keywords (e.g., "IT Services", "Restaurant", "Construction"). Do not include numbers, city names, state names, postal codes, or country codes. 7. If a field is missing, return an empty string "" or empty array []. 8. "website": Company website. Use "" if unknown. 9. Do not add extra fields. Do not include explanations. Return only the JSON object.
          `;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
      });
      const formattedJSON = convertToJson(response.text);
      sendAILeadStatus({
        type: 'ai_lead_status',
        recipient: userId,
        statusMsg: `AI has successfully extracted and formatted the company data.`,
      });

      if (!formattedJSON) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate AI lead',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'AI Lead generated successfully',
        lead: formattedJSON,
        rawData,
      });
    } else {
      console.log('Scraping failed.');

      sendAILeadStatus({
        type: 'ai_lead_status',
        recipient: userId,
        statusMsg: `AI was unable to retrieve full company details. Please verify the input.`,
      });

      return res.status(404).json({
        success: false,
        message: 'Enter a correct compnay name with city location' || 'Internal server error',
      });
    }
  } catch (error) {
    console.error('Scraping error:', error.message);
    sendAILeadStatus({
      type: 'ai_lead_status',
      recipient: userId,
      statusMsg: `AI encountered a critical error: ${error.message}. Operation aborted.`,
    });

    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
};

export { AILeadScrapper };

// 1. Get supported logos list
import { icons } from '@iconify-json/logos';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const generateAt = path.join(
  new URL(import.meta.url).pathname,
  '..',
  '..',
  'lib',
  'social.generated.ts',
);

console.info(`🧑‍🤝‍🧑 Generating social websites data to ${generateAt}`);

/**
 * See https://raw.githubusercontent.com/sherlock-project/sherlock/master/sherlock/resources/data.schema.json
 */
type SherlockData = {
  [siteName: string]: {
    url: string;
    urlMain: string;
    username_claimed: string;
    errorType: 'message' | 'response_url' | 'status_code';
    urlProbe?: string;
    regexCheck?: string;
    isNSFW?: boolean;
    headers?: Record<string, string>;
    request_payload?: Record<string, string>;
    __comment__?: string;
    tags?: string | string[];
    request_method?: 'GET' | 'POST' | 'HEAD' | 'PUT';
    errorMsg?: string | string[];
    errorCode?: number | number[];
    errorUrl?: string;
    response_url?: string;
  };
};

function slugName(site: string) {
  return site.toLowerCase().replaceAll(/[^\da-z]/g, '');
}

function iconName(site: string) {
  if (site === 'inpgit') 
    return 'gitlab';
  
  return (
    Object.keys(icons.icons).find((icon) => icon === `${slugName(site)}-icon`) ??
    Object.keys(icons.icons).find((icon) => icon === slugName(site))
  );
}

function iconExists(site: string) {
  return iconName(slugName(site)) !== undefined;
}

// 2. Get extraction data from the Sherlock project

const sherlockData: SherlockData = await fetch(
  'https://raw.githubusercontent.com/sherlock-project/sherlock/master/sherlock/resources/data.json',
).then((res) => res.json());

// 3. Augment with our own

sherlockData.Wakatime = {
  url: 'https://wakatime.com/@{}',
  urlMain: 'https://wakatime.com/',
  username_claimed: 'alan',
  errorType: 'status_code',
};
// sherlockData.inpgit = {
//   ...sherlockData.GitLab,
//   url: 'https://git.inpt.fr/{}',
//   urlMain: 'https://git.inpt.fr/',
// };

// 4. Generate!
writeFileSync(generateAt, generateSocialTypescriptFile(Object.keys(sherlockData)));

function extractionData(siteName: string) {
  if (!iconExists(siteName)) return;

  if (!(siteName in sherlockData)) return;

  const { url, urlMain, regexCheck } = sherlockData[siteName];

  return { url, urlMain, regexCheck };
}

function generateSocialSiteData(siteName: string) {
  const extraction = extractionData(siteName);

  if (!extraction) return;

  return `
        ${slugName(siteName)}: {
            name: ${JSON.stringify(siteName)},
            url: ${JSON.stringify(extraction.url)},
            urlMain: ${JSON.stringify(extraction.urlMain)},
            regex: new RegExp(${JSON.stringify(
              extraction.url.replace(
                '{}',
                `(?<username>${extraction.regexCheck?.replace(/^\^/, '').replace(/\$$/, '') ?? '[\\w_-]+'})`,
              ),
            )}),
            usernameIsValid: ${
              extraction.regexCheck
                ? `(username: string) => {
                try { new RegExp(${JSON.stringify(extraction.regexCheck)}).test(username) } catch { return false; }
            }`
                : '() => true'
            },
            iconName: ${JSON.stringify(iconName(siteName))},
            icon: Logo${slugName(siteName)},
        }
    `;
}

function generateIconComponentImports(siteNames: string[]) {
  return siteNames
    .filter(iconExists)
    .filter(generateSocialSiteData)
    .map(
      (siteName) =>
        `import Logo${slugName(siteName)} from '~icons/logos/${iconName(siteName)}.svg';`,
    )
    .join('\n');
}

function generateSocialTypescriptFile(siteNames: string[]) {
  return `
    ${generateIconComponentImports(siteNames)}

    export const socials = {
        ${siteNames.map(generateSocialSiteData).filter(Boolean).join(',')}
    }
`;
}

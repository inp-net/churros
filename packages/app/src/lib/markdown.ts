import { htmlToText as convertHtmlToText } from 'html-to-text';

export function htmlToText(body: string): string {
  return convertHtmlToText(body, {
    selectors: [
      {
        selector: 'a',
        options: {
          ignoreHref: true,
        },
      },
    ],


export async function removeInvalidUserMentions(container: HTMLElement|null): Promise<void> {
    if (!container) return
    const cache = JSON.parse(localStorage.getItem('validUserMentionsCache') ?? '[]') as string[]
    await Promise.all([...container.querySelectorAll('a.user-mention')].map(async mentionElement => {
        const anchor = mentionElement as HTMLAnchorElement
        // .pathname to prevent querying external URLs, in case someone injects <a class="user-mention"> into the description. Should probably be sanitized by the backend though.
        const username = new URL(anchor.href).pathname.split('/')[2]
        if  (!username) return
        if (cache.includes(username)) {
            anchor.classList.add('exists')
            return
        }
        console.group(`checking mention`, anchor)
        const result = await fetch(new URL(anchor.href).pathname)
        console.log(result)
        console.groupEnd()
        if (result.ok) 
        {

                anchor.classList.add('exists')
                localStorage.setItem('validUserMentionsCache', JSON.stringify([...cache, username]))
        }
            else {
            anchor.outerHTML = anchor.innerHTML
            }
        
    }))
}
  });
}

/* eslint-disable */
/**
 * This file was generated by 'vite-plugin-kit-routes'
 *
 *      >> DO NOT EDIT THIS FILE MANUALLY <<
 */

/**
 * PAGES
 */
const PAGES = {
  "/": `/`,
  "/announcements": `/announcements`,
  "/announcements/[id]/edit": (id: (string | number), params?: {  }) => {
    return `/announcements/${id}/edit`
  },
  "/announcements/create": `/announcements/create`,
  "/backrooms": `/backrooms`,
  "/backrooms/services": `/backrooms/services`,
  "/bar-weeks": `/bar-weeks`,
  "/birthdays": `/birthdays`,
  "/boards": `/boards`,
  "/bookings": `/bookings`,
  "/bookings/[pseudoID]": (pseudoID: (string | number), params?: {  }) => {
    return `/bookings/${pseudoID}`
  },
  "/changelog": `/changelog`,
  "/claim-code": `/claim-code`,
  "/claim-code/[code]": (code: (string | number), params?: {  }) => {
    return `/claim-code/${code}`
  },
  "/credits": `/credits`,
  "/documents": `/documents`,
  "/documents/[major]": (major: (string | number), params?: {  }) => {
    return `/documents/${major}`
  },
  "/documents/[major]/[yearTier=display_year_tier]": (params: { major: (string | number), yearTier: (Parameters<typeof import('../params/display_year_tier.ts').match>[0]) }) => {
    return `/documents/${params.major}/${params.yearTier}`
  },
  "/documents/[major]/[yearTier=display_year_tier]/[subject]": (params: { major: (string | number), yearTier: (Parameters<typeof import('../params/display_year_tier.ts').match>[0]), subject: (string | number) }) => {
    return `/documents/${params.major}/${params.yearTier}/${params.subject}`
  },
  "/documents/[major]/[yearTier=display_year_tier]/[subject]/[document]": (params: { major: (string | number), yearTier: (Parameters<typeof import('../params/display_year_tier.ts').match>[0]), subject: (string | number), document: (string | number) }) => {
    return `/documents/${params.major}/${params.yearTier}/${params.subject}/${params.document}`
  },
  "/documents/[major]/[yearTier=display_year_tier]/[subject]/[document]/edit": (params: { major: (string | number), yearTier: (Parameters<typeof import('../params/display_year_tier.ts').match>[0]), subject: (string | number), document: (string | number) }) => {
    return `/documents/${params.major}/${params.yearTier}/${params.subject}/${params.document}/edit`
  },
  "/documents/[major]/[yearTier=display_year_tier]/[subject]/create": (params: { major: (string | number), yearTier: (Parameters<typeof import('../params/display_year_tier.ts').match>[0]), subject: (string | number) }) => {
    return `/documents/${params.major}/${params.yearTier}/${params.subject}/create`
  },
  "/documents/create": `/documents/create`,
  "/events": (params?: { week?: (Parameters<typeof import('../params/date.ts').match>[0]) }) => {
    return `/events${params?.week ? `/${params?.week}`: ''}`
  },
  "/events/[group]/create": (group: (string | number), params?: {  }) => {
    return `/events/${group}/create`
  },
  "/events/[id]": (id: (string | number), params?: {  }) => {
    return `/events/${id}`
  },
  "/events/[id]/book/[ticket]": (params: { id: (string | number), ticket: (string | number) }) => {
    return `/events/${params.id}/book/${params.ticket}`
  },
  "/events/[id]/bookings": (id: (string | number), params?: {  }) => {
    return `/events/${id}/bookings`
  },
  "/events/[id]/edit": (id: (string | number), params?: {  }) => {
    return `/events/${id}/edit`
  },
  "/events/[id]/scan": (id: (string | number), params?: {  }) => {
    return `/events/${id}/scan`
  },
  "/events/[id]/write": (id: (string | number), params?: {  }) => {
    return `/events/${id}/write`
  },
  "/events/create": `/events/create`,
  "/forms": `/forms`,
  "/forms/[form]/answer": (form: (string | number), params?: { section?: (string | number) }) => {
    return `/forms/${form}/answer${params?.section ? `/${params?.section}`: ''}`
  },
  "/forms/[form]/answered": (form: (string | number), params?: {  }) => {
    return `/forms/${form}/answered`
  },
  "/forms/[form]/answers": (form: (string | number), params?: {  }) => {
    return `/forms/${form}/answers`
  },
  "/forms/[form]/answers/analytics": (form: (string | number), params?: {  }) => {
    return `/forms/${form}/answers/analytics`
  },
  "/forms/[form]/edit": (form: (string | number), params?: {  }) => {
    return `/forms/${form}/edit`
  },
  "/forms/create": `/forms/create`,
  "/groups": `/groups`,
  "/groups/[uid]": (uid: (string | number), params?: {  }) => {
    return `/groups/${uid}`
  },
  "/groups/[uid]/[...page]": (params: { uid: (string | number), page: (string | number)[] }) => {
    return `/groups/${params.uid}/${params.page?.join('/')}`
  },
  "/groups/[uid]/edit": (uid: (string | number), params?: {  }) => {
    return `/groups/${uid}/edit`
  },
  "/groups/[uid]/edit/bank-accounts": (uid: (string | number), params?: {  }) => {
    return `/groups/${uid}/edit/bank-accounts`
  },
  "/groups/[uid]/edit/members": (uid: (string | number), params?: {  }) => {
    return `/groups/${uid}/edit/members`
  },
  "/groups/[uid]/edit/members/bulk": (uid: (string | number), params?: {  }) => {
    return `/groups/${uid}/edit/members/bulk`
  },
  "/groups/[uid]/edit/pages": (uid: (string | number), params?: {  }) => {
    return `/groups/${uid}/edit/pages`
  },
  "/groups/[uid]/edit/pages/[...page]": (params: { uid: (string | number), page: (string | number)[] }) => {
    return `/groups/${params.uid}/edit/pages/${params.page?.join('/')}`
  },
  "/groups/[uid]/members": (uid: (string | number), params?: {  }) => {
    return `/groups/${uid}/members`
  },
  "/groups/[uid]/shop": (uid: (string | number), params?: {  }) => {
    return `/groups/${uid}/shop`
  },
  "/groups/[uid]/shop/[id]": (params: { uid: (string | number), id: (string | number) }) => {
    return `/groups/${params.uid}/shop/${params.id}`
  },
  "/groups/[uid]/shop/[id]/edit": (params: { uid: (string | number), id: (string | number) }) => {
    return `/groups/${params.uid}/shop/${params.id}/edit`
  },
  "/groups/[uid]/shop/create": (uid: (string | number), params?: {  }) => {
    return `/groups/${uid}/shop/create`
  },
  "/groups/[uid]/shop/orders": (uid: (string | number), params?: {  }) => {
    return `/groups/${uid}/shop/orders`
  },
  "/groups/[uid]/shop/sales": (uid: (string | number), params?: {  }) => {
    return `/groups/${uid}/shop/sales`
  },
  "/groups/[uid]/shop/sales/[itemUid]": (params: { uid: (string | number), itemUid: (string | number) }) => {
    return `/groups/${params.uid}/shop/sales/${params.itemUid}`
  },
  "/groups/[uid]/subgroups/create": (uid: (string | number), params?: {  }) => {
    return `/groups/${uid}/subgroups/create`
  },
  "/help": `/help`,
  "/login": `/login`,
  "/login/forgotten": `/login/forgotten`,
  "/login/reset/[token]": (token: (string | number), params?: {  }) => {
    return `/login/reset/${token}`
  },
  "/logs": `/logs`,
  "/notifications": `/notifications`,
  "/posts/create": (params?: { group?: (string | number) }) => {
    return `/posts${params?.group ? `/${params?.group}`: ''}/create`
  },
  "/posts/[id]": (id: (string | number), params?: {  }) => {
    return `/posts/${id}`
  },
  "/posts/[id]/edit": (id: (string | number), params?: {  }) => {
    return `/posts/${id}/edit`
  },
  "/quick-signups/create": `/quick-signups/create`,
  "/quick-signups/manage": `/quick-signups/manage`,
  "/quick-signups/qr/[code]": (code: (string | number), params?: {  }) => {
    return `/quick-signups/qr/${code}`
  },
  "/register": (params?: { quickSignupCode?: (string | number) }) => {
    return `/register${params?.quickSignupCode ? `/${params?.quickSignupCode}`: ''}`
  },
  "/register/continue": `/register/continue`,
  "/reports": `/reports`,
  "/reports/[number]": (number: (string | number), params?: {  }) => {
    return `/reports/${number}`
  },
  "/schools/[uid]": (uid: (string | number), params?: {  }) => {
    return `/schools/${uid}`
  },
  "/schools/[uid]/edit": (uid: (string | number), params?: {  }) => {
    return `/schools/${uid}/edit`
  },
  "/search": (params?: { q?: (string | number) }) => {
    return `/search${params?.q ? `/${params?.q}`: ''}`
  },
  "/services": `/services`,
  "/services/[id]/edit": (id: (string | number), params?: {  }) => {
    return `/services/${id}/edit`
  },
  "/services/create": `/services/create`,
  "/services/submit": `/services/submit`,
  "/set-password": `/set-password`,
  "/signups": `/signups`,
  "/signups/edit/[email]": (email: (string | number), params?: {  }) => {
    return `/signups/edit/${email}`
  },
  "/student-associations/[uid]": (uid: (string | number), params?: {  }) => {
    return `/student-associations/${uid}`
  },
  "/student-associations/[uid]/[...page]": (params: { uid: (string | number), page: (string | number)[] }) => {
    return `/student-associations/${params.uid}/${params.page?.join('/')}`
  },
  "/student-associations/[uid]/edit/pages": (uid: (string | number), params?: {  }) => {
    return `/student-associations/${uid}/edit/pages`
  },
  "/student-associations/[uid]/edit/pages/[...page]": (params: { uid: (string | number), page: (string | number)[] }) => {
    return `/student-associations/${params.uid}/edit/pages/${params.page?.join('/')}`
  },
  "/users/[uid]": (uid: (string | number), params?: {  }) => {
    return `/users/${uid}`
  },
  "/users/[uid]/edit": (uid: (string | number), params?: {  }) => {
    return `/users/${uid}/edit`
  },
  "/validate-email/[token]": (token: (string | number), params?: {  }) => {
    return `/validate-email/${token}`
  },
  "/welcome": `/welcome`,
  "/authorize": `/authorize`,
  "/connect/google/callback": `/connect/google/callback`,
  "/kiosk": `/kiosk`,
  "/_component/[...componentName]": (componentName: (string | number)[], params?: {  }) => {
    return `/_component/${componentName?.join('/')}`
  },
  "/developers/apps": `/developers/apps`,
  "/developers/apps/[id]": (id: (string | number), params?: {  }) => {
    return `/developers/apps/${id}`
  },
  "/developers/apps/create": `/developers/apps/create`
}

/**
 * SERVERS
 */
const SERVERS = {
  "GET /[entity=entity_handle]": (entity: (Parameters<typeof import('../params/entity_handle.ts').match>[0]), params?: {  }) => {
    return `/${entity}`
  },
  "GET /bookings/[pseudoID].pdf": (pseudoID: (string | number), params?: {  }) => {
    return `/bookings/${pseudoID}.pdf`
  },
  "GET /events/[group]/[slug]/[...path]": (params: { group: (string | number), slug: (string | number), path: (string | number)[] }) => {
    return `/events/${params.group}/${params.slug}/${params.path?.join('/')}`
  },
  "GET /events/planning": `/events/planning`,
  "GET /events/week/[monday]": (monday: (string | number), params?: {  }) => {
    return `/events/week/${monday}`
  },
  "GET /forms/[form]/answers.[extension]": (params: { form: (string | number), extension: (string | number) }) => {
    return `/forms/${params.form}/answers.${params.extension}`
  },
  "GET /frappe": `/frappe`,
  "GET /groups/[uid].pdf": (uid: (string | number), params?: {  }) => {
    return `/groups/${uid}.pdf`
  },
  "GET /help/prefilled-links": `/help/prefilled-links`,
  "GET /logout": `/logout`,
  "GET /me": `/me`,
  "GET /connect/google": `/connect/google`,
  "GET /health": `/health`,
  "GET /identity": `/identity`,
  "GET /check-uid/[uid]": (uid: (string | number), params?: {  }) => {
    return `/check-uid/${uid}`
  },
  "GET /developers": `/developers`,
  "POST /markdown": `/markdown`
}

/**
 * ACTIONS
 */
const ACTIONS = {
  "upsertForm /forms": `/forms?/upsertForm`,
  "postAnswers /forms/[form]/answer": (form: (string | number), params?: { section?: (string | number) }) => {
    return `/forms/${form}/answer${params?.section ? `/${params?.section}`: ''}?/postAnswers`
  },
  "upsertSection /forms/[form]/edit": (form: (string | number), params?: {  }) => {
    return `/forms/${form}/edit?/upsertSection`
  }
}

/**
 * LINKS
 */
const LINKS = {
  
}

type ParamValue = string | number | undefined

/**
 * Append search params to a string
 */
export const appendSp = (sp?: Record<string, ParamValue | ParamValue[]>, prefix: '?' | '&' = '?') => {
  if (sp === undefined) return ''

  const params = new URLSearchParams()
  const append = (n: string, v: ParamValue) => {
    if (v !== undefined) {
      params.append(n, String(v))
    }
  }

  for (const [name, val] of Object.entries(sp)) {
    if (Array.isArray(val)) {
      for (const v of val) {
        append(name, v)
      }
    } else {
      append(name, val)
    }
  }

  const formatted = params.toString()
  if (formatted) {
    return `${prefix}${formatted}`
  }
  return ''
}

/**
 * get the current search params
 * 
 * Could be use like this:
 * ```
 * route("/cities", { page: 2 }, { ...currentSP() })
 * ```
 */ 
export const currentSp = () => {
  const params = new URLSearchParams(window.location.search)
  const record: Record<string, string> = {}
  for (const [key, value] of params.entries()) {
    record[key] = value
  }
  return record
}

function StringOrUndefined(val: any) {
  if (val === undefined) {
    return undefined
  }

  return String(val)
}

// route function helpers
type NonFunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
type FunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]
type FunctionParams<T> = T extends (...args: infer P) => any ? P : never

const AllObjs = { ...PAGES, ...ACTIONS, ...SERVERS, ...LINKS }
type AllTypes = typeof AllObjs

export type Routes = keyof AllTypes extends `${string}/${infer Route}`
  ? `/${Route}`
  : keyof AllTypes;
export const routes = [
  ...new Set(Object.keys(AllObjs).map((route) => /^\/.*|[^ ]?\/.*$/.exec(route)?.[0] ?? route)),
] as Routes[];

/**
 * To be used like this: 
 * ```ts
 * import { route } from './ROUTES'
 * 
 * route('site_id', { id: 1 })
 * ```
 */
export function route<T extends FunctionKeys<AllTypes>>(key: T, ...params: FunctionParams<AllTypes[T]>): string
export function route<T extends NonFunctionKeys<AllTypes>>(key: T): string
export function route<T extends keyof AllTypes>(key: T, ...params: any[]): string {
  if (AllObjs[key] as any instanceof Function) {
    const element = (AllObjs as any)[key] as (...args: any[]) => string
    return element(...params)
  } else {
    return AllObjs[key] as string
  }
}

/**
* Add this type as a generic of the vite plugin `kitRoutes<KIT_ROUTES>`.
*
* Full example:
* ```ts
* import type { KIT_ROUTES } from './ROUTES'
* import { kitRoutes } from 'vite-plugin-kit-routes'
*
* kitRoutes<KIT_ROUTES>({
*  PAGES: {
*    // here, key of object will be typed!
*  }
* })
* ```
*/
export type KIT_ROUTES = {
  PAGES: { '/': never, '/announcements': never, '/announcements/[id]/edit': 'id', '/announcements/create': never, '/backrooms': never, '/backrooms/services': never, '/bar-weeks': never, '/birthdays': never, '/boards': never, '/bookings': never, '/bookings/[pseudoID]': 'pseudoID', '/changelog': never, '/claim-code': never, '/claim-code/[code]': 'code', '/credits': never, '/documents': never, '/documents/[major]': 'major', '/documents/[major]/[yearTier=display_year_tier]': 'major' | 'yearTier', '/documents/[major]/[yearTier=display_year_tier]/[subject]': 'major' | 'yearTier' | 'subject', '/documents/[major]/[yearTier=display_year_tier]/[subject]/[document]': 'major' | 'yearTier' | 'subject' | 'document', '/documents/[major]/[yearTier=display_year_tier]/[subject]/[document]/edit': 'major' | 'yearTier' | 'subject' | 'document', '/documents/[major]/[yearTier=display_year_tier]/[subject]/create': 'major' | 'yearTier' | 'subject', '/documents/create': never, '/events': 'week', '/events/[group]/create': 'group', '/events/[id]': 'id', '/events/[id]/book/[ticket]': 'id' | 'ticket', '/events/[id]/bookings': 'id', '/events/[id]/edit': 'id', '/events/[id]/scan': 'id', '/events/[id]/write': 'id', '/events/create': never, '/forms': never, '/forms/[form]/answer': 'form' | 'section', '/forms/[form]/answered': 'form', '/forms/[form]/answers': 'form', '/forms/[form]/answers/analytics': 'form', '/forms/[form]/edit': 'form', '/forms/create': never, '/groups': never, '/groups/[uid]': 'uid', '/groups/[uid]/[...page]': 'uid' | 'page', '/groups/[uid]/edit': 'uid', '/groups/[uid]/edit/bank-accounts': 'uid', '/groups/[uid]/edit/members': 'uid', '/groups/[uid]/edit/members/bulk': 'uid', '/groups/[uid]/edit/pages': 'uid', '/groups/[uid]/edit/pages/[...page]': 'uid' | 'page', '/groups/[uid]/members': 'uid', '/groups/[uid]/shop': 'uid', '/groups/[uid]/shop/[id]': 'uid' | 'id', '/groups/[uid]/shop/[id]/edit': 'uid' | 'id', '/groups/[uid]/shop/create': 'uid', '/groups/[uid]/shop/orders': 'uid', '/groups/[uid]/shop/sales': 'uid', '/groups/[uid]/shop/sales/[itemUid]': 'uid' | 'itemUid', '/groups/[uid]/subgroups/create': 'uid', '/help': never, '/login': never, '/login/forgotten': never, '/login/reset/[token]': 'token', '/logs': never, '/notifications': never, '/posts/create': 'group', '/posts/[id]': 'id', '/posts/[id]/edit': 'id', '/quick-signups/create': never, '/quick-signups/manage': never, '/quick-signups/qr/[code]': 'code', '/register': 'quickSignupCode', '/register/continue': never, '/reports': never, '/reports/[number]': 'number', '/schools/[uid]': 'uid', '/schools/[uid]/edit': 'uid', '/search': 'q', '/services': never, '/services/[id]/edit': 'id', '/services/create': never, '/services/submit': never, '/set-password': never, '/signups': never, '/signups/edit/[email]': 'email', '/student-associations/[uid]': 'uid', '/student-associations/[uid]/[...page]': 'uid' | 'page', '/student-associations/[uid]/edit/pages': 'uid', '/student-associations/[uid]/edit/pages/[...page]': 'uid' | 'page', '/users/[uid]': 'uid', '/users/[uid]/edit': 'uid', '/validate-email/[token]': 'token', '/welcome': never, '/authorize': never, '/connect/google/callback': never, '/kiosk': never, '/_component/[...componentName]': 'componentName', '/developers/apps': never, '/developers/apps/[id]': 'id', '/developers/apps/create': never }
  SERVERS: { 'GET /[entity=entity_handle]': 'entity', 'GET /bookings/[pseudoID].pdf': 'pseudoID', 'GET /events/[group]/[slug]/[...path]': 'group' | 'slug' | 'path', 'GET /events/planning': never, 'GET /events/week/[monday]': 'monday', 'GET /forms/[form]/answers.[extension]': 'form' | 'extension', 'GET /frappe': never, 'GET /groups/[uid].pdf': 'uid', 'GET /help/prefilled-links': never, 'GET /logout': never, 'GET /me': never, 'GET /connect/google': never, 'GET /health': never, 'GET /identity': never, 'GET /check-uid/[uid]': 'uid', 'GET /developers': never, 'POST /markdown': never }
  ACTIONS: { 'upsertForm /forms': never, 'postAnswers /forms/[form]/answer': 'form' | 'section', 'upsertSection /forms/[form]/edit': 'form' }
  LINKS: Record<string, never>
  Params: { id: never, pseudoID: never, code: never, major: never, yearTier: never, subject: never, document: never, week: never, group: never, ticket: never, form: never, section: never, uid: never, page: never, itemUid: never, token: never, quickSignupCode: never, number: never, q: never, email: never, componentName: never, entity: never, slug: never, path: never, monday: never, extension: never }
}

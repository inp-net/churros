import { loadQuery, Selector } from "$lib/zeus"
import type { PageLoad } from "./$types"

export const load: PageLoad = async ({ fetch, parent }) => loadQuery({
    events: [{}, Selector("QueryEventsConnection")({
        pageInfo: { hasNextPage: true, endCursor: true },
        edges: {
            cursor: true,
            node: {
                author: { uid: true, firstName: true, lastName: true },
                descriptionHtml: true,
                title: true,
                tickets: {
                    name: true,
                    price: true,
                    placesLeft: true,
                    capacity: true,
                    closesAt: true,
                    opensAt: true,
                },
                contactMail: true,
                links: {
                    links: {
                        name: true,
                        value: true,
                    }
                },
                startsAt: true,
                endsAt: true,
                visibility: true,
                slug: true,
                group: {
                    uid: true,
                    name: true,
                    pictureFile: true
                },
                location: true
            }
        }
    })]
}, { fetch, parent})

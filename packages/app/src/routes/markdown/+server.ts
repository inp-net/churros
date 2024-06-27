import { graphql, RenderMarkdownStore } from '$houdini';
import { json } from '@sveltejs/kit';

graphql(`
  query RenderMarkdown($markdown: String!) {
    html: renderMarkdown(markdown: $markdown)
  }
`);

export async function POST(event) {
  const query = new RenderMarkdownStore();
  const requestPayload = await event.request.json();
  const { data } = await query.fetch({
    event,
    variables: {
      markdown: requestPayload.markdown ?? '',
    },
  });

  return json(data);
}

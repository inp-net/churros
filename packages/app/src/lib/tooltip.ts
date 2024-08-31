/* eslint-disable @typescript-eslint/no-unsafe-call */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { xss } from '$lib/xss';
import tippy from 'sveltejs-tippy';

function props(parameters: string | [string, number] | object | undefined) {
  let content: string;
  let delay = 50;
  if (!parameters) {
    return {
      content: '',
      // allowHtml: false,
      delay: [delay, 0],
    };
  }

  if (typeof parameters === 'string') content = parameters;
  else if (Array.isArray(parameters)) [content, delay] = parameters;
  else return { content: '', allowHTML: false, delay: [delay, 0], ...parameters };

  return { content: xss(content), allowHTML: true, delay: [delay, 0] };
}

export const tooltip = (
  node: HTMLElement & {
    _tippy?: {
      destroy: () => void;
      setProps: (props: unknown) => void;
    };
  },
  parameters: string | [string, number] | object | undefined,
) => {
  const properties = props(parameters);
  tippy(node, properties);
  if (properties.content.length <= 0) node._tippy?.destroy();

  return {
    update(parameters: string | [string, number] | object | undefined) {
      const properties = props(parameters);
      if (!node._tippy) tippy(node, properties);
      if (properties.content.length <= 0) node._tippy?.destroy();
      node._tippy?.setProps(properties);
    },
    destroy() {
      node._tippy?.destroy();
    },
  };
};

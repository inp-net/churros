export function longpress(node: HTMLElement, threshold = 500) {
  const handle_mousedown = () => {
    const timeout = setTimeout(() => {
      node.dispatchEvent(new CustomEvent('longpress'));
    }, threshold);

    const cancel = () => {
      clearTimeout(timeout);
      node.removeEventListener('mousemove', cancel);
      node.removeEventListener('mouseup', cancel);
      node.removeEventListener('pointermove', cancel);
    };

    node.addEventListener('mousemove', cancel);
    node.addEventListener('mouseup', cancel);
    node.addEventListener('pointermove', cancel);
  };

  node.addEventListener('mousedown', handle_mousedown);
  node.addEventListener('touchstart', handle_mousedown);

  return {
    destroy() {
      node.removeEventListener('mousedown', handle_mousedown);
      node.removeEventListener('touchstart', handle_mousedown);
    },
  };
}

type Child = Node | string | null | undefined | false;
type Props = Record<string, string | number | boolean | EventListener | undefined>;

function applyProps(node: Element, props: Props): void {
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === false) continue;
    if (typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'class') node.setAttribute('class', String(value));
    else node.setAttribute(key, value === true ? '' : String(value));
  }
}

/** Builds an element. Strings always become text nodes, never HTML. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  applyProps(node, props);
  node.append(...children.filter((child): child is Node | string => Boolean(child)));
  return node;
}

type Shape = [tag: 'path' | 'circle' | 'rect', attributes: Record<string, string | number>];

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Builds a decorative SVG that screen readers skip. */
export function svg(props: Record<string, string | number>, shapes: Shape[]): SVGSVGElement {
  const node = document.createElementNS(SVG_NS, 'svg');
  applyProps(node, { fill: 'none', 'aria-hidden': 'true', ...props });
  for (const [tag, attributes] of shapes) {
    const shape = document.createElementNS(SVG_NS, tag);
    applyProps(shape, attributes);
    node.append(shape);
  }
  return node;
}

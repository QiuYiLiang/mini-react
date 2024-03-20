interface MiniReactElement {
  type: string | Symbol;
  props: Record<string, any>;
}

type Children = (MiniReactElement | string)[];

const TEXT_ELEMENT = Symbol.for("TEXT_ELEMENT");

function createElement(
  type: string,
  props: Record<string, any>,
  ...children: Children
) {
  return {
    type,
    props: {
      ...props,
      children: children.map((element) =>
        typeof element === "string"
          ? {
              type: TEXT_ELEMENT,
              props: {
                nodeValue: element,
              },
            }
          : element
      ),
    },
  };
}

function renderElement(element: MiniReactElement, parentDom: HTMLElement) {
  const dom =
    element.type === TEXT_ELEMENT
      ? document.createTextNode("")
      : (document.createElement(element.type as string) as any);
  const { children = [], ...props } = element.props;
  Object.keys(props).forEach((propKey) => {
    dom[propKey] = props[propKey];
  });
  children.forEach((element: MiniReactElement) => renderElement(element, dom));
  parentDom.appendChild(dom);
}

function createRoot(el: HTMLElement) {
  const render = (element: MiniReactElement) => renderElement(element, el);
  return {
    render,
  };
}

export default {
  createElement,
  createRoot,
};

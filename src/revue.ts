type RevueCompoent<T = Record<string, any>> = (
  props: T,
  element: RevueElement
) => RevueElement;
const REVUE_ELEMENT: Symbol = Symbol();

export interface State {
  value: any;
  next: State | null;
}

export class StateImpl implements State {
  constructor(public value: any, public next: State | null = null) {}
}

export interface RevueElement {
  rawType: Symbol;
  el: Element | null;
  state: any;
  childElement: RevueElement | null;
  type: string | RevueCompoent;
  update: any;
  props: Record<string, any>;
  children: (RevueElement | any)[];
}

class RevueElementImpl implements RevueElement {
  rawType = REVUE_ELEMENT;
  el = null;
  state = null;
  childElement = null;
  update = null;
  constructor(
    public type: RevueElement["type"],
    public props: RevueElement["props"],
    public children: RevueElement["children"]
  ) {}
}

function isRevueElement(element: any): element is RevueElement {
  return element?.rawType === REVUE_ELEMENT;
}

export function createElement(
  type: RevueElement["type"],
  props: RevueElement["props"],
  ...children: RevueElement["children"]
) {
  return new RevueElementImpl(type, props, children);
}

function appendElement(el: Element, parentEl: Element, index: number) {
  const oldEl = parentEl.children[index];
  if (!oldEl) {
    parentEl.appendChild(el);
  } else {
    oldEl.replaceWith(el);
  }
}

function updateElement(el: Element, props: Record<string, any>) {
  for (const prop in props) {
    if (props.hasOwnProperty(prop)) {
      const value = props[prop];
      (el as any)[prop] = value;
    }
  }
}

// let currentFiber: RevueElement | null = null;
function diffProps(props: Record<string, any>, oldProps: Record<string, any>) {
  const updataProps: Record<string, any> = {};
  for (const key in props) {
    if (props.hasOwnProperty(key)) {
      if (props[key] !== oldProps[key]) {
        updataProps[key] = props[key];
      }
    }
  }
  return updataProps;
}

let update: any = null;

function diff(
  element: RevueElement | any,
  parentDom: Element,
  index: number = 0,
  oldElement: RevueElement | any = {}
) {
  if (isRevueElement(element)) {
    let revueElement = element;
    const fnElements = [];
    while (typeof revueElement.type !== "string") {
      fnElements.push(revueElement);
      revueElement = revueElement.type(revueElement.props, revueElement);
    }
    fnElements.forEach((element: RevueElement) => {
      element.childElement = revueElement;
      element.update = () => {
        diff(element, parentDom, index, revueElement);
      };
    });

    const isMultiplex = oldElement.type === revueElement.type;

    const el = (
      isMultiplex ? oldElement.el : document.createElement(revueElement.type)
    ) as Element;

    revueElement.el = el;

    const updataProps = diffProps(revueElement.props, oldElement.props ?? {});

    updateElement(el, updataProps);

    if (!isMultiplex) {
      appendElement(el, parentDom, index);
    }

    revueElement.children.forEach((element, index) => {
      const oldElementItem = oldElement.children?.[index] ?? {};

      diff(
        element,
        el,
        index,
        (typeof oldElementItem.type === "string"
          ? oldElementItem
          : oldElementItem.childElement) ?? {}
      );
    });
  } else if (element !== oldElement) {
    const textNode = parentDom.childNodes[index];
    if (textNode) {
      if (textNode.textContent !== element) {
        textNode.textContent = element;
      }
    } else {
      parentDom.appendChild(document.createTextNode(element));
    }
  }
}

export function getUpdate() {
  return update;
}

export function createRoot(element: RevueElement) {
  return {
    mount: (container: Element) => {
      let child = container.lastElementChild;

      while (child) {
        container.removeChild(child);
        child = container.lastElementChild;
      }

      diff(element, container);
    },
  };
}

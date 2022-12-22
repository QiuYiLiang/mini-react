type RevueCompoent<T = Record<string, any>> = (props: T) => RevueElement;
const REVUE_ELEMENT: Symbol = Symbol();

interface State {
  value: any;
  next: State | null;
}

interface HookState {
  currentHook: Hook | null;
  firstHook: Hook | null;
}

interface Hook {
  initValue: any;
  value: any;
  next: Hook | null;
}

interface UpdateQueue {
  update: Update | null;
  lastUpdate: Update | null;
}

interface Update<A = any> {
  action: A;
  next: Update | null;
}

export class StateImpl implements State {
  constructor(public value: any, public next: State | null = null) {}
}

export interface RevueElement {
  rawType: Symbol;
  el: Element | null;
  state: HookState;
  updateQueue: UpdateQueue;
  childElement: RevueElement | null;
  type: string | RevueCompoent;
  update: any;
  isMounted: boolean;
  props: Record<string, any>;
  children: (RevueElement | any)[];
}

let workInProcessElement: RevueElement | null = null;

const attrMap: Record<string, string> = {
  className: "class",
  onClick: "onclick",
};

class RevueElementImpl implements RevueElement {
  rawType = REVUE_ELEMENT;
  el = null;
  updateQueue = {
    update: null,
    lastUpdate: null,
  };
  state = {
    currentHook: null,
    firstHook: null,
  };

  childElement = null;
  update = null;
  isMounted = false;
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
      const rawAttrName = attrMap[prop];
      (el as any)[rawAttrName ? rawAttrName : prop] = value;
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
      const prewWorkInProcessElement: RevueElement | null =
        workInProcessElement;
      workInProcessElement = element;
      revueElement = revueElement.type(revueElement.props);
      workInProcessElement.isMounted = true;
      workInProcessElement = prewWorkInProcessElement;
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

function createUpdate<A>(action: A): Update<A> {
  return {
    action,
    next: null,
  };
}

function createHook(initValue: any): Hook {
  return {
    initValue,
    value: initValue,
    next: null,
  };
}

function getHook(defalutValue: any): Hook {
  const element = workInProcessElement as RevueElement;
  const isMounted = element.isMounted;
  const hookState = element.state;

  if (isMounted) {
    const hook = hookState.currentHook as Hook;
    hookState.currentHook = hook.next;
    return hook;
  } else {
    const hook = createHook(defalutValue);
    if (!hookState.currentHook) {
      hook.next = hook;
      hookState.firstHook = hook;
      hookState.currentHook = hook;
    } else {
      hook.next = hookState.firstHook;
      hookState.currentHook.next = hook;
    }

    return hook;
  }
}

export function useState<V = any>(defalutValue: V) {
  const element = workInProcessElement as RevueElement;
  const hook = getHook(defalutValue);

  return [
    hook.value,
    (value: V) => {
      const updateQueue = element.updateQueue;

      const update = createUpdate(() => {
        hook.value = value;
      });

      if (!updateQueue.lastUpdate) {
        updateQueue.update = update;
        updateQueue.lastUpdate = update;
        setTimeout(() => {
          while (updateQueue.update) {
            updateQueue.update.action();
            updateQueue.update = updateQueue.update.next;
          }
          updateQueue.lastUpdate = null;
          element.update();
        }, 0);
      } else {
        updateQueue.lastUpdate.next = update;
        updateQueue.lastUpdate = update;
      }
    },
  ];
}

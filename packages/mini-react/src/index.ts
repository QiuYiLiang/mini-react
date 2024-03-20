interface MiniReactElement {
  type: string | Symbol;
  props: Record<string, any>;
}

type Children = (MiniReactElement | string)[];

interface Fiber {
  dom?: HTMLElement;
  type: string | Symbol;
  props: Record<string, any>;
  return?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
}

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

function createDom(fiber: Fiber) {
  const dom =
    fiber.type === TEXT_ELEMENT
      ? document.createTextNode("")
      : (document.createElement(fiber.type as string) as any);
  const { children = [], ...props } = fiber.props;
  Object.keys(props).forEach((propKey) => {
    dom[propKey] = props[propKey];
  });
  return dom;
}

let nextUnitOfWork: any = null;

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = processUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

// 执行单个纤程初始化工作
function processUnitOfWork(fiber: Fiber) {
  // 如果 纤程 中没有对应的 dom，需要初始化 dom 节点
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  // 如果纤程有父纤程，需要挂载该纤程的 dom 到父纤程的 dom 下
  if (fiber.return) {
    (fiber.return.dom as HTMLElement).appendChild(fiber.dom as HTMLElement);
  }
  const elements = (fiber.props.children || []) as MiniReactElement[];
  let index = 0;
  let prevFiber: Fiber | undefined;
  while (index < elements.length) {
    const element = elements[index];
    const newFiber: Fiber = {
      type: element.type,
      props: element.props,
      return: fiber,
    };
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      (prevFiber as Fiber).sibling = newFiber;
    }
    index++;
    prevFiber = newFiber;
  }

  // 返回下一个需要纤程，首选 child，其次 兄弟 fiber，最后是 父级的兄弟
  return fiber.child || fiber.sibling || fiber.return?.sibling;
}

function createRoot(el: HTMLElement) {
  const render = (element: MiniReactElement) => {
    const rootFiber = {
      dom: el,
      props: {
        children: [element],
      },
    };
    nextUnitOfWork = rootFiber;
  };
  return {
    render,
  };
}

export default {
  createElement,
  createRoot,
};

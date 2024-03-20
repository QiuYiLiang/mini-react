interface MiniReactElement {
  type: string | Symbol;
  props: Record<string, any>;
}

type Children = (MiniReactElement | string)[];
interface RootFiber extends BaseFiber {
  dom: HTMLElement;
  props: {
    children: MiniReactElement[];
  };
}
interface BaseFiber {
  dom?: HTMLElement;
  alternate?: Fiber;
  props: Record<string, any>;
  return?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
}
interface Fiber extends BaseFiber {
  type: string | Symbol;
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

// 提交 fiber 效果突变，更新 dom
function commitEffectMutation(fiber: Fiber) {
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

let workInProcessRoot: RootFiber | undefined;
let nextUnitOfWork: Fiber | undefined;

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = processUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  // fiber 构造完毕，提交更新
  if (!nextUnitOfWork && workInProcessRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

// 执行 fiber 初始化工作
function processUnitOfWork(fiber: Fiber) {
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

  // 返回下一个需要 fiber，首选 child，其次 兄弟 fiber，最后是 父级的兄弟
  return fiber.child || fiber.sibling || fiber.return?.sibling;
}

// 提交 rootFiber 更新 dom
function commitRoot() {
  commitUnitOfWork((workInProcessRoot as RootFiber).child as Fiber);
  workInProcessRoot = undefined;
}

function commitUnitOfWork(fiber?: Fiber) {
  if (!fiber) {
    return;
  }
  // 如果 fiber 中没有对应的 dom，需要初始化 dom 节点
  if (!fiber.dom) {
    fiber.dom = commitEffectMutation(fiber);
  }
  // 如果 fiber 有父 fiber，需要挂载该 fiber 的 dom 到父 fiber 的 dom 下
  if (fiber.return) {
    (fiber.return.dom as HTMLElement).appendChild(fiber.dom as HTMLElement);
  }
  commitUnitOfWork(fiber.child);
  commitUnitOfWork(fiber.sibling);
}

function createRoot(el: HTMLElement) {
  const rootFiber: RootFiber = {
    dom: el,
    props: {
      children: [],
    },
  };
  (el as any).__rootFiber__ = rootFiber;

  const render = (element: MiniReactElement) => {
    rootFiber.props.children = [element];
    workInProcessRoot = rootFiber;
    nextUnitOfWork = rootFiber as unknown as Fiber;
  };
  return {
    render,
  };
}

export default {
  createElement,
  createRoot,
};

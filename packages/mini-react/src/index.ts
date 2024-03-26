interface MiniReactElement {
  type: string | Symbol;
  props: Record<string, any>;
}

type Children = (MiniReactElement | string)[];

interface FiberRoot extends BaseFiber {
  stateNode: HTMLElement;
  alternate?: FiberRoot;
  props: {
    children: MiniReactElement[];
  };
  deletions: Fiber[];
}
interface BaseFiber {
  props: Record<string, any>;
  return?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
}

enum FiberFlag {
  UPDATE,
  DELETION,
  PLACEMAENT,
}

interface FunctionComponent {
  (props: Record<string, any>): MiniReactElement;
}

interface Hook {
  state: any;
  queue: any;
}

interface Fiber extends BaseFiber {
  type: string | Symbol | FunctionComponent;
  stateNode?: HTMLElement;
  alternate?: Fiber;
  hooks?: Hook[];
  flag: FiberFlag;
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
        typeof element !== "object"
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

function updateProps(fiber: Fiber) {
  const { children = [], ...props } = fiber.props;
  const { children: oldChildren = [], ...oldProps } =
    fiber?.alternate?.props || {};
  Object.keys(props).forEach((propKey) => {
    const newValue = props[propKey];
    const oldValue = oldProps[propKey];
    // prop 改变后更新 dom
    if (newValue !== oldValue) {
      const el = fiber.stateNode as HTMLElement as any;
      const isEvent =
        propKey.startsWith("on") &&
        propKey.length > 2 &&
        newValue instanceof Function;
      if (isEvent) {
        let eventName = propKey.substring(2);
        eventName = eventName.charAt(0).toLowerCase() + eventName.substring(1);
        el.removeEventListener(eventName, oldValue);
        el.addEventListener(eventName, newValue);
      } else {
        el[propKey] = newValue;
      }
    }
  });
}

// 提交 fiber 效果突变，更新 dom
function commitEffectMutation(fiber: Fiber) {
  if (isFunctionComponent(fiber)) {
    return;
  }
  if (!fiber.stateNode) {
    createInstance(fiber);
  }
  switch (fiber.flag) {
    case FiberFlag.PLACEMAENT: {
      const parentEl = findReturnFiberEl(fiber);
      parentEl.appendChild(fiber.stateNode as HTMLElement);
      break;
    }
    case FiberFlag.UPDATE: {
      updateProps(fiber);
      break;
    }
    case FiberFlag.DELETION: {
      const parentEl = findReturnFiberEl(fiber);
      parentEl.removeChild(fiber.stateNode as HTMLElement);
      break;
    }
  }
}

let completeRoot: FiberRoot | undefined;
let workInProgressRoot: FiberRoot | undefined;
let nextUnitOfWork: Fiber | undefined;
let workInProgressFiber: Fiber | undefined;
let hookIndex: number | undefined;

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  // fiber 构造完毕，提交更新
  if (!nextUnitOfWork && workInProgressRoot) {
    (window as any).a = workInProgressRoot;
    console.log(111);
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

// 执行 fiber 初始化工作
function performUnitOfWork(fiber: Fiber) {
  if (isFunctionComponent(fiber)) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // 返回下一个需要 fiber，首选 child，其次 兄弟 fiber，最后是一直找父级的兄弟
  let nextFiber = fiber.child || fiber.sibling;

  let returnFiber = fiber.return;

  while (!nextFiber && returnFiber) {
    nextFiber = returnFiber?.sibling;
    returnFiber = returnFiber?.return;
  }

  return nextFiber;
}

function isFunctionComponent(fiber: Fiber) {
  return fiber.type instanceof Function;
}

function updateFunctionComponent(fiber: Fiber) {
  workInProgressFiber = fiber;
  hookIndex = 0;
  workInProgressFiber.hooks = [];
  reconcileChildren(fiber, [(fiber.type as FunctionComponent)(fiber.props)]);
}

function updateHostComponent(fiber: Fiber) {
  reconcileChildren(fiber, fiber.props.children);
}

function createInstance(fiber: Fiber) {
  fiber.stateNode =
    fiber.type === TEXT_ELEMENT
      ? document.createTextNode("")
      : (document.createElement(fiber.type as string) as any);
  updateProps(fiber);
}

// 调和 children
function reconcileChildren(fiber: Fiber, children: MiniReactElement[] = []) {
  let index = 0;
  let prevFiber: Fiber | undefined;
  let oldFiber: Fiber | undefined = fiber.alternate?.child;
  // TODO: 调和数组的 children，根据 key 复用，目前展平
  const flatChildren = children.flat();
  while (index < flatChildren.length || oldFiber) {
    const element = flatChildren[index];
    let newFiber: Fiber | undefined;
    const sameType = oldFiber?.type === element?.type;

    if (sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        alternate: oldFiber,
        stateNode: (oldFiber as Fiber).stateNode,
        flag: FiberFlag.UPDATE,
      };
    } else {
      if (element) {
        newFiber = {
          type: element.type,
          props: element.props,
          flag: FiberFlag.PLACEMAENT,
        };
      }
      if (oldFiber) {
        oldFiber.flag = FiberFlag.DELETION;
        (workInProgressRoot as FiberRoot).deletions.push(oldFiber);
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    if (element) {
      (newFiber as Fiber).return = fiber;
      if (index === 0) {
        (fiber as Fiber).child = newFiber;
      } else {
        (prevFiber as Fiber).sibling = newFiber;
      }
    }
    index++;
    prevFiber = newFiber;
  }
}

// 提交 fiberRoot 更新 dom
function commitRoot() {
  (workInProgressRoot as FiberRoot).deletions.forEach((fiber) => {
    const parentEl = findReturnFiberEl(fiber);
    const el = findFiberEl(fiber);
    parentEl.removeChild(el);
  });
  commitUnitOfWork((workInProgressRoot as FiberRoot).child as Fiber);

  completeRoot = workInProgressRoot;
  workInProgressRoot = undefined;
}

function findReturnFiberEl(fiber: Fiber) {
  let parentEl: HTMLElement | undefined;
  let returnFiber = fiber.return;
  do {
    parentEl = returnFiber?.stateNode;
    returnFiber = returnFiber?.return;
  } while (!parentEl && returnFiber);
  return parentEl as HTMLElement;
}

function findFiberEl(fiber: Fiber) {
  let el: HTMLElement | undefined = fiber.stateNode;
  let childFiber = fiber.child;
  while (!el && childFiber) {
    el = childFiber.stateNode;
    childFiber = childFiber.child;
  }
  return el as HTMLElement;
}

function commitUnitOfWork(fiber?: Fiber) {
  if (!fiber) {
    return;
  }
  commitEffectMutation(fiber);

  commitUnitOfWork(fiber.child);
  commitUnitOfWork(fiber.sibling);
}

function scheduleUpdateOnFiber(root: FiberRoot) {
  workInProgressRoot = root;
  nextUnitOfWork = root as unknown as Fiber;
}

function createRoot(container: HTMLElement) {
  const render = (element: MiniReactElement) => {
    const fiberRoot: FiberRoot = {
      stateNode: container,
      props: {
        children: [element],
      },
      alternate: completeRoot,
      deletions: [],
    };
    scheduleUpdateOnFiber(fiberRoot);
  };
  return {
    render,
  };
}

type SetStateAction<V> = V | ((value: V) => V);

function useState<V>(initial: V) {
  const oldHook = workInProgressFiber?.alternate?.hooks?.[hookIndex as number];
  const hook = oldHook || {
    state: initial,
    queue: [],
  };
  hook.queue.forEach((action: any) => {
    hook.state = action instanceof Function ? action(hook.state) : action;
  });
  hook.queue = [];

  workInProgressFiber!.hooks!.push(hook);
  hookIndex!++;

  const setState = (action: SetStateAction<V>) => {
    hook.queue.push(action);
    const fiberRoot: FiberRoot = {
      stateNode: completeRoot!.stateNode,
      props: completeRoot!.props,
      alternate: completeRoot,
      deletions: [],
    };
    scheduleUpdateOnFiber(fiberRoot);
  };

  return [
    hook.state as V,
    setState as (action: SetStateAction<V>) => void,
  ] as const;
}

export default {
  createElement,
  createRoot,
  useState,
};

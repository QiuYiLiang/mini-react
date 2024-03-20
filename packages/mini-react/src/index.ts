interface MiniReactElement {
  type: string;
  props: Record<string, any>;
}

type Children = (MiniReactElement | string)[];

function createElement(
  type: string,
  props: Record<string, any>,
  ...children: Children
) {
  return {
    type,
    props: {
      ...props,
      children: children.map((element) => {
        typeof element === "string"
          ? {
              type: "TEXT_ELEMENT",
              props: {
                nodeValue: element,
              },
            }
          : element;
      }),
    },
  };
}

export default {
  createElement,
};

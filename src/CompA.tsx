import { createElement } from "./revue";
import { CompB } from "./CompB";

export const CompA = (props: any, element: any) => {
  if (!element.state) {
    element.state = {
      count: 0,
    };
  }

  return (
    <h1 class="hi">
      <button
        onclick={() => {
          element.state.count++;

          element.update();
        }}
      >
        {element.state.count}
      </button>
      {element.state.count > 1 ? <button>hi</button> : <div></div>}
      <span class="span">哈哈</span>
      <CompB />
    </h1>
  );
};

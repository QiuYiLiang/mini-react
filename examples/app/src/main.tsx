/** @jsx MiniReact.createElement */
import MiniReact from "@qiuyl/mini-react";

let count = 0;

const a = () => (
  <button>
    <p>1</p>
    <p>{count}</p>
  </button>
);
const b = (
  <button
    onClick={() => {
      count++;
      MiniReact.createRoot(
        document.getElementById("root") as HTMLElement
      ).render(a());
    }}
  >
    <p>1</p>
    <p>3</p>
  </button>
);

MiniReact.createRoot(document.getElementById("root") as HTMLElement).render(b);

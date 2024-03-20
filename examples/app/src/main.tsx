/** @jsx MiniReact.createElement */
import MiniReact from "@qiuyl/mini-react";

const a = <button>click</button>;
const b = (
  <button>
    <p>1</p>
    <p>2</p>
  </button>
);
const c = (
  <button>
    <p>1</p>
    <p>3</p>
  </button>
);

MiniReact.createRoot(document.getElementById("root") as HTMLElement).render(b);
MiniReact.createRoot(document.getElementById("root") as HTMLElement).render(c);

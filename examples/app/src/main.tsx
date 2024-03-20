/** @jsx MiniReact.createElement */
import MiniReact from "@qiuyl/mini-react";

let count = 0;

const handleClick = () => {
  count++;
  MiniReact.createRoot(document.getElementById("root") as HTMLElement).render(
    a()
  );
};

const a = () => (
  <button onClick={handleClick}>
    <p>1</p>
    <p>{count}</p>
  </button>
);
const C = () => (
  <button onClick={handleClick}>
    <p>1</p>
    <p>3</p>
  </button>
);

MiniReact.createRoot(document.getElementById("root") as HTMLElement).render(
  <C />
);

/** @jsx MiniReact.createElement */
import MiniReact from "@qiuyl/mini-react";

const C = () => {
  const [count, setCount] = MiniReact.useState(0);
  const [display, setDisplay] = MiniReact.useState(false);
  const toggle = () => {
    setDisplay((display) => !display);
  };
  return (
    <button
      onClick={() => {
        setCount((count) => count + 1);
        toggle();
      }}
    >
      {display && <h1>hhh</h1>}
      {count}
    </button>
  );
};

MiniReact.createRoot(document.getElementById("root") as HTMLElement).render(
  <C />
);

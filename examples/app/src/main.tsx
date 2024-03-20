/** @jsx MiniReact.createElement */
import MiniReact from "@qiuyl/mini-react";

const C = () => {
  const [count, setCount] = MiniReact.useState(0);
  return (
    <button
      onClick={() => {
        setCount((count) => count + 1);
      }}
    >
      {count}
    </button>
  );
};

MiniReact.createRoot(document.getElementById("root") as HTMLElement).render(
  <C />
);

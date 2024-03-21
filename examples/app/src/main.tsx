/** @jsx MiniReact.createElement */
import MiniReact from "@qiuyl/mini-react";

const C = () => {
  const [count, setCount] = MiniReact.useState(0);
  const [display, setDisplay] = MiniReact.useState(false);
  const toggle = () => {
    setDisplay((display) => !display);
  };
  const [todoList, setTodoList] = MiniReact.useState([1, 2, 3, 4]);
  const a = (
    <ul>
      <li>1</li>
      <li>2</li>
      <li>3</li>
    </ul>
  );
  const b = (
    <ul>
      {todoList.map((v) => {
        return <li>{v}</li>;
      })}
      {todoList.map((v) => {
        return <li>{v}</li>;
      })}
    </ul>
  );
  return (
    <div>
      <button
        onClick={() => {
          setCount((count) => count + 1);
          toggle();
          setTodoList([31, 13, 14, 51, 6, 567, 4, 7, 1124, 2]);
        }}
      >
        {display && <h1>hhh</h1>}
        {count}
      </button>
      {a}
      {b}
    </div>
  );
};

MiniReact.createRoot(document.getElementById("root") as HTMLElement).render(
  <C />
);

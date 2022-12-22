import { createElement, useState } from "@qiuyl/revue";
import { CompB } from "./CompB";

export const CompA = () => {
  const [count, setCount] = useState(0);
  const [count2, setCount2] = useState(2);

  return (
    <h1 className="hi">
      <button
        onClick={() => {
          setCount(count + 1);
          setCount2(count2 + 2);
        }}
      >
        {count}-{count2}
      </button>
      {count > 1 ? <button>hi</button> : <div></div>}
      <span className="span">哈哈</span>
      <CompB />
    </h1>
  );
};

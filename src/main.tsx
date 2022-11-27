import { CompA } from "./CompA";
import { createElement, createRoot } from "./revue";

const root = createRoot(<CompA />);

root.mount(document.getElementById("root") as Element);

// const b: any = [];
// let c: any;
//
// function a(value: any) {
//   b.push(value);
//
//   if (!c) {
//     c = setTimeout(() => {
//       // console.log(b);
//       c = null;
//     }, 0);
//   }
// }
//
// const f1 = () => {
//   a(1);
//   a(2);
// };
//
// f1();
// f1();

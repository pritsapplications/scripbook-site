// Writes the studio favicon source. The mark itself lives in mark-studio.mjs,
// shared with the Open Graph card so the two can't drift apart.
//
// The root of the domain belongs to the studio. ScripBook's S grid is built by
// favicon.mjs into scripbook/, because cells are ScripBook's alone.
import fs from "fs";
import { markSvg } from "./mark-studio.mjs";

fs.writeFileSync("icon.svg", markSvg(64));
fs.mkdirSync("src", { recursive: true });
fs.writeFileSync("src/favicon-studio.html",
  `<meta charset="utf-8"><style>*{margin:0;padding:0}html,body{width:512px;height:512px;overflow:hidden}
   svg{display:block;width:512px;height:512px}</style>${markSvg(512)}`);
console.log("wrote icon.svg (studio) and src/favicon-studio.html");

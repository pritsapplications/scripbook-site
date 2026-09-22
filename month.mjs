// The month shown in ScripBook's preview, shared by the studio home and the
// ScripBook link preview card. Kept in one place because the two have to show
// the same app: a card that advertises a feature the page doesn't show, or the
// other way round, is worse than either alone.
//
// Heat and categories answer different questions and the app draws both at
// once: the fill is how much went out that day, the bar is what it went on.
// Mostly light days with two that stand out and three with nothing spent,
// because a month where every day is red teaches nothing.
export const HEAT = {1:.18,2:.30,3:.12,4:0,5:.55,6:.72,7:.22,8:.14,9:.38,10:0,11:.26,
  12:.44,13:.88,14:.34,15:.10,16:.62,17:.20,18:0,19:.48,20:1,21:.30,22:.16,
  23:.40,24:.24,25:.58,26:.36,27:.68,28:.12};

// The app's real default categories, ids and colors from
// ScripBookApp/src/lib/constants.js.
export const CAT = { work:"#3D6B87", leisure:"#8B5A83", fun:"#B54834",
  essentials:"#5C7A52", other:"#7A6A53" };

// How each day's spending splits across categories. In the app the bar always
// spans the full width and each segment takes the share of that day's total
// its category accounts for, so these are weights, not widths.
export const MIX = {
  1:[["essentials",3]], 2:[["essentials",2],["work",1]], 3:[["other",1]],
  5:[["fun",2],["leisure",1]], 6:[["leisure",3],["fun",2]], 7:[["essentials",1]],
  8:[["other",1]], 9:[["work",2],["essentials",1]], 11:[["essentials",2]],
  12:[["fun",1],["essentials",2]], 13:[["fun",4],["leisure",2],["other",1]],
  14:[["essentials",2],["work",1]], 15:[["other",1]], 16:[["leisure",2],["fun",1]],
  17:[["essentials",1]], 19:[["work",1],["fun",1]],
  20:[["fun",3],["leisure",3],["essentials",1]], 21:[["essentials",2],["other",1]],
  22:[["other",1]], 23:[["work",1],["essentials",1]], 24:[["essentials",1]],
  25:[["leisure",2],["fun",1]], 26:[["essentials",1],["other",1]],
  27:[["fun",2],["work",1]], 28:[["essentials",1]],
};

// The classic ramp, the same expression the ScripBook page and the app itself
// use: hue falls from green to red while saturation rises and lightness drops,
// because a flat saturation makes the red end land as pink.
export const ramp = (p) => `hsl(${130 - 130 * p} ${48 + 32 * p}% ${72 - 16 * p}%)`;

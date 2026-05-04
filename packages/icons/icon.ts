/// <reference path="./prism.d.ts" />

// "<>" Chevron Pair — shape in the y–z plane (depth along x).
// Arms are 1 unit wide; each step shifts 1 in y AND 1 in z so
// adjacent steps share a face and the staircase stays connected.

const d  = 4;   // x depth
const x0 = 5;   // x=5..11, centered in 16

// Left < — staircase descending toward low y then back up
const lHi = union(union(union(
    prism(point(x0, 6, 12), size(d, 1, 2)),
    prism(point(x0, 5, 11), size(d, 1, 2))),
    prism(point(x0, 4, 10), size(d, 1, 2))),
    prism(point(x0, 3,  9), size(d, 1, 2))   // tip
);
const lLo = union(union(
    prism(point(x0, 4,  8), size(d, 1, 2)),
    prism(point(x0, 5,  7), size(d, 1, 2))),
    prism(point(x0, 6,  6), size(d, 1, 2))
);
const left = union(lHi, lLo);

// Right > — mirror, tip toward high y
const rHi = union(union(union(
    prism(point(x0,  9, 12), size(d, 1, 2)),
    prism(point(x0, 10, 11), size(d, 1, 2))),
    prism(point(x0, 11, 10), size(d, 1, 2))),
    prism(point(x0, 12,  9), size(d, 1, 2))   // tip
);
const rLo = union(union(
    prism(point(x0, 11,  8), size(d, 1, 2)),
    prism(point(x0, 10,  7), size(d, 1, 2))),
    prism(point(x0,  9,  6), size(d, 1, 2))
);
const right = union(rHi, rLo);

render(left,  "#569cd6");
render(right, "#4ec9b0");

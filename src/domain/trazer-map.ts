// The Trazer map as authored — the level data behind [DS-1.7], [DS-1.8] and [DS-1.9].
//
// Seven levels. Five form a plus; the right-hand leaf carries one level above it and one below.
// Agreed at the planning gate as the real map for this release rather than a fixture to be thrown
// away, so it is shaped to teach the navigation rules rather than to be convenient:
//
//        N          Eu
//        |          |
//  W --- C --- E ---+
//        |          |
//        S          Ed
//
// A run starts at C. Clearing it opens all four arms at once; clearing E then opens Eu and Ed —
// a three-way split followed by a two-way one, which is the smallest shape that exercises stepping
// backwards over cleared ground and reaching a level that is still locked.
//
// Separate from map.ts on single-responsibility grounds: that module answers questions about any
// map, this one is the answer to "which map". Changing the level layout must not touch the rules.

import type { LevelMap } from "./map";

export const TRAZER_MAP: LevelMap = {
  start: "C",
  levels: [
    { id: "C", x: 0, y: 0 },
    { id: "N", x: 0, y: 1 },
    { id: "S", x: 0, y: -1 },
    { id: "W", x: -1, y: 0 },
    { id: "E", x: 1, y: 0 },
    { id: "Eu", x: 1, y: 1 },
    { id: "Ed", x: 1, y: -1 },
  ],
  connections: [
    ["W", "C"],
    ["C", "N"],
    ["C", "S"],
    ["C", "E"],
    ["E", "Eu"],
    ["E", "Ed"],
  ],
};

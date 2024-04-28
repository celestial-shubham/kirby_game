import kaboom, { KaboomCtx } from "kaboom";
import { scale } from "./constants";

export const kCtx : KaboomCtx = kaboom({
  width: 256 * scale,
  height: 144 * scale,
  letterbox: true,
  scale,
  global: false,
});

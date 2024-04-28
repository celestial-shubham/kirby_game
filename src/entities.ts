import { GameObj, KaboomCtx } from "kaboom";
import { scale } from "./constants";

export async function makePlayer(kCtx: KaboomCtx, posx: number, posy: number) {
  const player = kCtx.make([
    kCtx.sprite("assets", { anim: "kirbIdle" }),
    kCtx.area({ shape: new kCtx.Rect(kCtx.vec2(4, 5.9), 8, 10) }),
    kCtx.body(),
    kCtx.pos(posx * scale, posy * scale),
    kCtx.scale(scale),
    kCtx.doubleJump(10),
    kCtx.health(3),
    kCtx.opacity(1),
    {
        speed : 300,
        direction : "right",
        isInhaling : false,
        isFull : false,
    },
    "player",
  ]);

  player.onCollide("enemy", async(enemy : GameObj) => {

  })
}

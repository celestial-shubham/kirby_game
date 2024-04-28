import { kCtx } from "./kaboomCtx";
import { makeMap } from "./utils";

async function gameSetup() {
  kCtx.loadSprite("assets", "./kirby-like.png", {
    sliceX: 9,
    sliceY: 10,
    anims: {
      kirbIdle: 0,
      kirbInhaling: 1,
      kirbFull: 2,
      kirbInhalingEffect: { from: 3, to: 8, speed: 15, loop: true },
      shootingStar: 9,
      flame: { from: 36, to: 37, speed: 4, loop: true },
      guyIdle: 18,
      guyWalk: { from: 18, to: 19, speed: 4, loop: true },
      bird: { from: 27, to: 28, speed: 4, loop: true },
    },
  });
  kCtx.loadSprite("level-1", "./level-1.png");
  const { map: level1Layout, spawnPoints: level1SpawnPoints } = await makeMap(
    kCtx,
    "level-1"
  );
  kCtx.scene("level-1", () => {
    kCtx.setGravity(2100);
    kCtx.add([
      kCtx.rect(kCtx.width(), kCtx.height()),
      kCtx.color(kCtx.Color.fromHex("#f7d7db")),
      kCtx.fixed(),
    ]);
    kCtx.add(level1Layout);
  });
  kCtx.go("level-1");
}

gameSetup();

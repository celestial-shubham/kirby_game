import { possibleBirdSpeeds } from "./constants";
import {
  makeBirdEnemy,
  makeFlameEnemy,
  makeGuyEnemy,
  makePlayer,
  setControls,
} from "./entities";
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

    const kirb = makePlayer(
      kCtx,
      level1SpawnPoints.player[0].x,
      level1SpawnPoints.player[0].y
    );
    setControls(kCtx, kirb);
    kCtx.add(kirb);

    kCtx.camScale(0.7, 0.7);
    kCtx.onUpdate(() => {
      if (kirb.pos.x < level1Layout.pos.x + 432) {
        kCtx.camPos(kirb.pos.x + 400, 880);
      }
    });

    for (const flame of level1SpawnPoints.flame) {
      makeFlameEnemy(kCtx, flame.x, flame.y);
    }

    for (const guy of level1SpawnPoints.enemy) {
      makeGuyEnemy(kCtx, guy.x, guy.y);
    }

    for (const bird of level1SpawnPoints.bird) {
      kCtx.loop(10, () => {
        makeBirdEnemy(
          kCtx,
          bird.x,
          bird.y,
          possibleBirdSpeeds[
            Math.floor(Math.random() * possibleBirdSpeeds.length)
          ]
        );
      });
    }
  });
  kCtx.go("level-1");
}

gameSetup();

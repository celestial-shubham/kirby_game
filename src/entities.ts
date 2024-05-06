import { GameObj, KaboomCtx } from "kaboom";
import { scale } from "./constants";
import { EColliderName, EActions, ENPCState } from "./enums";
import { TPlayerGameObj } from "./types/playerType";

export function makePlayer(kCtx: KaboomCtx, posx: number, posy: number) {
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
      speed: 300,
      direction: "right",
      isInhaling: false,
      isFull: false,
    },
    "player",
  ]);

  player.onCollide(EColliderName.ENEMY, async (enemy: GameObj) => {
    if (player.isInhaling && enemy.isInhalable) {
      player.isInhaling = false;
      kCtx.destroy(enemy);
      player.isFull = true;
      return;
    }

    if (player.hp() === 0) {
      kCtx.destroy(player);
      kCtx.go("level-1");
    }

    player.hurt();
    await kCtx.tween(
      player.opacity,
      0,
      0.05,
      (val) => (player.opacity = val),
      kCtx.easings.linear
    );

    await kCtx.tween(
      player.opacity,
      1,
      0.05,
      (val) => (player.opacity = val),
      kCtx.easings.linear
    );
  });

  player.onCollide(EColliderName.EXIT, () => {
    kCtx.go("level-2");
  });

  const inhaleEffect = kCtx.add([
    kCtx.sprite("assets", { anim: "kirbInhalingEffect" }),
    kCtx.pos(),
    kCtx.scale(scale),
    kCtx.opacity(0),
    "inhaleEffect",
  ]);

  const inhaleZone = player.add([
    kCtx.area({
      shape: new kCtx.Rect(kCtx.vec2(0), 20, 4),
    }),
    kCtx.pos(),
    "inhaleZone",
  ]);

  inhaleZone.onUpdate(() => {
    if (player.direction === EActions.LEFT) {
      inhaleZone.pos = kCtx.vec2(-14, 8);
      inhaleEffect.pos = kCtx.vec2(player.pos.x - 60, player.pos.y + 0);
      inhaleEffect.flipX = true;
      return;
    }
    inhaleZone.pos = kCtx.vec2(14, 8);
    inhaleEffect.pos = kCtx.vec2(player.pos.x + 60, player.pos.y + 0);
    inhaleEffect.flipX = false;
  });

  player.onUpdate(() => {
    if (player.pos.y > 2000) {
      kCtx.go("level-1");
    }
  });
  return player;
}

export function setControls(kCtx: KaboomCtx, player: TPlayerGameObj) {
  const inhaleEffectRef = kCtx.get("inhaleEffect")[0];

  kCtx.onKeyDown((key: string) => {
    switch (key) {
      case EActions.LEFT:
        player.direction = EActions.LEFT;
        player.flipX = true;
        player.move(-player.speed, 0);
        break;

      case EActions.RIGHT:
        player.direction = EActions.RIGHT;
        player.flipX = false;
        player.move(player.speed, 0);
        break;

      case EActions.INHALE:
        if (player.isFull) {
          player.play("kirbFull");
          inhaleEffectRef.opacity = 0;
          break;
        }
        player.isInhaling = true;
        player.play("kirbInhaling");
        inhaleEffectRef.opacity = 1;
        break;

      default:
    }
  });

  kCtx.onKeyPress((key: string) => {
    if (key === EActions.DOUBLE_JUMP) {
      player.doubleJump();
    }
  });

  kCtx.onKeyRelease((key: string) => {
    if (key === EActions.INHALE) {
      if (player.isFull) {
        player.play("kirbInhaling");
        const shootingStar = kCtx.add([
          kCtx.sprite("assets", {
            anim: "shootingStar",
            flipX: player.direction === EActions.RIGHT,
          }),
          kCtx.area({
            shape: new kCtx.Rect(kCtx.vec2(5, 4), 6, 6),
          }),
          kCtx.pos(
            player.direction === EActions.LEFT
              ? player.pos.x - 80
              : player.pos.x + 80,
            player.pos.y + 5
          ),
          kCtx.scale(scale),
          player.direction === EActions.LEFT
            ? kCtx.move(kCtx.LEFT, 800)
            : kCtx.move(kCtx.RIGHT, 800),
          "shootingStar",
        ]);

        shootingStar.onCollide(EColliderName.PLATFORM, () => {
          kCtx.destroy(shootingStar);
        });
        player.isFull = false;
        kCtx.wait(1, () => player.play("kirbIdle"));
        return;
      }
      inhaleEffectRef.opacity = 0;
      player.isInhaling = false;
      player.play("kirbIdle");
    }
  });
}

export function makeEnemyInhalable(kCtx: KaboomCtx, enemy: GameObj) {
  enemy.onCollide("inhaleZone", () => {
    enemy.isInhalable = true;
  });

  enemy.onCollideEnd("inhaleZone", () => {
    enemy.isInhalable = false;
  });

  enemy.onCollide(EColliderName.SHOOTING_STAR, (shootingStar: GameObj) => {
    kCtx.destroy(shootingStar);
    kCtx.destroy(enemy);
  });

  const playerRef = kCtx.get("player")[0];
  enemy.onUpdate(() => {
    if (playerRef.isInhaling && enemy.isInhalable) {
      if (playerRef.direction === EActions.RIGHT) {
        enemy.move(-800, 0);
        return;
      }
      enemy.move(800, 0);
    }
  });
}

export function makeFlameEnemy(kCtx: KaboomCtx, posX: number, posY: number) {
  const flame = kCtx.add([
    kCtx.sprite("assets", { anim: "flame" }),
    kCtx.scale(scale),
    kCtx.pos(posX * scale, posY * scale),
    kCtx.area({
      shape: new kCtx.Rect(kCtx.vec2(4, 6), 8, 10),
      collisionIgnore: [EColliderName.ENEMY],
    }),
    kCtx.body(),
    kCtx.state(ENPCState.IDLE, [ENPCState.IDLE, ENPCState.JUMP]),
    { isInhalable: false },
    EColliderName.ENEMY,
  ]);

  makeEnemyInhalable(kCtx, flame);
  flame.onStateEnter(ENPCState.IDLE, async () => {
    await kCtx.wait(1);
    flame.enterState(ENPCState.JUMP);
  });
  flame.onStateEnter(ENPCState.JUMP, async () => {
    flame.jump(800);
  });
  flame.onStateUpdate(ENPCState.JUMP, () => {
    if (flame.isGrounded()) {
      flame.enterState(ENPCState.IDLE);
    }
  });
  return flame;
}

export function makeGuyEnemy(kCtx: KaboomCtx, posX: number, posY: number) {
  const badGuy = kCtx.add([
    kCtx.sprite("assets", { anim: "guyWalk" }),
    kCtx.scale(scale),
    kCtx.pos(posX * scale, posY * scale),
    kCtx.area({
      shape: new kCtx.Rect(kCtx.vec2(2, 3.9), 12, 12),
      collisionIgnore: [EColliderName.ENEMY],
    }),
    kCtx.body(),
    kCtx.state(ENPCState.IDLE, [
      ENPCState.IDLE,
      ENPCState.LEFT,
      ENPCState.RIGHT,
    ]),
    { isInhalable: false, speed: 100 },
    EColliderName.ENEMY,
  ]);
  makeEnemyInhalable(kCtx, badGuy);

  badGuy.onStateEnter("idle", async () => {
    await kCtx.wait(1);
    badGuy.enterState("left");
  });

  badGuy.onStateEnter("left", async () => {
    badGuy.flipX = false;
    await kCtx.wait(2);
    badGuy.enterState("right");
  });

  badGuy.onStateUpdate("left", () => {
    badGuy.move(-badGuy.speed, 0);
  });

  badGuy.onStateEnter("right", async () => {
    badGuy.flipX = true;
    await kCtx.wait(2);
    badGuy.enterState("left");
  });

  badGuy.onStateUpdate("right", () => {
    badGuy.move(badGuy.speed, 0);
  });

  return badGuy;
}

export function makeBirdEnemy(
  kCtx: KaboomCtx,
  posX: number,
  posY: number,
  speed: number
) {
  const bird = kCtx.add([
    kCtx.sprite("assets", { anim: "bird" }),
    kCtx.scale(scale),
    kCtx.pos(posX * scale, posY * scale),
    kCtx.area({
      shape: new kCtx.Rect(kCtx.vec2(4, 6), 8, 10),
      collisionIgnore: ["enemy"],
    }),
    kCtx.body({ isStatic: true }),
    kCtx.move(kCtx.LEFT, speed),
    kCtx.offscreen({ destroy: true, distance: 400 }),
    "enemy",
  ]);

  makeEnemyInhalable(kCtx, bird);

  return bird;
}

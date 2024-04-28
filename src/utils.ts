import { scale } from "./constants";

import { KaboomCtx } from "kaboom";
import { EColliderName, EDataLayerType } from "./enums";

export async function makeMap(kCtx: KaboomCtx, name: string) {
  const mapData = await (await fetch(`./${name}.json`)).json();
  const map = kCtx.make([kCtx.sprite(name), kCtx.scale(scale), kCtx.pos(0)]);

  const spawnPoints: { [key: string]: { x: number; y: number }[] } = {};
  for (const layer of mapData.layers) {
    if (layer.name === EDataLayerType.COLLIDERS) {
      for (const collider of layer.objects) {
        map.add([
          kCtx.area({
            shape: new kCtx.Rect(kCtx.vec2(0), collider.width, collider.height),
            collisionIgnore: [EColliderName.EXIT, EColliderName.PLATFORM],
          }),
          collider.name !== EColliderName.EXIT
            ? kCtx.body({ isStatic: true })
            : null,

          kCtx.pos(collider.x, collider.y),
          collider.name !== EColliderName.EXIT
            ? EColliderName.PLATFORM
            : EColliderName.EXIT,
        ]);
      }
      continue;
    }

    if (layer.name === EDataLayerType.SPAWNPOINTS) {
      for (const spawnPoint of layer.objects) {
        if (spawnPoints[spawnPoint.name]) {
          spawnPoints[spawnPoint.name].push({
            x: spawnPoint.x,
            y: spawnPoint.y,
          });
          continue;
        }

        spawnPoints[spawnPoint.name] = [{ x: spawnPoint.x, y: spawnPoint.y }];
      }
    }
  }
  return { map, spawnPoints };
}

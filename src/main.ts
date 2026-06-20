import { loadLevel1 } from './world/Level';
import { Player } from './entities/Player';
import { Camera } from './core/Camera';
import { Input } from './core/Input';
import { Renderer } from './render/Renderer';
import { FogRenderer } from './render/FogRenderer';
import { GameLoop } from './core/loop';
import { castConeRays, HALF_ANGLE } from './world/Fov';
import { CONFIG } from './config';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function resize(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const level = loadLevel1();
const player = new Player(level.playerSpawn);
const camera = new Camera(canvas.width, canvas.height);
const input = new Input();
const renderer = new Renderer(ctx);
const fog = new FogRenderer();

const loop = new GameLoop(
  1 / 60,
  (dt) => {
    player.update(dt, input.moveDir(), level.map);
    const aim = input.aimFromCenter(canvas.width / 2, canvas.height / 2);
    if (aim !== null) player.aim = aim;
  },
  () => {
    camera.viewW = canvas.width;
    camera.viewH = canvas.height;
    camera.follow(player.pos);

    renderer.drawWorld(level.map, camera);

    const coneWorld = castConeRays(player.pos, player.aim, HALF_ANGLE, CONFIG.cone.range, 48, level.map);
    const coneScreen = coneWorld.map((p) => camera.worldToScreen(p));
    const proxScreen = camera.worldToScreen(player.pos);
    fog.draw(ctx, coneScreen, proxScreen, CONFIG.proximityRadius);

    renderer.drawPlayer(player, camera);
  },
);
loop.start();

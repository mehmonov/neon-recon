import { loadLevel1 } from './world/Level';
import { Game } from './core/Game';
import { Camera } from './core/Camera';
import { Input } from './core/Input';
import { Renderer } from './render/Renderer';
import { FogRenderer } from './render/FogRenderer';
import { Hud } from './render/Hud';
import { Screens } from './ui/Screens';
import { GameLoop } from './core/loop';
import { castConeRays, HALF_ANGLE, isVisible } from './world/Fov';
import { CONFIG } from './config';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function resize(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const game = new Game(loadLevel1());
const camera = new Camera(canvas.width, canvas.height);
const input = new Input();
const renderer = new Renderer(ctx);
const fog = new FogRenderer();
const hud = new Hud();
const screens = new Screens(game);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (game.state === 'playing') game.pause();
    else if (game.state === 'paused') game.resume();
  }
});

function render(): void {
  camera.viewW = canvas.width;
  camera.viewH = canvas.height;
  const player = game.player;
  const map = game.level.map;
  camera.follow(player.pos);

  renderer.drawWorld(map, camera);

  const visPickups = game.pickups.filter(
    (p) => p.active && isVisible(player.pos, player.aim, p.pos, map),
  );
  renderer.drawPickups(visPickups, camera);

  const visEnemies = game.enemies.filter(
    (e) => e.alive && isVisible(player.pos, player.aim, e.pos, map),
  );
  renderer.drawEnemies(visEnemies, camera);
  renderer.drawBullets(game.bullets, camera);

  const cone = castConeRays(player.pos, player.aim, HALF_ANGLE, CONFIG.cone.range, 48, map);
  fog.draw(
    ctx,
    cone.map((pt) => camera.worldToScreen(pt)),
    camera.worldToScreen(player.pos),
    CONFIG.proximityRadius,
  );

  renderer.drawPlayer(player, camera);

  if (game.state === 'playing' || game.state === 'paused') hud.draw(ctx, game, input);
  screens.sync();
}

new GameLoop(1 / 60, (dt) => game.update(dt, input, canvas.width, canvas.height), render).start();

import { loadLevel1 } from './world/Level';
import { Game } from './core/Game';
import { Camera } from './core/Camera';
import { Input } from './core/Input';
import { Renderer } from './render/Renderer';
import { FogRenderer } from './render/FogRenderer';
import { Hud } from './render/Hud';
import { Screens } from './ui/Screens';
import { SettingsPanel } from './ui/SettingsPanel';
import { GameLoop } from './core/loop';
import { castConeRays, HALF_ANGLE, isVisible } from './world/Fov';
import { loadAssets } from './render/assets';
import { CONFIG } from './config';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const rotateEl = document.getElementById('screen-rotate') as HTMLElement;

const assets = loadAssets();
const game = new Game(loadLevel1());
const camera = new Camera(canvas.width, canvas.height);
const input = new Input(canvas);
const renderer = new Renderer(ctx, assets);
const fog = new FogRenderer();
const hud = new Hud(assets);
const screens = new Screens(game);
const settingsPanel = new SettingsPanel(game);

let pausedByRotation = false;

function checkOrientation(): void {
  const portrait = window.innerHeight > window.innerWidth;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const blocked = portrait && coarse;
  rotateEl.style.display = blocked ? 'flex' : 'none';
  if (blocked && game.state === 'playing') {
    game.pause();
    pausedByRotation = true;
  } else if (!blocked && pausedByRotation && game.state === 'paused') {
    game.resume();
    pausedByRotation = false;
  }
}

function resize(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  checkOrientation();
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);
resize();

// Fullscreen needs a user gesture, so request it on the first tap while in landscape on a phone.
function enterFullscreenMaybe(): void {
  if (!window.matchMedia('(pointer: coarse)').matches) return;
  if (window.innerHeight > window.innerWidth) return;
  if (document.fullscreenElement) return;
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
  if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
}
window.addEventListener('click', enterFullscreenMaybe);
canvas.addEventListener('touchend', enterFullscreenMaybe);

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
  settingsPanel.syncGear();
}

new GameLoop(1 / 60, (dt) => game.update(dt, input, canvas.width, canvas.height), render).start();

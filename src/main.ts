import { loadLevel1 } from './world/Level';
import { Player } from './entities/Player';
import { Camera } from './core/Camera';
import { Input } from './core/Input';
import { Renderer } from './render/Renderer';
import { GameLoop } from './core/loop';

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

const loop = new GameLoop(
  1 / 60,
  (dt) => {
    player.update(dt, input.moveDir(), level.map);
  },
  () => {
    camera.viewW = canvas.width;
    camera.viewH = canvas.height;
    camera.follow(player.pos);
    renderer.draw(level.map, player, camera);
  },
);
loop.start();

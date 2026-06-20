import { loadLevel1 } from './world/Level';
import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { Bullet } from './entities/Bullet';
import { Camera } from './core/Camera';
import { Input } from './core/Input';
import { Renderer } from './render/Renderer';
import { FogRenderer } from './render/FogRenderer';
import { GameLoop } from './core/loop';
import { castConeRays, HALF_ANGLE, isVisible } from './world/Fov';
import { nearestVisibleEnemy, circleHit } from './systems/Combat';
import { Vec2, angleOf, sub } from './core/Vec2';
import { CONFIG, TILE } from './config';

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
const enemies = level.enemySpawns.map((s) => new Enemy(s));
let bullets: Bullet[] = [];
let score = 0;
let gameOver = false;

const camera = new Camera(canvas.width, canvas.height);
const input = new Input();
const renderer = new Renderer(ctx);
const fog = new FogRenderer();

function spawnEnemyBullet(pos: Vec2, angle: number): void {
  bullets.push(
    new Bullet(
      pos,
      angle,
      CONFIG.enemy.bulletSpeed,
      CONFIG.enemy.damage,
      'enemy',
      CONFIG.enemy.visionRange + TILE,
      CONFIG.weapon.bulletRadius,
    ),
  );
}

function update(dt: number): void {
  if (gameOver) return;

  player.update(dt, input.moveDir(), level.map);
  const aim = input.aimFromCenter(canvas.width / 2, canvas.height / 2);
  if (aim !== null) player.aim = aim;

  for (const e of enemies) e.update(dt, player, level.map, spawnEnemyBullet);

  const ti = nearestVisibleEnemy(player.pos, player.aim, enemies, level.map);
  if (ti >= 0 && player.weapon.canFire()) {
    const ang = angleOf(sub(enemies[ti].pos, player.pos));
    bullets.push(
      new Bullet(
        player.pos,
        ang,
        CONFIG.weapon.bulletSpeed,
        CONFIG.weapon.damage,
        'player',
        CONFIG.cone.range,
        CONFIG.weapon.bulletRadius,
      ),
    );
    player.weapon.fire();
  }

  for (const b of bullets) {
    b.update(dt, level.map);
    if (!b.alive) continue;
    if (b.team === 'player') {
      for (const e of enemies) {
        if (e.alive && circleHit(b.pos, e.pos, e.radius)) {
          e.hp -= b.damage;
          b.alive = false;
          if (e.hp <= 0) {
            e.alive = false;
            score += CONFIG.scorePerKill;
          }
          break;
        }
      }
    } else if (circleHit(b.pos, player.pos, player.radius)) {
      player.hp -= b.damage;
      b.alive = false;
      if (player.hp <= 0) {
        player.hp = 0;
        gameOver = true;
      }
    }
  }
  bullets = bullets.filter((b) => b.alive);
}

function render(): void {
  camera.viewW = canvas.width;
  camera.viewH = canvas.height;
  camera.follow(player.pos);

  renderer.drawWorld(level.map, camera);
  const visibleEnemies = enemies.filter(
    (e) => e.alive && isVisible(player.pos, player.aim, e.pos, level.map),
  );
  renderer.drawEnemies(visibleEnemies, camera);
  renderer.drawBullets(bullets, camera);

  const coneWorld = castConeRays(player.pos, player.aim, HALF_ANGLE, CONFIG.cone.range, 48, level.map);
  const coneScreen = coneWorld.map((p) => camera.worldToScreen(p));
  fog.draw(ctx, coneScreen, camera.worldToScreen(player.pos), CONFIG.proximityRadius);

  renderer.drawPlayer(player, camera);
  drawHud();
}

function drawHud(): void {
  const alive = enemies.filter((e) => e.alive).length;
  ctx.fillStyle = '#EAF0F0';
  ctx.font = '16px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(
    `HP ${Math.max(0, Math.ceil(player.hp))}    Ammo ${player.weapon.magazine}/${player.weapon.reserve}    Score ${score}    Enemies ${alive}`,
    16,
    26,
  );
  if (gameOver) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF6B78';
    ctx.font = '48px system-ui, sans-serif';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
  }
}

new GameLoop(1 / 60, update, render).start();

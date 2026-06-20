import { TILE } from '../config';

export class TileMap {
  constructor(
    public readonly cols: number,
    public readonly rows: number,
    private readonly tiles: ReadonlyArray<number>,
  ) {}

  isWall(col: number, row: number): boolean {
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return true;
    return this.tiles[row * this.cols + col] === 1;
  }

  isWallAtWorld(x: number, y: number): boolean {
    return this.isWall(Math.floor(x / TILE), Math.floor(y / TILE));
  }

  get widthPx(): number {
    return this.cols * TILE;
  }

  get heightPx(): number {
    return this.rows * TILE;
  }
}

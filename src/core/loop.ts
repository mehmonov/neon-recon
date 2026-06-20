export interface StepResult {
  steps: number;
  remainder: number;
}

export function fixedSteps(acc: number, frameDt: number, step: number, maxSteps: number): StepResult {
  let total = acc + frameDt;
  let steps = 0;
  while (total >= step && steps < maxSteps) {
    total -= step;
    steps++;
  }
  return { steps, remainder: total };
}

export class GameLoop {
  private acc = 0;
  private last = 0;
  private running = false;
  private readonly maxSteps = 5;

  constructor(
    private readonly step: number,
    private readonly update: (dt: number) => void,
    private readonly render: () => void,
  ) {}

  start(now: number = performance.now()): void {
    this.running = true;
    this.last = now;
    requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
  }

  private frame = (now: number): void => {
    if (!this.running) return;
    const frameDt = (now - this.last) / 1000;
    this.last = now;
    const { steps, remainder } = fixedSteps(this.acc, frameDt, this.step, this.maxSteps);
    for (let i = 0; i < steps; i++) this.update(this.step);
    this.acc = remainder;
    this.render();
    requestAnimationFrame(this.frame);
  };
}

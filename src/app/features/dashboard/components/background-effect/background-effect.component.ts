import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../../core/services';

@Component({
  selector: 'app-background-effect',
  standalone: true,
  imports: [CommonModule],
  template: `
    <canvas
      #canvas
      class="fixed inset-0 pointer-events-none"
      style="z-index: 0;"
    ></canvas>
  `,
})
export class BackgroundEffectComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private animationId = 0;
  private theme = inject(ThemeService);

  constructor() {
    effect(() => {
      const dark = this.theme.isDark();
      this.stopAnimation();
      if (dark) {
        this.startLightning();
      } else {
        this.startSunrays();
      }
    });
  }

  ngOnInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  ngOnDestroy(): void {
    this.stopAnimation();
    window.removeEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
    if (this.ctx) {
      const canvas = this.canvasRef.nativeElement;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // ─── SUNRAYS (light mode) ───────────────────────────────────────────────────

  private sunrays: Sunray[] = [];

  private startSunrays(): void {
    this.sunrays = Array.from({ length: 10 }, (_, i) => this.createSunray(i));
    this.animateSunrays();
  }

  private createSunray(index: number): Sunray {
    const canvas = this.canvasRef.nativeElement;
    const spread = canvas.width * 1.4;
    const originX = canvas.width * 0.5;
    return {
      angle: -0.55 + index * 0.12,
      originX,
      width: 18 + Math.random() * 40,
      opacity: 0.1 + Math.random() * 0.15,
      opacityTarget: 0.1 + Math.random() * 0.15,
      opacitySpeed: 0.0005 + Math.random() * 0.001,
      spread,
    };
  }

  private animateSunrays(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const ray of this.sunrays) {
      // Suave pulsação de opacidade
      ray.opacity += (ray.opacityTarget - ray.opacity) * ray.opacitySpeed * 60;
      if (Math.abs(ray.opacity - ray.opacityTarget) < 0.001) {
        ray.opacityTarget = 0.03 + Math.random() * 0.08;
      }

      const x0 = ray.originX;
      const y0 = -80;
      const halfW = ray.width / 2;

      const x1 = x0 - halfW + Math.sin(ray.angle) * ray.spread;
      const x2 = x0 + halfW + Math.sin(ray.angle) * ray.spread;
      const yEnd = canvas.height + 100;

      const grad = this.ctx.createLinearGradient(x0, y0, x0, yEnd);
      grad.addColorStop(0, `rgba(255, 210, 140, ${ray.opacity * 2.2})`);
      grad.addColorStop(0.4, `rgba(255, 200, 120, ${ray.opacity * 1.4})`);
      grad.addColorStop(1, `rgba(255, 190, 100, 0)`);

      this.ctx.beginPath();
      this.ctx.moveTo(x0 - halfW, y0);
      this.ctx.lineTo(x1, yEnd);
      this.ctx.lineTo(x2, yEnd);
      this.ctx.lineTo(x0 + halfW, y0);
      this.ctx.closePath();

      this.ctx.fillStyle = grad;
      this.ctx.fill();
    }

    this.animationId = requestAnimationFrame(() => this.animateSunrays());
  }

  // ─── LIGHTNING (dark mode) ──────────────────────────────────────────────────

  private lightningTimeout = 0;

  private startLightning(): void {
    this.scheduleLightning();
  }

  private scheduleLightning(): void {
    const delay = 800 + Math.random() * 2500;
    this.lightningTimeout = window.setTimeout(() => {
      this.flashLightning();
    }, delay);
  }

  private flashLightning(): void {
    const canvas = this.canvasRef.nativeElement;
    const x = canvas.width * (0.2 + Math.random() * 0.6);

    // Flash de tela
    this.doFlash(0.12, () => {
      this.drawBolt(x);
      setTimeout(() => {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        setTimeout(() => {
          this.doFlash(0.06, () => {
            this.scheduleLightning();
          });
        }, 60);
      }, 120);
    });
  }

  private doFlash(opacity: number, cb: () => void): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.fillStyle = `rgba(180, 200, 255, ${opacity})`;
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    setTimeout(cb, 40);
  }

  private drawBolt(x: number): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    const segments = 10 + Math.floor(Math.random() * 6);
    const points: { x: number; y: number }[] = [{ x, y: 0 }];
    const segH = (canvas.height * 0.65) / segments;

    for (let i = 1; i <= segments; i++) {
      points.push({
        x: points[i - 1].x + (Math.random() - 0.5) * 80,
        y: i * segH,
      });
    }

    // Glow externo
    this.ctx.shadowColor = 'rgba(150, 180, 255, 0.9)';
    this.ctx.shadowBlur = 24;
    this.ctx.strokeStyle = 'rgba(200, 220, 255, 0.95)';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    this.ctx.stroke();

    // Linha central branca
    this.ctx.shadowBlur = 8;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.98)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    this.ctx.stroke();

    this.ctx.shadowBlur = 0;

    // Ramificações
    const branchCount = 2 + Math.floor(Math.random() * 3);
    const branchStart = Math.floor(segments * 0.3);
    for (let b = 0; b < branchCount; b++) {
      const startIdx =
        branchStart + Math.floor(Math.random() * (segments - branchStart));
      this.drawBranch(points[startIdx].x, points[startIdx].y);
    }
  }

  private drawBranch(startX: number, startY: number): void {
    const length = 60 + Math.random() * 80;
    const angle = (Math.random() - 0.5) * 1.2;
    const segs = 4 + Math.floor(Math.random() * 3);
    const segL = length / segs;

    let cx = startX;
    let cy = startY;

    this.ctx.strokeStyle = 'rgba(180, 200, 255, 0.6)';
    this.ctx.lineWidth = 0.8;
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = 'rgba(150, 180, 255, 0.5)';
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy);

    for (let i = 0; i < segs; i++) {
      cx += Math.sin(angle + (Math.random() - 0.5) * 0.5) * segL;
      cy += Math.cos(angle) * segL;
      this.ctx.lineTo(cx, cy);
    }

    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
  }
}

interface Sunray {
  angle: number;
  originX: number;
  width: number;
  opacity: number;
  opacityTarget: number;
  opacitySpeed: number;
  spread: number;
}

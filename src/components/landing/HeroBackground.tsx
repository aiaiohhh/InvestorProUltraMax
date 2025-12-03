'use client';

import { useEffect, useRef } from 'react';

type CandleSizeVariant = 'compact' | 'balanced' | 'tower';

interface Candle {
  x: number;
  y: number;
  vy: number;
  baseVy: number;
  width: number;
  bodyHeight: number;
  wickTop: number;
  wickBottom: number;
  opacity: number;
  baseOpacity: number;
  isGreen: boolean;
  scale: number;
  baseScale: number;
  isHovered: boolean;
  hoverProgress: number;
  sizeVariant: CandleSizeVariant;
  profitValue: number;
  profitLabel: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

interface DataPoint {
  x: number;
  y: number;
  value: string;
  opacity: number;
  speed: number;
  isPositive: boolean;
}

const candleSizeProfiles: Record<
  CandleSizeVariant,
  {
    width: [number, number];
    body: [number, number];
    wickTop: [number, number];
    wickBottom: [number, number];
    scale: [number, number];
    pnl: [number, number];
    speed: [number, number];
  }
> = {
  compact: {
    width: [4, 8],
    body: [18, 40],
    wickTop: [8, 16],
    wickBottom: [8, 18],
    scale: [0.4, 0.6],
    pnl: [0.6, 2.2],
    speed: [0.8, 1.5],
  },
  balanced: {
    width: [7, 12],
    body: [45, 85],
    wickTop: [12, 26],
    wickBottom: [12, 24],
    scale: [0.65, 0.9],
    pnl: [2, 5.5],
    speed: [0.55, 1.1],
  },
  tower: {
    width: [10, 16],
    body: [90, 150],
    wickTop: [20, 38],
    wickBottom: [20, 34],
    scale: [0.9, 1.25],
    pnl: [4.5, 9.5],
    speed: [0.35, 0.85],
  },
};

const candleVariants = Object.keys(candleSizeProfiles) as CandleSizeVariant[];

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

const formatProfitLabel = (value: number) =>
  `${value >= 0 ? '+' : '-'}$${Math.abs(value).toFixed(1)}k`;

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Track mouse position for interactivity
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Create candlesticks - green go up, red go down
    const candles: Candle[] = [];
    const particles: Particle[] = [];
    const dataPoints: DataPoint[] = [];

    // Initialize candlesticks
    const createCandle = (isGreen: boolean, startY?: number): Candle => {
      const sizeVariant = candleVariants[Math.floor(Math.random() * candleVariants.length)];
      const profile = candleSizeProfiles[sizeVariant];
      const baseSpeed = randomRange(profile.speed[0], profile.speed[1]);
      const baseOpacity = Math.random() * 0.25 + 0.08;
      const baseScale = randomRange(profile.scale[0], profile.scale[1]);
      const profitMagnitude = randomRange(profile.pnl[0], profile.pnl[1]);
      const signedProfit = (isGreen ? 1 : -1) * profitMagnitude;

      return {
        x: Math.random() * canvas.width,
        y: startY !== undefined ? startY : Math.random() * canvas.height,
        vy: isGreen ? -baseSpeed : baseSpeed,
        baseVy: isGreen ? -baseSpeed : baseSpeed,
        width: randomRange(profile.width[0], profile.width[1]),
        bodyHeight: randomRange(profile.body[0], profile.body[1]),
        wickTop: randomRange(profile.wickTop[0], profile.wickTop[1]),
        wickBottom: randomRange(profile.wickBottom[0], profile.wickBottom[1]),
        opacity: baseOpacity,
        baseOpacity,
        isGreen,
        scale: baseScale,
        baseScale,
        isHovered: false,
        hoverProgress: 0,
        sizeVariant,
        profitValue: signedProfit,
        profitLabel: formatProfitLabel(signedProfit),
      };
    };

    const resetCandle = (candle: Candle, startY: number) => {
      const freshCandle = createCandle(candle.isGreen, startY);
      Object.assign(candle, freshCandle);
    };

    // Create initial candles - fewer candles for cleaner look
    for (let i = 0; i < 18; i++) {
      candles.push(createCandle(true)); // Green candles
    }
    for (let i = 0; i < 14; i++) {
      candles.push(createCandle(false)); // Red candles
    }

    // Initialize particles for ambient effect - fewer particles
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        color: Math.random() > 0.5 ? '#22c55e' : '#ef4444',
      });
    }

    // Floating percentage/price data - fewer data points, positioned at edges
    const positiveValues = ['+2.34%', '+5.67%', '+12.4%', '+6.02%', '+8.45%'];
    const negativeValues = ['-1.52%', '-3.21%', '-2.32%', '-4.56%'];
    const priceValues = ['$178.72', '$67,234', '$495.22', '$3,456'];

    // Function to get X position away from center
    const getEdgeX = () => {
      // Keep data values in the outer 25% of each side (edges only)
      const margin = canvas.width * 0.25;
      if (Math.random() > 0.5) {
        return Math.random() * margin; // Left side
      } else {
        return canvas.width - Math.random() * margin; // Right side
      }
    };

    for (let i = 0; i < 10; i++) {
      const isPositive = Math.random() > 0.4;
      const valueArray = isPositive ? positiveValues : negativeValues;
      const value = Math.random() > 0.3 
        ? valueArray[Math.floor(Math.random() * valueArray.length)]
        : priceValues[Math.floor(Math.random() * priceValues.length)];
      
      dataPoints.push({
        x: getEdgeX(),
        y: Math.random() * canvas.height,
        value,
        opacity: Math.random() * 0.12 + 0.04, // Lower base opacity
        speed: (Math.random() * 0.4 + 0.15) * (isPositive ? -1 : 1),
        isPositive: isPositive || value.startsWith('$'),
      });
    }

    // Animation loop
    const animate = () => {
      // Clear with solid color for cleaner look (no trails)
      ctx.fillStyle = 'rgba(10, 12, 18, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw very subtle grid
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 100;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw and update candlesticks
      candles.forEach((candle) => {
        const scaledWidth = candle.width * candle.scale;
        const scaledBodyHeight = candle.bodyHeight * candle.scale;
        const scaledWickTop = candle.wickTop * candle.scale;
        const scaledWickBottom = candle.wickBottom * candle.scale;

        // Check if mouse is hovering over this candle
        const candleLeft = candle.x - scaledWidth / 2 - 30;
        const candleRight = candle.x + scaledWidth / 2 + 30;
        const candleTop = candle.y - scaledWickTop - 20;
        const candleBottom = candle.y + scaledBodyHeight + scaledWickBottom + 20;
        
        const wasHovered = candle.isHovered;
        candle.isHovered = 
          mouseRef.current.x >= candleLeft &&
          mouseRef.current.x <= candleRight &&
          mouseRef.current.y >= candleTop &&
          mouseRef.current.y <= candleBottom;

        // Smooth hover transition
        if (candle.isHovered) {
          candle.hoverProgress = Math.min(1, candle.hoverProgress + 0.08);
        } else {
          candle.hoverProgress = Math.max(0, candle.hoverProgress - 0.05);
        }

        // Calculate distance from center for opacity reduction in hero area
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const distFromCenterX = Math.abs(candle.x - centerX);
        const distFromCenterY = Math.abs(candle.y - centerY);
        
        // Reduce opacity in the center zone (where hero text is)
        const centerZoneWidth = canvas.width * 0.35;
        const centerZoneHeight = canvas.height * 0.35;
        const inCenterZone = distFromCenterX < centerZoneWidth && distFromCenterY < centerZoneHeight;
        const centerFade = inCenterZone 
          ? 0.3 + 0.7 * Math.max(distFromCenterX / centerZoneWidth, distFromCenterY / centerZoneHeight)
          : 1;

        // Apply hover effects
        const hoverScale = 1 + candle.hoverProgress * 0.4;
        const hoverOpacity = (candle.baseOpacity + candle.hoverProgress * 0.5) * centerFade;
        const hoverSpeedMultiplier = 1 - candle.hoverProgress * 0.8; // Slow down when hovered

        candle.scale = candle.baseScale * hoverScale;
        candle.opacity = hoverOpacity;
        candle.vy = candle.baseVy * hoverSpeedMultiplier;

        // Recalculate scaled dimensions with hover
        const finalWidth = candle.width * candle.scale;
        const finalBodyHeight = candle.bodyHeight * candle.scale;
        const finalWickTop = candle.wickTop * candle.scale;
        const finalWickBottom = candle.wickBottom * candle.scale;

        // Colors - more subtle base colors
        const bodyColor = candle.isGreen ? '34, 197, 94' : '239, 68, 68';

        // Draw subtle glow only when hovered
        if (candle.hoverProgress > 0) {
          const glowRadius = finalBodyHeight * (0.8 + candle.hoverProgress * 0.7);
          const glowGradient = ctx.createRadialGradient(
            candle.x, candle.y + finalBodyHeight / 2,
            0,
            candle.x, candle.y + finalBodyHeight / 2,
            glowRadius
          );
          glowGradient.addColorStop(0, `rgba(${bodyColor}, ${candle.hoverProgress * 0.25})`);
          glowGradient.addColorStop(0.5, `rgba(${bodyColor}, ${candle.hoverProgress * 0.1})`);
          glowGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(candle.x, candle.y + finalBodyHeight / 2, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw wick (shadow line)
        ctx.strokeStyle = `rgba(${bodyColor}, ${candle.opacity * 0.7})`;
        ctx.lineWidth = Math.max(1, finalWidth * 0.12);
        ctx.beginPath();
        ctx.moveTo(candle.x, candle.y - finalWickTop);
        ctx.lineTo(candle.x, candle.y + finalBodyHeight + finalWickBottom);
        ctx.stroke();

        // Draw candle body
        ctx.fillStyle = `rgba(${bodyColor}, ${candle.opacity})`;
        ctx.fillRect(
          candle.x - finalWidth / 2,
          candle.y,
          finalWidth,
          finalBodyHeight
        );

        // Draw highlight on candle body
        ctx.fillStyle = `rgba(255, 255, 255, ${candle.opacity * 0.15})`;
        ctx.fillRect(
          candle.x - finalWidth / 2,
          candle.y,
          finalWidth * 0.25,
          finalBodyHeight
        );

        // Draw border on hover
        if (candle.hoverProgress > 0.1) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${candle.hoverProgress * 0.3})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(
            candle.x - finalWidth / 2,
            candle.y,
            finalWidth,
            finalBodyHeight
          );
        }

        // Tooltip with profit/loss details
        if (candle.hoverProgress > 0.05) {
          ctx.font = '600 12px "Inter", "SF Pro Display", sans-serif';
          const tooltipPaddingX = 10;
          const tooltipHeight = 26;
          const textMetrics = ctx.measureText(candle.profitLabel);
          const tooltipWidth = textMetrics.width + tooltipPaddingX * 2;
          let tooltipX = candle.x - tooltipWidth / 2;
          tooltipX = Math.max(16, Math.min(tooltipX, canvas.width - tooltipWidth - 16));
          const tooltipDirection = candle.isGreen ? -1 : 1;
          let tooltipY =
            tooltipDirection === -1
              ? candle.y - finalWickTop - tooltipHeight - 14
              : candle.y + finalBodyHeight + finalWickBottom + 14;
          tooltipY = Math.max(12, Math.min(tooltipY, canvas.height - tooltipHeight - 12));
          const accentColor = candle.isGreen
            ? `rgba(74, 222, 128, ${0.55 + candle.hoverProgress * 0.4})`
            : `rgba(248, 113, 113, ${0.55 + candle.hoverProgress * 0.4})`;

          ctx.fillStyle = `rgba(8, 10, 16, ${0.65 + candle.hoverProgress * 0.3})`;
          ctx.beginPath();
          ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 8);
          ctx.fill();
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#e2e8f0';
          ctx.fillText(
            candle.profitLabel,
            tooltipX + tooltipWidth / 2 - textMetrics.width / 2,
            tooltipY + tooltipHeight / 2 + 4
          );

          const pointerWidth = 12;
          const pointerHeight = 7;
          const pointerBaseX = Math.min(
            Math.max(candle.x, tooltipX + 8),
            tooltipX + tooltipWidth - 8
          );
          ctx.beginPath();
          if (tooltipDirection === -1) {
            ctx.moveTo(pointerBaseX, tooltipY + tooltipHeight);
            ctx.lineTo(
              pointerBaseX - pointerWidth / 2,
              tooltipY + tooltipHeight + pointerHeight
            );
            ctx.lineTo(
              pointerBaseX + pointerWidth / 2,
              tooltipY + tooltipHeight + pointerHeight
            );
          } else {
            ctx.moveTo(pointerBaseX, tooltipY);
            ctx.lineTo(pointerBaseX - pointerWidth / 2, tooltipY - pointerHeight);
            ctx.lineTo(pointerBaseX + pointerWidth / 2, tooltipY - pointerHeight);
          }
          ctx.closePath();
          ctx.fillStyle = `rgba(8, 10, 16, ${0.65 + candle.hoverProgress * 0.3})`;
          ctx.fill();
          ctx.strokeStyle = accentColor;
          ctx.stroke();
        }

        // Update position
        candle.y += candle.vy;

        // Reset candles when they go off screen
        if (candle.isGreen) {
          if (candle.y + finalBodyHeight + finalWickBottom < -50) {
            resetCandle(candle, canvas.height + 100);
          }
        } else {
          if (candle.y - finalWickTop > canvas.height + 50) {
            resetCandle(candle, -100 - finalBodyHeight);
          }
        }
      });

      // Draw particles with connections - more subtle
      particles.forEach((p, i) => {
        // Draw small particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity * 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Draw connections - very subtle
        particles.forEach((p2, j) => {
          if (i < j) {
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              const lineOpacity = 0.04 * (1 - dist / 100);
              ctx.strokeStyle = `rgba(100, 200, 150, ${lineOpacity})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        });

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;
      });

      // Draw floating data values - cleaner with background
      ctx.font = '600 11px "SF Mono", "JetBrains Mono", monospace';
      dataPoints.forEach((dp) => {
        const color = dp.value.startsWith('-') 
          ? '239, 68, 68'
          : dp.value.startsWith('+') 
            ? '34, 197, 94'
            : '96, 165, 250';
        
        // Measure text
        const textMetrics = ctx.measureText(dp.value);
        const textWidth = textMetrics.width;
        const textHeight = 11;
        const padding = 4;
        
        // Draw subtle background pill
        ctx.fillStyle = `rgba(0, 0, 0, ${dp.opacity * 1.5})`;
        ctx.beginPath();
        ctx.roundRect(
          dp.x - padding,
          dp.y - textHeight - padding + 2,
          textWidth + padding * 2,
          textHeight + padding * 2,
          4
        );
        ctx.fill();
        
        // Draw text without heavy glow
        ctx.fillStyle = `rgba(${color}, ${Math.min(dp.opacity * 3, 0.7)})`;
        ctx.fillText(dp.value, dp.x, dp.y);

        // Update position
        dp.y += dp.speed;
        dp.opacity += 0.0005;
        if (dp.opacity > 0.25) dp.opacity = 0.25;

        // Reset when off screen - keep at edges
        const resetX = () => {
          const margin = canvas.width * 0.25;
          return Math.random() > 0.5 
            ? Math.random() * margin 
            : canvas.width - Math.random() * margin;
        };
        
        if (dp.speed < 0 && dp.y < -30) {
          dp.y = canvas.height + 30;
          dp.x = resetX();
          dp.opacity = Math.random() * 0.08 + 0.04;
        } else if (dp.speed > 0 && dp.y > canvas.height + 30) {
          dp.y = -30;
          dp.x = resetX();
          dp.opacity = Math.random() * 0.08 + 0.04;
        }
      });

      // Draw very subtle trend lines - positioned away from center
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.03)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let chartY = canvas.height * 0.75;
      ctx.moveTo(0, chartY);
      for (let x = 0; x < canvas.width; x += 40) {
        chartY += (Math.random() - 0.45) * 20;
        chartY = Math.max(canvas.height * 0.6, Math.min(canvas.height * 0.9, chartY));
        ctx.lineTo(x, chartY);
      }
      ctx.stroke();

      // Second trend line
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.025)';
      ctx.beginPath();
      chartY = canvas.height * 0.2;
      ctx.moveTo(0, chartY);
      for (let x = 0; x < canvas.width; x += 40) {
        chartY += (Math.random() - 0.52) * 15;
        chartY = Math.max(canvas.height * 0.1, Math.min(canvas.height * 0.35, chartY));
        ctx.lineTo(x, chartY);
      }
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    // Initial clear
    ctx.fillStyle = '#0a0c12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ 
        background: 'linear-gradient(180deg, #0a0c12 0%, #0d1117 40%, #111827 100%)',
        cursor: 'default'
      }}
    />
  );
}

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

interface ChartOverlay {
  type: 'line' | 'bar' | 'area';
  x: number;
  y: number;
  width: number;
  height: number;
  data: number[];
  opacity: number;
  baseOpacity: number;
  color: string;
  pulsePhase: number;
  isHovered: boolean;
  hoverProgress: number;
  label: string;
}

interface DataTable {
  x: number;
  y: number;
  rows: Array<{ label: string; value: string; change: number }>;
  opacity: number;
  baseOpacity: number;
  drift: { x: number; y: number };
  isHovered: boolean;
  hoverProgress: number;
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
    const chartOverlays: ChartOverlay[] = [];
    const dataTables: DataTable[] = [];

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

    // Initialize chart overlays - positioned in corners and edges
    const generateChartData = (points: number) => 
      Array.from({ length: points }, () => Math.random());

    const chartConfigs = [
      // Top-left: Line chart (long-term growth)
      { 
        type: 'line' as const, 
        x: 60, 
        y: 140, 
        width: 220, 
        height: 120, 
        color: '74, 222, 128',
        label: 'Portfolio Growth'
      },
      // Bottom-left: Bar chart (volume/allocation)
      { 
        type: 'bar' as const, 
        x: 50, 
        y: canvas.height - 240, 
        width: 180, 
        height: 140, 
        color: '96, 165, 250',
        label: 'Asset Allocation'
      },
      // Top-right: Area chart (cumulative returns)
      { 
        type: 'area' as const, 
        x: canvas.width - 270, 
        y: 160, 
        width: 200, 
        height: 100, 
        color: '168, 85, 247',
        label: 'Cumulative Returns'
      },
      // Bottom-right: Line chart (volatility)
      { 
        type: 'line' as const, 
        x: canvas.width - 240, 
        y: canvas.height - 220, 
        width: 190, 
        height: 110, 
        color: '249, 115, 22',
        label: 'Risk Analysis'
      },
    ];

    chartConfigs.forEach((config) => {
      const baseOpacity = 0.15;
      chartOverlays.push({
        ...config,
        data: generateChartData(config.type === 'bar' ? 8 : 20),
        opacity: baseOpacity,
        baseOpacity,
        pulsePhase: Math.random() * Math.PI * 2,
        isHovered: false,
        hoverProgress: 0,
      });
    });

    // Initialize data tables
    const tableData = [
      // Top-center-right
      {
        x: canvas.width - 420,
        y: 140,
        rows: [
          { label: 'S&P 500', value: '4,783.45', change: 1.2 },
          { label: 'NASDAQ', value: '15,149.68', change: 2.1 },
          { label: 'DOW', value: '37,545.33', change: 0.8 },
          { label: 'VIX', value: '13.42', change: -3.5 },
        ],
      },
      // Middle-right
      {
        x: canvas.width - 380,
        y: canvas.height * 0.5,
        rows: [
          { label: 'BTC', value: '$67,234', change: 5.4 },
          { label: 'ETH', value: '$3,456', change: 3.2 },
          { label: 'Gold', value: '$2,045', change: -0.5 },
        ],
      },
    ];

    tableData.forEach((config) => {
      const baseOpacity = 0.12;
      dataTables.push({
        ...config,
        opacity: baseOpacity,
        baseOpacity,
        drift: { x: 0, y: 0 },
        isHovered: false,
        hoverProgress: 0,
      });
    });

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

      // Draw and update chart overlays
      chartOverlays.forEach((chart) => {
        // Check hover
        chart.isHovered =
          mouseRef.current.x >= chart.x &&
          mouseRef.current.x <= chart.x + chart.width &&
          mouseRef.current.y >= chart.y &&
          mouseRef.current.y <= chart.y + chart.height;

        // Smooth hover transition
        if (chart.isHovered) {
          chart.hoverProgress = Math.min(1, chart.hoverProgress + 0.06);
        } else {
          chart.hoverProgress = Math.max(0, chart.hoverProgress - 0.04);
        }

        // Pulsing animation
        chart.pulsePhase += 0.015;
        const pulse = Math.sin(chart.pulsePhase) * 0.03;
        chart.opacity = chart.baseOpacity + pulse + chart.hoverProgress * 0.15;

        // Draw background panel
        ctx.fillStyle = `rgba(15, 20, 30, ${chart.opacity * 2})`;
        ctx.beginPath();
        ctx.roundRect(chart.x - 12, chart.y - 12, chart.width + 24, chart.height + 24, 12);
        ctx.fill();

        // Draw border
        ctx.strokeStyle = `rgba(${chart.color}, ${chart.opacity * 1.5 + chart.hoverProgress * 0.3})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw label
        if (chart.hoverProgress > 0.1) {
          ctx.font = '600 10px "Inter", sans-serif';
          ctx.fillStyle = `rgba(${chart.color}, ${0.6 + chart.hoverProgress * 0.4})`;
          ctx.fillText(chart.label, chart.x, chart.y - 18);
        }

        // Draw chart based on type
        ctx.save();
        ctx.globalAlpha = chart.opacity + chart.hoverProgress * 0.2;

        if (chart.type === 'line') {
          // Line chart
          ctx.beginPath();
          chart.data.forEach((value, i) => {
            const x = chart.x + (i / (chart.data.length - 1)) * chart.width;
            const y = chart.y + chart.height - value * chart.height * 0.9;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.strokeStyle = `rgba(${chart.color}, ${0.8 + chart.hoverProgress * 0.2})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Draw dots on hover
          if (chart.hoverProgress > 0.3) {
            chart.data.forEach((value, i) => {
              const x = chart.x + (i / (chart.data.length - 1)) * chart.width;
              const y = chart.y + chart.height - value * chart.height * 0.9;
              ctx.beginPath();
              ctx.arc(x, y, 2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${chart.color}, ${chart.hoverProgress})`;
              ctx.fill();
            });
          }
        } else if (chart.type === 'bar') {
          // Bar chart
          const barWidth = chart.width / chart.data.length * 0.7;
          const gap = chart.width / chart.data.length * 0.3;
          chart.data.forEach((value, i) => {
            const x = chart.x + i * (barWidth + gap);
            const barHeight = value * chart.height * 0.9;
            const y = chart.y + chart.height - barHeight;
            
            // Gradient fill
            const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
            gradient.addColorStop(0, `rgba(${chart.color}, ${0.9 + chart.hoverProgress * 0.1})`);
            gradient.addColorStop(1, `rgba(${chart.color}, ${0.4 + chart.hoverProgress * 0.2})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);
          });
        } else if (chart.type === 'area') {
          // Area chart
          ctx.beginPath();
          ctx.moveTo(chart.x, chart.y + chart.height);
          chart.data.forEach((value, i) => {
            const x = chart.x + (i / (chart.data.length - 1)) * chart.width;
            const y = chart.y + chart.height - value * chart.height * 0.9;
            ctx.lineTo(x, y);
          });
          ctx.lineTo(chart.x + chart.width, chart.y + chart.height);
          ctx.closePath();

          // Gradient fill
          const gradient = ctx.createLinearGradient(
            chart.x,
            chart.y,
            chart.x,
            chart.y + chart.height
          );
          gradient.addColorStop(0, `rgba(${chart.color}, ${0.5 + chart.hoverProgress * 0.2})`);
          gradient.addColorStop(1, `rgba(${chart.color}, 0.05)`);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Top line
          ctx.beginPath();
          chart.data.forEach((value, i) => {
            const x = chart.x + (i / (chart.data.length - 1)) * chart.width;
            const y = chart.y + chart.height - value * chart.height * 0.9;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.strokeStyle = `rgba(${chart.color}, ${0.8 + chart.hoverProgress * 0.2})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.restore();
      });

      // Draw and update data tables
      dataTables.forEach((table) => {
        const rowHeight = 22;
        const padding = 12;
        const tableWidth = 180;
        const tableHeight = table.rows.length * rowHeight + padding * 2;

        // Check hover
        table.isHovered =
          mouseRef.current.x >= table.x &&
          mouseRef.current.x <= table.x + tableWidth &&
          mouseRef.current.y >= table.y &&
          mouseRef.current.y <= table.y + tableHeight;

        // Smooth hover transition
        if (table.isHovered) {
          table.hoverProgress = Math.min(1, table.hoverProgress + 0.06);
        } else {
          table.hoverProgress = Math.max(0, table.hoverProgress - 0.04);
        }

        // Subtle drift animation
        table.drift.x += (Math.random() - 0.5) * 0.15;
        table.drift.y += (Math.random() - 0.5) * 0.15;
        table.drift.x *= 0.95;
        table.drift.y *= 0.95;
        table.drift.x = Math.max(-3, Math.min(3, table.drift.x));
        table.drift.y = Math.max(-3, Math.min(3, table.drift.y));

        const displayX = table.x + table.drift.x;
        const displayY = table.y + table.drift.y;

        table.opacity = table.baseOpacity + table.hoverProgress * 0.2;

        // Draw background
        ctx.fillStyle = `rgba(12, 16, 24, ${table.opacity * 2.5})`;
        ctx.beginPath();
        ctx.roundRect(displayX, displayY, tableWidth, tableHeight, 10);
        ctx.fill();

        // Draw border
        ctx.strokeStyle = `rgba(100, 150, 200, ${table.opacity * 1.2 + table.hoverProgress * 0.25})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw rows
        ctx.font = '600 11px "JetBrains Mono", "SF Mono", monospace';
        table.rows.forEach((row, i) => {
          const rowY = displayY + padding + i * rowHeight + 14;
          
          // Label
          ctx.fillStyle = `rgba(200, 210, 230, ${table.opacity * 4})`;
          ctx.fillText(row.label, displayX + padding, rowY);

          // Value
          ctx.textAlign = 'right';
          ctx.fillStyle = `rgba(220, 230, 245, ${table.opacity * 4.5})`;
          ctx.fillText(row.value, displayX + tableWidth - padding - 45, rowY);

          // Change percentage
          const changeColor = row.change >= 0 ? '74, 222, 128' : '248, 113, 113';
          ctx.fillStyle = `rgba(${changeColor}, ${table.opacity * 4 + table.hoverProgress * 0.5})`;
          const changeText = row.change >= 0 ? `+${row.change.toFixed(1)}%` : `${row.change.toFixed(1)}%`;
          ctx.fillText(changeText, displayX + tableWidth - padding, rowY);
          ctx.textAlign = 'left';
        });
      });

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

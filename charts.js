/* =============================================
   charts.js — DS4200 NBA MVP Project
   D3 Visualizations:
   1. Horizontal bar chart (Top 15 Final Score)
   2. Dumbbell chart (Raw vs Adjusted rankings)
   3. Radar chart (Top 5 candidate profiles)
   4. Scatter — loaded via iframe in index.html (scatter_altair.html)
   5. Line chart (Season consistency)
   6. Heatmap (Percentile breakdown)
   ============================================= */

const COLORS = {
  gold: '#F5C518',
  red: '#E03C31',
  blue: '#1A73E8',
  teal: '#2EC4B6',
  orange: '#FF9F43',
  bg: '#0E0F11',
  bg2: '#151618',
  bgCard: '#1C1D20',
  surface: '#222428',
  border: 'rgba(255,255,255,0.08)',
  text: '#F0F0F0',
  muted: '#8A8D93',
  dim: '#5A5D63'
};

const PLAYER_COLORS = {
  'Nikola Jokić': '#F5C518',
  'Shai Gilgeous-Alexander': '#007AC1',
  'Karl-Anthony Towns': '#006BB6',
  'Victor Wembanyama': '#C4CED4',
  'Nikola Vučević': '#CE1141'
};

const FONT_MONO = "'DM Mono', monospace";
const FONT_BODY = "'DM Sans', sans-serif";

// Shared tooltip
const tooltip = d3.select('body').append('div').attr('class', 'chart-tooltip');

function showTooltip(html, event) {
  tooltip.html(html).classed('visible', true);
  moveTooltip(event);
}
function moveTooltip(event) {
  const x = event.clientX, y = event.clientY;
  const tw = 220, th = 120;
  tooltip
    .style('left', (x + 14 > window.innerWidth - tw ? x - tw - 14 : x + 14) + 'px')
    .style('top',  (y + 14 > window.innerHeight - th ? y - th - 14 : y + 14) + 'px');
}
function hideTooltip() { tooltip.classed('visible', false); }

/* =============================================
   VIZ 1: HORIZONTAL BAR CHART (D3)
   Top 15 players by Final Score
   ============================================= */
function drawBar() {
  const el = document.getElementById('bar-chart');
  if (!el) return;

  const margin = { top: 20, right: 80, bottom: 50, left: 220 };
  const W = Math.min(el.offsetWidth || 900, 1000) - margin.left - margin.right;
  const H = TOP15.length * 38;

  const svg = d3.select('#bar-chart').append('svg')
    .attr('viewBox', `0 0 ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`)
    .attr('preserveAspectRatio', 'xMinYMid meet');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const data = [...TOP15].sort((a, b) => a.Final_Score - b.Final_Score);
  const xMax = Math.ceil(data[data.length - 1].Final_Score) + 3;

  const x = d3.scaleLinear().domain([75, xMax]).range([0, W]);
  const y = d3.scaleBand().domain(data.map(d => d.Player)).range([H, 0]).padding(0.28);

  // Grid lines
  g.append('g').attr('class', 'grid')
    .call(d3.axisBottom(x).ticks(6).tickSize(-H).tickFormat(''))
    .attr('transform', `translate(0,${H})`)
    .selectAll('line').style('stroke', COLORS.border).style('stroke-dasharray', '3,4');
  g.select('.grid .domain').remove();

  // Bars
  const bars = g.selectAll('.bar').data(data).enter().append('rect')
    .attr('class', 'bar')
    .attr('x', x(75))
    .attr('y', d => y(d.Player))
    .attr('width', 0)
    .attr('height', y.bandwidth())
    .attr('fill', d => d.Player === 'Nikola Jokić' ? COLORS.gold : COLORS.surface)
    .attr('rx', 2)
    .style('cursor', 'pointer');

  bars.transition().duration(700).delay((d, i) => i * 45)
    .attr('width', d => Math.max(0, x(d.Final_Score) - x(75)));

  // Value labels
  g.selectAll('.bar-label').data(data).enter().append('text')
    .attr('x', d => x(d.Final_Score) + 6)
    .attr('y', d => y(d.Player) + y.bandwidth() / 2 + 4)
    .text(d => d.Final_Score.toFixed(1))
    .style('fill', COLORS.muted)
    .style('font-family', FONT_MONO)
    .style('font-size', '11px')
    .style('opacity', 0)
    .transition().duration(500).delay((d, i) => i * 45 + 400)
    .style('opacity', 1);

  // Player labels
  g.selectAll('.player-label').data(data).enter().append('text')
    .attr('x', -8)
    .attr('y', d => y(d.Player) + y.bandwidth() / 2 + 4)
    .attr('text-anchor', 'end')
    .text(d => d.Player)
    .style('fill', d => d.Player === 'Nikola Jokić' ? COLORS.gold : COLORS.text)
    .style('font-family', FONT_BODY)
    .style('font-size', '13px')
    .style('font-weight', d => d.Player === 'Nikola Jokić' ? '600' : '400');

  // Team labels
  g.selectAll('.team-label').data(data).enter().append('text')
    .attr('x', -8)
    .attr('y', d => y(d.Player) + y.bandwidth() / 2 + 17)
    .attr('text-anchor', 'end')
    .text(d => d.Tm)
    .style('fill', COLORS.dim)
    .style('font-family', FONT_MONO)
    .style('font-size', '9px')
    .style('letter-spacing', '0.1em');

  // X axis
  g.append('g').attr('transform', `translate(0,${H})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d => d.toFixed(0)))
    .selectAll('text').style('fill', COLORS.muted).style('font-family', FONT_MONO).style('font-size', '11px');

  // X axis label
  g.append('text')
    .attr('x', W / 2).attr('y', H + 42)
    .attr('text-anchor', 'middle')
    .style('fill', COLORS.dim)
    .style('font-family', FONT_MONO)
    .style('font-size', '10px')
    .style('text-transform', 'uppercase')
    .style('letter-spacing', '0.12em')
    .text('Final Score (Percentile, SOS & Minutes Adjusted)');

  // #1 badge
  const top = data[data.length - 1];
  g.append('text')
    .attr('x', x(top.Final_Score) + 45)
    .attr('y', y(top.Player) + y.bandwidth() / 2 - 4)
    .text('★ #1')
    .style('fill', COLORS.gold)
    .style('font-family', FONT_MONO)
    .style('font-size', '11px');

  // Hover interactions
  bars.on('mouseover', function(event, d) {
    d3.select(this).transition().duration(100)
      .attr('fill', d.Player === 'Nikola Jokić' ? '#ffd740' : COLORS.gold);
    showTooltip(
      `<div class="tt-name">${d.Player}</div>` +
      `Team: ${d.Tm}<br>` +
      `Games: ${d.GP}<br>` +
      `Composite: ${d.Composite_pctl}<br>` +
      `<strong style="color:${COLORS.gold}">Final Score: ${d.Final_Score}</strong>`,
      event
    );
  })
  .on('mousemove', moveTooltip)
  .on('mouseout', function(event, d) {
    d3.select(this).transition().duration(100)
      .attr('fill', d.Player === 'Nikola Jokić' ? COLORS.gold : COLORS.surface);
    hideTooltip();
  });
}

/* =============================================
   VIZ 2: DUMBBELL CHART (D3)
   Raw Composite vs Final Score
   ============================================= */
function drawDumbbell() {
  const el = document.getElementById('dumbbell-chart');
  if (!el) return;

  const margin = { top: 30, right: 40, bottom: 50, left: 220 };
  const W = Math.min(el.offsetWidth || 900, 900) - margin.left - margin.right;
  const H = TOP15.length * 38;

  const svg = d3.select('#dumbbell-chart').append('svg')
    .attr('viewBox', `0 0 ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`)
    .attr('preserveAspectRatio', 'xMinYMid meet');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const data = [...TOP15].sort((a, b) => a.Final_Score - b.Final_Score);

  const allValues = data.flatMap(d => [d.Composite_pctl, d.Final_Score]);
  const x = d3.scaleLinear()
    .domain([d3.min(allValues) - 3, d3.max(allValues) + 3])
    .range([0, W]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.Player))
    .range([H, 0])
    .padding(0.3);

  // Grid lines
  g.append('g').attr('class', 'grid')
    .call(d3.axisBottom(x).ticks(6).tickSize(-H).tickFormat(''))
    .attr('transform', `translate(0,${H})`)
    .selectAll('line').style('stroke', COLORS.border).style('stroke-dasharray', '3,4');
  g.select('.grid .domain').remove();

  // Connecting lines
  const lines = g.selectAll('.dumbbell-line').data(data).enter().append('line')
    .attr('x1', d => x(d.Composite_pctl))
    .attr('x2', d => x(d.Composite_pctl))
    .attr('y1', d => y(d.Player) + y.bandwidth() / 2)
    .attr('y2', d => y(d.Player) + y.bandwidth() / 2)
    .attr('stroke', COLORS.muted)
    .attr('stroke-width', 2)
    .attr('stroke-opacity', 0.5);

  lines.transition().duration(600).delay((d, i) => i * 40)
    .attr('x2', d => x(d.Final_Score));

  // Raw composite dots (blue)
  g.selectAll('.dot-raw').data(data).enter().append('circle')
    .attr('cx', d => x(d.Composite_pctl))
    .attr('cy', d => y(d.Player) + y.bandwidth() / 2)
    .attr('r', 0)
    .attr('fill', '#457b9d')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1)
    .style('cursor', 'pointer')
    .transition().duration(400).delay((d, i) => i * 40)
    .attr('r', 7);

  // Final score dots (red/gold)
  g.selectAll('.dot-final').data(data).enter().append('circle')
    .attr('cx', d => x(d.Final_Score))
    .attr('cy', d => y(d.Player) + y.bandwidth() / 2)
    .attr('r', 0)
    .attr('fill', d => d.Player === 'Nikola Jokić' ? COLORS.gold : COLORS.red)
    .attr('stroke', '#fff')
    .attr('stroke-width', 1)
    .style('cursor', 'pointer')
    .transition().duration(400).delay((d, i) => i * 40 + 200)
    .attr('r', 7);

  // Delta labels
  g.selectAll('.delta-label').data(data).enter().append('text')
    .attr('x', d => x(Math.max(d.Composite_pctl, d.Final_Score)) + 14)
    .attr('y', d => y(d.Player) + y.bandwidth() / 2 + 4)
    .text(d => {
      const delta = d.Final_Score - d.Composite_pctl;
      return (delta >= 0 ? '+' : '') + delta.toFixed(1);
    })
    .style('fill', d => d.Final_Score >= d.Composite_pctl ? '#4CAF50' : '#EF5350')
    .style('font-family', FONT_MONO)
    .style('font-size', '10px')
    .style('opacity', 0)
    .transition().duration(400).delay((d, i) => i * 40 + 500)
    .style('opacity', 1);

  // Player labels
  g.selectAll('.player-label').data(data).enter().append('text')
    .attr('x', -8)
    .attr('y', d => y(d.Player) + y.bandwidth() / 2 + 4)
    .attr('text-anchor', 'end')
    .text(d => d.Player)
    .style('fill', d => d.Player === 'Nikola Jokić' ? COLORS.gold : COLORS.text)
    .style('font-family', FONT_BODY)
    .style('font-size', '13px')
    .style('font-weight', d => d.Player === 'Nikola Jokić' ? '600' : '400');

  // X axis
  g.append('g').attr('transform', `translate(0,${H})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d => d.toFixed(0)))
    .selectAll('text').style('fill', COLORS.muted).style('font-family', FONT_MONO).style('font-size', '11px');

  // X axis label
  g.append('text')
    .attr('x', W / 2).attr('y', H + 42)
    .attr('text-anchor', 'middle')
    .style('fill', COLORS.dim)
    .style('font-family', FONT_MONO)
    .style('font-size', '10px')
    .style('text-transform', 'uppercase')
    .style('letter-spacing', '0.12em')
    .text('Score');

  // Legend
  const legendX = W - 260, legendY = -18;
  g.append('circle').attr('cx', legendX).attr('cy', legendY).attr('r', 6).attr('fill', '#457b9d');
  g.append('text').attr('x', legendX + 12).attr('y', legendY + 4)
    .text('Raw Composite').style('fill', COLORS.muted).style('font-family', FONT_MONO).style('font-size', '10px');
  g.append('circle').attr('cx', legendX + 140).attr('cy', legendY).attr('r', 6).attr('fill', COLORS.red);
  g.append('text').attr('x', legendX + 152).attr('y', legendY + 4)
    .text('Final Score').style('fill', COLORS.muted).style('font-family', FONT_MONO).style('font-size', '10px');

  // Hover interactions
  g.selectAll('circle').on('mouseover', function(event, d) {
    if (!d || !d.Player) return;
    d3.select(this).transition().duration(100).attr('r', 9);
    showTooltip(
      `<div class="tt-name">${d.Player}</div>` +
      `Team: ${d.Tm}<br>` +
      `<span style="color:#457b9d">Raw Composite: ${d.Composite_pctl}</span><br>` +
      `<span style="color:${COLORS.red}">Final Score: ${d.Final_Score}</span><br>` +
      `Δ: ${(d.Final_Score - d.Composite_pctl) >= 0 ? '+' : ''}${(d.Final_Score - d.Composite_pctl).toFixed(1)}`,
      event
    );
  })
  .on('mousemove', moveTooltip)
  .on('mouseout', function() {
    d3.select(this).transition().duration(100).attr('r', 7);
    hideTooltip();
  });
}

/* =============================================
   VIZ 3: RADAR CHART (D3)
   Top 5 candidate profiles
   ============================================= */
function drawRadar() {
  const el = document.getElementById('radar-chart');
  if (!el) return;

  const size = Math.min((el.offsetWidth || 700), 680);
  const margin = { top: 60, right: 120, bottom: 60, left: 120 };
  const W = size - margin.left - margin.right;
  const H = size - margin.top - margin.bottom;
  const cx = W / 2, cy = H / 2;
  const R = Math.min(cx, cy) - 10;

  const cats = ['PTS_pctl','FG%_pctl','3P%_pctl','AST_pctl','TRB_pctl','STL_pctl','BLK_pctl','GmSc_pctl','TOV_pctl'];
  const labels = ['Points','FG%','3P%','Assists','Rebounds','Steals','Blocks','Game Score','Low TOV'];
  const N = cats.length;
  const angles = cats.map((_, i) => (i * 2 * Math.PI / N) - Math.PI / 2);

  const svg = d3.select('#radar-chart').append('svg')
    .attr('viewBox', `0 0 ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const g = svg.append('g').attr('transform', `translate(${margin.left + cx},${margin.top + cy})`);

  [20, 40, 60, 80, 100].forEach(v => {
    g.append('polygon')
      .attr('points', angles.map(a => [(v/100*R)*Math.cos(a), (v/100*R)*Math.sin(a)].join(',')).join(' '))
      .attr('fill', 'none')
      .attr('stroke', v === 100 ? 'rgba(255,255,255,0.15)' : COLORS.border)
      .attr('stroke-width', v === 100 ? 1.5 : 1);
    if (v % 40 === 0) {
      g.append('text')
        .attr('x', 4).attr('y', -(v/100*R) + 4)
        .text(v)
        .style('fill', COLORS.dim)
        .style('font-family', FONT_MONO)
        .style('font-size', '9px');
    }
  });

  angles.forEach(a => {
    g.append('line').attr('x1',0).attr('y1',0)
      .attr('x2', R*Math.cos(a)).attr('y2', R*Math.sin(a))
      .attr('stroke', COLORS.border).attr('stroke-width', 1);
  });

  angles.forEach((a, i) => {
    const x = (R + 22) * Math.cos(a);
    const y = (R + 22) * Math.sin(a);
    g.append('text')
      .attr('x', x).attr('y', y + 4)
      .attr('text-anchor', Math.cos(a) > 0.1 ? 'start' : Math.cos(a) < -0.1 ? 'end' : 'middle')
      .text(labels[i])
      .style('fill', COLORS.muted)
      .style('font-family', FONT_MONO)
      .style('font-size', '10px')
      .style('letter-spacing', '0.06em');
  });

  const playerColors = [COLORS.gold, '#007AC1', '#1A73E8', '#E0E0E0', '#CE1141'];
  const polygons = [];

  RADAR_DATA.forEach((player, pi) => {
    const pts = cats.map((c, i) => {
      const r = (player[c] / 100) * R;
      return [r * Math.cos(angles[i]), r * Math.sin(angles[i])];
    });
    const poly = g.append('polygon')
      .attr('points', pts.map(p => p.join(',')).join(' '))
      .attr('fill', playerColors[pi] + '22')
      .attr('stroke', playerColors[pi])
      .attr('stroke-width', 2.5)
      .attr('class', `radar-poly radar-poly-${pi}`)
      .attr('data-player', player.Player)
      .style('cursor', 'pointer')
      .style('transition', 'opacity 0.25s');
    polygons.push(poly);
  });

  RADAR_DATA.forEach((player, pi) => {
    const ly = -H/2 + pi * 22 + 10;
    const lx = W/2 + 15;
    g.append('line')
      .attr('x1', lx).attr('y1', ly - 4)
      .attr('x2', lx + 18).attr('y2', ly - 4)
      .attr('stroke', playerColors[pi]).attr('stroke-width', 2.5);
    g.append('text')
      .attr('x', lx + 24).attr('y', ly)
      .text(player.Player.split(' ').slice(-1)[0])
      .style('fill', playerColors[pi])
      .style('font-family', FONT_MONO)
      .style('font-size', '10px');
  });

  document.querySelectorAll('.radar-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.radar-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const target = this.dataset.player;
      polygons.forEach((poly, pi) => {
        const show = target === 'all' || RADAR_DATA[pi].Player === target;
        poly.style('opacity', show ? 1 : 0.06)
          .attr('stroke-width', show && target !== 'all' ? 3.5 : 2.5);
      });
    });
  });
}

/* =============================================
   VIZ 4: SCATTER — loaded via iframe in index.html
   (scatter_altair.html — Vega-Lite)
   No JS needed here — iframe handles it.
   ============================================= */

/* =============================================
   VIZ 5: LINE CHART (D3)
   Season consistency — Game Score rolling avg
   ============================================= */
function drawLine() {
  const el = document.getElementById('line-chart');
  if (!el) return;

  const margin = { top: 20, right: 150, bottom: 60, left: 60 };
  const W = Math.min(el.offsetWidth || 960, 1000) - margin.left - margin.right;
  const H = 360;

  const svg = d3.select('#line-chart').append('svg')
    .attr('viewBox', `0 0 ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`)
    .attr('preserveAspectRatio', 'xMinYMid meet');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const parseDate = d3.timeParse('%Y-%m-%d');
  const fmtDate = d3.timeFormat('%b %d');

  const players = TOP5;
  const playerColors = [COLORS.gold, '#007AC1', '#1A73E8', '#E0E0E0', '#CE1141'];
  const grouped = {};
  players.forEach(p => {
    grouped[p] = LINE_DATA.filter(d => d.Player === p).map(d => ({
      ...d, date: parseDate(d.Date)
    }));
  });

  const allDates = LINE_DATA.map(d => parseDate(d.Date));
  const x = d3.scaleTime().domain(d3.extent(allDates)).range([0, W]);
  const y = d3.scaleLinear().domain([0, d3.max(LINE_DATA, d => d.GmSc) + 5]).range([H, 0]);

  g.append('g').call(d3.axisLeft(y).ticks(6).tickSize(-W).tickFormat(''))
    .selectAll('line').style('stroke', COLORS.border).style('stroke-dasharray', '3,4');
  g.selectAll('.domain').remove();

  g.append('line')
    .attr('x1', 0).attr('y1', y(20)).attr('x2', W).attr('y2', y(20))
    .attr('stroke', 'rgba(255,255,255,0.15)').attr('stroke-dasharray', '6,4').attr('stroke-width', 1);
  g.append('text').attr('x', W + 6).attr('y', y(20) + 4)
    .text('All-Star ~20').style('fill', COLORS.dim).style('font-family', FONT_MONO).style('font-size', '9px');

  const visible = {};
  players.forEach(p => { visible[p] = true; });

  const lineGen = d3.line().x(d => x(d.date)).y(d => y(d.rolling)).curve(d3.curveCatmullRom);
  const lineEls = {};
  const dotEls = {};

  players.forEach((p, pi) => {
    const col = playerColors[pi];
    const dots = g.selectAll(`.raw-${pi}`).data(grouped[p])
      .enter().append('circle')
      .attr('class', `raw-${pi}`)
      .attr('cx', d => x(d.date)).attr('cy', d => y(d.GmSc))
      .attr('r', 2).attr('fill', col).attr('fill-opacity', 0.15);
    dotEls[p] = dots;

    const line = g.append('path')
      .datum(grouped[p])
      .attr('fill', 'none')
      .attr('stroke', col)
      .attr('stroke-width', 2.5)
      .attr('d', lineGen);
    lineEls[p] = line;

    const len = line.node().getTotalLength();
    line.attr('stroke-dasharray', len).attr('stroke-dashoffset', len)
      .transition().duration(1800).delay(pi * 150)
      .attr('stroke-dashoffset', 0);
  });

  g.append('g').attr('transform', `translate(0,${H})`)
    .call(d3.axisBottom(x).ticks(8).tickFormat(fmtDate))
    .selectAll('text').style('fill', COLORS.muted).style('font-family', FONT_MONO).style('font-size', '10px')
    .attr('transform', 'rotate(-25)').attr('text-anchor', 'end');
  g.append('g').call(d3.axisLeft(y).ticks(6))
    .selectAll('text').style('fill', COLORS.muted).style('font-family', FONT_MONO).style('font-size', '11px');

  g.append('text').attr('x', W/2).attr('y', H + 55)
    .attr('text-anchor', 'middle').text('Date')
    .style('fill', COLORS.dim).style('font-family', FONT_MONO).style('font-size', '10px')
    .style('text-transform', 'uppercase').style('letter-spacing', '0.1em');
  g.append('text').attr('transform', 'rotate(-90)').attr('x', -H/2).attr('y', -48)
    .attr('text-anchor', 'middle').text('Game Score (5-Game Rolling Avg)')
    .style('fill', COLORS.dim).style('font-family', FONT_MONO).style('font-size', '10px')
    .style('text-transform', 'uppercase').style('letter-spacing', '0.1em');

  const legend = svg.append('g').attr('transform', `translate(${W + margin.left + 12}, ${margin.top + 20})`);
  players.forEach((p, pi) => {
    const col = playerColors[pi];
    const ly = pi * 26;
    const lg = legend.append('g').attr('transform', `translate(0,${ly})`).style('cursor', 'pointer');
    const lrect = lg.append('rect').attr('x', 0).attr('y', -8).attr('width', 16).attr('height', 4)
      .attr('fill', col).attr('rx', 2);
    const ltxt = lg.append('text').attr('x', 22).attr('y', 0)
      .text(p.split(' ').slice(-1)[0])
      .style('fill', col).style('font-family', FONT_MONO).style('font-size', '10px');

    lg.on('click', function() {
      visible[p] = !visible[p];
      const op = visible[p] ? 1 : 0.1;
      lineEls[p].style('opacity', op);
      dotEls[p].style('opacity', visible[p] ? 0.15 : 0.03);
      lrect.style('opacity', op);
      ltxt.style('opacity', op);
    });
  });

  const hoverLine = g.append('line')
    .attr('y1', 0).attr('y2', H)
    .attr('stroke', 'rgba(255,255,255,0.2)').attr('stroke-width', 1)
    .attr('stroke-dasharray', '4,3').style('opacity', 0);

  const overlay = g.append('rect')
    .attr('width', W).attr('height', H)
    .attr('fill', 'transparent')
    .style('cursor', 'crosshair');

  overlay.on('mousemove', function(event) {
    const [mx] = d3.pointer(event);
    const hovDate = x.invert(mx);
    hoverLine.attr('x1', mx).attr('x2', mx).style('opacity', 1);

    let html = `<div style="font-size:9px;color:${COLORS.dim};margin-bottom:4px">${fmtDate(hovDate)}</div>`;
    players.forEach((p, pi) => {
      if (!visible[p]) return;
      const pts = grouped[p];
      const nearest = pts.reduce((a, b) =>
        Math.abs(b.date - hovDate) < Math.abs(a.date - hovDate) ? b : a
      );
      html += `<span style="color:${playerColors[pi]}">${p.split(' ').slice(-1)[0]}</span>: ${nearest.rolling.toFixed(1)}<br>`;
    });

    const rect = el.getBoundingClientRect();
    showTooltip(html, { clientX: rect.left + mx + margin.left, clientY: event.clientY });
  })
  .on('mouseleave', () => { hoverLine.style('opacity', 0); hideTooltip(); });
}

/* =============================================
   VIZ 6: HEATMAP (D3)
   Percentile breakdown for top 15
   ============================================= */
function drawHeatmap() {
  const el = document.getElementById('heatmap-chart');
  if (!el) return;

  const stats = ['PTS','FG%','3P%','AST','REB','STL','BLK','Low TOV','GmSc'];
  const players = TOP15.map(d => d.Player);

  const margin = { top: 40, right: 20, bottom: 20, left: 210 };
  const cellW = 62, cellH = 36;
  const W = stats.length * cellW;
  const H = players.length * cellH;

  const svg = d3.select('#heatmap-chart').append('svg')
    .attr('viewBox', `0 0 ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`)
    .attr('preserveAspectRatio', 'xMinYMid meet');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const colorScale = d3.scaleSequential()
    .domain([0, 100])
    .interpolator(d3.interpolateRgbBasis(['#7B0000','#C62828','#EF9A9A','#FFF176','#A5D6A7','#2E7D32']));

  const lookup = {};
  HEATMAP_DATA.forEach(d => {
    if (!lookup[d.Player]) lookup[d.Player] = {};
    lookup[d.Player][d.Stat] = d.Value;
  });

  stats.forEach((s, i) => {
    g.append('text').attr('x', i * cellW + cellW / 2).attr('y', -12)
      .attr('text-anchor', 'middle').text(s)
      .style('fill', COLORS.muted).style('font-family', FONT_MONO).style('font-size', '10px')
      .style('text-transform', 'uppercase').style('letter-spacing', '0.06em');
  });

  players.forEach((player, pi) => {
    g.append('text').attr('x', -8).attr('y', pi * cellH + cellH / 2 + 4)
      .attr('text-anchor', 'end').text(player)
      .style('fill', player === 'Nikola Jokić' ? COLORS.gold : COLORS.text)
      .style('font-family', FONT_BODY).style('font-size', '12px')
      .style('font-weight', player === 'Nikola Jokić' ? '600' : '400');

    stats.forEach((stat, si) => {
      const val = lookup[player] && lookup[player][stat];
      if (val === undefined) return;

      g.append('rect')
        .attr('x', si * cellW + 1).attr('y', pi * cellH + 1)
        .attr('width', cellW - 2).attr('height', cellH - 2)
        .attr('fill', colorScale(val)).attr('rx', 2)
        .style('cursor', 'pointer')
        .style('opacity', 0)
        .transition().duration(400).delay(pi * 30 + si * 20)
        .style('opacity', 1);

      g.append('text')
        .attr('x', si * cellW + cellW / 2).attr('y', pi * cellH + cellH / 2 + 4)
        .attr('text-anchor', 'middle').text(Math.round(val))
        .style('fill', val > 55 ? 'rgba(0,0,0,0.7)' : val > 35 ? 'rgba(0,0,0,0.5)' : COLORS.muted)
        .style('font-family', FONT_MONO).style('font-size', '10px').style('font-weight', '500')
        .style('pointer-events', 'none');
    });
  });

  g.selectAll('rect')
    .on('mouseover', function() { d3.select(this).attr('stroke', COLORS.gold).attr('stroke-width', 2); })
    .on('mouseout', function() { d3.select(this).attr('stroke', 'none'); });

  players.forEach((player, pi) => {
    g.append('rect')
      .attr('x', 0).attr('y', pi * cellH)
      .attr('width', W).attr('height', cellH)
      .attr('fill', 'transparent')
      .on('mouseover', function(event) {
        const val_text = stats.map(s => {
          const v = lookup[player] && lookup[player][s];
          return v !== undefined ? `${s}: ${v}` : '';
        }).filter(Boolean).join('  ·  ');
        showTooltip(`<div class="tt-name">${player}</div>${val_text.slice(0, 120)}`, event);
      })
      .on('mousemove', moveTooltip)
      .on('mouseout', hideTooltip);
  });

  const legendW = 200, legendH = 10;
  const lx = W - legendW, ly = H + 10;
  const defs = svg.append('defs');
  const grad = defs.append('linearGradient').attr('id', 'hm-grad');
  [0, 0.25, 0.5, 0.75, 1].forEach(t => {
    grad.append('stop').attr('offset', t).attr('stop-color', colorScale(t * 100));
  });
  g.append('rect').attr('x', lx).attr('y', ly).attr('width', legendW).attr('height', legendH)
    .attr('fill', 'url(#hm-grad)').attr('rx', 2);
  g.append('text').attr('x', lx).attr('y', ly + 22)
    .text('0').style('fill', COLORS.dim).style('font-family', FONT_MONO).style('font-size', '9px');
  g.append('text').attr('x', lx + legendW / 2).attr('y', ly + 22)
    .attr('text-anchor', 'middle').text('Percentile')
    .style('fill', COLORS.dim).style('font-family', FONT_MONO).style('font-size', '9px');
  g.append('text').attr('x', lx + legendW).attr('y', ly + 22)
    .attr('text-anchor', 'end').text('100')
    .style('fill', COLORS.dim).style('font-family', FONT_MONO).style('font-size', '9px');
}

/* =============================================
   INIT — draw all charts
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  drawBar();
  drawDumbbell();
  drawRadar();
  drawLine();
  drawHeatmap();
});

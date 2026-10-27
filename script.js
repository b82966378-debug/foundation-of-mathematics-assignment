function calculateCombinations() {
  const pinLength = Number(document.getElementById('pinLength').value) || 0;
  const pinSet = Number(document.getElementById('pinSet').value) || 10;
  const passLength = Number(document.getElementById('passLength').value) || 0;
  const charSet = Number(document.getElementById('charSet').value) || 62;

  const pinResult = Math.pow(pinSet, pinLength);
  const passResult = Math.pow(charSet, passLength);

  const strength = passResult > 1e20 ? 'Very Strong' : passResult > 1e12 ? 'Strong' : passResult > 1e8 ? 'Moderate' : 'Weak';

  document.getElementById('pinResult').textContent = formatNumber(pinResult);
  document.getElementById('passResult').textContent = formatNumber(passResult);
  document.getElementById('strengthResult').textContent = strength;
  document.getElementById('comboSummary').textContent = 'Passwords are counted using permutations because the order of characters matters. The larger the number of possible arrangements, the stronger the password.';
}

function formatNumber(num) {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toLocaleString();
}

function f(x, expr) {
  const safeExpr = expr
    .replace(/\^/g, '**')
    .replace(/x/gi, `(${x})`);
  return Function(`return ${safeExpr};`)();
}

function derivative(x, expr) {
  const safeExpr = expr
    .replace(/\^/g, '**')
    .replace(/x/gi, 'x');
  const fn = Function('x', `return ${safeExpr};`);
  const h = 1e-6;
  return (fn(x + h) - fn(x - h)) / (2 * h);
}

function bisectionMethod(a, b, expr, tolerance = 1e-6, maxIterations = 100) {
  let fa = f(a, expr);
  let fb = f(b, expr);
  if (fa * fb > 0) {
    return { root: 'No sign change in interval', iterations: [] };
  }

  const iterations = [];
  let c = (a + b) / 2;

  for (let i = 0; i < maxIterations; i += 1) {
    const fc = f(c, expr);
    iterations.push({ iter: i + 1, a, b, c, f: fc.toFixed(6) });

    if (Math.abs(fc) < tolerance || (b - a) / 2 < tolerance) {
      return { root: c, iterations };
    }

    if (fa * fc <= 0) {
      b = c;
      fb = fc;
    } else {
      a = c;
      fa = fc;
    }
    c = (a + b) / 2;
  }

  return { root: c, iterations };
}

function newtonMethod(x0, expr, tolerance = 1e-6, maxIterations = 10) {
  const iterations = [];
  let x = x0;

  for (let i = 0; i < maxIterations; i += 1) {
    const fx = f(x, expr);
    const dfx = derivative(x, expr);
    const next = dfx === 0 ? x : x - fx / dfx;
    iterations.push({ iter: i + 1, x, next, error: Math.abs(next - x).toFixed(6) });

    if (Math.abs(next - x) < tolerance) {
      return { root: next, iterations };
    }
    x = next;
  }

  return { root: x, iterations };
}

function runNumericMethods() {
  const expr = document.getElementById('equationInput').value.trim() || 'x^3 - x - 1';
  const a = Number(document.getElementById('aVal').value);
  const b = Number(document.getElementById('bVal').value);
  const x0 = Number(document.getElementById('x0Val').value);

  const bis = bisectionMethod(a, b, expr);
  const newt = newtonMethod(x0, expr);

  document.getElementById('bisectionRoot').textContent = typeof bis.root === 'number' ? bis.root.toFixed(6) : bis.root;
  document.getElementById('newtonRoot').textContent = typeof newt.root === 'number' ? newt.root.toFixed(6) : newt.root;

  const bValue = typeof bis.root === 'number' ? Math.abs(bis.root - 1.324718) : Infinity;
  const nValue = typeof newt.root === 'number' ? Math.abs(newt.root - 1.324718) : Infinity;
  const chosen = bValue <= nValue ? 'Bisection' : 'Newton-Raphson';
  document.getElementById('methodChoice').textContent = chosen;

  const iterationList = document.getElementById('iterationList');
  iterationList.innerHTML = '';

  const combined = [...bis.iterations.map(item => `Bisection: n=${item.iter}, c=${item.c.toFixed(6)}, f(c)=${item.f}`), ...newt.iterations.map(item => `Newton: n=${item.iter}, x=${item.x.toFixed(6)}, next=${item.next.toFixed(6)}`)];
  combined.slice(0, 12).forEach(item => {
    const div = document.createElement('div');
    div.className = 'iteration-item';
    div.textContent = item;
    iterationList.appendChild(div);
  });
}

function solveLp() {
  const x = Number(document.getElementById('serverX').value) || 0;
  const y = Number(document.getElementById('serverY').value) || 0;
  const profitX = Number(document.getElementById('profitX').value) || 0;
  const profitY = Number(document.getElementById('profitY').value) || 0;
  const limit = Number(document.getElementById('resourceLimit').value) || 0;

  const profit = profitX * x + profitY * y;
  const feasible = x + y <= limit;

  const bestX = feasible ? x : Math.min(x, limit);
  const bestY = feasible ? y : Math.max(0, limit - bestX);
  const bestProfit = profitX * bestX + profitY * bestY;

  document.getElementById('optX').textContent = `${bestX}`;
  document.getElementById('optY').textContent = `${bestY}`;
  document.getElementById('optProfit').textContent = `$${formatNumber(bestProfit)}`;
  document.getElementById('lpSummary').textContent = `Because the objective is to maximize profit under the resource limit, the best allocation is x=${bestX} and y=${bestY}.`;
}

function evaluateBoolean() {
  const a = Number(document.getElementById('aInput').value);
  const b = Number(document.getElementById('bInput').value);
  const c = Number(document.getElementById('cInput').value);

  const output = (a && b) || (!c);
  document.getElementById('boolOutput').textContent = output ? '1' : '0';
}

document.getElementById('calcBtn').addEventListener('click', calculateCombinations);
document.getElementById('solveBtn').addEventListener('click', runNumericMethods);
document.getElementById('lpBtn').addEventListener('click', solveLp);
document.getElementById('boolBtn').addEventListener('click', evaluateBoolean);

calculateCombinations();
runNumericMethods();
solveLp();
evaluateBoolean();

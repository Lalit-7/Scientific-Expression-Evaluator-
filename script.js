/**
 * Scientific Expression Evaluator
 * ================================
 * A browser-based mathematical expression evaluator built from scratch
 * using the Shunting-Yard algorithm (Dijkstra, 1961).
 *
 * Supports: +, -, *, /, ^, sin, cos, tan, log, sqrt, pi, e
 * No external libraries used.
 */

// ============================================================
//  CONFIGURATION
// ============================================================

/** Mathematical constants */
const CONSTANTS = {
  pi: Math.PI,
  e: Math.E,
};

/** Supported functions — each maps to a JS implementation */
const FUNCTIONS = {
  sin: (x) => Math.sin(x),
  cos: (x) => Math.cos(x),
  tan: (x) => {
    // tan is undefined at odd multiples of pi/2
    if (Math.abs(Math.cos(x)) < 1e-10) {
      throw new Error("tan is undefined at this angle");
    }
    return Math.tan(x);
  },
  log: (x) => {
    if (x <= 0) throw new Error("log requires a positive number");
    return Math.log10(x);
  },
  ln: (x) => {
    if (x <= 0) throw new Error("ln requires a positive number");
    return Math.log(x);
  },
  sqrt: (x) => {
    if (x < 0) throw new Error("Cannot take square root of a negative number");
    return Math.sqrt(x);
  },
  abs: (x) => Math.abs(x),
};

/** Operator definitions */
const OPERATORS = {
  "+": {
    prec: 2,
    assoc: "left",
    exec: (a, b) => a + b,
  },
  "-": {
    prec: 2,
    assoc: "left",
    exec: (a, b) => a - b,
  },
  "*": {
    prec: 3,
    assoc: "left",
    exec: (a, b) => a * b,
  },
  "/": {
    prec: 3,
    assoc: "left",
    exec: (a, b) => {
      if (b === 0) throw new Error("Division by zero");
      return a / b;
    },
  },
  "^": {
    prec: 4,
    assoc: "right",
    exec: (a, b) => Math.pow(a, b),
  },
};

// ============================================================
//  TOKENIZER
// ============================================================

/**
 * Breaks an expression string into typed tokens.
 * Handles numbers, operators, functions, constants, parentheses,
 * and unary minus.
 */
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  const s = expr.replace(/\s+/g, "");

  if (s.length === 0) throw new Error("Please enter an expression");

  while (i < s.length) {
    const ch = s[i];

    // --- Numbers (including decimals like .5) ---
    if (/[\d.]/.test(ch)) {
      let num = "";
      let dots = 0;
      while (i < s.length && /[\d.]/.test(s[i])) {
        if (s[i] === ".") dots++;
        if (dots > 1) throw new Error("Invalid number format");
        num += s[i++];
      }
      tokens.push({ type: "NUM", val: parseFloat(num) });
      continue;
    }

    // --- Letters → functions or constants ---
    if (/[a-zA-Z]/.test(ch)) {
      let word = "";
      while (i < s.length && /[a-zA-Z]/.test(s[i])) word += s[i++];
      const w = word.toLowerCase();

      if (FUNCTIONS[w]) {
        tokens.push({ type: "FN", val: w });
      } else if (CONSTANTS[w]) {
        tokens.push({ type: "NUM", val: CONSTANTS[w] });
      } else {
        throw new Error(`Unknown: "${word}"`);
      }
      continue;
    }

    // --- Parentheses ---
    if (ch === "(") {
      tokens.push({ type: "LPAREN" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "RPAREN" });
      i++;
      continue;
    }

    // --- Operators ---
    if (OPERATORS[ch]) {
      // Handle unary minus / plus
      if (
        (ch === "-" || ch === "+") &&
        (tokens.length === 0 ||
          tokens[tokens.length - 1].type === "OP" ||
          tokens[tokens.length - 1].type === "LPAREN")
      ) {
        if (ch === "-") {
          // Insert 0 so unary minus becomes (0 - x)
          tokens.push({ type: "NUM", val: 0 });
          tokens.push({ type: "OP", val: "-" });
        }
        // Unary + is a no-op
        i++;
        continue;
      }
      tokens.push({ type: "OP", val: ch });
      i++;
      continue;
    }

    throw new Error(`Unexpected character: "${ch}"`);
  }

  return tokens;
}

// ============================================================
//  IMPLICIT MULTIPLICATION
// ============================================================

/**
 * Inserts implicit multiplication tokens where needed.
 * Examples: 2pi → 2*pi, 2(3) → 2*(3), (3)(4) → (3)*(4)
 */
function addImplicitMul(tokens) {
  const result = [];

  for (let i = 0; i < tokens.length; i++) {
    const cur = tokens[i];
    result.push(cur);

    if (i + 1 >= tokens.length) continue;
    const next = tokens[i + 1];

    const curIsValue =
      cur.type === "NUM" || cur.type === "RPAREN";
    const nextIsValue =
      next.type === "NUM" || next.type === "FN" || next.type === "LPAREN";

    if (curIsValue && nextIsValue) {
      result.push({ type: "OP", val: "*" });
    }
  }

  return result;
}

// ============================================================
//  SHUNTING-YARD ALGORITHM → Infix to Postfix
// ============================================================

function toPostfix(tokens) {
  const output = [];
  const ops = [];

  for (const tok of tokens) {
    switch (tok.type) {
      case "NUM":
        output.push(tok);
        break;

      case "FN":
        ops.push(tok);
        break;

      case "OP": {
        const o1 = OPERATORS[tok.val];
        while (ops.length > 0) {
          const top = ops[ops.length - 1];
          if (top.type === "LPAREN") break;
          if (top.type === "FN") {
            output.push(ops.pop());
            continue;
          }
          const o2 = OPERATORS[top.val];
          if (
            (o1.assoc === "left" && o1.prec <= o2.prec) ||
            (o1.assoc === "right" && o1.prec < o2.prec)
          ) {
            output.push(ops.pop());
          } else {
            break;
          }
        }
        ops.push(tok);
        break;
      }

      case "LPAREN":
        ops.push(tok);
        break;

      case "RPAREN": {
        let found = false;
        while (ops.length > 0) {
          if (ops[ops.length - 1].type === "LPAREN") {
            found = true;
            ops.pop();
            break;
          }
          output.push(ops.pop());
        }
        if (!found) throw new Error("Mismatched parentheses");
        // Pop function if it's on top
        if (ops.length > 0 && ops[ops.length - 1].type === "FN") {
          output.push(ops.pop());
        }
        break;
      }
    }
  }

  while (ops.length > 0) {
    const top = ops.pop();
    if (top.type === "LPAREN") throw new Error("Mismatched parentheses");
    output.push(top);
  }

  return output;
}

// ============================================================
//  POSTFIX EVALUATOR
// ============================================================

function evalPostfix(postfix) {
  const stack = [];

  for (const tok of postfix) {
    if (tok.type === "NUM") {
      stack.push(tok.val);
    } else if (tok.type === "OP") {
      if (stack.length < 2) throw new Error("Invalid expression");
      const b = stack.pop();
      const a = stack.pop();
      stack.push(OPERATORS[tok.val].exec(a, b));
    } else if (tok.type === "FN") {
      if (stack.length < 1)
        throw new Error(`Function "${tok.val}" needs an argument`);
      const arg = stack.pop();
      stack.push(FUNCTIONS[tok.val](arg));
    }
  }

  if (stack.length !== 1) throw new Error("Invalid expression");
  return stack[0];
}

// ============================================================
//  MAIN EVALUATE FUNCTION
// ============================================================

function evaluate(expression) {
  const tokens = tokenize(expression);
  const withMul = addImplicitMul(tokens);
  const postfix = toPostfix(withMul);
  const result = evalPostfix(postfix);

  if (isNaN(result)) throw new Error("Result is undefined");
  if (!isFinite(result)) throw new Error("Result is infinite");

  return result;
}

/** Format a number nicely for display */
function formatResult(num) {
  if (Number.isInteger(num)) return num.toLocaleString();
  if (Math.abs(num) > 1e12 || (Math.abs(num) < 1e-8 && num !== 0)) {
    return num.toExponential(6);
  }
  return parseFloat(num.toFixed(10)).toString();
}

// ============================================================
//  UI CONTROLLER
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("expression-input");
  const evalBtn = document.getElementById("evaluate-btn");
  const resultSection = document.getElementById("result-section");
  const resultValue = document.getElementById("result-value");
  const errorSection = document.getElementById("error-section");
  const errorMessage = document.getElementById("error-message");
  const historyList = document.getElementById("history-list");
  const clearHistoryBtn = document.getElementById("clear-history");
  const copyBtn = document.getElementById("copy-btn");

  let history = JSON.parse(localStorage.getItem("scicalc-history") || "[]");
  let lastResult = null;

  // --- Render history on load ---
  renderHistory();

  // --- Evaluate on button click or Enter ---
  evalBtn.addEventListener("click", doEvaluate);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doEvaluate();
    }
  });

  // --- Quick insert buttons ---
  document.querySelectorAll("[data-insert]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-insert");
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const current = input.value;
      input.value = current.slice(0, start) + text + current.slice(end);
      input.focus();
      const newPos = start + text.length;
      input.setSelectionRange(newPos, newPos);
    });
  });

  // --- Clear history ---
  clearHistoryBtn.addEventListener("click", () => {
    history = [];
    localStorage.setItem("scicalc-history", "[]");
    renderHistory();
  });

  // --- Copy result ---
  copyBtn.addEventListener("click", () => {
    if (lastResult !== null) {
      navigator.clipboard.writeText(lastResult.toString()).then(() => {
        copyBtn.textContent = "✓";
        copyBtn.classList.add("copied");
        setTimeout(() => {
          copyBtn.textContent = "Copy";
          copyBtn.classList.remove("copied");
        }, 1500);
      });
    }
  });

  // --- Core evaluate function ---
  function doEvaluate() {
    const expr = input.value.trim();
    hideError();

    if (!expr) {
      showError("Please enter an expression");
      return;
    }

    try {
      const result = evaluate(expr);
      const formatted = formatResult(result);
      lastResult = result;

      // Animate result
      resultValue.classList.remove("result-animate");
      void resultValue.offsetWidth; // Force reflow
      resultValue.classList.add("result-animate");
      resultValue.textContent = formatted;
      resultSection.classList.remove("hidden");
      resultSection.classList.add("has-result");

      // Add to history
      history.unshift({ expr, result: formatted });
      if (history.length > 20) history.pop();
      localStorage.setItem("scicalc-history", JSON.stringify(history));
      renderHistory();
    } catch (err) {
      showError(err.message);
      resultSection.classList.remove("has-result");
      resultValue.textContent = "—";
      lastResult = null;
    }
  }

  function showError(msg) {
    errorSection.classList.remove("hidden");
    errorMessage.textContent = msg;
    input.classList.add("input-error");
    setTimeout(() => input.classList.remove("input-error"), 600);
  }

  function hideError() {
    errorSection.classList.add("hidden");
    errorMessage.textContent = "";
  }

  function renderHistory() {
    if (history.length === 0) {
      historyList.innerHTML =
        '<div class="history-empty">No calculations yet</div>';
      return;
    }
    historyList.innerHTML = history
      .map(
        (item) => `
        <div class="history-item" data-expr="${item.expr.replace(/"/g, "&quot;")}">
          <span class="history-expr">${escapeHtml(item.expr)}</span>
          <span class="history-result">= ${escapeHtml(item.result)}</span>
        </div>`
      )
      .join("");

    // Click history item to re-use expression
    historyList.querySelectorAll(".history-item").forEach((el) => {
      el.addEventListener("click", () => {
        input.value = el.getAttribute("data-expr");
        input.focus();
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // Focus input on load
  input.focus();
});

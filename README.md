# Task 1 — Scientific Expression Evaluator

## Overview

![Scientific Calculator Screenshot](screenshot.png)

A browser-based scientific expression evaluator that parses and evaluates mathematical expressions typed by the user. Built entirely with **vanilla HTML, CSS, and JavaScript** — no external libraries or frameworks.

## How to Run

Simply open `index.html` in any modern web browser. No server or build step required.

**🔗 Live Demo:** [https://lalit-7.github.io/Scientific-Expression-Evaluator-/](https://lalit-7.github.io/Scientific-Expression-Evaluator-/)

## Approach

### Expression Parsing — Shunting-Yard Algorithm

The core of this project is a custom-built expression parser using **Dijkstra's Shunting-Yard algorithm**, a well-known method for parsing mathematical expressions while respecting operator precedence and associativity.

The evaluation pipeline consists of three stages:

1. **Tokenizer** — Breaks the input string into typed tokens (numbers, operators, functions, constants, parentheses). Handles edge cases like unary minus (`-5`), implicit multiplication (`2pi`, `2(3+4)`), and decimal numbers.

2. **Shunting-Yard Converter** — Converts the infix token sequence (how we normally write math) into postfix notation (Reverse Polish Notation), properly handling:
   - Operator precedence (`*` and `/` before `+` and `-`)
   - Right-associativity of exponentiation (`2^3^2` = `2^9` = 512)
   - Function calls (`sin`, `cos`, etc.)
   - Parenthesized sub-expressions

3. **Postfix Evaluator** — Evaluates the postfix expression using a stack-based approach, which is straightforward and efficient.

### Why No External Libraries?

I chose to implement the parser from scratch to demonstrate understanding of expression parsing, data structures (stacks, queues), and algorithm design. The Shunting-Yard algorithm is elegant and efficient (O(n) time complexity).

## Supported Operations

| Operation | Syntax | Example |
|-----------|--------|---------|
| Addition | `+` | `2 + 3` → 5 |
| Subtraction | `-` | `10 - 4` → 6 |
| Multiplication | `*` | `3 * 7` → 21 |
| Division | `/` | `15 / 4` → 3.75 |
| Exponentiation | `^` | `2^10` → 1024 |
| Sine | `sin(x)` | `sin(pi/2)` → 1 |
| Cosine | `cos(x)` | `cos(0)` → 1 |
| Tangent | `tan(x)` | `tan(pi/4)` → 1 |
| Logarithm (base 10) | `log(x)` | `log(1000)` → 3 |
| Natural Logarithm | `ln(x)` | `ln(e)` → 1 |
| Square Root | `sqrt(x)` | `sqrt(144)` → 12 |
| Absolute Value | `abs(x)` | `abs(-5)` → 5 |
| Pi constant | `pi` | `2*pi` → 6.2831... |
| Euler's number | `e` | `e^2` → 7.389... |

### Implicit Multiplication

The evaluator supports implicit multiplication:
- `2pi` → `2 * pi`
- `2(3+4)` → `2 * (3+4)`
- `(2+3)(4+5)` → `(2+3) * (4+5)`

## Error Handling

The evaluator provides clear, user-friendly error messages for:
- Empty input
- Mismatched parentheses
- Division by zero
- Invalid function arguments (e.g., `sqrt(-1)`, `log(-5)`)
- Unknown functions or variables
- Malformed expressions
- Unexpected characters

No crashes or unhandled exceptions — every error is caught and displayed gracefully.

## Features

- **Expression history** — Previous calculations are saved (persisted in localStorage)
- **Quick-insert buttons** — Click to insert functions, constants, and operators
- **Keyboard support** — Press Enter to evaluate
- **Copy result** — One-click copy to clipboard
- **Click history items** — Re-use previous expressions
- **Responsive design** — Works on desktop and mobile
- **Clean UI** — Dark glassmorphism theme with smooth animations

## Technology

- **HTML5** — Semantic structure
- **CSS3** — Custom properties, backdrop-filter, grid, flexbox, animations
- **JavaScript (ES6+)** — Modules, template literals, arrow functions
- **No external libraries or frameworks**

## File Structure

```
Task1_ExpressionEvaluator/
├── index.html    — Page structure
├── style.css     — All styling
├── script.js     — Parser, evaluator, and UI logic
└── README.md     — This file
```

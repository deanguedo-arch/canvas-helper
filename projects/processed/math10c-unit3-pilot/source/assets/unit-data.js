/* Reviewed authored contracts; support wording is canonical HTML. */
window.UNIT3_DATA = {
  "version": "math10c-unit3-2.1-repair",
  "title": "Math 10C · Chapter 3: Factors & Products",
  "lessons": [
    {
      "n": "3.1",
      "title": "Factors & multiples of whole numbers",
      "short": "Factors & multiples"
    },
    {
      "n": "3.2",
      "title": "Perfect squares, perfect cubes & roots",
      "short": "Squares, cubes & roots"
    },
    {
      "n": "3.3",
      "title": "Common factors of a polynomial",
      "short": "Common factors"
    },
    {
      "n": "3.4",
      "title": "Model trinomials as binomial products",
      "short": "Modelling binomial products"
    },
    {
      "n": "3.5",
      "title": "Factor x² + bx + c",
      "short": "Factoring x² + bx + c"
    },
    {
      "n": "3.6",
      "title": "Factor ax² + bx + c",
      "short": "Factoring ax² + bx + c"
    },
    {
      "n": "3.7",
      "title": "Multiply polynomials",
      "short": "Multiplying polynomials"
    },
    {
      "n": "3.8",
      "title": "Factor special polynomials",
      "short": "Special polynomials"
    }
  ],
  "questions": [
    {
      "id": "g31",
      "lesson": "3.1",
      "mode": "numeric",
      "prompt": "Find the greatest common factor of 36 and 54.",
      "answer": "18",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "c31",
      "lesson": "3.1",
      "mode": "numeric",
      "prompt": "Two lights flash every 18 seconds and 24 seconds. They flash together now. After how many seconds will they next flash together? Enter seconds as a number.",
      "answer": "72",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "g32",
      "lesson": "3.2",
      "mode": "numeric",
      "prompt": "A cube has volume 343 cm³. What is its edge length? Enter the number of centimetres.",
      "answer": "7",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "c32",
      "lesson": "3.2",
      "mode": "numeric",
      "prompt": "A square has area 324 m². What is its side length? Enter the number of metres.",
      "answer": "18",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "g33",
      "lesson": "3.3",
      "mode": "factor",
      "prompt": "Remove the greatest common factor.",
      "answer": "6*x*(2*x+3)",
      "expression": "12x^2+18x",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "c33",
      "lesson": "3.3",
      "mode": "factor",
      "prompt": "Remove the greatest common factor from every term.",
      "answer": "-4*x*y*(3*x+5*y)",
      "expression": "-12x^2*y-20x*y^2",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "g34",
      "lesson": "3.4",
      "mode": "expand",
      "prompt": "Expand the rectangle’s two side lengths and combine like terms.",
      "answer": "x^2+9*x+20",
      "expression": "(x+4)(x+5)",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "c34",
      "lesson": "3.4",
      "mode": "factor",
      "prompt": "A rectangle has the area below. Factor it to give its side-length expressions.",
      "answer": "(x+2)(x+7)",
      "expression": "x^2+9x+14",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "g35",
      "lesson": "3.5",
      "mode": "split",
      "prompt": "Split the middle term into two terms that will allow grouping. Keep the complete expression.",
      "answer": "x^2+7*x+12",
      "expression": "x^2+7x+12",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "c35",
      "lesson": "3.5",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(x-4)(x+3)",
      "expression": "x^2-x-12",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "g36",
      "lesson": "3.6",
      "mode": "split",
      "prompt": "Split the middle term into two terms suitable for grouping.",
      "answer": "6*x^2+11*x+3",
      "expression": "6x^2+11x+3",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "c36",
      "lesson": "3.6",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(3*x+2)(2*x-3)",
      "expression": "6x^2-5x-6",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "g37",
      "lesson": "3.7",
      "mode": "expand",
      "prompt": "Expand and simplify.",
      "answer": "x^3+2*x^2-5*x-6",
      "expression": "(x+3)(x^2-x-2)",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "c37",
      "lesson": "3.7",
      "mode": "expand",
      "prompt": "Expand and simplify.",
      "answer": "2*x^2+5*x*y-3*y^2",
      "expression": "(2x-y)(x+3y)",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "g38",
      "lesson": "3.8",
      "mode": "factor",
      "prompt": "Factor the perfect square trinomial.",
      "answer": "(3*x-4)^2",
      "expression": "9x^2-24x+16",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "c38",
      "lesson": "3.8",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "2*(x-3)*(x+3)",
      "expression": "2x^2-18",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "e35",
      "lesson": "3.5",
      "mode": "factor",
      "prompt": "A student wrote (x + 2)(x + 6). Repair the factorization of the polynomial below.",
      "answer": "(x+3)(x+4)",
      "expression": "x^2+7x+12",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "e38",
      "lesson": "3.8",
      "mode": "expand",
      "prompt": "A student wrote (x + 5)² = x² + 25. Expand correctly to repair the missing terms.",
      "answer": "x^2+10*x+25",
      "expression": "(x+5)^2",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p31-0",
      "lesson": "3.1",
      "mode": "numeric",
      "prompt": "Find the greatest common factor of 24 and 36. Enter its value.",
      "answer": "12",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p31-1",
      "lesson": "3.1",
      "mode": "numeric",
      "prompt": "Find the least common multiple of 30 and 42. Enter its value.",
      "answer": "210",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p31-2",
      "lesson": "3.1",
      "mode": "prime",
      "prompt": "Write the prime factorization of 36.",
      "answer": "2*2*3*3",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p31-3",
      "lesson": "3.1",
      "mode": "numeric",
      "prompt": "Find the greatest common factor of 45 and 75. Enter its value.",
      "answer": "15",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p31-4",
      "lesson": "3.1",
      "mode": "numeric",
      "prompt": "Find the least common multiple of 48 and 72. Enter its value.",
      "answer": "144",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p31-5",
      "lesson": "3.1",
      "mode": "prime",
      "prompt": "Write the prime factorization of 28.",
      "answer": "2*2*7",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p31-6",
      "lesson": "3.1",
      "mode": "numeric",
      "prompt": "Find the greatest common factor of 32 and 48. Enter its value.",
      "answer": "16",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p31-7",
      "lesson": "3.1",
      "mode": "numeric",
      "prompt": "Find the least common multiple of 18 and 30. Enter its value.",
      "answer": "90",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p31-8",
      "lesson": "3.1",
      "mode": "prime",
      "prompt": "Write the prime factorization of 42.",
      "answer": "2*3*7",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p31-9",
      "lesson": "3.1",
      "mode": "numeric",
      "prompt": "Find the greatest common factor of 60 and 84. Enter its value.",
      "answer": "12",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p31-10",
      "lesson": "3.1",
      "mode": "numeric",
      "prompt": "Find the least common multiple of 40 and 64. Enter its value.",
      "answer": "320",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p31-11",
      "lesson": "3.1",
      "mode": "prime",
      "prompt": "Write the prime factorization of 54.",
      "answer": "2*3*3*3",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p32-0",
      "lesson": "3.2",
      "mode": "numeric",
      "prompt": "Determine the principal square root of 81. Enter its value.",
      "answer": "9",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p32-1",
      "lesson": "3.2",
      "mode": "numeric",
      "prompt": "Determine the cube root of 1728. Enter its value.",
      "answer": "12",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p32-2",
      "lesson": "3.2",
      "mode": "numeric",
      "prompt": "Determine the principal square root of 225. Enter its value.",
      "answer": "15",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p32-3",
      "lesson": "3.2",
      "mode": "numeric",
      "prompt": "Determine the principal square root of 324. Enter its value.",
      "answer": "18",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p32-4",
      "lesson": "3.2",
      "mode": "numeric",
      "prompt": "Determine the cube root of 9261. Enter its value.",
      "answer": "21",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p32-5",
      "lesson": "3.2",
      "mode": "numeric",
      "prompt": "Determine the principal square root of 64. Enter its value.",
      "answer": "8",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p32-6",
      "lesson": "3.2",
      "mode": "numeric",
      "prompt": "Determine the principal square root of 36. Enter its value.",
      "answer": "6",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p32-7",
      "lesson": "3.2",
      "mode": "numeric",
      "prompt": "Determine the cube root of 1331. Enter its value.",
      "answer": "11",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p32-8",
      "lesson": "3.2",
      "mode": "numeric",
      "prompt": "Determine the principal square root of 196. Enter its value.",
      "answer": "14",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p32-9",
      "lesson": "3.2",
      "mode": "numeric",
      "prompt": "Determine the principal square root of 256. Enter its value.",
      "answer": "16",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p32-10",
      "lesson": "3.2",
      "mode": "numeric",
      "prompt": "Determine the cube root of 343. Enter its value.",
      "answer": "7",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p32-11",
      "lesson": "3.2",
      "mode": "numeric",
      "prompt": "Determine the principal square root of 100. Enter its value.",
      "answer": "10",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "p33-0",
      "lesson": "3.3",
      "mode": "factor",
      "prompt": "Remove the greatest common factor.",
      "answer": "2x(3x+5)",
      "expression": "6x^2+10x",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p33-1",
      "lesson": "3.3",
      "mode": "factor",
      "prompt": "Remove the greatest common factor.",
      "answer": "3x(4x+7)",
      "expression": "12x^2+21x",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p33-2",
      "lesson": "3.3",
      "mode": "factor",
      "prompt": "Remove the greatest common factor.",
      "answer": "4x(2x+3)",
      "expression": "8x^2+12x",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p33-3",
      "lesson": "3.3",
      "mode": "factor",
      "prompt": "Remove the greatest common factor.",
      "answer": "5x(3x+4)",
      "expression": "15x^2+20x",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p33-4",
      "lesson": "3.3",
      "mode": "factor",
      "prompt": "Remove the greatest common factor.",
      "answer": "6x(1x+7)",
      "expression": "6x^2+42x",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p33-5",
      "lesson": "3.3",
      "mode": "factor",
      "prompt": "Remove the greatest common factor.",
      "answer": "7x(2x+5)",
      "expression": "14x^2+35x",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p33-6",
      "lesson": "3.3",
      "mode": "factor",
      "prompt": "Remove the greatest common factor.",
      "answer": "3x(5x-2)",
      "expression": "15x^2-6x",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p33-7",
      "lesson": "3.3",
      "mode": "factor",
      "prompt": "Remove the greatest common factor.",
      "answer": "4x(3x-7)",
      "expression": "12x^2-28x",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p33-8",
      "lesson": "3.3",
      "mode": "factor",
      "prompt": "Remove the greatest common factor.",
      "answer": "2x(5x+9)",
      "expression": "10x^2+18x",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p33-9",
      "lesson": "3.3",
      "mode": "factor",
      "prompt": "Remove the greatest common factor.",
      "answer": "5x(4x+3)",
      "expression": "20x^2+15x",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p33-10",
      "lesson": "3.3",
      "mode": "factor",
      "prompt": "Remove the greatest common factor.",
      "answer": "6x(5x+7)",
      "expression": "30x^2+42x",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p33-11",
      "lesson": "3.3",
      "mode": "factor",
      "prompt": "Remove the greatest common factor.",
      "answer": "3x(2x-5)",
      "expression": "6x^2-15x",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p34-0",
      "lesson": "3.4",
      "mode": "expand",
      "prompt": "Expand the side-length expressions to find the rectangle’s area.",
      "answer": "1x^2+5x+4",
      "expression": "(x+1)(x+4)",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p34-1",
      "lesson": "3.4",
      "mode": "expand",
      "prompt": "Expand the side-length expressions to find the rectangle’s area.",
      "answer": "1x^2+8x+12",
      "expression": "(x+2)(x+6)",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p34-2",
      "lesson": "3.4",
      "mode": "expand",
      "prompt": "Expand the side-length expressions to find the rectangle’s area.",
      "answer": "1x^2+10x+21",
      "expression": "(x+3)(x+7)",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p34-3",
      "lesson": "3.4",
      "mode": "expand",
      "prompt": "Expand the side-length expressions to find the rectangle’s area.",
      "answer": "1x^2+10x+24",
      "expression": "(x+4)(x+6)",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p34-4",
      "lesson": "3.4",
      "mode": "expand",
      "prompt": "Expand the side-length expressions to find the rectangle’s area.",
      "answer": "1x^2+10x+16",
      "expression": "(x+2)(x+8)",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p34-5",
      "lesson": "3.4",
      "mode": "expand",
      "prompt": "Expand the side-length expressions to find the rectangle’s area.",
      "answer": "1x^2+11x+30",
      "expression": "(x+5)(x+6)",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p34-6",
      "lesson": "3.4",
      "mode": "expand",
      "prompt": "Expand the side-length expressions to find the rectangle’s area.",
      "answer": "1x^2+11x+24",
      "expression": "(x+3)(x+8)",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p34-7",
      "lesson": "3.4",
      "mode": "expand",
      "prompt": "Expand the side-length expressions to find the rectangle’s area.",
      "answer": "1x^2+8x+7",
      "expression": "(x+1)(x+7)",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p34-8",
      "lesson": "3.4",
      "mode": "expand",
      "prompt": "Expand the side-length expressions to find the rectangle’s area.",
      "answer": "1x^2+12x+32",
      "expression": "(x+4)(x+8)",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p34-9",
      "lesson": "3.4",
      "mode": "expand",
      "prompt": "Expand the side-length expressions to find the rectangle’s area.",
      "answer": "1x^2+11x+18",
      "expression": "(x+2)(x+9)",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p34-10",
      "lesson": "3.4",
      "mode": "expand",
      "prompt": "Expand the side-length expressions to find the rectangle’s area.",
      "answer": "1x^2+12x+35",
      "expression": "(x+5)(x+7)",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p34-11",
      "lesson": "3.4",
      "mode": "expand",
      "prompt": "Expand the side-length expressions to find the rectangle’s area.",
      "answer": "1x^2+13x+42",
      "expression": "(x+6)(x+7)",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p35-0",
      "lesson": "3.5",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(x+2)(x+5)",
      "expression": "1x^2+7x+10",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p35-1",
      "lesson": "3.5",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(x+3)(x+6)",
      "expression": "1x^2+9x+18",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p35-2",
      "lesson": "3.5",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(x-2)(x-7)",
      "expression": "1x^2-9x+14",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p35-3",
      "lesson": "3.5",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(x-3)(x+5)",
      "expression": "1x^2+2x-15",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p35-4",
      "lesson": "3.5",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(x+4)(x-7)",
      "expression": "1x^2-3x-28",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p35-5",
      "lesson": "3.5",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(x-4)(x-6)",
      "expression": "1x^2-10x+24",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p35-6",
      "lesson": "3.5",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "2(x+1)(x+8)",
      "expression": "2x^2+18x+16",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p35-7",
      "lesson": "3.5",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "3(x+2)(x-5)",
      "expression": "3x^2-9x-30",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p35-8",
      "lesson": "3.5",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "4(x+3)(x+7)",
      "expression": "4x^2+40x+84",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p35-9",
      "lesson": "3.5",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "2(x-2)(x-8)",
      "expression": "2x^2-20x+32",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p35-10",
      "lesson": "3.5",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(x+5)(x+5)",
      "expression": "1x^2+10x+25",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p35-11",
      "lesson": "3.5",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(x-6)(x+6)",
      "expression": "1x^2+0x-36",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "p36-0",
      "lesson": "3.6",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(2x+1)(1x+3)",
      "expression": "2x^2+7x+3",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p36-1",
      "lesson": "3.6",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(3x+1)(2x+5)",
      "expression": "6x^2+17x+5",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p36-2",
      "lesson": "3.6",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(2x+3)(3x+4)",
      "expression": "6x^2+17x+12",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p36-3",
      "lesson": "3.6",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(3x-2)(1x+5)",
      "expression": "3x^2+13x-10",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p36-4",
      "lesson": "3.6",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(2x-3)(3x+1)",
      "expression": "6x^2-7x-3",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p36-5",
      "lesson": "3.6",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(4x+1)(1x-3)",
      "expression": "4x^2-11x-3",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p36-6",
      "lesson": "3.6",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(5x+2)(2x+1)",
      "expression": "10x^2+9x+2",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p36-7",
      "lesson": "3.6",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(3x-1)(2x-3)",
      "expression": "6x^2-11x+3",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p36-8",
      "lesson": "3.6",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(2x+5)(1x+4)",
      "expression": "2x^2+13x+20",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p36-9",
      "lesson": "3.6",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(3x+2)(4x-1)",
      "expression": "12x^2+5x-2",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p36-10",
      "lesson": "3.6",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(2x-1)(5x+3)",
      "expression": "10x^2+1x-3",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p36-11",
      "lesson": "3.6",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(4x+3)(3x-1)",
      "expression": "12x^2+5x-3",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p37-0",
      "lesson": "3.7",
      "mode": "expand",
      "prompt": "Expand and simplify.",
      "answer": "x^3+3x^2-1x-6",
      "expression": "(x+2)(x^2+1x-3)",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p37-1",
      "lesson": "3.7",
      "mode": "expand",
      "prompt": "Expand and simplify.",
      "answer": "x^3+3x^2-2x-2",
      "expression": "(x-1)(x^2+4x+2)",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p37-2",
      "lesson": "3.7",
      "mode": "expand",
      "prompt": "Expand and simplify.",
      "answer": "x^3+1x^2-7x-3",
      "expression": "(x+3)(x^2-2x-1)",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p37-3",
      "lesson": "3.7",
      "mode": "expand",
      "prompt": "Expand and simplify.",
      "answer": "x^3+6x^2+13x+20",
      "expression": "(x+4)(x^2+2x+5)",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p37-4",
      "lesson": "3.7",
      "mode": "expand",
      "prompt": "Expand and simplify.",
      "answer": "x^3+1x^2-5x-2",
      "expression": "(x-2)(x^2+3x+1)",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p37-5",
      "lesson": "3.7",
      "mode": "expand",
      "prompt": "Expand and simplify.",
      "answer": "x^3-3x^2+2x+6",
      "expression": "(x+1)(x^2-4x+6)",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p37-6",
      "lesson": "3.7",
      "mode": "expand",
      "prompt": "Expand and simplify.",
      "answer": "x^3+6x^2+3x-10",
      "expression": "(x+5)(x^2+1x-2)",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p37-7",
      "lesson": "3.7",
      "mode": "expand",
      "prompt": "Expand and simplify.",
      "answer": "x^3-1x^2-2x-12",
      "expression": "(x-3)(x^2+2x+4)",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p37-8",
      "lesson": "3.7",
      "mode": "expand",
      "prompt": "Expand and simplify.",
      "answer": "x^3-1x^2-1x+10",
      "expression": "(x+2)(x^2-3x+5)",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p37-9",
      "lesson": "3.7",
      "mode": "expand",
      "prompt": "Expand and simplify.",
      "answer": "x^3+3x^2-10x-24",
      "expression": "(x+4)(x^2-1x-6)",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p37-10",
      "lesson": "3.7",
      "mode": "expand",
      "prompt": "Expand and simplify.",
      "answer": "x^3-1x^2-10x-8",
      "expression": "(x-4)(x^2+3x+2)",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p37-11",
      "lesson": "3.7",
      "mode": "expand",
      "prompt": "Expand and simplify.",
      "answer": "x^3+7x^2+10x-6",
      "expression": "(x+3)(x^2+4x-2)",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p38-0",
      "lesson": "3.8",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(1x-6)(1x+6)",
      "expression": "1x^2-36",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p38-1",
      "lesson": "3.8",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(2x+3)^2",
      "expression": "4x^2+12x+9",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p38-2",
      "lesson": "3.8",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(3x-5)(3x+5)",
      "expression": "9x^2-25",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p38-3",
      "lesson": "3.8",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "2(1x-7)^2",
      "expression": "2x^2-28x+98",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p38-4",
      "lesson": "3.8",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "3(2x-5)(2x+5)",
      "expression": "12x^2-75",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p38-5",
      "lesson": "3.8",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(4x+3)^2",
      "expression": "16x^2+24x+9",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p38-6",
      "lesson": "3.8",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "3(1x-8)(1x+8)",
      "expression": "3x^2-192",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p38-7",
      "lesson": "3.8",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "2(3x+2)^2",
      "expression": "18x^2+24x+8",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p38-8",
      "lesson": "3.8",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(5x-1)(5x+1)",
      "expression": "25x^2-1",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p38-9",
      "lesson": "3.8",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(2x-7)^2",
      "expression": "4x^2-28x+49",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p38-10",
      "lesson": "3.8",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "2(1x-9)(1x+9)",
      "expression": "2x^2-162",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "p38-11",
      "lesson": "3.8",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(3x+4)^2",
      "expression": "9x^2+24x+16",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "i31",
      "lesson": "3.1",
      "mode": "numeric",
      "prompt": "A bell rings every 15 minutes and another every 28 minutes. Both ring now. How many minutes until they next coincide?",
      "answer": "420",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "i32",
      "lesson": "3.2",
      "mode": "numeric",
      "prompt": "A cube has volume 2,197 cm³. What is its edge length, in centimetres? Enter the number.",
      "answer": "13",
      "expression": "",
      "contract": "whole-number-v1"
    },
    {
      "id": "i33",
      "lesson": "3.3",
      "mode": "factor",
      "prompt": "Remove the greatest common factor.",
      "answer": "7*x*y*(2*x+3*y)",
      "expression": "14x^2*y+21x*y^2",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "i34",
      "lesson": "3.4",
      "mode": "expand",
      "prompt": "Write the expanded area expression.",
      "answer": "x^2+13*x+40",
      "expression": "(x+5)(x+8)",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "i35",
      "lesson": "3.5",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(x-5)(x+7)",
      "expression": "x^2+2x-35",
      "contract": "core-quadratic-v1"
    },
    {
      "id": "i36",
      "lesson": "3.6",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "(3*x-4)(2*x+5)",
      "expression": "6x^2+7x-20",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "i37",
      "lesson": "3.7",
      "mode": "expand",
      "prompt": "Expand and simplify.",
      "answer": "2*x^3+x^2-17*x+8",
      "expression": "(2x-1)(x^2+x-8)",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "i38",
      "lesson": "3.8",
      "mode": "factor",
      "prompt": "Factor completely over the integers.",
      "answer": "5*(2*x-3*y)*(2*x+3*y)",
      "expression": "20x^2-45y^2",
      "contract": "unit-polynomial-v1"
    },
    {
      "id": "g351",
      "lesson": "3.5",
      "mode": "pair",
      "prompt": "Complete the pair: the two integers add to 9 and multiply to 20.",
      "answer": "4|5",
      "expression": "x^2+9x+20",
      "contract": "factor-pair-v1",
      "contentVersion": "math10c-unit3-2.1-repair",
      "sum": 9,
      "product": 20
    },
    {
      "id": "g352",
      "lesson": "3.5",
      "mode": "split",
      "prompt": "Write the complete expression with the middle term split for grouping.",
      "answer": "x^2+9x+20",
      "expression": "x^2+9x+20",
      "contract": "core-quadratic-v1",
      "contentVersion": "math10c-unit3-2.1-repair"
    },
    {
      "id": "g353",
      "lesson": "3.5",
      "mode": "pair",
      "prompt": "Choose two integers that support factoring this trinomial.",
      "answer": "3|7",
      "expression": "x^2+10x+21",
      "contract": "factor-pair-v1",
      "contentVersion": "math10c-unit3-2.1-repair",
      "sum": 10,
      "product": 21
    },
    {
      "id": "g354",
      "lesson": "3.5",
      "mode": "factor",
      "prompt": "Now write the complete factorization.",
      "answer": "(x+3)(x+7)",
      "expression": "x^2+10x+21",
      "contract": "core-quadratic-v1",
      "contentVersion": "math10c-unit3-2.1-repair"
    },
    {
      "id": "g321",
      "lesson": "3.2",
      "mode": "bracket",
      "prompt": "Between which consecutive whole numbers does the square root of 58 lie?",
      "answer": "7|8",
      "expression": "√58",
      "contract": "integer-root-bracket-v1",
      "contentVersion": "math10c-unit3-2.1-repair",
      "radicand": 58,
      "rootPower": 2
    },
    {
      "id": "g322",
      "lesson": "3.2",
      "mode": "bracket",
      "prompt": "Between which consecutive whole numbers does the cube root of 100 lie?",
      "answer": "4|5",
      "expression": "∛100",
      "contract": "integer-root-bracket-v1",
      "contentVersion": "math10c-unit3-2.1-repair",
      "radicand": 100,
      "rootPower": 3
    },
    {
      "id": "e301",
      "lesson": "3.3",
      "mode": "choice",
      "prompt": "A student writes 1) −2(x − 4) = −2x − 8; 2) evaluates this at x = 1 as −10. Which numbered equality is the first incorrect one?",
      "answer": "1",
      "expression": "-2(x-4)",
      "contract": "unit-polynomial-v1",
      "contentVersion": "math10c-unit3-2.1-repair",
      "category": "error"
    },
    {
      "id": "e302",
      "lesson": "3.5",
      "mode": "choice",
      "prompt": "A student writes 1) x² + 8x + 15 = x² + 3x + 5x + 15; 2) = x(x + 3) + 5(x + 3); 3) = (x + 5)(x − 3). Which step first changes the value?",
      "answer": "3",
      "expression": "x^2+8x+15",
      "contract": "unit-polynomial-v1",
      "contentVersion": "math10c-unit3-2.1-repair",
      "category": "error"
    },
    {
      "id": "e303",
      "lesson": "3.8",
      "mode": "choice",
      "prompt": "A student writes 1) (x − 4)² = (x − 4)(x − 4); 2) = x² − 16. Which step first changes the value?",
      "answer": "2",
      "expression": "(x-4)^2",
      "contract": "unit-polynomial-v1",
      "contentVersion": "math10c-unit3-2.1-repair",
      "category": "error"
    },
    {
      "id": "e304",
      "lesson": "3.7",
      "mode": "choice",
      "prompt": "A student writes 1) 3x(2x + 5) = 6x² + 15x; 2) = 21x³. Which step is first incorrect?",
      "answer": "2",
      "expression": "3x(2x+5)",
      "contract": "unit-polynomial-v1",
      "contentVersion": "math10c-unit3-2.1-repair",
      "category": "error"
    }
  ],
  "disabledPracticeLessons": [],
  "helpUrl": "",
  "assignmentUrl": "",
  "schemaVersion": 2
};

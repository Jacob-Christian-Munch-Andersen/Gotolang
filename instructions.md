#### Syntax

Look at the [example program](./example.gtl). Indentation is used to mark the bodies of functions, conditionals and loops. Anything indented deeper than the initial line, up to the point where a non-empty line is not indented deeper, is considered part of the body.

#### Integers

32 bit signed integers, declared using the "int" keyword, the declaration may be followed by an expression setting the value of the integer. The integer is initialized to 0 at the beginning of the scope.

#### Arrays

0-indexed arrays of 32 bit signed integers. Arrays are declared using the "arr" keyword. Arrays are sized using the "dim" keyword. An array may be resized arbitrarily. When the size of an array is increased, the new elements are initialized to 0, while the old elements retain their value. When the size of an array is decreased the excess elements are discarded, while the remaining elements retain their value. Arrays are initialized to 0 length at the beginning of the scope.

If an element outside of the array's current bounds is accessed, an error will be thrown.

#### Functions

Functions are declared using the "function" keyword. All parameters must be integers, the return value is always a single integer. If the end of a function is reached, 0 will be returned. Likewise 0 will be returned if retrun is called without a parameter.

Integers, arrays and functions declared inside a function are local to that function, they can be accesed only from within that function, including functions nested inside it at any level.

#### Set commands

The "=" operator is a set operator only when it follows an integer name, or array access on a new line. In all other cases it is a compare operator.

#### Conditionals

If the condition in an if-statement evaluates to 0 it will not be executed, otherwise it will be. An if-statement may be followed by any number of else-if-statements, only the first statement in such a chain with a condition that does not evaluate to 0 will be executed, the following conditions will not be evaluated at all. An if-chain may end in a single else-statement, that will be executed if none of the preceding statements were executed.

#### Loops

If the condition in a while-loop evaluates to 0, the body of the loop will not be executed, otherwise it will be executed, and after execution the condition will be evaluated again, if it is not 0 the body will be executed again, and so forth.

#### Jumps

The goto-statement can be used to jump from any point within a function to any other point witin the same function, it cannot be used to jump between functions.

#### Unary operators

All unary operators operate on the value to the right, they have the highest precedence of all operators.

"-" returns the value negated.

"~" returns the value with all bits inversed.

"!" returns 1 if the value is 0, otherwise it returns 0.

#### Binary operators

"-" returns the first value minus the second.

"+" returns the sum of the values.

"*" returns the product of the numbers.

"/" returns the first value divided by the second, rounded towards negative infinity. If the second value is 0 an error is thrown.

"%" returns the first value modulo the second. The result is never negative. If the second value is 0 an error is thrown.

"&" returns the values bitwise anded together.

"|" returns the values bitwise ored together.

"^" returns the values bitwise xored together.

"&&" retruns 1 if both values are non-0. Returns 0 otherwise.

"||" returns 1 unless both values are 0. Returns 0 otherwise.

"=" returns 1 if the values are equal. Returns 0 otherwise.

"!=" returns 0 if the values are equal. Returns 1 otherwise.

">" returns 1 if the first value is greater than the second. Returns 0 otherwise.

"<" returns 1 if the first value is lesser than the second. Returns 0 otherwise.

">=" returns 1 if the first value is greater than or equal to the second. Returns 0 otherwise.

"<=" returns 1 if the first value is lesser than or equal to the second. Returns 0 otherwise.

"<<" returns the first value multiplied by 2 to the power of the second value.

">>" returns the first value divided by 2 to the power of the second value, rounded towards negative infinity.

">>>" returns the first value modulo 2 to the power of 32 divided by 2 to the power of the second value, rounded towards negative infinity.

#### Standard functions

in() returns the unicode value of the next character in the input. Returns 0 if there is no more input.

out(int value) pushes a charachter to output. Returns 0.

numberout(int value) writes the value to output. Returns 0.

random(int limit) returns a random integer greater than or equal to 0, less than limit.

<?php
function add($a, $b)      { return $a + $b; }
function subtract($a, $b) { return $a - $b; }
function multiply($a, $b) { return $a * $b; }
function divide($a, $b) {
    if ($b == 0) return ['error' => 'Cannot divide by zero!'];
    return $a / $b;
}
function power($a, $b)    { return pow($a, $b); }
function modulo($a, $b)   {
    if ($b == 0) return ['error' => 'Cannot modulo by zero!'];
    return fmod($a, $b);
}
function squareRoot($a) {
    if ($a < 0) return ['error' => 'Cannot take sqrt of negative number!'];
    return sqrt($a);
}
?>

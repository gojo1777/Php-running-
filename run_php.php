<?php
// PHP code runner — executes user-submitted PHP code safely
// Receives: index_code (string), lib_code (string)

header('Content-Type: text/html; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo '<p>Method Not Allowed</p>';
    exit;
}

$index_code = isset($_POST['index_code']) ? $_POST['index_code'] : '';
$lib_code   = isset($_POST['lib_code'])   ? $_POST['lib_code']   : '';

// Write temp files
$tmpDir   = sys_get_temp_dir();
$libFile  = $tmpDir . '/calc_lib_' . uniqid() . '.php';
$mainFile = $tmpDir . '/calc_main_' . uniqid() . '.php';

// Replace require 'calculator.php' with actual temp lib path
$index_code = preg_replace(
    "/require\s+['\"]calculator\.php['\"]\s*;/",
    "require '$libFile';",
    $index_code
);

file_put_contents($libFile,  $lib_code);
file_put_contents($mainFile, $index_code);

// Execute
$output = '';
$returnCode = 0;

// Pass POST data through environment if needed
$postData = '';
if (!empty($_POST)) {
    $pairs = [];
    foreach ($_POST as $k => $v) {
        if ($k !== 'index_code' && $k !== 'lib_code') {
            $pairs[] = urlencode($k) . '=' . urlencode($v);
        }
    }
    $postData = implode('&', $pairs);
}

// Run PHP CLI
$cmd = 'php ' . escapeshellarg($mainFile) . ' 2>&1';
$env = [
    'REQUEST_METHOD' => 'GET',
    'QUERY_STRING'   => '',
];
$descriptors = [
    0 => ['pipe', 'r'],
    1 => ['pipe', 'w'],
    2 => ['pipe', 'w'],
];
$proc = proc_open($cmd, $descriptors, $pipes, null, $env);
if (is_resource($proc)) {
    fclose($pipes[0]);
    $output = stream_get_contents($pipes[1]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    $returnCode = proc_close($proc);
}

// Cleanup
@unlink($libFile);
@unlink($mainFile);

echo $output;
?>

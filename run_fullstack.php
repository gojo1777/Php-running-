<?php
// Full stack runner — executes submitted PHP code
header('Content-Type: text/html; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); echo '<p>Method Not Allowed</p>'; exit;
}

$code = isset($_POST['code']) ? $_POST['code'] : '';

$tmpFile = sys_get_temp_dir() . '/fullstack_' . uniqid() . '.php';
file_put_contents($tmpFile, $code);

$output = '';
$cmd = 'php ' . escapeshellarg($tmpFile) . ' 2>&1';
$env = ['REQUEST_METHOD' => 'GET'];
$descriptors = [0=>['pipe','r'],1=>['pipe','w'],2=>['pipe','w']];
$proc = proc_open($cmd, $descriptors, $pipes, null, $env);
if (is_resource($proc)) {
    fclose($pipes[0]);
    $output = stream_get_contents($pipes[1]);
    fclose($pipes[1]); fclose($pipes[2]);
    proc_close($proc);
}

@unlink($tmpFile);
echo $output;
?>

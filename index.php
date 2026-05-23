<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeLab – Multi Language Tester</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/dracula.min.css">
</head>
<body>

<div class="topbar">
    <div class="logo">&#x7B;&#x7D; CodeLab</div>
    <div class="tagline">PHP &bull; HTML &bull; CSS &bull; Python &bull; SQL</div>
</div>

<div class="lang-tabs">
    <button class="tab active" data-lang="php_html"   onclick="switchTab(this,'php_html')">  PHP + HTML  </button>
    <button class="tab"        data-lang="html_css"   onclick="switchTab(this,'html_css')">  HTML + CSS  </button>
    <button class="tab"        data-lang="python_html" onclick="switchTab(this,'python_html')">Python + HTML</button>
    <button class="tab"        data-lang="sql_html"   onclick="switchTab(this,'sql_html')">  SQL + HTML  </button>
    <button class="tab"        data-lang="fullstack"  onclick="switchTab(this,'fullstack')"> Full Stack  </button>
</div>

<div class="editor-shell">

    <!-- ===== PHP + HTML ===== -->
    <div class="panel active" id="panel-php_html">
        <div class="pane-wrap">
            <div class="pane">
                <div class="pane-header">
                    <span class="lang-badge php">PHP</span> index.php
                    <button class="run-btn" onclick="runPHP()">&#9654; Run</button>
                </div>
                <textarea id="php-code" class="code-area"><?php
require 'calculator.php';

$num1 = isset($_POST['num1']) ? $_POST['num1'] : '';
$num2 = isset($_POST['num2']) ? $_POST['num2'] : '';
$op   = isset($_POST['op'])   ? $_POST['op']   : '+';
$result = null;
$error  = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $num1 !== '' && $num2 !== '') {
    switch ($op) {
        case '+': $result = add($num1, $num2);      break;
        case '-': $result = subtract($num1, $num2); break;
        case '*': $result = multiply($num1, $num2); break;
        case '/': $result = divide($num1, $num2);   break;
    }
    if (is_array($result)) { $error = $result['error']; $result = null; }
}
?>
<!DOCTYPE html>
<html>
<head><title>PHP Calculator</title></head>
<body style="font-family:sans-serif;padding:20px;background:#f0f4ff">
<h2>PHP Calculator</h2>
<form method="POST">
    <input type="number" name="num1" value="<?php echo htmlspecialchars($num1); ?>" placeholder="Number 1" required>
    <select name="op">
        <option value="+" <?php if($op=='+') echo 'selected'; ?>>+</option>
        <option value="-" <?php if($op=='-') echo 'selected'; ?>>-</option>
        <option value="*" <?php if($op=='*') echo 'selected'; ?>>*</option>
        <option value="/" <?php if($op=='/') echo 'selected'; ?>>/</option>
    </select>
    <input type="number" name="num2" value="<?php echo htmlspecialchars($num2); ?>" placeholder="Number 2" required>
    <button type="submit">Calculate</button>
</form>
<?php if ($error): ?>
    <div style="color:red;margin-top:10px"><b>Error:</b> <?php echo $error; ?></div>
<?php elseif ($result !== null): ?>
    <div style="margin-top:15px;padding:10px;background:#d4edda;border-radius:6px">
        <b>Answer:</b> <?php echo $num1 . ' ' . $op . ' ' . $num2 . ' = ' . $result; ?>
    </div>
<?php endif; ?>
</body>
</html>
</textarea>
            </div>
            <div class="pane">
                <div class="pane-header">
                    <span class="lang-badge php">PHP</span> calculator.php
                </div>
                <textarea id="php-lib" class="code-area"><?php
function add($a, $b)      { return $a + $b; }
function subtract($a, $b) { return $a - $b; }
function multiply($a, $b) { return $a * $b; }
function divide($a, $b) {
    if ($b == 0) return ['error' => 'Cannot divide by zero!'];
    return $a / $b;
}
function power($a, $b)    { return pow($a, $b); }
function modulo($a, $b)   { return fmod($a, $b); }
?>
</textarea>
            </div>
        </div>
        <div class="output-wrap">
            <div class="output-header"><span>Output</span><button class="clear-btn" onclick="clearOut('php-out')">Clear</button></div>
            <iframe id="php-out" class="output-frame"></iframe>
        </div>
    </div>

    <!-- ===== HTML + CSS ===== -->
    <div class="panel" id="panel-html_css">
        <div class="pane-wrap">
            <div class="pane">
                <div class="pane-header"><span class="lang-badge html">HTML</span> HTML Code</div>
                <textarea id="html-code" class="code-area"><!DOCTYPE html>
<html>
<head>
  <title>HTML+CSS Demo</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="hero">
    <h1>Hello, CodeLab!</h1>
    <p>Edit the HTML and CSS, then click Run.</p>
    <button class="btn" onclick="this.textContent='Clicked!'">Click Me</button>
  </div>

  <div class="cards">
    <div class="card red">Card One</div>
    <div class="card green">Card Two</div>
    <div class="card blue">Card Three</div>
  </div>
</body>
</html></textarea>
            </div>
            <div class="pane">
                <div class="pane-header">
                    <span class="lang-badge css">CSS</span> CSS Code
                    <button class="run-btn" onclick="runHTMLCSS()">&#9654; Run</button>
                </div>
                <textarea id="css-code" class="code-area">body { font-family: sans-serif; margin: 0; background: #1a1a2e; color: white; }
.hero { text-align: center; padding: 60px 20px; }
.hero h1 { font-size: 2.5rem; margin-bottom: 10px; color: #e94560; }
.hero p  { font-size: 1.1rem; color: #aaa; }
.btn {
  padding: 12px 28px; background: #e94560; color: white;
  border: none; border-radius: 8px; font-size: 1rem; cursor: pointer;
  margin-top: 15px; transition: transform .2s;
}
.btn:hover { transform: scale(1.05); }
.cards { display: flex; gap: 16px; justify-content: center; padding: 20px; flex-wrap: wrap; }
.card {
  width: 150px; height: 100px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-weight: bold; font-size: 1rem;
}
.red   { background: #e94560; }
.green { background: #0f3460; }
.blue  { background: #533483; }</textarea>
            </div>
        </div>
        <div class="output-wrap">
            <div class="output-header"><span>Output</span><button class="clear-btn" onclick="clearOut('htmlcss-out')">Clear</button></div>
            <iframe id="htmlcss-out" class="output-frame"></iframe>
        </div>
    </div>

    <!-- ===== Python + HTML ===== -->
    <div class="panel" id="panel-python_html">
        <div class="pane-wrap">
            <div class="pane">
                <div class="pane-header">
                    <span class="lang-badge python">Python</span> script.py
                    <button class="run-btn" onclick="runPython()">&#9654; Run</button>
                </div>
                <textarea id="python-code" class="code-area"># Python Script - Output rendered as HTML
name = "CodeLab"
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

print(f"<h2>Hello from {name}!</h2>")
print(f"<p>Sum of {numbers} = <b>{sum(numbers)}</b></p>")
print(f"<p>Average = <b>{sum(numbers)/len(numbers)}</b></p>")

# Fibonacci
def fibonacci(n):
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

fibs = fibonacci(10)
print("<h3>Fibonacci (first 10):</h3>")
print("<div style='display:flex;gap:8px;flex-wrap:wrap'>")
for f in fibs:
    print(f"<span style='background:#4CAF50;color:white;padding:6px 12px;border-radius:20px'>{f}</span>")
print("</div>")

# List comprehension squares
squares = [x**2 for x in range(1, 8)]
print("<h3>Squares:</h3><ul>")
for i, s in enumerate(squares, 1):
    print(f"<li>{i}² = {s}</li>")
print("</ul>")</textarea>
            </div>
            <div class="pane">
                <div class="pane-header"><span class="lang-badge python">Python</span> Output Preview</div>
                <div id="python-raw" class="code-area output-preview" style="background:#1e1e2e;color:#cdd6f4;overflow:auto">Run the script to see output here...</div>
            </div>
        </div>
        <div class="output-wrap">
            <div class="output-header"><span>HTML Rendered Output</span><button class="clear-btn" onclick="clearOut('python-out')">Clear</button></div>
            <iframe id="python-out" class="output-frame"></iframe>
        </div>
    </div>

    <!-- ===== SQL + HTML ===== -->
    <div class="panel" id="panel-sql_html">
        <div class="pane-wrap">
            <div class="pane">
                <div class="pane-header">
                    <span class="lang-badge sql">SQL</span> Query
                    <button class="run-btn" onclick="runSQL()">&#9654; Run</button>
                </div>
                <textarea id="sql-code" class="code-area">-- Create and populate a students table
CREATE TABLE IF NOT EXISTS students (
    id      INTEGER PRIMARY KEY,
    name    TEXT NOT NULL,
    subject TEXT NOT NULL,
    marks   INTEGER,
    grade   TEXT
);

INSERT INTO students VALUES (1,'Kamal','Maths',95,'A+');
INSERT INTO students VALUES (2,'Nimal','Science',88,'A');
INSERT INTO students VALUES (3,'Sunil','English',72,'B');
INSERT INTO students VALUES (4,'Amara','Maths',61,'C');
INSERT INTO students VALUES (5,'Saman','Science',45,'F');
INSERT INTO students VALUES (6,'Kumari','English',91,'A+');

-- Query: Top students
SELECT name, subject, marks, grade
FROM students
WHERE marks >= 70
ORDER BY marks DESC;</textarea>
            </div>
            <div class="pane">
                <div class="pane-header"><span class="lang-badge sql">SQL</span> Query Result Table</div>
                <div id="sql-table-out" class="code-area output-preview" style="background:#1e1e2e;overflow:auto">Run a query to see results...</div>
            </div>
        </div>
        <div class="output-wrap">
            <div class="output-header"><span>Rendered Output</span><button class="clear-btn" onclick="clearOut('sql-out')">Clear</button></div>
            <iframe id="sql-out" class="output-frame"></iframe>
        </div>
    </div>

    <!-- ===== Full Stack ===== -->
    <div class="panel" id="panel-fullstack">
        <div class="pane-wrap">
            <div class="pane">
                <div class="pane-header">
                    <span class="lang-badge php">PHP</span> Full Stack App
                    <button class="run-btn" onclick="runFullstack()">&#9654; Run</button>
                </div>
                <textarea id="fullstack-code" class="code-area"><?php
// Full Stack: PHP + HTML + CSS + SQL (SQLite)

$db = new PDO('sqlite::memory:');
$db->exec("CREATE TABLE todos (id INTEGER PRIMARY KEY AUTOINCREMENT, task TEXT, done INTEGER DEFAULT 0, created TEXT)");

// Handle POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['task']) && trim($_POST['task'])) {
        $stmt = $db->prepare("INSERT INTO todos (task, created) VALUES (?, datetime('now'))");
        $stmt->execute([trim($_POST['task'])]);
    }
    if (isset($_POST['delete_id'])) {
        $stmt = $db->prepare("DELETE FROM todos WHERE id = ?");
        $stmt->execute([$_POST['delete_id']]);
    }
    if (isset($_POST['toggle_id'])) {
        $stmt = $db->prepare("UPDATE todos SET done = 1 - done WHERE id = ?");
        $stmt->execute([$_POST['toggle_id']]);
    }
}

// Seed data
$count = $db->query("SELECT COUNT(*) FROM todos")->fetchColumn();
if ($count == 0) {
    $db->exec("INSERT INTO todos (task) VALUES ('Learn PHP'),('Build a website'),('Master SQL')");
}

$todos = $db->query("SELECT * FROM todos ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
$total = count($todos);
$done  = count(array_filter($todos, fn($t) => $t['done']));
?>
<!DOCTYPE html>
<html>
<head>
<title>Todo App</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 40px auto; background: #f5f5f5; }
  h1 { color: #333; } .stats { color: #666; font-size: 0.9rem; margin-bottom: 20px; }
  form.add-form { display: flex; gap: 8px; margin-bottom: 20px; }
  form.add-form input { flex: 1; padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; }
  form.add-form button { padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; }
  .todo-item { background: white; border-radius: 10px; padding: 12px 16px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .todo-item.done span { text-decoration: line-through; color: #aaa; }
  .todo-item span { flex: 1; }
  .btn-done { padding: 5px 10px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.8rem; }
  .btn-del  { padding: 5px 10px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.8rem; }
</style>
</head>
<body>
<h1>Todo App <small style="font-size:0.5em">(PHP+SQLite)</small></h1>
<div class="stats">Total: <?=$total?> &bull; Done: <?=$done?> &bull; Pending: <?=$total-$done?></div>
<form class="add-form" method="POST">
  <input type="text" name="task" placeholder="Add a new task..." required>
  <button type="submit">Add</button>
</form>
<?php foreach ($todos as $t): ?>
<div class="todo-item <?= $t['done'] ? 'done' : '' ?>">
  <span><?= htmlspecialchars($t['task']) ?></span>
  <form method="POST" style="display:inline">
    <input type="hidden" name="toggle_id" value="<?= $t['id'] ?>">
    <button class="btn-done" type="submit"><?= $t['done'] ? 'Undo' : 'Done' ?></button>
  </form>
  <form method="POST" style="display:inline">
    <input type="hidden" name="delete_id" value="<?= $t['id'] ?>">
    <button class="btn-del" type="submit">Delete</button>
  </form>
</div>
<?php endforeach; ?>
</body>
</html>
</textarea>
            </div>
        </div>
        <div class="output-wrap">
            <div class="output-header"><span>Full Stack Output</span><button class="clear-btn" onclick="clearOut('fullstack-out')">Clear</button></div>
            <iframe id="fullstack-out" class="output-frame" style="height:420px"></iframe>
        </div>
    </div>

</div><!-- /editor-shell -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js"></script>
<script src="script.js"></script>
</body>
</html>

/* ============================================================
   CodeLab – Multi Language Runner
   Handles: HTML+CSS, Python (simulated), SQL (sql.js), PHP (server-side)
   ============================================================ */

/* ── Tab switcher ── */
function switchTab(btn, lang) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + lang).classList.add('active');
}

/* ── Write content into an iframe ── */
function writeFrame(id, html) {
    const f = document.getElementById(id);
    const d = f.contentDocument || f.contentWindow.document;
    d.open(); d.write(html); d.close();
}

/* ── Clear output ── */
function clearOut(id) {
    const el = document.getElementById(id);
    if (el.tagName === 'IFRAME') { writeFrame(id, ''); }
    else { el.innerHTML = ''; el.textContent = ''; }
}

/* ============================================================
   HTML + CSS Runner
   ============================================================ */
function runHTMLCSS() {
    const html = document.getElementById('html-code').value;
    const css  = document.getElementById('css-code').value;
    const combined = html.replace('</head>', `<style>${css}</style></head>`);
    writeFrame('htmlcss-out', combined);
}

/* ============================================================
   PHP Runner  (server-side via AJAX)
   ============================================================ */
function runPHP() {
    const indexCode = document.getElementById('php-code').value;
    const libCode   = document.getElementById('php-lib').value;

    const fd = new FormData();
    fd.append('index_code', indexCode);
    fd.append('lib_code',   libCode);

    fetch('run_php.php', { method: 'POST', body: fd })
        .then(r => r.text())
        .then(html => { writeFrame('php-out', html); })
        .catch(() => {
            writeFrame('php-out',
                '<p style="color:red;font-family:sans-serif;padding:20px">' +
                '&#9888; PHP runner not available in preview mode.<br>' +
                'Deploy to Replit to execute real PHP.</p>');
        });
}

/* ============================================================
   Python Runner  (browser simulation)
   Supports: print, variables, lists, dicts, f-strings,
             for loops, while loops, if/elif/else,
             def functions, list comprehension, import math
   ============================================================ */
function runPython() {
    const code = document.getElementById('python-code').value;
    let output = '';

    // ---- stdlib shims ----
    const mathLib = {
        sqrt: Math.sqrt, pow: Math.pow, floor: Math.floor,
        ceil: Math.ceil, abs: Math.abs, pi: Math.PI, e: Math.E,
        log: Math.log, sin: Math.sin, cos: Math.cos, tan: Math.tan,
        factorial: n => { let r=1; for(let i=2;i<=n;i++) r*=i; return r; }
    };

    const globals = {
        math: mathLib,
        __print_lines: [],
        range: (a, b, s) => {
            let arr=[]; s=s||1;
            if (b===undefined) { for(let i=0;i<a;i+=s) arr.push(i); }
            else { for(let i=a;i<b;i+=s) arr.push(i); }
            return arr;
        },
        len: a => Array.isArray(a) ? a.length : String(a).length,
        str: x => String(x),
        int: x => parseInt(x),
        float: x => parseFloat(x),
        list: x => Array.isArray(x) ? x : Array.from(x),
        sum: arr => arr.reduce((a,b)=>a+b,0),
        max: (...args) => Math.max(...(args.length===1&&Array.isArray(args[0])?args[0]:args)),
        min: (...args) => Math.min(...(args.length===1&&Array.isArray(args[0])?args[0]:args)),
        abs: Math.abs,
        round: (n,d) => d ? parseFloat(n.toFixed(d)) : Math.round(n),
        sorted: arr => [...arr].sort((a,b)=>a-b),
        reversed: arr => [...arr].reverse(),
        enumerate: (arr,start) => arr.map((v,i)=>[i+(start||0),v]),
        zip: (...arrs) => arrs[0].map((_,i)=>arrs.map(a=>a[i])),
        isinstance: (v,t) => {
            if(t==='list'||t===Array) return Array.isArray(v);
            if(t==='str'||t===String) return typeof v==='string';
            if(t==='int'||t===Number) return typeof v==='number';
            return false;
        },
        type: v => Array.isArray(v)?'list':typeof v,
    };

    // capture print output
    const printLines = [];
    globals.print = function() {
        const args = Array.from(arguments);
        let sep = ' ', end = '\n';
        const filtered = [];
        args.forEach(a => {
            if (typeof a === 'string' && a.startsWith('sep=')) sep = a.slice(4).replace(/^['"]|['"]$/g,'');
            else if (typeof a === 'string' && a.startsWith('end=')) end = a.slice(4).replace(/^['"]|['"]$/g,'');
            else filtered.push(a);
        });
        const line = filtered.map(a => Array.isArray(a) ? '['+a.join(', ')+']' : String(a)).join(sep);
        printLines.push(line + (end==='\n'?'':end));
        output += line + end;
    };

    // ---- transpile Python → JS ----
    function transpile(src) {
        const lines = src.split('\n');
        let js = '', indent = 0;
        const indentStack = [0];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            const stripped = line.trimStart();
            if (!stripped || stripped.startsWith('#')) continue;

            const curIndent = line.length - stripped.length;
            while (indentStack.length > 1 && curIndent < indentStack[indentStack.length-1]) {
                indentStack.pop(); js += '}\n';
            }

            const pad = '  '.repeat(indentStack.length - 1);

            // f-string → template literal
            let ln = stripped
                .replace(/f"([^"]*)"/g, (_,s) => '`' + s.replace(/\{([^}]+)\}/g,'${$1}') + '`')
                .replace(/f'([^']*)'/g,  (_,s) => '`' + s.replace(/\{([^}]+)\}/g,'${$1}') + '`');

            // print → print(...)  (handle sep= / end= kwargs)
            // already handled via globals

            // import math
            if (/^import\s+math/.test(ln)) { js += pad + 'let math = globals.math;\n'; continue; }
            if (/^from\s+math\s+import/.test(ln)) {
                const names = ln.replace(/^from\s+math\s+import\s+/,'').split(',').map(s=>s.trim());
                names.forEach(n => { js += pad + `let ${n} = globals.math.${n};\n`; });
                continue;
            }

            // def fn(args):
            const defM = ln.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:/);
            if (defM) {
                const params = defM[2].split(',').map(p => p.trim().split('=')[0].trim()).filter(Boolean);
                js += pad + `function ${defM[1]}(${params.join(',')}) {\n`;
                indentStack.push(curIndent + 4);
                continue;
            }

            // class Foo:
            const classM = ln.match(/^class\s+(\w+)/);
            if (classM) { js += pad + `function ${classM[1]}() {\n`; indentStack.push(curIndent+4); continue; }

            // for x in y:
            const forInM = ln.match(/^for\s+(.+)\s+in\s+(.+)\s*:/);
            if (forInM) {
                const vars = forInM[1].trim();
                const iter = forInM[2].trim();
                if (vars.includes(',')) {
                    const parts = vars.split(',').map(v=>v.trim());
                    js += pad + `for (let __i of (${transpileExpr(iter)})) { let [${parts.join(',')}] = __i;\n`;
                } else {
                    js += pad + `for (let ${vars} of (${transpileExpr(iter)})) {\n`;
                }
                indentStack.push(curIndent + 4);
                continue;
            }

            // while cond:
            const whileM = ln.match(/^while\s+(.+)\s*:/);
            if (whileM) { js += pad + `while (${transpileExpr(whileM[1])}) {\n`; indentStack.push(curIndent+4); continue; }

            // if/elif/else
            const ifM = ln.match(/^if\s+(.+)\s*:/);
            if (ifM) { js += pad + `if (${transpileExpr(ifM[1])}) {\n`; indentStack.push(curIndent+4); continue; }
            const elifM = ln.match(/^elif\s+(.+)\s*:/);
            if (elifM) { js += pad.slice(2) + `} else if (${transpileExpr(elifM[1])}) {\n`; indentStack.push(curIndent+4); continue; }
            if (/^else\s*:/.test(ln)) { js += pad.slice(2) + `} else {\n`; indentStack.push(curIndent+4); continue; }

            // return
            const retM = ln.match(/^return\s*(.*)/);
            if (retM) { js += pad + `return ${transpileExpr(retM[1])};\n`; continue; }

            // variable assignment
            const assignM = ln.match(/^([a-zA-Z_]\w*(?:\[.+\])?)\s*=\s*(?!=)(.+)/);
            if (assignM) {
                js += pad + `${assignM[1]} = ${transpileExpr(assignM[2])};\n`;
                continue;
            }

            // augmented assignment
            const augM = ln.match(/^(\w+)\s*(\+=|-=|\*=|\/=)\s*(.+)/);
            if (augM) { js += pad + `${augM[1]} ${augM[2]} ${transpileExpr(augM[3])};\n`; continue; }

            // everything else
            js += pad + transpileExpr(ln) + ';\n';
        }
        while (indentStack.length > 1) { indentStack.pop(); js += '}\n'; }
        return js;
    }

    function transpileExpr(expr) {
        if (!expr) return '';
        return expr
            .replace(/f"([^"]*)"/g, (_,s)=> '`'+s.replace(/\{([^}]+)\}/g,'${$1}')+'`')
            .replace(/f'([^']*)'/g,  (_,s)=> '`'+s.replace(/\{([^}]+)\}/g,'${$1}')+'`')
            .replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null')
            .replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\s+/g, '!')
            .replace(/\*\*/g, '**')
            .replace(/\bprint\s*\(/g, 'globals.print(')
            .replace(/\brange\s*\(/g, 'globals.range(')
            .replace(/\blen\s*\(/g, 'globals.len(')
            .replace(/\bstr\s*\(/g, 'globals.str(')
            .replace(/\bint\s*\(/g, 'globals.int(')
            .replace(/\bfloat\s*\(/g, 'globals.float(')
            .replace(/\bsum\s*\(/g, 'globals.sum(')
            .replace(/\bmax\s*\(/g, 'globals.max(')
            .replace(/\bmin\s*\(/g, 'globals.min(')
            .replace(/\babs\s*\(/g, 'globals.abs(')
            .replace(/\bround\s*\(/g, 'globals.round(')
            .replace(/\bsorted\s*\(/g, 'globals.sorted(')
            .replace(/\breversed\s*\(/g, 'globals.reversed(')
            .replace(/\benumerate\s*\(/g, 'globals.enumerate(')
            .replace(/\bzip\s*\(/g, 'globals.zip(')
            .replace(/\blist\s*\(/g, 'globals.list(')
            .replace(/(\w+)\.append\s*\(/g, '$1.push(')
            .replace(/(\w+)\.extend\s*\(/g, '$1.push(...')
            .replace(/(\w+)\.split\s*\(/g, '$1.split(')
            .replace(/(\w+)\.strip\s*\(\)/g, '$1.trim()')
            .replace(/(\w+)\.lower\s*\(\)/g, '$1.toLowerCase()')
            .replace(/(\w+)\.upper\s*\(\)/g, '$1.toUpperCase()')
            .replace(/(\w+)\.join\s*\(/g, '$1.join(')
            .replace(/(\w+)\.items\s*\(\)/g, 'Object.entries($1)')
            .replace(/(\w+)\.keys\s*\(\)/g, 'Object.keys($1)')
            .replace(/(\w+)\.values\s*\(\)/g, 'Object.values($1)')
            ;
    }

    try {
        const jsCode = transpile(code);
        const fn = new Function('globals', jsCode);
        fn(globals);

        // render
        const rawOut = document.getElementById('python-raw');
        rawOut.textContent = output || '(no output)';

        const isHTML = output.trim().startsWith('<');
        const frame = document.getElementById('python-out');
        if (isHTML) {
            writeFrame('python-out', `<body style="font-family:sans-serif;padding:20px">${output}</body>`);
        } else {
            writeFrame('python-out',
                `<body style="font-family:'Consolas',monospace;background:#1e1e2e;color:#cdd6f4;padding:20px;white-space:pre">${escapeHtml(output)}</body>`);
        }
    } catch(e) {
        document.getElementById('python-raw').textContent = 'Error: ' + e.message;
        writeFrame('python-out',
            `<body style="font-family:sans-serif;padding:20px;color:red"><b>Python Error:</b> ${escapeHtml(e.message)}</body>`);
    }
}

/* ============================================================
   SQL Runner  (sql.js in-browser SQLite)
   ============================================================ */
let sqlDB = null;

async function initSQL() {
    if (sqlDB) return;
    try {
        const SQL = await initSqlJs({
            locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}`
        });
        sqlDB = new SQL.Database();
    } catch(e) { console.error('sql.js load failed', e); }
}

initSQL();

function runSQL() {
    const code = document.getElementById('sql-code').value;

    if (!sqlDB) {
        document.getElementById('sql-table-out').innerHTML =
            '<span style="color:#f85149">SQL engine still loading, please try again...</span>';
        return;
    }

    // fresh DB for each run
    sqlDB = new (sqlDB.constructor)();

    const tableOut = document.getElementById('sql-table-out');
    let tableHTML = '';
    let iframeHTML = `<html><head><style>
        body{font-family:'Segoe UI',sans-serif;padding:20px;background:#f8f9fa}
        h2{color:#333;margin-bottom:16px}
        table{border-collapse:collapse;width:100%;font-size:14px}
        th{background:#4a90d9;color:white;padding:10px 14px;text-align:left}
        td{padding:9px 14px;border-bottom:1px solid #dee2e6}
        tr:nth-child(even) td{background:#f1f4f8}
        tr:hover td{background:#e8f0fe}
        .rowcount{color:#888;font-size:12px;margin-top:8px}
    </style></head><body>`;

    try {
        const stmts = code.split(';').map(s => s.trim()).filter(Boolean);
        stmts.forEach(stmt => {
            const results = sqlDB.exec(stmt);
            if (results.length > 0) {
                results.forEach(r => {
                    // build table
                    let tbl = '<table class="sql-result-table"><thead><tr>';
                    r.columns.forEach(c => { tbl += `<th>${c}</th>`; });
                    tbl += '</tr></thead><tbody>';
                    r.values.forEach(row => {
                        tbl += '<tr>';
                        row.forEach(v => { tbl += `<td>${v ?? '<i style="color:#8b949e">NULL</i>'}</td>`; });
                        tbl += '</tr>';
                    });
                    tbl += `</tbody></table><div class="sql-row-count">${r.values.length} row(s) returned</div>`;
                    tableHTML += tbl;

                    // iframe version
                    iframeHTML += '<h2>Query Result</h2><table><thead><tr>';
                    r.columns.forEach(c => { iframeHTML += `<th>${c}</th>`; });
                    iframeHTML += '</tr></thead><tbody>';
                    r.values.forEach(row => {
                        iframeHTML += '<tr>';
                        row.forEach(v => { iframeHTML += `<td>${v ?? 'NULL'}</td>`; });
                        iframeHTML += '</tr>';
                    });
                    iframeHTML += `</tbody></table><p class="rowcount">${r.values.length} row(s)</p>`;
                });
            } else {
                const sType = stmt.trim().split(' ')[0].toUpperCase();
                const msg = `<div style="color:#238636;padding:6px 0">&#10003; ${sType} executed successfully</div>`;
                tableHTML += msg;
                iframeHTML += `<p style="color:green">&#10003; ${sType} executed successfully</p>`;
            }
        });

        tableOut.innerHTML = tableHTML || '<span style="color:#8b949e">No output</span>';
        iframeHTML += '</body></html>';
        writeFrame('sql-out', iframeHTML);

    } catch(e) {
        tableOut.innerHTML = `<div class="sql-error">&#9888; SQL Error: ${escapeHtml(e.message)}</div>`;
        writeFrame('sql-out',
            `<body style="font-family:sans-serif;padding:20px;color:red"><b>SQL Error:</b> ${escapeHtml(e.message)}</body>`);
    }
}

/* ============================================================
   Full Stack Runner  (server-side PHP needed)
   Shows a static demo if no server
   ============================================================ */
function runFullstack() {
    const code = document.getElementById('fullstack-code').value;
    const fd = new FormData();
    fd.append('code', code);

    fetch('run_fullstack.php', { method: 'POST', body: fd })
        .then(r => r.text())
        .then(html => writeFrame('fullstack-out', html))
        .catch(() => {
            // show static demo
            writeFrame('fullstack-out', buildTodoDemoHTML());
        });
}

function buildTodoDemoHTML() {
    return `<!DOCTYPE html><html><head><style>
        body{font-family:'Segoe UI',sans-serif;max-width:480px;margin:30px auto;background:#f5f5f5;padding:0 16px}
        h1{color:#333;font-size:1.3rem}
        .stats{color:#888;font-size:0.85rem;margin:6px 0 16px}
        .add-row{display:flex;gap:8px;margin-bottom:18px}
        input{flex:1;padding:9px 12px;border:2px solid #ddd;border-radius:8px;font-size:0.95rem}
        .add-btn{padding:9px 16px;background:#4CAF50;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.9rem}
        .item{background:white;border-radius:8px;padding:11px 14px;margin-bottom:7px;display:flex;align-items:center;gap:10px;box-shadow:0 1px 3px rgba(0,0,0,0.08)}
        .item span{flex:1;font-size:0.95rem}
        .item.done span{text-decoration:line-through;color:#aaa}
        .btn-d{padding:4px 10px;background:#2196F3;color:white;border:none;border-radius:5px;cursor:pointer;font-size:0.8rem}
        .btn-x{padding:4px 10px;background:#f44336;color:white;border:none;border-radius:5px;cursor:pointer;font-size:0.8rem}
        .note{background:#fff3cd;padding:10px 14px;border-radius:8px;font-size:0.8rem;color:#856404;margin-top:18px}
    </style></head><body>
    <h1>Todo App <small style="font-size:0.55em;color:#888">(PHP+SQLite)</small></h1>
    <div class="stats" id="stats">Total: 3 &bull; Done: 1 &bull; Pending: 2</div>
    <div class="add-row">
        <input id="newtask" placeholder="Add a new task...">
        <button class="add-btn" onclick="addTask()">Add</button>
    </div>
    <div id="list">
        <div class="item done" id="t1"><span>Learn PHP</span><button class="btn-d" onclick="toggle('t1')">Undo</button><button class="btn-x" onclick="del('t1')">Delete</button></div>
        <div class="item" id="t2"><span>Build a website</span><button class="btn-d" onclick="toggle('t2')">Done</button><button class="btn-x" onclick="del('t2')">Delete</button></div>
        <div class="item" id="t3"><span>Master SQL</span><button class="btn-d" onclick="toggle('t3')">Done</button><button class="btn-x" onclick="del('t3')">Delete</button></div>
    </div>
    <div class="note">&#9432; Static preview — deploy to Replit for full PHP+SQLite functionality.</div>
    <script>
    let ctr=4;
    function updateStats(){
        const items=document.querySelectorAll('.item');
        const done=document.querySelectorAll('.item.done');
        document.getElementById('stats').innerHTML='Total: '+items.length+' &bull; Done: '+done.length+' &bull; Pending: '+(items.length-done.length);
    }
    function toggle(id){
        const el=document.getElementById(id);
        el.classList.toggle('done');
        const btn=el.querySelector('.btn-d');
        btn.textContent=el.classList.contains('done')?'Undo':'Done';
        updateStats();
    }
    function del(id){ document.getElementById(id).remove(); updateStats(); }
    function addTask(){
        const val=document.getElementById('newtask').value.trim();
        if(!val) return;
        const id='t'+ctr++;
        const d=document.createElement('div');
        d.className='item'; d.id=id;
        d.innerHTML='<span>'+val+'</span><button class="btn-d" onclick="toggle(\''+id+'\')">Done</button><button class="btn-x" onclick="del(\''+id+'\')">Delete</button>';
        document.getElementById('list').prepend(d);
        document.getElementById('newtask').value='';
        updateStats();
    }
    document.getElementById('newtask').addEventListener('keydown',e=>{if(e.key==='Enter')addTask();});
    <\/script></body></html>`;
}

/* ============================================================
   PHP Runner backend files
   ============================================================ */

/* ── Utils ── */
function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── Auto-run HTML+CSS on load ── */
window.addEventListener('load', () => {
    runHTMLCSS();
});

/* ── Keyboard shortcut: Ctrl+Enter to run ── */
document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const active = document.querySelector('.panel.active');
        if (!active) return;
        const btn = active.querySelector('.run-btn');
        if (btn) btn.click();
    }
});

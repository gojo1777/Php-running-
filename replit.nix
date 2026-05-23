{ pkgs }: {
  deps = [
    pkgs.php82
    pkgs.php82Extensions.pdo
    pkgs.php82Extensions.pdo_sqlite
    pkgs.php82Extensions.sqlite3
  ];
}

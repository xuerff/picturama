-- Up

ALTER TABLE 'photos' ADD 'master_width' integer;
ALTER TABLE 'photos' ADD 'master_height' integer;

-- Down

-- sqlite doesn't support `ALTER TABLE ... DROP ...` (see: https://www.sqlite.org/lang_altertable.html)

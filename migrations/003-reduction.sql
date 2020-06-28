-- Up

-- Changes on table photos:
--   - Remove column "orientation"
--   - Remove meta data columns "camera", "exposure_time", "iso", "focal_length", "aperture"

PRAGMA foreign_keys=OFF;

DROP INDEX photos_master_dir_index;
DROP INDEX photos_date_section_index;
ALTER TABLE photos RENAME TO photos_old;
CREATE TABLE "photos" (
    "id"              integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "master_dir"      text NOT NULL,
    "master_filename" text NOT NULL,
    "master_width"    integer NOT NULL,
    "master_height"   integer NOT NULL,
    "master_is_raw"   boolean NOT NULL DEFAULT '0',
    "edited_width"    integer NOT NULL,
    "edited_height"   integer NOT NULL,
    "date_section"    text NOT NULL,
    "created_at"      datetime NOT NULL,
    "updated_at"      datetime NOT NULL,
    "imported_at"     datetime NOT NULL,
    "flag"            boolean NOT NULL DEFAULT '0',
    "trashed"         boolean NOT NULL DEFAULT '0'
);
INSERT INTO photos (id, master_dir, master_filename, master_width, master_height, master_is_raw, edited_width, edited_height, date_section, created_at, updated_at, imported_at, flag, trashed)
    SELECT          id, master_dir, master_filename, master_width, master_height, master_is_raw, master_width, master_height, date_section, created_at, updated_at, imported_at, flag, trashed
    FROM photos_old;
DROP TABLE photos_old;
CREATE INDEX photos_master_dir_index ON photos(master_dir);
CREATE INDEX photos_date_section_index ON photos(date_section);

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- Down

PRAGMA foreign_keys=OFF;

DROP INDEX photos_master_dir_index;
DROP INDEX photos_date_section_index;
ALTER TABLE photos RENAME TO photos_old;
CREATE TABLE "photos" (
    "id"              integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "master_dir"      text NOT NULL,
    "master_filename" text NOT NULL,
    "master_width"    integer NOT NULL,
    "master_height"   integer NOT NULL,
    "master_is_raw"   boolean NOT NULL DEFAULT '0',
    "edited_width"    integer NOT NULL,
    "edited_height"   integer NOT NULL,
    "date_section"    text NOT NULL,
    "created_at"      datetime NOT NULL,
    "updated_at"      datetime NOT NULL,
    "imported_at"     datetime NOT NULL,
    "orientation"     integer NOT NULL,
    "camera"          text,
    "exposure_time"   float,
    "iso"             integer,
    "focal_length"    integer,
    "aperture"        float,
    "flag"            boolean NOT NULL DEFAULT '0',
    "trashed"         boolean NOT NULL DEFAULT '0'
);
INSERT INTO photos (id, master_dir, master_filename, master_width, master_height, master_is_raw, edited_width, edited_height, date_section, created_at, updated_at, imported_at, orientation, flag, trashed)
    SELECT          id, master_dir, master_filename, master_width, master_height, master_is_raw, master_width, master_height, date_section, created_at, updated_at, imported_at,           1, flag, trashed
    FROM photos_old;
DROP TABLE photos_old;
CREATE INDEX photos_master_dir_index ON photos(master_dir);
CREATE INDEX photos_date_section_index ON photos(date_section);

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

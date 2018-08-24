-- Up

-- Changes on table photos:
--   - Using text instead of varchar
--   - Added 'NOT NULL'
--   - Added columns 'master_width' and 'master_height'
--   - Dropped column 'thumb_250'
--   - Renamed column 'thumb' to 'non_raw' (since it holds the path to a full-size image)
-- We have to create a new table since sqlite doesn't support 'ALTER TABLE ... DROP ...'
-- See: https://www.sqlite.org/lang_altertable.html
PRAGMA foreign_keys=OFF;
CREATE TABLE photos_new (
    `id` text NOT NULL,
    `title` text NOT NULL,
    `master` text NOT NULL,
    `master_width` integer,
    `master_height` integer,
    `non_raw` text,
    `extension` text NOT NULL,
    `flag` boolean default '0' NOT NULL,
    `created_at` datetime,
    `updated_at` datetime,
    `orientation` integer NOT NULL,
    `camera` text,
    `exposure_time` float,
    `iso` integer,
    `focal_length` integer,
    `aperture` float,
    `date` date,
    `trashed` boolean default '0' NOT NULL,
    primary key (`id`)
);
INSERT INTO photos_new (id, title, master, non_raw, extension, flag, created_at, updated_at, orientation, exposure_time, iso, focal_length, aperture, date, trashed)
    SELECT id, title, master, thumb, extension, case when flag is null then 0 else flag end, created_at, updated_at, orientation, exposure_time, iso, focal_length, aperture, date, trashed
    FROM photos;
DROP TABLE photos;
ALTER TABLE photos_new RENAME TO photos;
CREATE UNIQUE INDEX `photos_id_unique` on photos (`id`);
CREATE INDEX `photos_date` on photos (`date`);
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;


-- Down

PRAGMA foreign_keys=OFF;
CREATE TABLE photos_new (
    `id` varchar(10),
    `title` varchar(255),
    `master` varchar(255),
    `thumb` varchar(255),
    `thumb_250` varchar(255),
    `extension` varchar(10),
    `flag` boolean default '0',
    `created_at` datetime,
    `updated_at` datetime,
    `orientation` integer,
    `exposure_time` float,
    `iso` integer,
    `focal_length` integer,
    `aperture` float,
    `date` date,
    `trashed` boolean default '0',
    primary key (`id`)
);
INSERT INTO photos_new (id, title, master, thumb, extension, flag, created_at, updated_at, orientation, exposure_time, iso, focal_length, aperture, date, trashed)
    SELECT id, title, master, non_raw, extension, flag, created_at, updated_at, orientation, exposure_time, iso, focal_length, aperture, date, trashed
    FROM photos;
DROP TABLE photos;
ALTER TABLE photos_new RENAME TO photos;
CREATE UNIQUE INDEX `photos_id_unique` on photos (`id`);
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- Up

CREATE TABLE "photos" (
    "id"            integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title"         text NOT NULL,
    "master"        text NOT NULL,
    "master_width"  integer,
    "master_height" integer,
    "master_is_raw" boolean NOT NULL DEFAULT '0',
    "extension"     text NOT NULL,
    "flag"          boolean NOT NULL DEFAULT '0',
    "created_at"    datetime,
    "updated_at"    datetime,
    "orientation"   integer NOT NULL,
    "camera"        text,
    "exposure_time" float,
    "iso"           integer,
    "focal_length"  integer,
    "aperture"      float,
    "date"          date,
    "trashed"       boolean NOT NULL DEFAULT '0'
);
CREATE TABLE "tags" (
    "id"         integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title"      text,
    "slug"       text,
    "created_at" datetime,
    "updated_at" datetime
);
CREATE TABLE "photos_tags" (
    "photo_id" integer,
    "tag_id"   integer,
    FOREIGN KEY("photo_id") REFERENCES "photos"("id"),
    FOREIGN KEY("tag_id") REFERENCES "tags"("id"),
    PRIMARY KEY("photo_id","tag_id")
);
CREATE TABLE "versions" (
    "id"        integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type"      text,
    "master"    text,
    "output"    text,
    "thumbnail" text,
    "version"   integer,
    "photo_id"  integer,
    FOREIGN KEY("photo_id") REFERENCES "photos"("id")
);

-- Down

DROP TABLE "versions";
DROP TABLE "photos_tags";
DROP TABLE "tags";
DROP TABLE "photos";

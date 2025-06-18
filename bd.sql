-- ----------------------------
-- Sequence structure for area_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."area_id_seq";
CREATE SEQUENCE "public"."area_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for estatus_ticket_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."estatus_ticket_id_seq";
CREATE SEQUENCE "public"."estatus_ticket_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for logs_area_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."logs_area_id_seq";
CREATE SEQUENCE "public"."logs_area_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for logs_sesion_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."logs_sesion_id_seq";
CREATE SEQUENCE "public"."logs_sesion_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for logs_ticket_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."logs_ticket_id_seq";
CREATE SEQUENCE "public"."logs_ticket_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for logs_usuario_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."logs_usuario_id_seq";
CREATE SEQUENCE "public"."logs_usuario_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ticket_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ticket_id_seq";
CREATE SEQUENCE "public"."ticket_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for tipo_ticket_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."tipo_ticket_id_seq";
CREATE SEQUENCE "public"."tipo_ticket_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for usuario_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."usuario_id_seq";
CREATE SEQUENCE "public"."usuario_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Table structure for area
-- ----------------------------
DROP TABLE IF EXISTS "public"."area";
CREATE TABLE "public"."area" (
  "id" int4 NOT NULL DEFAULT nextval('area_id_seq'::regclass),
  "nombre" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "estatus" bool NOT NULL DEFAULT true,
  "creado_en" timestamp(0) NOT NULL DEFAULT now(),
  "actualizado_en" timestamp(0)
)
;

-- ----------------------------
-- Table structure for estatus_ticket
-- ----------------------------
DROP TABLE IF EXISTS "public"."estatus_ticket";
CREATE TABLE "public"."estatus_ticket" (
  "id" int4 NOT NULL DEFAULT nextval('estatus_ticket_id_seq'::regclass),
  "nombre" varchar(255) COLLATE "pg_catalog"."default",
  "estatus" bool NOT NULL DEFAULT true,
  "creado_en" timestamp(0) NOT NULL DEFAULT now(),
  "actualizado_en" timestamp(0) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for logs_area
-- ----------------------------
DROP TABLE IF EXISTS "public"."logs_area";
CREATE TABLE "public"."logs_area" (
  "id" int4 NOT NULL DEFAULT nextval('logs_area_id_seq'::regclass),
  "area_id" int4 NOT NULL,
  "usuario_id" int4 NOT NULL,
  "accion" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "creado_en" timestamp(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for logs_sesion
-- ----------------------------
DROP TABLE IF EXISTS "public"."logs_sesion";
CREATE TABLE "public"."logs_sesion" (
  "id" int4 NOT NULL DEFAULT nextval('logs_sesion_id_seq'::regclass),
  "usuario_id" int8 NOT NULL,
  "accion" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "creado_en" timestamp(0) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for logs_ticket
-- ----------------------------
DROP TABLE IF EXISTS "public"."logs_ticket";
CREATE TABLE "public"."logs_ticket" (
  "id" int4 NOT NULL DEFAULT nextval('logs_ticket_id_seq'::regclass),
  "ticket_id" int8 NOT NULL,
  "usuario_id" int8,
  "accion" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "creado_en" timestamp(0) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for logs_usuario
-- ----------------------------
DROP TABLE IF EXISTS "public"."logs_usuario";
CREATE TABLE "public"."logs_usuario" (
  "id" int4 NOT NULL DEFAULT nextval('logs_usuario_id_seq'::regclass),
  "usuario_id" int8 NOT NULL,
  "usuario_modificador_id" int8 NOT NULL,
  "accion" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "creado_en" timestamp(0) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for sesion
-- ----------------------------
DROP TABLE IF EXISTS "public"."sesion";
CREATE TABLE "public"."sesion" (
  "usuario_id" int4 NOT NULL,
  "token" text COLLATE "pg_catalog"."default" NOT NULL,
  "expira_en" timestamp(0) NOT NULL,
  "creado_en" timestamp(0) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for ticket
-- ----------------------------
DROP TABLE IF EXISTS "public"."ticket";
CREATE TABLE "public"."ticket" (
  "id" int8 NOT NULL DEFAULT nextval('ticket_id_seq'::regclass),
  "tipo_ticket_id" int8 NOT NULL,
  "descripcion" text COLLATE "pg_catalog"."default" NOT NULL,
  "estatus_ticket_id" int8 NOT NULL DEFAULT 1,
  "creado_en" timestamp(0) NOT NULL DEFAULT now(),
  "actualizado_en" timestamp(0) NOT NULL DEFAULT now(),
  "creado_por" varchar(150) COLLATE "pg_catalog"."default" NOT NULL,
  "area_id" int8 NOT NULL
)
;

-- ----------------------------
-- Table structure for tipo_ticket
-- ----------------------------
DROP TABLE IF EXISTS "public"."tipo_ticket";
CREATE TABLE "public"."tipo_ticket" (
  "id" int4 NOT NULL DEFAULT nextval('tipo_ticket_id_seq'::regclass),
  "nombre" varchar(255) COLLATE "pg_catalog"."default",
  "estatus" bool DEFAULT true,
  "creado_en" timestamp(0) NOT NULL DEFAULT now(),
  "actualizado_en" timestamp(0) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Table structure for usuario
-- ----------------------------
DROP TABLE IF EXISTS "public"."usuario";
CREATE TABLE "public"."usuario" (
  "id" int4 NOT NULL DEFAULT nextval('usuario_id_seq'::regclass),
  "nombre" varchar(255) COLLATE "pg_catalog"."default",
  "password" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "usuario" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "administrador" bool NOT NULL DEFAULT false,
  "estatus" bool NOT NULL DEFAULT true,
  "creado_en" timestamp(0) NOT NULL DEFAULT now(),
  "actualizado_en" timestamp(0)
)
;

-- ----------------------------
-- Table structure for usuario_tipo_ticket
-- ----------------------------
DROP TABLE IF EXISTS "public"."usuario_tipo_ticket";
CREATE TABLE "public"."usuario_tipo_ticket" (
  "usuario_id" int4 NOT NULL,
  "tipo_ticket_id" int4 NOT NULL,
  "estatus" bool NOT NULL DEFAULT true,
  "creado_en" timestamp(6) NOT NULL DEFAULT now(),
  "actualizado_en" timestamp(6)
)
;

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."area_id_seq"
OWNED BY "public"."area"."id";
SELECT setval('"public"."area_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."estatus_ticket_id_seq"
OWNED BY "public"."estatus_ticket"."id";
SELECT setval('"public"."estatus_ticket_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."logs_area_id_seq"
OWNED BY "public"."logs_area"."id";
SELECT setval('"public"."logs_area_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."logs_sesion_id_seq"
OWNED BY "public"."logs_sesion"."id";
SELECT setval('"public"."logs_sesion_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."logs_ticket_id_seq"
OWNED BY "public"."logs_ticket"."id";
SELECT setval('"public"."logs_ticket_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."logs_usuario_id_seq"
OWNED BY "public"."logs_usuario"."id";
SELECT setval('"public"."logs_usuario_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."ticket_id_seq"
OWNED BY "public"."ticket"."id";
SELECT setval('"public"."ticket_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."tipo_ticket_id_seq"
OWNED BY "public"."tipo_ticket"."id";
SELECT setval('"public"."tipo_ticket_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."usuario_id_seq"
OWNED BY "public"."usuario"."id";
SELECT setval('"public"."usuario_id_seq"', 1, true);

-- ----------------------------
-- Primary Key structure for table area
-- ----------------------------
ALTER TABLE "public"."area" ADD CONSTRAINT "area_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table estatus_ticket
-- ----------------------------
ALTER TABLE "public"."estatus_ticket" ADD CONSTRAINT "estatus_ticket_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table logs_area
-- ----------------------------
ALTER TABLE "public"."logs_area" ADD CONSTRAINT "logs_area_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table logs_sesion
-- ----------------------------
ALTER TABLE "public"."logs_sesion" ADD CONSTRAINT "logs_sesion_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table logs_ticket
-- ----------------------------
ALTER TABLE "public"."logs_ticket" ADD CONSTRAINT "logs_ticket_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table logs_usuario
-- ----------------------------
ALTER TABLE "public"."logs_usuario" ADD CONSTRAINT "logs_usuario_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ticket
-- ----------------------------
ALTER TABLE "public"."ticket" ADD CONSTRAINT "ticket_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table tipo_ticket
-- ----------------------------
ALTER TABLE "public"."tipo_ticket" ADD CONSTRAINT "tipo_ticket_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table usuario
-- ----------------------------
ALTER TABLE "public"."usuario" ADD CONSTRAINT "usuario_unique" UNIQUE ("usuario");

-- ----------------------------
-- Primary Key structure for table usuario
-- ----------------------------
ALTER TABLE "public"."usuario" ADD CONSTRAINT "usuario_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table usuario_tipo_ticket
-- ----------------------------
ALTER TABLE "public"."usuario_tipo_ticket" ADD CONSTRAINT "usuario_tipo_ticket_pkey" PRIMARY KEY ("usuario_id", "tipo_ticket_id");

-- ----------------------------
-- Foreign Keys structure for table logs_area
-- ----------------------------
ALTER TABLE "public"."logs_area" ADD CONSTRAINT "logs_area_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "public"."area" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."logs_area" ADD CONSTRAINT "logs_area_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table logs_sesion
-- ----------------------------
ALTER TABLE "public"."logs_sesion" ADD CONSTRAINT "logs_sesion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table logs_ticket
-- ----------------------------
ALTER TABLE "public"."logs_ticket" ADD CONSTRAINT "logs_ticket_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."logs_ticket" ADD CONSTRAINT "logs_ticket_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table logs_usuario
-- ----------------------------
ALTER TABLE "public"."logs_usuario" ADD CONSTRAINT "logs_usuario_usuario_admin_id_fkey" FOREIGN KEY ("usuario_modificador_id") REFERENCES "public"."usuario" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."logs_usuario" ADD CONSTRAINT "logs_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table sesion
-- ----------------------------
ALTER TABLE "public"."sesion" ADD CONSTRAINT "sesion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ticket
-- ----------------------------
ALTER TABLE "public"."ticket" ADD CONSTRAINT "ticket_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "public"."area" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."ticket" ADD CONSTRAINT "ticket_estatus_ticket_id_fkey" FOREIGN KEY ("estatus_ticket_id") REFERENCES "public"."estatus_ticket" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."ticket" ADD CONSTRAINT "ticket_tipo_ticket_id_fkey" FOREIGN KEY ("tipo_ticket_id") REFERENCES "public"."tipo_ticket" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table usuario_tipo_ticket
-- ----------------------------
ALTER TABLE "public"."usuario_tipo_ticket" ADD CONSTRAINT "usuario_tipo_ticket_tipo_ticket_id_fkey" FOREIGN KEY ("tipo_ticket_id") REFERENCES "public"."tipo_ticket" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."usuario_tipo_ticket" ADD CONSTRAINT "usuario_tipo_ticket_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

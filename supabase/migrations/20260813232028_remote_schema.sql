-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

DROP EXTENSION pg_net;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

CREATE SEQUENCE public.equipos_medicos_id_seq AS integer;

CREATE SEQUENCE public.roles_id_seq AS integer;

CREATE SEQUENCE public.salas_id_seq AS integer;

CREATE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
DECLARE
  v_rol_id integer;
  v_estado text;
BEGIN
  -- Capturamos el rol_id enviado desde los metadatos de registro de React (Por defecto 3 = Estudiante)
  v_rol_id := COALESCE((new.raw_user_meta_data->>'rol_id')::integer, 3);
  
  -- 🚀 FIJACIÓN INMUNE A DESFASES: La BD toma el control total del estado inicial
  -- Si el rol_id corresponde a Docente (2), se fuerza estrictamente a 'pendiente'
  IF v_rol_id = 2 THEN
    v_estado := 'pendiente';
  ELSE
    v_estado := 'activo';
  END IF;

  -- Inserción Obligatoria en la tabla maestra 'usuarios'
  INSERT INTO public.usuarios (id, nombres, apellidos, correo, rol_id, estado)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'nombres', 'Nuevo'), 
    COALESCE(new.raw_user_meta_data->>'apellidos', 'Usuario'), 
    new.email, 
    v_rol_id, 
    v_estado -- Guardado riguroso en minúsculas ('pendiente' o 'activo')
  );

  -- CONTROL DE FLUJO EN CASCADA RELACIONAL
  IF v_rol_id = 3 THEN
    -- Detalles académicos del Estudiante
    INSERT INTO public.detalles_estudiantes (usuario_id, semestre, paralelo)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'semestre', '1er'), 
      COALESCE(new.raw_user_meta_data->>'paralelo', 'A')
    );
  
  ELSIF v_rol_id = 2 THEN
    -- Ficha y asignación de materia pedagógica del Docente
    INSERT INTO public.detalles_docentes (usuario_id, materia)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'materia', 'Simulación Clínica')
    );
  END IF;

  RETURN new;
END;
$function$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;

GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;

GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;

CREATE TABLE public.detalles_docentes (
  usuario_id uuid NOT NULL,
  materia    text DEFAULT 'Simulación Clínica'::text
);

ALTER TABLE public.detalles_docentes
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.detalles_docentes
  ADD CONSTRAINT detalles_docentes_pkey PRIMARY KEY (usuario_id);

GRANT ALL ON public.detalles_docentes TO anon;

GRANT ALL ON public.detalles_docentes TO authenticated;

GRANT ALL ON public.detalles_docentes TO service_role;

CREATE TABLE public.detalles_estudiantes (
  usuario_id uuid NOT NULL,
  semestre   text NOT NULL,
  paralelo   text NOT NULL
);

ALTER TABLE public.detalles_estudiantes
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.detalles_estudiantes
  ADD CONSTRAINT detalles_estudiantes_pkey PRIMARY KEY (usuario_id);

GRANT ALL ON public.detalles_estudiantes TO anon;

GRANT ALL ON public.detalles_estudiantes TO authenticated;

GRANT ALL ON public.detalles_estudiantes TO service_role;

CREATE TABLE public.equipos_medicos (
  id          integer                  DEFAULT nextval('public.equipos_medicos_id_seq'::regclass) NOT NULL,
  sala_id     integer                  NOT NULL,
  unity_tag   text                     NOT NULL,
  nombre      text                     NOT NULL,
  descripcion text                     NOT NULL,
  creado_por  uuid,
  updated_at  timestamp with time zone DEFAULT now()
);

ALTER SEQUENCE public.equipos_medicos_id_seq OWNED BY public.equipos_medicos.id;

GRANT ALL ON SEQUENCE public.equipos_medicos_id_seq TO anon;

GRANT ALL ON SEQUENCE public.equipos_medicos_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.equipos_medicos_id_seq TO service_role;

ALTER TABLE public.equipos_medicos
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.equipos_medicos
  ADD CONSTRAINT equipos_medicos_pkey PRIMARY KEY (id);

ALTER TABLE public.equipos_medicos
  ADD CONSTRAINT equipos_medicos_unity_tag_key UNIQUE (unity_tag);

GRANT ALL ON public.equipos_medicos TO anon;

GRANT ALL ON public.equipos_medicos TO authenticated;

GRANT ALL ON public.equipos_medicos TO service_role;

CREATE POLICY "Equipos - Lectura general autenticados" ON public.equipos_medicos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE public.roles (
  id     integer DEFAULT nextval('public.roles_id_seq'::regclass) NOT NULL,
  nombre text    NOT NULL
);

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;

GRANT ALL ON SEQUENCE public.roles_id_seq TO anon;

GRANT ALL ON SEQUENCE public.roles_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.roles_id_seq TO service_role;

ALTER TABLE public.roles
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.roles
  ADD CONSTRAINT roles_nombre_key UNIQUE (nombre);

ALTER TABLE public.roles
  ADD CONSTRAINT roles_pkey PRIMARY KEY (id);

GRANT ALL ON public.roles TO anon;

GRANT ALL ON public.roles TO authenticated;

GRANT ALL ON public.roles TO service_role;

CREATE POLICY "Permitir lectura de roles a autenticados" ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE public.salas (
  id          integer                  DEFAULT nextval('public.salas_id_seq'::regclass) NOT NULL,
  nombre      text                     NOT NULL,
  descripcion text,
  created_at  timestamp with time zone DEFAULT now()
);

ALTER SEQUENCE public.salas_id_seq OWNED BY public.salas.id;

GRANT ALL ON SEQUENCE public.salas_id_seq TO anon;

GRANT ALL ON SEQUENCE public.salas_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.salas_id_seq TO service_role;

ALTER TABLE public.salas
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.salas
  ADD CONSTRAINT salas_nombre_key UNIQUE (nombre);

ALTER TABLE public.salas
  ADD CONSTRAINT salas_pkey PRIMARY KEY (id);

ALTER TABLE public.equipos_medicos
  ADD CONSTRAINT equipos_medicos_sala_id_fkey FOREIGN KEY (sala_id) REFERENCES public.salas(id) ON DELETE CASCADE;

GRANT ALL ON public.salas TO anon;

GRANT ALL ON public.salas TO authenticated;

GRANT ALL ON public.salas TO service_role;

CREATE POLICY "Salas - Lectura general autenticados" ON public.salas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE public.usuarios (
  id         uuid                     NOT NULL,
  nombres    text                     NOT NULL,
  apellidos  text                     NOT NULL,
  correo     text                     NOT NULL,
  rol_id     integer                  DEFAULT 3,
  created_at timestamp with time zone DEFAULT now(),
  estado     text                     DEFAULT 'Activo'::text
);

CREATE POLICY "Lectura de detalles académicos para dueños o administrativos" ON public.detalles_estudiantes
  FOR SELECT
  TO authenticated
  USING (((auth.uid() = usuario_id) OR (EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol_id = ANY (ARRAY[1, 2])))))));

CREATE POLICY "Modificación de detalles académicos exclusiva para administra" ON public.detalles_estudiantes
  FOR UPDATE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol_id = 1)))));

CREATE POLICY "Equipos - CRUD exclusivo para personal autorizado" ON public.equipos_medicos
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol_id = ANY (ARRAY[1, 2]))))));

CREATE POLICY "Salas - CRUD exclusivo para personal autorizado" ON public.salas
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol_id = ANY (ARRAY[1, 2]))))));

ALTER TABLE public.usuarios
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.usuarios
  ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);

ALTER TABLE public.usuarios
  ADD CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.usuarios
  ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);

ALTER TABLE public.detalles_docentes
  ADD CONSTRAINT detalles_docentes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;

ALTER TABLE public.detalles_estudiantes
  ADD CONSTRAINT detalles_estudiantes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;

ALTER TABLE public.equipos_medicos
  ADD CONSTRAINT equipos_medicos_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuarios(id) ON DELETE SET NULL;

ALTER TABLE public.usuarios
  ADD CONSTRAINT usuarios_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id);

GRANT ALL ON public.usuarios TO anon;

GRANT ALL ON public.usuarios TO authenticated;

GRANT ALL ON public.usuarios TO service_role;

CREATE POLICY "Permitir actualización a administradores o dueño" ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (((auth.uid() = id) OR (rol_id = 1)));

CREATE POLICY "Permitir eliminación exclusiva al administrador" ON public.usuarios
  FOR DELETE
  TO authenticated
  USING ((rol_id = 1));

CREATE POLICY "Permitir lectura según rol o propiedad" ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (((auth.uid() = id) OR (rol_id = ANY (ARRAY[1, 2]))));

# 🎫 Mesa de Ayuda TI - UNIAJC

Sistema institucional de gestión de tickets de soporte técnico diseñado para optimizar la atención de incidencias mediante un tablero Kanban dinámico y control de acceso basado en roles (RBAC).

## 🚀 Tecnologías Principales

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS.
- **Componentes UI**: Radix UI + Shadcn/UI.
- **Autenticación**: Firebase Authentication (Email/Password & Google).
- **Base de Datos**: Supabase (PostgreSQL) con políticas de RLS.
- **Almacenamiento**: Firebase Storage (Gestión de archivos adjuntos).
- **Despliegue**: Google Cloud Run (Dockerized).

## 🏗️ Arquitectura y Responsabilidades

El proyecto utiliza un enfoque híbrido de servicios en la nube:
- **Firebase**: Gestiona la identidad del usuario y los archivos físicos (imágenes/logs).
- **Supabase**: Almacena los metadatos de los tickets, comentarios e historial, permitiendo consultas relacionales complejas y auditoría.

### Estructura de Carpetas (Modular)
- `src/components/ui`: Componentes atómicos reutilizables.
- `src/components/features`: Lógica de negocio específica (Kanban, Auth).
- `src/components/layout`: Estructura global (Sidebar, Navbar).
- `src/services`: Capa de abstracción para llamadas a API y DB.

## 🛠️ Configuración Local

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd helpdesk
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Variables de Entorno**: Crea un archivo `.env.local` con las siguientes llaves:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_supabase

   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
   ```

4. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

## 📊 Base de Datos

### Tablas Principales
- `tickets`: Almacena el asunto, prioridad, estado y autor (`user_email`).
- `comments`: Hilo de conversación interna por ticket.
- `ticket_history`: Registro cronológico de cambios de estado para auditoría.
- `admins`: Lista blanca de correos electrónicos con permisos de administrador.

## Rendimiento y Seguridad

El proyecto ha sido auditado siguiendo las mejores prácticas de Vercel. Consulta el [Reporte de Auditoría](PERFORMANCE_AUDIT.md) para más detalles sobre:
- Eliminación de bottlenecks en carga de datos.
- Optimización de re-renderizado en el Kanban.
- Estrategias de Dynamic Imports.
- Configuración de RLS en Supabase.

## 👥 Roles y Permisos

- **Usuario**: Crea tickets, puede adjuntar archivos y ver el estado de sus propios requerimientos. No puede mover tickets en el Kanban.
- **Administrador**: Visualiza todos los tickets del sistema, gestiona estados mediante Drag & Drop y accede al panel de métricas.

---
Desarrollado por: Juan Felipe Chilito, Ethan Alejandro Mezu, Nicolle Mera Gomez.

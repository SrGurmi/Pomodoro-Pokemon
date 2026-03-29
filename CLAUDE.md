# CLAUDE.md — Pomodoro-Pokemon v1.02 Roadmap

## Estado actual del proyecto

App React 100% client-side con:
- Timer Pomodoro configurable
- Sistema de tareas (localStorage)
- Companion Pokémon con XP/niveles
- Integración Spotify (OAuth implícito)
- Sistema de logros
- Temas por tipo Pokémon

**Problemas principales:**
- Sin backend → datos se pierden al limpiar el browser
- Sin usuarios → no hay cuentas ni sincronización
- Sin sesiones persistidas → no hay estadísticas reales
- Música local incompleta
- Spotify config expuesta en frontend

---

## Plan de implementación — v1.02

Seguir los pasos en orden. Marcar cada uno como completado antes de pasar al siguiente.

---

## PASO 1 — Diseño de arquitectura backend

**Objetivo:** Definir la estructura del backend antes de escribir código.

### Stack elegido:
- **Runtime:** Node.js + Express (TypeScript)
- **ORM:** Prisma
- **DB:** SQLite (desarrollo) → PostgreSQL (producción)
- **Auth:** JWT (access token 15min + refresh token 7 días)
- **Ubicación:** `/home/user/Pomodoro-Pokemon/backend/`

### Schema de base de datos (Prisma):

```prisma
model User {
  id           String        @id @default(cuid())
  email        String        @unique
  username     String        @unique
  passwordHash String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  tasks        Task[]
  sessions     PomodoroSession[]
  pokemon      PokemonState?
  achievements UserAchievement[]
  settings     UserSettings?
  refreshTokens RefreshToken[]
}

model Task {
  id                  String   @id @default(cuid())
  userId              String
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title               String
  completed           Boolean  @default(false)
  pomodorosCompleted  Int      @default(0)
  estimatedPomodoros  Int      @default(1)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model PomodoroSession {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  taskId    String?
  duration  Int      // segundos
  type      String   // "work" | "break" | "long_break"
  completed Boolean  @default(false)
  startedAt DateTime @default(now())
  endedAt   DateTime?
}

model PokemonState {
  id         String   @id @default(cuid())
  userId     String   @unique
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  pokemonId  Int      @default(25) // Pikachu
  name       String   @default("Pikachu")
  level      Int      @default(1)
  xp         Int      @default(0)
  type       String   @default("electric")
  updatedAt  DateTime @updatedAt
}

model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievementId String
  unlockedAt    DateTime @default(now())
  @@unique([userId, achievementId])
}

model UserSettings {
  id             String  @id @default(cuid())
  userId         String  @unique
  user           User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  workDuration   Int     @default(25)
  breakDuration  Int     @default(5)
  longBreak      Int     @default(15)
  theme          String  @default("dark")
  pokemonType    String  @default("electric")
  soundEnabled   Boolean @default(true)
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

### Rutas API:

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me

GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id

POST /api/sessions/start
PATCH /api/sessions/:id/complete

GET /api/stats
GET /api/stats/daily
GET /api/stats/weekly

GET   /api/pokemon
PATCH /api/pokemon

GET /api/achievements
POST /api/achievements/:id/unlock

GET   /api/settings
PATCH /api/settings
```

**Completado:** [ ]

---

## PASO 2 — Inicializar proyecto backend

**Comandos a ejecutar:**

```bash
cd /home/user/Pomodoro-Pokemon
mkdir backend && cd backend
npm init -y
npm install express cors dotenv bcryptjs jsonwebtoken
npm install prisma @prisma/client
npm install -D typescript @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken ts-node-dev
npx tsc --init
npx prisma init --datasource-provider sqlite
```

**Estructura de archivos a crear:**
```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   ├── sessions.ts
│   │   ├── pokemon.ts
│   │   ├── achievements.ts
│   │   ├── stats.ts
│   │   └── settings.ts
│   ├── middleware/
│   │   ├── auth.ts       # JWT verification middleware
│   │   └── validate.ts   # Request validation
│   ├── lib/
│   │   └── prisma.ts     # Prisma client singleton
│   └── index.ts          # Express app entry point
├── prisma/
│   └── schema.prisma
├── .env
├── package.json
└── tsconfig.json
```

**Completado:** [ ]

---

## PASO 3 — Implementar autenticación JWT

**Archivo: `src/routes/auth.ts`**

Implementar:
1. `POST /api/auth/register` — bcrypt hash de password, crear user + settings + pokemonState por defecto
2. `POST /api/auth/login` — verificar credentials, generar access token (15min) + refresh token (7d)
3. `POST /api/auth/logout` — invalidar refresh token en DB
4. `POST /api/auth/refresh` — validar refresh token, emitir nuevo access token
5. `GET /api/auth/me` — retornar datos del usuario autenticado

**Archivo: `src/middleware/auth.ts`**

Middleware que:
- Extrae Bearer token del header Authorization
- Verifica JWT con secret
- Añade `req.userId` si válido
- Retorna 401 si inválido o expirado

**Variables de entorno (`.env`):**
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="<random 64 char string>"
JWT_REFRESH_SECRET="<random 64 char string>"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

**Completado:** [ ]

---

## PASO 4 — Implementar rutas de datos

**Tasks (`src/routes/tasks.ts`):**
- `GET /api/tasks` — listar tareas del usuario autenticado
- `POST /api/tasks` — crear tarea (validar title, estimatedPomodoros)
- `PATCH /api/tasks/:id` — actualizar (completed, pomodorosCompleted, title)
- `DELETE /api/tasks/:id` — eliminar (verificar ownership)

**Sessions (`src/routes/sessions.ts`):**
- `POST /api/sessions/start` — crear sesión con startedAt=now
- `PATCH /api/sessions/:id/complete` — marcar como completada, calcular duración

**Pokemon (`src/routes/pokemon.ts`):**
- `GET /api/pokemon` — retornar estado del pokémon del usuario
- `PATCH /api/pokemon` — actualizar xp/level/type/pokemonId

**Achievements (`src/routes/achievements.ts`):**
- `GET /api/achievements` — retornar logros desbloqueados del usuario
- `POST /api/achievements/:id/unlock` — desbloquear logro (idempotente)

**Stats (`src/routes/stats.ts`):**
- `GET /api/stats` — totales: sesiones completadas, tareas completadas, tiempo total
- `GET /api/stats/daily` — por día (últimos 7 días)
- `GET /api/stats/weekly` — por semana (últimas 4 semanas)

**Settings (`src/routes/settings.ts`):**
- `GET /api/settings` — retornar configuración del usuario
- `PATCH /api/settings` — actualizar configuración

**Completado:** [ ]

---

## PASO 5 — Frontend: AuthContext y cliente API

**Archivo: `src/lib/api.ts`**

Cliente HTTP centralizado que:
- Usa `fetch` con base URL configurable (`VITE_API_URL`)
- Añade `Authorization: Bearer <token>` automáticamente
- En respuesta 401, intenta refresh automático
- Si refresh falla, hace logout

**Archivo: `src/context/AuthContext.tsx`**

Estado:
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

Acciones:
- `login(email, password)` → llama /api/auth/login, guarda tokens
- `register(email, username, password)` → llama /api/auth/register
- `logout()` → llama /api/auth/logout, limpia estado
- `refreshToken()` → llama /api/auth/refresh silenciosamente

Persistencia:
- access token: memoria (no localStorage por seguridad)
- refresh token: httpOnly cookie (backend) o localStorage como fallback

**Completado:** [ ]

---

## PASO 6 — Frontend: Pantalla de Login/Register

**Archivo: `src/components/auth/AuthScreen.tsx`**

Componente que renderiza cuando `!isAuthenticated`:
- Tabs: "Iniciar sesión" / "Registrarse"
- Form de login: email + password
- Form de registro: username + email + password + confirmar password
- Validaciones client-side
- Mensajes de error del servidor
- Loading states en botones
- Diseño consistente con el tema Pokémon actual (gradientes, colores)

**Integración en `App.tsx`:**
```tsx
// Si no está autenticado, mostrar AuthScreen
// Si está autenticado, mostrar app normal
```

**Completado:** [ ]

---

## PASO 7 — Frontend: Migrar Context a API

Actualizar los contextos existentes para usar la API en lugar de localStorage:

**TaskContext.tsx:**
- `fetchTasks()` → GET /api/tasks al montar
- `addTask()` → POST /api/tasks
- `updateTask()` → PATCH /api/tasks/:id
- `deleteTask()` → DELETE /api/tasks/:id
- Mantener estado local sincronizado (optimistic updates opcionales)

**PokemonContext.tsx:**
- `fetchPokemon()` → GET /api/pokemon al montar
- `updateXP()` → PATCH /api/pokemon (level up calculado también en backend)
- `updateType()` → PATCH /api/pokemon

**AchievementContext.tsx:**
- `fetchAchievements()` → GET /api/achievements al montar
- `unlockAchievement()` → POST /api/achievements/:id/unlock

**PomodoroTimer.tsx:**
- Al iniciar sesión → POST /api/sessions/start
- Al completar sesión → PATCH /api/sessions/:id/complete

**ThemeContext / Settings:**
- Al cambiar settings → PATCH /api/settings
- Al montar → GET /api/settings para inicializar

**Completado:** [ ]

---

## PASO 8 — Frontend: Dashboard de estadísticas

**Archivo: `src/components/StatsPanel.tsx`**

Panel con:
- Total de sesiones completadas
- Tiempo total enfocado (horas)
- Tareas completadas
- Racha actual (días consecutivos)
- Gráfico de barras simple (últimos 7 días): sesiones por día
- Mostrar como modal o tab adicional en la app

**Completado:** [ ]

---

## PASO 9 — Mejorar sistema Pokémon

**Mejoras a implementar:**

1. **Selector de Pokémon real:** Usar PokeAPI para buscar Pokémon por nombre o ID, mostrar sprite oficial, guardar en backend.

2. **Evoluciones:**
   - Definir tabla de evoluciones para los starters
   - Al subir de nivel (5, 10, 20...) verificar si hay evolución disponible
   - Mostrar animación de evolución con canvas-confetti

3. **Sprites reales:** Reemplazar el emoji 🐾 por el sprite oficial de PokeAPI (`sprites.front_default`)

4. **Tipos dinámicos:** El tipo del Pokémon cambia automáticamente cuando cambias de Pokémon

**Completado:** [ ]

---

## PASO 10 — Testing y pulido final

**Tests básicos (backend):**
- Instalar Jest + supertest
- Test de auth: register, login, logout, refresh
- Test de tasks: CRUD con auth
- Test de stats: cálculo correcto

**Frontend polish:**
- Loading skeletons mientras carga datos de API
- Error boundaries
- Offline detection (mostrar aviso si no hay conexión)
- Mensaje de bienvenida personalizado con username del usuario
- Avatar del usuario (iniciales o Pokémon actual)

**Variables de entorno frontend:**
```
VITE_API_URL=http://localhost:3001
```

**Completado:** [ ]

---

## Orden de commits sugerido

```
feat(backend): initialize express + prisma backend structure
feat(backend): implement JWT authentication routes
feat(backend): add tasks, sessions, and stats API routes
feat(backend): add pokemon, achievements, and settings routes
feat(frontend): add API client and AuthContext
feat(frontend): create login/register screen
feat(frontend): migrate TaskContext to use API
feat(frontend): migrate PokemonContext and AchievementContext to API
feat(frontend): add stats dashboard panel
feat(pokemon): implement real sprite and evolution system
test: add backend auth and task route tests
fix: final polish and error handling
```

---

## Notas importantes

- El refresh token debe almacenarse en httpOnly cookie en producción. Para desarrollo puede ir en localStorage como `refresh_token`.
- Nunca exponer el JWT_SECRET en el frontend.
- Las rutas de API deben estar protegidas con el middleware de auth (excepto /register y /login).
- El campo `passwordHash` nunca debe enviarse al frontend.
- Mantener compatibilidad: si no hay backend disponible (offline), la app puede funcionar en modo degradado con localStorage como fallback.
- La migración de datos de localStorage al backend se puede hacer una vez al primer login detectando si existen datos locales.

# WA.Bot — WhatsApp Business Automation Platform

> Automatización inteligente de atención al cliente vía WhatsApp con IA generativa integrada.

![Node.js](https://img.shields.io/badge/Node.js-v25-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_API-Google-4285F4?style=flat-square&logo=google&logoColor=white)
![Status](https://img.shields.io/badge/Estado-En_desarrollo-orange?style=flat-square)

---

## ¿Qué es WA.Bot?

WA.Bot es un MVP de automatización de WhatsApp Business desarrollado como proyecto de prácticas del ciclo formativo de **Desarrollo de Aplicaciones Multiplataforma (DAM)** en Ucademy.

El sistema permite a pymes y microempresas responder automáticamente a sus clientes en WhatsApp las 24 horas, sin necesidad de personal adicional, utilizando inteligencia artificial generativa para generar respuestas contextuales y naturales.

### Problema que resuelve

Las pequeñas empresas reciben mensajes de WhatsApp constantemente pero no tienen capacidad de responder fuera del horario laboral, lo que genera pérdida de clientes, carga operativa manual y ausencia de historial estructurado de conversaciones.

---

## Arquitectura del sistema

```
Cliente WhatsApp
      │
      ▼
WhatsApp Cloud API (Meta)
      │ POST /webhook
      ▼
Backend Express (Railway)
      ├── Valida firma HMAC-SHA256
      ├── Busca/crea contacto en BD
      ├── Recupera historial de conversación
      ├── Envía contexto a Gemini API
      │         │
      │         ▼
      │    Gemini API (Google)
      │         │ Respuesta generada
      │         ▼
      ├── Guarda mensaje + respuesta en BD
      └── Responde al cliente vía WhatsApp Cloud API
      │
      ▼
PostgreSQL (Neon)
      │
      ▼
Dashboard Next.js (Vercel)
      └── Visualiza conversaciones en tiempo real
```

---

## Stack tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| **Backend** | Node.js + Express 5 | I/O asíncrono, ideal para webhooks en tiempo real |
| **Base de datos** | PostgreSQL (Neon) | ACID, relacional, soporte JSON, gratuito |
| **ORM** | Prisma 6 | Tipado seguro, migraciones automáticas, productividad alta |
| **IA Generativa** | Gemini API (Google) | Freemium, fácil integración, respuestas naturales |
| **WhatsApp** | WhatsApp Cloud API (Meta) | API oficial, webhooks en tiempo real |
| **Frontend** | Next.js + Tailwind CSS | SSR, deploy instantáneo en Vercel |
| **Deploy Backend** | Railway | CI/CD automático desde GitHub |
| **Deploy Frontend** | Vercel | Plataforma oficial Next.js |

---

## Modelo de datos

```prisma
model Contact {
  id            String         @id @default(uuid())
  phoneNumber   String         @unique
  name          String?
  createdAt     DateTime       @default(now())
  conversations Conversation[]
}

model Conversation {
  id        String    @id @default(uuid())
  contactId String
  status    Status    @default(OPEN)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  contact   Contact   @relation(fields: [contactId], references: [id])
  messages  Message[]
}

model Message {
  id             String       @id @default(uuid())
  conversationId String
  role           Role
  content        String
  waMessageId    String?
  timestamp      DateTime     @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id])
}

enum Status { OPEN CLOSED }
enum Role  { USER ASSISTANT }
```

---

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Health check del servidor |
| `GET` | `/webhook` | Verificación del webhook con Meta |
| `POST` | `/webhook` | Recepción de mensajes de WhatsApp |
| `GET` | `/api/conversations` | Lista de conversaciones (dashboard) |
| `GET` | `/api/conversations/:id/messages` | Mensajes de una conversación |

---

## Instalación y configuración local

### Requisitos previos

- Node.js v18+
- Cuenta en [Neon](https://neon.tech) (PostgreSQL gratuito)
- Cuenta en [Meta Developers](https://developers.facebook.com)
- Cuenta en [Google AI Studio](https://aistudio.google.com) (Gemini API)

### 1. Clonar el repositorio

```bash
git clone https://github.com/ezelduquedev/wa.Bot.git
cd wa.Bot
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia `.env.example` y rellena los valores:

```bash
cp .env.example .env
```

```env
# Servidor
PORT=3000

# WhatsApp Cloud API (Meta)
WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=1234567890
META_APP_SECRET=xxxxxxxxxxxxxx
VERIFY_TOKEN=tu_token_secreto

# Gemini API
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxx

# Base de datos
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

### 4. Generar cliente Prisma y ejecutar migraciones

```bash
npx prisma generate --schema=prisma/schema.prisma
npx prisma migrate dev --schema=prisma/schema.prisma
```

### 5. Arrancar el servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### 6. Exponer el servidor localmente (para desarrollo)

```bash
# Con ngrok (recomendado)
npx ngrok http 3000
```

Usa la URL que te proporciona ngrok como webhook URL en Meta Developers.

---

## Variables de entorno

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `WHATSAPP_TOKEN` | Token de acceso a WhatsApp Cloud API | Meta Developers → WhatsApp → Configuración de la API |
| `WHATSAPP_PHONE_NUMBER_ID` | ID del número de teléfono de negocio | Meta Developers → WhatsApp → Configuración de la API |
| `META_APP_SECRET` | Clave secreta de la app Meta | Meta Developers → Configuración → Información básica |
| `VERIFY_TOKEN` | Token personalizado para verificar el webhook | Lo defines tú, debe coincidir con el panel de Meta |
| `GEMINI_API_KEY` | API Key de Gemini | [aistudio.google.com](https://aistudio.google.com) |
| `DATABASE_URL` | Cadena de conexión PostgreSQL | Panel de Neon o Railway |

---

## Estructura del proyecto

```
wa.Bot/
├── prisma/
│   ├── schema.prisma          # Modelo de datos
│   └── migrations/            # Migraciones de BD
├── src/
│   ├── controllers/
│   │   └── webhookController.js   # Verificación + recepción de mensajes
│   ├── routes/
│   │   ├── webhook.js             # GET y POST /webhook
│   │   └── conversations.js       # API REST del dashboard
│   ├── services/
│   │   ├── dbService.js           # CRUD con Prisma
│   │   └── whatsappService.js     # Envío de mensajes (Día 4)
│   └── server.js                  # Entrada principal
├── .env.example
├── .gitignore
└── package.json
```

---

## Roadmap del MVP

| Día | Fecha | Fase | Estado |
|-----|-------|------|--------|
| 1 | 14/05 | Investigación + Arquitectura | ✅ Completado |
| 2 | 15/05 | Setup inicial del proyecto | ✅ Completado |
| 3 | 18/05 | BD + Webhook WhatsApp + Deploy | ✅ Completado |
| 4 | 19/05 | Automatización básica de respuestas | 🔄 En progreso |
| 5 | 20/05 | Integración IA — Gemini API | ⏳ Pendiente |
| 6 | 21/05 | Dashboard Next.js | ⏳ Pendiente |
| 7 | 22/05 | Deploy final + Testing + Memoria | ⏳ Pendiente |

---

## Funcionalidades del MVP

### ✅ Implementadas
- Recepción de mensajes vía webhook de WhatsApp Cloud API
- Validación de firma HMAC-SHA256
- Guardado de conversaciones y mensajes en PostgreSQL
- Gestión automática de contactos (crear/reutilizar)
- API REST para el dashboard administrativo
- Inicialización del dashboard Next.js

### 🔄 En desarrollo
- Respuesta automática vía WhatsApp Cloud API
- Integración con Gemini API para respuestas con IA
- Dashboard administrativo con visualización de conversaciones

### 🔮 Futuras mejoras
- Autenticación en el dashboard (NextAuth)
- Campañas de mensajes masivos
- Multi-empresa y multi-agente
- Analytics de conversaciones
- Integración con CRM

---

## Seguridad

- Validación de firma HMAC-SHA256 en cada petición entrante del webhook
- Variables de entorno para todas las credenciales (nunca en el código)
- HTTPS automático en Railway y Vercel
- Token de verificación personalizado para el handshake con Meta

---

## Autor

**Ezel Alexander Duque Arias**
Ciclo 2º DAM — Ucademy
Período de prácticas: 14/05/2026 – 22/05/2026
📧 ezelduquedev@gmail.com
🐙 [@ezelduquedev](https://github.com/ezelduquedev)

---

> Proyecto desarrollado como MVP de prácticas. No es un SaaS completo — es un prototipo técnico funcional que demuestra integración real de APIs, backend moderno, IA generativa y despliegue profesional en la nube.
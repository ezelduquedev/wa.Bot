# 📲 WA.Bot — WhatsApp Business Automation MVP

WA.Bot es un sistema de automatización de atención al cliente para WhatsApp Business que integra inteligencia artificial, base de datos y un dashboard administrativo en tiempo real.

Permite recibir mensajes de WhatsApp, procesarlos con IA (Groq / Llama 3.3 70B), almacenarlos en PostgreSQL y gestionarlos desde un panel web.

---

## 🚀 Demo en producción

- 🌐 Dashboard: https://wa-bot-iota.vercel.app  
- ⚙️ Backend: https://wabot-production-f502.up.railway.app  
- 📦 Repositorio: https://github.com/ezelduquedev/wa.Bot  

---

## 🧠 Características principales

- 📩 Recepción de mensajes vía WhatsApp Cloud API (Meta)
- 🤖 Respuestas automáticas con IA (Groq / Llama 3.3 70B)
- 💬 Gestión de conversaciones tipo WhatsApp
- 🗄️ Base de datos PostgreSQL con Prisma ORM
- 📊 Dashboard administrativo en Next.js
- 🔁 Actualización en tiempo real (polling cada 10s)
- 📢 Módulo de campañas masivas
- ☁️ Deploy en Railway (backend) y Vercel (frontend)

---

## 🏗️ Arquitectura del sistema

- **Backend:** Node.js + Express  
- **Frontend:** Next.js + React  
- **Base de datos:** PostgreSQL (Railway)  
- **ORM:** Prisma  
- **IA:** Groq API (Llama 3.3 70B)  
- **Mensajería:** WhatsApp Cloud API (Meta)  

---

## 🔄 Flujo del sistema

1. Usuario envía mensaje por WhatsApp  
2. Meta envía webhook al backend  
3. Backend valida firma HMAC-SHA256  
4. Mensaje se guarda en PostgreSQL  
5. Se envía contexto a IA (Groq)  
6. IA genera respuesta  
7. Respuesta se envía por WhatsApp  
8. Dashboard se actualiza automáticamente  

---

## 📁 Estructura del proyecto
wa.Bot/
│
├── backend/
│ ├── src/
│ │ ├── routes/
│ │ ├── controllers/
│ │ ├── services/
│ │ └── webhook/
│ ├── prisma/
│ └── server.js
│
├── dashboard/
│ ├── pages/
│ ├── components/
│ └── styles/
│
└── README.md

## ⚙️ Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/ezelduquedev/wa.Bot
cd wa.Bot
2. Instalar backend
cd backend
npm install
3. Instalar dashboard
cd ../dashboard
npm install
4. Configurar variables de entorno
backend/.env
DATABASE_URL=your_postgres_url

WHATSAPP_TOKEN=your_meta_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
META_APP_SECRET=your_meta_secret

VERIFY_TOKEN=your_verify_token

GROQ_API_KEY=your_groq_api_key

PORT=3000
NODE_ENV=development
dashboard/.env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

🧪 Ejecución en local
Backend
cd backend
npm run dev

➡️ http://localhost:3000

Frontend
cd dashboard
npm run dev

➡️ http://localhost:3001

🌐 Configuración Webhook (Meta)
Ejecutar ngrok:
ngrok http 3000
Copiar URL:
https://xxxx.ngrok.io/webhook
Configurar en Meta Developers:
Webhook URL
VERIFY_TOKEN

🚀 Deploy en producción
Backend (Railway)
Conectar GitHub
Añadir variables de entorno
Deploy automático
Frontend (Vercel)
NEXT_PUBLIC_BACKEND_URL=https://tu-backend.railway.app

⚠️ Limitaciones
Sandbox de Meta restringe mensajes externos sin verificación Business
Sin autenticación en dashboard
Sin soporte multimedia
Sin WebSockets (usa polling)
Sin CI/CD avanzado

🧠 IA utilizada
Groq API (Llama 3.3 70B)
Contexto de conversación completo
Fallback automático en caso de error

🛠️ Tecnologías
Node.js
Express
Next.js
React
PostgreSQL
Prisma
Tailwind CSS
WhatsApp Cloud API
Railway
Vercel

👨‍💻 Autor
Ezel Alexander Duque Arias

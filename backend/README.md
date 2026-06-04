# Kapp Backend Base

Backend Node.js + TypeScript pour l'avatar IA professeur de coréen.

## Installation

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Serveur local : http://localhost:3001

## Route principale

POST /api/teacher/chat

Body exemple :

```json
{
  "userId": "demo-user",
  "message": "Comment dire je voudrais un café ?",
  "mode": "cafe"
}
```

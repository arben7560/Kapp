# Kapp Backend Base

Backend Node.js + TypeScript pour l’avatar IA professeur de coréen en mode realtime.

Ce backend sert de proxy sécurisé entre l’application mobile et l’agent IA D-ID.
L’application mobile ne communique pas directement avec D-ID : elle passe par ce serveur.

## Installation

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Serveur local :

```txt
http://localhost:3001
```

## Variables d’environnement

Le fichier `.env` doit contenir au minimum :

```env
D_ID_API_KEY=your_did_api_key
D_ID_AGENT_ID=your_did_agent_id
PORT=3001
```

## Route de santé

```http
GET /health
```

Réponse exemple :

```json
{
  "ok": true,
  "service": "kapp-backend"
}
```

## Routes principales realtime

### Créer une session realtime

```http
POST /api/avatar/realtime/session
```

Body exemple :

```json
{}
```

Cette route crée une session WebRTC avec l’agent D-ID.

---

### Envoyer la réponse SDP locale

```http
POST /api/avatar/realtime/session/:sessionId/sdp
```

Body exemple :

```json
{
  "answer": {
    "type": "answer",
    "sdp": "..."
  }
}
```

---

### Envoyer un ICE candidate

```http
POST /api/avatar/realtime/session/:sessionId/ice
```

Body exemple :

```json
{
  "candidate": {
    "candidate": "...",
    "sdpMid": "0",
    "sdpMLineIndex": 0
  }
}
```

---

### Envoyer un message à l’agent IA

```http
POST /api/avatar/realtime/session/:sessionId/message
```

Body exemple :

```json
{
  "message": "Comment dire je voudrais un café en coréen ?"
}
```

L’agent IA répond en temps réel via WebRTC, avec le prompt défini côté D-ID Agent.

---

### Fermer une session realtime

```http
DELETE /api/avatar/realtime/session/:sessionId
```

Cette route ferme proprement la session D-ID active.

## Flux général

```txt
Application mobile
→ création session realtime
→ connexion WebRTC
→ affichage du flux vidéo avec RTCView
→ envoi du message utilisateur à l’agent
→ réponse orale de l’agent IA en temps réel
```

## Ancien système

Le projet peut encore contenir des fichiers liés à l’ancien système :

```txt
/api/teacher/chat
generateVoice.ts
generateLipSync.ts
teacher.routes.ts
```

Ces fichiers sont conservés temporairement, mais ils ne doivent plus être appelés par l’application si le mode Prof IA realtime est utilisé comme système principal.

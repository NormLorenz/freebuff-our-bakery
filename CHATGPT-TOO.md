# Bakery Chatbot — OpenAI API

A complete bakery ordering chatbot using:

- Static HTML/CSS/JavaScript frontend
- Node.js + Express backend
- OpenAI Responses API
- Structured Outputs / JSON Schema
- The supplied `menu.json`
- Server-side API key protection

## Project structure

```text
bakery-chatbot/
├── api/
│   └── chat.js
├── public/
│   ├── app.js
│   ├── index.html
│   └── style.css
├── .env.example
├── .gitignore
├── menu.json
├── package.json
├── server.js
└── README.md
```

## 1. Install Node.js

Install a current Node.js LTS release.

Then open a terminal in this project directory.

## 2. Install dependencies

```bash
npm install
```

## 3. Add your OpenAI API key

Copy `.env.example` to `.env`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Then edit `.env`:

```text
OPENAI_API_KEY=your_real_key_here
OPENAI_MODEL=gpt-5.6-luna
PORT=3000
```

Never put the API key in `public/app.js` or any other browser file.

## 4. Start the website

```bash
npm start
```

Then open:

http://localhost:3000

## 5. Try the chatbot

Try:

> Hi, my name is Mary. I'd like two croissants and one sourdough.

Then try:

> Add two pretzels.

Then:

> Remove one croissant.

Then:

> Confirm my order.

The website displays the conversational response and a live order summary separately.

## Important menu behavior

The assistant is given the actual contents of `menu.json` on every request.

It knows:

- Country Sourdough — $7.50
- Butter Croissant — $4.25
- Sea Salt Soft Pretzel — $3.75
- Vanilla Bean Celebration Cake — $42.00
- Rosemary Olive Baguette — $5.50
- Cinnamon Morning Bun — $4.75
- Chocolate Cupcakes — $3.50, sold in fours
- Sesame Bagels — $2.25

The celebration cake says to order 3 days ahead, and the assistant preserves that menu requirement.

## Security

The OpenAI API call is made by `api/chat.js` on the server. The API key is read from `OPENAI_API_KEY` and is never sent to the browser.

For production, add authentication/rate limiting and server-side order storage before accepting real orders or payments.

## Deployment

This project is suitable for services that can run a Node.js server, such as Vercel, Render, Railway, or a Node-capable host.

If your current website is purely static, you can keep the existing static frontend and deploy only the `/api/chat` backend as a serverless function, with a small path adjustment to `app.js`.

## Notes

This demo does not process payments, reserve inventory, or send orders to a bakery POS. The Confirm button confirms the AI-generated order state in the browser only. Those operations should be added to a trusted backend before using this for real customer orders.

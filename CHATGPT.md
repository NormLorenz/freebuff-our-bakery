Discussion: https://chatgpt.com/c/6abd1ef7-76dc-83e8-9285-399f4d88d363

# Please build a complete working bakery chatbot project using the attached menu.json file and using OpenAI API.

I've built the complete project using your actual `menu.json`. The project includes the website, chat interface, order summary, OpenAI API backend, structured JSON output, and setup instructions.

Your supplied menu is used as the authoritative menu, including all 8 products and their prices/descriptions. menu menu menu

### Download the complete project

bakery-chatbot.zip[**Download the Bakery Chatbot project (.zip)**](sandbox:/mnt/data/bakery-chatbot.zip)

### What's inside

```text
bakery-chatbot/
│
├── api/
│   └── chat.js              ← OpenAI API backend
│
├── public/
│   ├── index.html            ← Website
│   ├── app.js                ← Chat/order JavaScript
│   └── style.css             ← Bakery website styling
│np
├── menu.json                 ← Your supplied menu
├── server.js                 ← Node.js web server
├── package.json              ← Dependencies
├── .env.example              ← API-key configuration
├── .gitignore
└── README.md                 ← Setup instructions
```

### How it works

```text
Customer
   ↓
Bakery Website
   ↓
/api/chat
   ↓
Node.js Server
   ↓
OpenAI Responses API
   ↓
Structured JSON
   ↓
Website
   ├── Chat response
   └── Order summary
```

I specifically used OpenAI's **Responses API** rather than the older Assistants API. OpenAI's current documentation says the Assistants API was sunset on August 26, 2026 and recommends the Responses API for new integrations. [OpenAI Platform](https://platform.openai.com/playground?assistant=asst_MLZgVy7CSjBGoFkwY9RmX9os\&mode=assistant\&utm_source=chatgpt.com)

The project also uses **Structured Outputs with JSON Schema**, so the application receives a predictable structure such as:

```json
{
  "customer_response": "...",
  "order": {
    "customer": {
      "first_name": "Mary"
    },
    "items": [],
    "order_total": 0,
    "status": "pending"
  }
}
```

This is preferable to simply asking the model to "please return JSON," because Structured Outputs is designed to make the response conform to the schema you provide. [OpenAI Developers](https://developers.openai.com/api/docs/guides/structured-outputs?utm_source=chatgpt.com)

### Getting it running

After downloading and extracting the ZIP:

**1. Open a terminal in the `bakery-chatbot` folder.**

**2. Install the packages:**

```bash
npm install
```

The project uses the official OpenAI JavaScript SDK. [OpenAI Developers](https://developers.openai.com/api/docs/libraries?utm_source=chatgpt.com)

**3. Create your `.env` file**

Copy:

```text
.env.example
```

to:

```text
.env
```

Then put your API key in it:

```text
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.6-luna
PORT=3000
```

The API key remains on the server; it is **not placed in your website JavaScript**.

**4. Start the website:**

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

### Try this conversation

Once it is running, type:

> Hi, my name is Mary.

Then:

> I'd like two butter croissants and one Country Sourdough.

Then:

> Add four chocolate cupcakes.

Then:

> Actually, remove one croissant.

Finally:

> Confirm my order.

The right-hand order panel will update as the conversation progresses.

The assistant also knows from your menu that the **Chocolate Cupcakes are sold in fours** and that the **Vanilla Bean Celebration Cake requires 3 days' advance ordering**. menu menu

### One important distinction

This version is a **working ordering-demo system**, but the Confirm button does not yet send an actual order to your bakery. It changes the order status to `"confirmed"` in the application.

The next logical step would be to connect that confirmation to something like:

```text
                    Customer
                       ↓
                 Bakery Chatbot
                       ↓
                  Order Review
                       ↓
                 CONFIRM ORDER
                       ↓
              ┌─────────────────┐
              │ Actual Order    │
              │ Database        │
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ Bakery Dashboard│
              └────────┬────────┘
                       ↓
                 New Order!
```

That would allow you to have a **real bakery order dashboard** showing customer name, order contents, totals, order time, and order status.

The current project is a good foundation for that because the order is already represented as structured data rather than just text.

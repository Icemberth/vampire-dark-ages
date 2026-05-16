# VDA Character Sheet OCR Service

This microservice is exclusively responsible for receiving a PDF file (a *Vampire: The Dark Ages* Character Sheet), sending it to the LLM (Google Gemini) for text extraction, and returning a strongly-typed JSON.

It is built with **FastAPI** and follows **SOLID** principles, ensuring that the JSON contract perfectly matches the frontend's database schema (Drizzle 1:1).

---

## 🚀 How to Run Locally

1. **Create a virtual environment and install dependencies:**
   ```bash
   cd ocr_service
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   Copy the example file and add your API key:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and make sure you have:
   ```env
   GOOGLE_API_KEY=your_key_here
   GEMINI_MODEL=gemini-1.5-flash  # Recommended for the free tier
   ```

3. **Start the server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

*(The interactive Swagger documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs))*

---

## 📡 API Contract (For Frontend Integration)

The only entry point to this microservice for external consumption is the processing endpoint.

### `POST /process-pdf`

Receives a `multipart/form-data` form containing the PDF file and returns the extracted JSON.

#### Request

*   **URL:** `http://localhost:8000/process-pdf`
*   **Method:** `POST`
*   **Content-Type:** `multipart/form-data`
*   **Body:**
    *   `file`: The binary file (PDF) to be processed.

#### Response (Success - 200 OK)

*   **Content-Type:** `application/json`
*   **Body:** The returned JSON is structured to map directly to the Drizzle tables (`attributes`, `abilities`, `advantages`).

```json
{
  "name": "Alaric of Tuscany",
  "attributes": {
    "strength": 3, "dexterity": 2, "stamina": 3,
    "charisma": 4, "manipulation": 3, "appearance": 2,
    "perception": 3, "intelligence": 2, "wits": 3
  },
  "abilities": {
    "alertness": 2, "athletics": 1, "awareness": 2,
    "brawl": 0, "empathy": 3, "expression": 1,
    "intimidation": 2, "leadership": 3, "streetwise": 0, "subterfuge": 2,
    "animalKen": 0, "archery": 1, "commerce": 2, "crafts": 0,
    "etiquette": 3, "herbalism": 0, "melee": 2, "ride": 1,
    "stealth": 0, "survival": 1,
    "academics": 3, "hearthWisdom": 1, "investigation": 2, "law": 2,
    "medicine": 1, "occult": 1, "politics": 3, "seneschal": 2,
    "theology": 2, "lingua": 1
  },
  "advantages": {
    "roadName": "Road of Humanity",
    "roadValue": 7,
    "willpower": 6,
    "conscience": 3,
    "selfControl": 3,
    "courage": 2
  }
}
```

*Note: Any illegible or missing values will be returned with their minimum valid default (e.g., 1 for attributes, 0 for abilities).*

#### Responses (Errors)

*   **`413 Payload Too Large`**: The PDF exceeds the maximum allowed size (10MB by default).
*   **`415 Unsupported Media Type`**: The uploaded file is not a PDF.
*   **`422 Unprocessable Entity`**: Gemini failed to return a valid JSON, or the structure did not comply with the strict schema rules (Pydantic validation).
*   **`500 Internal Server Error`**: Communication error with the Google Gemini API (e.g., quota exceeded).

---

## 🛠️ Integration Example (Next.js Server Action)

To consume this service from the Next.js frontend, you should use a **Server Action** to avoid exposing the microservice URL directly to the client.

```typescript
// app/actions/ocr.ts
'use server'

export async function processCharacterSheet(formData: FormData) {
  try {
    const ocrResponse = await fetch("http://localhost:8000/process-pdf", {
      method: "POST",
      body: formData, // Pass the FormData directly (must contain the "file" field)
    });

    if (!ocrResponse.ok) {
      const errorText = await ocrResponse.text();
      throw new Error(`OCR failed with status ${ocrResponse.status}: ${errorText}`);
    }

    const data = await ocrResponse.json();
    
    // 1. Validate the JSON here using Zod (Optional, but recommended)
    // 2. Insert into NeonDB using Drizzle
    // await db.insert(attributes).values({ characterId, ...data.attributes });
    // await db.insert(abilities).values({ characterId, ...data.abilities });
    // await db.insert(advantages).values({ characterId, ...data.advantages });

    return { success: true, data };
  } catch (error) {
    console.error("OCR Error:", error);
    return { success: false, error: error.message };
  }
}
```

---

## 🧪 Local Testing (Without HTTP Server)

If you wish to test PDF extraction directly via the console without running the FastAPI server, you can use the built-in test script. This will save the results in a local SQLite database (`local_db/results.db`):

```bash
# Process a specific file and save it to the local DB
python run_test.py path/to/character.pdf

# List historically processed results
python run_test.py --list

# Display the extracted JSON from a previous run
python run_test.py --show <id>
```

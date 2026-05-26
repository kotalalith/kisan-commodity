# 🌾 AgroBridge Secure REST API Server

This is a secure, lightweight **Node.js + Express** backend server that exposes your AgroBridge dashboard's Firestore data (`mandiPrices` collection) as a professional REST API. 

It is protected using **API Key Authentication**, allowing you to securely share your database data with other websites, mobile apps, or third-party developers without exposing your Firebase credentials!

---

## 🔑 Setup Instructions

### 1. Download your Firebase Service Account Key
To query Firestore securely from a backend server, you need a Service Account file:
1. Go to the **[Firebase Console](https://console.firebase.google.com/)**.
2. Click on the **Gear/Settings icon** next to "Project Overview" in the left sidebar, and select **Project settings**.
3. Go to the **Service accounts** tab at the top.
4. Click the blue **Generate new private key** button at the bottom.
5. Click **Generate key** to download the JSON file.
6. **Rename** the downloaded file to `serviceAccountKey.json`.
7. **Move / copy** this `serviceAccountKey.json` file directly into this `api-server/` folder.

> [!CAUTION]
> **Never commit or share your `serviceAccountKey.json` file publicly.** It contains full administrative access to your entire Firebase database. It is already added to `.gitignore` to prevent leaks.

---

### 2. Install Dependencies & Run the Server
Open a terminal in this `api-server` directory and run:

```bash
# Install required Node packages
npm install

# Run the server in development mode (auto-reloads on changes)
npm run dev
```

The server will start on port `5000` (or the port specified in `.env`).

---

## 📡 Exposing & Testing the API

Your server includes a built-in authorization middleware. Requests without a valid API key will receive a `401 Unauthorized` or `403 Forbidden` response.

### Authorized API Keys (defined in `.env`):
* `agro_secret_key_12345`
* `lalith_app_key_abcde`
* `external_website_key_xyz`

### 1. Public Health Check (No Key Required)
**Endpoint:** `GET http://localhost:5000/api/health`
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-05-20T13:00:00.000Z",
  "service": "AgroBridge REST API"
}
```

### 2. Fetch Mandi Prices (Protected)
**Endpoint:** `GET http://localhost:5000/api/mandi-prices`

#### Option A: Pass Key in Request Headers (Best Practice 🔐)
Send a request with the header `x-api-key` set to your key:
```bash
curl -H "x-api-key: agro_secret_key_12345" http://localhost:5000/api/mandi-prices
```

#### Option B: Pass Key in Query Parameters (Easiest for testing 🌐)
Open this directly in your browser or pass it as a URL parameter:
👉 `http://localhost:5000/api/mandi-prices?api_key=agro_secret_key_12345`

**Successful Response Format:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "doc_id_123",
      "commodity": "Rice",
      "marketName": "Madanapalle Mandi",
      "price": 2800,
      "variety": "Common",
      "addedBy": "+918008181429",
      "createdAt": "2026-05-20T12:00:00.000Z"
    }
  ]
}
```

---

## ⚙️ Customization
You can manage port configuration and API keys by editing the `.env` file:
* **Change the port:** Edit `PORT=5000`
* **Issue new keys:** Add new keys to `API_KEYS` (separated by commas). E.g. `API_KEYS=key1,key2,my_new_secret_key`

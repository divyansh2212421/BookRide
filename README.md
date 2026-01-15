
# RideWise - Production Mobility Engine

RideWise is a production-ready ride comparison engine for the Indian market, designed to help users find the best rates across Uber, Ola, and Rapido.

## 🚀 Deployment Guide (FREE)

### Frontend (Vercel)
1. Fork this repository.
2. Connect your GitHub to [Vercel](https://vercel.com).
3. Add the following **Environment Variables**:
   - `API_KEY`: Your Google Gemini API Key.
4. Deploy! Your app will be live at `https://your-project.vercel.app`.

### Backend (Render / Railway)
1. Create a new Web Service.
2. Select your repository.
3. Configure start command: `npm start` (if using Node) or `uvicorn main:app` (if using FastAPI).
4. Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `JWT_SECRET`: A secure string for session signing.

## 🔁 Booking & Redirection Logic

RideWise uses a **Secure Redirection Layer** to move users to official provider websites:
- **Uber:** Uses the official `m.uber.com` URL scheme with deep-linked coordinates.
- **Ola:** Uses `book.olacabs.com` with UTM tracking and pre-filled latitude/longitude.
- **Rapido:** Directs to the official brand page (Web-booking not yet publicly available).

## ⚖️ Disclaimer & Compliance
RideWise acts purely as an aggregator. We do not process payments or manage fleet operations. All transactions occur on the respective third-party provider platforms.

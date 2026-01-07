# 🚀 SkillX Platform

**SkillX** is a modern, full-stack **Talent Acquisition System** designed to bridge the gap between developers and recruiters.
Unlike traditional job boards, SkillX uses an automated **SkillX Score** algorithm to vet developers based on their real-world GitHub activity and provides **instant WhatsApp notifications** at every stage of the hiring process.

---

## 🌟 Key Features

### 👨‍💻 For Talent (Developers)

* **Multi-step Onboarding**
  Seamless profile creation including headline, bio, and skill selection.

* **GitHub Integration (SkillX Score)**
  Connect your GitHub account to automatically calculate a trust score based on:

  * Public repositories
  * Stars
  * Forks
  * Commit frequency

* **LinkedIn Connection**
  Link your professional profile for better recruiter visibility.

* **Real-time Alerts**
  Receive WhatsApp notifications when:

  * Your profile is approved
  * A recruiter sends a hire request

---

### 🧑‍💼 For Recruiters (Clients)

* **Talent Discovery**
  Browse a vetted list of developers with advanced filtering by:

  * SkillX Score
  * Technology stack

* **Favorite System**
  Save top talent to your favorites for quick access.

* **Direct Hire Requests**
  Send formal hire requests including:

  * Job title
  * Salary
  * Job description

---

### 🛡️ For Admin

* **Profile Review Dashboard**
  Review, approve, or reject new talent submissions.

* **Automated Workflow**
  Profile approval/rejection triggers instant WhatsApp updates via **Twilio**.

---

## 🛠 Tech Stack

### Frontend

* Next.js 14 (App Router)
* React
* Tailwind CSS
* Shadcn/UI
* Lucide Icons

### Backend

* Node.js
* Express.js
* Passport.js (OAuth 2.0)

### Database

* MongoDB
* Mongoose

### Authentication

* JWT (JSON Web Tokens)
* GitHub OAuth
* LinkedIn OAuth

### Notifications

* Twilio API (WhatsApp Business API)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Arshad4786/SkillX.
cd SkillX.
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Environment Variables

Create a `.env` file in the root directory and add the following:

```env
# Server Config
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

# OAuth Config
GITHUB_CLIENT_ID=your_github_id
GITHUB_CLIENT_SECRET=your_github_secret
LINKEDIN_CLIENT_ID=your_linkedin_id
LINKEDIN_CLIENT_SECRET=your_linkedin_secret

# Twilio Config
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
ADMIN_WHATSAPP_NUMBER=your_number_with_country_code
```

---

## 🚀 Running the Project

Since the project contains **both backend and frontend**, run them in **two separate terminals**.

### Terminal 1: Backend Server (Port 5000)

```bash
npm run dev
```

This runs `nodemon server.js` as configured in `package.json`.

---

### Terminal 2: Frontend UI (Port 3000)

```bash
npx next dev -p 3000
```

---

## 📊 SkillX Score Algorithm

The **SkillX Score** is normalized on a scale of **0–100** and is calculated using:

* **Commit Frequency** – Recent activity in the last 12 months
* **Popularity** – Total stars and forks across all public repositories
* **Consistency** – Number of public repositories

This provides recruiters with an instant and reliable metric of a developer’s technical impact.

---

## 📂 Project Structure

```
├── app/                # Next.js Frontend (App Router)
├── components/         # Reusable UI Components
├── lib/                # Frontend API wrappers & utilities
├── models/             # Mongoose Schemas (User, Talent, Client, HireRequest)
├── routes/             # Express API Endpoints (Auth, Talent, Admin, Client)
├── services/           # Backend Services (Twilio Notifications)
├── middleware/         # Auth & Role-based Access Control
└── server.js           # Express Entry Point
```

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch

   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes

   ```bash
   git commit -m "Add some AmazingFeature"
   ```
4. Push to the branch

   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**.
See the `LICENSE` file for more information.

# Aura.Ai - Tech Career & Mentorship SaaS

Aura.Ai is a comprehensive career guidance and mentorship platform. It provides dynamic AI-driven assessments, personalized learning roadmaps, and a seamless marketplace for students to book 1-on-1 mentorship sessions.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 18)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
- **Authentication**: [Clerk](https://clerk.dev/)
- **Payments**: [Razorpay](https://razorpay.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Notifications**: [Brevo](https://www.brevo.com/) (Emails) & Telegram Bot API

---

## 💻 Running Locally on Your System

### 1. Prerequisites
Ensure you have the following installed and set up before proceeding:
- **Node.js**: v18.17.0 or higher
- **MongoDB**: A free MongoDB Atlas cluster URI (or local MongoDB).
- **Clerk Account**: For managing user authentication.
- **Razorpay Account**: To generate Test API Keys for the checkout flow.

### 2. Clone the Repository
```bash
git clone https://github.com/SinghCod3r/Aura.Ai.git
cd Aura.Ai
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
Create a file named `.env.local` in the root of your project by copying the example file:
```bash
cp .env.example .env.local
```

Inside `.env.local`, you must populate the following critical keys:

```env
# MongoDB Connection
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/aura_ai?retryWrites=true&w=majority"

# Clerk Authentication (Get these from your Clerk Dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Clerk Webhook Secret (Needed to sync Clerk Users to MongoDB automatically)
CLERK_WEBHOOK_SECRET=whsec_...

# Razorpay Payments (Test Mode Keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET="..." # Create a secret for testing local webhooks or skip if not utilizing ngrok

# Admin Overrides
NEXT_PUBLIC_ADMIN_EMAIL="your-email@example.com"
```

### 5. Run the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔑 Role Management & Testing

Aura.Ai uses a robust role-based access control system (`STUDENT` -> `MENTOR` -> `ADMIN` -> `SUPER_ADMIN`).

### Testing as a Student:
1. Simply sign up via Clerk on `http://localhost:3000/sign-up`.
2. You will be redirected to the Student Dashboard, complete with up-coming sessions and roadmap data.

### Testing as a Mentor:
1. While logged in as a Student, navigate to `http://localhost:3000/become-mentor`.
2. Submit the form. This will update your internal MongoDB profile role to `MENTOR`.
3. You will immediately see the Mentor Dashboard view (Earnings tracking, Schedule).

### Testing as an Admin/Super Admin:
1. To elevate an account to `SUPER_ADMIN`, you must manually edit the MongoDB database:
   - Go to MongoDB Atlas -> Browse Collections -> `users`.
   - Find your user document and update the `role` field from `"STUDENT"` to `"SUPER_ADMIN"`.
2. As a `SUPER_ADMIN`, your Dashboard will display platform-wide analytics and a feed of pending Mentor applications requiring your approval.

---

## 📂 Key Architecture Directories
- `src/app/api`: Serverless route handlers (Bookings, Webhooks, AI Assessments).
- `src/models`: Mongoose database schemas (`User`, `MentorProfile`, `Booking`, etc).
- `src/components`: Reusable UI elements, powered heavily by Shadcn and Framer Motion context if utilized.
- `src/lib`: Core utility singletons (Mongoose connection, Razorpay instance, Brevo email transport).

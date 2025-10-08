# AI-resume-review

A web application that analyzes and scores resumes using the **Gemini API**.  
Users can paste their resume text, and the system will evaluate how well the resume is written and whether it matches professional standards.

<img width="200" height="400" alt="image" src="https://github.com/user-attachments/assets/29611273-9e21-40e9-8b3f-e88050974d1c" />

---

## 🚀 Tech Stack

- **Frontend Framework:** [Vite 5](https://vitejs.dev/)
- **Runtime:** Node.js 18.2  
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com/)
- **AI Integration:** [Gemini API](https://ai.google.dev/)
- **Deployment:** [Vercel](https://vercel.com/)

---

## 🧠 How It Works

1. The user pastes their resume text into the interface.  
2. The app sends this text to the **Gemini API**.  
3. The AI analyzes the resume and returns an evaluation — highlighting strengths, weaknesses, and possible improvements.  
4. The system displays a clear result, showing whether the resume is strong or needs improvement.

---

## 🛠️ Project Setup

### Clone the repository
```bash
git clone https://github.com/erickyfigueiredo/AI-resume-review.git
cd AI-resume-review
```

### Install dependencies
```bash
npm install
```

### Set environment variables
Create a .env file in the root directory with your Gemini API key or in vercel
```bash
GEMINI_API_KEY=your_api_key_here
```
### Run the development server
```bash
npm run dev

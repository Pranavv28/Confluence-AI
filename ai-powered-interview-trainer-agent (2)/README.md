# 🤖 AI Interview Trainer Agent

> **IBM SkillsBuild × AICTE 2026 — Problem Statement 22**

An AI-powered Interview Trainer Agent built on **IBM Granite** and **IBM Watsonx.ai** that conducts mock interviews, evaluates answers in real-time, and provides personalized feedback using RAG (Retrieval-Augmented Generation).

---

## 👤 Student Details

| Field | Details |
|-------|---------|
| **Name** | Pranav Lakhe |
| **Institute** | Symbiosis Institute of Technology, Nagpur |
| **Program** | IBM SkillsBuild × AICTE 2026 Internship |
| **Problem Statement** | PS22 — Interview Trainer Agent |
| **AICTE Student ID** | STU6995ccb089af01771424944 |
| **Internship ID** | INTERNSHIP_177549002069d3d3e4f3903 |
| **Duration** | 15 May 2026 – 15 June 2026 |

---

## 🎯 Problem Statement

Job seekers and students face a critical gap in interview preparation. Existing tools provide **generic, one-size-fits-all questions** without considering the candidate's specific role, experience level, or domain. More critically, they **lack real-time answer evaluation** — leaving candidates without feedback on response quality. This results in poor interview performance, missed opportunities, and low confidence in competitive hiring.

---

## 💡 Solution

An agentic AI system that:

1. **Generates tailored questions** — 3 technical + 2 behavioral questions specific to the user's job role, experience, and domain
2. **Evaluates answers in real-time** — scores each answer out of 10, identifies strengths and gaps, provides an improved model answer
3. **Retrieves from knowledge base** — uses RAG to ground questions in a curated interview Q&A corpus
4. **Maintains conversation memory** — tracks progress across a full 5-question mock interview session
5. **Adapts follow-up questions** — adjusts difficulty based on previous answers

---

## 🏗️ Architecture

```
User Input (Role + Experience + Domain)
        ↓
Prompt Template Builder
        ↓
RAG Retrieval (Chroma Vector Store ← Interview Corpus)
        ↓
IBM Granite (ibm/granite-3-8b-instruct) on Watsonx.ai
        ↓
Structured Output (Questions / Evaluation / Model Answers)
        ↓
Conversation Memory → Next Turn
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **AI Model** | IBM Granite (`ibm/granite-3-8b-instruct`) |
| **AI Platform** | IBM Watsonx.ai |
| **Cloud** | IBM Cloud (us-south / Dallas) |
| **SDK** | `ibm-watsonx-ai` Python SDK |
| **RAG** | Chroma Vector Store + Sentence Transformers |
| **Language** | Python 3.12 |
| **Notebook** | IBM Watsonx Jupyter Environment |

---

## 📁 Repository Structure

```
Interview-Trainer-Agent/
├── README.md                    # This file
├── app.json                     # App metadata for submission
├── requirements.txt             # Python dependencies
├── .gitignore                   # Git ignore rules
├── interview_trainer.py         # Main agent script (run locally)
├── interview_trainer.ipynb      # Jupyter notebook (run on Watsonx.ai)
├── corpus/
│   └── interview_corpus.txt     # RAG knowledge base (Q&A corpus)
└── screenshots/                 # Demo screenshots
```

---

## 🚀 Getting Started

### Option 1: Run on IBM Watsonx.ai (Recommended)

1. Open [watsonx.ai](https://dataplatform.cloud.ibm.com)
2. Go to your project → **New Asset** → **Jupyter Notebook**
3. Upload `interview_trainer.ipynb`
4. Replace `YOUR_API_KEY_HERE` with your IBM Cloud API key
5. Run all cells top to bottom

### Option 2: Run Locally

**Prerequisites:** Python 3.10+, IBM Cloud account with Watsonx.ai

```bash
# Clone the repository
git clone https://github.com/Pranavv28/Interview-Trainer-Agent.git
cd Interview-Trainer-Agent

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export WATSONX_API_KEY="your-api-key-here"
export WATSONX_PROJECT_ID="your-project-id-here"

# Run the agent
python interview_trainer.py
```

---

## 🎮 How to Use

### Starting an Interview Session

```
Enter target job role: Python Developer
Experience level: Fresher
Domain: Backend
```

The agent generates 5 questions:

```
🎯 Interview Session for Python Developer | Fresher | Backend

TECHNICAL QUESTIONS:
1. What is the difference between a list and a tuple in Python?
   💡 What the interviewer wants: mutability, use cases, performance

2. Explain decorators in Python with an example.
   💡 What the interviewer wants: first-class functions, syntax, practical use

...

▶️ Please answer Question 1 above.
```

### Answering and Getting Evaluated

```
You: A list is mutable, meaning you can change its elements after creation.
     A tuple is immutable, so once created it cannot be changed.

Trainer:
📊 EVALUATION
✅ Score: 7/10
💪 Strengths:
• Correctly identified the core difference (mutability)
• Clear, concise explanation
⚠️ What Was Missing:
• No mention of performance (tuples are faster)
• No use case examples (tuples for fixed data like coordinates)
📝 Improved Answer:
A list is mutable (can be modified after creation) while a tuple is immutable.
Tuples are faster and use less memory than lists. Use lists for dynamic data
that changes, and tuples for fixed collections like coordinates (x, y) or
RGB values where data should not change.

2. Explain decorators in Python with an example.
```

---

## 🔑 Key Features

| Feature | Description |
|---------|-------------|
| **Personalization** | Questions tailored to role, experience, and domain |
| **Real-time Evaluation** | Score + feedback + model answer after every response |
| **RAG Grounding** | Questions retrieved from curated interview knowledge base |
| **STAR Format** | Behavioral questions follow Situation-Task-Action-Result structure |
| **Memory** | Full conversation history maintained across session |
| **Cloud-Native** | Runs entirely on IBM Watsonx.ai — no local setup needed |

---

## 📊 Sample Output

**Input Profile:** Data Analyst | Fresher | Analytics

**Generated Questions Include:**
- Technical: SQL JOINs, difference between mean/median, normalization
- Behavioral: STAR-format past experience, handling ambiguous data
- HR: Career goals, handling pressure, why this role

**Evaluation Example:**
- Answer scored 6/10
- Identified missing keyword: "statistical significance"
- Provided improved STAR-format answer
- Asked follow-up question based on gap

---

## 🔮 Future Scope

1. **Resume Parsing** — Auto-extract role and skills from uploaded CV
2. **Voice Interview Mode** — Speech-to-text input + text-to-speech output
3. **Company-Specific Questions** — Pull from company interview databases
4. **Performance Dashboard** — Track scores across multiple sessions
5. **Multi-Language Support** — Interview prep in Hindi, Marathi, and other regional languages

---

## 📋 Submission Checklist

- [x] `app.json` — App metadata
- [x] `interview_trainer.py` — Main Python script
- [x] `interview_trainer.ipynb` — Jupyter notebook
- [x] `corpus/interview_corpus.txt` — RAG knowledge base
- [x] `requirements.txt` — Dependencies
- [x] `README.md` — Documentation
- [ ] `PS22_Interview_Trainer_Agent.pdf` — Problem statement PDF
- [ ] `presentation.pptx` — Project presentation

---

## 🏷️ Tags

`IBM-Granite` `Watsonx-AI` `IBM-Cloud` `Agentic-AI` `RAG` `Interview-Prep` `Python` `IBM-SkillsBuild` `AICTE-2026` `NLP` `Generative-AI`

---

## 📄 License

MIT License — Free to use for educational purposes.

---

*Built with ❤️ using IBM Granite on Watsonx.ai | IBM SkillsBuild × AICTE 2026*

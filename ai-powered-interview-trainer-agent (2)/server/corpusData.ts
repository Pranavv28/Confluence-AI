export interface KnowledgeSection {
  title: string;
  category: string;
  items: {
    question: string;
    answer: string;
    keywords: string[];
  }[];
}

export const INITIAL_CORPUS: KnowledgeSection[] = [
  {
    title: 'SECTION 1: SOFTWARE DEVELOPMENT / SDE',
    category: 'Backend',
    items: [
      {
        question: 'What is the difference between a stack and a queue?',
        answer: 'A stack follows LIFO (Last In First Out) - like a pile of plates. A queue follows FIFO (First In First Out) - like a line at a store. Stack operations: push (add to top), pop (remove from top). Queue operations: enqueue (add to back), dequeue (remove from front). Stacks are used in function call management, undo operations. Queues are used in process scheduling, print spoolers.',
        keywords: ['LIFO', 'FIFO', 'stack', 'queue', 'data structures', 'pop', 'push']
      },
      {
        question: 'Explain the four pillars of Object-Oriented Programming.',
        answer: 'OOP has four pillars: (1) Encapsulation - bundling data and methods within a class. (2) Inheritance - child class inherits from parent, enabling code reuse. (3) Polymorphism - same interface, different implementations. (4) Abstraction - hiding complex details, showing only necessary features.',
        keywords: ['OOP', 'encapsulation', 'inheritance', 'polymorphism', 'abstraction', 'classes', 'methods']
      },
      {
        question: 'What is time complexity and Big O notation?',
        answer: 'Time complexity measures how runtime grows as input size increases. Big O notation describes worst-case scenario. O(1) constant, O(log n) logarithmic, O(n) linear, O(n^2) quadratic. Binary search is O(log n), linear search is O(n).',
        keywords: ['time complexity', 'Big O', 'algorithm', 'optimization', 'logarithmic', 'linear', 'quadratic']
      },
      {
        question: 'What is a REST API?',
        answer: 'REST is an architectural style for web services. Uses HTTP methods: GET (retrieve), POST (create), PUT (update), DELETE (remove). Stateless, client-server architecture. Uses JSON for data exchange. URLs identify resources.',
        keywords: ['REST', 'API', 'HTTP', 'stateless', 'JSON', 'endpoints', 'methods']
      },
      {
        question: 'Explain recursion with an example.',
        answer: 'Recursion is when a function calls itself to solve smaller subproblems. Needs a base case to stop. Example: factorial(n) = n * factorial(n-1), base case factorial(0) = 1. Risk: stack overflow if base case missing.',
        keywords: ['recursion', 'base case', 'stack overflow', 'divide and conquer', 'call stack']
      },
      {
        question: 'What is the difference between == and === in JavaScript?',
        answer: '== (loose equality) compares values after type coercion. === (strict equality) compares value AND type. Best practice: always use === to avoid unexpected bugs.',
        keywords: ['JavaScript', 'equality', 'type coercion', 'strict equality', 'types']
      }
    ]
  },
  {
    title: 'SECTION 2: DATA ANALYST & MACHINE LEARNING',
    category: 'Data / Analytics',
    items: [
      {
        question: 'What is the difference between supervised and unsupervised learning?',
        answer: 'Supervised learning uses labeled data - classification (spam/not spam) and regression (price prediction). Unsupervised finds patterns in unlabeled data - clustering, dimensionality reduction.',
        keywords: ['supervised', 'unsupervised', 'classification', 'regression', 'clustering', 'labeled data']
      },
      {
        question: 'What is the difference between mean, median, and mode?',
        answer: 'Mean is the average - sensitive to outliers. Median is the middle value - robust to outliers. Mode is most frequent. For salary data with extreme values, median is more representative.',
        keywords: ['mean', 'median', 'mode', 'statistics', 'outliers', 'central tendency', 'distribution']
      },
      {
        question: 'What are SQL JOINs?',
        answer: 'JOINs combine rows from two tables. INNER JOIN returns matching rows in both. LEFT JOIN returns all rows from left + matching from right. RIGHT JOIN is opposite. FULL OUTER JOIN returns all rows from both tables.',
        keywords: ['SQL', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'database', 'query', 'relational']
      },
      {
        question: 'What is data normalization?',
        answer: 'Normalization scales features to a standard range. Min-Max scales to [0,1]. Z-score standardization gives mean=0, std=1. Important for distance-based algorithms like KNN, SVM, neural networks.',
        keywords: ['normalization', 'standardization', 'preprocessing', 'feature scaling', 'min-max', 'z-score']
      }
    ]
  },
  {
    title: 'SECTION 3: BEHAVIORAL QUESTIONS (STAR FORMAT)',
    category: 'Behavioral',
    items: [
      {
        question: 'Tell me about a time you faced a difficult technical problem.',
        answer: 'Situation - During my MARL project, the model was converging slowly. Task - Improve training efficiency by 30% before deadline. Action - Researched reward function design, implemented hybrid reward, tuned hyperparameters systematically. Result - Achieved 25% reduction in mean waiting time compared to fixed-phase baseline.',
        keywords: ['STAR', 'problem solving', 'technical challenge', 'debugging', 'situation', 'task', 'action', 'result']
      },
      {
        question: 'Where do you see yourself in 5 years?',
        answer: 'Growing into a senior engineer role, designing system architectures and mentoring juniors. Deepening expertise in AI and cloud technologies. This internship is a key step toward that foundation.',
        keywords: ['career goals', 'growth', 'long-term vision', 'leadership', 'architecture', 'mentoring']
      },
      {
        question: 'Tell me about a time you worked in a team.',
        answer: 'Situation - Group project building a DBMS under tight deadline. Task - Backend development and team coordination. Action - Initiated daily standups, created task tracker, documented API contracts, helped teammate with normalization. Result - Submitted on time, received highest grade in class.',
        keywords: ['teamwork', 'collaboration', 'communication', 'coordination', 'standup', 'conflict resolution']
      },
      {
        question: 'What is your greatest weakness?',
        answer: 'I tend to over-engineer solutions. I am actively working on this by setting time-boxed milestones, following done-is-better-than-perfect principle, and getting early feedback before refining.',
        keywords: ['self-awareness', 'growth mindset', 'improvement', 'honest', 'weakness', 'time-boxing']
      }
    ]
  },
  {
    title: 'SECTION 4: HR & CULTURE FIT QUESTIONS',
    category: 'HR',
    items: [
      {
        question: 'Why should we hire you?',
        answer: 'Strong technical foundation, proven project execution (MARL traffic optimization system), fast learner who picks up new tools quickly (Langflow, IBM Watsonx, Gemini API), and takes full ownership of work end-to-end.',
        keywords: ['value proposition', 'strengths', 'ownership', 'motivation', 'fast learner', 'culture fit']
      },
      {
        question: 'How do you handle pressure and tight deadlines?',
        answer: 'Prioritize tasks by impact and urgency. Break large tasks into milestones. Set internal deadlines earlier than actual. Communicate proactively if timelines are at risk. During semester exams (4 subjects in 10 days), created a strict study schedule and followed it.',
        keywords: ['time management', 'prioritization', 'communication', 'planning', 'stress management', 'deadlines']
      },
      {
        question: 'How do you stay updated with technology?',
        answer: 'Follow tech blogs (Towards Data Science, dev.to), YouTube tutorials, GitHub trending repos, newsletters. Work on side projects and internships to apply learning. Currently exploring Agentic AI, LLM systems, Python SDKs.',
        keywords: ['continuous learning', 'self-improvement', 'curiosity', 'upskilling', 'blogs', 'side projects']
      }
    ]
  },
  {
    title: 'SECTION 5: FRESHER / ENTRY LEVEL & AGENTIC AI',
    category: 'AI / Machine Learning',
    items: [
      {
        question: 'What projects have you worked on?',
        answer: 'Built a Multi-Agent Reinforcement Learning system for traffic signal optimization using Python. Achieved 25% reduction in mean waiting time and 47% reduction in accumulated waiting time vs fixed-phase baseline. Currently building an AI Interview Trainer Agent using Agentic AI workflows.',
        keywords: ['projects', 'portfolio', 'technical skills', 'results', 'reinforcement learning', 'MARL', 'metrics']
      },
      {
        question: 'What do you know about Agentic AI?',
        answer: 'Agentic AI refers to AI systems that can autonomously take actions, use tools, and make decisions to achieve goals. Unlike simple chatbots, agents can reason step by step (ReAct pattern), retrieve information (RAG), maintain memory across turns, and adapt behavior based on context.',
        keywords: ['agentic AI', 'autonomous', 'ReAct', 'tools', 'memory', 'RAG', 'reasoning', 'decision making']
      }
    ]
  }
];

export function retrieveRAGContext(role: string, domain: string, experience: string, maxChars = 2500): string {
  const queryTokens = `${role} ${domain} ${experience} technical behavioral hr interview`.toLowerCase().split(/\s+/).filter(Boolean);
  
  const scoredItems: { item: typeof INITIAL_CORPUS[0]['items'][0]; section: string; score: number }[] = [];

  for (const section of INITIAL_CORPUS) {
    for (const item of section.items) {
      let score = 0;
      const combinedText = `${item.question} ${item.answer} ${item.keywords.join(' ')} ${section.category}`.toLowerCase();
      
      for (const token of queryTokens) {
        if (combinedText.includes(token)) {
          score += 2;
        }
        for (const kw of item.keywords) {
          if (kw.toLowerCase().includes(token) || token.includes(kw.toLowerCase())) {
            score += 3;
          }
        }
      }

      // Always give some baseline weight to behavioral and HR questions for holistic interview coverage
      if (section.title.includes('BEHAVIORAL') || section.title.includes('HR')) {
        score += 1;
      }

      if (score > 0) {
        scoredItems.push({ item, section: section.title, score });
      }
    }
  }

  scoredItems.sort((a, b) => b.score - a.score);
  const selected = scoredItems.slice(0, 6);

  if (selected.length === 0) {
    return INITIAL_CORPUS.map(s => `[${s.title}]\n` + s.items.slice(0, 2).map(i => `Q: ${i.question}\nA: ${i.answer}`).join('\n\n')).join('\n\n').slice(0, maxChars);
  }

  return selected.map(s => `[${s.section}]\nQ: ${s.item.question}\nModel Answer: ${s.item.answer}\nKeywords: ${s.item.keywords.join(', ')}`).join('\n\n').slice(0, maxChars);
}

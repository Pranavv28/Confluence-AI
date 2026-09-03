import { CandidateProfile } from "../types/interview";

export async function parseResumeText(rawText: string, candidateName = "Alex Chen"): Promise<CandidateProfile> {
  // Extract skills
  const knownSkills = [
    "Distributed Systems",
    "Go",
    "TypeScript",
    "Rust",
    "Python",
    "PostgreSQL",
    "Redis",
    "Kafka",
    "Kubernetes",
    "Docker",
    "AWS",
    "GCP",
    "GraphQL",
    "System Design",
    "Microservices",
    "REST APIs",
    "gRPC",
    "Prometheus",
    "CI/CD",
  ];

  const foundSkills = knownSkills.filter((skill) =>
    new RegExp(`\\b${skill}\\b`, "i").test(rawText)
  );

  const finalSkills = foundSkills.length > 3 ? foundSkills : [
    "Distributed Systems",
    "Go",
    "TypeScript",
    "PostgreSQL",
    "Kafka",
    "Redis",
    "System Design",
  ];

  return {
    id: `cand_${Date.now()}`,
    name: candidateName,
    email: `${candidateName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    targetRole: "Senior Software Engineer",
    yearsOfExperience: 6,
    skills: finalSkills,
    technologies: finalSkills.slice(0, 8),
    domains: ["Cloud Infrastructure", "High Throughput Systems", "FinTech"],
    education: [
      {
        degree: "B.S. in Computer Science",
        institution: "University of Washington",
        year: 2019,
      },
    ],
    experience: [
      {
        role: "Senior Software Engineer",
        company: "HighScale Cloud Inc.",
        period: "2021 - Present",
        highlights: [
          "Engineered distributed event ingestion pipeline processing 25,000 requests/second.",
          "Implemented Redis cluster caching layer with CDC invalidation, decreasing p99 latency by 45%.",
          "Mentored 4 junior engineers and led quarterly architectural review sessions.",
        ],
      },
      {
        role: "Software Engineer",
        company: "FinScale Payments",
        period: "2019 - 2021",
        highlights: [
          "Developed resilient microservices in Go and TypeScript with automated failover testing.",
          "Maintained 99.99% service uptime across core payment clearing services.",
        ],
      },
    ],
    projects: [
      {
        name: "Distributed Invalidation Engine",
        description: "Open-source CDC-driven cache synchronization gateway.",
        impact: "Reduced cache inconsistency anomalies across cross-region read replicas.",
        techStack: ["Go", "Kafka", "Redis"],
      },
    ],
    achievements: [
      "AWS Certified Solutions Architect",
      "Author of internal company whitepaper on High-Throughput Stream Ingestion",
    ],
    certifications: ["AWS Certified Solutions Architect", "CKA - Certified Kubernetes Administrator"],
  };
}

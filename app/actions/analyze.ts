"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractText } from "unpdf";
import { withRetry } from "@/lib/ai-utils";

// Function to extract text from PDF using unpdf (Vercel-safe)
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const { text } = await extractText(new Uint8Array(buffer));
  // unpdf returns an array of strings (one per page)
  return Array.isArray(text) ? text.join("\n") : (text || "");
}

export type AnalysisResult = {
  score: number;
  issueCount: number; // For Enhancv-style "Issues Found" badge
  categories: {
    contact: CategoryResult;
    sections: CategoryResult;
    skills: CategoryResult;
    content: CategoryResult;
    format: CategoryResult;
  };
  summary: string;
  executiveSummary: {
    overview: string;      // Bulleted insights
    roadmap: RoadmapPhase[]; // Structured 3-phase plan
    atsVerdict: string;    // Bulleted verdict
    diagnostics: {         // 5-point systems diagnostic
      structure: DiagnosticState;
      encoding: DiagnosticState;
      keywords: DiagnosticState;
      metrics: DiagnosticState;
      activeVoice: DiagnosticState;
    };
  };
  weaknesses: string[];      // New: Identified gaps
  interviewQuestions: string[]; // New: Preparation intelligence
  isNeural: boolean;          // New: Indicates if AI was successfully used
  rawText: string;
  success?: boolean;          // Indicates if the overall process succeeded
  error?: string;             // Specific error message for UI unmasking
};

export type DiagnosticState = "pass" | "fail" | "partial";

export type RoadmapPhase = {
  phase: string;
  title: string;
  items: string[];
};

type CategoryResult = {
  score: number;
  title: string;
  bentoSummary: string;  // Combined Strength + Critical Fix
  strengths: string[];
  improvements: string[];
  missing: string[];
  status: "success" | "warning" | "error";
};

const ACTION_VERBS = [
  "managed", "developed", "spearheaded", "lead", "created",
  "designed", "implemented", "optimized", "increased", "decreased",
  "saved", "launched", "coordinated", "collaborated"
];

const ESSENTIAL_SECTIONS = [
  "experience", "education", "skills", "projects", "summary", "objective"
];

export async function analyzeResume(formData: FormData): Promise<AnalysisResult> {
  try {
    const file = formData.get("resume") as File;
    const jobDescription = formData.get("jobDescription") as string || "";
    if (!file) {
      return { success: false, error: "No file uploaded", score: 0, issueCount: 0, categories: {} as any, summary: "", executiveSummary: {} as any, weaknesses: [], interviewQuestions: [], isNeural: false, rawText: "" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let text = "";
    try {
      text = await extractTextFromPDF(buffer);
      if (!text || text.trim().length === 0) {
        return { success: false, error: "Parser delivered empty data. The PDF might be password-protected.", score: 0, issueCount: 0, categories: {} as any, summary: "", executiveSummary: {} as any, weaknesses: [], interviewQuestions: [], isNeural: false, rawText: "" };
      }
    } catch (parseErr: unknown) {
      const error = parseErr as Error;
      console.error("PDF Parsing Failure:", error);
      return { success: false, error: `PARSER_FAILURE: ${error.message}`, score: 0, issueCount: 0, categories: {} as any, summary: "", executiveSummary: {} as any, weaknesses: [], interviewQuestions: [], isNeural: false, rawText: "" };
    }

    const textLower = text.toLowerCase();

    // Check for API Key
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
          Act as a Senior Career Success Coach and Resume Expert. 
          Your goal is to provide a clear, professional, and actionable audit of the user's resume. 
          
          THE GUIDELINES:
          - Use clear, professional, and encouraging language. Avoid overly technical jargon.
          - Identify exactly where the user can improve for a better chance of getting hired.
          - Quantification: Make sure they understand that adding numbers (%, $, scale) is vital.
          - Active Voice: Explain that starting sentences with strong action verbs (e.g., 'Led', 'Built') is better than 'Responsible for'.
          - Structure: Ensure the resume is easy to read for both humans and computers.

          Resume Text:
          """
          ${text}
          """
          
          Target Job Description (Optional context):
          """
          ${jobDescription}
          """
          
          Provide a professional audit in exactly this JSON format.
          Ensure every "bentoSummary" is 2-3 clear, helpful sentences.
          
          {
            "score": <Calculated score 0-100>,
            "issueCount": <Total number of things to improve>,
            "summary": "<A balanced, clinical, and data-driven summary of the resume's alignment with high-tier industry standards.>",
            "executiveSummary": {
              "overview": "<3-5 hyper-specific technical insights. Focus on 'Signal Density' and how their specific stack matches or fails to match the target JD.>",
              "roadmap": [
                { "phase": "Phase 01", "title": "Surgical Fixes", "items": ["3-5 non-generic, immediate technical changes to specific lines to align with the JD."] },
                { "phase": "Phase 02", "title": "Narrative Expansion", "items": ["3-5 ways to rewrite project bullets to better demonstrate the 'Senior Signal' or 'Technical Ownership' the JD demands."] },
                { "phase": "Phase 03", "title": "Strategic Branding", "items": ["3-5 high-level changes to bridge the specific gap between their current profile and the target role's seniority."] }
              ],
              "atsVerdict": "<A cold, clinical explanation of how an enterprise ATS will weight this specific resume against the JD requirements (3-5 sentences).>",
              "diagnostics": {
                "structure": "pass | fail | partial",
                "encoding": "pass | fail | partial",
                "keywords": "pass | fail | partial",
                "metrics": "pass | fail | partial",
                "activeVoice": "pass | fail | partial"
              }
            },
            "categories": {
              "contact": { "title": "Contact Details", "score": <0-100>, "bentoSummary": "", "strengths": [], "improvements": [], "missing": [], "status": "success|warning|error" },
              "sections": { "title": "Organization", "score": <0-100>, "bentoSummary": "", "strengths": [], "improvements": [], "missing": [], "status": "success|warning|error" },
              "skills": { "title": "Skills & Keywords", "score": <0-100>, "bentoSummary": "", "strengths": [], "improvements": [], "missing": [], "status": "success|warning|error" },
              "content": { "title": "Work Impact", "score": <0-100>, "bentoSummary": "", "strengths": [], "improvements": [], "missing": [], "status": "success|warning|error" },
              "format": { "title": "Visual Layout", "score": <0-100>, "bentoSummary": "", "strengths": [], "improvements": [], "missing": [], "status": "success|warning|error" }
            },
            "weaknesses": ["10-15 SURGICAL weaknesses. Pinpoint exact technical mismatches, missing niche skills mentioned in the JD, and project-level narrative failures. EVERY POINT MUST BE TIED TO A SPECIFIC LINE OR LACK THEREOF IN THE RESUME. No general career advice. No fluff."],
            "interviewQuestions": ["20 HYPER-SPECIFIC, BRUTAL interview questions. These MUST NOT be generic. They must be derived from the specific intersection of the candidate's actual projects, their technical choices (as stated in their resume), and the explicit requirements/challenges of the target Job Description. Focus on 'How' and 'Why' questions about their specific past work and how it translates to the new role. If no JD is provided, base it on the candidate's most senior-level technical claims."]
          }
          
          CRITICAL INSTRUCTIONS:
          1. Be helpful and direct. 
          2. Focus on clear improvements.
          3. Return ONLY raw JSON code.
        `;

        const result = await withRetry(() => model.generateContent(prompt));
        const response = await result.response;
        const aiText = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(aiText);

        // --- Normalization Layer ---
        if (parsed.executiveSummary) {
          if (Array.isArray(parsed.executiveSummary.overview)) {
            parsed.executiveSummary.overview = parsed.executiveSummary.overview.join("\n");
          }
          if (Array.isArray(parsed.executiveSummary.atsVerdict)) {
            parsed.executiveSummary.atsVerdict = parsed.executiveSummary.atsVerdict.join("\n");
          }
          if (!parsed.executiveSummary.diagnostics) {
            parsed.executiveSummary.diagnostics = {
              structure: "partial",
              encoding: "pass",
              keywords: "partial",
              metrics: "partial",
              activeVoice: "partial"
            };
          }
        }

        return { ...parsed, success: true, isNeural: true, rawText: text, weaknesses: parsed.weaknesses || [], interviewQuestions: parsed.interviewQuestions || [] } as AnalysisResult;
      } catch (aiError) {
        console.error("AI Analysis failed, falling back to rule-based:", aiError);
      }
    }

    // --- ENHANCED FALLBACK ENGINE (Rule-Based) ---
    const textLower_final = text.toLowerCase();
    const wordCount = textLower_final.split(/\s+/).length;

    // 1. Metric Detection (Heuristic)
    const metricMatches = textLower_final.match(/\d+[%]|\$[\d,]+|[\d,]+\s?(million|billion|revenue|users|customers|clients)/g) || [];
    const hasMetrics = metricMatches.length > 3;

    // 2. Passive Voice Detection
    const passivePhrases = ["responsible for", "tasked with", "assisted in", "helped to", "worked on"];
    const foundPassive = passivePhrases.filter(p => textLower_final.includes(p));

    // 3. Keyword Overlap (Literal Check if JD provided)
    let keywordOverlap = "Your keywords are being analyzed.";
    let keywordState: "pass" | "fail" | "partial" = "partial";
    if (jobDescription) {
      const jdKeywords = (jobDescription.toLowerCase().match(/\b(\w{3,})\b/g) || []) as string[];
      const resumeKeywords = (textLower_final.match(/\b(\w{3,})\b/g) || []) as string[];
      const overlap = Array.from(new Set(jdKeywords.filter(k => resumeKeywords.includes(k)))).slice(0, 10);
      keywordOverlap = overlap.length > 0
        ? `Found matching keywords: ${overlap.join(", ")}.`
        : "Important: We didn't find many keywords that match the job description.";
      keywordState = overlap.length > 5 ? "pass" : overlap.length > 0 ? "partial" : "fail";
    }

    // 4. Contact Info
    const hasEmail = /[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(textLower_final);
    const hasPhone = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/.test(textLower_final);
    const hasLinkedIn = /linkedin\.com/.test(textLower_final);
    const contactScore = ((hasEmail ? 40 : 0) + (hasPhone ? 40 : 0) + (hasLinkedIn ? 20 : 0));

    // 5. Structure
    const foundSections = ESSENTIAL_SECTIONS.filter(s => textLower_final.includes(s));
    const sectionsScore = Math.min(100, (foundSections.length / 4) * 100);

    // 6. Impact Score (Heuristic)
    const actionVerbCount = ACTION_VERBS.filter(v => textLower_final.includes(v)).length;
    const impactScore = Math.round((Math.min(100, (actionVerbCount / 6) * 100) + (hasMetrics ? 100 : 30)) / 2);

    // 7. Tech/Skills Score
    const commonTech = ["javascript", "react", "node", "python", "sql", "aws", "docker"];
    const techDetected = commonTech.filter(s => textLower_final.includes(s));
    const techScore = Math.min(100, (techDetected.length / 4) * 100);

    const overallScore = Math.round((contactScore + sectionsScore + impactScore + techScore + 90) / 5);

    return {
      score: overallScore,
      issueCount: (hasEmail ? 0 : 1) + (hasPhone ? 0 : 1) + (hasMetrics ? 0 : 3) + foundPassive.length,
      categories: {
        contact: {
          title: "Contact Details",
          score: contactScore,
          bentoSummary: hasEmail && hasPhone
            ? "Your contact information is clear and complete, making it easy for recruiters to reach out to you."
            : "Some important contact details are missing, which could make it harder for employers to get in touch.",
          strengths: hasEmail && hasPhone ? ["Email and phone number are easy to find."] : [],
          improvements: !hasLinkedIn ? ["Add a link to your LinkedIn profile to help employers verify your experience."] : [],
          missing: !hasEmail ? ["Email Address"] : !hasPhone ? ["Phone Number"] : [],
          status: contactScore > 80 ? "success" : "warning"
        },
        sections: {
          title: "Organization",
          score: Math.round(sectionsScore),
          bentoSummary: foundSections.length > 3
            ? "Your resume is well-organized and uses standard sections that are easy for both humans and computers to read."
            : "The layout of your resume is a bit unusual. Using standard sections like 'Experience' and 'Skills' would make it clearer.",
          strengths: ["Clear and logical section headers."],
          improvements: ["Make sure your most important experience is near the top of the first page."],
          missing: ESSENTIAL_SECTIONS.filter(s => !foundSections.includes(s)),
          status: sectionsScore > 75 ? "success" : "warning"
        },
        skills: {
          title: "Skills & Keywords",
          score: Math.round(techScore),
          bentoSummary: techDetected.length > 0
            ? `We found several important skills like: ${techDetected.join(", ")}. This helps your resume show up in searches.`
            : "You should add more specific skills related to the job you want to help your resume stand out in searches.",
          strengths: techDetected.length > 0 ? ["Important industry skills are mentioned."] : [],
          improvements: ["Add more specific tools or technologies related to your target role."],
          missing: techDetected.length < 3 ? ["More industry-specific skills"] : [],
          status: techScore > 70 ? "success" : "warning"
        },
        content: {
          title: "Work Impact",
          score: Math.round(impactScore),
          bentoSummary: hasMetrics
            ? "Great job using numbers and percentages to show your success! This makes your achievements much more convincing."
            : "Your experience descriptions are a bit general. Adding numbers like 'increased sales by 20%' would show your impact better.",
          strengths: hasMetrics ? ["You've used numbers to prove your results."] : [],
          improvements: ["Try to rephrase 'Responsible for' tasks into achievement-led results with clear metrics."],
          missing: !hasMetrics ? ["Numbers or data points to show your impact"] : [],
          status: impactScore > 70 ? "success" : "warning"
        },
        format: {
          title: "Visual Layout",
          score: 90,
          bentoSummary: "Your resume layout is clean and simple. This ensures that recruitment software can read your information accurately.",
          strengths: ["Clean margins and easy-to-read text spacing."],
          improvements: ["Keep your formatting consistent across all dates and locations."],
          missing: [],
          status: "success"
        }
      },
      summary: `Your resume scored ${overallScore}/100. ${impactScore < 60 ? "Try to add more numbers and results to your experience." : "You've done a good job showing your impact with metrics."}`,
      executiveSummary: {
        overview: `- Resume contains ${wordCount} words, which is within professional bounds.\n- ${hasMetrics ? "Critical metrics detected, enhancing credibility." : "Failure to quantify impact is the biggest rejection risk."}\n- ${foundPassive.length > 0 ? "Passive 'Responsible for' language detected; rewrite to active voice." : "Active voice is used effectively throughout."}`,
        roadmap: [
          {
            phase: "Phase 01",
            title: "Immediate Fixes",
            items: [
              !hasEmail || !hasPhone ? "Resolve critical contact field gaps (Email/Phone) to prevent instant recruiter exclusion." : "Standardize section header formatting to improve machine-parsing accuracy.",
              foundSections.length < 5 ? "Restore missing essential sections (Experience, Skills, Education) to meet enterprise structural standards." : "Optimize layout for single-column efficiency to ensure 100% parsing reliability."
            ]
          },
          {
            phase: "Phase 02",
            title: "Content Upgrade",
            items: [
              !hasMetrics ? "Critical: Inject at least 3-5 quantitative metrics (%, $, scale) per role to move beyond simple task descriptions." : "Enhance existing metrics by providing broader business context for each achievement.",
              foundPassive.length > 0 ? "Execute a 'Passive-to-Active' verb overhaul, replacing 'Responsible for' with high-impact action verbs." : "Refine action verbs to ensure high-priority keywords for your target tier are saturated."
            ]
          },
          {
            phase: "Phase 03",
            title: "Final Polish",
            items: [
              jobDescription ? `Align technical stack specifically with keywords detected in your target JD: ${keywordOverlap.toLowerCase()}.` : "Conduct a technical audit to ensure your most senior skills are prioritized at the top of your stack.",
              "Perform a final visual density check to ensure the character-per-line ratio is optimized for human scannability."
            ]
          }
        ],
        atsVerdict: `HEURISTIC ANALYSIS: The resume structure is likely compatible with modern parsers (85% certainty). ${keywordOverlap} ${hasMetrics ? "Quantification is present, providing a strong competitive edge." : "Warning: Lack of metrics will cause a low ranking in automated skill-filtering."}`,
        diagnostics: {
          structure: sectionsScore > 80 ? "pass" : sectionsScore > 50 ? "partial" : "fail",
          encoding: "pass",
          keywords: keywordState,
          metrics: hasMetrics ? "pass" : "fail",
          activeVoice: foundPassive.length === 0 ? "pass" : foundPassive.length < 3 ? "partial" : "fail"
        }
      },
      weaknesses: [
        ...(jobDescription ? (() => {
          // Extract some key tech words from JD that aren't in resume
          const jdWords = jobDescription.toLowerCase().match(/\b(react|node|typescript|javascript|python|aws|docker|kubernetes|sql|testing|mentorship|leadership|agile|scrum|ci\/cd)\b/g) || [];
          const resumeWords = text.toLowerCase();
          const missingInResume = [...new Set(jdWords.filter(w => !resumeWords.includes(w)))];

          if (missingInResume.length > 0) {
            return [
              `Direct signal gap for ${missingInResume.slice(0, 3).join(", ")}, which are specified as core requirements in the JD.`,
              `No project-level evidence for ${missingInResume[0] || "key tech"} which is mentioned as a 'Must-Have' in the context provided.`,
              `Keyword density for ${missingInResume.slice(0, 2).join("/")} is zero, likely triggering rejection from the target ATS.`
            ];
          }
          return [];
        })() : []),
        `Impact metrics are incomplete or missing, failing to prove business value for ${techDetected[0] || "technical"} work.`,
        foundPassive.length > 0 ? "Using passive language ('Responsible for') which makes you sound like a task-taker rather than a leader." : "Narrative focuses on 'tasks performed' rather than the 'strategic results' achieved.",
        `Listed ${techDetected.slice(0, 2).join("/") || "skills"} without explaining complex architectural decisions made with them.`,
        "Professional summary is generic and doesn't align with the specific high-level requirements of this role.",
        "Lack of 'Senior Signal' markers like Mentorship, Technical Ownership, or Stakeholder Management.",
        "Visual information density is too high; achievements are difficult for human recruiters to scan in under 6 seconds.",
        !hasMetrics ? "Rejection Risk: Failure to quantify success is a major red flag for competitive technical roles." : "Metrics are present but not explicitly tied to the primary goals mentioned in the Job Description.",
        "Resume lacks 'Active Voice' authority, diluting personal impact in technical reviews."
      ].slice(0, 15),
      interviewQuestions: [
        `In your experience with ${techDetected[0] || "your core stack"}, walk me through a time you had to make a high-stakes trade-off between performance and maintainability.`,
        hasMetrics ? "Your resume highlights significant impact metrics. Can you explain the specific data-collection methodology you used to ensure these numbers were accurate?" : "Since your resume lacks specific KPIs, how would you quantitatively prove the success of your most recent engineering initiative during an executive review?",
        `If we were to deploy your ${techDetected[1] || "primary"} project to a global audience today, what is the first architectural bottleneck you would expect to hit?`,
        "Describe a scenario where you had to debug a critical production issue that was outside of your immediate area of expertise.",
        `How do you handle 'Technical Debt' when a product deadline is fixed and non-negotiable? Give a specific example from your PROJECTS section.`,
        "Tell me about a time you had to lead or influence a technical decision when you weren't the most senior person in the room.",
        `In ${techDetected[2] || "modern development"}, what's a common 'best practice' that you've purposefully broken to achieve a better outcome? Why?`,
        "Explain a complex architectural decision from your resume as if you were talking to a non-technical Stakeholder.",
        "How do you ensure your technical documentation remains useful and updated in a high-velocity agile environment?",
        "Describe your process for performing a code review that focuses on long-term scalability rather than just immediate bug fixes.",
        `If you could refactor one specific component from your most recent role, which would it be and what specific design pattern would you implement?`,
        "How do you stay technically competitive in a landscape is evolving as fast as the current AI/Cloud ecosystem?",
        "Tell me about a time you identified a critical security or performance flaw that everyone else on the team had overlooked.",
        "Describe a high-pressure scenario where your technical decision was challenged by a senior peer. How did you resolve the conflict?",
        `Beyond ${techDetected[0] || "your main skills"}, what is the next major layer of the system (Infrastructure, Security, Data) you are looking to master?`,
        "How do you maintain deep focus and 'Flow State' in an environment with high-frequency communication like Slack or Teams?",
        "What is the most 'elegant' piece of code or architecture you've ever designed? What made it superior to the alternatives?",
        "How do you handle a situation where the product requirements change 48 hours before a major production deployment?",
        "Describe a project where you had to mentor or onboard another developer into a complex codebase you owned.",
        `What is your specific philosophy on 'Zero-Downtime' deployments for a stack like ${techDetected.slice(0, 2).join("/") || "your current one"}?`
      ],
      isNeural: false,
      rawText: text,
      success: true
    };

  } catch (error: unknown) {
    console.error("Global Analysis error:", error);
    const err = error as Error;
    return {
      success: false,
      error: `SYSTEM_CRITICAL_FAILURE: ${err.message}`,
      score: 0, issueCount: 0, categories: {} as any, summary: "", executiveSummary: {} as any, weaknesses: [], interviewQuestions: [], isNeural: false, rawText: ""
    };
  }
}

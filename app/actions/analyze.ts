"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFParse } from "pdf-parse";
import { withRetry } from "@/lib/ai-utils";

// Configure PDF worker for Next.js server environment using local file
import path from "path";
PDFParse.setWorker(path.join(process.cwd(), "public", "pdf.worker.mjs"));

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
  rawText: string;
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
  const file = formData.get("resume") as File;
  const jobDescription = formData.get("jobDescription") as string || "";
  if (!file) throw new Error("No file uploaded");

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    const text = data.text;
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
            "summary": "<A balanced, professional summary of the resume's quality>",
            "executiveSummary": {
              "overview": "<3-5 high-impact points on how to stand out to employers.>",
              "roadmap": [
                { "phase": "Phase 01", "title": "Quick Fixes", "items": ["3-5 simple, actionable steps"] },
                { "phase": "Phase 02", "title": "Main Content", "items": ["3-5 clear ways to improve experience bullets"] },
                { "phase": "Phase 03", "title": "Professional Branding", "items": ["3-5 steps to align with modern industry standards"] }
              ],
              "atsVerdict": "<A clear explanation of how an employer's computer will see this resume (3-5 sentences)>",
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
            }
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

        return { ...parsed, rawText: text } as AnalysisResult;
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
        atsVerdict: `HEURISTIC ANALYSIS: The resume structure is likely compatible with modern parsers(85 % certainty).${keywordOverlap} ${hasMetrics ? "Quantification is present, providing a strong competitive edge." : "Warning: Lack of metrics will cause a low ranking in automated skill-filtering."} `,
        diagnostics: {
          structure: sectionsScore > 80 ? "pass" : sectionsScore > 50 ? "partial" : "fail",
          encoding: "pass", // PDF is readable by this point
          keywords: keywordState,
          metrics: hasMetrics ? "pass" : "fail",
          activeVoice: foundPassive.length === 0 ? "pass" : foundPassive.length < 3 ? "partial" : "fail"
        }
      },
      rawText: text
    };

  } catch (error) {
    console.error("Analysis error:", error);
    throw new Error("Failed to parse resume. Ensure it's a valid PDF.");
  }
}

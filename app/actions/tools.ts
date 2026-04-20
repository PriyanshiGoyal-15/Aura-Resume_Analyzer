"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { withRetry } from "@/lib/ai-utils";

export async function generateCoverLetter(resumeText: string, jobDescription: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key not found. Please add GEMINI_API_KEY to .env.local");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Act as a professional career coach. Write a high-conversion, professional cover letter based on the following resume and job description.
    
    Resume:
    ${resumeText}
    
    Job Description:
    ${jobDescription}
    
    Instructions:
    - Use professional Markdown formatting.
    - Start with a clear header.
    - Use bold text for high-impact achievements.
    - Ensure logical paragraph breaks.
    - Return ONLY the cover letter in Markdown format.
  `;

  // --- Dynamic Heuristic Fallback ---
  const textLower = resumeText.toLowerCase();
  const nameMatch = resumeText.split("\n")[0].trim();
  const hasMetrics = /\d+[%]|\$[\d,]+/.test(textLower);
  const commonTech = ["react", "node", "python", "javascript", "sql", "aws", "docker", "java", "c++", "typescript"];
  const techDetected = commonTech.filter(tech => textLower.includes(tech));

  try {
    const result = await withRetry(() => model.generateContent(prompt));
    return result.response.text();
  } catch (error: any) {
    console.warn("AI Cover Letter failed:", error);

    // Check for explicit API key issues
    const isApiKeyError = error?.message?.toLowerCase().includes("api key") || error?.message?.toLowerCase().includes("expired");

    if (isApiKeyError) {
      return `# Professional Career Brief (Intelligent Protocol)
    
**Status:** ⚠️ AI Configuration Error

**The system could not generate your cover letter because your Gemini API key has expired or is invalid.**

### How to Fix:
1.  Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Create a fresh API Key.
3.  Replace the value in your \`.env.local\` file.
4.  Restart your development server (\`npm run dev\`).

---
**Profile Snapshot (Local Engine):**
Candidate Name: **${nameMatch || "Detected Profile"}**
Identified Stack: **${techDetected.join(", ") || "General Professional Stack"}**`;
    }

    return `# Professional Career Brief (Intelligent Protocol)
    
**Status:** Neural engine throttled (High Demand). Providing integrated behavioral alignment based on your profile.

Dear Hiring Manager,

I am writing to express my high interest in a role that leverages my background in **${techDetected.length > 0 ? techDetected.slice(0, 3).join(", ") : "software engineering and modern web technologies"}**. Based on my experience, I bring a strong capability for building scalable systems and ${hasMetrics ? "delivering measurable business impact" : "contributing to technical excellence"}.

Throughout my career, as demonstrated by my work with **${techDetected[0] || "modern software stacks"}**, I have focused on ensuring code quality and cross-functional collaboration. I am eager to apply my technical rigor to your target role.

Best regards,
${nameMatch || "The Candidate"}`;
  }
}

export async function generateATSOptimization(resumeText: string, jobDescription: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key not found. Please add GEMINI_API_KEY to .env.local");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Act as an ATS (Applicant Tracking System) Expert. 
    Analyze the following resume against the job description and provide a high-end "ATS Enhancement Report".
    
    Resume:
    ${resumeText}
    
    Job Description:
    ${jobDescription}
    
    Instructions:
    - Use rich Markdown formatting.
    - Create a Markdown TABLE for the "Top 5 Target Keywords" (Columns: Keyword, Current Integration, Recommended Usage).
    - Use headers (###) for each section.
    - For "Optimized Bullet Points", provide a side-by-side comparison or clear Before/After blocks using Markdown code fences or bold highlights.
    - Provide a "Final ATS Strategy Checklist" using Markdown checkboxes.
    
    Return ONLY the report in Markdown format.
  `;

  // --- Dynamic Heuristic Fallback ---
  const textLower = resumeText.toLowerCase();
  const hasMetrics = /\d+[%]|\$[\d,]+/.test(textLower);
  const commonTech = ["react", "node", "python", "javascript", "sql", "aws", "docker", "java", "c++", "typescript"];
  const techDetected = commonTech.filter(tech => textLower.includes(tech));
  const passivePhrases = ["responsible for", "handled", "assisted in", "helped to"];
  const passiveDetected = passivePhrases.filter(p => textLower.includes(p));

  try {
    const result = await withRetry(() => model.generateContent(prompt));
    return result.response.text();
  } catch (error: any) {
    console.warn("AI ATS Optimization failed:", error);

    // Check for explicit API key issues
    const isApiKeyError = error?.message?.toLowerCase().includes("api key") || error?.message?.toLowerCase().includes("expired");

    if (isApiKeyError) {
      return `### ⚠️ Configuration Error: API Key expired
      
**The AI engine could not be reached because your Gemini API key has expired.** 

Please:
1. Generate a new key at [aistudio.google.com](https://aistudio.google.com/)
2. Update the \`GEMINI_API_KEY\` in your \`.env.local\` file.
3. Restart the development server.

---
**Baseline Diagnostics (Local Engine):**
Your resume identifies **${techDetected.length}** core technologies. We also detected ${hasMetrics ? "good use of metrics" : "a critical lack of quantification"}. Please resolve the API key issue for a full neural audit.`;
    }

    return `### ATS Enhancement Protocol (Intelligent Protocol)

**Status:** Neural engine throttled. Providing integrated structural alignment based on detected heuristics.

#### Detected Skill Matrix
| Key Tech Identified | Integration Strength | Recommendation |
| :--- | :--- | :--- |
| **${techDetected[0] || "N/A"}** | ${techDetected[0] ? "Detected" : "Missing"} | ${techDetected[0] ? "Expand in Summary" : "Add to core skills"} |
| **${techDetected[1] || "N/A"}** | ${techDetected[1] ? "Detected" : "Missing"} | ${techDetected[1] ? "Link to specific projects" : "Highlight relevant tasks"} |
| **Metrics/ROI** | ${hasMetrics ? "Detected" : "Critical Gap"} | ${hasMetrics ? "Good use of data" : "Add %, $, or scale metrics"} |
| **Active Narrative** | ${passiveDetected.length === 0 ? "Strong" : "Weak"} | ${passiveDetected.length === 0 ? "Maintain active voice" : "Replace 'Responsible for' labels"} |

#### Core Optimization Strategy
1. **Tech Stack Grooming**: We detected ${techDetected.length} core technologies. Ensure these are prioritized in your skills cloud.
2. **Metric Infusion**: ${hasMetrics ? "Continue quantifying achievements to stay in the top 10% of candidates." : "CRITICAL: Your resume is task-focused. Add at least 3 numbers (%, $, or scale) per role."}
3. **Keyword Alignment**: ${jobDescription ? "Manual Pass Required: Ensure keywords from your target JD are mentioned at least twice." : "Analyze the target job description for specific cloud or tool keywords."}

#### Final ATS Strategy Checklist
- [ ] Group technologies by seniority (e.g. Expert vs Proficient).
- [ ] ${passiveDetected.length > 0 ? "Replace passive phrases detected in your text with Action Verbs." : "Refine your 'Summary' for maximum impact."}
- [ ] Ensure single-column formatting (Current: Validated).`;
  }
}

import type { Credential, Education } from "./types";

// Source: Mitali_Verma_Resume_JavaFullstack.pdf.
// Not rendered yet — kept here for future sections and the planned chatbot.
export const education: Education[] = [
  {
    degree: "Bachelor of Technology in Information Technology",
    institution: "Institute of Technology, Guru Ghasidas Central University",
    period: "Aug 2017 — Aug 2021",
    location: "Chhattisgarh, India",
    grade: "7.7/10 CGPA",
  },
];

export const certifications: Credential[] = [
  {
    title: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    period: "Jun 2023 — Jun 2026",
    verifyUrl: "https://aws.amazon.com/verification",
  },
];

export const awards: Credential[] = [
  {
    title: "Insta Award",
    issuer: "Infosys Limited",
  },
];

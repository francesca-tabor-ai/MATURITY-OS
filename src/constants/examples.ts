import { Audit } from "../types/audit";

export const EXAMPLE_AUDITS: Audit[] = [
  {
    id: "1",
    company: {
      name: "BT Group",
      industry: "Technology",
      size: "5000+",
      description: "Serves >25 million broadband and mobile subscribers. Collects continuous network telemetry, usage patterns, location data, and device-level behavioral signals."
    },
    answers: { s1: 3, s2: 3, d1: 4, d2: 3, g1: 3, g2: 3, t1: 3, t2: 2, e1: 3, e2: 3 },
    recommendations: "BT is valued as a telecom utility, not an intelligence platform. Its behavioral data asset is comparable in predictive richness to telecom giants like Verizon or AT&T — but monetization is far behind.",
    overallScore: "3.0",
    date: "2026-02-15"
  },
  {
    id: "2",
    company: {
      name: "Tesco",
      industry: "Retail",
      size: "5000+",
      description: "Clubcard collects billions of granular transaction records across millions of households including SKU-level basket composition and price elasticity."
    },
    answers: { s1: 4, s2: 4, d1: 5, d2: 4, g1: 4, g2: 4, t1: 4, t2: 3, e1: 4, e2: 4 },
    recommendations: "Tesco is effectively a national behavioral consumption database. Still valued primarily as a grocery retailer, not a consumer intelligence platform.",
    overallScore: "4.1",
    date: "2026-02-16"
  },
  {
    id: "3",
    company: {
      name: "Rightmove",
      industry: "Other",
      size: "201-1000",
      description: "Controls ~85% of UK property portal engagement time. Tracks property search intent, buyer demand elasticity, and geographic migration patterns."
    },
    answers: { s1: 4, s2: 4, d1: 4, d2: 4, g1: 3, g2: 3, t1: 4, t2: 4, e1: 4, e2: 4 },
    recommendations: "Rightmove is essentially a real-time housing demand sensor. Flywheel Strength Potential: 10/10.",
    overallScore: "3.8",
    date: "2026-02-17"
  },
  {
    id: "4",
    company: {
      name: "Lloyds Banking Group",
      industry: "Finance",
      size: "5000+",
      description: "Largest consumer banking dataset in the UK. Uses centralized ML systems for fraud, credit risk, and customer personalization."
    },
    answers: { s1: 4, s2: 4, d1: 4, d2: 4, g1: 5, g2: 5, t1: 4, t2: 3, e1: 4, e2: 4 },
    recommendations: "Could become a national economic prediction engine. Currently valued as a bank.",
    overallScore: "4.1",
    date: "2026-02-18"
  },
  {
    id: "5",
    company: {
      name: "Vodafone UK",
      industry: "Technology",
      size: "5000+",
      description: "Tracks mobility patterns, network usage, and behavioral telecom signals across millions of users. Telecom mobility data is among the most predictive datasets in existence."
    },
    answers: { s1: 3, s2: 3, d1: 4, d2: 3, g1: 3, g2: 3, t1: 3, t2: 2, e1: 3, e2: 3 },
    recommendations: "Telecom mobility data is among the most predictive datasets in existence. Potential for retail demand forecasting and economic activity prediction.",
    overallScore: "3.0",
    date: "2026-02-19"
  },
  {
    id: "6",
    company: {
      name: "Heathrow Airport",
      industry: "Other",
      size: "5000+",
      description: "Tracks real-time passenger flow, travel frequency, and international mobility patterns. Effectively a real-time global mobility sensor."
    },
    answers: { s1: 3, s2: 3, d1: 4, d2: 4, g1: 4, g2: 3, t1: 3, t2: 2, e1: 3, e2: 3 },
    recommendations: "Untapped potential for macro travel demand forecasting and international economic activity prediction.",
    overallScore: "3.2",
    date: "2026-02-19"
  },
  {
    id: "7",
    company: {
      name: "RELX",
      industry: "Technology",
      size: "5000+",
      description: "Database includes over 138 billion legal, scientific, and risk documents. Powers legal risk prediction and scientific discovery modeling."
    },
    answers: { s1: 5, s2: 5, d1: 5, d2: 5, g1: 4, g2: 4, t1: 5, t2: 4, e1: 5, e2: 5 },
    recommendations: "Still in early stages of predictive intelligence monetization despite massive data assets.",
    overallScore: "4.7",
    date: "2026-02-19"
  },
  {
    id: "8",
    company: {
      name: "LSEG",
      industry: "Finance",
      size: "5000+",
      description: "Owns Refinitiv — one of the largest financial datasets globally. Potential for predictive macroeconomic modeling."
    },
    answers: { s1: 4, s2: 4, d1: 5, d2: 5, g1: 4, g2: 4, t1: 4, t2: 3, e1: 4, e2: 4 },
    recommendations: "Untapped potential for real-time financial system risk prediction.",
    overallScore: "4.1",
    date: "2026-02-19"
  },
  {
    id: "9",
    company: {
      name: "Experian",
      industry: "Finance",
      size: "5000+",
      description: "Tracks credit, demographic, and behavioral data across millions of UK households and companies. Behavioral financial intelligence platform."
    },
    answers: { s1: 4, s2: 4, d1: 5, d2: 4, g1: 5, g2: 5, t1: 4, t2: 3, e1: 4, e2: 4 },
    recommendations: "Still under-monetizing predictive potential of its behavioral financial intelligence platform.",
    overallScore: "4.2",
    date: "2026-02-19"
  },
  {
    id: "10",
    company: {
      name: "Ocado Group",
      industry: "Technology",
      size: "5000+",
      description: "Massive dataset of warehouse robotics telemetry and consumer grocery demand prediction."
    },
    answers: { s1: 5, s2: 4, d1: 5, d2: 5, g1: 3, g2: 4, t1: 5, t2: 3, e1: 5, e2: 4 },
    recommendations: "Dataset could power national supply chain intelligence. Still largely treated as a logistics company.",
    overallScore: "4.3",
    date: "2026-02-19"
  },
  {
    id: "11",
    company: {
      name: "National Grid",
      industry: "Energy",
      size: "5000+",
      description: "Tracks household electricity consumption and industrial activity patterns. Energy consumption is a strong predictor of economic activity."
    },
    answers: { s1: 3, s2: 3, d1: 4, d2: 4, g1: 4, g2: 3, t1: 3, t2: 2, e1: 3, e2: 3 },
    recommendations: "Under-monetised intelligence layer with strong predictive signals for economic activity.",
    overallScore: "3.2",
    date: "2026-02-19"
  },
  {
    id: "12",
    company: {
      name: "Zoopla",
      industry: "Other",
      size: "201-1000",
      description: "Tracks property searches, rental demand, and housing liquidity. Massive predictive economic signal dataset."
    },
    answers: { s1: 3, s2: 3, d1: 4, d2: 3, g1: 3, g2: 3, t1: 3, t2: 3, e1: 3, e2: 3 },
    recommendations: "Strong potential for housing market liquidity signals and mortgage demand forecasts.",
    overallScore: "3.1",
    date: "2026-02-19"
  },
  {
    id: "13",
    company: {
      name: "Trainline",
      industry: "Technology",
      size: "201-1000",
      description: "Tracks travel frequency, commuter patterns, and work mobility shifts. Predictive economic activity dataset."
    },
    answers: { s1: 4, s2: 3, d1: 4, d2: 4, g1: 3, g2: 3, t1: 4, t2: 3, e1: 4, e2: 3 },
    recommendations: "Valuable dataset for tracking work mobility shifts and commuter patterns.",
    overallScore: "3.5",
    date: "2026-02-19"
  },
  {
    id: "14",
    company: {
      name: "Deliveroo",
      industry: "Technology",
      size: "1001-5000",
      description: "Tracks food demand patterns, local economic activity, and household behavioral signals. Consumer demand intelligence engine."
    },
    answers: { s1: 4, s2: 4, d1: 4, d2: 4, g1: 3, g2: 3, t1: 4, t2: 3, e1: 4, e2: 4 },
    recommendations: "Strong consumer demand intelligence engine with granular local economic activity data.",
    overallScore: "3.7",
    date: "2026-02-19"
  }
];

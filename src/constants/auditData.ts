export interface Question {
  id: string;
  text: string;
  options: {
    label: string;
    score: number;
  }[];
}

export interface Category {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export const AUDIT_DATA: Category[] = [
  {
    id: 'strategy',
    title: 'Strategy & Leadership',
    description: 'Alignment of AI initiatives with business goals and executive support.',
    questions: [
      {
        id: 's1',
        text: 'How clearly is AI integrated into your overall business strategy?',
        options: [
          { label: 'No formal AI strategy exists', score: 1 },
          { label: 'Ad-hoc AI projects with limited strategic alignment', score: 2 },
          { label: 'AI is a recognized component of business units', score: 3 },
          { label: 'AI is central to the corporate strategy and long-term vision', score: 5 }
        ]
      },
      {
        id: 's2',
        text: 'What is the level of executive sponsorship for AI initiatives?',
        options: [
          { label: 'Minimal or no executive involvement', score: 1 },
          { label: 'Sponsorship at the department level only', score: 2 },
          { label: 'C-suite awareness but limited active sponsorship', score: 3 },
          { label: 'Active C-suite sponsorship and dedicated AI leadership (e.g., CAIO)', score: 5 }
        ]
      }
    ]
  },
  {
    id: 'data',
    title: 'Data Infrastructure',
    description: 'Quality, accessibility, and scalability of data systems.',
    questions: [
      {
        id: 'd1',
        text: 'How centralized and accessible is your enterprise data?',
        options: [
          { label: 'Data is siloed in disconnected systems', score: 1 },
          { label: 'Some data lakes/warehouses exist but access is difficult', score: 2 },
          { label: 'Centralized data platform with standardized access', score: 4 },
          { label: 'Real-time data mesh/fabric with high accessibility and quality', score: 5 }
        ]
      },
      {
        id: 'd2',
        text: 'What is the state of your data quality and pipeline automation?',
        options: [
          { label: 'Manual data cleaning and processing', score: 1 },
          { label: 'Basic ETL processes with frequent manual intervention', score: 2 },
          { label: 'Automated pipelines with basic quality checks', score: 4 },
          { label: 'Fully automated, self-healing pipelines with rigorous observability', score: 5 }
        ]
      }
    ]
  },
  {
    id: 'governance',
    title: 'Governance & Ethics',
    description: 'Frameworks for responsible AI, security, and compliance.',
    questions: [
      {
        id: 'g1',
        text: 'Do you have a formal Responsible AI / Ethics framework?',
        options: [
          { label: 'No formal framework or guidelines', score: 1 },
          { label: 'Informal guidelines or ad-hoc reviews', score: 2 },
          { label: 'Documented framework but inconsistent application', score: 3 },
          { label: 'Comprehensive, audited framework integrated into all AI lifecycles', score: 5 }
        ]
      },
      {
        id: 'g2',
        text: 'How are AI models monitored for bias and security?',
        options: [
          { label: 'No monitoring in place', score: 1 },
          { label: 'Manual periodic reviews', score: 2 },
          { label: 'Automated monitoring for performance only', score: 3 },
          { label: 'Continuous automated monitoring for bias, drift, and security vulnerabilities', score: 5 }
        ]
      }
    ]
  },
  {
    id: 'talent',
    title: 'Talent & Culture',
    description: 'Availability of skills and organizational readiness for AI.',
    questions: [
      {
        id: 't1',
        text: 'How would you describe your AI talent pool?',
        options: [
          { label: 'Rely entirely on external consultants', score: 1 },
          { label: 'Small internal team with limited specialized skills', score: 2 },
          { label: 'Strong internal core team of data scientists and engineers', score: 4 },
          { label: 'Widespread AI literacy and deep specialized expertise across the org', score: 5 }
        ]
      },
      {
        id: 't2',
        text: 'What is the level of AI literacy among non-technical staff?',
        options: [
          { label: 'Very low; AI is seen as a "black box"', score: 1 },
          { label: 'Basic awareness but significant resistance', score: 2 },
          { label: 'General understanding and willingness to adopt', score: 4 },
          { label: 'High literacy; employees actively identify AI opportunities', score: 5 }
        ]
      }
    ]
  },
  {
    id: 'execution',
    title: 'Execution & Value',
    description: 'Ability to move from POC to production and realize value.',
    questions: [
      {
        id: 'e1',
        text: 'What is your success rate for moving AI projects from POC to Production?',
        options: [
          { label: 'Most projects stall at the POC stage', score: 1 },
          { label: 'Occasional successful deployments with high effort', score: 2 },
          { label: 'Standardized process for productionalizing models (MLOps)', score: 4 },
          { label: 'Seamless, automated deployment and scaling of AI solutions', score: 5 }
        ]
      },
      {
        id: 'e2',
        text: 'How is the ROI of AI initiatives measured?',
        options: [
          { label: 'ROI is not measured', score: 1 },
          { label: 'Qualitative assessments only', score: 2 },
          { label: 'Basic quantitative tracking of costs and benefits', score: 3 },
          { label: 'Rigorous value tracking with clear attribution to business KPIs', score: 5 }
        ]
      }
    ]
  }
];

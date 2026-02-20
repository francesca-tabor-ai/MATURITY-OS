import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  BarChart3, 
  ShieldCheck, 
  Database, 
  Users, 
  Rocket,
  RefreshCw,
  Download,
  BrainCircuit,
  CheckCircle2,
  Building2,
  Briefcase,
  Users2,
  FileText,
  LayoutDashboard,
  Plus,
  Trash2,
  Eye,
  Edit3,
  Search,
  Calendar
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import Markdown from 'react-markdown';
import { AUDIT_DATA, Category } from './constants/auditData';
import { generateRecommendations, MaturityScore, CompanyDetails } from './services/geminiService';
import { cn } from './lib/utils';
import { Audit } from './types/audit';
import { EXAMPLE_AUDITS } from './constants/examples';

// --- Components ---

const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
    <motion.div 
      className="h-full signature-gradient"
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
      transition={{ duration: 0.5 }}
    />
  </div>
);

export default function App() {
  const [step, setStep] = useState<'intro' | 'company' | 'questions' | 'results' | 'dashboard'>('intro');
  const [currentCategoryIdx, setCurrentCategoryIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [company, setCompany] = useState<CompanyDetails>({
    name: '',
    industry: '',
    size: '',
    description: ''
  });
  
  // CRUD State
  const [audits, setAudits] = useState<Audit[]>([]);
  const [editingAuditId, setEditingAuditId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');

  // Initialize with examples
  useEffect(() => {
    const saved = localStorage.getItem('maturity_audits');
    if (saved) {
      setAudits(JSON.parse(saved));
    } else {
      setAudits(EXAMPLE_AUDITS);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (audits.length > 0) {
      localStorage.setItem('maturity_audits', JSON.stringify(audits));
    }
  }, [audits]);

  const currentCategory = AUDIT_DATA[currentCategoryIdx];
  const totalQuestions = AUDIT_DATA.reduce((acc, cat) => acc + cat.questions.length, 0);
  const answeredCount = Object.keys(answers).length;

  const scores = useMemo(() => {
    return AUDIT_DATA.map(cat => {
      const catAnswers = cat.questions.map(q => answers[q.id] || 0);
      const total = catAnswers.reduce((a, b) => a + b, 0);
      const avg = catAnswers.length > 0 ? total / catAnswers.length : 0;
      return {
        category: cat.title,
        score: Number(avg.toFixed(1)),
        fullScore: total,
        maxScore: 5
      };
    });
  }, [answers]);

  const overallScore = useMemo(() => {
    const total = scores.reduce((acc, s) => acc + s.score, 0);
    return (total / scores.length).toFixed(1);
  }, [scores]);

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const nextStep = () => {
    if (currentCategoryIdx < AUDIT_DATA.length - 1) {
      setCurrentCategoryIdx(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const prevStep = () => {
    if (currentCategoryIdx > 0) {
      setCurrentCategoryIdx(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    setStep('results');
    setIsGenerating(true);
    const recs = await generateRecommendations(
      scores.map(s => ({
        category: s.category,
        score: s.score,
        maxScore: s.maxScore
      })),
      company
    );
    setRecommendations(recs);
    setIsGenerating(false);

    // Save or Update Audit
    const newAudit: Audit = {
      id: editingAuditId || Date.now().toString(),
      company,
      answers,
      recommendations: recs,
      overallScore,
      date: new Date().toISOString().split('T')[0]
    };

    setAudits(prev => {
      if (editingAuditId) {
        return prev.map(a => a.id === editingAuditId ? newAudit : a);
      }
      return [newAudit, ...prev];
    });
    setEditingAuditId(null);
  };

  const resetAudit = () => {
    setAnswers({});
    setCurrentCategoryIdx(0);
    setStep('intro');
    setRecommendations(null);
    setCompany({ name: '', industry: '', size: '', description: '' });
    setEditingAuditId(null);
  };

  const startNewAudit = () => {
    resetAudit();
    setStep('company');
  };

  const viewAudit = (audit: Audit) => {
    setCompany(audit.company);
    setAnswers(audit.answers);
    setRecommendations(audit.recommendations);
    setStep('results');
  };

  const editAudit = (audit: Audit) => {
    setCompany(audit.company);
    setAnswers(audit.answers);
    setEditingAuditId(audit.id);
    setCurrentCategoryIdx(0);
    setStep('company');
  };

  const deleteAudit = (id: string) => {
    if (confirm('Are you sure you want to delete this audit?')) {
      setAudits(prev => prev.filter(a => a.id !== id));
    }
  };

  const isCategoryComplete = (category: Category) => {
    return category.questions.every(q => answers[q.id] !== undefined);
  };

  const isCompanyFormValid = () => {
    return company.name && company.industry && company.size && company.description;
  };

  const industries = useMemo(() => {
    const all = audits.map(a => a.company.industry);
    return ['all', ...Array.from(new Set(all))];
  }, [audits]);

  const filteredAudits = useMemo(() => {
    let result = audits.filter(a => 
      a.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.company.industry.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterIndustry !== 'all') {
      result = result.filter(a => a.company.industry === filterIndustry);
    }

    return result.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'score') return Number(b.overallScore) - Number(a.overallScore);
      if (sortBy === 'name') return a.company.name.localeCompare(b.company.name);
      return 0;
    });
  }, [audits, searchQuery, sortBy, filterIndustry]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-8 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setStep('intro')}>
            <div className="w-10 h-10 signature-gradient rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold tracking-tight text-xl">MaturityAudit<span className="text-zinc-400">.ai</span></span>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-8">
            {step === 'questions' && (
              <div className="hidden md:flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Audit Progress</span>
                  <span className="text-sm font-semibold text-zinc-900">{answeredCount} of {totalQuestions} completed</span>
                </div>
                <div className="w-32">
                  <ProgressBar current={answeredCount} total={totalQuestions} />
                </div>
              </div>
            )}
            
            <nav className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setStep('dashboard')}
                className={cn(
                  "flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all",
                  step === 'dashboard' ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              
              {(step === 'results' || step === 'questions' || step === 'company') && (
                <button 
                  onClick={resetAudit}
                  className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-all px-4 py-2 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-100"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-16">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="max-w-3xl mx-auto text-center space-y-12"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-50 border border-zinc-100 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                  <span className="w-2 h-2 rounded-full signature-gradient animate-pulse" />
                  Enterprise Intelligence Framework
                </div>
                <h1 className="text-6xl sm:text-7xl font-bold tracking-tight leading-[1.05] text-zinc-900">
                  Measure your enterprise <br />
                  <span className="signature-text-gradient italic">AI maturity.</span>
                </h1>
                <p className="text-xl text-zinc-500 leading-relaxed max-w-2xl mx-auto font-light">
                  A developer-first diagnostic tool to evaluate data infrastructure, strategic alignment, and organizational readiness for the AI era.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                {[
                  { icon: BarChart3, title: 'Strategic scoring', desc: '5 core dimensions of AI maturity' },
                  { icon: ShieldCheck, title: 'Governance audit', desc: 'Ethics and compliance readiness' },
                  { icon: Database, title: 'Data pipeline', desc: 'Infrastructure and quality check' },
                  { icon: Users, title: 'Talent gap', desc: 'Skillset and culture evaluation' },
                ].map((item, i) => (
                  <div key={i} className="p-6 glass-card group hover:border-zinc-300 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center mb-4 group-hover:bg-zinc-100 transition-colors">
                      <item.icon className="w-5 h-5 text-zinc-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => setStep('company')}
                  className="btn-primary w-full sm:w-auto"
                >
                  Start maturity audit
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => setStep('dashboard')}
                  className="px-8 py-4 font-bold text-zinc-500 hover:text-zinc-900 transition-all rounded-2xl border border-zinc-200 hover:border-zinc-300 w-full sm:w-auto"
                >
                  View Dashboard
                </button>
              </div>
              <p className="text-sm text-zinc-400 font-medium">Takes approximately 4 minutes to complete</p>
            </motion.div>
          )}

          {step === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h2 className="text-4xl font-bold tracking-tight text-zinc-900">Audit Dashboard</h2>
                  <p className="text-zinc-500 font-medium">Manage and review your enterprise assessments.</p>
                </div>
                <button 
                  onClick={startNewAudit}
                  className="btn-primary"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start New Audit
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input 
                    type="text"
                    placeholder="Search by company or industry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                  />
                </div>
                
                <div className="flex gap-2">
                  <select 
                    value={filterIndustry}
                    onChange={(e) => setFilterIndustry(e.target.value)}
                    className="px-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all appearance-none text-sm font-bold text-zinc-600"
                  >
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind === 'all' ? 'All Industries' : ind}</option>
                    ))}
                  </select>

                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all appearance-none text-sm font-bold text-zinc-600"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="score">Sort by Score</option>
                    <option value="name">Sort by Name</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredAudits.length > 0 ? (
                  filteredAudits.map((audit) => (
                    <motion.div 
                      key={audit.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-zinc-300"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex flex-col items-center justify-center border border-zinc-100">
                          <span className="text-2xl font-black tracking-tighter text-zinc-900">{audit.overallScore}</span>
                          <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Score</span>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-zinc-900">{audit.company.name}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500 font-medium">
                            <span className="flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5" />
                              {audit.company.industry}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {audit.date}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users2 className="w-3.5 h-3.5" />
                              {audit.company.size}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => viewAudit(audit)}
                          className="p-3 rounded-xl bg-zinc-50 text-zinc-600 hover:bg-zinc-900 hover:text-white transition-all border border-zinc-100"
                          title="View Results"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => editAudit(audit)}
                          className="p-3 rounded-xl bg-zinc-50 text-zinc-600 hover:bg-zinc-900 hover:text-white transition-all border border-zinc-100"
                          title="Edit Audit"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => deleteAudit(audit.id)}
                          className="p-3 rounded-xl bg-zinc-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-zinc-100"
                          title="Delete Audit"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Search className="w-8 h-8 text-zinc-300" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900">No audits found</h3>
                    <p className="text-zinc-500 font-medium">Try a different search or start a new assessment.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 'company' && (
            <motion.div 
              key="company"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="max-w-2xl mx-auto space-y-10"
            >
              <div className="space-y-2">
                <h2 className="text-4xl font-bold tracking-tight text-zinc-900">
                  {editingAuditId ? 'Edit Company Details' : 'Company Details'}
                </h2>
                <p className="text-lg text-zinc-500 font-light">Tell us about your organization to contextualize the audit results.</p>
              </div>

              <div className="glass-card p-10 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> Company Name
                    </label>
                    <input 
                      type="text" 
                      value={company.name}
                      onChange={(e) => setCompany(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Acme Corp"
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> Industry
                      </label>
                      <select 
                        value={company.industry}
                        onChange={(e) => setCompany(prev => ({ ...prev, industry: e.target.value }))}
                        className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all appearance-none"
                      >
                        <option value="">Select Industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Retail">Retail</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Energy">Energy</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Users2 className="w-4 h-4" /> Company Size
                      </label>
                      <select 
                        value={company.size}
                        onChange={(e) => setCompany(prev => ({ ...prev, size: e.target.value }))}
                        className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all appearance-none"
                      >
                        <option value="">Select Size</option>
                        <option value="1-50">1-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-1000">201-1000 employees</option>
                        <option value="1001-5000">1001-5000 employees</option>
                        <option value="5000+">5000+ employees</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Brief Description
                    </label>
                    <textarea 
                      value={company.description}
                      onChange={(e) => setCompany(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your current data/AI landscape..."
                      rows={4}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setStep('questions')}
                    disabled={!isCompanyFormValid()}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Audit
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'questions' && (
            <motion.div 
              key="questions"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="space-y-12 max-w-4xl mx-auto"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest">
                    Dimension {currentCategoryIdx + 1}
                  </span>
                  <div className="h-px flex-1 bg-zinc-100" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold tracking-tight text-zinc-900">{currentCategory.title}</h2>
                  <p className="text-lg text-zinc-500 font-light">{currentCategory.description}</p>
                </div>
              </div>

              <div className="space-y-8">
                {currentCategory.questions.map((q) => (
                  <div key={q.id} className="glass-card p-10 space-y-8">
                    <h3 className="text-2xl font-bold leading-tight text-zinc-900">{q.text}</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {q.options.map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => handleAnswer(q.id, opt.score)}
                          className={cn(
                            "group flex items-center justify-between p-6 rounded-2xl border transition-all text-left",
                            answers[q.id] === opt.score 
                              ? "bg-zinc-900 border-zinc-900 text-white shadow-xl shadow-zinc-200" 
                              : "bg-zinc-50 border-zinc-100 hover:border-zinc-300 hover:bg-white text-zinc-700"
                          )}
                        >
                          <span className="text-base font-semibold">{opt.label}</span>
                          <div className={cn(
                            "w-6 h-6 rounded-full border flex items-center justify-center transition-all",
                            answers[q.id] === opt.score 
                              ? "bg-white border-white" 
                              : "border-zinc-300 group-hover:border-zinc-400"
                          )}>
                            {answers[q.id] === opt.score && <CheckCircle2 className="w-4 h-4 text-zinc-900" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-12">
                <button 
                  onClick={prevStep}
                  disabled={currentCategoryIdx === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-zinc-400 hover:text-zinc-900 disabled:opacity-20 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous dimension
                </button>
                <button 
                  onClick={nextStep}
                  disabled={!isCategoryComplete(currentCategory)}
                  className="btn-primary px-10"
                >
                  {currentCategoryIdx === AUDIT_DATA.length - 1 ? 'Generate report' : 'Next dimension'}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-16 max-w-5xl mx-auto"
            >
              {/* Results Hero */}
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 mb-4">
                  Assessment complete for {company.name}
                </div>
                <h2 className="text-6xl font-bold tracking-tight text-zinc-900">Maturity profile</h2>
                <div className="flex items-baseline justify-center gap-3">
                  <span className="text-9xl font-black tracking-tighter signature-text-gradient">{overallScore}</span>
                  <span className="text-3xl text-zinc-300 font-bold">/ 5.0</span>
                </div>
                <p className="text-zinc-500 max-w-md mx-auto font-medium">
                  {company.name} shows <span className="text-zinc-900">
                    {Number(overallScore) > 4 ? 'Transformative' : Number(overallScore) > 3 ? 'Strategic' : Number(overallScore) > 2 ? 'Emerging' : 'Foundational'}
                  </span> maturity in AI adoption within the {company.industry} sector.
                </p>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Radar Chart */}
                <div className="glass-card p-10">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-10">Maturity distribution</h3>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={scores}>
                        <PolarGrid stroke="#f4f4f5" />
                        <PolarAngleAxis dataKey="category" tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                        <Radar
                          name="Maturity"
                          dataKey="score"
                          stroke="#18181b"
                          fill="#18181b"
                          fillOpacity={0.05}
                          strokeWidth={3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="glass-card p-10">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-10">Dimension performance</h3>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scores} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <XAxis type="number" domain={[0, 5]} hide />
                        <YAxis 
                          dataKey="category" 
                          type="category" 
                          tick={{ fill: '#71717a', fontSize: 12, fontWeight: 500 }} 
                          width={120}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={32}>
                          {scores.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.score > 3.5 ? '#18181b' : entry.score > 2 ? '#52525b' : '#d4d4d8'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* AI Insights Section */}
              <div className="bg-zinc-900 text-white p-12 sm:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none">
                  <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] signature-gradient rounded-full blur-[120px]" />
                </div>
                
                <div className="relative z-10 space-y-12">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                        <BrainCircuit className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold tracking-tight">Strategic insights</h3>
                        <p className="text-zinc-500 text-sm font-medium">AI-generated analysis for {company.name}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-zinc-900 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-all">
                        <Download className="w-4 h-4" />
                        Export PDF
                      </button>
                    </div>
                  </div>

                  {isGenerating ? (
                    <div className="space-y-6 py-12">
                      <div className="flex items-center gap-3 text-zinc-400 animate-pulse">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span className="font-medium tracking-wide">Synthesizing maturity data...</span>
                      </div>
                      <div className="space-y-3">
                        <div className="h-3 w-full bg-white/5 rounded-full" />
                        <div className="h-3 w-5/6 bg-white/5 rounded-full" />
                        <div className="h-3 w-4/6 bg-white/5 rounded-full" />
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-zinc max-w-none">
                      <div className="markdown-body">
                        <Markdown>{recommendations || ""}</Markdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-6xl mx-auto px-8 py-20 border-t border-zinc-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-50">
            <div className="w-6 h-6 signature-gradient rounded-lg" />
            <span className="font-bold tracking-tight text-sm">MaturityAudit.ai</span>
          </div>
          <p className="text-sm text-zinc-400 font-medium">
            &copy; {new Date().getFullYear()} MaturityAudit.ai. Developer-first AI readiness diagnostics.
          </p>
          <div className="flex gap-6 text-sm font-bold text-zinc-400">
            <a href="#" className="hover:text-zinc-900 transition-colors">Documentation</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

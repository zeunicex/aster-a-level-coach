"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { dateKey, evidenceConfidence, evidenceDelta, evidenceDeltaFromMarks, isReviewDue, nextReviewDate, objectiveNeedsPractice, pickNextQuestion, reviewLabel } from "@/lib/adaptive.mjs";
import { packOrderForSource, pdfPipeline, practicalSkills, syllabusAreas, verifiedBiologyQuestions, type PackStatus } from "@/lib/biology-content";
import { gradeStructuredAnswer } from "@/lib/marking.mjs";

type Subject = "Biology" | "Chemistry";
type View = "today" | "map" | "pipeline" | "library" | "progress" | "activity";
type Confidence = "Low" | "Medium" | "High";
type Skill = "Knowledge" | "Application" | "Image" | "Exam technique";
type SessionKind = "quick" | "practice" | "diagnostic";
type QuestionFormat = "mcq" | "image" | "sequence" | "data" | "structured" | "practical";
type MasteryItem = {
  code: string;
  topic: string;
  score: number;
  note: string;
  due: string;
  evidence: number;
  confidence: Confidence;
  knowledge: number;
  application: number;
  exam: number;
  mastered?: boolean;
};
type Question = {
  id: string;
  code: string;
  eyebrow: string;
  objective: string;
  marks: number;
  skill: Skill;
  difficulty: 1 | 2 | 3;
  prompt: string;
  format?: QuestionFormat;
  options?: string[];
  answer?: number;
  data?: { headers: string[]; rows: string[][] };
  markPoints?: string[];
  modelAnswer?: string;
  hint: string;
  misconception: string;
  explanation: string;
  source: string;
  sourceUrl?: string;
  visual?: "chloroplast" | "molecule";
  sourceImage?: string;
  sourcePage?: number;
};
type FileItem = { id?: string; name: string; meta: string; tag: string; status?: string };
type LearningGap = { point: string; code: string; count: number };
type SessionResult = { code: string; topic: string; correct: boolean; secure: boolean; format: QuestionFormat; missedPoints: string[] };
type PackState = { packOrder: number; name: string; status: PackStatus; version: number; releaseNote: string; updatedAt: string };
type StudentProfile = { displayName: string; classCode: string };
type TeacherStudent = { displayName: string; classCode: string; attempts: number; accuracy: number; mastered: number; weak: string[]; lastActive: string; activeRecently: boolean };
type ActivityData = { classCode: string; students: TeacherStudent[]; summary: { students: number; attempts: number; activeRecently: number; averageAccuracy: number } };
const formatLabels: Record<QuestionFormat, string> = {
  mcq: "Multiple choice",
  image: "Image interpretation",
  sequence: "Process sequence",
  data: "Data response",
  structured: "Structured response",
  practical: "Practical planning",
};

const objectiveRank = (code: string) => {
  const [, area = "", token = ""] = code.match(/^(\d|A|B)\(([a-z]+)\)$/) ?? [];
  const areaRank = ["1", "2", "3", "4", "A", "B"].indexOf(area);
  const tokenRank = token.length === 1 ? "abcdefghijklmnopqrstuvwxyz".indexOf(token) : 26 + ["aa", "bb", "cc", "dd"].indexOf(token);
  return areaRank * 100 + tokenRank;
};
const biologyMasterySeed: MasteryItem[] = [...new Map(verifiedBiologyQuestions.map((question) => [question.code, {
  code: question.code,
  topic: question.objective.replace(/^\S+\s+/, ""),
  score: 50,
  note: "Ready for diagnostic",
  due: "Today",
  evidence: 0,
  confidence: "Low" as Confidence,
  knowledge: 50,
  application: 50,
  exam: 50,
}])).values()].sort((a, b) => objectiveRank(a.code) - objectiveRank(b.code));

const initialPackStates: PackState[] = pdfPipeline.map((pack) => ({
  packOrder: pack.order,
  name: pack.name,
  status: pack.status === "Verified" ? "Live" : "Draft",
  version: pack.status === "Verified" ? (pack.questions >= 30 ? 2 : 1) : 0,
  releaseNote: "",
  updatedAt: "",
}));
const biologyFileItems: FileItem[] = [
  ...pdfPipeline.map((pack) => ({
    name: `${pack.order}. ${pack.name}`,
    meta: `${pack.pages} PDF pages · ${pack.questions} multi-format questions`,
    tag: "Adaptive pack",
    status: "Ready",
  })),
  { name: "9744 H2 Biology syllabus.pdf", meta: "99 content outcomes · 4 practical skill areas", tag: "Syllabus", status: "Ready" },
];

const initialMastery: Record<Subject, MasteryItem[]> = {
  Biology: biologyMasterySeed,
  Chemistry: [
    { code: "2.1", topic: "Atomic structure", score: 82, note: "Secure", due: "6 days", evidence: 12, confidence: "High", knowledge: 91, application: 79, exam: 76 },
    { code: "3.3", topic: "Chemical bonding", score: 70, note: "Shape explanations", due: "2 days", evidence: 7, confidence: "Medium", knowledge: 79, application: 67, exam: 64 },
    { code: "7.1", topic: "Equilibria", score: 48, note: "Application is weak", due: "Today", evidence: 3, confidence: "Low", knowledge: 65, application: 39, exam: 40 },
    { code: "14.2", topic: "Organic mechanisms", score: 39, note: "Electron movement", due: "Today", evidence: 2, confidence: "Low", knowledge: 57, application: 31, exam: 29 },
  ],
};

const questions: Record<Subject, Question[]> = {
  Biology: verifiedBiologyQuestions,
  Chemistry: [
    {
      id: "chem-equilibrium-pressure",
      code: "7.1",
      eyebrow: "Adaptive check · application",
      objective: "7.1 Equilibria",
      marks: 1,
      skill: "Application",
      difficulty: 2,
      prompt: "For N₂(g) + 3H₂(g) ⇌ 2NH₃(g), what is the immediate effect of increasing pressure at constant temperature?",
      options: [
        "The equilibrium shifts left",
        "The equilibrium shifts right",
        "The equilibrium constant increases",
        "The forward reaction stops",
      ],
      answer: 1,
      hint: "Compare the total number of gas molecules on each side.",
      misconception: "Le Chatelier pressure reasoning",
      explanation: "The right side has fewer moles of gas, so higher pressure favours the forward reaction. The equilibrium constant only changes with temperature.",
      source: "Chemistry Coursebook · p. 162 · Syllabus 7.1(d)",
    },
    {
      id: "chem-carbon-dioxide",
      code: "3.3",
      eyebrow: "Structure · bond polarity",
      objective: "3.3 Chemical bonding",
      marks: 2,
      skill: "Image",
      difficulty: 2,
      prompt: "Why is the molecule shown non-polar even though each C=O bond is polar?",
      options: [
        "Carbon dioxide contains ionic bonds",
        "The molecule is linear, so the bond dipoles cancel",
        "Oxygen and carbon have equal electronegativity",
        "The double bonds cannot form dipoles",
      ],
      answer: 1,
      hint: "Consider both molecular shape and the direction of the bond dipoles.",
      misconception: "Bond polarity versus molecular polarity",
      explanation: "CO₂ is linear and symmetrical. The two equal C=O bond dipoles act in opposite directions and cancel.",
      source: "Chemistry Coursebook · p. 67 · Fig. 3.19",
      visual: "molecule",
    },
    {
      id: "chem-curly-arrow",
      code: "14.2",
      eyebrow: "Exam technique · misconception",
      objective: "14.2 Organic mechanisms",
      marks: 2,
      skill: "Exam technique",
      difficulty: 2,
      prompt: "In an electrophilic addition mechanism, what does a curly arrow represent?",
      options: [
        "The movement of an atom",
        "The movement of an electron pair",
        "The direction of the overall reaction",
        "A temporary ionic bond",
      ],
      answer: 1,
      hint: "The arrow must start at either a bond or a lone pair.",
      misconception: "Meaning of curly arrows",
      explanation: "A full-headed curly arrow shows the movement of an electron pair and must start at a bond or lone pair.",
      source: "Chemistry Coursebook · p. 311 · Syllabus 14.2(a)",
    },
    {
      id: "chem-isotope",
      code: "2.1",
      eyebrow: "Retrieval · atomic structure",
      objective: "2.1 Atomic structure",
      marks: 1,
      skill: "Knowledge",
      difficulty: 1,
      prompt: "Two isotopes of the same element have different numbers of which particle?",
      options: ["Protons", "Neutrons", "Electrons in neutral atoms", "Valence shells"],
      answer: 1,
      hint: "The proton number defines the element.",
      misconception: "Isotope definition",
      explanation: "Isotopes have the same number of protons but different numbers of neutrons, so they have different mass numbers.",
      source: "Chemistry Coursebook · atomic structure",
    },
    {
      id: "chem-kc-temperature",
      code: "7.1",
      eyebrow: "Follow-up · equilibrium constant",
      objective: "7.1 Equilibria",
      marks: 2,
      skill: "Application",
      difficulty: 3,
      prompt: "Which change can alter the numerical value of Kc for a given reaction?",
      options: ["Adding a catalyst", "Changing concentration", "Changing pressure", "Changing temperature"],
      answer: 3,
      hint: "Separate changes that shift position from changes that alter the equilibrium constant itself.",
      misconception: "Kc versus equilibrium position",
      explanation: "For a specified reaction, Kc changes only with temperature. Other changes may shift the equilibrium position but do not change Kc at constant temperature.",
      source: "Chemistry Coursebook · equilibria",
    },
    {
      id: "chem-water-shape",
      code: "3.3",
      eyebrow: "Application · molecular shape",
      objective: "3.3 Chemical bonding",
      marks: 2,
      skill: "Application",
      difficulty: 2,
      prompt: "Why is the H–O–H bond angle smaller than the tetrahedral angle?",
      options: ["O–H bonds are non-polar", "Lone pairs repel more strongly than bond pairs", "Hydrogen atoms contain no neutrons", "Oxygen cannot hybridise"],
      answer: 1,
      hint: "Compare repulsion involving lone pairs with repulsion between bonding pairs.",
      misconception: "Electron-pair repulsion",
      explanation: "Two lone pairs on oxygen repel bonding pairs more strongly than bonding pairs repel each other, compressing the H–O–H angle.",
      source: "Chemistry Coursebook · molecular shapes",
    },
    {
      id: "chem-nucleophile",
      code: "14.2",
      eyebrow: "Adaptive follow-up · mechanism",
      objective: "14.2 Organic mechanisms",
      marks: 2,
      skill: "Application",
      difficulty: 3,
      prompt: "Which species is most likely to act as a nucleophile?",
      options: ["H⁺", "AlCl₃", "NH₃", "BF₃"],
      answer: 2,
      hint: "A nucleophile donates an electron pair.",
      misconception: "Nucleophile versus electrophile",
      explanation: "Ammonia has a lone pair on nitrogen that can be donated to an electron-deficient centre.",
      source: "Chemistry Coursebook · organic mechanisms",
    },
    {
      id: "chem-mass-spectrum",
      code: "2.1",
      eyebrow: "Data interpretation · mass spectrum",
      objective: "2.1 Atomic structure",
      marks: 2,
      skill: "Application",
      difficulty: 2,
      prompt: "A mass spectrum shows peaks at m/z 35 and 37 in a 3:1 ratio. What is the relative atomic mass?",
      options: ["35.0", "35.5", "36.0", "37.0"],
      answer: 1,
      hint: "Calculate the weighted mean using three parts of 35 and one part of 37.",
      misconception: "Weighted mean of isotopes",
      explanation: "(3 × 35 + 1 × 37) ÷ 4 = 35.5.",
      source: "Chemistry Coursebook · mass spectrometry",
    },
  ],
};

const nav: { id: View; label: string; icon: string }[] = [
  { id: "today", label: "Today", icon: "⌂" },
  { id: "map", label: "Syllabus map", icon: "◎" },
  { id: "pipeline", label: "Content pipeline", icon: "◫" },
  { id: "library", label: "My materials", icon: "▤" },
  { id: "progress", label: "Progress", icon: "↗" },
  { id: "activity", label: "Teacher activity", icon: "◉" },
];

function Ring({ value, size = 42 }: { value: number; size?: number }) {
  return (
    <span className="ring" style={{ "--value": `${value * 3.6}deg`, width: size, height: size } as React.CSSProperties}>
      <span>{value}</span>
    </span>
  );
}

function activityTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "No activity yet" : new Intl.DateTimeFormat("en-SG", { timeZone: "Asia/Singapore", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

function SourceVisual({ kind }: { kind: Question["visual"] }) {
  if (kind === "molecule") {
    return (
      <div className="source-visual molecule" aria-label="Linear carbon dioxide molecule diagram">
        <span>O</span><i>═</i><b>C</b><i>═</i><span>O</span>
        <div className="dipole left">δ− ← δ+</div>
        <div className="dipole right">δ+ → δ−</div>
      </div>
    );
  }
  return (
    <div className="source-visual chloroplast" aria-label="Stylised chloroplast diagram with highlighted grana">
      <div className="chloroplast-shell">
        <span className="grana g1" /><span className="grana g2 active" /><span className="grana g3" />
        <span className="lamella" /><span className="stroma-dot d1" /><span className="stroma-dot d2" />
      </div>
      <span className="figure-label">Highlighted region</span>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("today");
  const [subject, setSubject] = useState<Subject>("Biology");
  const [masteryState, setMasteryState] = useState(initialMastery);
  const [minutes, setMinutes] = useState(25);
  const [mode, setMode] = useState("Adaptive");
  const [session, setSession] = useState(false);
  const [sessionKind, setSessionKind] = useState<SessionKind>("practice");
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [sessionTarget, setSessionTarget] = useState(5);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [awardedPoints, setAwardedPoints] = useState<number[]>([]);
  const [marked, setMarked] = useState(false);
  const [answerConfidence, setAnswerConfidence] = useState<Confidence | null>(null);
  const [usedHint, setUsedHint] = useState(false);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [evidenceAdded, setEvidenceAdded] = useState(0);
  const [lastResult, setLastResult] = useState<{ code: string; correct: boolean; format: QuestionFormat } | null>(null);
  const [lastEvidence, setLastEvidence] = useState<{ delta: number; label: string; confidence: Confidence } | null>(null);
  const [sessionResults, setSessionResults] = useState<SessionResult[]>([]);
  const [todayStats, setTodayStats] = useState({ answered: 0, secure: 0 });
  const [learningGaps, setLearningGaps] = useState<LearningGap[]>([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [complete, setComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cloudStatus, setCloudStatus] = useState("Connecting to saved progress…");
  const [uploading, setUploading] = useState(false);
  const [packStates, setPackStates] = useState<PackState[]>(initialPackStates);
  const [packAdmin, setPackAdmin] = useState(false);
  const [packSaving, setPackSaving] = useState<number | null>(null);
  const [packNotice, setPackNotice] = useState("");
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [enrollmentError, setEnrollmentError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [activityLoading, setActivityLoading] = useState(true);
  const [files, setFiles] = useState<FileItem[]>(biologyFileItems);
  const fileInput = useRef<HTMLInputElement>(null);
  const currentMastery = masteryState[subject];
  const average = Math.round(currentMastery.reduce((sum, item) => sum + item.score, 0) / currentMastery.length);
  const totalEvidence = currentMastery.reduce((sum, item) => sum + item.evidence, 0);
  const activeQuestion = sessionQuestions[questionIndex] ?? questions[subject][0];
  const activeFormat = activeQuestion.format ?? "mcq";
  const isWritten = Boolean(activeQuestion.markPoints?.length);
  const preferredFormats = mode === "Exam-style" ? ["structured", "practical", "data"] : mode === "Image-heavy" ? ["image", "data"] : [];
  const plannedQuestions = minutes === 15 ? 5 : minutes === 40 ? 12 : 8;
  const today = dateKey();
  const practiceMastery = useMemo(() => currentMastery.filter((item) => objectiveNeedsPractice(item, today)), [currentMastery, today]);
  const dailyPlan = useMemo(() => [...practiceMastery].sort((a, b) => Number(isReviewDue(b.due, today)) - Number(isReviewDue(a.due, today)) || a.score - b.score || a.evidence - b.evidence).slice(0, 5), [practiceMastery, today]);
  const dueCount = currentMastery.filter((item) => isReviewDue(item.due, today)).length;
  const liveBiologyQuestions = useMemo(() => {
    const liveOrders = new Set(packStates.filter((pack) => pack.status === "Live").map((pack) => pack.packOrder));
    return verifiedBiologyQuestions.filter((question) => {
      const order = packOrderForSource(question.source);
      return order !== null && liveOrders.has(order);
    });
  }, [packStates]);
  const adaptiveBiologyQuestions = useMemo(() => {
    const activeCodes = new Set(practiceMastery.map((item) => item.code));
    return liveBiologyQuestions.filter((question) => activeCodes.has(question.code));
  }, [liveBiologyQuestions, practiceMastery]);
  const livePackCount = packStates.filter((pack) => pack.status === "Live").length;
  const draftPackCount = packStates.filter((pack) => pack.status === "Draft").length;
  const mappedObjectiveCount = syllabusAreas.reduce((total, area) => total + area.outcomes, 0);
  const sourcedObjectiveCount = syllabusAreas.reduce((total, area) => total + area.sourced, 0);
  const verifiedObjectiveCount = syllabusAreas.reduce((total, area) => total + area.verified, 0);
  const missingObjectiveCount = mappedObjectiveCount - sourcedObjectiveCount;
  const restingCount = currentMastery.length - practiceMastery.length;

  const weakTopic = useMemo(() => [...currentMastery].sort((a, b) => a.score - b.score)[0], [currentMastery]);
  const sessionGaps = [...new Set(sessionResults.flatMap((result) => result.missedPoints))];
  const supportedCount = sessionResults.filter((result) => result.correct && !result.secure).length;
  const revisitTopics = [...new Set(sessionResults.filter((result) => !result.correct).map((result) => result.topic))];
  const skillProfile = [
    ["Knowledge", Math.round(currentMastery.reduce((sum, item) => sum + item.knowledge, 0) / currentMastery.length)],
    ["Application", Math.round(currentMastery.reduce((sum, item) => sum + item.application, 0) / currentMastery.length)],
    ["Exam language", Math.round(currentMastery.reduce((sum, item) => sum + item.exam, 0) / currentMastery.length)],
  ] as const;

  useEffect(() => {
    let active = true;
    fetch(`/api/learning?subject=${subject}`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(async (learning) => {
        const [materials, packs, student] = await Promise.all([
          fetch("/api/materials").then((response) => response.ok ? response.json() : Promise.reject()),
          fetch("/api/packs").then((response) => response.ok ? response.json() : Promise.reject()),
          fetch("/api/activity?student=1").then((response) => response.ok ? response.json() : Promise.reject()),
        ]);
        return [learning, materials, packs, student];
      }).then(([learning, materials, packs, student]) => {
      if (!active) return;
      setMasteryState((current) => ({ ...current, [subject]: learning.mastery as MasteryItem[] }));
      setTodayStats(learning.todayStats ?? { answered: 0, secure: 0 });
      setLearningGaps(learning.missedPoints ?? []);
      setTotalAttempts(learning.attempts ?? 0);
      setPackStates(packs.packs as PackState[]);
      setPackAdmin(Boolean(packs.isAdmin));
      setStudentProfile(student.profile as StudentProfile | null);
      setProfileLoaded(true);
      const base: FileItem[] = subject === "Biology" ? biologyFileItems : [
        { name: "H2 Chemistry course materials", meta: "Awaiting source pack", tag: "Source pack", status: "Needed" },
        { name: "9476 H2 Chemistry syllabus.pdf", meta: "2026 exam pack · active", tag: "Syllabus", status: "Ready" },
      ];
      const uploaded = (materials.materials as { id: string; name: string; size: number; status: string }[]).map((file) => ({
        id: file.id,
        name: file.name,
        meta: `${Math.max(1, Math.round(file.size / 1024 / 1024))} MB · ${file.status}`,
        tag: "Your upload",
        status: "Stored",
      }));
      setFiles([...base, ...uploaded]);
      setCloudStatus(`Saved · ${learning.attempts} answer${learning.attempts === 1 ? "" : "s"} recorded`);
    }).catch(() => active && setCloudStatus("Cloud save unavailable · retry on refresh"));
    return () => { active = false; };
  }, [subject]);

  useEffect(() => {
    if (!packAdmin) return;
    fetch("/api/activity")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((result) => setActivity(result as ActivityData))
      .catch(() => setActivity(null))
      .finally(() => setActivityLoading(false));
  }, [packAdmin]);

  async function registerStudent(event: React.FormEvent) {
    event.preventDefault();
    setRegistering(true);
    setEnrollmentError("");
    const response = await fetch("/api/activity", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ displayName: studentName, classCode }),
    });
    const result = await response.json();
    if (response.ok) setStudentProfile(result.profile as StudentProfile);
    else setEnrollmentError(result.error ?? "Unable to join this class");
    setRegistering(false);
  }

  function startSession(kind: SessionKind = "practice", focusCode?: string) {
    const target = kind === "diagnostic" ? 8 : kind === "quick" ? 6 : minutes === 15 ? 5 : minutes === 40 ? 12 : 8;
    const pool = subject === "Biology" ? liveBiologyQuestions : questions[subject];
    const focusedPool = focusCode ? pool.filter((question) => question.code === focusCode) : subject === "Biology" ? adaptiveBiologyQuestions : pool;
    const first = pickNextQuestion({ questions: focusedPool, seenIds: [], mastery: currentMastery, preferredFormats });
    if (!first) {
      setCloudStatus("No published questions are available for this objective yet");
      setSession(false);
      return;
    }
    setSessionKind(kind);
    setSessionTarget(target);
    setSessionQuestions(first ? [first] : []);
    setSession(true);
    setQuestionIndex(0);
    setSelected(null);
    setWrittenAnswer("");
    setAwardedPoints([]);
    setMarked(false);
    setAnswerConfidence(null);
    setUsedHint(false);
    setChecked(false);
    setScore(0);
    setEvidenceAdded(0);
    setLastResult(null);
    setLastEvidence(null);
    setSessionResults([]);
    setComplete(false);
  }

  async function recordAnswer(selectedAnswer?: number, responseText = "") {
    if (answerConfidence === null) return;
    setSaving(true);
    let awardedPointIndexes = isWritten ? gradeStructuredAnswer(activeQuestion.markPoints!, responseText).awardedPointIndexes : [];
    const awardedMarks = awardedPointIndexes.length;
    let missedPoints = isWritten ? activeQuestion.markPoints!.filter((_, index) => !awardedPointIndexes.includes(index)) : [];
    let correct = isWritten
      ? Number(awardedMarks) / activeQuestion.marks >= 0.75
      : selectedAnswer === activeQuestion.answer;
    let delta = isWritten
      ? evidenceDeltaFromMarks({ awardedMarks: Number(awardedMarks), totalMarks: activeQuestion.marks, confidence: answerConfidence, usedHint, difficulty: activeQuestion.difficulty })
      : evidenceDelta({ correct, confidence: answerConfidence, usedHint, difficulty: activeQuestion.difficulty });
    let serverMastery: Partial<MasteryItem> | null = null;
    if (subject === "Biology" && activeQuestion.sourceImage) {
      try {
        const response = await fetch("/api/learning", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ questionId: activeQuestion.id, selected: selectedAnswer, writtenAnswer: isWritten ? responseText : undefined, confidence: answerConfidence, usedHint }),
        });
        if (!response.ok) throw new Error("Save failed");
        const result = await response.json();
        correct = result.correct;
        delta = result.delta;
        awardedPointIndexes = result.awardedPointIndexes ?? awardedPointIndexes;
        missedPoints = result.missedPoints ?? missedPoints;
        serverMastery = result.mastery;
        setCloudStatus("Saved just now");
      } catch {
        setCloudStatus("Answer shown · cloud save will need a retry");
      }
    }
    setAwardedPoints(awardedPointIndexes);
    setMasteryState((current) => ({
      ...current,
      [subject]: current[subject].map((item) => {
        if (item.code !== activeQuestion.code) return item;
        if (serverMastery) return { ...item, ...serverMastery } as MasteryItem;
        const evidence = item.evidence + 1;
        const update = (value: number) => Math.max(0, Math.min(100, value + delta));
        const skillUpdates = activeQuestion.skill === "Knowledge"
          ? { knowledge: update(item.knowledge) }
          : activeQuestion.skill === "Exam technique"
            ? { exam: update(item.exam) }
            : { application: update(item.application) };
        return {
          ...item,
          ...skillUpdates,
          score: update(item.score),
          evidence,
          confidence: evidenceConfidence(evidence) as Confidence,
          note: correct ? `${activeQuestion.skill} evidence strengthened` : missedPoints[0] ?? activeQuestion.misconception,
          due: nextReviewDate({ correct, confidence: answerConfidence, usedHint, evidence }),
        };
      }),
    }));
    setChecked(true);
    setMarked(true);
    setLastResult({ code: activeQuestion.code, correct, format: activeFormat });
    setLastEvidence({ delta, label: activeQuestion.skill, confidence: answerConfidence });
    setEvidenceAdded((value) => value + 1);
    const secure = correct && answerConfidence !== "Low" && !usedHint;
    if (secure) setScore((value) => value + 1);
    setTodayStats((current) => ({ answered: current.answered + 1, secure: current.secure + Number(correct) }));
    setTotalAttempts((current) => current + 1);
    setSessionResults((current) => [...current, { code: activeQuestion.code, topic: currentMastery.find((item) => item.code === activeQuestion.code)?.topic ?? activeQuestion.objective, correct, secure, format: activeFormat, missedPoints }]);
    if (missedPoints.length) setLearningGaps((current) => {
      const next = [...current];
      for (const point of missedPoints) {
        const index = next.findIndex((item) => item.code === activeQuestion.code && item.point === point);
        if (index >= 0) next[index] = { ...next[index], count: next[index].count + 1 };
        else next.push({ code: activeQuestion.code, point, count: 1 });
      }
      return next.sort((a, b) => b.count - a.count).slice(0, 6);
    });
    setSaving(false);
  }

  async function checkAnswer() {
    if (answerConfidence === null) return;
    if (isWritten) {
      if (!writtenAnswer.trim()) return;
      await recordAnswer(undefined, writtenAnswer);
      return;
    }
    if (selected === null) return;
    await recordAnswer(selected);
  }

  function nextQuestion() {
    if (questionIndex + 1 >= sessionTarget) {
      setComplete(true);
      return;
    }
    const next = pickNextQuestion({
      questions: subject === "Biology" ? adaptiveBiologyQuestions : questions[subject],
      seenIds: sessionQuestions.map((question) => question.id),
      mastery: currentMastery,
      lastResult,
      preferredFormats,
    });
    if (!next) {
      setComplete(true);
      return;
    }
    setSessionQuestions((current) => [...current, next]);
    setQuestionIndex((value) => value + 1);
    setSelected(null);
    setWrittenAnswer("");
    setAwardedPoints([]);
    setMarked(false);
    setAnswerConfidence(null);
    setUsedHint(false);
    setChecked(false);
    setLastEvidence(null);
  }

  function changeSubject(next: Subject) {
    setSubject(next);
    setSession(false);
  }

  async function updatePack(packOrder: number, status: PackStatus) {
    const current = packStates.find((pack) => pack.packOrder === packOrder);
    if (!current || !packAdmin) return;
    if (current.status === "Live" && status === "Draft" && !window.confirm("Unpublish this pack? Students will stop receiving its questions immediately.")) return;
    setPackSaving(packOrder);
    setPackNotice("");
    try {
      const response = await fetch("/api/packs", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packOrder, status, releaseNote: current.releaseNote }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Pack update failed");
      setPackStates((packs) => packs.map((pack) => pack.packOrder === packOrder ? result.pack : pack));
      setPackNotice(status === "Live" ? "Pack published. It is now in adaptive practice." : status === "Verified" ? "Pack verified. It is ready for final publishing." : "Pack unpublished. Its questions are no longer served to students.");
      setSession(false);
    } catch (error) {
      setPackNotice(error instanceof Error ? error.message : "Pack update failed");
    } finally {
      setPackSaving(null);
    }
  }

  async function addFiles(list: FileList | null) {
    if (!list?.length) return;
    setView("library");
    setUploading(true);
    for (const file of Array.from(list)) {
      const data = new FormData();
      data.append("file", file);
      try {
        const response = await fetch("/api/materials", { method: "POST", body: data });
        if (!response.ok) throw new Error("Upload failed");
        const { material } = await response.json();
        setFiles((current) => [...current, {
          id: material.id,
          name: material.name,
          meta: `${Math.max(1, Math.round(material.size / 1024 / 1024))} MB · ${material.status}`,
          tag: "Your upload",
          status: "Stored",
        }]);
      } catch {
        setFiles((current) => [...current, { name: file.name, meta: "Upload failed · try again", tag: "Your upload", status: "Error" }]);
      }
    }
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function removeFile(file: FileItem) {
    if (!file.id) return;
    const response = await fetch(`/api/materials?id=${encodeURIComponent(file.id)}`, { method: "DELETE" });
    if (response.ok) setFiles((current) => current.filter((item) => item.id !== file.id));
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setView("today")} aria-label="Aster home">
          <span className="brand-mark">A</span>
          <span>Aster<small>A Level learning coach</small></span>
        </button>

        <nav aria-label="Main navigation">
          <p className="nav-label">Study</p>
          {nav.filter((item) => item.id !== "activity" || packAdmin).map((item) => (
            <button key={item.id} className={view === item.id ? "nav-item active" : "nav-item"} onClick={() => { setView(item.id); setSession(false); }}>
              <span>{item.icon}</span>{item.label}
              {item.id === "pipeline" && subject === "Biology" && <em>18</em>}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="exam-card">
          <div className="exam-card-head"><span>Exam countdown</span><b>42 days</b></div>
          <strong>Singapore–Cambridge</strong>
          <p>H2 {subject} · {subject === "Biology" ? "9744" : "9476"}</p>
          <div className="mini-progress"><span style={{ width: `${average}%` }} /></div>
          <small>{average}% syllabus mastery</small>
        </div>
        <button className="profile"><span>{packAdmin ? "E" : studentProfile?.displayName[0]?.toUpperCase() ?? "S"}</span><div><strong>{packAdmin ? "Owner" : studentProfile?.displayName ?? "Student"}</strong><small>{packAdmin ? "Teacher activity enabled" : "Target grade · A"}</small></div><i>•••</i></button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="subject-switch" aria-label="Choose subject">
            {(["Biology", "Chemistry"] as Subject[]).map((item) => (
              <button key={item} className={subject === item ? "active" : ""} onClick={() => changeSubject(item)}>
                <span className={item === "Biology" ? "subject-dot bio" : "subject-dot chem"} />{item}
              </button>
            ))}
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Search">⌕</button>
            <button className="icon-button notification" aria-label="Notifications">♢<span /></button>
            <button className="outline-button" onClick={() => fileInput.current?.click()}>＋ Add material</button>
            <input ref={fileInput} type="file" accept=".pdf,.png,.jpg,.jpeg" multiple hidden onChange={(event) => addFiles(event.target.files)} />
          </div>
        </header>

        {session ? (
          <section className="quiz-view">
            <div className="quiz-topline">
              <button className="back-button" onClick={() => setSession(false)}>← Exit session</button>
              <div className="session-progress"><span style={{ width: `${((questionIndex + (checked ? 1 : 0)) / sessionTarget) * 100}%` }} /></div>
              <span>{questionIndex + 1} / {sessionTarget}</span>
            </div>

            {!complete ? (
              <div className="quiz-layout">
                <article className="question-card">
                  <div className="question-meta"><span>{sessionKind === "quick" ? "Quick Check" : sessionKind === "diagnostic" ? "Full Diagnostic" : activeQuestion.eyebrow}</span><b>{activeQuestion.marks} {activeQuestion.marks === 1 ? "mark" : "marks"}</b></div>
                  <p className="objective-tag">Syllabus {activeQuestion.objective}</p>
                  <div className="question-signals"><span>{formatLabels[activeFormat]}</span><span>{activeQuestion.skill}</span><span>Difficulty {activeQuestion.difficulty}/3</span><span>Evidence point {evidenceAdded + 1}</span></div>
                  <h1>{activeQuestion.prompt}</h1>
                  {activeQuestion.visual && <SourceVisual kind={activeQuestion.visual} />}
                  {activeQuestion.sourceImage && (activeQuestion.skill === "Image" || activeFormat === "image") && (
                    <figure className="source-figure">
                      <img src={activeQuestion.sourceImage} alt={`Source page ${activeQuestion.sourcePage} for this Biology question`} />
                      <figcaption>Real textbook figure · inspect the full verified page in the source panel</figcaption>
                    </figure>
                  )}
                  {activeQuestion.data && <div className="data-table" role="table" aria-label="Question data"><div role="row">{activeQuestion.data.headers.map((cell) => <b role="columnheader" key={cell}>{cell}</b>)}</div>{activeQuestion.data.rows.map((row) => <div role="row" key={row.join("-")}>{row.map((cell) => <span role="cell" key={cell}>{cell}</span>)}</div>)}</div>}
                  {isWritten ? (
                    !checked ? <label className="written-response"><span>Your answer</span><textarea value={writtenAnswer} onChange={(event) => setWrittenAnswer(event.target.value)} placeholder={`Write an exam-style response worth ${activeQuestion.marks} marks…`} /></label> : (
                      <div className="mark-review">
                        <div><strong>Automatic mark-point score · {awardedPoints.length}/{activeQuestion.marks}</strong><span>Aster matched your written response against the verified mark scheme.</span></div>
                        {activeQuestion.markPoints?.map((point, index) => <button key={point} disabled aria-pressed={awardedPoints.includes(index)}><i>{awardedPoints.includes(index) ? "✓" : "×"}</i><span>{point}</span></button>)}
                        {activeQuestion.modelAnswer && <details><summary>Show model answer</summary><p>{activeQuestion.modelAnswer}</p></details>}
                      </div>
                    )
                  ) : (
                    <div className="options">
                      {(activeQuestion.options ?? []).map((option, index) => {
                        const state = checked
                          ? index === activeQuestion.answer ? "correct" : selected === index ? "wrong" : ""
                          : selected === index ? "selected" : "";
                        return (
                          <button key={option} className={`option ${state}`} onClick={() => !checked && setSelected(index)}>
                            <span>{activeFormat === "sequence" ? index + 1 : String.fromCharCode(65 + index)}</span><p>{option}</p>{state === "correct" && <b>✓</b>}{state === "wrong" && <b>×</b>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {!checked ? (
                    <div className="answer-actions">
                      <div className="hint-row">
                        <button onClick={() => setUsedHint(true)} disabled={usedHint}>◎ {usedHint ? "Hint used" : "Show a hint"}</button>
                        {usedHint && <p>{activeQuestion.hint}</p>}
                      </div>
                      <div className="confidence-inline">
                        <span>Before checking, how confident are you?</span>
                        <div>{(["Low", "Medium", "High"] as Confidence[]).map((level) => <button key={level} aria-pressed={answerConfidence === level} onClick={() => setAnswerConfidence(level)}>{level}</button>)}</div>
                      </div>
                      <button className="primary-button submit" disabled={(isWritten ? !writtenAnswer.trim() : selected === null) || answerConfidence === null || saving} onClick={checkAnswer}>{saving ? "Scoring response…" : isWritten ? "Score answer automatically" : "Check answer"}</button>
                    </div>
                  ) : marked && (
                    <div className={lastResult?.correct ? "feedback success" : "feedback retry"}>
                      <div><span>{lastResult?.correct ? "✓" : "↗"}</span><strong>{lastResult?.correct ? isWritten ? "Secure response" : "Exactly right" : isWritten ? "Targeted follow-up needed" : "This is the key distinction"}</strong></div>
                      <p>{activeQuestion.explanation}</p>
                      {lastEvidence && <div className="evidence-result"><span>{lastEvidence.delta >= 0 ? `+${lastEvidence.delta}` : lastEvidence.delta}</span><p>{lastEvidence.label} evidence · {lastEvidence.confidence} confidence</p></div>}
                      <button className="primary-button" onClick={nextQuestion}>{questionIndex + 1 >= sessionTarget ? "See session summary" : lastResult?.correct ? "Continue adaptive path" : "Try a different format"} →</button>
                    </div>
                  )}
                </article>

                <aside className="source-panel">
                  <div className="source-panel-head"><span>Source evidence</span><b>{checked ? "Unlocked" : "Verified"}</b></div>
                  {!checked ? <div className="source-locked"><span>⌁</span><strong>Evidence hidden until you answer</strong><p>Commit to your own reasoning first. The relevant textbook page will unlock with the feedback.</p><small>Source verified · Syllabus linked</small></div> : activeQuestion.sourceImage ? <a className="real-page-preview" href={activeQuestion.sourceImage} target="_blank" rel="noreferrer"><img src={activeQuestion.sourceImage} alt={`Verified Biology source page ${activeQuestion.sourcePage}`} /><span>Printed page {activeQuestion.sourcePage} · click to enlarge</span></a> : <div className="page-preview"><span className="page-number">74</span><h4>{subject === "Biology" ? "The fluid mosaic model" : "Dynamic equilibrium"}</h4><p>The arrangement and behaviour described here explains the relationship tested in this question.</p><p className="highlight">Relevant syllabus-linked evidence is highlighted so you can verify every answer.</p><div className="text-lines"><i /><i /><i /><i /></div></div>}
                  <p className="source-name">▤ {activeQuestion.source}</p>
                  {checked && activeQuestion.sourceUrl ? <a className="source-link" href={activeQuestion.sourceUrl} target="_blank" rel="noreferrer">Open supporting practical protocol ↗</a> : checked && activeQuestion.sourceImage ? <a className="source-link" href={activeQuestion.sourceImage} target="_blank" rel="noreferrer">Open full source page ↗</a> : <span className="source-link">{checked ? "Source citation available" : "Full page unlocks after submission"}</span>}
                  <div className="evidence-context"><span>Why this question?</span><p>{marked && lastResult?.correct === false ? `You showed a possible ${activeQuestion.misconception.toLowerCase()} gap, so the next question will keep the objective but change the format.` : `This objective has limited recent evidence. Aster is checking ${activeQuestion.skill.toLowerCase()} through a ${formatLabels[activeFormat].toLowerCase()} before changing its mastery estimate.`}</p></div>
                </aside>
              </div>
            ) : (
              <div className="completion-card">
                <span className="completion-mark">✓</span>
                <p>{sessionKind === "quick" ? "Quick Check complete" : sessionKind === "diagnostic" ? "Diagnostic evidence saved" : "Adaptive session complete"}</p>
                <h1>{score} of {evidenceAdded} secure</h1>
                <p>Aster separated secure answers from answers that used a hint or low confidence, then scheduled the next review.</p>
                <div className="completion-stats"><div><b>{score}</b><span>Secure independently</span></div><div><b>{supportedCount}</b><span>Correct with support</span></div><div><b>{revisitTopics.length}</b><span>Topics to revisit</span></div></div>
                <div className="completion-insights">
                  <div><strong>Next review</strong><span>{dailyPlan[0] ? `${reviewLabel(dailyPlan[0].due, today)} · ${dailyPlan[0].topic}` : "Plan complete for today"}</span></div>
                  <div><strong>Mark points to repair</strong>{sessionGaps.length ? <ul>{sessionGaps.slice(0, 4).map((point) => <li key={point}>{point}</li>)}</ul> : <span>No structured-answer gaps recorded in this session.</span>}</div>
                  <div><strong>Adaptive follow-up</strong><span>{revisitTopics.length ? `${revisitTopics.slice(0, 2).join(" and ")} will return in a different format.` : "The next session will move to the weakest due objectives."}</span></div>
                </div>
                <div className="completion-actions"><button className="primary-button" onClick={() => { setSession(false); setView("today"); }}>Return to Today</button><button className="outline-button" onClick={() => { setSession(false); setView("map"); }}>View mastery map</button></div>
              </div>
            )}
          </section>
        ) : view === "today" ? (
          <section className="page-content">
            <div className="page-heading">
              <div><p>{new Intl.DateTimeFormat("en-SG", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Singapore" }).format(new Date())}</p><h1>Your Biology plan for today</h1><span>{dueCount ? `${dueCount} objectives are due. Aster has prioritised the weakest evidence first.` : restingCount ? `${restingCount} mastered objective${restingCount === 1 ? " is" : "s are"} resting until review. Aster will work only on remaining gaps.` : "No reviews are overdue. Today will strengthen your least-certain objectives."}</span></div>
              <div className="streak"><span>✓</span><div><strong>{todayStats.answered} answered today</strong><small>{todayStats.secure} correct · {dueCount} reviews due</small></div></div>
            </div>

            <article className="assessment-strip">
              <div className="assessment-status"><span>Evidence confidence</span><strong>{totalEvidence < 24 ? "Developing" : "Established"}</strong><small>{totalEvidence} evidence points · {cloudStatus}</small></div>
              <div className="assessment-copy"><strong>Continuous assessment</strong><p>Every answer updates mastery and a real review date. Secure objectives pause automatically; omissions return as targeted practice.</p></div>
              <button className="outline-button" disabled={!practiceMastery.length} onClick={() => startSession("quick")}>Quick Check · 6</button>
              <button className="primary-button" disabled={!practiceMastery.length} onClick={() => startSession("diagnostic")}>Full Diagnostic · 8 →</button>
            </article>

            <div className="hero-grid">
              <article className="focus-card">
                <div className="focus-top"><span>{subject === "Biology" ? "DAILY STUDY PLAN" : "YOUR NEXT SESSION"}</span><em>{dueCount ? `${dueCount} due` : "On schedule"}</em></div>
                <h2>{subject === "Biology" ? dailyPlan[0] ? `Start with ${dailyPlan[0].topic}` : "You’re caught up" : `Strengthen ${weakTopic.topic.toLowerCase()}`}</h2>
                <p>{subject === "Biology" ? dailyPlan[0] ? `Aster will mix ${plannedQuestions} questions across due reviews, weak evidence and different exam formats. The plan changes after every answer.` : "No reinforcement is needed now. Mastered objectives will return automatically on their review date." : "Today mixes retrieval, explanation and unfamiliar applications around your weakest evidence."}</p>
                <div className="session-tags"><span>◷ {minutes} min</span><span>◎ {plannedQuestions} questions</span><span>▧ {mode}</span></div>
                <div className="focus-controls">
                  <div className="segmented" aria-label="Session duration">
                    {[15, 25, 40].map((value) => <button key={value} className={minutes === value ? "active" : ""} onClick={() => setMinutes(value)}>{value}m</button>)}
                  </div>
                  <button className="primary-button" disabled={subject === "Biology" && !practiceMastery.length} onClick={() => startSession("practice")}>{subject === "Biology" && !practiceMastery.length ? "Plan complete" : "Start today’s plan"} <span>→</span></button>
                </div>
                <div className="focus-decoration"><span /><span /><span /></div>
              </article>

              <article className="readiness-card">
                <div className="card-title"><div><span>Exam readiness</span><small>Target grade A</small></div><button onClick={() => setView("progress")}>View details</button></div>
                <div className="readiness-body"><Ring value={average} size={112} /><div><strong>{average}%</strong><p>On track for a <b>B</b></p><small>12% to target</small></div></div>
                <div className="readiness-footer"><span><i className="good" />Knowledge <b>78</b></span><span><i className="mid" />Application <b>61</b></span><span><i className="low" />Exam skill <b>54</b></span></div>
              </article>
            </div>

            <div className="lower-grid">
              <article className="panel mastery-panel">
                <div className="panel-heading"><div><h3>Priority objectives</h3><p>Chosen from your syllabus and recent answers</p></div><button onClick={() => setView("map")}>Full map →</button></div>
                <div className="mastery-list">
                  {dailyPlan.length ? dailyPlan.map((item) => (
                    <button className="mastery-row" key={item.code} onClick={() => startSession("practice", item.code)}>
                      <Ring value={item.score} />
                      <div><strong>{item.topic}</strong><span>{item.note} · {reviewLabel(item.due, today)}</span></div>
                      <em>Syllabus {item.code}</em>
                      <small className={isReviewDue(item.due, today) ? "due" : ""}>{reviewLabel(item.due, today)}</small>
                      <b>›</b>
                    </button>
                  )) : <div className="empty-evidence"><strong>No objectives need reinforcement</strong><p>Aster will bring them back when a scheduled review becomes due.</p></div>}
                </div>
              </article>

              <article className="panel setup-panel">
                <div className="panel-heading"><div><h3>Shape this session</h3><p>Preference guides the format; performance guides the content.</p></div></div>
                <div className="setup-label">Question approach</div>
                <div className="mode-list">
                  {["Adaptive", "Exam-style", "Image-heavy"].map((item) => <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}><span>{item === "Adaptive" ? "✦" : item === "Exam-style" ? "▤" : "▧"}</span><div><strong>{item}</strong><small>{item === "Adaptive" ? "Best next question" : item === "Exam-style" ? "Paper wording & marks" : "Figures, graphs & diagrams"}</small></div><i>{mode === item ? "●" : "○"}</i></button>)}
                </div>
              </article>
            </div>
            {learningGaps.length > 0 && <article className="panel gap-panel"><div className="panel-heading"><div><h3>Recurring mark-point gaps</h3><p>Aster saved these exact omissions from structured answers.</p></div><button onClick={() => setView("progress")}>All learning evidence →</button></div><div className="gap-list">{learningGaps.slice(0, 4).map((gap) => <button key={`${gap.code}-${gap.point}`} onClick={() => startSession("practice", gap.code)}><span>{gap.code}</span><p>{gap.point}</p><b>{gap.count}×</b></button>)}</div></article>}
          </section>
        ) : view === "map" ? (
          <section className="page-content map-page">
            <div className="page-heading"><div><p>Singapore–Cambridge · H2 {subject === "Biology" ? "9744" : "9476"} · 2026</p><h1>{subject === "Biology" ? "Complete syllabus map" : "Syllabus mastery map"}</h1><span>{subject === "Biology" ? "Coverage tells you what the sources contain; mastery tells you what you can reliably do." : "Mastery and evidence confidence are separate, so an early estimate never looks final."}</span></div><button className="primary-button" onClick={() => startSession("practice")}>Practise weak areas →</button></div>
            {subject === "Biology" ? (
              <>
                <div className="coverage-summary"><article><b>{mappedObjectiveCount}</b><span>Content outcomes mapped</span></article><article><b>{sourcedObjectiveCount}</b><span>Covered by supplied PDFs</span></article><article><b>{verifiedObjectiveCount}</b><span>Objectives fully verified</span></article><article className="missing"><b>{missingObjectiveCount}</b><span>Missing source outcomes</span></article></div>
                <article className="panel coverage-table">
                  <div className="coverage-header"><span>Syllabus area</span><span>Outcomes</span><span>Source coverage</span><span>Verification</span></div>
                  {syllabusAreas.map((area) => (
                    <div className="coverage-row" key={area.code}>
                      <div><small>{area.code} · {area.range}</small><strong>{area.title}</strong><p>{area.note}</p></div>
                      <b>{area.outcomes}</b>
                      <div className="coverage-meter"><span><i style={{ width: `${Math.round((area.sourced / area.outcomes) * 100)}%` }} /></span><small>{area.sourced}/{area.outcomes} sourced</small></div>
                      <em className={area.verified ? "verified" : "mapped"}>{area.verified ? `${area.verified} verified` : area.status}</em>
                    </div>
                  ))}
                </article>
                <article className="panel practical-panel"><div className="panel-heading"><div><h3>Practical skills</h3><p>Paper 4 skills tracked alongside content outcomes</p></div><b>4 areas</b></div><div className="practical-grid">{practicalSkills.map((skill) => <div key={skill.code}><b>{skill.code}</b><span>{skill.title}</span></div>)}</div></article>
                <div className="section-label"><div><h3>Your verified-objective mastery</h3><p>These estimates update after every answer.</p></div><span>{totalEvidence} evidence points</span></div>
                <article className="panel syllabus-table">
                  <div className="table-header"><span>Objective</span><span>Mastery</span><span>Evidence confidence</span><span>Next review</span><span /></div>
                  {currentMastery.map((item) => (
                    <div className="table-row" key={item.code}><div><small>{item.code}</small><strong>{item.topic}</strong></div><div className="bar-value"><span><i style={{ width: `${item.score}%` }} /></span><b>{item.score}%</b></div><p><span className={`confidence-badge ${item.confidence.toLowerCase()}`}>{item.confidence}</span> · {item.evidence} evidence</p><em className={isReviewDue(item.due, today) ? "due" : ""}>{reviewLabel(item.due, today)}</em><button onClick={() => startSession("practice", item.code)}>Practice</button></div>
                  ))}
                </article>
              </>
            ) : (
              <><div className="map-summary"><div><Ring value={average} size={86} /><span><b>{average}%</b><small>Current mastery estimate</small></span></div><div><b>{totalEvidence}</b><small>Evidence points</small></div><div><b>{currentMastery.filter((item) => item.confidence === "Low").length}</b><small>Low-confidence estimates</small></div><div><b>{dueCount}</b><small>Due today</small></div></div><article className="panel syllabus-table"><div className="table-header"><span>Objective</span><span>Mastery</span><span>Evidence confidence</span><span>Next review</span><span /></div>{currentMastery.map((item) => <div className="table-row" key={item.code}><div><small>{item.code}</small><strong>{item.topic}</strong></div><div className="bar-value"><span><i style={{ width: `${item.score}%` }} /></span><b>{item.score}%</b></div><p><span className={`confidence-badge ${item.confidence.toLowerCase()}`}>{item.confidence}</span> · {item.evidence} evidence</p><em className={isReviewDue(item.due, today) ? "due" : ""}>{reviewLabel(item.due, today)}</em><button onClick={() => startSession("practice", item.code)}>Practice</button></div>)}</article></>
            )}
          </section>
        ) : view === "pipeline" ? (
          <section className="page-content pipeline-page">
            <div className="page-heading"><div><p>Biology content operations</p><h1>{subject === "Biology" ? "Pack Studio" : "Chemistry content pipeline"}</h1><span>{subject === "Biology" ? "A single release path keeps every new chapter source-linked, reviewable and safe to update." : "Add the Chemistry source pack to begin mapping."}</span></div><div className="pack-heading-actions">{subject === "Biology" && <span className={`access-badge ${packAdmin ? "owner" : "readonly"}`}>{packAdmin ? "Owner controls active" : "Student · read-only"}</span>}<button className="outline-button" onClick={() => setView("library")}>Manage sources</button></div></div>
            {subject === "Biology" ? <>
              <div className="pipeline-summary"><article><span>Live packs</span><b>{livePackCount}</b><small>available to students</small></article><article><span>Draft packs</span><b>{draftPackCount}</b><small>mapped, not yet released</small></article><article><span>Live questions</span><b>{liveBiologyQuestions.length}</b><small>all source-linked</small></article><article><span>Source gaps</span><b>0</b><small>99/99 outcomes covered</small></article></div>
              <article className="panel release-flow"><div><b>1</b><span><strong>Draft</strong><small>PDF indexed and syllabus mapped</small></span></div><i>→</i><div><b>2</b><span><strong>Verified</strong><small>Questions, mark points and pages checked</small></span></div><i>→</i><div><b>3</b><span><strong>Live</strong><small>Versioned pack enters adaptive practice</small></span></div></article>
              {packNotice && <div className="pack-notice" role="status">{packNotice}</div>}
              <article className="panel pipeline-table"><div className="pipeline-header"><span>Content pack</span><span>9744 mapping</span><span>Question design</span><span>Release</span><span>{packAdmin ? "Owner action" : "Next gate"}</span></div>{pdfPipeline.map((file) => { const pack = packStates.find((item) => item.packOrder === file.order) ?? initialPackStates.find((item) => item.packOrder === file.order)!; const mature = file.questions >= 30; const working = packSaving === file.order; const nextStatus: PackStatus | null = pack.status === "Draft" && file.questions ? "Verified" : pack.status === "Verified" ? "Live" : pack.status === "Live" ? "Draft" : null; return <div className="pipeline-row" key={file.order}><div><span>{file.order}</span><div><strong>{file.name}</strong><small>{file.pages} pages · {file.images} figures</small></div></div><b>{file.mapping}</b><p>{file.questions ? `${file.questions} questions · ${mature ? "6 formats" : "MCQ seed"}` : "Question drafting not started"}</p><em className={pack.status.toLowerCase()}>{pack.status === "Live" ? `● Live v${pack.version}` : pack.status === "Verified" ? `◐ Verified v${pack.version}` : `○ Draft v${pack.version}`}</em><div className="pack-gate"><small>{mature ? "Monitor student evidence" : pack.status === "Live" ? "Add structured, data and image variants" : file.questions ? "Source-check before release" : "Draft questions first"}</small>{packAdmin && <button disabled={!nextStatus || working} onClick={() => nextStatus && updatePack(file.order, nextStatus)}>{working ? "Saving…" : nextStatus === "Verified" ? "Mark verified" : nextStatus === "Live" ? "Publish" : nextStatus === "Draft" ? "Unpublish" : "Needs questions"}</button>}</div></div>; })}</article>
            </> : <article className="panel empty-pipeline"><span>＋</span><h3>No Chemistry source pack yet</h3><p>Upload the coursebook and syllabus to create the same source-to-objective pipeline.</p><button className="primary-button" onClick={() => fileInput.current?.click()}>Upload material</button></article>}
          </section>
        ) : view === "library" ? (
          <section className="page-content library-page">
            <div className="page-heading"><div><p>Sources & alignment</p><h1>My materials</h1><span>Aster connects every question to your syllabus and source pages.</span></div><button className="primary-button" onClick={() => fileInput.current?.click()}>＋ Upload material</button></div>
            <button className="upload-zone" disabled={uploading} onClick={() => fileInput.current?.click()}><span>⇧</span><strong>{uploading ? "Uploading securely…" : "Choose a textbook, syllabus or set of notes"}</strong><small>PDF, PNG or JPG · up to 50 MB · stored privately</small></button>
            <div className="files-grid">
              {files.map((file, index) => <article className="file-card" key={file.id ?? `${file.name}-${index}`}><div className="pdf-icon">PDF</div><div><span>{file.tag}</span><strong>{file.name}</strong><small>{file.meta}</small></div><em>{file.status === "Error" ? "Retry" : file.status === "Processing" ? "Mapping" : file.status === "Needed" ? "Needed" : "✓ Ready"}</em>{file.id ? <button aria-label={`Delete ${file.name}`} onClick={() => removeFile(file)}>×</button> : <span />}</article>)}
            </div>
            <article className="panel mapping-panel"><div className="panel-heading"><div><h3>Source alignment</h3><p>Coverage of the active {subject} syllabus</p></div><b>{subject === "Biology" ? `${livePackCount} packs verified` : "Source pack needed"}</b></div><div className="coverage-bar"><span style={{ width: subject === "Biology" ? "100%" : "8%" }} /></div><div className="coverage-legend"><span><i className="covered" />All 99 Biology outcomes are source-linked and verified</span><span><i className="covered" />3(k) includes external practical protocols for substrate and temperature investigations</span><button onClick={() => setView(subject === "Biology" ? "pipeline" : "map")}>{subject === "Biology" ? "Open processing console" : "Review mapping"} →</button></div></article>
          </section>
        ) : view === "activity" ? (
          <section className="page-content teacher-page">
            <div className="page-heading"><div><p>Owner-only learning evidence</p><h1>Teacher Activity</h1><span>See who is practising, where they are secure and which objectives need support.</span></div><div className="class-code"><small>Student class code</small><strong>{activity?.classCode ?? "ASTER9744"}</strong></div></div>
            <div className="activity-summary"><article><span>Students</span><b>{activity?.summary.students ?? 0}</b><small>joined this class</small></article><article><span>Questions answered</span><b>{activity?.summary.attempts ?? 0}</b><small>saved across students</small></article><article><span>Active in 7 days</span><b>{activity?.summary.activeRecently ?? 0}</b><small>recent learners</small></article><article><span>Average accuracy</span><b>{activity?.summary.averageAccuracy ?? 0}%</b><small>across saved attempts</small></article></div>
            <article className="panel activity-table">
              <div className="activity-header"><span>Student</span><span>Practice</span><span>Accuracy</span><span>Mastered</span><span>Needs support</span><span>Last active</span></div>
              {activityLoading ? <div className="activity-empty"><strong>Loading student activity…</strong></div> : activity?.students.length ? activity.students.map((student, index) => (
                <div className="activity-row" key={`${student.classCode}-${student.displayName}-${index}`}><div><span>{student.displayName[0]?.toUpperCase()}</span><strong>{student.displayName}</strong><small>{student.classCode}</small></div><b>{student.attempts} questions</b><div className="activity-accuracy"><span><i style={{ width: `${student.accuracy}%` }} /></span><b>{student.accuracy}%</b></div><em>{student.mastered} objectives</em><p>{student.weak.length ? student.weak.join(" · ") : "No evidence yet"}</p><time>{activityTime(student.lastActive)}</time></div>
              )) : <div className="activity-empty"><strong>No students have joined yet</strong><p>Send the public Aster link and class code <b>{activity?.classCode ?? "ASTER9744"}</b>. Their activity will appear here after registration.</p></div>}
            </article>
          </section>
        ) : (
          <section className="page-content progress-page">
            <div className="page-heading"><div><p>Live learning record</p><h1>Your learning progress</h1><span>Only saved answers, mastery evidence and scheduled reviews appear here.</span></div><button className="primary-button" onClick={() => startSession("practice")}>Continue today’s plan →</button></div>
            <div className="progress-cards"><article><span>Current mastery</span><b>{average}%</b><small>{totalEvidence} evidence points</small></article><article><span>Questions answered</span><b>{totalAttempts}</b><small>{todayStats.answered} completed today</small></article><article><span>Reviews due</span><b>{dueCount}</b><small>{dueCount ? "Included in today’s plan" : "You are on schedule"}</small></article></div>
            <div className="progress-grid"><article className="panel evidence-panel"><div className="panel-heading"><div><h3>Mark-point evidence</h3><p>Specific ideas repeatedly missing from structured answers</p></div></div>{learningGaps.length ? <div className="evidence-list">{learningGaps.map((gap) => <button key={`${gap.code}-${gap.point}`} onClick={() => startSession("practice", gap.code)}><span>{gap.code}</span><p>{gap.point}</p><b>{gap.count} missed</b></button>)}</div> : <div className="empty-evidence"><strong>No mark-point gaps yet</strong><p>Complete structured questions and Aster will collect exact omissions here.</p></div>}</article><article className="panel skill-panel"><div className="panel-heading"><div><h3>Skill profile</h3><p>Live averages across verified objectives</p></div></div>{skillProfile.map(([label,value]) => <div className="skill-row" key={label}><span>{label}</span><div><i style={{ width: `${value}%` }} /></div><b>{value}</b></div>)}</article></div>
          </section>
        )}
      </section>
      {profileLoaded && !packAdmin && !studentProfile && <div className="enrollment-backdrop" role="dialog" aria-modal="true" aria-labelledby="join-title"><form className="enrollment-card" onSubmit={registerStudent}><span className="brand-mark">A</span><p>Join your Biology class</p><h1 id="join-title">Start your personal learning record</h1><small>Your name lets your teacher see your progress. Other students cannot see it.</small><label>Student name<input value={studentName} maxLength={40} onChange={(event) => setStudentName(event.target.value)} placeholder="e.g. Sarah" required /></label><label>Class code<input value={classCode} maxLength={20} onChange={(event) => setClassCode(event.target.value.toUpperCase())} placeholder="Code from your teacher" autoCapitalize="characters" required /></label>{enrollmentError && <div className="enrollment-error" role="alert">{enrollmentError}</div>}<button className="primary-button" disabled={registering}>{registering ? "Joining…" : "Join class and continue"}</button></form></div>}
    </main>
  );
}

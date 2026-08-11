"use client";

import { useMemo, useRef, useState } from "react";
import { evidenceConfidence, evidenceDelta, pickNextQuestion } from "@/lib/adaptive.mjs";

type Subject = "Biology" | "Chemistry";
type View = "today" | "map" | "library" | "progress";
type Confidence = "Low" | "Medium" | "High";
type Skill = "Knowledge" | "Application" | "Image" | "Exam technique";
type SessionKind = "quick" | "practice" | "diagnostic";
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
  options: string[];
  answer: number;
  hint: string;
  misconception: string;
  explanation: string;
  source: string;
  visual?: "chloroplast" | "molecule";
};

const initialMastery: Record<Subject, MasteryItem[]> = {
  Biology: [
    { code: "1.2", topic: "Cell structure", score: 76, note: "Strong recall", due: "4 days", evidence: 11, confidence: "High", knowledge: 86, application: 71, exam: 70 },
    { code: "4.1", topic: "Cell membranes", score: 63, note: "Application is uneven", due: "Today", evidence: 6, confidence: "Medium", knowledge: 76, application: 54, exam: 59 },
    { code: "5.2", topic: "Enzyme kinetics", score: 43, note: "Graphs need work", due: "Today", evidence: 2, confidence: "Low", knowledge: 61, application: 35, exam: 34 },
    { code: "12.1", topic: "Photosynthesis", score: 54, note: "Explain questions", due: "Tomorrow", evidence: 3, confidence: "Low", knowledge: 67, application: 51, exam: 44 },
  ],
  Chemistry: [
    { code: "2.1", topic: "Atomic structure", score: 82, note: "Secure", due: "6 days", evidence: 12, confidence: "High", knowledge: 91, application: 79, exam: 76 },
    { code: "3.3", topic: "Chemical bonding", score: 70, note: "Shape explanations", due: "2 days", evidence: 7, confidence: "Medium", knowledge: 79, application: 67, exam: 64 },
    { code: "7.1", topic: "Equilibria", score: 48, note: "Application is weak", due: "Today", evidence: 3, confidence: "Low", knowledge: 65, application: 39, exam: 40 },
    { code: "14.2", topic: "Organic mechanisms", score: 39, note: "Electron movement", due: "Today", evidence: 2, confidence: "Low", knowledge: 57, application: 31, exam: 29 },
  ],
};

const questions: Record<Subject, Question[]> = {
  Biology: [
    {
      id: "bio-membrane-fluidity",
      code: "4.1",
      eyebrow: "Adaptive check · application",
      objective: "4.1 Cell membranes",
      marks: 1,
      skill: "Application",
      difficulty: 2,
      prompt: "Which change would increase the fluidity of a cell membrane at a low temperature?",
      options: [
        "More saturated fatty acids",
        "More unsaturated fatty acids",
        "Longer fatty acid chains",
        "Fewer membrane proteins",
      ],
      answer: 1,
      hint: "Think about which fatty-acid shape prevents phospholipids packing closely.",
      misconception: "Membrane structure–property link",
      explanation: "Unsaturated fatty acids contain kinks that prevent phospholipids packing closely, helping the membrane remain fluid at low temperature.",
      source: "4. Cellular Transport.pdf · membrane structure",
    },
    {
      id: "bio-grana",
      code: "12.1",
      eyebrow: "Image reasoning · unfamiliar context",
      objective: "12.1 Photosynthesis",
      marks: 2,
      skill: "Image",
      difficulty: 2,
      prompt: "The highlighted structure contains stacks of membranes. Which process occurs there, and why is this arrangement useful?",
      options: [
        "Calvin cycle; it traps carbon dioxide",
        "Light-dependent reactions; it provides a large surface area",
        "Glycolysis; it keeps enzymes separated",
        "Protein synthesis; it stores ribosomes",
      ],
      answer: 1,
      hint: "Identify the thylakoid membrane and ask what proteins it holds.",
      misconception: "Chloroplast compartment confusion",
      explanation: "Thylakoid membranes form grana. Their large surface area holds chlorophyll, electron carriers and ATP synthase for the light-dependent reactions.",
      source: "5. Photosynthesis.pdf · p. 8 · Fig. 2.1",
      visual: "chloroplast",
    },
    {
      id: "bio-enzyme-denaturation",
      code: "5.2",
      eyebrow: "Exam technique · explain",
      objective: "5.2 Enzyme kinetics",
      marks: 3,
      skill: "Exam technique",
      difficulty: 2,
      prompt: "Why does the rate of an enzyme-controlled reaction decrease rapidly above the optimum temperature?",
      options: [
        "The substrate evaporates immediately",
        "The enzyme runs out of activation energy",
        "Bonds maintaining tertiary structure break and the active site changes",
        "The enzyme molecules stop moving",
      ],
      answer: 2,
      hint: "A complete explanation must link molecular bonds, shape and enzyme–substrate complexes.",
      misconception: "Denaturation explanation",
      explanation: "For full credit, connect heat to broken bonds, altered tertiary structure, a changed active site and fewer enzyme–substrate complexes.",
      source: "3. Enzymes.pdf · temperature and enzyme activity",
    },
    {
      id: "bio-osmosis",
      code: "4.1",
      eyebrow: "Follow-up · transfer",
      objective: "4.1 Cell membranes",
      marks: 2,
      skill: "Application",
      difficulty: 3,
      prompt: "A plant cell is placed in a solution with lower water potential than its cytoplasm. What happens first?",
      options: ["Water enters and turgor rises", "Water leaves by osmosis", "Solute leaves by active transport", "The cell wall dissolves"],
      answer: 1,
      hint: "Water moves from higher to lower water potential through a partially permeable membrane.",
      misconception: "Direction of osmosis",
      explanation: "Water moves out of the cell down the water-potential gradient. The protoplast begins to lose volume and may eventually pull from the cell wall.",
      source: "4. Cellular Transport.pdf · water potential",
    },
    {
      id: "bio-enzyme-inhibitor",
      code: "5.2",
      eyebrow: "Adaptive follow-up · graph logic",
      objective: "5.2 Enzyme kinetics",
      marks: 2,
      skill: "Application",
      difficulty: 3,
      prompt: "An inhibitor lowers the initial reaction rate, but the same maximum rate is reached at very high substrate concentration. Which interpretation is best?",
      options: ["Irreversible inhibition", "Competitive inhibition", "Non-competitive inhibition", "The enzyme has denatured"],
      answer: 1,
      hint: "Ask whether extra substrate can overcome the inhibitor's effect.",
      misconception: "Competitive versus non-competitive inhibition",
      explanation: "A competitive inhibitor can be outcompeted at high substrate concentration, so the original maximum rate can still be reached.",
      source: "3. Enzymes.pdf · enzyme inhibition",
    },
    {
      id: "bio-prokaryote",
      code: "1.2",
      eyebrow: "Retrieval · discriminate",
      objective: "1.2 Cell structure",
      marks: 1,
      skill: "Knowledge",
      difficulty: 1,
      prompt: "Which structure is present in a typical prokaryotic cell but absent from animal cells?",
      options: ["80S ribosome", "Circular naked DNA", "Mitochondrion", "Golgi apparatus"],
      answer: 1,
      hint: "Focus on how the main genetic material is organised.",
      misconception: "Prokaryote–eukaryote distinction",
      explanation: "Prokaryotes usually possess circular DNA that is not enclosed within a nucleus and is not associated with histones in the same way as eukaryotic nuclear DNA.",
      source: "TMJC H2 Biology notes · Cell structure",
    },
    {
      id: "bio-calvin-cycle",
      code: "12.1",
      eyebrow: "Retrieval · process link",
      objective: "12.1 Photosynthesis",
      marks: 2,
      skill: "Knowledge",
      difficulty: 2,
      prompt: "Which products of the light-dependent reactions are used directly in the Calvin cycle?",
      options: ["O₂ and glucose", "ATP and reduced NADP", "RuBP and carbon dioxide", "Water and chlorophyll"],
      answer: 1,
      hint: "The Calvin cycle needs both chemical energy and reducing power.",
      misconception: "Link between photosynthetic stages",
      explanation: "ATP supplies energy and reduced NADP supplies hydrogen/electrons for reduction in the Calvin cycle.",
      source: "5. Photosynthesis.pdf · p. 8 · Fig. 2.1",
    },
    {
      id: "bio-fluid-mosaic",
      code: "4.1",
      eyebrow: "Exam language · explain evidence",
      objective: "4.1 Cell membranes",
      marks: 2,
      skill: "Exam technique",
      difficulty: 2,
      prompt: "Why is the cell-surface membrane described as a fluid mosaic?",
      options: ["It is entirely liquid", "Proteins float randomly outside the bilayer", "Components move laterally and proteins form a varied pattern", "Phospholipids constantly leave the cell"],
      answer: 2,
      hint: "Explain both words in the name: fluid and mosaic.",
      misconception: "Fluid mosaic terminology",
      explanation: "Phospholipids and some proteins can move laterally, producing fluidity; the varied arrangement of embedded proteins forms a mosaic.",
      source: "4. Cellular Transport.pdf · fluid mosaic model",
    },
  ],
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
  { id: "library", label: "My materials", icon: "▤" },
  { id: "progress", label: "Progress", icon: "↗" },
];

function Ring({ value, size = 42 }: { value: number; size?: number }) {
  return (
    <span className="ring" style={{ "--value": `${value * 3.6}deg`, width: size, height: size } as React.CSSProperties}>
      <span>{value}</span>
    </span>
  );
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
  const [answerConfidence, setAnswerConfidence] = useState<Confidence | null>(null);
  const [usedHint, setUsedHint] = useState(false);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [sessionDelta, setSessionDelta] = useState(0);
  const [evidenceAdded, setEvidenceAdded] = useState(0);
  const [lastResult, setLastResult] = useState<{ code: string; correct: boolean } | null>(null);
  const [lastEvidence, setLastEvidence] = useState<{ delta: number; label: string; confidence: Confidence } | null>(null);
  const [complete, setComplete] = useState(false);
  const [files, setFiles] = useState([
    { name: "TMJC H2 Biology notes", meta: "17 modules · 852 pages · mapping in progress", tag: "Source pack" },
    { name: "9477 H2 Biology syllabus.pdf", meta: "2026 exam pack · active", tag: "Syllabus" },
  ]);
  const fileInput = useRef<HTMLInputElement>(null);
  const currentMastery = masteryState[subject];
  const average = Math.round(currentMastery.reduce((sum, item) => sum + item.score, 0) / currentMastery.length);
  const totalEvidence = currentMastery.reduce((sum, item) => sum + item.evidence, 0);
  const activeQuestion = sessionQuestions[questionIndex] ?? questions[subject][0];

  const weakTopic = useMemo(() => [...currentMastery].sort((a, b) => a.score - b.score)[0], [currentMastery]);

  function startSession(kind: SessionKind = "practice", focusCode?: string) {
    const target = kind === "diagnostic" ? 8 : kind === "quick" ? 6 : 5;
    const first = focusCode
      ? questions[subject].find((question) => question.code === focusCode) ?? questions[subject][0]
      : pickNextQuestion({ questions: questions[subject], seenIds: [], mastery: currentMastery });
    setSessionKind(kind);
    setSessionTarget(target);
    setSessionQuestions(first ? [first] : []);
    setSession(true);
    setQuestionIndex(0);
    setSelected(null);
    setAnswerConfidence(null);
    setUsedHint(false);
    setChecked(false);
    setScore(0);
    setSessionDelta(0);
    setEvidenceAdded(0);
    setLastResult(null);
    setLastEvidence(null);
    setComplete(false);
  }

  function checkAnswer() {
    if (selected === null || answerConfidence === null) return;
    const correct = selected === activeQuestion.answer;
    const delta = evidenceDelta({ correct, confidence: answerConfidence, usedHint, difficulty: activeQuestion.difficulty });
    setMasteryState((current) => ({
      ...current,
      [subject]: current[subject].map((item) => {
        if (item.code !== activeQuestion.code) return item;
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
          note: correct ? `${activeQuestion.skill} evidence strengthened` : activeQuestion.misconception,
          due: correct && answerConfidence === "High" && !usedHint ? "3 days" : "Tomorrow",
        };
      }),
    }));
    setChecked(true);
    setLastResult({ code: activeQuestion.code, correct });
    setLastEvidence({ delta, label: activeQuestion.skill, confidence: answerConfidence });
    setSessionDelta((value) => value + delta);
    setEvidenceAdded((value) => value + 1);
    if (correct) setScore((value) => value + 1);
  }

  function nextQuestion() {
    if (questionIndex + 1 >= sessionTarget) {
      setComplete(true);
      return;
    }
    const next = pickNextQuestion({
      questions: questions[subject],
      seenIds: sessionQuestions.map((question) => question.id),
      mastery: currentMastery,
      lastResult,
    });
    if (!next) {
      setComplete(true);
      return;
    }
    setSessionQuestions((current) => [...current, next]);
    setQuestionIndex((value) => value + 1);
    setSelected(null);
    setAnswerConfidence(null);
    setUsedHint(false);
    setChecked(false);
    setLastEvidence(null);
  }

  function changeSubject(next: Subject) {
    setSubject(next);
    setSession(false);
    setFiles(next === "Biology" ? [
      { name: "TMJC H2 Biology notes", meta: "17 modules · 852 pages · mapping in progress", tag: "Source pack" },
      { name: "9477 H2 Biology syllabus.pdf", meta: "2026 exam pack · active", tag: "Syllabus" },
    ] : [
      { name: "H2 Chemistry course materials", meta: "Awaiting source pack", tag: "Source pack" },
      { name: "9476 H2 Chemistry syllabus.pdf", meta: "2026 exam pack · active", tag: "Syllabus" },
    ]);
  }

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const incoming = Array.from(list).map((file) => ({
      name: file.name,
      meta: `${Math.max(1, Math.round(file.size / 1024 / 1024))} MB · ready to map`,
      tag: file.name.toLowerCase().includes("syllabus") ? "Syllabus" : "Material",
    }));
    setFiles((current) => [...current, ...incoming]);
    setView("library");
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
          {nav.map((item) => (
            <button key={item.id} className={view === item.id ? "nav-item active" : "nav-item"} onClick={() => { setView(item.id); setSession(false); }}>
              <span>{item.icon}</span>{item.label}
              {item.id === "map" && <em>4</em>}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="exam-card">
          <div className="exam-card-head"><span>Exam countdown</span><b>42 days</b></div>
          <strong>Singapore–Cambridge</strong>
          <p>H2 {subject} · {subject === "Biology" ? "9477" : "9476"}</p>
          <div className="mini-progress"><span style={{ width: `${average}%` }} /></div>
          <small>{average}% syllabus mastery</small>
        </div>
        <button className="profile"><span>M</span><div><strong>Maya</strong><small>Target grade · A</small></div><i>•••</i></button>
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
                  <div className="question-signals"><span>{activeQuestion.skill}</span><span>Difficulty {activeQuestion.difficulty}/3</span><span>Evidence point {evidenceAdded + 1}</span></div>
                  <h1>{activeQuestion.prompt}</h1>
                  {activeQuestion.visual && <SourceVisual kind={activeQuestion.visual} />}
                  <div className="options">
                    {activeQuestion.options.map((option, index) => {
                      const state = checked
                        ? index === activeQuestion.answer ? "correct" : selected === index ? "wrong" : ""
                        : selected === index ? "selected" : "";
                      return (
                        <button key={option} className={`option ${state}`} onClick={() => !checked && setSelected(index)}>
                          <span>{String.fromCharCode(65 + index)}</span><p>{option}</p>{state === "correct" && <b>✓</b>}{state === "wrong" && <b>×</b>}
                        </button>
                      );
                    })}
                  </div>
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
                      <button className="primary-button submit" disabled={selected === null || answerConfidence === null} onClick={checkAnswer}>Check answer</button>
                    </div>
                  ) : (
                    <div className={selected === activeQuestion.answer ? "feedback success" : "feedback retry"}>
                      <div><span>{selected === activeQuestion.answer ? "✓" : "↗"}</span><strong>{selected === activeQuestion.answer ? "Exactly right" : "This is the key distinction"}</strong></div>
                      <p>{activeQuestion.explanation}</p>
                      {lastEvidence && <div className="evidence-result"><span>{lastEvidence.delta >= 0 ? `+${lastEvidence.delta}` : lastEvidence.delta}</span><p>{lastEvidence.label} evidence · {lastEvidence.confidence} confidence</p></div>}
                      <button className="primary-button" onClick={nextQuestion}>{questionIndex + 1 >= sessionTarget ? "See session summary" : selected === activeQuestion.answer ? "Continue adaptive path" : "Try a targeted follow-up"} →</button>
                    </div>
                  )}
                </article>

                <aside className="source-panel">
                  <div className="source-panel-head"><span>Source evidence</span><b>Verified</b></div>
                  <div className="page-preview">
                    <span className="page-number">74</span>
                    <h4>{subject === "Biology" ? "The fluid mosaic model" : "Dynamic equilibrium"}</h4>
                    <p>The arrangement and behaviour described here explains the relationship tested in this question.</p>
                    <p className="highlight">Relevant syllabus-linked evidence is highlighted so you can verify every answer.</p>
                    <div className="text-lines"><i /><i /><i /><i /></div>
                  </div>
                  <p className="source-name">▤ {activeQuestion.source}</p>
                  <button className="source-link">Open source page ↗</button>
                  <div className="evidence-context"><span>Why this question?</span><p>{checked && selected !== activeQuestion.answer ? `You showed a possible ${activeQuestion.misconception.toLowerCase()} gap, so the next question will test the same objective differently.` : `This objective has limited recent evidence. Aster is checking ${activeQuestion.skill.toLowerCase()} before changing its mastery estimate.`}</p></div>
                </aside>
              </div>
            ) : (
              <div className="completion-card">
                <span className="completion-mark">✓</span>
                <p>{sessionKind === "quick" ? "Quick Check complete" : sessionKind === "diagnostic" ? "Diagnostic evidence saved" : "Adaptive session complete"}</p>
                <h1>{score} of {evidenceAdded} secure</h1>
                <p>Aster added <strong>{evidenceAdded} evidence points</strong>. Your next session will revisit <strong>{weakTopic.topic}</strong> in a different format.</p>
                <div className="completion-stats"><div><b>{sessionDelta >= 0 ? `+${sessionDelta}` : sessionDelta}</b><span>Net mastery evidence</span></div><div><b>{weakTopic.confidence}</b><span>Weakest-topic confidence</span></div><div><b>{evidenceAdded}</b><span>Sources verified</span></div></div>
                <button className="primary-button" onClick={() => { setSession(false); setView("map"); }}>View updated mastery map</button>
              </div>
            )}
          </section>
        ) : view === "today" ? (
          <section className="page-content">
            <div className="page-heading">
              <div><p>Tuesday, 11 August</p><h1>Ready for today?</h1><span>Your plan has adapted around two topics that need attention.</span></div>
              <div className="streak"><span>✦</span><div><strong>6 day streak</strong><small>Best: 11 days</small></div></div>
            </div>

            <article className="assessment-strip">
              <div className="assessment-status"><span>Evidence confidence</span><strong>{totalEvidence < 24 ? "Developing" : "Established"}</strong><small>{totalEvidence} evidence points across {currentMastery.length} objectives</small></div>
              <div className="assessment-copy"><strong>Keep the estimate honest</strong><p>Quick Check sets a starting point. Diagnostic and everyday practice keep correcting it.</p></div>
              <button className="outline-button" onClick={() => startSession("quick")}>Quick Check · 6</button>
              <button className="primary-button" onClick={() => startSession("diagnostic")}>Full Diagnostic · 8 →</button>
            </article>

            <div className="hero-grid">
              <article className="focus-card">
                <div className="focus-top"><span>YOUR NEXT SESSION</span><em>Personalised</em></div>
                <h2>Strengthen {weakTopic.topic.toLowerCase()}</h2>
                <p>You remember the core ideas, but unfamiliar applications are reducing your exam marks. Today mixes retrieval, explanation and one source figure.</p>
                <div className="session-tags"><span>◷ {minutes} min</span><span>◎ 5 evidence points</span><span>↗ Live adaptive path</span></div>
                <div className="focus-controls">
                  <div className="segmented" aria-label="Session duration">
                    {[15, 25, 40].map((value) => <button key={value} className={minutes === value ? "active" : ""} onClick={() => setMinutes(value)}>{value}m</button>)}
                  </div>
                  <button className="primary-button" onClick={() => startSession("practice")}>Start session <span>→</span></button>
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
                  {currentMastery.slice(1).map((item) => (
                    <button className="mastery-row" key={item.code} onClick={() => startSession("practice", item.code)}>
                      <Ring value={item.score} />
                      <div><strong>{item.topic}</strong><span>{item.note} · {item.evidence} evidence</span></div>
                      <em>Syllabus {item.code}</em>
                      <small className={`confidence-badge ${item.confidence.toLowerCase()}`}>{item.confidence}</small>
                      <b>›</b>
                    </button>
                  ))}
                </div>
              </article>

              <article className="panel setup-panel">
                <div className="panel-heading"><div><h3>Shape this session</h3><p>Preference guides the format; performance guides the content.</p></div></div>
                <label>Question approach</label>
                <div className="mode-list">
                  {["Adaptive", "Exam-style", "Image-heavy"].map((item) => <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}><span>{item === "Adaptive" ? "✦" : item === "Exam-style" ? "▤" : "▧"}</span><div><strong>{item}</strong><small>{item === "Adaptive" ? "Best next question" : item === "Exam-style" ? "Paper wording & marks" : "Figures, graphs & diagrams"}</small></div><i>{mode === item ? "●" : "○"}</i></button>)}
                </div>
              </article>
            </div>
          </section>
        ) : view === "map" ? (
          <section className="page-content map-page">
            <div className="page-heading"><div><p>Singapore–Cambridge · H2 {subject === "Biology" ? "9477" : "9476"} · 2026</p><h1>Syllabus mastery map</h1><span>Mastery and evidence confidence are separate, so an early estimate never looks final.</span></div><button className="primary-button" onClick={() => startSession("practice")}>Practise weak areas →</button></div>
            <div className="map-summary"><div><Ring value={average} size={86} /><span><b>{average}%</b><small>Current mastery estimate</small></span></div><div><b>{totalEvidence}</b><small>Evidence points</small></div><div><b>{currentMastery.filter((item) => item.confidence === "Low").length}</b><small>Low-confidence estimates</small></div><div><b>{currentMastery.filter((item) => item.due === "Today").length}</b><small>Due today</small></div></div>
            <article className="panel syllabus-table">
              <div className="table-header"><span>Objective</span><span>Mastery</span><span>Evidence confidence</span><span>Next review</span><span /></div>
              {currentMastery.map((item) => (
                <div className="table-row" key={item.code}><div><small>{item.code}</small><strong>{item.topic}</strong></div><div className="bar-value"><span><i style={{ width: `${item.score}%` }} /></span><b>{item.score}%</b></div><p><span className={`confidence-badge ${item.confidence.toLowerCase()}`}>{item.confidence}</span> · {item.evidence} evidence</p><em className={item.due === "Today" ? "due" : ""}>{item.due}</em><button onClick={() => startSession("practice", item.code)}>Practice</button></div>
              ))}
            </article>
          </section>
        ) : view === "library" ? (
          <section className="page-content library-page">
            <div className="page-heading"><div><p>Sources & alignment</p><h1>My materials</h1><span>Aster connects every question to your syllabus and source pages.</span></div><button className="primary-button" onClick={() => fileInput.current?.click()}>＋ Upload material</button></div>
            <button className="upload-zone" onClick={() => fileInput.current?.click()}><span>⇧</span><strong>Drop a textbook, syllabus or set of notes</strong><small>PDF, PNG or JPG · up to 50 MB</small></button>
            <div className="files-grid">
              {files.map((file, index) => <article className="file-card" key={`${file.name}-${index}`}><div className="pdf-icon">PDF</div><div><span>{file.tag}</span><strong>{file.name}</strong><small>{file.meta}</small></div><em>✓ Ready</em><button aria-label={`More options for ${file.name}`}>•••</button></article>)}
            </div>
            <article className="panel mapping-panel"><div className="panel-heading"><div><h3>Source alignment</h3><p>Coverage of the active {subject} syllabus</p></div><b>{subject === "Biology" ? "17 modules added" : "Source pack needed"}</b></div><div className="coverage-bar"><span style={{ width: subject === "Biology" ? "82%" : "18%" }} /></div><div className="coverage-legend"><span><i className="covered" />Syllabus-linked evidence</span><span><i className="partial" />Low-confidence mapping requires review</span><button onClick={() => setView("map")}>Review mapping →</button></div></article>
          </section>
        ) : (
          <section className="page-content progress-page">
            <div className="page-heading"><div><p>Last 30 days</p><h1>Your learning progress</h1><span>Progress is measured by durable mastery, not time spent in the app.</span></div><button className="outline-button">Export report</button></div>
            <div className="progress-cards"><article><span>Mastery gained</span><b>+18%</b><small>↑ 7% from last month</small></article><article><span>Questions answered</span><b>184</b><small>76% correct first try</small></article><article><span>Weak areas resolved</span><b>7</b><small>3 still need attention</small></article></div>
            <div className="progress-grid"><article className="panel chart-panel"><div className="panel-heading"><div><h3>Mastery over time</h3><p>Knowledge retained across syllabus objectives</p></div></div><div className="chart"><span className="y y3">80%</span><span className="y y2">60%</span><span className="y y1">40%</span><div className="gridline l3" /><div className="gridline l2" /><div className="gridline l1" /><div className="chart-fill" /><div className="chart-line">●　　　●　　　　●　　　　●　　　　●</div><div className="x-labels"><span>Jul 14</span><span>Jul 21</span><span>Jul 28</span><span>Aug 4</span><span>Today</span></div></div></article><article className="panel skill-panel"><div className="panel-heading"><div><h3>Skill profile</h3><p>What is limiting your next grade</p></div></div>{[["Knowledge recall",78],["Application",61],["Data analysis",58],["Exam language",54],["Image reasoning",72]].map(([label,value]) => <div className="skill-row" key={label as string}><span>{label}</span><div><i style={{ width: `${value}%` }} /></div><b>{value}</b></div>)}</article></div>
          </section>
        )}
      </section>
    </main>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";

type Subject = "Biology" | "Chemistry";
type View = "today" | "map" | "library" | "progress";
type Question = {
  eyebrow: string;
  objective: string;
  marks: number;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  source: string;
  visual?: "chloroplast" | "molecule";
};

const mastery: Record<Subject, { code: string; topic: string; score: number; note: string; due: string }[]> = {
  Biology: [
    { code: "1.2", topic: "Cell structure", score: 86, note: "Strong recall", due: "4 days" },
    { code: "4.1", topic: "Cell membranes", score: 68, note: "Application is uneven", due: "Today" },
    { code: "5.2", topic: "Enzyme kinetics", score: 43, note: "Graphs need work", due: "Today" },
    { code: "12.1", topic: "Photosynthesis", score: 57, note: "Explain questions", due: "Tomorrow" },
  ],
  Chemistry: [
    { code: "2.1", topic: "Atomic structure", score: 91, note: "Secure", due: "6 days" },
    { code: "3.3", topic: "Chemical bonding", score: 74, note: "Shape explanations", due: "2 days" },
    { code: "7.1", topic: "Equilibria", score: 48, note: "Application is weak", due: "Today" },
    { code: "14.2", topic: "Organic mechanisms", score: 39, note: "Electron movement", due: "Today" },
  ],
};

const questions: Record<Subject, Question[]> = {
  Biology: [
    {
      eyebrow: "Adaptive check · application",
      objective: "4.1 Cell membranes",
      marks: 1,
      prompt: "Which change would increase the fluidity of a cell membrane at a low temperature?",
      options: [
        "More saturated fatty acids",
        "More unsaturated fatty acids",
        "Longer fatty acid chains",
        "Fewer membrane proteins",
      ],
      answer: 1,
      explanation: "Unsaturated fatty acids contain kinks that prevent phospholipids packing closely, helping the membrane remain fluid at low temperature.",
      source: "Biology Coursebook · p. 74 · Fig. 4.8",
    },
    {
      eyebrow: "Image reasoning · unfamiliar context",
      objective: "12.1 Photosynthesis",
      marks: 2,
      prompt: "The highlighted structure contains stacks of membranes. Which process occurs there, and why is this arrangement useful?",
      options: [
        "Calvin cycle; it traps carbon dioxide",
        "Light-dependent reactions; it provides a large surface area",
        "Glycolysis; it keeps enzymes separated",
        "Protein synthesis; it stores ribosomes",
      ],
      answer: 1,
      explanation: "Thylakoid membranes form grana. Their large surface area holds chlorophyll, electron carriers and ATP synthase for the light-dependent reactions.",
      source: "Biology Coursebook · p. 236 · Fig. 12.3",
      visual: "chloroplast",
    },
    {
      eyebrow: "Exam technique · explain",
      objective: "5.2 Enzyme kinetics",
      marks: 3,
      prompt: "Why does the rate of an enzyme-controlled reaction decrease rapidly above the optimum temperature?",
      options: [
        "The substrate evaporates immediately",
        "The enzyme runs out of activation energy",
        "Bonds maintaining tertiary structure break and the active site changes",
        "The enzyme molecules stop moving",
      ],
      answer: 2,
      explanation: "For full credit, connect heat to broken bonds, altered tertiary structure, a changed active site and fewer enzyme–substrate complexes.",
      source: "Biology Coursebook · p. 101 · Syllabus 5.2(c)",
    },
  ],
  Chemistry: [
    {
      eyebrow: "Adaptive check · application",
      objective: "7.1 Equilibria",
      marks: 1,
      prompt: "For N₂(g) + 3H₂(g) ⇌ 2NH₃(g), what is the immediate effect of increasing pressure at constant temperature?",
      options: [
        "The equilibrium shifts left",
        "The equilibrium shifts right",
        "The equilibrium constant increases",
        "The forward reaction stops",
      ],
      answer: 1,
      explanation: "The right side has fewer moles of gas, so higher pressure favours the forward reaction. The equilibrium constant only changes with temperature.",
      source: "Chemistry Coursebook · p. 162 · Syllabus 7.1(d)",
    },
    {
      eyebrow: "Structure · bond polarity",
      objective: "3.3 Chemical bonding",
      marks: 2,
      prompt: "Why is the molecule shown non-polar even though each C=O bond is polar?",
      options: [
        "Carbon dioxide contains ionic bonds",
        "The molecule is linear, so the bond dipoles cancel",
        "Oxygen and carbon have equal electronegativity",
        "The double bonds cannot form dipoles",
      ],
      answer: 1,
      explanation: "CO₂ is linear and symmetrical. The two equal C=O bond dipoles act in opposite directions and cancel.",
      source: "Chemistry Coursebook · p. 67 · Fig. 3.19",
      visual: "molecule",
    },
    {
      eyebrow: "Exam technique · misconception",
      objective: "14.2 Organic mechanisms",
      marks: 2,
      prompt: "In an electrophilic addition mechanism, what does a curly arrow represent?",
      options: [
        "The movement of an atom",
        "The movement of an electron pair",
        "The direction of the overall reaction",
        "A temporary ionic bond",
      ],
      answer: 1,
      explanation: "A full-headed curly arrow shows the movement of an electron pair and must start at a bond or lone pair.",
      source: "Chemistry Coursebook · p. 311 · Syllabus 14.2(a)",
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
  const [minutes, setMinutes] = useState(25);
  const [mode, setMode] = useState("Adaptive");
  const [session, setSession] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const [files, setFiles] = useState([
    { name: "Cambridge Biology Coursebook.pdf", meta: "482 pages · 38 figures mapped", tag: "Textbook" },
    { name: "9700 Syllabus 2025–2027.pdf", meta: "126 objectives · fully mapped", tag: "Syllabus" },
  ]);
  const fileInput = useRef<HTMLInputElement>(null);
  const currentMastery = mastery[subject];
  const average = Math.round(currentMastery.reduce((sum, item) => sum + item.score, 0) / currentMastery.length);
  const activeQuestion = questions[subject][questionIndex];

  const weakTopic = useMemo(() => [...currentMastery].sort((a, b) => a.score - b.score)[0], [currentMastery]);

  function startSession() {
    setSession(true);
    setQuestionIndex(0);
    setSelected(null);
    setChecked(false);
    setScore(0);
    setComplete(false);
  }

  function checkAnswer() {
    if (selected === null) return;
    setChecked(true);
    if (selected === activeQuestion.answer) setScore((value) => value + 1);
  }

  function nextQuestion() {
    if (questionIndex === questions[subject].length - 1) {
      setComplete(true);
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSelected(null);
    setChecked(false);
  }

  function changeSubject(next: Subject) {
    setSubject(next);
    setFiles(next === "Biology" ? [
      { name: "Cambridge Biology Coursebook.pdf", meta: "482 pages · 38 figures mapped", tag: "Textbook" },
      { name: "9700 Syllabus 2025–2027.pdf", meta: "126 objectives · fully mapped", tag: "Syllabus" },
    ] : [
      { name: "Cambridge Chemistry Coursebook.pdf", meta: "534 pages · 42 figures mapped", tag: "Textbook" },
      { name: "9701 Syllabus 2025–2027.pdf", meta: "118 objectives · fully mapped", tag: "Syllabus" },
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
          <strong>Cambridge International</strong>
          <p>A Level {subject} · {subject === "Biology" ? "9700" : "9701"}</p>
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
              <div className="session-progress"><span style={{ width: `${((questionIndex + (checked ? 1 : 0)) / questions[subject].length) * 100}%` }} /></div>
              <span>{questionIndex + 1} / {questions[subject].length}</span>
            </div>

            {!complete ? (
              <div className="quiz-layout">
                <article className="question-card">
                  <div className="question-meta"><span>{activeQuestion.eyebrow}</span><b>{activeQuestion.marks} {activeQuestion.marks === 1 ? "mark" : "marks"}</b></div>
                  <p className="objective-tag">Syllabus {activeQuestion.objective}</p>
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
                    <button className="primary-button submit" disabled={selected === null} onClick={checkAnswer}>Check answer</button>
                  ) : (
                    <div className={selected === activeQuestion.answer ? "feedback success" : "feedback retry"}>
                      <div><span>{selected === activeQuestion.answer ? "✓" : "↗"}</span><strong>{selected === activeQuestion.answer ? "Exactly right" : "This is the key distinction"}</strong></div>
                      <p>{activeQuestion.explanation}</p>
                      <button className="primary-button" onClick={nextQuestion}>{questionIndex === questions[subject].length - 1 ? "See session summary" : "Next question"} →</button>
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
                  <div className="confidence-check"><span>How confident were you?</span><div><button>Low</button><button>Medium</button><button>High</button></div></div>
                </aside>
              </div>
            ) : (
              <div className="completion-card">
                <span className="completion-mark">✓</span>
                <p>Session complete</p>
                <h1>{score} of {questions[subject].length} secure</h1>
                <p>Your next session will revisit <strong>{weakTopic.topic}</strong> with a different question format.</p>
                <div className="completion-stats"><div><b>+6%</b><span>Objective confidence</span></div><div><b>{minutes}m</b><span>Next review tomorrow</span></div><div><b>3</b><span>Sources verified</span></div></div>
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

            <div className="hero-grid">
              <article className="focus-card">
                <div className="focus-top"><span>YOUR NEXT SESSION</span><em>Personalised</em></div>
                <h2>Strengthen {weakTopic.topic.toLowerCase()}</h2>
                <p>You remember the core ideas, but unfamiliar applications are reducing your exam marks. Today mixes retrieval, explanation and one source figure.</p>
                <div className="session-tags"><span>◷ {minutes} min</span><span>◎ 8 questions</span><span>↗ Adaptive difficulty</span></div>
                <div className="focus-controls">
                  <div className="segmented" aria-label="Session duration">
                    {[15, 25, 40].map((value) => <button key={value} className={minutes === value ? "active" : ""} onClick={() => setMinutes(value)}>{value}m</button>)}
                  </div>
                  <button className="primary-button" onClick={startSession}>Start session <span>→</span></button>
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
                    <button className="mastery-row" key={item.code} onClick={startSession}>
                      <Ring value={item.score} />
                      <div><strong>{item.topic}</strong><span>{item.note}</span></div>
                      <em>Syllabus {item.code}</em>
                      <small className={item.due === "Today" ? "due" : ""}>{item.due}</small>
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
            <div className="page-heading"><div><p>Cambridge International · {subject === "Biology" ? "9700" : "9701"} · 2025–2027</p><h1>Syllabus mastery map</h1><span>Every score combines knowledge, application and exam technique.</span></div><button className="primary-button" onClick={startSession}>Practise weak areas →</button></div>
            <div className="map-summary"><div><Ring value={average} size={86} /><span><b>{average}%</b><small>Overall mastery</small></span></div><div><b>2</b><small>Due today</small></div><div><b>1</b><small>High-risk objective</small></div><div><b>126</b><small>Objectives mapped</small></div></div>
            <article className="panel syllabus-table">
              <div className="table-header"><span>Objective</span><span>Mastery</span><span>Current diagnosis</span><span>Next review</span><span /></div>
              {currentMastery.map((item) => (
                <div className="table-row" key={item.code}><div><small>{item.code}</small><strong>{item.topic}</strong></div><div className="bar-value"><span><i style={{ width: `${item.score}%` }} /></span><b>{item.score}%</b></div><p>{item.note}</p><em className={item.due === "Today" ? "due" : ""}>{item.due}</em><button onClick={startSession}>Practice</button></div>
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
            <article className="panel mapping-panel"><div className="panel-heading"><div><h3>Source alignment</h3><p>Coverage of the active {subject} syllabus</p></div><b>96% covered</b></div><div className="coverage-bar"><span /></div><div className="coverage-legend"><span><i className="covered" />121 objectives supported</span><span><i className="partial" />5 need another source</span><button onClick={() => setView("map")}>Review mapping →</button></div></article>
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

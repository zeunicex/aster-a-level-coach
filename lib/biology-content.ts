import { biomoleculeQuestions as biomoleculeSeedQuestions, type BiomoleculeQuestion } from "./biomolecules.ts";
import { biomoleculeMatureQuestions, enzymeMatureQuestions, transportMatureQuestions } from "./core1-mature-questions.ts";
import { cellCycleQuestions, geneExpressionQuestions, mutationQuestions, techniqueQuestions } from "./core2-questions.ts";
import { eukaryoteQuestions, inheritanceQuestions, prokaryoteQuestions, virusQuestions } from "./new-biology-packs.ts";
import { cellQuestions, climateQuestions, communicationQuestions, evolutionQuestions, immunityQuestions } from "./remaining-biology-packs.ts";

export { cellCycleQuestions, cellQuestions, climateQuestions, communicationQuestions, eukaryoteQuestions, evolutionQuestions, geneExpressionQuestions, immunityQuestions, inheritanceQuestions, mutationQuestions, prokaryoteQuestions, techniqueQuestions, virusQuestions };

export type BiologyQuestion = BiomoleculeQuestion;

export const biomoleculeQuestions: BiologyQuestion[] = [...biomoleculeSeedQuestions, ...biomoleculeMatureQuestions];

export const syllabusAreas = [
  { code: "Core 1", title: "The Cell and Biomolecules of Life", range: "1(a)–1(v)", outcomes: 22, sourced: 22, verified: 22, status: "Verified", note: "Cell structure, viruses, biomolecules, membranes, proteins, enzymes and stem cells are covered by mature source-linked packs." },
  { code: "Core 2", title: "Genetics and Inheritance", range: "2(a)–2(dd)", outcomes: 30, sourced: 30, verified: 30, status: "Verified", note: "DNA/RNA, replication, gene expression, operons, inheritance, cell cycles and molecular genetics are fully mapped to 9744." },
  { code: "Core 3", title: "Energy and Equilibrium", range: "3(a)–3(p)", outcomes: 16, sourced: 16, verified: 16, status: "Verified", note: "Photosynthesis, respiration investigations, chemiosmosis and cell communication are covered by mature packs." },
  { code: "Core 4", title: "Biological Evolution", range: "4(a)–4(l)", outcomes: 12, sourced: 12, verified: 12, status: "Verified", note: "Variation, selection, evidence, species concepts, speciation and molecular phylogeny are verified." },
  { code: "Extension A", title: "Infectious Diseases", range: "A(a)–A(i)", outcomes: 9, sourced: 9, verified: 9, status: "Verified", note: "Immunity, antibody diversity, vaccination, viral and bacterial disease, and antibiotics are verified." },
  { code: "Extension B", title: "Impact of Climate Change on Animals and Plants", range: "B(a)–B(j)", outcomes: 10, sourced: 10, verified: 10, status: "Verified", note: "Causes, ecosystem and food impacts, insects, dengue, vectors and tropical biodiversity are verified." },
] as const;

export const practicalSkills = [
  { code: "Planning", title: "Planning investigations" },
  { code: "MMO", title: "Manipulation, measurement and observation" },
  { code: "PDO", title: "Presentation of data and observations" },
  { code: "ACE", title: "Analysis, conclusions and evaluation" },
] as const;

export const pdfPipeline = [
  { order: 1, name: "2024 H2 Cell - Lecture Notes_Student.docx.pdf", pages: 57, images: 204, mapping: "1(a)–1(d)", status: "Verified", questions: 30 },
  { order: 2, name: "Biomolecules.pdf", pages: 94, images: 206, mapping: "1(g)–1(i), 1(m)–1(o)", status: "Verified", questions: 30 },
  { order: 3, name: "Enzymes.pdf", pages: 38, images: 71, mapping: "1(p)–1(s)", status: "Verified", questions: 30 },
  { order: 4, name: "Cellular Transport.pdf", pages: 25, images: 40, mapping: "1(j)–1(l)", status: "Verified", questions: 30 },
  { order: 5, name: "Photosynthesis.pdf", pages: 40, images: 149, mapping: "3(a)–3(e), 3(l)", status: "Verified", questions: 30 },
  { order: 6, name: "Cellular Respiration.pdf", pages: 24, images: 64, mapping: "3(f)–3(l)", status: "Verified", questions: 30 },
  { order: 7, name: "The Cell Cycle.pdf", pages: 60, images: 151, mapping: "2(n)–2(o), 2(s)–2(t)", status: "Verified", questions: 30 },
  { order: 8, name: "DNA Replication & Gene Expression.pdf", pages: 52, images: 124, mapping: "2(a)–2(c)", status: "Verified", questions: 30 },
  { order: 9, name: "DNA Mutations & Its Consequences.pdf", pages: 39, images: 86, mapping: "2(l)–2(m), 2(p)–2(r)", status: "Verified", questions: 30 },
  { order: 10, name: "Molecular Techniques in DNA Analysis.pdf", pages: 27, images: 38, mapping: "2(k)", status: "Verified", questions: 30 },
  { order: 11, name: "OCGE in Eukaryotes & Stem Cell.pdf", pages: 96, images: 183, mapping: "1(t)–1(v), 2(d), 2(h), 2(j)", status: "Verified", questions: 30 },
  { order: 12, name: "Viruses.pdf", pages: 42, images: 127, mapping: "1(e)–1(f), 2(d)–2(f)", status: "Verified", questions: 30 },
  { order: 13, name: "OCGE in Prokaryotes (Bacteria).pdf", pages: 44, images: 77, mapping: "2(d), 2(g), 2(i)", status: "Verified", questions: 30 },
  { order: 14, name: "Inheritance.pdf", pages: 75, images: 161, mapping: "2(u)–2(dd)", status: "Verified", questions: 30 },
  { order: 15, name: "Cell Communication.pdf", pages: 30, images: 71, mapping: "3(m)–3(p)", status: "Verified", questions: 30 },
  { order: 16, name: "Biological Evolution.pdf", pages: 64, images: 184, mapping: "4(a)–4(l)", status: "Verified", questions: 30 },
  { order: 17, name: "Immunity & Infectious Diseases.pdf", pages: 51, images: 87, mapping: "A(a)–A(i)", status: "Verified", questions: 30 },
  { order: 18, name: "Climate Change.pdf", pages: 51, images: 47, mapping: "B(a)–B(j)", status: "Verified", questions: 30 },
] as const;

export type PackStatus = "Draft" | "Verified" | "Live";

export function packOrderForSource(source: string): number | null {
  const normalized = source.toLowerCase();
  return pdfPipeline.find((pack) => normalized.includes(pack.name.replace(/\.pdf$/i, "").toLowerCase()))?.order ?? null;
}

export function canTransitionPack(current: PackStatus, next: PackStatus, questions: number): boolean {
  if (current === next) return true;
  if (current === "Draft" && next === "Verified") return questions > 0;
  if (current === "Verified" && (next === "Live" || next === "Draft")) return true;
  return current === "Live" && next === "Draft";
}

const enzymeSeedQuestions: BiologyQuestion[] = [
  {
    id: "bio-enzyme-active-site", code: "1(p)", eyebrow: "Verified source · mechanism", objective: "1(p) Enzyme mode of action", marks: 2, skill: "Knowledge", difficulty: 1,
    prompt: "Which event directly explains how an enzyme lowers the activation energy of a reaction?",
    options: ["The substrate permanently changes the enzyme's primary structure", "Catalytic R groups position and weaken specific bonds in the substrate", "The enzyme raises the temperature around the substrate", "The active site supplies ATP to every reaction"], answer: 1,
    hint: "Focus on what happens to substrate bonds inside the active site.", misconception: "How active-site residues catalyse reactions",
    explanation: "Catalytic R groups orient the substrate and interact with its bonds, weakening them and providing a lower-activation-energy pathway.",
    source: "Enzymes.pdf · PDF p.8 · printed p.86", sourceImage: "/materials/enzymes/page-8.jpg", sourcePage: 86,
  },
  {
    id: "bio-enzyme-induced-fit", code: "1(p)", eyebrow: "Verified source · compare models", objective: "1(p) Enzyme mode of action", marks: 2, skill: "Application", difficulty: 2,
    prompt: "What distinguishes the induced-fit hypothesis from the lock-and-key hypothesis?",
    options: ["Only induced fit involves an active site", "In induced fit, substrate binding causes the active site to change shape", "Only lock and key forms an enzyme–substrate complex", "In induced fit, the enzyme is consumed"], answer: 1,
    hint: "Ask whether the active site is completely rigid before binding.", misconception: "Rigid versus flexible active sites",
    explanation: "The induced-fit model proposes that initial substrate binding changes the enzyme's conformation so the active site becomes more complementary and catalytically effective.",
    source: "Enzymes.pdf · PDF p.8 · printed p.86", sourceImage: "/materials/enzymes/page-8.jpg", sourcePage: 86,
  },
  {
    id: "bio-enzyme-specificity", code: "1(p)", eyebrow: "Verified source · unfamiliar substrate", objective: "1(p) Enzyme mode of action", marks: 2, skill: "Exam technique", difficulty: 2,
    prompt: "A molecule has the same size as an enzyme's substrate but a different arrangement of charged groups. Why may it fail to react?",
    options: ["It cannot collide with the enzyme", "It may not form the correct ionic and hydrogen-bond interactions at the active site", "All substrates must contain peptide bonds", "It always denatures the enzyme"], answer: 1,
    hint: "Complementarity includes chemical interactions, not only overall size.", misconception: "Chemical basis of enzyme specificity",
    explanation: "Correct orientation and complementary R-group interactions are required to stabilise the enzyme–substrate complex and position catalytic groups.",
    source: "Enzymes.pdf · PDF p.8 · printed p.86", sourceImage: "/materials/enzymes/page-8.jpg", sourcePage: 86,
  },
  {
    id: "bio-enzyme-substrate-graph", code: "1(q)", eyebrow: "Verified source · graph reasoning", objective: "1(q) Investigating enzyme activity", marks: 2, skill: "Application", difficulty: 2,
    prompt: "Why does reaction rate plateau as substrate concentration continues to increase?",
    options: ["Substrate molecules stop moving", "All enzyme active sites are occupied, so enzyme concentration becomes limiting", "The substrate always denatures the enzyme", "The activation energy becomes zero"], answer: 1,
    hint: "Identify what is fully occupied at the plateau.", misconception: "Cause of enzyme saturation",
    explanation: "At high substrate concentration, active sites are saturated. Extra substrate must wait for an active site, so Vmax is limited by enzyme concentration.",
    source: "Enzymes.pdf · PDF p.19 · printed p.97", sourceImage: "/materials/enzymes/page-19.jpg", sourcePage: 97,
  },
  {
    id: "bio-enzyme-ph-control", code: "1(q)", eyebrow: "Verified source · experimental design", objective: "1(q) Investigating enzyme activity", marks: 2, skill: "Exam technique", difficulty: 2,
    prompt: "When investigating the effect of pH on enzyme activity, which set of variables should be kept constant?",
    options: ["Substrate concentration, enzyme concentration and temperature", "pH, product concentration and time", "Only the volume of indicator", "Substrate concentration and pH"], answer: 0,
    hint: "The independent variable cannot also be controlled.", misconception: "Controls in an enzyme investigation",
    explanation: "To isolate the effect of pH, substrate concentration, enzyme concentration and temperature should remain constant while pH is varied.",
    source: "Enzymes.pdf · PDF p.21 · printed p.99", sourceImage: "/materials/enzymes/page-21.jpg", sourcePage: 99,
  },
  {
    id: "bio-enzyme-temperature-shape", code: "1(q)", eyebrow: "Verified source · explain a curve", objective: "1(q) Investigating enzyme activity", marks: 3, skill: "Exam technique", difficulty: 3,
    prompt: "Why does an enzyme activity curve rise gradually below the optimum but fall steeply above it?",
    options: ["Warming raises collision frequency, while excessive heat disrupts bonds and active-site shape", "Heat creates more enzyme below the optimum and destroys substrate above it", "Low temperature hydrolyses ATP, while high temperature removes water", "The enzyme changes into a lipid above the optimum"], answer: 0,
    hint: "Use two different mechanisms: kinetic energy below optimum and structure above it.", misconception: "Asymmetry of a temperature–activity curve",
    explanation: "Below optimum, increasing kinetic energy raises effective-collision frequency. Above optimum, bonds maintaining enzyme structure are disrupted and active sites rapidly lose complementarity.",
    source: "Enzymes.pdf · PDF p.23 · printed p.101", sourceImage: "/materials/enzymes/page-23.jpg", sourcePage: 101,
  },
  {
    id: "bio-enzyme-competitive-binding", code: "1(r)", eyebrow: "Verified source · binding site", objective: "1(r) Inhibitor binding", marks: 2, skill: "Knowledge", difficulty: 1,
    prompt: "Where does a reversible competitive inhibitor bind?",
    options: ["At the enzyme's active site", "Only to the substrate", "At a site on the product", "To the phospholipid bilayer"], answer: 0,
    hint: "It competes directly with substrate molecules.", misconception: "Competitive-inhibitor binding site",
    explanation: "A competitive inhibitor is sufficiently similar to the substrate to bind reversibly at the active site and block substrate binding.",
    source: "Enzymes.pdf · PDF p.28 · printed p.106", sourceImage: "/materials/enzymes/page-28.jpg", sourcePage: 106,
  },
  {
    id: "bio-enzyme-noncompetitive-binding", code: "1(r)", eyebrow: "Verified source · structural effect", objective: "1(r) Inhibitor binding", marks: 2, skill: "Application", difficulty: 2,
    prompt: "How can a non-competitive inhibitor reduce catalysis without occupying the active site?",
    options: ["Binding elsewhere changes enzyme conformation and active-site function", "It removes all substrate from the solution", "It converts the enzyme into ATP", "It raises substrate concentration"], answer: 0,
    hint: "Connect a second binding site to a change in enzyme shape.", misconception: "Allosteric effect of non-competitive inhibition",
    explanation: "Binding at another site changes the enzyme's conformation, so the active site binds substrate less effectively or cannot catalyse the reaction.",
    source: "Enzymes.pdf · PDF p.30 · printed p.108", sourceImage: "/materials/enzymes/page-30.jpg", sourcePage: 108,
  },
  {
    id: "bio-enzyme-inhibitor-structure", code: "1(r)", eyebrow: "Verified source · predict binding", objective: "1(r) Inhibitor binding", marks: 2, skill: "Application", difficulty: 2,
    prompt: "A drug closely resembles the normal substrate of an enzyme. Which inhibition mechanism is most likely?",
    options: ["Competition for the active site", "Binding only to the product", "Permanent increase in enzyme concentration", "Osmosis through the enzyme"], answer: 0,
    hint: "Structural similarity can create complementarity with one particular site.", misconception: "Using molecular similarity to infer inhibition",
    explanation: "A substrate analogue is likely to fit the active site and compete with the normal substrate, producing competitive inhibition.",
    source: "Enzymes.pdf · PDF p.28 · printed p.106", sourceImage: "/materials/enzymes/page-28.jpg", sourcePage: 106,
  },
  {
    id: "bio-enzyme-competitive-substrate", code: "1(s)", eyebrow: "Verified source · predict an effect", objective: "1(s) Effects of inhibitors", marks: 2, skill: "Application", difficulty: 2,
    prompt: "Why can increasing substrate concentration reduce the effect of a competitive inhibitor?",
    options: ["More substrate increases the probability that substrate, rather than inhibitor, occupies an active site", "Substrate destroys the inhibitor", "The inhibitor becomes an enzyme", "Vmax must decrease"], answer: 0,
    hint: "Think in probabilities of collision and binding.", misconception: "Overcoming competitive inhibition",
    explanation: "At higher substrate concentration, substrate molecules are more likely to occupy active sites, so the original Vmax can still be approached.",
    source: "Enzymes.pdf · PDF p.28 · printed p.106", sourceImage: "/materials/enzymes/page-28.jpg", sourcePage: 106,
  },
  {
    id: "bio-enzyme-noncompetitive-vmax", code: "1(s)", eyebrow: "Verified source · graph interpretation", objective: "1(s) Effects of inhibitors", marks: 2, skill: "Application", difficulty: 3,
    prompt: "A reaction cannot reach its original Vmax even at very high substrate concentration. What is the best explanation?",
    options: ["A proportion of enzyme molecules has been made non-functional by non-competitive inhibition", "The reaction has no enzyme", "All substrate has become an inhibitor", "Competitive inhibition has been fully overcome"], answer: 0,
    hint: "Ask whether adding substrate can restore the number of functional enzyme molecules.", misconception: "Vmax under non-competitive inhibition",
    explanation: "Non-competitive inhibition lowers effective enzyme concentration. Extra substrate cannot restore those functional catalytic sites, so the original Vmax is not reached.",
    source: "Enzymes.pdf · PDF p.30 · printed p.108", sourceImage: "/materials/enzymes/page-30.jpg", sourcePage: 108,
  },
  {
    id: "bio-enzyme-compare-inhibitors", code: "1(s)", eyebrow: "Verified source · exam distinction", objective: "1(s) Effects of inhibitors", marks: 3, skill: "Exam technique", difficulty: 3,
    prompt: "Which observation best distinguishes competitive from non-competitive inhibition?",
    options: ["Only competitive inhibition can be substantially reduced by increasing substrate concentration", "Only competitive inhibitors bind to enzymes", "Only non-competitive inhibitors reduce initial rate", "Both always lower the original Vmax equally"], answer: 0,
    hint: "Compare what happens when substrate concentration becomes very high.", misconception: "Distinguishing inhibitor effects experimentally",
    explanation: "More substrate can outcompete a competitive inhibitor at the active site. It cannot reverse the loss of functional enzyme caused by non-competitive inhibition.",
    source: "Enzymes.pdf · PDF pp.28–30 · printed pp.106–108", sourceImage: "/materials/enzymes/page-30.jpg", sourcePage: 108,
  },
];

export const enzymeQuestions: BiologyQuestion[] = [...enzymeSeedQuestions, ...enzymeMatureQuestions];

const transportSeedQuestions: BiologyQuestion[] = [
  {
    id: "bio-transport-fluid", code: "1(j)", eyebrow: "Verified source · terminology", objective: "1(j) Fluid mosaic membrane", marks: 2, skill: "Knowledge", difficulty: 1,
    prompt: "Why is the cell-surface membrane described as fluid?",
    options: ["Phospholipids and some proteins can move laterally within the bilayer", "The membrane is made entirely of water", "All proteins continuously leave the membrane", "Phospholipids dissolve in cytoplasm"], answer: 0,
    hint: "Focus on movement within, not away from, the bilayer.", misconception: "Meaning of fluid in the fluid mosaic model",
    explanation: "Individual phospholipids and some membrane proteins move laterally within the bilayer, giving the membrane a dynamic, fluid character.",
    source: "Cellular Transport.pdf · PDF p.2 · printed p.120", sourceImage: "/materials/transport/page-2.jpg", sourcePage: 120,
  },
  {
    id: "bio-transport-mosaic", code: "1(j)", eyebrow: "Verified source · model language", objective: "1(j) Fluid mosaic membrane", marks: 2, skill: "Exam technique", difficulty: 2,
    prompt: "What does mosaic mean in the fluid mosaic model?",
    options: ["Different proteins are scattered in a varied arrangement among phospholipids", "Every membrane has a tiled cell wall", "Lipids form fixed square blocks", "The membrane contains only one kind of protein"], answer: 0,
    hint: "A mosaic is a varied pattern made from different components.", misconception: "Meaning of mosaic in the membrane model",
    explanation: "The diverse types and irregular distribution of proteins among the phospholipids create the membrane's mosaic appearance.",
    source: "Cellular Transport.pdf · PDF p.2 · printed p.120", sourceImage: "/materials/transport/page-2.jpg", sourcePage: 120,
  },
  {
    id: "bio-transport-cholesterol-cold", code: "1(j)", eyebrow: "Verified source · temperature transfer", objective: "1(j) Fluid mosaic membrane", marks: 2, skill: "Application", difficulty: 2,
    prompt: "How does cholesterol help a membrane at low temperature?",
    options: ["It prevents close packing of phospholipids and reduces solidification", "It removes every membrane protein", "It makes fatty-acid tails longer", "It hydrolyses phospholipids"], answer: 0,
    hint: "At low temperature, the danger is excessive rigidity.", misconception: "Cholesterol's temperature-dependent role",
    explanation: "Cholesterol disrupts close packing of phospholipid tails, helping the membrane remain fluid rather than becoming too rigid.",
    source: "Cellular Transport.pdf · PDF p.5 · printed p.123", sourceImage: "/materials/transport/page-5.jpg", sourcePage: 123,
  },
  {
    id: "bio-transport-cholesterol-high", code: "1(j)", eyebrow: "Verified source · dual regulation", objective: "1(j) Fluid mosaic membrane", marks: 2, skill: "Application", difficulty: 3,
    prompt: "At relatively high temperature, why can cholesterol make a membrane less fluid?",
    options: ["It restrains movement of phospholipid hydrocarbon tails", "It converts phospholipids into glucose", "It creates pores for water", "It removes hydrophilic phosphate heads"], answer: 0,
    hint: "Cholesterol buffers fluidity in both directions.", misconception: "Cholesterol at high temperature",
    explanation: "Interactions between cholesterol and fatty-acid tails restrict their movement, preventing the membrane from becoming excessively fluid.",
    source: "Cellular Transport.pdf · PDF p.5 · printed p.123", sourceImage: "/materials/transport/page-5.jpg", sourcePage: 123,
  },
  {
    id: "bio-transport-barrier", code: "1(k)", eyebrow: "Verified source · structure and function", objective: "1(k) Membrane functions", marks: 2, skill: "Knowledge", difficulty: 1,
    prompt: "Which membrane feature forms the main barrier to ions and most polar molecules?",
    options: ["The hydrophobic interior of the phospholipid bilayer", "Carbohydrate chains on the external surface", "The hydrophilic phosphate heads alone", "Ribosomes attached to the membrane"], answer: 0,
    hint: "Charged particles are excluded by a non-polar region.", misconception: "Basis of selective permeability",
    explanation: "The bilayer's hydrophobic core resists passage of ions and polar solutes, while specific transport proteins provide controlled routes.",
    source: "Cellular Transport.pdf · PDF p.2 · printed p.120", sourceImage: "/materials/transport/page-2.jpg", sourcePage: 120,
  },
  {
    id: "bio-transport-channel-function", code: "1(k)", eyebrow: "Verified source · protein function", objective: "1(k) Membrane functions", marks: 2, skill: "Application", difficulty: 2,
    prompt: "Why can an ion cross a membrane through a channel protein but not readily through the phospholipid bilayer?",
    options: ["The channel provides a hydrophilic passage through the hydrophobic core", "The channel turns the ion into a lipid", "The bilayer contains no carbon", "The channel always uses ATP"], answer: 0,
    hint: "Compare the chemical environment inside a channel with the bilayer core.", misconception: "How channel proteins enable transport",
    explanation: "Hydrophilic amino-acid groups line the channel, shielding the ion from the membrane's hydrophobic interior.",
    source: "Cellular Transport.pdf · PDF p.17 · printed p.134", sourceImage: "/materials/transport/page-17.jpg", sourcePage: 134,
  },
  {
    id: "bio-transport-receptor", code: "1(k)", eyebrow: "Verified source · cell recognition", objective: "1(k) Membrane functions", marks: 2, skill: "Application", difficulty: 2,
    prompt: "Why are different glycoproteins useful on the external surface of a cell?",
    options: ["Their varied carbohydrate chains can act in recognition and receptor binding", "They produce ATP in the bilayer", "They make the membrane completely impermeable", "They replace phospholipids"], answer: 0,
    hint: "Think about specific shapes exposed to the extracellular environment.", misconception: "Roles of membrane glycoproteins",
    explanation: "Distinct carbohydrate chains form specific recognition markers and binding sites, supporting cell signalling and identification.",
    source: "Cellular Transport.pdf · PDF p.2 · printed p.120", sourceImage: "/materials/transport/page-2.jpg", sourcePage: 120,
  },
  {
    id: "bio-transport-compartment", code: "1(k)", eyebrow: "Verified source · systems reasoning", objective: "1(k) Membrane functions", marks: 2, skill: "Exam technique", difficulty: 3,
    prompt: "Why is membrane compartmentalisation important for metabolism?",
    options: ["It maintains distinct conditions and concentrates enzymes for different reactions", "It forces every reaction to occur at the cell surface", "It prevents all movement between compartments", "It makes enzymes non-specific"], answer: 0,
    hint: "Different metabolic pathways often need different local conditions.", misconception: "Purpose of intracellular membranes",
    explanation: "Membranes separate reaction environments and organise enzymes, allowing incompatible processes and gradients to be maintained efficiently.",
    source: "Cellular Transport.pdf · PDF p.2 · printed p.120", sourceImage: "/materials/transport/page-2.jpg", sourcePage: 120,
  },
  {
    id: "bio-transport-osmosis", code: "1(l)", eyebrow: "Verified source · direction", objective: "1(l) Membrane transport", marks: 2, skill: "Knowledge", difficulty: 1,
    prompt: "Which statement correctly defines osmosis?",
    options: ["Net movement of water from higher to lower water potential across a selectively permeable membrane", "Movement of solute against its gradient using ATP", "Movement of any particle through a protein", "Engulfing particles in vesicles"], answer: 0,
    hint: "A complete definition needs the substance, direction and membrane.", misconception: "Definition and direction of osmosis",
    explanation: "Osmosis is the net movement of water molecules down a water-potential gradient across a selectively permeable membrane.",
    source: "Cellular Transport.pdf · PDF p.15 · printed p.132", sourceImage: "/materials/transport/page-15.jpg", sourcePage: 132,
  },
  {
    id: "bio-transport-facilitated", code: "1(l)", eyebrow: "Verified source · compare processes", objective: "1(l) Membrane transport", marks: 2, skill: "Application", difficulty: 2,
    prompt: "What do facilitated diffusion and simple diffusion have in common?",
    options: ["Both are passive and move particles down a concentration gradient", "Both require ATP hydrolysis", "Both move only water", "Both form vesicles"], answer: 0,
    hint: "Separate energy requirement from the route taken.", misconception: "Facilitated versus simple diffusion",
    explanation: "Both processes are passive and occur down a concentration gradient; facilitated diffusion differs because it uses channel or carrier proteins.",
    source: "Cellular Transport.pdf · PDF p.17 · printed p.134", sourceImage: "/materials/transport/page-17.jpg", sourcePage: 134,
  },
  {
    id: "bio-transport-active", code: "1(l)", eyebrow: "Verified source · molecular mechanism", objective: "1(l) Membrane transport", marks: 3, skill: "Exam technique", difficulty: 3,
    prompt: "How does ATP hydrolysis drive active transport by a membrane pump?",
    options: ["Phosphate transfer changes the protein's conformation, moving the solute against its gradient", "ATP widens the phospholipid bilayer permanently", "ATP converts the solute into water", "Hydrolysis makes diffusion occur uphill without a protein"], answer: 0,
    hint: "Link ATP, phosphate, protein shape and direction of movement.", misconception: "Energy coupling in active transport",
    explanation: "ATP hydrolysis transfers a phosphate to the transport protein, inducing a conformational change that translocates the solute against its concentration gradient.",
    source: "Cellular Transport.pdf · PDF p.18 · printed p.135", sourceImage: "/materials/transport/page-18.jpg", sourcePage: 135,
  },
  {
    id: "bio-transport-endocytosis", code: "1(l)", eyebrow: "Verified source · process selection", objective: "1(l) Membrane transport", marks: 2, skill: "Application", difficulty: 2,
    prompt: "Which process allows a cell to take up a specific low-concentration macromolecule using surface receptors?",
    options: ["Receptor-mediated endocytosis", "Simple diffusion", "Osmosis", "Non-competitive inhibition"], answer: 0,
    hint: "The clue is the requirement for a specific ligand–receptor interaction.", misconception: "Types of bulk transport",
    explanation: "Specific ligands bind membrane receptors, which cluster in coated pits and form vesicles during receptor-mediated endocytosis.",
    source: "Cellular Transport.pdf · PDF p.21 · printed p.138", sourceImage: "/materials/transport/page-21.jpg", sourcePage: 138,
  },
];

export const transportQuestions: BiologyQuestion[] = [...transportSeedQuestions, ...transportMatureQuestions];

export const photosynthesisQuestions: BiologyQuestion[] = [
  {
    id: "bio-photo-granum", code: "3(a)", eyebrow: "Verified source · organelle identification", objective: "3(a) Chloroplast and mitochondrion components", marks: 1, skill: "Knowledge", difficulty: 1,
    prompt: "Which chloroplast structure is a stack of thylakoids?", options: ["Stroma", "Granum", "Crista", "Matrix"], answer: 1,
    hint: "Use the singular term for one stack.", misconception: "Chloroplast component identification", explanation: "A granum is a stack of thylakoids. The surrounding fluid is the stroma.",
    source: "Photosynthesis.pdf · PDF p.9 · printed p.9", sourceImage: "/materials/photosynthesis/page-9.jpg", sourcePage: 9,
  },
  {
    id: "bio-photo-stroma", code: "3(a)", eyebrow: "Verified source · location", objective: "3(a) Chloroplast and mitochondrion components", marks: 2, skill: "Application", difficulty: 2,
    prompt: "A micrograph shows an enzyme-rich fluid surrounding grana. Which region is this?", options: ["Thylakoid lumen", "Intermembrane space", "Stroma", "Cytosol"], answer: 2,
    hint: "The Calvin cycle occurs in this chloroplast compartment.", misconception: "Stroma versus thylakoid space", explanation: "The stroma is the aqueous region inside the chloroplast inner membrane that surrounds the thylakoids and contains Calvin-cycle enzymes.",
    source: "Photosynthesis.pdf · PDF p.9 · printed p.9", sourceImage: "/materials/photosynthesis/page-9.jpg", sourcePage: 9,
  },
  {
    id: "bio-photo-organelle-discriminate", code: "3(a)", eyebrow: "Verified source · micrograph discrimination", objective: "3(a) Chloroplast and mitochondrion components", marks: 2, skill: "Application", difficulty: 2,
    prompt: "Which feature identifies a mitochondrion rather than a chloroplast in an electron micrograph?", options: ["A double membrane", "Internal DNA", "An aqueous internal matrix", "Cristae formed by folds of the inner membrane"], answer: 3,
    hint: "Both organelles share several features; choose the distinctive internal membrane arrangement.", misconception: "Chloroplast–mitochondrion discrimination", explanation: "Cristae are folds of the inner mitochondrial membrane. Chloroplasts instead contain thylakoids arranged into grana.",
    source: "Cellular Respiration.pdf · PDF p.6 · printed p.44", sourceImage: "/materials/respiration/page-6.jpg", sourcePage: 44,
  },
  {
    id: "bio-photo-action-spectrum", code: "3(b)", eyebrow: "Verified source · graph definition", objective: "3(b) Photosynthetic spectra", marks: 1, skill: "Knowledge", difficulty: 1,
    prompt: "What does an action spectrum show?", options: ["Pigment concentration at each wavelength", "Rate of photosynthesis at different wavelengths", "Temperature of light absorbed", "ATP yield at different carbon dioxide concentrations"], answer: 1,
    hint: "It measures a biological response, not pigment absorbance.", misconception: "Action versus absorption spectrum", explanation: "An action spectrum plots the rate of photosynthesis against wavelength, whereas an absorption spectrum plots light absorbed by pigments.",
    source: "Photosynthesis.pdf · PDF p.36 · printed p.34", sourceImage: "/materials/photosynthesis/page-36.jpg", sourcePage: 34,
  },
  {
    id: "bio-photo-spectra-match", code: "3(b)", eyebrow: "Verified source · explain evidence", objective: "3(b) Photosynthetic spectra", marks: 2, skill: "Exam technique", difficulty: 2,
    prompt: "Why does the action spectrum broadly match the combined absorption spectra of photosynthetic pigments?", options: ["Only green light reaches leaves", "All wavelengths contain equal energy", "Absorbed light supplies energy for photoactivation and photophosphorylation", "Carbon dioxide absorbs red light"], answer: 2,
    hint: "Link pigment absorption to the light-dependent reactions.", misconception: "Relationship between absorption and action spectra", explanation: "Wavelengths absorbed strongly provide more usable light energy for the light-dependent reactions, so they generally support higher photosynthetic rates.",
    source: "Photosynthesis.pdf · PDF p.36 · printed p.34", sourceImage: "/materials/photosynthesis/page-36.jpg", sourcePage: 34,
  },
  {
    id: "bio-photo-accessory-pigments", code: "3(b)", eyebrow: "Verified source · functional inference", objective: "3(b) Photosynthetic spectra", marks: 2, skill: "Application", difficulty: 2,
    prompt: "What is the main advantage of having chlorophyll a, chlorophyll b and carotenoids?", options: ["They prevent all light absorption", "They make every photon red", "They remove the need for reaction centres", "Together they absorb a wider range of wavelengths"], answer: 3,
    hint: "Compare the different peaks in their absorption spectra.", misconception: "Role of accessory pigments", explanation: "Different pigments absorb most strongly at different wavelengths, broadening the usable spectrum and transferring captured energy toward reaction centres.",
    source: "Photosynthesis.pdf · PDF p.16 · printed p.16", sourceImage: "/materials/photosynthesis/page-16.jpg", sourcePage: 16,
  },
  {
    id: "bio-photo-photolysis", code: "3(c)", eyebrow: "Verified source · electron replacement", objective: "3(c) Light-dependent reactions", marks: 2, skill: "Knowledge", difficulty: 1,
    prompt: "What is the direct role of photolysis of water in non-cyclic photophosphorylation?", options: ["It replaces electrons lost from photosystem II and releases protons and oxygen", "It fixes carbon dioxide", "It regenerates RuBP", "It reduces pyruvate"], answer: 0,
    hint: "Follow the electrons leaving P680.", misconception: "Role of water in the light-dependent reactions", explanation: "Light splits water into electrons, protons and oxygen. The electrons replace those lost from photosystem II; oxygen is released as a by-product.",
    source: "Photosynthesis.pdf · PDF p.23 · printed p.23", sourceImage: "/materials/photosynthesis/page-23.jpg", sourcePage: 23,
  },
  {
    id: "bio-photo-nadp", code: "3(c)", eyebrow: "Verified source · electron flow", objective: "3(c) Light-dependent reactions", marks: 2, skill: "Application", difficulty: 2,
    prompt: "At the end of non-cyclic electron flow, which molecule accepts electrons and hydrogen to form reducing power for the Calvin cycle?", options: ["ADP", "RuBP", "NADP+", "Oxygen"], answer: 2,
    hint: "The reduced product carries electrons into the Calvin cycle.", misconception: "Final electron acceptor in photosynthesis", explanation: "NADP+ is reduced to NADPH, which supplies electrons and hydrogen for reduction reactions in the Calvin cycle.",
    source: "Photosynthesis.pdf · PDF p.23 · printed p.23", sourceImage: "/materials/photosynthesis/page-23.jpg", sourcePage: 23,
  },
  {
    id: "bio-photo-atp-synthase", code: "3(c)", eyebrow: "Verified source · energy conversion", objective: "3(c) Light-dependent reactions", marks: 3, skill: "Exam technique", difficulty: 3,
    prompt: "How is light energy converted into chemical energy as ATP at the thylakoid membrane?", options: ["Rubisco transfers phosphate directly to ADP", "Electron transport builds a proton gradient whose flow through ATP synthase drives ATP formation", "Oxygen phosphorylates glucose", "NADPH hydrolysis pumps carbon dioxide"], answer: 1,
    hint: "Connect electron transport, a proton gradient and ATP synthase.", misconception: "Coupling electron transport to ATP synthesis", explanation: "Energy released as electrons pass along carriers pumps protons into the thylakoid space. Their return through ATP synthase drives phosphorylation of ADP.",
    source: "Photosynthesis.pdf · PDF p.23 · printed p.23", sourceImage: "/materials/photosynthesis/page-23.jpg", sourcePage: 23,
  },
  {
    id: "bio-photo-carbon-fixation", code: "3(d)", eyebrow: "Verified source · Calvin cycle phase", objective: "3(d) Calvin cycle", marks: 2, skill: "Knowledge", difficulty: 1,
    prompt: "Which event occurs during carbon dioxide fixation in the Calvin cycle?", options: ["Triose phosphate is oxidised to carbon dioxide", "Water is split by light", "Pyruvate enters the matrix", "Rubisco catalyses the combination of carbon dioxide with RuBP"], answer: 3,
    hint: "Identify both the carbon dioxide acceptor and the enzyme.", misconception: "Carbon-fixation step", explanation: "Rubisco catalyses addition of carbon dioxide to the five-carbon acceptor RuBP, producing an unstable six-carbon intermediate that forms PGA.",
    source: "Photosynthesis.pdf · PDF p.28 · printed p.28", sourceImage: "/materials/photosynthesis/page-28.jpg", sourcePage: 28,
  },
  {
    id: "bio-photo-pga-reduction", code: "3(d)", eyebrow: "Verified source · resource use", objective: "3(d) Calvin cycle", marks: 2, skill: "Application", difficulty: 2,
    prompt: "Which products of the light-dependent reactions are required to reduce PGA to triose phosphate?", options: ["Oxygen and water", "ATP and NADPH", "Carbon dioxide and RuBP", "ADP and NADP+"], answer: 1,
    hint: "One provides energy; the other provides reducing power.", misconception: "Link between light-dependent reactions and PGA reduction", explanation: "ATP supplies energy and NADPH supplies electrons and hydrogen for conversion of PGA into triose phosphate.",
    source: "Photosynthesis.pdf · PDF p.28 · printed p.28", sourceImage: "/materials/photosynthesis/page-28.jpg", sourcePage: 28,
  },
  {
    id: "bio-photo-rubp-regeneration", code: "3(d)", eyebrow: "Verified source · cycle continuity", objective: "3(d) Calvin cycle", marks: 2, skill: "Exam technique", difficulty: 2,
    prompt: "Why must most triose phosphate remain in the Calvin cycle?", options: ["To release oxygen", "To absorb photons", "To regenerate RuBP so carbon dioxide fixation can continue", "To form acetyl CoA"], answer: 2,
    hint: "A cycle must restore its starting carbon dioxide acceptor.", misconception: "Purpose of RuBP regeneration", explanation: "Most triose phosphate is rearranged using ATP to regenerate RuBP, allowing further carbon dioxide molecules to be fixed.",
    source: "Photosynthesis.pdf · PDF p.28 · printed p.28", sourceImage: "/materials/photosynthesis/page-28.jpg", sourcePage: 28,
  },
  {
    id: "bio-photo-light-plateau", code: "3(e)", eyebrow: "Verified source · limiting factor graph", objective: "3(e) Photosynthesis investigations", marks: 2, skill: "Application", difficulty: 2,
    prompt: "Why can a photosynthesis rate curve plateau as light intensity increases?", options: ["Light has destroyed all water", "Photosynthesis no longer needs enzymes", "Another factor such as carbon dioxide concentration or temperature has become limiting", "Chlorophyll stops absorbing every wavelength"], answer: 2,
    hint: "At a plateau, the independent variable is no longer the limiting factor.", misconception: "Interpreting a limiting-factor plateau", explanation: "Once light is sufficient, increasing it further cannot raise the rate if carbon dioxide availability, temperature or another factor limits the process.",
    source: "Photosynthesis.pdf · PDF p.37 · printed p.35", sourceImage: "/materials/photosynthesis/page-37.jpg", sourcePage: 35,
  },
  {
    id: "bio-photo-temperature", code: "3(e)", eyebrow: "Verified source · explain a curve", objective: "3(e) Photosynthesis investigations", marks: 3, skill: "Exam technique", difficulty: 3,
    prompt: "Why does photosynthetic rate fall steeply above the optimum temperature?", options: ["Calvin-cycle enzymes lose functional shape as bonds maintaining their structure are disrupted", "Light intensity becomes zero", "Carbon dioxide changes into oxygen", "Thylakoids leave the chloroplast"], answer: 0,
    hint: "The Calvin cycle is enzyme-catalysed.", misconception: "Temperature effect on photosynthesis", explanation: "Above the optimum, denaturation changes enzyme active sites, reducing Calvin-cycle reaction rates and therefore overall photosynthesis.",
    source: "Photosynthesis.pdf · PDF p.38 · printed p.36", sourceImage: "/materials/photosynthesis/page-38.jpg", sourcePage: 36,
  },
  {
    id: "bio-photo-investigation-control", code: "3(e)", eyebrow: "Verified source · practical design", objective: "3(e) Photosynthesis investigations", marks: 3, skill: "Exam technique", difficulty: 3,
    prompt: "When investigating carbon dioxide concentration, which design best isolates its effect on photosynthetic rate?", options: ["Change carbon dioxide and temperature together", "Use different plant species at every concentration", "Measure once without acclimatisation", "Vary carbon dioxide while controlling light intensity, temperature and plant material"], answer: 3,
    hint: "Only the independent variable should change systematically.", misconception: "Controls in a photosynthesis investigation", explanation: "Holding light, temperature and plant material constant makes carbon dioxide concentration the only systematic cause of any rate difference.",
    source: "Photosynthesis.pdf · PDF p.38 · printed p.36", sourceImage: "/materials/photosynthesis/page-38.jpg", sourcePage: 36,
  },
  {
    id: "bio-photo-chemiosmosis-direction", code: "3(l)", eyebrow: "Verified source · proton direction", objective: "3(l) Chemiosmosis", marks: 2, skill: "Knowledge", difficulty: 1,
    prompt: "During photosynthetic chemiosmosis, in which direction do protons move through ATP synthase?", options: ["Stroma to thylakoid space", "Thylakoid space to stroma", "Cytosol to nucleus", "Matrix to intermembrane space"], answer: 1,
    hint: "Protons return down the gradient built across the thylakoid membrane.", misconception: "Direction of photosynthetic proton flow", explanation: "Protons accumulate in the thylakoid space and diffuse back into the stroma through ATP synthase.",
    source: "Photosynthesis.pdf · PDF p.23 · printed p.23", sourceImage: "/materials/photosynthesis/page-23.jpg", sourcePage: 23,
  },
  {
    id: "bio-photo-proton-motive", code: "3(l)", eyebrow: "Verified source · energy store", objective: "3(l) Chemiosmosis", marks: 2, skill: "Application", difficulty: 2,
    prompt: "Where is the immediate energy used by chloroplast ATP synthase stored?", options: ["In oxygen gas", "In the primary structure of rubisco", "In carbon dioxide", "In the electrochemical proton gradient across the thylakoid membrane"], answer: 3,
    hint: "It is a difference across a membrane.", misconception: "Energy source for ATP synthase", explanation: "The proton gradient stores electrochemical potential energy; proton flow down that gradient powers ATP synthesis.",
    source: "Photosynthesis.pdf · PDF p.23 · printed p.23", sourceImage: "/materials/photosynthesis/page-23.jpg", sourcePage: 23,
  },
  {
    id: "bio-photo-cyclic-chemiosmosis", code: "3(l)", eyebrow: "Verified source · pathway comparison", objective: "3(l) Chemiosmosis", marks: 2, skill: "Application", difficulty: 3,
    prompt: "What is shared by cyclic and non-cyclic photophosphorylation?", options: ["Electron transport creates a proton gradient that drives ATP synthesis", "Both release oxygen from water", "Both reduce NADP+", "Both require photosystem II"], answer: 0,
    hint: "Choose the mechanism common to ATP formation in both pathways.", misconception: "Cyclic versus non-cyclic photophosphorylation", explanation: "Both routes use electron transport to build a proton gradient and chemiosmosis through ATP synthase. Cyclic flow does not use photosystem II, split water or produce NADPH.",
    source: "Photosynthesis.pdf · PDF p.23 · printed p.23", sourceImage: "/materials/photosynthesis/page-23.jpg", sourcePage: 23,
  },
  {
    id: "bio-photo-thylakoid-image", code: "3(a)", eyebrow: "Image interpretation · organelle", objective: "3(a) Chloroplast and mitochondrion components", marks: 2, skill: "Image", difficulty: 2, format: "image",
    prompt: "A label points to the membrane surrounding one thylakoid. Which paired description is correct?", options: ["Contains rubisco; Calvin cycle", "Contains photosystems and ATP synthase; light-dependent reactions", "Contains Krebs-cycle enzymes; link reaction", "Contains cellulose; photolysis"], answer: 1,
    hint: "Match the membrane proteins to the stage of photosynthesis.", misconception: "Thylakoid membrane function", explanation: "Photosystems, electron carriers and ATP synthase are embedded in the thylakoid membrane, where the light-dependent reactions occur.",
    source: "Photosynthesis.pdf · PDF p.9 · printed p.9", sourceImage: "/materials/photosynthesis/page-9.jpg", sourcePage: 9,
  },
  {
    id: "bio-photo-granum-structured", code: "3(a)", eyebrow: "Structured response · image language", objective: "3(a) Chloroplast and mitochondrion components", marks: 3, skill: "Exam technique", difficulty: 2, format: "structured",
    prompt: "Explain how the arrangement of thylakoids in a granum supports the light-dependent reactions.",
    markPoints: ["Many stacked membranes provide a large surface area", "The membranes hold chlorophyll/photosystems, electron carriers and ATP synthase", "This supports light absorption, electron transport and photophosphorylation"],
    modelAnswer: "Stacked thylakoid membranes provide a large surface area containing chlorophyll, electron carriers and ATP synthase, allowing efficient light absorption, electron transport and photophosphorylation.",
    hint: "Link arrangement → membrane proteins → process.", misconception: "Structure-function explanation for grana", explanation: "Award one mark for each distinct structure-function link.",
    source: "Photosynthesis.pdf · PDF p.9 · printed p.9", sourceImage: "/materials/photosynthesis/page-9.jpg", sourcePage: 9,
  },
  {
    id: "bio-photo-spectrum-data", code: "3(b)", eyebrow: "Data response · unfamiliar results", objective: "3(b) Photosynthetic spectra", marks: 2, skill: "Application", difficulty: 2, format: "data",
    prompt: "A student measures oxygen production under equal-intensity light. Which conclusion is best supported by the data?", data: { headers: ["Wavelength / nm", "450", "550", "680"], rows: [["O₂ / units min⁻¹", "18", "5", "21"]] },
    options: ["Green light is absorbed most strongly", "Blue and red light support higher photosynthetic rates than green light", "Wavelength has no effect", "Red light denatures chlorophyll"], answer: 1,
    hint: "Compare the response at 550 nm with both outer wavelengths.", misconception: "Using action-spectrum data", explanation: "The rate is much lower at 550 nm than at 450 or 680 nm, consistent with weaker absorption of green light by photosynthetic pigments.",
    source: "Photosynthesis.pdf · PDF p.36 · printed p.34", sourceImage: "/materials/photosynthesis/page-36.jpg", sourcePage: 34,
  },
  {
    id: "bio-photo-spectrum-structured", code: "3(b)", eyebrow: "Structured response · explain data", objective: "3(b) Photosynthetic spectra", marks: 3, skill: "Exam technique", difficulty: 3, format: "structured",
    prompt: "Explain why an action spectrum has high values in blue and red light but a lower value in green light.",
    markPoints: ["Photosynthetic pigments absorb blue and red wavelengths strongly", "Green light is absorbed less and more is reflected/transmitted", "More absorbed light energy drives more light-dependent reactions and photosynthesis"],
    modelAnswer: "Chlorophyll and accessory pigments absorb blue and red wavelengths strongly but absorb green weakly. More absorbed energy drives photoactivation and electron transport, so photosynthesis is faster in blue and red light.",
    hint: "Link absorption, usable energy and measured rate.", misconception: "Explaining action and absorption spectra", explanation: "The response must connect pigment absorption to energy available for photosynthesis.",
    source: "Photosynthesis.pdf · PDF p.36 · printed p.34", sourceImage: "/materials/photosynthesis/page-36.jpg", sourcePage: 34,
  },
  {
    id: "bio-photo-noncyclic-sequence", code: "3(c)", eyebrow: "Sequence · non-cyclic flow", objective: "3(c) Light-dependent reactions", marks: 3, skill: "Application", difficulty: 2, format: "sequence",
    prompt: "Which sequence correctly traces non-cyclic electron flow?", options: ["PSI → water → PSII → NADP+", "Water → PSII → electron carriers → PSI → NADP+", "NADP+ → PSI → PSII → water", "RuBP → PSII → ATP synthase → oxygen"], answer: 1,
    hint: "Start with the electron source and end with the final acceptor.", misconception: "Order of non-cyclic electron flow", explanation: "Photolysis supplies electrons to PSII; carriers transfer them to PSI, and re-energised electrons finally reduce NADP+.",
    source: "Photosynthesis.pdf · PDF p.23 · printed p.23", sourceImage: "/materials/photosynthesis/page-23.jpg", sourcePage: 23,
  },
  {
    id: "bio-photo-noncyclic-structured", code: "3(c)", eyebrow: "Structured response · energy conversion", objective: "3(c) Light-dependent reactions", marks: 4, skill: "Exam technique", difficulty: 3, format: "structured",
    prompt: "Describe how non-cyclic photophosphorylation produces both ATP and reduced NADP.",
    markPoints: ["Light excites electrons in chlorophyll/photosystem II", "Electron transfer releases energy used to pump protons into the thylakoid space", "Protons flow through ATP synthase to make ATP", "Electrons are re-excited at photosystem I and reduce NADP+ with protons"],
    modelAnswer: "Light excites electrons in PSII. Their transfer releases energy that pumps protons into the thylakoid space; proton return through ATP synthase makes ATP. The electrons are re-excited in PSI and, with protons, reduce NADP+.",
    hint: "Account separately for ATP formation and NADP+ reduction.", misconception: "Integrated light-dependent pathway", explanation: "Use a causal chain from photon absorption to both chemical products.",
    source: "Photosynthesis.pdf · PDF p.23 · printed p.23", sourceImage: "/materials/photosynthesis/page-23.jpg", sourcePage: 23,
  },
  {
    id: "bio-photo-calvin-sequence", code: "3(d)", eyebrow: "Sequence · Calvin cycle", objective: "3(d) Calvin cycle", marks: 3, skill: "Application", difficulty: 2, format: "sequence",
    prompt: "Which sequence correctly orders the major Calvin-cycle events?", options: ["RuBP regeneration → photolysis → glycolysis", "CO₂ fixation → PGA reduction → triose phosphate use and RuBP regeneration", "PGA reduction → CO₂ fixation → oxygen release", "ATP synthesis → pyruvate oxidation → RuBP formation"], answer: 1,
    hint: "Begin when carbon dioxide meets its five-carbon acceptor.", misconception: "Order of Calvin-cycle stages", explanation: "Carbon dioxide is fixed to RuBP, PGA is reduced to triose phosphate, and most triose phosphate is then used to regenerate RuBP.",
    source: "Photosynthesis.pdf · PDF p.28 · printed p.28", sourceImage: "/materials/photosynthesis/page-28.jpg", sourcePage: 28,
  },
  {
    id: "bio-photo-rubisco-inhibitor", code: "3(d)", eyebrow: "Structured response · unfamiliar context", objective: "3(d) Calvin cycle", marks: 4, skill: "Application", difficulty: 3, format: "structured",
    prompt: "A compound inhibits rubisco. Predict and explain the short-term effects on carbon fixation, PGA formation and triose phosphate production.",
    markPoints: ["Carbon dioxide fixation to RuBP decreases", "Less unstable six-carbon intermediate/PGA is formed", "Less PGA is available for reduction to triose phosphate", "Carbohydrate production therefore decreases while RuBP may accumulate initially"],
    modelAnswer: "Rubisco inhibition reduces fixation of carbon dioxide to RuBP, so less PGA forms. With less PGA available for reduction, triose phosphate and carbohydrate production fall; RuBP may initially accumulate.",
    hint: "Follow the pathway downstream from the inhibited step.", misconception: "Predicting consequences within the Calvin cycle", explanation: "A strong answer follows the causal chain rather than only stating that photosynthesis falls.",
    source: "Photosynthesis.pdf · PDF p.28 · printed p.28", sourceImage: "/materials/photosynthesis/page-28.jpg", sourcePage: 28,
  },
  {
    id: "bio-photo-limiting-data", code: "3(e)", eyebrow: "Data response · limiting factors", objective: "3(e) Photosynthesis investigations", marks: 3, skill: "Application", difficulty: 3, format: "data",
    prompt: "Rates were measured at two carbon dioxide concentrations. Which interpretation best explains the pattern?", data: { headers: ["Light / units", "10", "30", "60"], rows: [["Low CO₂ rate", "4", "9", "9"], ["High CO₂ rate", "4", "13", "20"]] },
    options: ["CO₂ is limiting at all light intensities", "Light is limiting at low intensity, while CO₂ becomes limiting at higher intensity", "Temperature must be zero", "High CO₂ prevents light absorption"], answer: 1,
    hint: "Notice where changing CO₂ does and does not change the rate.", misconception: "Identifying a changing limiting factor", explanation: "At low light both treatments are equal, so light limits. At higher light, added carbon dioxide raises the rate, showing that carbon dioxide limits the low-CO₂ treatment.",
    source: "Photosynthesis.pdf · PDF pp.37–38 · printed pp.35–36", sourceImage: "/materials/photosynthesis/page-37.jpg", sourcePage: 35,
  },
  {
    id: "bio-photo-co2-practical", code: "3(e)", eyebrow: "Practical planning · four marks", objective: "3(e) Photosynthesis investigations", marks: 4, skill: "Exam technique", difficulty: 3, format: "practical",
    prompt: "Plan how to investigate the effect of carbon dioxide concentration on the rate of photosynthesis in an aquatic plant.",
    markPoints: ["Use a range of known carbon dioxide concentrations and the same species/length of plant", "Measure oxygen production per unit time after a fixed acclimatisation period", "Control light intensity and temperature", "Repeat each concentration and calculate a mean; identify anomalies or include uncertainty"],
    modelAnswer: "Place equal lengths of the same aquatic plant in a range of known carbon dioxide concentrations. After acclimatisation, measure oxygen produced per unit time while keeping light intensity and temperature constant. Repeat and calculate means, checking anomalies and measurement uncertainty.",
    hint: "Include the independent variable, rate measurement, controls and reliability.", misconception: "Planning a valid photosynthesis investigation", explanation: "The mark points mirror the logic examiners reward in a controlled biological investigation.",
    source: "Photosynthesis.pdf · PDF p.38 · printed p.36", sourceImage: "/materials/photosynthesis/page-38.jpg", sourcePage: 36,
  },
  {
    id: "bio-photo-proton-sequence", code: "3(l)", eyebrow: "Sequence · chemiosmosis", objective: "3(l) Chemiosmosis", marks: 3, skill: "Application", difficulty: 2, format: "sequence",
    prompt: "Which sequence correctly describes photosynthetic chemiosmosis?", options: ["ATP hydrolysis → proton pumping → NADP+ oxidation", "Electron transport → proton accumulation in thylakoid space → proton flow through ATP synthase → ATP", "CO₂ fixation → oxygen reduction → ATP", "Photolysis → RuBP regeneration → glycolysis"], answer: 1,
    hint: "Order the energy-coupling events across the thylakoid membrane.", misconception: "Causal order in photosynthetic chemiosmosis", explanation: "Electron-transfer energy builds the proton gradient; the gradient is then discharged through ATP synthase to make ATP.",
    source: "Photosynthesis.pdf · PDF p.23 · printed p.23", sourceImage: "/materials/photosynthesis/page-23.jpg", sourcePage: 23,
  },
  {
    id: "bio-photo-chemi-compare", code: "3(l)", eyebrow: "Structured response · compare systems", objective: "3(l) Chemiosmosis", marks: 4, skill: "Exam technique", difficulty: 3, format: "structured",
    prompt: "Compare chemiosmosis in chloroplasts and mitochondria.",
    markPoints: ["Both use electron transport to pump protons across a membrane", "Both use proton flow down an electrochemical gradient through ATP synthase", "Chloroplast protons accumulate in the thylakoid space and return to the stroma", "Mitochondrial protons accumulate in the intermembrane space and return to the matrix"],
    modelAnswer: "Both systems couple electron transport to proton pumping and use proton return through ATP synthase to form ATP. Chloroplasts build the gradient into the thylakoid space and release it to the stroma; mitochondria build it in the intermembrane space and release it to the matrix.",
    hint: "Give two similarities and one direction/location for each organelle.", misconception: "Comparing chloroplast and mitochondrial chemiosmosis", explanation: "Full credit requires the shared mechanism and the correct compartments in both organelles.",
    source: "Photosynthesis.pdf · PDF p.23 · printed p.23", sourceImage: "/materials/photosynthesis/page-23.jpg", sourcePage: 23,
  },
];

export const respirationQuestions: BiologyQuestion[] = [
  {
    id: "bio-resp-glycolysis-location", code: "3(f)", eyebrow: "Verified source · location", objective: "3(f) Glycolysis", marks: 1, skill: "Knowledge", difficulty: 1,
    prompt: "Where does glycolysis occur?", options: ["Mitochondrial matrix", "Inner mitochondrial membrane", "Cytosol", "Intermembrane space"], answer: 2,
    hint: "This stage can continue without a mitochondrion.", misconception: "Location of glycolysis", explanation: "Glycolysis occurs in the cytosol and does not directly require oxygen.",
    source: "Cellular Respiration.pdf · PDF p.11 · printed p.49", sourceImage: "/materials/respiration/page-11.jpg", sourcePage: 49,
  },
  {
    id: "bio-resp-glycolysis-products", code: "3(f)", eyebrow: "Verified source · product accounting", objective: "3(f) Glycolysis", marks: 2, skill: "Knowledge", difficulty: 2,
    prompt: "What are the net products of glycolysis per glucose molecule?", options: ["Two acetyl CoA, two carbon dioxide and two ATP", "Two pyruvate, two ATP and two reduced NAD", "Six carbon dioxide and no ATP", "One pyruvate, four ATP and oxygen"], answer: 1,
    hint: "Distinguish net ATP from the total formed during the payoff phase.", misconception: "Net products of glycolysis", explanation: "One glucose yields two pyruvate, a net gain of two ATP and two reduced NAD molecules.",
    source: "Cellular Respiration.pdf · PDF p.11 · printed p.49", sourceImage: "/materials/respiration/page-11.jpg", sourcePage: 49,
  },
  {
    id: "bio-resp-glycolysis-investment", code: "3(f)", eyebrow: "Verified source · mechanism", objective: "3(f) Glycolysis", marks: 2, skill: "Application", difficulty: 2,
    prompt: "Why is ATP used early in glycolysis to phosphorylate the hexose?", options: ["To release carbon dioxide immediately", "To reduce oxygen", "To move glucose into the mitochondrion", "To make the hexose more reactive before it is split and oxidised"], answer: 3,
    hint: "This is called the energy-investment phase.", misconception: "Purpose of early phosphorylation in glycolysis", explanation: "ATP phosphorylation raises the sugar's energy and reactivity, preparing it for splitting and subsequent oxidation that yields ATP and reduced NAD.",
    source: "Cellular Respiration.pdf · PDF p.11 · printed p.49", sourceImage: "/materials/respiration/page-11.jpg", sourcePage: 49,
  },
  {
    id: "bio-resp-link-products", code: "3(g)", eyebrow: "Verified source · link reaction", objective: "3(g) Link reaction and Krebs cycle", marks: 2, skill: "Knowledge", difficulty: 1,
    prompt: "What is formed when one pyruvate undergoes the link reaction?", options: ["Acetyl CoA, carbon dioxide and reduced NAD", "Lactate, oxygen and ATP", "RuBP and PGA", "Glucose and reduced FAD"], answer: 0,
    hint: "The reaction includes decarboxylation and dehydrogenation.", misconception: "Products of the link reaction", explanation: "Pyruvate is decarboxylated and oxidised, producing acetyl CoA, carbon dioxide and reduced NAD in the mitochondrial matrix.",
    source: "Cellular Respiration.pdf · PDF p.12 · printed p.50", sourceImage: "/materials/respiration/page-12.jpg", sourcePage: 50,
  },
  {
    id: "bio-resp-krebs-products", code: "3(g)", eyebrow: "Verified source · cycle accounting", objective: "3(g) Link reaction and Krebs cycle", marks: 2, skill: "Application", difficulty: 2,
    prompt: "Which set is produced from one turn of the Krebs cycle per acetyl CoA?", options: ["Two pyruvate and two ATP", "One glucose and six oxygen", "Three reduced NAD, one reduced FAD, one ATP and two carbon dioxide", "One RuBP and one triose phosphate"], answer: 2,
    hint: "The notes show values per glucose after two turns; halve them.", misconception: "Products per turn of the Krebs cycle", explanation: "Each acetyl CoA yields three reduced NAD, one reduced FAD, one ATP by substrate-level phosphorylation and two carbon dioxide.",
    source: "Cellular Respiration.pdf · PDF p.14 · printed p.52", sourceImage: "/materials/respiration/page-14.jpg", sourcePage: 52,
  },
  {
    id: "bio-resp-dehydrogenation", code: "3(g)", eyebrow: "Verified source · exam language", objective: "3(g) Link reaction and Krebs cycle", marks: 3, skill: "Exam technique", difficulty: 3,
    prompt: "What do decarboxylation and dehydrogenation accomplish during the link reaction and Krebs cycle?", options: ["They add carbon dioxide and oxidise NADH", "They remove carbon dioxide and transfer hydrogen/electrons to NAD+ or FAD", "They split water to release oxygen", "They regenerate RuBP"], answer: 1,
    hint: "Explain both terms using their removed products.", misconception: "Meaning of decarboxylation and dehydrogenation", explanation: "Decarboxylation removes carbon as carbon dioxide; dehydrogenation oxidises intermediates and reduces electron carriers NAD+ or FAD.",
    source: "Cellular Respiration.pdf · PDF pp.12–14 · printed pp.50–52", sourceImage: "/materials/respiration/page-14.jpg", sourcePage: 52,
  },
  {
    id: "bio-resp-oxygen", code: "3(h)", eyebrow: "Image · final acceptor", objective: "3(h) Oxidative phosphorylation", marks: 2, skill: "Image", difficulty: 1, format: "image",
    prompt: "What is oxygen's role in oxidative phosphorylation?", options: ["It donates electrons to reduced NAD", "It pumps protons directly", "It phosphorylates ADP", "It is the final electron acceptor and is reduced to water"], answer: 3,
    hint: "Without this acceptor, electron flow through the chain stops.", misconception: "Role of oxygen in respiration", explanation: "Oxygen accepts electrons and protons at the end of the electron transport chain, forming water and allowing continued carrier oxidation.",
    source: "Cellular Respiration.pdf · PDF p.15 · printed p.53", sourceImage: "/materials/respiration/page-15.jpg", sourcePage: 53,
  },
  {
    id: "bio-resp-etc-pumping", code: "3(h)", eyebrow: "Verified source · energy coupling", objective: "3(h) Oxidative phosphorylation", marks: 3, skill: "Exam technique", difficulty: 2,
    prompt: "How does electron flow along the mitochondrial electron transport chain lead to ATP synthesis?", options: ["Released energy pumps protons into the intermembrane space, creating a gradient used by ATP synthase", "Electrons combine directly with ADP", "Carbon dioxide drives ATP synthase", "Pyruvate diffuses through ATP synthase"], answer: 0,
    hint: "Follow energy from electrons to a transmembrane gradient.", misconception: "Coupling the ETC to ATP synthesis", explanation: "Energy released by electron transfer pumps protons from the matrix into the intermembrane space. Their return through ATP synthase powers phosphorylation of ADP.",
    source: "Cellular Respiration.pdf · PDF p.15 · printed p.53", sourceImage: "/materials/respiration/page-15.jpg", sourcePage: 53,
  },
  {
    id: "bio-resp-uncoupler", code: "3(h)", eyebrow: "Verified source · unfamiliar context", objective: "3(h) Oxidative phosphorylation", marks: 3, skill: "Application", difficulty: 3,
    prompt: "A chemical makes the inner mitochondrial membrane freely permeable to protons. What is the most direct effect?", options: ["More carbon dioxide is fixed", "Glycolysis stops instantly because glucose vanishes", "The proton gradient collapses and ATP synthesis by oxidative phosphorylation falls", "Oxygen is converted to glucose"], answer: 2,
    hint: "ATP synthase depends on a proton-motive force.", misconception: "Importance of inner-membrane proton impermeability", explanation: "Proton leakage dissipates the electrochemical gradient, uncoupling electron transport from ATP synthesis even if electron flow continues.",
    source: "Cellular Respiration.pdf · PDF p.18 · printed p.56", sourceImage: "/materials/respiration/page-18.jpg", sourcePage: 56,
  },
  {
    id: "bio-resp-initial-rate", code: "3(k)", eyebrow: "9744 practical · initial rate", objective: "3(k) Respiration investigations", marks: 2, skill: "Application", difficulty: 2,
    prompt: "Why should initial oxygen-uptake rate be compared when testing respiratory substrates?", options: ["Substrate depletion and product accumulation have had minimal effect", "Every respirometer has reached equilibrium", "Temperature no longer matters", "It guarantees identical organisms"], answer: 0,
    hint: "Use the earliest linear part of each time course.", misconception: "Choosing a valid respiratory rate", explanation: "An initial rate gives the fairest comparison before the reaction mixture changes substantially.",
    source: "9744 H2 Biology syllabus.pdf · PDF p.18", sourceImage: "/materials/syllabus-9744/page-18.jpg", sourcePage: 18,
  },
  {
    id: "bio-resp-yeast-products", code: "3(i)", eyebrow: "Verified source · pathway products", objective: "3(i) Anaerobic respiration", marks: 1, skill: "Knowledge", difficulty: 1,
    prompt: "Which products are formed from pyruvate during anaerobic respiration in yeast?", options: ["Lactate only", "Acetyl CoA and oxygen", "RuBP and carbon dioxide", "Ethanol and carbon dioxide"], answer: 3,
    hint: "Yeast carries out alcoholic fermentation.", misconception: "Yeast versus mammalian anaerobic products", explanation: "Yeast decarboxylates pyruvate to ethanal and then reduces ethanal to ethanol, releasing carbon dioxide.",
    source: "Cellular Respiration.pdf · PDF p.20 · printed p.58", sourceImage: "/materials/respiration/page-20.jpg", sourcePage: 58,
  },
  {
    id: "bio-resp-muscle-product", code: "3(i)", eyebrow: "Verified source · tissue context", objective: "3(i) Anaerobic respiration", marks: 2, skill: "Application", difficulty: 2,
    prompt: "What happens to pyruvate in mammalian muscle when oxygen supply is insufficient?", options: ["It is reduced to lactate", "It is decarboxylated to ethanol", "It enters the Calvin cycle", "It releases oxygen"], answer: 0,
    hint: "Mammalian muscle uses a one-step fermentation pathway.", misconception: "Mammalian anaerobic pathway", explanation: "Pyruvate accepts hydrogen and electrons from reduced NAD and is reduced to lactate, regenerating NAD+.",
    source: "Cellular Respiration.pdf · PDF p.21 · printed p.59", sourceImage: "/materials/respiration/page-21.jpg", sourcePage: 59,
  },
  {
    id: "bio-resp-nad-regeneration", code: "3(j)", eyebrow: "Verified source · central purpose", objective: "3(j) NAD regeneration", marks: 2, skill: "Knowledge", difficulty: 1,
    prompt: "What is the central significance of forming ethanol or lactate during anaerobic respiration?", options: ["To produce oxygen", "To make glucose directly", "To oxidise reduced NAD and regenerate NAD+ for glycolysis", "To create a mitochondrial proton gradient"], answer: 2,
    hint: "Glycolysis needs an oxidised electron carrier.", misconception: "Purpose of fermentation end products", explanation: "Reduction of ethanal or pyruvate transfers electrons from reduced NAD, regenerating NAD+ so glycolysis and its small ATP yield can continue.",
    source: "Cellular Respiration.pdf · PDF pp.20–21 · printed pp.58–59", sourceImage: "/materials/respiration/page-21.jpg", sourcePage: 59,
  },
  {
    id: "bio-resp-no-nad", code: "3(j)", eyebrow: "Verified source · consequence", objective: "3(j) NAD regeneration", marks: 3, skill: "Application", difficulty: 3,
    prompt: "What would happen first if reduced NAD could not be reoxidised during anaerobic conditions?", options: ["The Calvin cycle would accelerate", "Glycolytic dehydrogenation would stop as NAD+ became unavailable, so ATP production would cease", "Oxygen would be released", "More acetyl CoA would enter the Krebs cycle"], answer: 1,
    hint: "Track the finite pool of NAD+ in the cytosol.", misconception: "Dependence of glycolysis on NAD+ recycling", explanation: "NAD+ is required to accept electrons during glycolysis. Without regeneration, it is depleted, glycolysis stops and no further substrate-level ATP is produced.",
    source: "Cellular Respiration.pdf · PDF p.20 · printed p.58", sourceImage: "/materials/respiration/page-20.jpg", sourcePage: 58,
  },
  {
    id: "bio-resp-fermentation-compare", code: "3(j)", eyebrow: "Verified source · compare pathways", objective: "3(j) NAD regeneration", marks: 2, skill: "Exam technique", difficulty: 2,
    prompt: "Which distinction between yeast and mammalian muscle fermentation is correct?", options: ["Only muscle regenerates NAD+", "Only yeast uses pyruvate", "Only muscle can continue glycolysis", "Yeast releases carbon dioxide while lactate formation does not"], answer: 3,
    hint: "Compare the number of carbon atoms in the products.", misconception: "Comparing alcoholic and lactate fermentation", explanation: "Yeast decarboxylates three-carbon pyruvate before ethanol forms, releasing carbon dioxide. Muscle reduces pyruvate directly to three-carbon lactate.",
    source: "Cellular Respiration.pdf · PDF pp.20–21 · printed pp.58–59", sourceImage: "/materials/respiration/page-20.jpg", sourcePage: 58,
  },
  {
    id: "bio-resp-chemiosmosis-direction", code: "3(l)", eyebrow: "Verified source · proton direction", objective: "3(l) Chemiosmosis", marks: 2, skill: "Knowledge", difficulty: 1,
    prompt: "During mitochondrial chemiosmosis, in which direction do protons flow through ATP synthase?", options: ["Intermembrane space to matrix", "Matrix to intermembrane space", "Cytosol to matrix", "Thylakoid space to stroma"], answer: 0,
    hint: "They return down the gradient created by the electron transport chain.", misconception: "Direction of mitochondrial proton flow", explanation: "The ETC pumps protons into the intermembrane space; they then diffuse back into the matrix through ATP synthase.",
    source: "Cellular Respiration.pdf · PDF p.18 · printed p.56", sourceImage: "/materials/respiration/page-18.jpg", sourcePage: 56,
  },
  {
    id: "bio-resp-inner-membrane", code: "3(l)", eyebrow: "Verified source · membrane property", objective: "3(l) Chemiosmosis", marks: 2, skill: "Application", difficulty: 2,
    prompt: "Why must the inner mitochondrial membrane be largely impermeable to protons?", options: ["To prevent oxygen entering", "To keep pyruvate in the cytosol", "To maintain the proton gradient so return flow is coupled to ATP synthase", "To stop the Krebs cycle"], answer: 2,
    hint: "Uncontrolled proton leakage would bypass one protein.", misconception: "Membrane requirement for chemiosmosis", explanation: "Proton impermeability preserves the electrochemical gradient and channels proton return through ATP synthase rather than allowing uncoupled leakage.",
    source: "Cellular Respiration.pdf · PDF p.18 · printed p.56", sourceImage: "/materials/respiration/page-18.jpg", sourcePage: 56,
  },
  {
    id: "bio-resp-photo-compare", code: "3(l)", eyebrow: "Verified source · integrate processes", objective: "3(l) Chemiosmosis", marks: 3, skill: "Exam technique", difficulty: 3,
    prompt: "What principle is shared by chemiosmosis in chloroplasts and mitochondria?", options: ["Both use carbon dioxide as the final electron acceptor", "Electron transport builds a proton gradient across a membrane and proton return through ATP synthase makes ATP", "Both split water to replace electrons", "Both pump protons into the cytosol"], answer: 1,
    hint: "Ignore the different electron donors and acceptors; identify the common coupling mechanism.", misconception: "Shared chemiosmotic mechanism", explanation: "In both organelles, electron-transfer energy pumps protons across an energy-transducing membrane, and downhill proton flow through ATP synthase drives ATP production.",
    source: "Cellular Respiration.pdf · PDF p.18 · printed p.56", sourceImage: "/materials/respiration/page-18.jpg", sourcePage: 56,
  },
  {
    id: "bio-resp-glycolysis-sequence", code: "3(f)", eyebrow: "Sequence · glycolysis", objective: "3(f) Glycolysis", marks: 3, skill: "Application", difficulty: 2, format: "sequence",
    prompt: "Which sequence correctly summarises glycolysis?", options: ["Glucose oxidation → Krebs cycle → photolysis", "Hexose phosphorylation → splitting into triose phosphates → oxidation and substrate-level phosphorylation", "Pyruvate reduction → glucose synthesis → oxygen release", "Acetyl CoA formation → RuBP regeneration → ATP hydrolysis"], answer: 1,
    hint: "Begin with the energy-investment phase and finish with the payoff phase.", misconception: "Order of glycolytic stages", explanation: "ATP first phosphorylates the hexose; it splits into triose phosphates, which are oxidised while ATP and reduced NAD are produced.",
    source: "Cellular Respiration.pdf · PDF p.11 · printed p.49", sourceImage: "/materials/respiration/page-11.jpg", sourcePage: 49,
  },
  {
    id: "bio-resp-glycolysis-account", code: "3(f)", eyebrow: "Structured response · product accounting", objective: "3(f) Glycolysis", marks: 4, skill: "Exam technique", difficulty: 3, format: "structured",
    prompt: "Account for the products of glycolysis from one glucose molecule.",
    markPoints: ["One six-carbon glucose is split to form two three-carbon pyruvate", "Two NAD are reduced during oxidation of triose phosphate", "Four ATP are formed by substrate-level phosphorylation", "Two ATP were invested, giving a net gain of two ATP"],
    modelAnswer: "One glucose forms two pyruvate. Oxidation reduces two NAD and substrate-level phosphorylation forms four ATP, but two ATP were used earlier, so the net gain is two ATP.",
    hint: "Distinguish total ATP formed from net ATP gained.", misconception: "Glycolysis stoichiometry", explanation: "Award marks for carbon, reduced NAD and both gross and net ATP accounting.",
    source: "Cellular Respiration.pdf · PDF p.11 · printed p.49", sourceImage: "/materials/respiration/page-11.jpg", sourcePage: 49,
  },
  {
    id: "bio-resp-krebs-sequence", code: "3(g)", eyebrow: "Sequence · link and Krebs", objective: "3(g) Link reaction and Krebs cycle", marks: 3, skill: "Application", difficulty: 2, format: "sequence",
    prompt: "Which sequence correctly connects glycolysis to the Krebs cycle?", options: ["Pyruvate → acetyl CoA → citrate formation → decarboxylation/dehydrogenation → oxaloacetate regeneration", "Glucose → RuBP → PGA → citrate", "Acetyl CoA → pyruvate → oxygen → glucose", "Pyruvate → lactate → acetyl CoA → chlorophyll"], answer: 0,
    hint: "Track the two-carbon compound entering the cycle and the four-carbon acceptor restored at the end.", misconception: "Linking pyruvate oxidation to the Krebs cycle", explanation: "The link reaction forms acetyl CoA. Its acetyl group joins oxaloacetate, and subsequent reactions regenerate oxaloacetate while releasing carbon dioxide and reducing carriers.",
    source: "Cellular Respiration.pdf · PDF pp.12–14 · printed pp.50–52", sourceImage: "/materials/respiration/page-14.jpg", sourcePage: 52,
  },
  {
    id: "bio-resp-carrier-structured", code: "3(g)", eyebrow: "Structured response · energy transfer", objective: "3(g) Link reaction and Krebs cycle", marks: 4, skill: "Exam technique", difficulty: 3, format: "structured",
    prompt: "Explain why reduced NAD and reduced FAD are important products of the link reaction and Krebs cycle.",
    markPoints: ["They carry high-energy electrons/hydrogen removed during oxidation", "They donate electrons to the electron transport chain", "Electron transfer releases energy used to pump protons", "The proton gradient drives ATP synthesis by oxidative phosphorylation"],
    modelAnswer: "Reduced NAD and FAD carry electrons from oxidation reactions to the electron transport chain. Electron transfer releases energy for proton pumping, and the resulting gradient drives ATP synthesis.",
    hint: "Follow energy from an oxidised respiratory intermediate to ATP.", misconception: "Role of reduced coenzymes", explanation: "A complete response links coenzymes to the electron transport chain, proton pumping and ATP.",
    source: "Cellular Respiration.pdf · PDF pp.14–15 · printed pp.52–53", sourceImage: "/materials/respiration/page-15.jpg", sourcePage: 53,
  },
  {
    id: "bio-resp-uncoupler-data", code: "3(h)", eyebrow: "Data response · inhibitor", objective: "3(h) Oxidative phosphorylation", marks: 3, skill: "Application", difficulty: 3, format: "data",
    prompt: "An uncoupler makes the inner membrane permeable to protons. Which conclusion best explains the results?", data: { headers: ["Treatment", "O₂ use", "ATP output"], rows: [["Control", "40", "32"], ["Uncoupler", "58", "5"]] },
    options: ["Electron transport stops completely", "Proton leakage uncouples oxygen use from ATP synthesis", "The Krebs cycle becomes photosynthesis", "ATP directly reduces oxygen"], answer: 1,
    hint: "Oxygen use shows electron transport continues while ATP output collapses.", misconception: "Interpreting uncoupling data", explanation: "The uncoupler dissipates the gradient, so electron transport and oxygen consumption can continue or rise while proton flow bypasses ATP synthase and ATP output falls.",
    source: "Cellular Respiration.pdf · PDF p.18 · printed p.56", sourceImage: "/materials/respiration/page-18.jpg", sourcePage: 56,
  },
  {
    id: "bio-resp-oxidative-structured", code: "3(h)", eyebrow: "Structured response · oxidative phosphorylation", objective: "3(h) Oxidative phosphorylation", marks: 4, skill: "Exam technique", difficulty: 3, format: "structured",
    prompt: "Explain how reduced NAD leads to ATP production in the inner mitochondrial membrane.",
    markPoints: ["Reduced NAD donates electrons and is oxidised", "Electrons pass along carriers and release energy", "Energy pumps protons from the matrix to the intermembrane space", "Proton return through ATP synthase drives phosphorylation of ADP"],
    modelAnswer: "Reduced NAD donates electrons to the electron transport chain. Energy released during transfer pumps protons into the intermembrane space. Their return through ATP synthase drives ATP formation.",
    hint: "Use the chain: reduced carrier → electrons → protons → ATP synthase.", misconception: "Oxidative phosphorylation causal chain", explanation: "Full credit requires both electron transfer and chemiosmotic coupling.",
    source: "Cellular Respiration.pdf · PDF p.15 · printed p.53", sourceImage: "/materials/respiration/page-15.jpg", sourcePage: 53,
  },
  {
    id: "bio-resp-substrate-data", code: "3(k)", eyebrow: "Data response · respiratory substrate", objective: "3(k) Respiration investigations", marks: 3, skill: "Application", difficulty: 3, format: "data",
    prompt: "Which substrate supports the greatest initial respiration rate?", data: { headers: ["Substrate", "O₂ uptake at 0 min", "O₂ uptake at 5 min"], rows: [["Glucose", "0.0", "2.8"], ["Starch", "0.0", "0.7"], ["No substrate", "0.0", "0.2"]] },
    options: ["Glucose, because its oxygen-uptake gradient is steepest", "Starch", "No substrate", "All are equal"], answer: 0,
    hint: "Calculate change per unit time, not only the final label.", misconception: "Interpreting respirometer data", explanation: "Glucose produces the largest oxygen decrease over the same interval and therefore the greatest initial aerobic respiration rate.",
    source: "9744 H2 Biology syllabus.pdf · PDF p.18", sourceImage: "/materials/syllabus-9744/page-18.jpg", sourcePage: 18,
  },
  {
    id: "bio-resp-temperature-practical", code: "3(k)", eyebrow: "Practical · respiration rate", objective: "3(k) Respiration investigations", marks: 4, skill: "Exam technique", difficulty: 3, format: "practical",
    prompt: "Plan a respirometer investigation of temperature on seed respiration rate.",
    markPoints: ["Use equal masses and germination stages of seeds at several thermostatically controlled temperatures", "Use carbon-dioxide absorbent and measure oxygen-related manometer displacement per unit time", "Keep apparatus volume, acclimatisation time and measurement interval constant and include a non-respiring control", "Repeat each temperature and compare mean initial rates"],
    modelAnswer: "Place equal masses of equally germinated seeds in sealed respirometers with carbon-dioxide absorbent at controlled temperatures. After acclimatisation, measure manometer displacement per unit time, using matched non-respiring controls and repeats to calculate mean initial rates.",
    hint: "Control biological material and apparatus, then measure an initial rate reliably.", misconception: "Planning a respiration investigation", explanation: "The plan isolates temperature and measures oxygen uptake while controlling pressure changes not caused by respiration.",
    source: "9744 H2 Biology syllabus.pdf · PDF p.18", sourceImage: "/materials/syllabus-9744/page-18.jpg", sourcePage: 18,
  },
  {
    id: "bio-resp-fermentation-sequence", code: "3(j)", eyebrow: "Sequence · NAD regeneration", objective: "3(j) NAD regeneration", marks: 3, skill: "Application", difficulty: 2, format: "sequence",
    prompt: "Which sequence correctly shows alcoholic fermentation in yeast?", options: ["Pyruvate → ethanal + CO₂ → ethanol while reduced NAD is oxidised", "Pyruvate → lactate + CO₂ → glucose", "Ethanol → pyruvate → oxygen", "Pyruvate → acetyl CoA → RuBP"], answer: 0,
    hint: "The first step removes carbon dioxide; the second regenerates NAD+.", misconception: "Order of alcoholic fermentation", explanation: "Pyruvate is decarboxylated to ethanal, which accepts hydrogen/electrons from reduced NAD to form ethanol and regenerate NAD+.",
    source: "Cellular Respiration.pdf · PDF p.20 · printed p.58", sourceImage: "/materials/respiration/page-20.jpg", sourcePage: 58,
  },
  {
    id: "bio-resp-fermentation-structured", code: "3(j)", eyebrow: "Structured response · compare pathways", objective: "3(j) NAD regeneration", marks: 4, skill: "Exam technique", difficulty: 3, format: "structured",
    prompt: "Compare anaerobic respiration in yeast with that in mammalian muscle.",
    markPoints: ["Both oxidise reduced NAD to regenerate NAD+ so glycolysis can continue", "Yeast decarboxylates pyruvate to ethanal and releases carbon dioxide", "Ethanal is reduced to ethanol in yeast", "Muscle reduces pyruvate directly to lactate without carbon dioxide release"],
    modelAnswer: "Both pathways regenerate NAD+ for glycolysis. Yeast decarboxylates pyruvate to ethanal, releases carbon dioxide and reduces ethanal to ethanol; muscle reduces pyruvate directly to lactate without releasing carbon dioxide.",
    hint: "State the shared purpose, then contrast products and carbon dioxide.", misconception: "Comparing fermentation pathways", explanation: "Full credit requires the common NAD purpose and the distinct reaction routes.",
    source: "Cellular Respiration.pdf · PDF pp.20–21 · printed pp.58–59", sourceImage: "/materials/respiration/page-21.jpg", sourcePage: 59,
  },
  {
    id: "bio-resp-gradient-data", code: "3(l)", eyebrow: "Data response · proton motive force", objective: "3(l) Chemiosmosis", marks: 3, skill: "Application", difficulty: 3, format: "data",
    prompt: "Isolated mitochondria receive ADP at time 2 and a proton ionophore at time 3. Which interpretation is best?", data: { headers: ["Time", "1", "2", "3"], rows: [["Proton gradient", "High", "High", "Low"], ["ATP rate", "Low", "High", "Very low"]] },
    options: ["ADP destroys the inner membrane", "ATP synthesis rises when substrate is available but falls when the proton gradient collapses", "Protons are not involved in ATP synthesis", "The ionophore increases chemiosmosis"], answer: 1,
    hint: "Relate ATP rate to both ADP availability and the gradient.", misconception: "Reading chemiosmosis intervention data", explanation: "ADP permits ATP synthase to use the existing gradient. The ionophore then dissipates that gradient, removing the immediate energy source for ATP synthesis.",
    source: "Cellular Respiration.pdf · PDF p.18 · printed p.56", sourceImage: "/materials/respiration/page-18.jpg", sourcePage: 56,
  },
  {
    id: "bio-resp-chemi-structured", code: "3(l)", eyebrow: "Structured response · membrane mechanism", objective: "3(l) Chemiosmosis", marks: 4, skill: "Exam technique", difficulty: 3, format: "structured",
    prompt: "Explain why the inner mitochondrial membrane is essential for chemiosmosis.",
    markPoints: ["It contains electron carriers/proton pumps", "It separates the matrix from the intermembrane space", "Its low proton permeability allows an electrochemical gradient to be maintained", "It contains ATP synthase, which couples proton return to ATP production"],
    modelAnswer: "The inner membrane contains electron carriers that pump protons and separates the matrix from the intermembrane space. Its proton impermeability maintains the gradient, while ATP synthase provides the controlled return path coupled to ATP formation.",
    hint: "Include proteins, compartments, permeability and ATP synthase.", misconception: "Membrane requirements for chemiosmosis", explanation: "Each mark point identifies a separate role of the inner membrane.",
    source: "Cellular Respiration.pdf · PDF p.18 · printed p.56", sourceImage: "/materials/respiration/page-18.jpg", sourcePage: 56,
  },
];

export const verifiedBiologyQuestions: BiologyQuestion[] = [
  ...cellQuestions,
  ...biomoleculeQuestions,
  ...enzymeQuestions,
  ...transportQuestions,
  ...photosynthesisQuestions,
  ...respirationQuestions,
  ...cellCycleQuestions,
  ...geneExpressionQuestions,
  ...mutationQuestions,
  ...techniqueQuestions,
  ...eukaryoteQuestions,
  ...virusQuestions,
  ...prokaryoteQuestions,
  ...inheritanceQuestions,
  ...communicationQuestions,
  ...evolutionQuestions,
  ...immunityQuestions,
  ...climateQuestions,
];

export const verifiedBiologyAnswerKey = Object.fromEntries(
  verifiedBiologyQuestions.map((question) => [question.id, question]),
);

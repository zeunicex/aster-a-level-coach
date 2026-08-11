import type { BiomoleculeQuestion } from "./biomolecules.ts";

type Pack = "biomolecules" | "enzymes" | "transport";
type Seed = {
  id: string;
  code: string;
  page: number;
  printed?: number;
  format?: BiomoleculeQuestion["format"];
  prompt: string;
  options?: string[];
  answer?: number;
  data?: BiomoleculeQuestion["data"];
  markPoints?: string[];
  difficulty?: 1 | 2 | 3;
};

const packName: Record<Pack, string> = {
  biomolecules: "Biomolecules.pdf",
  enzymes: "Enzymes.pdf",
  transport: "Cellular Transport.pdf",
};

function build(pack: Pack, seeds: Seed[]): BiomoleculeQuestion[] {
  return seeds.map((seed) => {
    const format = seed.format ?? "mcq";
    const markPoints = seed.markPoints;
    const skill = format === "image" ? "Image" : format === "structured" || format === "practical" ? "Exam technique" : format === "mcq" ? "Knowledge" : "Application";
    return {
      id: `bio-${pack}-${seed.id}`,
      code: seed.code,
      eyebrow: `${format === "mcq" ? "Verified source" : `${format[0].toUpperCase()}${format.slice(1)} response`} · mature pack`,
      objective: seed.code,
      marks: markPoints?.length ?? (seed.difficulty === 3 ? 3 : 2),
      skill,
      difficulty: seed.difficulty ?? 2,
      prompt: seed.prompt,
      format,
      options: seed.options,
      answer: seed.answer,
      data: seed.data,
      markPoints,
      modelAnswer: markPoints?.join(" "),
      hint: "Use the biological mechanism and the evidence shown; connect each observation to a precise cause.",
      misconception: `Incomplete reasoning for ${seed.code}`,
      explanation: markPoints ? `Credit one mark for each distinct point: ${markPoints.join("; ")}.` : `The best answer is ${seed.options?.[seed.answer ?? 0]}.`,
      source: `${packName[pack]} · PDF p.${seed.page}${seed.printed ? ` · printed p.${seed.printed}` : ""}`,
      sourceImage: `/materials/${pack}/page-${seed.page}.jpg`,
      sourcePage: seed.printed ?? seed.page,
    };
  });
}

export const biomoleculeMatureQuestions = build("biomolecules", [
  { id:"reducing-sugar",code:"1(g)",page:20,printed:18,prompt:"Why is maltose a reducing sugar?",options:["It has a free anomeric carbon that can reduce Benedict's reagent","It contains peptide bonds","It has no glycosidic bond","It is insoluble in water"],answer:0 },
  { id:"phospholipid-water",code:"1(i)",page:40,printed:38,prompt:"Which phospholipid region interacts most strongly with water?",options:["The charged phosphate-containing head","The hydrocarbon tails","Every C-H bond equally","The ester bonds only"],answer:0 },
  { id:"glucose-image",code:"1(g)",page:18,printed:16,format:"image",prompt:"In the source figure, which feature distinguishes beta-glucose from alpha-glucose?",options:["The C1 hydroxyl is above the ring in beta-glucose","Beta-glucose has six more carbons","Only beta-glucose contains oxygen","Alpha-glucose has no hydroxyl groups"],answer:0 },
  { id:"starch-image",code:"1(i)",page:23,printed:21,format:"image",prompt:"Which labelled structural feature makes amylopectin branched?",options:["Alpha-1,6 glycosidic bonds","Beta-1,4 peptide bonds","Ester bonds","Disulfide bridges"],answer:0 },
  { id:"lipid-image",code:"1(i)",page:38,printed:36,format:"image",prompt:"Which molecule in the figure is expected to pack less tightly?",options:["The unsaturated fatty acid with a cis double-bond kink","The saturated fatty acid","Glycerol alone","Both always pack identically"],answer:0 },
  { id:"disaccharide-order",code:"1(h)",page:20,printed:18,format:"sequence",prompt:"Which sequence forms and then breaks a disaccharide?",options:["Monosaccharides align → condensation removes water → glycosidic bond forms → hydrolysis adds water to break it","Hydrolysis removes water → peptide bond forms","Oxidation forms cellulose → translation breaks it","Fatty acids join by ionic bonds"],answer:0 },
  { id:"cellulose-order",code:"1(i)",page:26,printed:24,format:"sequence",prompt:"Which order links cellulose chemistry to cell-wall strength?",options:["Beta-glucose → beta-1,4 chains → alternate monomers rotate → parallel chains hydrogen-bond → microfibrils form","Alpha-glucose → peptide bonds → globular protein","Fatty acids → phospholipid → glycogen","Amino acids → ester bonds → cellulose"],answer:0,difficulty:3 },
  { id:"triglyceride-order",code:"1(h)",page:36,printed:34,format:"sequence",prompt:"Which sequence forms a triglyceride?",options:["Glycerol and three fatty acids align → three condensation reactions → three ester bonds form → three water molecules leave","Three glucose molecules hydrolyse glycerol","Amino acids form glycosidic bonds","Phosphate groups remove fatty acids"],answer:0 },
  { id:"branch-data",code:"1(i)",page:23,printed:21,format:"data",prompt:"Which conclusion best explains the faster glucose release from polymer B?",data:{headers:["Polymer","Branch points per 100 residues","Relative release rate"],rows:[["A","1","1.0"],["B","8","3.9"]]},options:["More branches provide more terminal sites for simultaneous enzyme action","Branching removes all glycosidic bonds","B must be cellulose","A contains more enzymes"],answer:0 },
  { id:"fat-data",code:"1(i)",page:38,printed:36,format:"data",prompt:"Which trend is supported by the fatty-acid data?",data:{headers:["Double bonds","Melting point / °C"],rows:[["0","69"],["1","13"],["2","-5"]]},options:["More double bonds reduce close packing and lower melting point","Double bonds always raise melting point","Saturation has no effect","All three are carbohydrates"],answer:0 },
  { id:"osmosis-data",code:"1(i)",page:24,printed:22,format:"data",prompt:"Why does the starch suspension have the smaller osmotic effect?",data:{headers:["Store","Dissolved particles","Water entry"],rows:[["Free glucose","many","high"],["Starch granules","few","low"]]},options:["Polymerising glucose reduces the number of dissolved particles","Starch actively pumps water","Glucose has no hydroxyl groups","Starch is a lipid"],answer:0 },
  { id:"cellulose-structured",code:"1(i)",page:26,printed:24,format:"structured",prompt:"Explain how cellulose structure gives a plant cell wall high tensile strength.",markPoints:["Beta-glucose monomers form long unbranched chains by beta-1,4 glycosidic bonds","Alternate monomers are rotated so straight chains form","Many hydrogen bonds form between parallel chains","The chains assemble into strong microfibrils"] },
  { id:"glycogen-structured",code:"1(i)",page:24,printed:22,format:"structured",prompt:"Explain why glycogen is suitable for energy storage in animal cells.",markPoints:["It is compact so much glucose can be stored","It is insoluble and has little osmotic effect","It is highly branched with many terminal ends","Enzymes can release glucose rapidly from several ends"] },
  { id:"bilayer-structured",code:"1(i)",page:40,printed:38,format:"structured",prompt:"Explain why phospholipids form a stable bilayer in an aqueous environment.",markPoints:["Phospholipids are amphipathic","Hydrophilic heads face the aqueous surroundings","Hydrophobic tails turn away from water","Two layers arrange with tails facing inward"] },
  { id:"bond-structured",code:"1(h)",page:20,printed:18,format:"structured",prompt:"Compare condensation and hydrolysis of a glycosidic bond.",markPoints:["Condensation forms a covalent glycosidic bond between monosaccharides","Condensation releases water","Hydrolysis uses water","Hydrolysis breaks the bond to produce smaller sugars"] },
  { id:"benedict-practical",code:"1(g)",page:20,printed:18,format:"practical",prompt:"Plan a semi-quantitative Benedict's test comparing reducing-sugar concentration in several samples.",markPoints:["Add equal volumes of sample and Benedict's reagent","Heat all tubes for the same time in the same water bath","Use known glucose concentrations as standards","Compare colour or precipitate with the standards using repeats"] },
  { id:"emulsion-practical",code:"1(i)",page:36,printed:34,format:"practical",prompt:"Describe a valid ethanol emulsion test for lipid.",markPoints:["Mix the sample with ethanol","Shake so lipid dissolves in ethanol","Add water","A cloudy white emulsion is a positive result"] },
  { id:"biuret-practical",code:"1(g)",page:65,printed:58,format:"practical",prompt:"How should a student test an unknown solution for protein using Biuret reagent?",markPoints:["Add Biuret reagent to the sample","Keep sample and reagent volumes consistent","A blue-to-violet colour change is positive","Use water and a known protein as negative and positive controls"] },
]);

export const enzymeMatureQuestions = build("enzymes", [
  { id:"initial-rate",code:"1(q)",page:19,printed:97,prompt:"Why is initial rate preferred when comparing enzyme treatments?",options:["Substrate depletion and product accumulation have had minimal effect","The enzyme has already denatured","It guarantees identical Vmax","No control variables are needed"],answer:0 },
  { id:"cold-reversible",code:"1(q)",page:23,printed:101,prompt:"Why can an enzyme regain activity after warming from a low temperature?",options:["Low temperature reduces kinetic energy without normally disrupting primary structure","Cold permanently hydrolyses peptide bonds","Warming creates a new gene","The substrate becomes an enzyme"],answer:0 },
  { id:"substrate-image",code:"1(q)",page:19,printed:97,format:"image",prompt:"At the plateau in the source graph, what limits reaction rate?",options:["The number of available enzyme active sites","Substrate motion has stopped","Activation energy is zero","All enzyme molecules have been consumed"],answer:0 },
  { id:"ph-image",code:"1(q)",page:21,printed:99,format:"image",prompt:"Why does activity fall on either side of the optimum pH?",options:["Changes in R-group ionisation disrupt active-site shape or substrate binding","The enzyme concentration doubles","Substrate becomes ATP","pH removes all collisions"],answer:0 },
  { id:"inhibitor-image",code:"1(s)",page:30,printed:108,format:"image",prompt:"Which curve indicates non-competitive inhibition?",options:["The curve with a lower maximum rate that cannot be restored by more substrate","The curve reaching the original Vmax at high substrate","The uninhibited curve only","Any curve with zero substrate"],answer:0 },
  { id:"cycle-order",code:"1(p)",page:8,printed:86,format:"sequence",prompt:"Which order describes an enzyme catalytic cycle?",options:["Substrate collides in correct orientation → enzyme-substrate complex forms → catalysis occurs → products leave → enzyme is reused","Product binds → enzyme is consumed → substrate forms","Enzyme denatures → ATP forms","Inhibitor becomes substrate"],answer:0 },
  { id:"competitive-order",code:"1(r)",page:28,printed:106,format:"sequence",prompt:"Which sequence explains reversible competitive inhibition?",options:["Substrate-like inhibitor enters active site → enzyme-inhibitor complex forms → fewer enzyme-substrate complexes form → rate falls","Inhibitor binds DNA → enzyme concentration rises","Substrate removes the active site","Inhibitor becomes product"],answer:0 },
  { id:"heat-order",code:"1(q)",page:23,printed:101,format:"sequence",prompt:"Which sequence explains the steep fall above optimum temperature?",options:["Heat disrupts R-group interactions → tertiary structure changes → active site loses complementarity → fewer complexes form","Heat lowers kinetic energy → more collisions","Temperature forms new peptide bonds","Substrate concentration becomes infinite"],answer:0 },
  { id:"substrate-data",code:"1(q)",page:19,printed:97,format:"data",prompt:"What is the best interpretation of the results?",data:{headers:["Substrate / mM","Initial rate"],rows:[["1","2.1"],["5","7.8"],["20","9.9"],["40","10.0"]]},options:["Active sites become saturated as substrate concentration increases","The enzyme is absent","Rate is directly proportional at all concentrations","Substrate inhibits every enzyme"],answer:0 },
  { id:"ph-data",code:"1(q)",page:21,printed:99,format:"data",prompt:"Which pH is the experimental optimum?",data:{headers:["pH","Initial rate"],rows:[["5","3.2"],["7","8.7"],["9","4.0"]]},options:["pH 7","pH 5","pH 9","No optimum can be inferred"],answer:0 },
  { id:"inhibitor-data",code:"1(s)",page:30,printed:108,format:"data",prompt:"Which treatment most likely contains a non-competitive inhibitor?",data:{headers:["Treatment","Rate at 2 mM S","Rate at 50 mM S"],rows:[["Control","4","10"],["A","2","10"],["B","2","6"]]},options:["B, because high substrate does not restore the control maximum","A, because its maximum is restored","Control","Both must be competitive"],answer:0,difficulty:3 },
  { id:"induced-fit-structured",code:"1(p)",page:8,printed:86,format:"structured",prompt:"Explain the induced-fit model of enzyme action.",markPoints:["The active site is flexible rather than completely rigid","Initial substrate binding changes enzyme conformation","The active site becomes more complementary to the transition state or substrate","Catalytic groups are positioned to lower activation energy"] },
  { id:"temperature-structured",code:"1(q)",page:23,printed:101,format:"structured",prompt:"Explain the complete effect of temperature on enzyme activity.",markPoints:["Warming increases enzyme and substrate kinetic energy","Effective-collision frequency and complex formation increase to the optimum","Above optimum, bonds maintaining tertiary structure are disrupted","The active site changes shape so fewer enzyme-substrate complexes form"] },
  { id:"inhibitors-structured",code:"1(s)",page:30,printed:108,format:"structured",prompt:"Distinguish competitive and non-competitive inhibition using binding and rate evidence.",markPoints:["Competitive inhibitor binds the active site and resembles substrate","Its effect is reduced by high substrate and original Vmax can be approached","Non-competitive inhibitor binds elsewhere and alters catalytic function","High substrate cannot restore the original Vmax"] },
  { id:"rate-structured",code:"1(q)",page:19,printed:97,format:"structured",prompt:"Explain why a product-time curve becomes less steep during an enzyme reaction.",markPoints:["The gradient represents reaction rate","Substrate concentration falls as substrate is used","Product may accumulate and increase the reverse reaction or inhibit the enzyme","Fewer effective enzyme-substrate collisions occur per unit time"] },
  { id:"catalase-practical",code:"1(q)",page:19,printed:97,format:"practical",prompt:"Design a reliable catalase investigation measuring the effect of substrate concentration.",markPoints:["Vary hydrogen peroxide concentration while controlling catalase amount, pH and temperature","Measure oxygen volume produced per unit time","Use the initial linear region to calculate rate","Repeat each concentration and compare means"] },
  { id:"amylase-practical",code:"1(q)",page:21,printed:99,format:"practical",prompt:"Design a timed amylase investigation comparing pH values.",markPoints:["Use buffers to set pH while controlling amylase, starch and temperature","Sample the mixture at fixed time intervals","Test samples with iodine for remaining starch","Repeat and compare the time or rate of starch disappearance"] },
  { id:"temperature-practical",code:"1(q)",page:23,printed:101,format:"practical",prompt:"How should a student obtain a valid enzyme temperature-rate curve?",markPoints:["Use thermostatically controlled water baths across a temperature range","Allow enzyme and substrate to equilibrate before mixing","Keep concentrations, volumes and pH constant","Measure initial rates with repeats at each temperature"] },
]);

export const transportMatureQuestions = build("transport", [
  { id:"cholesterol-hot",code:"1(j)",page:5,printed:123,prompt:"How does cholesterol affect a membrane at high temperature?",options:["It restrains phospholipid movement and reduces excessive fluidity","It removes all proteins","It makes the membrane a cell wall","It hydrolyses fatty acids"],answer:0 },
  { id:"protein-type",code:"1(k)",page:2,printed:120,prompt:"Which feature identifies an integral membrane protein?",options:["It is embedded in or spans the phospholipid bilayer","It is always free in cytosol","It contains no amino acids","It is covalently joined to cellulose"],answer:0 },
  { id:"membrane-image",code:"1(j)",page:2,printed:120,format:"image",prompt:"Which labelled component makes the membrane selectively permeable to specific hydrophilic solutes?",options:["A channel or carrier protein","A hydrocarbon tail alone","Cholesterol only","A carbohydrate chain alone"],answer:0 },
  { id:"cholesterol-image",code:"1(j)",page:5,printed:123,format:"image",prompt:"Where is cholesterol positioned in the source membrane diagram?",options:["Between phospholipid tails with its hydroxyl near the heads","Outside the membrane only","Inside channel pores","Covalently bound to DNA"],answer:0 },
  { id:"endocytosis-image",code:"1(l)",page:21,printed:138,format:"image",prompt:"Which diagram shows receptor-mediated endocytosis?",options:["Specific ligands bind receptors that cluster before a coated vesicle forms","Water crosses directly through the bilayer","A pump phosphorylates itself","Solute diffuses through an open channel"],answer:0 },
  { id:"pump-order",code:"1(l)",page:18,printed:135,format:"sequence",prompt:"Which order describes ATP-driven active transport?",options:["Solute binds pump → ATP is hydrolysed and pump is phosphorylated → conformation changes → solute is released against its gradient","Solute dissolves in lipid → no protein is used","Water binds receptor → vesicle forms","ATP lowers water potential"],answer:0 },
  { id:"rme-order",code:"1(l)",page:21,printed:138,format:"sequence",prompt:"Which sequence describes receptor-mediated endocytosis?",options:["Ligand binds receptor → complexes cluster in a coated pit → membrane invaginates → vesicle pinches off","ATP pump opens → ligand diffuses","Water leaves → cell divides","Cholesterol forms a cell wall"],answer:0 },
  { id:"osmosis-order",code:"1(l)",page:15,printed:132,format:"sequence",prompt:"What sequence occurs when an animal cell enters a strongly hypotonic solution?",options:["External water potential is higher → water enters by osmosis → cell swells → membrane may rupture","Water leaves → cell plasmolyses","Solute is pumped out → cell wall forms","Endocytosis stops osmosis"],answer:0 },
  { id:"osmosis-data",code:"1(l)",page:15,printed:132,format:"data",prompt:"Which solution is closest to isotonic for the tissue?",data:{headers:["Solution / mol dm-3","Mass change / %"],rows:[["0.10","+12"],["0.30","+2"],["0.35","0"],["0.50","-9"]]},options:["0.35 mol dm-3","0.10 mol dm-3","0.30 mol dm-3","0.50 mol dm-3"],answer:0 },
  { id:"diffusion-data",code:"1(l)",page:17,printed:134,format:"data",prompt:"Which solute most clearly requires facilitated diffusion?",data:{headers:["Solute","With channels","Channels blocked"],rows:[["A","80","5"],["B","42","40"]]},options:["A, because transport falls sharply when channels are blocked","B, because channels have little effect","Both use simple diffusion only","Neither crosses a membrane"],answer:0 },
  { id:"atp-data",code:"1(l)",page:18,printed:135,format:"data",prompt:"Which conclusion is supported?",data:{headers:["Treatment","ATP level","Uptake against gradient"],rows:[["Control","100","45"],["Respiration inhibitor","12","4"]]},options:["Uptake is ATP-dependent active transport","Uptake is simple diffusion","ATP prevents transport","The membrane is freely permeable"],answer:0 },
  { id:"fluid-structured",code:"1(j)",page:2,printed:120,format:"structured",prompt:"Explain the term fluid mosaic model.",markPoints:["Phospholipids and some proteins move laterally within the bilayer","This movement makes the membrane fluid","Different proteins are embedded or attached in varied positions","Their irregular arrangement creates a mosaic"] },
  { id:"cholesterol-structured",code:"1(j)",page:5,printed:123,format:"structured",prompt:"Explain how cholesterol buffers membrane fluidity across temperatures.",markPoints:["Cholesterol lies between phospholipid tails","At high temperature it restrains phospholipid movement","This reduces excessive fluidity and permeability","At low temperature it prevents close packing and solidification"] },
  { id:"transport-structured",code:"1(l)",page:17,printed:134,format:"structured",prompt:"Compare simple diffusion, facilitated diffusion and active transport.",markPoints:["Simple and facilitated diffusion move substances down a gradient without metabolic energy","Simple diffusion occurs through the bilayer","Facilitated diffusion uses specific channels or carriers","Active transport uses pumps and ATP to move substances against a gradient"] },
  { id:"osmosis-structured",code:"1(l)",page:15,printed:132,format:"structured",prompt:"Define osmosis and explain why an animal cell may burst in a hypotonic solution.",markPoints:["Osmosis is net water movement across a selectively permeable membrane","Water moves from higher to lower water potential","Water enters the animal cell in a hypotonic solution","Without a cell wall, pressure can stretch and rupture the membrane"] },
  { id:"potato-practical",code:"1(l)",page:15,printed:132,format:"practical",prompt:"Plan an investigation to estimate the water potential of potato tissue.",markPoints:["Place equal-sized potato cylinders in a range of known solute concentrations","Control time, temperature and solution volume","Blot and measure initial and final mass, then calculate percentage change","Repeat and find the concentration giving zero mass change"] },
  { id:"permeability-practical",code:"1(l)",page:17,printed:134,format:"practical",prompt:"Design a comparison of membrane permeability to two solutes.",markPoints:["Use equal membrane surface area and thickness for both solutes","Keep concentration gradient, temperature and time constant","Measure solute appearance on the opposite side with an appropriate assay","Use replicates and compare rates rather than final values alone"] },
  { id:"active-practical",code:"1(l)",page:18,printed:135,format:"practical",prompt:"How could a student test whether ion uptake is active transport?",markPoints:["Compare ion uptake in control tissue and tissue treated with a respiration inhibitor","Keep ion concentration, tissue mass, temperature and time constant","Measure internal ion accumulation or removal from the solution","Reduced uptake with inhibited ATP production supports active transport"] },
]);

// Condensed official event rules used to ground every generated study material.
// Year-specific numbers (dimensions, masses, binder allowances) still live in the
// official rule manual — coaches can attach that PDF per event and the AI will read it.
export const RULES_BY_EVENT = {
  "Anatomy and Physiology":
    "Written test on body systems with multiple choice, short answer and case-based questions. Up to 2 students; one binder of notes is typically allowed. Scored on total points across sections, with a designated tie-break section. Check the current manual for the systems in rotation this season.",
  Astronomy:
    "Math-heavy written test on stellar evolution, the HR diagram, galaxies and cosmology, usually with data tables and images. Up to 2 students; one binder and a scientific calculator are typically allowed. Show work for calculation credit.",
  Botany:
    "Written and identification test on plant anatomy, physiology, taxonomy and ecology, often with images or specimens. Up to 2 students; one binder is typically allowed. Expect photosynthesis, transpiration, plant ID and life-cycle questions.",
  Boomilever:
    "Pre-built structure, impounded before the event, loaded to failure on a testing rig. Scored on efficiency (load supported divided by structure mass). Attachment style, material and dimension limits change year to year — verify each one in the current manual. Eye protection is mandatory and the structure may not be touched during loading.",
  "Chemistry Lab":
    "Lab practical plus written calculations in stoichiometry, solutions and equilibrium, acids and bases, and gas laws. Goggles and safety rules are enforced; a binder and calculator are typically allowed. Points come from technique, accuracy and correct units.",
  "Circuit Lab":
    "Lab-style test with a hands-on portion using meters and circuit components plus written questions. Up to 2 students; one binder and a calculator are typically allowed. Points for correct measurements, Ohm's law and series/parallel calculations, and circuit analysis; unsafe wiring or damaged equipment loses points.",
  Codebusters:
    "Timed cryptography test, usually 3 students per team. Teams cipher and decipher a series of codes inside a set window; each solved item earns points and a wrong answer can cost points. Teamwork and speed dominate the score, and partial credit is unusual.",
  "Crime Busters":
    "Hands-on lab practical identifying unknown substances and analyzing evidence, plus short written questions. Up to 2 students; goggles and lab safety are strictly enforced. Points for correct identifications, justified reasoning and clean technique; a safety violation can disqualify the team.",
  "Disease Detectives":
    "Written case-study test with calculations (incidence, prevalence, attack rate, relative risk) and interpretation of tables and graphs. Up to 2 students; one binder and a scientific calculator are typically allowed. Always show work for calculation credit.",
  "Dynamic Planet":
    "Written test built on maps, diagrams and data interpretation. Up to 2 students; one binder is typically allowed. Points for content accuracy and reasoning, with designated tie-break sections.",
  Ecology:
    "Written test on population dynamics, energy flow, biogeochemical cycles, biomes and succession, driven by data sets. Up to 2 students; one binder is typically allowed. Expect graph reading and simple calculations.",
  "Electric Vehicle":
    "Pre-built electric vehicle that travels a set distance and stops as close as possible to a target time. Impounded and run on a schedule; scored on time and distance accuracy. Battery, motor, mass and dimension limits are codified in the manual, and the vehicle may not be adjusted during the run.",
  Entomology:
    "Written and identification test on insect orders and families, sometimes with preserved specimens. Up to 2 students; one binder is typically allowed and the manual may require a personal collection with a set number of specimens. Points per correct identification plus reasoning.",
  "Experimental Design":
    "The team designs and runs an experiment on a prompt given at the event, then writes a formal report. Usually 3 students. Scored on hypothesis, variables and controls, procedure, data presentation, analysis and a claim-evidence-reasoning conclusion, all inside a fixed time limit.",
  Forensics:
    "Lab practical analyzing chemical and physical evidence (polymers, fibers, powders, chromatography, fingerprints) plus a written case write-up. Goggles are required, up to 2 students, and a binder is typically allowed. Points for accurate analysis and a coherent evidence chain.",
  Fossils:
    "Written and identification test on fossil taxa, preservation modes, stratigraphy and geologic time. Up to 2 students; one binder is typically allowed. Identification accuracy plus interpretation of paleoenvironments drives the score.",
  "Geologic Mapping":
    "Map-heavy written test: topographic and geologic maps, strike and dip, structure contours and cross sections. Up to 2 students; a binder and calculator are typically allowed. Show work for any calculation.",
  Helicopter:
    "Pre-built rubber-band-powered helicopter flown for maximum time. The device is impounded; total flight time is the score. Blade count, rotor size, mass and dimension limits change yearly — verify in the manual. Winding and launching safety rules are strictly enforced.",
  Heredity:
    "Written genetics test covering Mendelian ratios, Punnett squares, pedigrees, probability and sex-linked traits. Up to 2 students; one binder and a calculator are typically allowed. Show work for credit.",
  Hovercraft:
    "Pre-built hovercraft tested for straight-line travel and/or time on a track, plus a written component. The device is impounded and mass and dimension limits apply. The manual defines the exact scoring formula each season.",
  Machines:
    "Lab-style test using simple-machine setups to measure mechanical advantage and efficiency, plus calculations. Up to 2 students; a binder and calculator are typically allowed. Points for measurements, correct formulas, units and work-energy reasoning.",
  Meteorology:
    "Written test using station models, weather maps and severe-weather data. Up to 2 students; one binder is typically allowed. Numerical work such as pressure and temperature conversions appears regularly.",
  "Metric Mastery":
    "Fast-paced measurement and estimation stations in SI units. Up to 2 students; measuring tools are provided at the event. Points for accurate values, correct units and reasonable estimates; sloppy unit work costs points.",
  "Microbe Mission":
    "Lab and written test on bacteria, viruses, protists and fungi, microscopy, growth and immunity. Goggles and safety rules are enforced; up to 2 students and a binder is typically allowed.",
  "Mission Possible":
    "Pre-built chain-reaction device completing a defined sequence of energy transfers and a final task. Impounded and run on a schedule. Scored on completed transfers, elapsed time and construction compliance; a safety violation can disqualify the team.",
  Optics:
    "Lab-style test with mirrors, lenses, ray diagrams and calculations. A binder and calculator are typically allowed. Points for correct optical setup, measured values and Snell's law or lens-equation work.",
  "Potions and Poisons":
    "Lab practical on chemical properties, pH and indicators, solubility, precipitates and simple reactions, plus written questions. Goggles and lab safety are strictly enforced, and a binder is typically allowed.",
  "Remote Sensing":
    "Written test interpreting satellite imagery, spectral bands, resolution and land-cover data. Up to 2 students; one binder is typically allowed. Expect index calculations such as NDVI and reasoning about spatial versus spectral resolution.",
  "Robot Tour":
    "Autonomous robot programmed ahead of time to follow a course and stop at a target. Impounded and run on a schedule. All programming happens before the run; no outside control during it. Scored on completion and timing accuracy.",
  "Rocks and Minerals":
    "Identification and written test on minerals and rock types, sometimes with specimens. Up to 2 students; one binder is typically allowed. Points for correct identification plus justification such as hardness, cleavage or streak.",
  Scrambler:
    "Pre-built vehicle that carries a mass down a ramp and stops at a target distance. Impounded; scored on distance accuracy and run time. Mass, dimension and braking-mechanism rules change yearly, and the vehicle may not be adjusted between runs.",
  "Solar System":
    "Written test on planets, moons, orbital mechanics and solar-system formation, with data tables and math. Up to 2 students; a binder and calculator are typically allowed.",
  Tower:
    "Pre-built tower, impounded and loaded to failure. Scored on efficiency (load supported divided by tower mass). Height, footprint and material limits change yearly — verify them in the current manual. Eye protection is required and the tower may not be touched during loading.",
  "Water Quality":
    "Lab practical testing water samples for dissolved oxygen, pH, turbidity, nitrates and phosphates, plus written questions. Goggles are required; up to 2 students and a binder is typically allowed. Points for correct procedure, values and interpretation.",
  "Write It Do It":
    "Two-person communication event: one partner writes a description of a structure, the other rebuilds it from that description alone. Scored on structural accuracy. Verbal communication and extra materials are prohibited.",
  "Food Science":
    "Lab practical plus written questions on food chemistry: nutrients, emulsions, gels, density, viscosity and thermal properties. Up to 2 students; goggles and food-safety rules apply and a binder is typically allowed. Points for procedure, measurements, data analysis and reasoning.",
  Thermodynamics:
    "Lab-style test on heat transfer, specific heat, calorimetry and insulation, mixing hands-on measurement with calculation. Up to 2 students; goggles, a binder and a calculator are typically allowed. Points for correct setup, temperature data, formulas and units.",
  "Elastic Launched Glider":
    "Pre-built glider launched from an elastic device, scored on maximum or target flight time. Impounded; wingspan, mass and launch-energy limits change yearly — verify in the manual. Trim, incidence and dihedral tuning decide the result, and the glider may not be modified between runs.",
  "Roller Coaster":
    "Pre-built track that a ball travels down, scored on target time and successful completion. Impounded; height, footprint and material limits apply. The manual defines the exact scoring formula, and the device may not be touched after the run begins.",
  "Ping-Pong Parachute":
    "Pre-built parachute and launch device that carries a ping-pong ball, scored on target descent or flight time. Impounded; device dimensions, launch method and safety rules are codified in the manual. Reliability across repeated runs matters as much as the best single time.",
  "Designer Genes":
    "Written genetics test on molecular biology: transcription and translation, mutations, gene regulation, biotechnology techniques and pedigree analysis. Up to 2 students; one binder and a calculator are typically allowed. Show work for any probability calculation.",
  "Protein Modeling":
    "Written and modeling test on amino acids, protein structure, folding and molecular visualization. Up to 2 students; a binder is typically allowed and the event often includes a hands-on model-building portion scored on accuracy. Know the featured proteins named in the manual.",
  "Wright Stuff":
    "Pre-built rubber-band-powered aircraft flown for maximum time. Impounded; total flight time is the score. Wing area, mass and rubber limits change yearly — verify in the current manual. Winding and launching safety rules are strictly enforced.",
  "Engineering CAD":
    "Timed computer-aided design event: students build or modify a parametric solid model, assemblies and drawings from a prompt. Up to 2 students, working on provided software. Scored on dimensional accuracy, feature strategy, tolerancing and completed documentation within the time limit.",
};

export function rulesFor(eventName, division) {
  const digest = RULES_BY_EVENT[eventName];
  if (!digest) return "";
  return `${division || "Science Olympiad"} — ${eventName} rules digest\n\n${digest}`;
}
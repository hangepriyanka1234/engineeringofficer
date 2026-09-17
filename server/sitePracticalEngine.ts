import { SitePracticalLesson, SitePracticalCategory } from "../src/types";

export class ServerSitePracticalEngine {
  private static lessons: SitePracticalLesson[] = [
    {
      id: "site-01",
      title: "Workability Testing via Slump Cone Method",
      category: "concrete_testing",
      categoryLabel: "Concrete Field Testing",
      objective: "Determine consistency and workability of freshly mixed concrete on site prior to pouring.",
      isCodeReference: "IS 1199:1959 & IS 456:2000 Cl 7.1",
      equipmentAndMaterials: [
        "Standard Slump Cone (Top dia: 100mm, Bottom dia: 200mm, Height: 300mm)",
        "Tamping Rod (16mm diameter, 600mm long with rounded bullet end)",
        "Non-porous flat metallic base plate",
        "Steel measuring scale (0-300 mm)",
        "Trowel and scoop",
      ],
      fieldProcedure: [
        "1. Clean internal surface of mould and base plate, apply light form oil to prevent sticking.",
        "2. Place mould firmly on level base plate and stand on foot-holds.",
        "3. Fill mould in 4 equal layers (each approx 75mm depth).",
        "4. Tamp each layer 25 times uniformly with rounded end of tamping rod.",
        "5. Strike off excess concrete level with top using trowel.",
        "6. Immediately raise mould vertically upward slowly and carefully (within 5-10 seconds) without any lateral or rotational movement.",
        "7. Measure slump as difference between height of mould (300mm) and highest point of subsided specimen.",
      ],
      observationsAndCalculations: {
        title: "Field Slump Measurement & Pattern Classification",
        steps: [
          "True Slump: Uniform subsidence without crumbling (Acceptable for casting).",
          "Shear Slump: One half of cone slides down on inclined plane (Indicates harsh mix, repeat test).",
          "Collapse Slump: Complete breakdown of cone into flat heap (Indicates high w/c ratio, reject batch).",
        ],
        sampleCalculation: "Slump = 300 mm - 190 mm (Height of specimen) = 110 mm (Medium workability, suitable for pumped column concrete).",
      },
      qualityCheckpoints: [
        {
          id: "qc-slump-01",
          checkItem: "Test execution duration",
          toleranceOrStandard: "Must be completed within 2 minutes of sampling",
          isCodeClause: "IS 1199 Cl 3.1",
          mandatory: true,
        },
        {
          id: "qc-slump-02",
          checkItem: "Permissible slump variation from Transit Mixer",
          toleranceOrStandard: "± 25 mm of specified mix design",
          isCodeClause: "IS 4926 Cl 6.4",
          mandatory: true,
        },
      ],
      commonSiteMistakes: [
        {
          mistakeTitle: "Adding unmeasured water into Transit Mixer",
          consequence: "Drastic drop in 28-day compressive strength and severe honeycombing/bleeding.",
          correctAction: "Use compatible plasticizers/superplasticizers (IS 9103) instead of site water addition.",
        },
        {
          mistakeTitle: "Jerking or tilting the cone while lifting",
          consequence: "False shear failure recorded, unnecessary batch rejection.",
          correctAction: "Lift vertically upwards smoothly using both handles in 5-10 seconds.",
        },
      ],
      vivaVoceQuestions: [
        {
          question: "What is the tamping rod diameter and number of strokes per layer for slump test?",
          answer: "16 mm diameter, 600 mm length with bullet end; 25 strokes per layer across 4 layers.",
          interviewerTip: "Crucial question in PWD/WRD Junior Engineer interviews.",
        },
        {
          question: "Which test is preferred for zero-slump or very dry pavement concrete?",
          answer: "Vee-Bee Consistometer test or Compacting Factor test.",
        },
      ],
      relatedExamMcqs: [
        {
          question: "According to IS 456:2000, what is the recommended slump range for heavily reinforced sections in slabs, beams, and columns?",
          options: ["0 - 25 mm", "25 - 50 mm", "50 - 100 mm", "150 - 200 mm"],
          correctIndex: 2,
          explanation: "IS 456 Table 2 specifies 50-100 mm for heavily reinforced sections in slabs, beams, and columns.",
        },
      ],
      practicalTip: "Always discard the first 0.2 m³ and last 0.2 m³ from a Ready-Mix Transit Mixer when taking fresh sample.",
      safetyPrecautions: [
        "Wear alkaline-resistant safety gloves and eye protection to prevent chemical burns from fresh cement paste.",
        "Keep hands away from moving chute of transit mixer.",
      ],
    },
    {
      id: "site-02",
      title: "Compressive Strength of Concrete Cubes (7 & 28 Days)",
      category: "concrete_testing",
      categoryLabel: "Concrete Field Testing",
      objective: "Cast, cure, and test standard concrete cubes to verify characteristic compressive strength (fck).",
      isCodeReference: "IS 516:1959 & IS 456:2000 Cl 15",
      equipmentAndMaterials: [
        "150 mm × 150 mm × 150 mm Cast Iron / Steel cube moulds",
        "Tamping rod (16mm dia, 600mm long, bullet nose)",
        "Compression Testing Machine (CTM, 2000 kN capacity, calibrated)",
        "Curing tank with temperature control (27 ± 2°C)",
      ],
      fieldProcedure: [
        "1. Assemble clean moulds with oil film on joint faces and base.",
        "2. Fill cube in 3 equal layers (approx 50mm each for 150mm mould).",
        "3. Compact each layer with at least 35 strokes of tamping bar uniformly distributed.",
        "4. Smooth top surface flush with edges using trowel, record date/batch ID.",
        "5. Store in moist air at 27±2°C for 24 ± 0.5 hours.",
        "6. Demould, mark sample ID, and submerge in clean fresh water curing tank until testing.",
        "7. Test at 7 days and 28 days in CTM at a uniform loading rate of 14 N/mm²/min (approx 315 kN/min).",
      ],
      observationsAndCalculations: {
        title: "Compressive Stress Evaluation",
        steps: [
          "Cross-sectional area of 150mm cube A = 150 × 150 = 22,500 mm².",
          "Compressive Strength (N/mm²) = Maximum Load at Failure (N) / 22,500.",
          "7-day strength must achieve at least 65-70% of 28-day target characteristic strength.",
        ],
        sampleCalculation: "Failure Load = 720 kN = 720,000 N -> Compressive Strength = 720,000 / 22,500 = 32.0 N/mm² (Pass for M25/M30 grade).",
      },
      qualityCheckpoints: [
        {
          id: "qc-cube-01",
          checkItem: "Loading rate in Compression Testing Machine",
          toleranceOrStandard: "140 kg/cm²/min = 14.0 N/mm²/min",
          isCodeClause: "IS 516 Cl 5.5",
          mandatory: true,
        },
        {
          id: "qc-cube-02",
          checkItem: "Acceptance Criteria (Individual test result variation)",
          toleranceOrStandard: "Individual cube result must not vary by more than ± 15% from the average of 3 specimens",
          isCodeClause: "IS 456 Cl 15.4",
          mandatory: true,
        },
      ],
      commonSiteMistakes: [
        {
          mistakeTitle: "Testing dry cubes directly from sun storage",
          consequence: "Apparent strength drops significantly; results fail acceptance criteria.",
          correctAction: "Keep cubes submerged in curing tank until immediately before placing in CTM; wipe surface water only.",
        },
        {
          mistakeTitle: "Applying load on trowelled top face rather than smooth cast sides",
          consequence: "Premature failure due to surface irregularities.",
          correctAction: "Always place cube with smooth side faces in contact with bearing platens of CTM.",
        },
      ],
      vivaVoceQuestions: [
        {
          question: "How many cubes constitute one sample as per IS 456?",
          answer: "Three test specimens make one sample. The average of three represents the sample strength.",
          interviewerTip: "Do not confuse 1 cube with 1 sample. 1 sample = 3 cubes.",
        },
        {
          question: "What is the equivalent cylinder to cube strength ratio?",
          answer: "Cylinder strength is approximately 0.8 times (80%) of 150mm cube strength.",
        },
      ],
      relatedExamMcqs: [
        {
          question: "What is the standard loading rate for testing concrete cubes in compression testing machine according to IS 516?",
          options: ["1.4 N/mm²/min", "14 N/mm²/min", "50 N/mm²/min", "140 N/mm²/min"],
          correctIndex: 1,
          explanation: "IS 516 states rate of loading should be 14 N/mm²/min (140 kg/cm²/min).",
        },
      ],
      practicalTip: "Always write pour date, structural member (e.g. Column C4), and grade with oil paint on cubes after demoulding.",
      safetyPrecautions: [
        "Ensure CTM safety cage/wire mesh door is closed before initiating hydraulic load.",
      ],
    },
    {
      id: "site-03",
      title: "Bar Bending Schedule (BBS) & Cutting Length Calculation",
      category: "reinforcement_bbs",
      categoryLabel: "Reinforcement & BBS",
      objective: "Prepare accurate bar bending schedule, calculate cutting lengths, and enforce bend deductions.",
      isCodeReference: "IS 2502:1963 & SP 34 Handbook on Concrete Reinforcement",
      equipmentAndMaterials: [
        "Reinforcement drawings and structural schedule",
        "Bar bending bench and pins (Mandrel diameters: 4d for mild steel, 4d-6d for HYSD)",
        "Manual / Mechanical bar shearing machine",
        "Steel measuring tape and chalk",
      ],
      fieldProcedure: [
        "1. Extract bar mark, diameter, shape code, and spacing from drawing.",
        "2. Calculate clear span, bearing width, and clear concrete covers (Beam: 25mm, Column: 40mm, Slab: 15-20mm, Footing: 50mm).",
        "3. Apply Standard Bend Deductions: 45° bend = 1d, 90° bend = 2d, 135° bend = 3d, 180° hook = 4d (where d = bar diameter).",
        "4. Add standard hooks / anchorage lengths ($L_d = 0.87 f_y \\phi / (4 \\tau_{bd})$).",
        "5. Compute unit weight using standard formula: $W = d^2 / 162.28\\text{ kg/m}$.",
      ],
      observationsAndCalculations: {
        title: "BBS Takeoff Example for Column Stirrup",
        steps: [
          "Column size: 400 mm × 600 mm, Clear Cover: 40 mm, Stirrup Dia: 8 mm.",
          "Internal dimensions: A = 400 - 2(40) = 320 mm, B = 600 - 2(40) = 520 mm.",
          "Perimeter = 2(A + B) = 2(320 + 520) = 1680 mm.",
          "Add 2 hooks at 135° (2 × 10d = 2 × 80 = 160 mm).",
          "Deduct 3 bends at 90° (3 × 2d = 48 mm) and 2 bends at 135° (2 × 3d = 48 mm) = Total deduction 96 mm.",
          "Cutting Length = 1680 + 160 - 96 = 1744 mm = 1.744 m.",
        ],
        sampleCalculation: "Weight for 100 stirrups of 8mm = 100 × 1.744 m × (8² / 162.28) kg/m = 174.4 × 0.395 = 68.89 kg.",
      },
      qualityCheckpoints: [
        {
          id: "qc-bbs-01",
          checkItem: "Minimum Stirrup Hook length for Seismic Detailing",
          toleranceOrStandard: "Minimum 10d or 75 mm with 135° hook angle",
          isCodeClause: "IS 13920:2016 Cl 6.2.2",
          mandatory: true,
        },
        {
          id: "qc-bbs-02",
          checkItem: "Lap length in Tension vs Compression",
          toleranceOrStandard: "Tension: Ld or 30d (whichever is greater), Compression: 24d",
          isCodeClause: "IS 456 Cl 26.2.5.1",
          mandatory: true,
        },
      ],
      commonSiteMistakes: [
        {
          mistakeTitle: "Lapping all bars at the same cross-section in columns",
          consequence: "Weak plane formation; fails earthquake shear code.",
          correctAction: "Stagger laps such that no more than 50% of bars are lapped at any one section (stagger distance ≥ 1.3 Ld).",
        },
        {
          mistakeTitle: "Using 90° hooks instead of 135° hooks on beam/column ties",
          consequence: "Stirrup opens up during cyclic earthquake vibrations leading to explosive core crushing.",
          correctAction: "Strictly enforce 135° bent hooks with 10d tail length.",
        },
      ],
      vivaVoceQuestions: [
        {
          question: "Why is d²/162 used to calculate steel weight per meter?",
          answer: "Unit weight = Volume × Density. Area = (π/4)d², Length = 1m = 1000mm, Steel density = 7850 kg/m³. (π/4) × d² × 1000 × 7850 / 10^9 = d² / 162.28 kg/m.",
          interviewerTip: "Derive this quickly on whiteboard during interview.",
        },
      ],
      relatedExamMcqs: [
        {
          question: "For a 90-degree bend in reinforcement bar of diameter d, what is the length deduction as per standard practice?",
          options: ["1d", "2d", "3d", "4d"],
          correctIndex: 1,
          explanation: "Standard bend deductions: 45° = 1d, 90° = 2d, 135° = 3d, 180° = 4d.",
        },
      ],
      practicalTip: "Always use concrete cover blocks of the same concrete grade (never wooden blocks or stones) tied with 18-gauge binding wire.",
      safetyPrecautions: [
        "Place protective plastic rebar safety caps on all protruding vertical starter bars to prevent fatal impalement injuries.",
      ],
    },
    {
      id: "site-04",
      title: "Setting Out & Total Station Surveying on Site",
      category: "surveying_instruments",
      categoryLabel: "Surveying & Geomatics",
      objective: "Establish baseline control points, benchmark transfer, and column grid centerlines using Total Station.",
      isCodeReference: "IS 14924 & Survey of India Field Handbook",
      equipmentAndMaterials: [
        "Electronic Total Station (1\" or 2\" angular accuracy with dual axis compensator)",
        "Heavy-duty wooden/aluminum tripod",
        "Reflector prism pole with circular bubble",
        "Target plates, tribrach, plumb bob, and optical plummet",
        "Steel markers, spray paint, and masonry nails",
      ],
      fieldProcedure: [
        "1. Set tripod firmly over permanent benchmark (TBM) with tripod legs equidistant.",
        "2. Level instrument using circular bubble on tribrach, followed by electronic tubular plate level.",
        "3. Turn on instrument, initialize horizontal and vertical circles, and check EDM atmospheric PPM correction.",
        "4. Perform Resection or Station Setup (Backsight reference to known coordinate TBM2).",
        "5. Check setup error: Residual $\\Delta E, \\Delta N$ must be $< 2\\text{ mm}$.",
        "6. Stake out building grid intersections (A1, A2, B1...) by entering design coordinates (E, N, Z).",
      ],
      observationsAndCalculations: {
        title: "Grid Check & Coordinate Staking",
        steps: [
          "Coordinate Staking formula: Bearing $\\theta = \\tan^{-1}(\\Delta E / \\Delta N)$, Horizontal Distance $D = \\sqrt{\\Delta E^2 + \\Delta N^2}$.",
          "Verify diagonal lengths of building layout using Pythagoras theorem ($D = \\sqrt{L^2 + W^2}$).",
        ],
        sampleCalculation: "For a 30m × 40m rectangular building grid, diagonal must equal exactly $\\sqrt{30^2 + 40^2} = 50.000\\text{ m}$.",
      },
      qualityCheckpoints: [
        {
          id: "qc-ts-01",
          checkItem: "Grid layout diagonal tolerance",
          toleranceOrStandard: "Maximum allowable error ± 3 mm across 30 m span",
          isCodeClause: "CPWD Specifications 2019 Cl 3.2",
          mandatory: true,
        },
      ],
      commonSiteMistakes: [
        {
          mistakeTitle: "Prism pole held out of plumb by assistant",
          consequence: "Coordinate position error of up to 20-50 mm transferred to column centers.",
          correctAction: "Always monitor the circular bubble on the prism pole and use bipod support.",
        },
      ],
      vivaVoceQuestions: [
        {
          question: "What is Resection in Total Station surveying?",
          answer: "Resection is establishing the unknown coordinates of the instrument station by sighting two or more known control benchmarks without occupying them.",
        },
      ],
      relatedExamMcqs: [
        {
          question: "Which component of an electronic total station measures distance electro-optically?",
          options: ["Optical Plummet", "EDM (Electronic Distance Meter)", "Tribrach", "Collimation lens"],
          correctIndex: 1,
          explanation: "EDM measures distance using modulated infrared or laser carrier waves.",
        },
      ],
      practicalTip: "Mark permanent survey reference pillars (burjis) outside the building excavation zone so they survive earthmoving equipment.",
      safetyPrecautions: [
        "Never point total station optics directly at the sun; it will permanently destroy internal CCD sensors and cause eye blindness.",
      ],
    },
    {
      id: "site-05",
      title: "Bituminous Road Construction & Quality Control (DBM / BC)",
      category: "highways_pavements",
      categoryLabel: "Highway & Pavement Engineering",
      objective: "Execute Prime Coat, Tack Coat, Dense Bituminous Macadam (DBM), and Bituminous Concrete (BC) as per MoRTH specifications.",
      isCodeReference: "MoRTH Section 500 & IRC 37:2018",
      equipmentAndMaterials: [
        "Hydrostatic asphalt paver finisher with electronic sensor screed",
        "Tandem vibratory steel roller (8-10 tonne) & Pneumatic tyre roller (PTR, 15-25 tonne)",
        "Mechanical broom and air compressor for surface cleaning",
        "Calibrated digital probe thermometer (0-300°C)",
        "Core drilling rig (100mm / 150mm dia diamond bit) for compaction density check",
      ],
      fieldProcedure: [
        "1. Clean Granular Sub-base (GSB) or Wet Mix Macadam (WMM) surface thoroughly of dust with air compressor.",
        "2. Apply Prime Coat (SS-1 bitumen emulsion @ 0.7-1.0 kg/m²) and allow 24-hr curing.",
        "3. Apply Tack Coat (RS-1 emulsion @ 0.2-0.3 kg/m²) immediately before paving DBM layer.",
        "4. Monitor Asphalt Delivery Temperature at site: Minimum 140°C - 160°C for VG-30/VG-40 bitumen.",
        "5. Lay mix with sensor paver maintaining design camber (2.5% for bitumen surface in heavy rain).",
        "6. Rolling Sequence: Breakdown rolling (steel tandem roller, 2 passes) -> Intermediate rolling (vibratory + PTR, 4-6 passes) -> Finish rolling (smooth tandem without vibration, 2 passes to eliminate tire marks).",
      ],
      observationsAndCalculations: {
        title: "Field Density & Degree of Compaction",
        steps: [
          "Extract 100mm cores after pavement has cooled to ambient temperature.",
          "Determine Field Core Density ($G_m$) by Archimedes water displacement method.",
          "Determine Theoretical Maximum Specific Gravity ($G_{mm}$) by Rice method (ASTM D2041).",
          "Compaction Degree (%) = $(G_m / G_{mm}) \\times 100$. Must achieve $\\ge 98.0\\%$ of Marshall laboratory density.",
        ],
        sampleCalculation: "Core Bulk Density = 2.38 g/cm³, Marshall Lab Density = 2.42 g/cm³ -> Compaction = (2.38 / 2.42) × 100 = 98.35% (Passed).",
      },
      qualityCheckpoints: [
        {
          id: "qc-morth-01",
          checkItem: "Minimum Rolling Temperature of Bituminous Mix",
          toleranceOrStandard: "Rolling must be completed before temperature drops below 90°C (VG-30) or 100°C (VG-40)",
          isCodeClause: "MoRTH Table 500-17",
          mandatory: true,
        },
        {
          id: "qc-morth-02",
          checkItem: "Surface Evenness / Roughness via Bump Integrator",
          toleranceOrStandard: "Maximum permissible unevenness index ≤ 2000 mm/km for Highway National Corridors",
          isCodeClause: "IRC:SP:16",
          mandatory: true,
        },
      ],
      commonSiteMistakes: [
        {
          mistakeTitle: "Rolling asphalt when temperature has dropped below 80°C",
          consequence: "Aggregate crushing occurs without density increase; leads to severe raveling and pothole formation.",
          correctAction: "Stop rolling immediately if temperature drops below minimum specification; adjust paver speed.",
        },
      ],
      vivaVoceQuestions: [
        {
          question: "What is the difference between Prime Coat and Tack Coat?",
          answer: "Prime coat is applied on an untreated porous granular base (WMM/WBM) to penetrate and plug voids. Tack coat is a light application applied on an existing bituminous or concrete surface to create a strong adhesive bond with the new overlay.",
          interviewerTip: "Favorite interview question in Maha PWD and National Highway Authority of India (NHAI).",
        },
      ],
      relatedExamMcqs: [
        {
          question: "What is the primary function of a Prime Coat in flexible pavement construction?",
          options: [
            "Provide skid resistance",
            "Penetrate into the granular base and seal surface voids",
            "Provide high structural tensile strength",
            "Create immediate riding surface for traffic",
          ],
          correctIndex: 1,
          explanation: "Prime coat penetrates into porous granular base, seals capillary voids, and bonds loose particles.",
        },
      ],
      practicalTip: "Always cut a clean vertical straight joint (transverse joint) at the end of each day's run using a concrete road cutter before resuming next morning.",
      safetyPrecautions: [
        "Deploy high-visibility traffic warning cones, diversion signboards, and flashing retro-reflective safety marshals 200m ahead of paving train.",
      ],
    },
  ];

  static getLessons(category?: SitePracticalCategory): SitePracticalLesson[] {
    if (!category || category === ("all" as any)) {
      return this.lessons;
    }
    return this.lessons.filter((l) => l.category === category);
  }

  static getLesson(id: string): SitePracticalLesson | null {
    return this.lessons.find((l) => l.id === id) || null;
  }
}

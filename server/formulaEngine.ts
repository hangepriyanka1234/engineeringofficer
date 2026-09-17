import {
  CivilFormula,
  FormulaOfTheDay,
  SubjectId,
  FormulaVersionItem,
} from '../src/types';

export class ServerFormulaEngine {
  private static formulas: CivilFormula[] = [
    // 1. RCC & Concrete
    {
      id: 'frm-rcc-001',
      name: 'Minimum Tension Reinforcement in Beams',
      subjectId: 'rcc_concrete',
      subjectName: 'RCC & Prestressed Concrete',
      topicId: 'rcc_beams',
      topicName: 'Limit State of Flexure & Detailing',
      category: 'Design & Detailing Requirements',
      expression: 'Ast,min / (b * d) = 0.85 / fy',
      expressionLatex: '\\frac{A_{st,min}}{b \\cdot d} = \\frac{0.85}{f_y}',
      variables: [
        { symbol: 'Ast,min', name: 'Minimum area of tension reinforcement', unit: 'mm²', dimension: 'L²' },
        { symbol: 'b', name: 'Breadth of beam web / section', unit: 'mm', dimension: 'L' },
        { symbol: 'd', name: 'Effective depth of beam', unit: 'mm', dimension: 'L' },
        { symbol: 'fy', name: 'Characteristic yield strength of steel', unit: 'N/mm² (MPa)', dimension: 'M L⁻¹ T⁻²' },
      ],
      siUnits: 'Ast in mm², b and d in mm, fy in N/mm²',
      assumptions: [
        'Ensures ductile failure mode before sudden plain concrete cracking occurs.',
        'Applies to rectangular sections and webs of flanged beams (T and L beams).',
        'Valid for mild steel (Fe 250) and HYSD bars (Fe 415, Fe 500).',
      ],
      applicability: [
        'Mandatory minimum steel in all flexural members per IS 456:2000 Clause 26.5.1.1.',
        'Not to be confused with maximum tension steel limit (0.04 b D = 4% of gross area).',
      ],
      workedExample: {
        problem: 'Calculate the minimum tension steel required for a beam of size 250 mm × 450 mm (effective depth d = 400 mm) using Fe 415 steel.',
        givenData: { 'b': '250 mm', 'd': '400 mm', 'fy': '415 N/mm²' },
        solutionSteps: [
          'Step 1: Write governing equation: Ast,min = (0.85 * b * d) / fy',
          'Step 2: Substitute values: Ast,min = (0.85 * 250 * 400) / 415',
          'Step 3: Calculate numerator: 0.85 * 100,000 = 85,000',
          'Step 4: Ast,min = 85,000 / 415 = 204.82 mm²',
        ],
        finalAnswer: '204.82 mm² (Provide minimum 2 bars of 12 mm dia = 226 mm²)',
      },
      commonMistakes: [
        'Mistake 1: Using overall depth D (450 mm) instead of effective depth d (400 mm).',
        'Mistake 2: Confusing with slab minimum distribution steel (0.12% for HYSD or 0.15% for Mild steel).',
      ],
      relatedMcqIds: ['q-ce-101'],
      relatedPyqNotes: ['Asked in MPSC MES 2022, SSC JE 2021, and Maha PWD 2023'],
      isCodeClause: 'IS 456:2000 Cl. 26.5.1.1',
      version: '1.2',
      versionHistory: [
        { version: '1.0', updatedAt: '2025-01-10', author: 'Er. SP', changelog: 'Initial entry from IS 456' },
        { version: '1.2', updatedAt: '2025-08-15', author: 'Er. SP', changelog: 'Added worked numerical example & trap notes' },
      ],
      isVerified: true,
      verifiedBy: 'Er. SP (Chief Structural Specialist)',
      tags: ['IS 456', 'Flexure', 'Reinforcement', 'Beams', 'High Yield'],
    },
    {
      id: 'frm-rcc-002',
      name: 'Modulus of Elasticity & Flexural Tensile Strength of Concrete',
      subjectId: 'rcc_concrete',
      subjectName: 'RCC & Prestressed Concrete',
      topicId: 'rcc_properties',
      topicName: 'Concrete Material Properties',
      category: 'Constitutive Relations',
      expression: 'Ec = 5000 * sqrt(fck)  |  fcr = 0.7 * sqrt(fck)',
      expressionLatex: 'E_c = 5000 \\sqrt{f_{ck}}, \\quad f_{cr} = 0.7 \\sqrt{f_{ck}}',
      variables: [
        { symbol: 'Ec', name: 'Short-term static modulus of elasticity of concrete', unit: 'N/mm² (MPa)', dimension: 'M L⁻¹ T⁻²' },
        { symbol: 'fcr', name: 'Flexural tensile strength / Modulus of rupture', unit: 'N/mm² (MPa)', dimension: 'M L⁻¹ T⁻²' },
        { symbol: 'fck', name: 'Characteristic compressive strength of 150mm cube at 28 days', unit: 'N/mm²', dimension: 'M L⁻¹ T⁻²' },
      ],
      siUnits: 'fck in N/mm²; Ec and fcr result in N/mm²',
      assumptions: [
        'Actual Ec may vary by ±20% from formula per IS 456:2000 Cl. 6.2.3.1.',
        'Long-term modulus = Ec / (1 + θ), where θ is creep coefficient.',
      ],
      applicability: ['Normal weight standard concrete grades M15 to M60.'],
      workedExample: {
        problem: 'Find the short-term elastic modulus and modulus of rupture for M25 grade concrete.',
        givenData: { 'fck': '25 N/mm²' },
        solutionSteps: [
          'Step 1: Ec = 5000 * sqrt(25) = 5000 * 5 = 25,000 N/mm²',
          'Step 2: fcr = 0.7 * sqrt(25) = 0.7 * 5 = 3.5 N/mm²',
        ],
        finalAnswer: 'Ec = 25,000 MPa, fcr = 3.5 MPa',
      },
      commonMistakes: [
        'Using legacy IS 456:1978 formula Ec = 5700 * sqrt(fck) instead of current IS 456:2000 Ec = 5000 * sqrt(fck).',
      ],
      relatedMcqIds: ['q-ce-105'],
      relatedPyqNotes: ['Frequently asked direct question in SSC JE, Maha WRD, and RRB JE'],
      isCodeClause: 'IS 456:2000 Cl. 6.2.2 & 6.2.3.1',
      version: '1.0',
      isVerified: true,
      verifiedBy: 'Er. SP',
      tags: ['IS 456', 'Concrete Properties', 'Modulus', 'Tensile Strength'],
    },

    // 2. Strength of Materials (SOM)
    {
      id: 'frm-som-001',
      name: 'Bending Equation / Flexure Formula',
      subjectId: 'som_structures',
      subjectName: 'Strength of Materials & Structural Analysis',
      topicId: 'som_bending',
      topicName: 'Stresses in Beams',
      category: 'Beam Stresses',
      expression: 'M / I = sigma / y = E / R',
      expressionLatex: '\\frac{M}{I} = \\frac{\\sigma}{y} = \\frac{E}{R}',
      variables: [
        { symbol: 'M', name: 'Resisting bending moment', unit: 'N·mm (or kN·m)', dimension: 'M L² T⁻²' },
        { symbol: 'I', name: 'Moment of inertia about neutral axis', unit: 'mm⁴', dimension: 'L⁴' },
        { symbol: 'sigma', name: 'Bending stress at fiber distance y', unit: 'N/mm² (MPa)', dimension: 'M L⁻¹ T⁻²' },
        { symbol: 'y', name: 'Distance from neutral axis to extreme fiber', unit: 'mm', dimension: 'L' },
        { symbol: 'E', name: 'Young\'s Modulus of elasticity', unit: 'N/mm²', dimension: 'M L⁻¹ T⁻²' },
        { symbol: 'R', name: 'Radius of curvature of neutral surface', unit: 'mm', dimension: 'L' },
      ],
      siUnits: 'Moment M in N·mm, I in mm⁴, y in mm, sigma in N/mm², E in N/mm², R in mm',
      assumptions: [
        'Beam is initially straight and has constant cross-section.',
        'Plane sections before bending remain plane after bending (Bernoulli-Euler hypothesis).',
        'Material is homogeneous, isotropic, and obeys Hooke\'s law.',
        'Modulus of elasticity E is identical in tension and compression.',
      ],
      applicability: ['Pure bending of prismatic beams without transverse shear failure.'],
      workedExample: {
        problem: 'A rectangular timber beam of 100 mm × 200 mm is subjected to a bending moment of 6 kN·m. Find the maximum bending stress.',
        givenData: { 'b': '100 mm', 'd': '200 mm', 'M': '6 kN·m = 6 * 10^6 N·mm' },
        solutionSteps: [
          'Step 1: Calculate Section Modulus Z = (b * d^2) / 6 = (100 * 200^2) / 6 = 6.667 * 10^5 mm³',
          'Step 2: Maximum stress sigma_max = M / Z = (6 * 10^6) / (6.667 * 10^5) = 9.0 N/mm²',
        ],
        finalAnswer: '9.0 N/mm² (MPa)',
      },
      commonMistakes: [
        'Forgetting to convert kN·m into N·mm (multiply by 10^6).',
        'Confusing Section Modulus Z = b d² / 6 with Moment of Inertia I = b d³ / 12.',
      ],
      relatedMcqIds: ['q-ce-som-1'],
      relatedPyqNotes: ['Core formula in UPSC ESE, MPSC Civil Paper I, and SSC JE'],
      isCodeClause: 'Euler-Bernoulli Beam Theory',
      version: '1.1',
      isVerified: true,
      verifiedBy: 'Er. SP',
      tags: ['SOM', 'Flexure', 'Section Modulus', 'Bending Stress'],
    },
    {
      id: 'frm-som-002',
      name: 'Elastic Constants Inter-Relations (E, G, K, mu)',
      subjectId: 'som_structures',
      subjectName: 'Strength of Materials & Structural Analysis',
      topicId: 'som_elasticity',
      topicName: 'Stress-Strain & Elastic Constants',
      category: 'Elasticity Theory',
      expression: 'E = 2G(1 + mu) = 3K(1 - 2mu) = (9KG) / (3K + G)',
      expressionLatex: 'E = 2G(1 + \\mu) = 3K(1 - 2\\mu) = \\frac{9KG}{3K + G}',
      variables: [
        { symbol: 'E', name: 'Young\'s Modulus of Elasticity', unit: 'GPa or N/mm²', dimension: 'M L⁻¹ T⁻²' },
        { symbol: 'G', name: 'Modulus of Rigidity / Shear Modulus (also C or N)', unit: 'GPa or N/mm²', dimension: 'M L⁻¹ T⁻²' },
        { symbol: 'K', name: 'Bulk Modulus', unit: 'GPa or N/mm²', dimension: 'M L⁻¹ T⁻²' },
        { symbol: 'mu', name: 'Poisson\'s Ratio (nu)', unit: 'Dimensionless', dimension: '1' },
      ],
      siUnits: 'E, G, K in consistent pressure units (GPa or MPa); Poisson\'s ratio is dimensionless.',
      assumptions: ['Linear elastic, isotropic, and homogeneous material.'],
      applicability: ['For engineering materials with Poisson\'s ratio between 0.0 and 0.5 (Cork ~0.0, Rubber ~0.5, Steel ~0.28-0.30, Concrete ~0.15-0.20).'],
      workedExample: {
        problem: 'If Young\'s Modulus E = 200 GPa and Poisson\'s ratio mu = 0.25, calculate the Shear Modulus G and Bulk Modulus K.',
        givenData: { 'E': '200 GPa', 'mu': '0.25' },
        solutionSteps: [
          'Step 1: G = E / [2 * (1 + mu)] = 200 / [2 * (1 + 0.25)] = 200 / 2.5 = 80 GPa',
          'Step 2: K = E / [3 * (1 - 2 * mu)] = 200 / [3 * (1 - 0.5)] = 200 / 1.5 = 133.33 GPa',
        ],
        finalAnswer: 'G = 80 GPa, K = 133.33 GPa',
      },
      commonMistakes: [
        'Confusing the signs: 2G(1 + mu) has PLUS, 3K(1 - 2mu) has MINUS.',
      ],
      relatedMcqIds: ['q-ce-som-2'],
      relatedPyqNotes: ['Standard 1-mark question in virtually every AE/JE civil exam in India'],
      isCodeClause: 'Theory of Elasticity',
      version: '1.0',
      isVerified: true,
      verifiedBy: 'Er. SP',
      tags: ['Elastic Constants', 'Poisson Ratio', 'Bulk Modulus', 'Rigidity'],
    },

    // 3. Fluid Mechanics & Hydraulics
    {
      id: 'frm-fm-001',
      name: 'Manning\'s Equation for Open Channel Flow',
      subjectId: 'fluid_mechanics',
      subjectName: 'Fluid Mechanics & Open Channel Flow',
      topicId: 'hydraulics_channels',
      topicName: 'Uniform Flow in Open Channels',
      category: 'Open Channel Hydraulics',
      expression: 'v = (1 / n) * R^(2/3) * S^(1/2)  |  Q = A * v',
      expressionLatex: 'v = \\frac{1}{n} R^{2/3} S^{1/2}, \\quad Q = A \\cdot v',
      variables: [
        { symbol: 'v', name: 'Mean flow velocity', unit: 'm/s', dimension: 'L T⁻¹' },
        { symbol: 'n', name: 'Manning\'s roughness coefficient', unit: 's/m^(1/3)', dimension: 'L^(-1/3) T' },
        { symbol: 'R', name: 'Hydraulic radius (A / P)', unit: 'm', dimension: 'L' },
        { symbol: 'S', name: 'Bed slope / Energy slope (tan theta)', unit: 'Dimensionless (m/m)', dimension: '1' },
        { symbol: 'Q', name: 'Discharge volume rate', unit: 'm³/s (cumecs)', dimension: 'L³ T⁻¹' },
        { symbol: 'A', name: 'Cross-sectional area of flow', unit: 'm²', dimension: 'L²' },
      ],
      siUnits: 'All variables strictly in SI units (m, s, m², m³/s).',
      assumptions: [
        'Steady and uniform turbulent open channel flow.',
        'Rigid boundary with fully developed velocity profile.',
      ],
      applicability: ['Prismatic open channels, culverts, stormwater drains, and irrigation canals.'],
      workedExample: {
        problem: 'A rectangular canal 4 m wide carries water at a depth of 2 m on a bed slope of 1 in 1000. Manning\'s n = 0.015. Find discharge Q.',
        givenData: { 'b': '4 m', 'y': '2 m', 'S': '0.001', 'n': '0.015' },
        solutionSteps: [
          'Step 1: Area A = b * y = 4 * 2 = 8 m²',
          'Step 2: Wetted perimeter P = b + 2y = 4 + 2(2) = 8 m',
          'Step 3: Hydraulic radius R = A / P = 8 / 8 = 1.0 m',
          'Step 4: Velocity v = (1 / 0.015) * (1.0)^(2/3) * (0.001)^(1/2) = (66.67) * 1 * (0.03162) = 2.108 m/s',
          'Step 5: Discharge Q = A * v = 8 * 2.108 = 16.86 m³/s',
        ],
        finalAnswer: 'Q = 16.86 cumecs (m³/s)',
      },
      commonMistakes: [
        'Forgetting that wetted perimeter P does NOT include the free water surface.',
        'Confusing SI units with US customary formula (which includes factor 1.486).',
      ],
      relatedMcqIds: ['q-ce-fm-1'],
      relatedPyqNotes: ['Repeated in Maha WRD, SSC JE Paper I/II, and MPSC MES'],
      isCodeClause: 'IS 2951 Open Channel Design',
      version: '1.0',
      isVerified: true,
      verifiedBy: 'Er. SP',
      tags: ['Hydraulics', 'Manning', 'Open Channel', 'Discharge', 'Velocity'],
    },

    // 4. Soil Mechanics & Geotechnical
    {
      id: 'frm-soil-001',
      name: 'Soil Phase Relationship & Unit Weight Formula',
      subjectId: 'soil_geotech',
      subjectName: 'Soil Mechanics & Foundation Engineering',
      topicId: 'soil_properties',
      topicName: 'Phase Relationships & Weight-Volume Indices',
      category: 'Phase Relationships',
      expression: 'gamma = [(Gs + Sr * e) / (1 + e)] * gamma_w  |  w * Gs = Sr * e',
      expressionLatex: '\\gamma = \\frac{G_s + S_r \\cdot e}{1 + e} \\gamma_w, \\quad w \\cdot G_s = S_r \\cdot e',
      variables: [
        { symbol: 'gamma', name: 'Bulk unit weight of soil', unit: 'kN/m³', dimension: 'M L⁻² T⁻²' },
        { symbol: 'Gs', name: 'Specific gravity of soil solids', unit: 'Dimensionless', dimension: '1' },
        { symbol: 'Sr', name: 'Degree of saturation (0 to 1.0)', unit: 'Dimensionless', dimension: '1' },
        { symbol: 'e', name: 'Void ratio (Vv / Vs)', unit: 'Dimensionless', dimension: '1' },
        { symbol: 'w', name: 'Water content / Moisture ratio', unit: 'Dimensionless', dimension: '1' },
        { symbol: 'gamma_w', name: 'Unit weight of water', unit: '9.81 kN/m³ (approx 10 kN/m³)', dimension: 'M L⁻² T⁻²' },
      ],
      siUnits: 'Unit weights in kN/m³, e, w, Sr and Gs are dimensionless.',
      assumptions: ['3-phase soil mass system (solids, water, and air voids).'],
      applicability: [
        'For dry soil (Sr = 0): gamma_d = [Gs / (1 + e)] * gamma_w',
        'For fully saturated soil (Sr = 1): gamma_sat = [(Gs + e) / (1 + e)] * gamma_w',
        'Submerged unit weight: gamma_prime = gamma_sat - gamma_w = [(Gs - 1) / (1 + e)] * gamma_w',
      ],
      workedExample: {
        problem: 'A soil sample has Gs = 2.70, void ratio e = 0.80, and degree of saturation Sr = 0.50. Calculate bulk unit weight (take gamma_w = 9.81 kN/m³).',
        givenData: { 'Gs': '2.70', 'e': '0.80', 'Sr': '0.50', 'gamma_w': '9.81 kN/m³' },
        solutionSteps: [
          'Step 1: Numerator = Gs + Sr * e = 2.70 + (0.50 * 0.80) = 2.70 + 0.40 = 3.10',
          'Step 2: Denominator = 1 + e = 1 + 0.80 = 1.80',
          'Step 3: gamma = (3.10 / 1.80) * 9.81 = 1.722 * 9.81 = 16.89 kN/m³',
        ],
        finalAnswer: 'gamma = 16.89 kN/m³',
      },
      commonMistakes: [
        'Confusing void ratio e (Vv / Vs) with porosity n (Vv / V). Remember: n = e / (1 + e).',
      ],
      relatedMcqIds: ['q-ce-soil-1'],
      relatedPyqNotes: ['Foundational equation for all geotechnical calculations across competitive exams'],
      isCodeClause: 'IS 2720 Soil Testing Standards',
      version: '1.0',
      isVerified: true,
      verifiedBy: 'Er. SP',
      tags: ['Soil Mechanics', 'Phase Relations', 'Void Ratio', 'Unit Weight', 'Saturation'],
    },

    // 5. Transportation & Highway Engineering
    {
      id: 'frm-hw-001',
      name: 'Stopping Sight Distance (SSD) Formula',
      subjectId: 'highway_transp',
      subjectName: 'Transportation & Highway Engineering',
      topicId: 'highway_geometric',
      topicName: 'Geometric Design of Highways',
      category: 'Sight Distances',
      expression: 'SSD = 0.278 * v * t + [v^2 / (254 * (f +- 0.01 * n))]',
      expressionLatex: 'SSD = 0.278 v t + \\frac{v^2}{254 (f \\pm 0.01 n)}',
      variables: [
        { symbol: 'SSD', name: 'Stopping Sight Distance', unit: 'm', dimension: 'L' },
        { symbol: 'v', name: 'Design speed of vehicle', unit: 'km/h', dimension: 'L T⁻¹' },
        { symbol: 't', name: 'Driver reaction time (IRC standard = 2.5 s)', unit: 's', dimension: 'T' },
        { symbol: 'f', name: 'Coefficient of longitudinal friction (0.35 to 0.40 per IRC 73)', unit: 'Dimensionless', dimension: '1' },
        { symbol: 'n', name: 'Gradient of roadway in percentage (% (+ for ascending, - for descending))', unit: '%', dimension: '1' },
      ],
      siUnits: 'v in km/h, t in seconds, SSD in meters.',
      assumptions: [
        'PIEV theory (Perception, Intellection, Emotion, Volition) reaction time of 2.5 seconds.',
        'Height of driver eye = 1.2 m, height of obstacle = 0.15 m above road surface.',
      ],
      applicability: ['Single and divided multilane rural and urban highways per IRC 73 / IRC 86.'],
      workedExample: {
        problem: 'Calculate the Stopping Sight Distance for a design speed of 60 km/h on a level road with f = 0.36 and reaction time 2.5 s.',
        givenData: { 'v': '60 km/h', 't': '2.5 s', 'f': '0.36', 'n': '0 (level)' },
        solutionSteps: [
          'Step 1: Lag distance = 0.278 * v * t = 0.278 * 60 * 2.5 = 41.70 m',
          'Step 2: Braking distance = v^2 / (254 * f) = 60^2 / (254 * 0.36) = 3600 / 91.44 = 39.37 m',
          'Step 3: SSD = 41.70 + 39.37 = 81.07 m',
        ],
        finalAnswer: 'SSD = 81.1 meters (Adopt 85 m safe sight distance)',
      },
      commonMistakes: [
        'Using 2gf (2 * 9.81 * f) in denominator while keeping speed v in km/h without converting to m/s.',
        'For descending gradient (-n%), braking distance INCREASES, so denominator is 254(f - 0.01n).',
      ],
      relatedMcqIds: ['q-ce-103'],
      relatedPyqNotes: ['Standard calculation in MPSC MES 2023, SSC JE, and Maha PWD'],
      isCodeClause: 'IRC 73:1980 & IRC:SP:84',
      version: '1.0',
      isVerified: true,
      verifiedBy: 'Er. SP',
      tags: ['IRC 73', 'Highway', 'SSD', 'Geometric Design', 'Speed'],
    },

    // 6. Surveying & Geomatics
    {
      id: 'frm-surv-001',
      name: 'Earth Curvature & Refraction Correction in Leveling',
      subjectId: 'surveying_geomatics',
      subjectName: 'Surveying & Geomatics',
      topicId: 'surveying_leveling',
      topicName: 'Leveling & Contouring',
      category: 'Leveling Corrections',
      expression: 'Cc = 0.0785 * d^2  |  Cr = 0.0112 * d^2  |  C_comb = 0.0673 * d^2',
      expressionLatex: 'C_c = 0.0785 d^2, \\quad C_r = 0.0112 d^2, \\quad C_{combined} = 0.0673 d^2',
      variables: [
        { symbol: 'Cc', name: 'Curvature correction (always negative to staff reading)', unit: 'm', dimension: 'L' },
        { symbol: 'Cr', name: 'Refraction correction (always positive to staff reading, 1/7 of Cc)', unit: 'm', dimension: 'L' },
        { symbol: 'C_comb', name: 'Combined correction (always subtractive from staff reading)', unit: 'm', dimension: 'L' },
        { symbol: 'd', name: 'Horizontal distance between instrument and staff', unit: 'km', dimension: 'L' },
      ],
      siUnits: 'Distance d MUST be in kilometers (km); resulting corrections Cc, Cr, C_comb are in meters (m).',
      assumptions: [
        'Radius of earth R = 6370 km.',
        'Standard atmospheric condition where refraction coefficient = 1/7.',
      ],
      applicability: ['Sight distances exceeding 100 meters (0.1 km) in precise differential leveling.'],
      workedExample: {
        problem: 'A staff reading of 3.850 m was taken at a distance of 2.0 km. Find the true staff reading after combined correction.',
        givenData: { 'Staff Reading': '3.850 m', 'd': '2.0 km' },
        solutionSteps: [
          'Step 1: Combined correction C_comb = 0.0673 * (d^2) = 0.0673 * (2.0)^2',
          'Step 2: C_comb = 0.0673 * 4 = 0.2692 m',
          'Step 3: True Staff Reading = Observed Reading - C_comb = 3.850 - 0.2692 = 3.5808 m',
        ],
        finalAnswer: '3.581 m',
      },
      commonMistakes: [
        'Entering distance in meters instead of kilometers (e.g. putting 2000 instead of 2).',
        'Adding correction instead of subtracting from staff reading (Staff appears higher due to curvature).',
      ],
      relatedMcqIds: ['q-ce-surv-1'],
      relatedPyqNotes: ['Asked in every Maharashtra WRD, BMC, and SSC JE paper'],
      isCodeClause: 'Surveying Field Manual Principles',
      version: '1.0',
      isVerified: true,
      verifiedBy: 'Er. SP',
      tags: ['Surveying', 'Leveling', 'Curvature', 'Refraction', 'Staff Reading'],
    },
  ];

  // User persistent favorites in-memory
  private static userFavorites: Map<string, Set<string>> = new Map();
  private static userRecentlyViewed: Map<string, string[]> = new Map();

  // ==========================================
  // QUERY & SEARCH
  // ==========================================

  static getAllFormulas(userEmail?: string): CivilFormula[] {
    const favSet = userEmail ? this.userFavorites.get(userEmail) || new Set() : new Set();
    return this.formulas.map((f) => ({
      ...f,
      isFavorite: favSet.has(f.id),
    }));
  }

  static getFormulaById(id: string, userEmail?: string): CivilFormula | undefined {
    const list = this.getAllFormulas(userEmail);
    const item = list.find((f) => f.id === id);
    if (item && userEmail) {
      this.recordRecentlyViewed(userEmail, id);
    }
    return item;
  }

  static searchFormulas(query: string, subjectId?: string, topicId?: string, userEmail?: string): CivilFormula[] {
    let list = this.getAllFormulas(userEmail);
    if (subjectId && subjectId !== 'all') {
      list = list.filter((f) => f.subjectId === subjectId);
    }
    if (topicId && topicId !== 'all') {
      list = list.filter((f) => f.topicId === topicId);
    }

    if (!query.trim()) return list;

    const q = query.toLowerCase();
    return list.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.expression.toLowerCase().includes(q) ||
        f.topicName.toLowerCase().includes(q) ||
        f.subjectName.toLowerCase().includes(q) ||
        (f.isCodeClause || '').toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q)) ||
        f.variables.some((v) => v.name.toLowerCase().includes(q) || v.symbol.toLowerCase().includes(q))
    );
  }

  // ==========================================
  // FORMULA OF THE DAY (DETERMINISTIC VERIFIED ROTATION)
  // ==========================================

  static getFormulaOfTheDay(): FormulaOfTheDay {
    const today = new Date();
    // Deterministic index from year, month, date
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const index = dayOfYear % this.formulas.length;
    const formula = this.formulas[index];

    const tips: Record<string, { tip: string; fact: string }> = {
      'frm-rcc-001': {
        tip: 'In MPSC & SSC JE, questions often ask the percentage for Fe 415. Simply calculate 0.85 / 415 * 100 = 0.205%!',
        fact: 'IS 456 was first formulated in 1953, revised in 1964, 1978, and the current 2000 edition was reaffirmed in 2021.',
      },
      'frm-rcc-002': {
        tip: 'Flexural tensile strength fcr is used to estimate cracking moment Mcr = (fcr * Ig) / yt in beam deflection checks.',
        fact: 'The 1978 code used 5700*sqrt(fck), but tests showed higher aggregate variability, lowering the constant to 5000 in 2000.',
      },
      'frm-som-001': {
        tip: 'Section modulus Z is the ratio I/y. For a rectangular section, Z = b d^2 / 6; for circular section, Z = pi d^3 / 32.',
        fact: 'Euler-Bernoulli beam theory dates back to 1750 and forms the foundation of modern bridge and skyscraper analysis.',
      },
      'frm-som-002': {
        tip: 'Remember the mnemonic: E = 2G(1+mu) has PLUS, 3K(1-2mu) has MINUS. Poisson\'s ratio can never exceed 0.5 for stable materials.',
        fact: 'Rubber has Poisson ratio ~0.5 (incompressible), while cork has Poisson ratio ~0.0 (ideal for wine bottle stoppers).',
      },
      'frm-fm-001': {
        tip: 'For most economical rectangular channel, hydraulic radius R = y / 2 (bottom width b = 2y).',
        fact: 'Robert Manning presented this formula to the Institution of Civil Engineers of Ireland in 1889.',
      },
      'frm-soil-001': {
        tip: 'Remember the golden soil equation: Se = wG (or "Se = wG" / "SewG"). It connects all four phase parameters instantly!',
        fact: 'Karl von Terzaghi, the Father of Soil Mechanics, published "Erdbaumechanik" in 1925 establishing effective stress.',
      },
      'frm-hw-001': {
        tip: 'On ascending gradient (+n%), braking distance is REDUCED; on descending gradient (-n%), braking distance is INCREASED.',
        fact: 'IRC 73 mandates 2.5 seconds reaction time for design, but in alert conditions driver reaction is around 0.7 to 1.0s.',
      },
      'frm-surv-001': {
        tip: 'Refraction always bends line of sight towards earth, counteracting curvature by exactly 1/7th part.',
        fact: 'Combined correction at 1 km is 6.73 cm (0.0673 m), but at 10 km it surges to 6.73 meters due to d^2 relation!',
      },
    };

    const details = tips[formula.id] || {
      tip: 'Practice substituting given values with SI units before matching with MCQ options.',
      fact: 'Verified authentically by SP Civil Engineering Academy.',
    };

    return {
      date: today.toISOString().split('T')[0],
      formula,
      examHighYieldTip: details.tip,
      didYouKnowFact: details.fact,
    };
  }

  // ==========================================
  // FAVORITES & RECENTLY VIEWED
  // ==========================================

  static toggleFavorite(userEmail: string, formulaId: string): boolean {
    let set = this.userFavorites.get(userEmail);
    if (!set) {
      set = new Set();
      this.userFavorites.set(userEmail, set);
    }

    if (set.has(formulaId)) {
      set.delete(formulaId);
      return false;
    } else {
      set.add(formulaId);
      return true;
    }
  }

  static getFavoriteFormulas(userEmail: string): CivilFormula[] {
    const favSet = this.userFavorites.get(userEmail) || new Set();
    return this.formulas
      .filter((f) => favSet.has(f.id))
      .map((f) => ({ ...f, isFavorite: true }));
  }

  private static recordRecentlyViewed(userEmail: string, formulaId: string) {
    let recents = this.userRecentlyViewed.get(userEmail) || [];
    recents = [formulaId, ...recents.filter((id) => id !== formulaId)].slice(0, 10);
    this.userRecentlyViewed.set(userEmail, recents);
  }

  static getRecentlyViewed(userEmail: string): CivilFormula[] {
    const recentIds = this.userRecentlyViewed.get(userEmail) || [];
    const favSet = this.userFavorites.get(userEmail) || new Set();
    return recentIds
      .map((id) => this.formulas.find((f) => f.id === id))
      .filter((f): f is CivilFormula => Boolean(f))
      .map((f) => ({ ...f, isFavorite: favSet.has(f.id) }));
  }

  // ==========================================
  // ADMIN CRUD & VERSIONING
  // ==========================================

  static addFormula(formula: Omit<CivilFormula, 'id' | 'version' | 'versionHistory' | 'isVerified'>, author: string): CivilFormula {
    const newFormula: CivilFormula = {
      ...formula,
      id: `frm-custom-${Date.now()}`,
      version: '1.0',
      versionHistory: [
        {
          version: '1.0',
          updatedAt: new Date().toISOString().split('T')[0],
          author: author || 'Admin',
          changelog: 'Created new civil formula entry',
        },
      ],
      isVerified: true,
      verifiedBy: author || 'Admin',
    };

    this.formulas.push(newFormula);
    return newFormula;
  }

  static updateFormula(
    id: string,
    updates: Partial<CivilFormula>,
    changelog: string,
    author: string
  ): CivilFormula | null {
    const f = this.formulas.find((item) => item.id === id);
    if (!f) return null;

    const prevVersion = parseFloat(String(f.version || '1.0'));
    const newVersion = (prevVersion + 0.1).toFixed(1);

    const versionItem: FormulaVersionItem = {
      version: newVersion,
      updatedAt: new Date().toISOString().split('T')[0],
      author: author || 'Admin',
      changelog: changelog || 'Updated formula definitions and variables',
    };

    const updatedHistory = [...(f.versionHistory || []), versionItem];

    Object.assign(f, updates, {
      version: newVersion,
      versionHistory: updatedHistory,
      verifiedBy: author || f.verifiedBy,
    });

    return f;
  }
}

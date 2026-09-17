import {
  CivilCalculatorDef,
  CalculatorExecutionResult,
  CalculatorNumericalTest,
  CalculatorCategory,
} from '../src/types';

export class ServerCalculatorEngine {
  private static calculators: CivilCalculatorDef[] = [
    // 1. Unit Converter
    {
      id: 'calc-units',
      name: 'Engineering Unit Converter',
      category: 'units',
      categoryName: 'General & Unit Conversions',
      shortDesc: 'Convert engineering dimensions across SI, Metric, and Imperial systems.',
      isCodeStandard: 'IS 962 & SI Metric Standards',
      primaryFormula: 'Value_out = Value_in * Conversion_Factor',
      assumptions: ['Standard temperature and atmospheric pressure where applicable.'],
      inputs: [
        {
          key: 'dimensionType',
          label: 'Physical Dimension',
          unit: '',
          defaultValue: 'stress',
          type: 'select',
          options: [
            { value: 'stress', label: 'Stress & Pressure (MPa, N/mm², kPa, bar, psi)' },
            { value: 'length', label: 'Length (m, mm, cm, km, ft, inch)' },
            { value: 'area', label: 'Area (m², mm², cm², sq ft, acre, hectare)' },
            { value: 'volume', label: 'Volume (m³, litre, cu ft, gallons)' },
            { value: 'force', label: 'Force (kN, N, kgf, tonne-f, lbf)' },
            { value: 'density', label: 'Density (kg/m³, kN/m³, g/cm³, lb/cu ft)' },
            { value: 'discharge', label: 'Discharge / Flow (m³/s, Litres/s, MLD, cusec)' },
            { value: 'moment', label: 'Bending Moment / Torque (kNm, N-mm, tonne-m)' },
          ],
        },
        { key: 'inputValue', label: 'Input Magnitude', unit: '', defaultValue: 25, type: 'number', min: 0 },
        {
          key: 'fromUnit',
          label: 'From Unit',
          unit: '',
          defaultValue: 'MPa',
          type: 'select',
          options: [
            { value: 'MPa', label: 'MegaPascal (MPa)' },
            { value: 'N_mm2', label: 'N/mm²' },
            { value: 'kPa', label: 'kiloPascal (kPa)' },
            { value: 'bar', label: 'Bar' },
            { value: 'psi', label: 'Pounds per sq inch (psi)' },
            { value: 'kg_cm2', label: 'kg/cm²' },
          ],
        },
        {
          key: 'toUnit',
          label: 'To Unit',
          unit: '',
          defaultValue: 'kPa',
          type: 'select',
          options: [
            { value: 'MPa', label: 'MegaPascal (MPa)' },
            { value: 'N_mm2', label: 'N/mm²' },
            { value: 'kPa', label: 'kiloPascal (kPa)' },
            { value: 'bar', label: 'Bar' },
            { value: 'psi', label: 'Pounds per sq inch (psi)' },
            { value: 'kg_cm2', label: 'kg/cm²' },
          ],
        },
      ],
      defaultValues: { dimensionType: 'stress', inputValue: 25, fromUnit: 'MPa', toUnit: 'kPa' },
      testCases: [
        {
          id: 'test-units-1',
          calculatorId: 'calc-units',
          testName: 'Stress Conversion: 25 MPa to kPa',
          inputs: { dimensionType: 'stress', inputValue: 25, fromUnit: 'MPa', toUnit: 'kPa' },
          expectedOutputs: { convertedValue: 25000 },
          tolerance: 0.001,
        },
        {
          id: 'test-units-2',
          calculatorId: 'calc-units',
          testName: 'Force Conversion: 50 kN to N',
          inputs: { dimensionType: 'force', inputValue: 50, fromUnit: 'kN', toUnit: 'N' },
          expectedOutputs: { convertedValue: 50000 },
          tolerance: 0.001,
        },
      ],
    },

    // 2. Stress, Strain & Elastic Modulus
    {
      id: 'calc-stress-strain',
      name: 'Stress, Strain & Elastic Modulus Calculator',
      category: 'stress_strain',
      categoryName: 'Strength of Materials',
      shortDesc: 'Calculate axial stress, longitudinal strain, elongation, Shear Modulus, and Bulk Modulus.',
      isCodeStandard: 'IS 800 & Mechanics of Materials',
      primaryFormula: 'sigma = P / A,  epsilon = delta_L / L,  G = E / [2(1+mu)],  K = E / [3(1-2mu)]',
      assumptions: ['Prismatic bar under uniaxial tension/compression within linear elastic limit.'],
      inputs: [
        { key: 'axialLoad', label: 'Axial Load (P)', unit: 'kN', defaultValue: 100, type: 'number', min: 0.01 },
        { key: 'barDiameter', label: 'Bar Diameter or Width (b)', unit: 'mm', defaultValue: 25, type: 'number', min: 1 },
        {
          key: 'sectionShape',
          label: 'Cross Section Shape',
          unit: '',
          defaultValue: 'circular',
          type: 'select',
          options: [
            { value: 'circular', label: 'Solid Circular Bar (dia d)' },
            { value: 'square', label: 'Solid Square Section (side a)' },
          ],
        },
        { key: 'length', label: 'Original Length (L)', unit: 'mm', defaultValue: 2000, type: 'number', min: 10 },
        { key: 'youngModulus', label: 'Young\'s Modulus (E)', unit: 'GPa', defaultValue: 200, type: 'number', min: 1 },
        { key: 'poissonRatio', label: 'Poisson\'s Ratio (mu)', unit: '', defaultValue: 0.30, type: 'number', min: 0, max: 0.5, step: 0.01 },
      ],
      defaultValues: { axialLoad: 100, barDiameter: 25, sectionShape: 'circular', length: 2000, youngModulus: 200, poissonRatio: 0.30 },
      testCases: [
        {
          id: 'test-ss-1',
          calculatorId: 'calc-stress-strain',
          testName: 'Axial Stress on 25mm dia bar with 100kN load',
          inputs: { axialLoad: 100, barDiameter: 25, sectionShape: 'circular', length: 2000, youngModulus: 200, poissonRatio: 0.30 },
          expectedOutputs: { stressMpa: 203.72, elongationMm: 2.037, shearModulusGpa: 76.92, bulkModulusGpa: 166.67 },
          tolerance: 0.02,
        },
      ],
    },

    // 3. Beam Bending & Deflection
    {
      id: 'calc-beams',
      name: 'Beam Basics (Bending & Deflection) Calculator',
      category: 'beams',
      categoryName: 'Structural Mechanics',
      shortDesc: 'Compute maximum bending moment, maximum deflection, and shear force for standard support cases.',
      isCodeStandard: 'IS 456 / IS 800 Deflection Limits',
      primaryFormula: 'Simply Supported Point Load: M = WL/4, delta = WL^3/(48EI); UDL: M = wL^2/8, delta = 5wL^4/(384EI)',
      assumptions: ['Prismatic beam, small deflection theory, linear elastic material.'],
      inputs: [
        {
          key: 'supportType',
          label: 'Support & Loading Condition',
          unit: '',
          defaultValue: 'ss_udl',
          type: 'select',
          options: [
            { value: 'ss_udl', label: 'Simply Supported with Uniformly Distributed Load (UDL)' },
            { value: 'ss_point', label: 'Simply Supported with Central Point Load' },
            { value: 'cant_point', label: 'Cantilever with Tip Point Load' },
            { value: 'cant_udl', label: 'Cantilever with Full UDL' },
          ],
        },
        { key: 'spanLength', label: 'Span Length (L)', unit: 'm', defaultValue: 5.0, type: 'number', min: 0.5, step: 0.1 },
        { key: 'loadMagnitude', label: 'Load (w in kN/m for UDL, or W in kN for Point)', unit: 'kN or kN/m', defaultValue: 20, type: 'number', min: 0.1 },
        { key: 'beamWidth', label: 'Beam Breadth (b)', unit: 'mm', defaultValue: 300, type: 'number', min: 50 },
        { key: 'beamDepth', label: 'Beam Overall Depth (D)', unit: 'mm', defaultValue: 500, type: 'number', min: 50 },
        { key: 'elasticModulus', label: 'Modulus of Elasticity (E)', unit: 'GPa', defaultValue: 25, type: 'number', min: 5 },
      ],
      defaultValues: { supportType: 'ss_udl', spanLength: 5.0, loadMagnitude: 20, beamWidth: 300, beamDepth: 500, elasticModulus: 25 },
      testCases: [
        {
          id: 'test-beam-1',
          calculatorId: 'calc-beams',
          testName: 'Simply Supported 5m span with 20 kN/m UDL',
          inputs: { supportType: 'ss_udl', spanLength: 5.0, loadMagnitude: 20, beamWidth: 300, beamDepth: 500, elasticModulus: 25 },
          expectedOutputs: { maxMomentKnm: 62.5, maxDeflectionMm: 3.255 },
          tolerance: 0.05,
        },
      ],
    },

    // 4. Concrete Quantity Estimation
    {
      id: 'calc-concrete',
      name: 'Concrete Material Quantity Estimator',
      category: 'concrete',
      categoryName: 'Concrete Technology & Estimation',
      shortDesc: 'Calculate cement bags (50kg), river sand (m³ / CFT), and coarse aggregate for nominal mix grades.',
      isCodeStandard: 'IS 456:2000 & CPWD DSR Specifications',
      primaryFormula: 'Dry Volume = Wet Volume * 1.54,  Proportion = (Part / Sum_Parts) * Dry_Volume',
      assumptions: ['Dry volume factor of 1.54 accounts for voids and shrinkage; cement density = 1440 kg/m³.'],
      inputs: [
        {
          key: 'concreteGrade',
          label: 'Nominal Mix Grade (Cement : Sand : Aggregate)',
          unit: '',
          defaultValue: 'M20',
          type: 'select',
          options: [
            { value: 'M25', label: 'M25 (1 : 1 : 2) - Heavy structural columns & slabs' },
            { value: 'M20', label: 'M20 (1 : 1.5 : 3) - Standard RCC construction' },
            { value: 'M15', label: 'M15 (1 : 2 : 4) - General plain/reinforced concrete' },
            { value: 'M10', label: 'M10 (1 : 3 : 6) - Plain Cement Concrete (PCC) bed' },
            { value: 'M7.5', label: 'M7.5 (1 : 4 : 8) - Foundation leveling course' },
            { value: 'M5', label: 'M5 (1 : 5 : 10) - Lean mass concrete' },
          ],
        },
        { key: 'wetVolume', label: 'Wet Concrete Volume required', unit: 'm³', defaultValue: 10, type: 'number', min: 0.1, step: 0.5 },
        { key: 'waterCementRatio', label: 'Water-Cement Ratio (w/c)', unit: '', defaultValue: 0.50, type: 'number', min: 0.35, max: 0.65, step: 0.01 },
      ],
      defaultValues: { concreteGrade: 'M20', wetVolume: 10, waterCementRatio: 0.50 },
      testCases: [
        {
          id: 'test-conc-1',
          calculatorId: 'calc-concrete',
          testName: '10 m³ of M20 (1:1.5:3) Concrete',
          inputs: { concreteGrade: 'M20', wetVolume: 10, waterCementRatio: 0.50 },
          expectedOutputs: { cementBags: 80.64, sandCft: 148.3, aggregateCft: 296.6 },
          tolerance: 0.05,
        },
      ],
    },

    // 5. Reinforcement Arithmetic
    {
      id: 'calc-rebar',
      name: 'Reinforcement Steel & Weight Calculator',
      category: 'reinforcement',
      categoryName: 'RCC & Bar Bending Schedule',
      shortDesc: 'Calculate unit weight (d²/162.2 kg/m), total tonnage, lap lengths (45d/50d), and stirrup cutting lengths.',
      isCodeStandard: 'IS 2502 & IS 456 Cl. 26.2',
      primaryFormula: 'w = d^2 / 162.2 kg/m,  Stirrup Length = 2(a + b) + 24d - bend_deductions',
      assumptions: ['Standard high-yield deformed bars (Fe 415 / Fe 500 / Fe 550D) with density 7850 kg/m³.'],
      inputs: [
        {
          key: 'barDiameter',
          label: 'Bar Diameter (d)',
          unit: 'mm',
          defaultValue: 16,
          type: 'select',
          options: [
            { value: 8, label: '8 mm (Stirrups / Distribution)' },
            { value: 10, label: '10 mm (Slabs / Links)' },
            { value: 12, label: '12 mm (Main slab / Small beams)' },
            { value: 16, label: '16 mm (Standard Beam / Column main)' },
            { value: 20, label: '20 mm (Heavy beams / Columns)' },
            { value: 25, label: '25 mm (Heavy column longitudinal)' },
            { value: 32, label: '32 mm (Foundation rafts / Piers)' },
          ],
        },
        { key: 'totalLengthMeters', label: 'Total Rebar Length', unit: 'm', defaultValue: 100, type: 'number', min: 1 },
        { key: 'lapLengthMultiple', label: 'Tension Lap Length Multiplier', unit: 'd', defaultValue: 50, type: 'number', min: 24, max: 60 },
      ],
      defaultValues: { barDiameter: 16, totalLengthMeters: 100, lapLengthMultiple: 50 },
      testCases: [
        {
          id: 'test-rebar-1',
          calculatorId: 'calc-rebar',
          testName: '100m of 16mm Rebar Weight',
          inputs: { barDiameter: 16, totalLengthMeters: 100, lapLengthMultiple: 50 },
          expectedOutputs: { unitWeightKgPerM: 1.578, totalWeightKg: 157.83, lapLengthMm: 800 },
          tolerance: 0.02,
        },
      ],
    },

    // 6. Earthwork & Embankment
    {
      id: 'calc-earthwork',
      name: 'Earthwork & Embankment Volume Calculator',
      category: 'earthwork',
      categoryName: 'Surveying & Highway Estimation',
      shortDesc: 'Calculate road banking or cutting volume using Mid-sectional, Mean-sectional, and Prismoidal formulas.',
      isCodeStandard: 'IRC / CPWD Earthwork Standards',
      primaryFormula: 'Section Area A = B*d + s*d^2,  Volume V = A_mid * L',
      assumptions: ['Uniform longitudinal ground slope and uniform side slopes.'],
      inputs: [
        { key: 'formationWidth', label: 'Formation Width of Road (B)', unit: 'm', defaultValue: 10, type: 'number', min: 1 },
        { key: 'sideSlopeRatio', label: 'Side Slope (s:1, e.g. 2 for 2H:1V)', unit: 'H:1V', defaultValue: 2, type: 'number', min: 0.5 },
        { key: 'depthAtStart', label: 'Depth of Banking / Cutting at Start (d1)', unit: 'm', defaultValue: 1.5, type: 'number', min: 0 },
        { key: 'depthAtEnd', label: 'Depth of Banking / Cutting at End (d2)', unit: 'm', defaultValue: 2.5, type: 'number', min: 0 },
        { key: 'sectionLength', label: 'Length of Section (L)', unit: 'm', defaultValue: 100, type: 'number', min: 1 },
      ],
      defaultValues: { formationWidth: 10, sideSlopeRatio: 2, depthAtStart: 1.5, depthAtEnd: 2.5, sectionLength: 100 },
      testCases: [
        {
          id: 'test-ew-1',
          calculatorId: 'calc-earthwork',
          testName: '100m Road Embankment Volume with 10m width',
          inputs: { formationWidth: 10, sideSlopeRatio: 2, depthAtStart: 1.5, depthAtEnd: 2.5, sectionLength: 100 },
          expectedOutputs: { midSectionAreaM2: 28.0, midSectionVolumeM3: 2800.0 },
          tolerance: 0.02,
        },
      ],
    },

    // 7. Surveying Leveling & Corrections
    {
      id: 'calc-surveying',
      name: 'Surveying Leveling & Curvature/Refraction Suite',
      category: 'surveying',
      categoryName: 'Surveying & Geomatics',
      shortDesc: 'Compute curvature correction (0.0785 d²), refraction correction (0.0112 d²), and combined true staff reading.',
      isCodeStandard: 'Survey of India / Civil Leveling',
      primaryFormula: 'Cc = 0.0785 d^2,  Cr = 0.0112 d^2,  C_comb = 0.0673 d^2 (d in km, C in m)',
      assumptions: ['Spherical earth radius R = 6370 km, atmospheric refraction coefficient = 1/7.'],
      inputs: [
        { key: 'distanceKm', label: 'Sight Distance (d)', unit: 'km', defaultValue: 2.5, type: 'number', min: 0.05, step: 0.1 },
        { key: 'observedReading', label: 'Observed Staff Reading', unit: 'm', defaultValue: 3.450, type: 'number', min: 0 },
      ],
      defaultValues: { distanceKm: 2.5, observedReading: 3.450 },
      testCases: [
        {
          id: 'test-surv-1',
          calculatorId: 'calc-surveying',
          testName: 'Staff Reading Correction at 2.5 km',
          inputs: { distanceKm: 2.5, observedReading: 3.450 },
          expectedOutputs: { curvatureCorrectionM: 0.491, combinedCorrectionM: 0.421, trueStaffReadingM: 3.029 },
          tolerance: 0.02,
        },
      ],
    },

    // 8. Hydraulics & Manning Flow
    {
      id: 'calc-hydraulics',
      name: 'Open Channel Flow (Manning\'s Equation) Calculator',
      category: 'hydraulics',
      categoryName: 'Fluid Mechanics & Irrigation',
      shortDesc: 'Calculate uniform flow velocity, discharge (cumecs), hydraulic radius, and flow regime in rectangular channels.',
      isCodeStandard: 'IS 2951 Open Channel Design',
      primaryFormula: 'v = (1/n) * R^(2/3) * S^(1/2),  Q = A * v',
      assumptions: ['Steady, uniform turbulent open channel flow in prismatic channels.'],
      inputs: [
        { key: 'bedWidth', label: 'Channel Bed Width (b)', unit: 'm', defaultValue: 4.0, type: 'number', min: 0.2 },
        { key: 'waterDepth', label: 'Water Depth (y)', unit: 'm', defaultValue: 2.0, type: 'number', min: 0.1 },
        { key: 'bedSlope', label: 'Bed Slope (1 in X, e.g. 1000 for 1 in 1000)', unit: '1 in S', defaultValue: 1000, type: 'number', min: 10 },
        { key: 'manningN', label: 'Manning\'s Roughness (n)', unit: 's/m^(1/3)', defaultValue: 0.015, type: 'number', min: 0.008, max: 0.06, step: 0.001 },
      ],
      defaultValues: { bedWidth: 4.0, waterDepth: 2.0, bedSlope: 1000, manningN: 0.015 },
      testCases: [
        {
          id: 'test-hyd-1',
          calculatorId: 'calc-hydraulics',
          testName: '4m wide canal, 2m depth, S=1:1000, n=0.015',
          inputs: { bedWidth: 4.0, waterDepth: 2.0, bedSlope: 1000, manningN: 0.015 },
          expectedOutputs: { flowAreaM2: 8.0, hydraulicRadiusM: 1.0, velocityMPerS: 2.108, dischargeCumecs: 16.86 },
          tolerance: 0.03,
        },
      ],
    },

    // 9. Soil Mechanics Phase Relations
    {
      id: 'calc-soil',
      name: 'Soil Phase Relations & Unit Weights Calculator',
      category: 'soil',
      categoryName: 'Geotechnical Engineering',
      shortDesc: 'Compute void ratio (e), porosity (n), degree of saturation (Sr), bulk unit weight, dry unit weight, and critical gradient.',
      isCodeStandard: 'IS 2720 Geotechnical Testing Standards',
      primaryFormula: 'w*Gs = Sr*e,  gamma_bulk = [(Gs + Sr*e)/(1+e)] * gamma_w,  gamma_dry = [Gs/(1+e)] * gamma_w',
      assumptions: ['3-phase soil system; unit weight of water gamma_w = 9.81 kN/m³.'],
      inputs: [
        { key: 'specificGravity', label: 'Specific Gravity of Solids (Gs)', unit: '', defaultValue: 2.68, type: 'number', min: 2.0, max: 3.2, step: 0.01 },
        { key: 'voidRatio', label: 'Void Ratio (e)', unit: '', defaultValue: 0.75, type: 'number', min: 0.1, max: 2.5, step: 0.01 },
        { key: 'waterContentPercent', label: 'Water Content (w)', unit: '%', defaultValue: 18.0, type: 'number', min: 0, max: 100, step: 0.5 },
      ],
      defaultValues: { specificGravity: 2.68, voidRatio: 0.75, waterContentPercent: 18.0 },
      testCases: [
        {
          id: 'test-soil-1',
          calculatorId: 'calc-soil',
          testName: 'Gs=2.68, e=0.75, w=18%',
          inputs: { specificGravity: 2.68, voidRatio: 0.75, waterContentPercent: 18.0 },
          expectedOutputs: { porosityPercent: 42.86, saturationPercent: 64.32, dryUnitWeightKnM3: 15.02, bulkUnitWeightKnM3: 17.73 },
          tolerance: 0.03,
        },
      ],
    },

    // 10. Highway Engineering (SSD & Superelevation)
    {
      id: 'calc-highway',
      name: 'Highway Geometric Design (SSD & Superelevation)',
      category: 'highway',
      categoryName: 'Transportation Engineering',
      shortDesc: 'Calculate Stopping Sight Distance (SSD) and Equilibrium Superelevation (e = v²/225R) per IRC 73.',
      isCodeStandard: 'IRC 73:1980 & IRC 86',
      primaryFormula: 'SSD = 0.278*v*t + v^2/[254*(f +- 0.01*n)],  e = v^2 / (225 * R)',
      assumptions: ['IRC standard reaction time t = 2.5s, coefficient of longitudinal friction f = 0.35 - 0.40.'],
      inputs: [
        { key: 'designSpeedKmph', label: 'Design Speed (v)', unit: 'km/h', defaultValue: 80, type: 'number', min: 20, max: 130 },
        { key: 'curveRadiusMeters', label: 'Horizontal Curve Radius (R)', unit: 'm', defaultValue: 350, type: 'number', min: 30 },
        { key: 'frictionCoeff', label: 'Longitudinal Friction Coeff (f)', unit: '', defaultValue: 0.35, type: 'number', min: 0.30, max: 0.45, step: 0.01 },
        { key: 'gradientPercent', label: 'Road Gradient (n, + for up, - for down)', unit: '%', defaultValue: 0, type: 'number', min: -10, max: 10 },
      ],
      defaultValues: { designSpeedKmph: 80, curveRadiusMeters: 350, frictionCoeff: 0.35, gradientPercent: 0 },
      testCases: [
        {
          id: 'test-hw-1',
          calculatorId: 'calc-highway',
          testName: 'SSD at 80 km/h and Superelevation at R=350m',
          inputs: { designSpeedKmph: 80, curveRadiusMeters: 350, frictionCoeff: 0.35, gradientPercent: 0 },
          expectedOutputs: { ssdMeters: 127.65, superelevationPercent: 8.13 },
          tolerance: 0.03,
        },
      ],
    },

    // 11. Brickwork & Plaster Estimation
    {
      id: 'calc-estimation',
      name: 'Brickwork & Plastering Estimation Suite',
      category: 'estimation',
      categoryName: 'Quantity Surveying & Estimation',
      shortDesc: 'Compute number of standard bricks (500/m³), cement bags, and sand volume with dry mortar expansion.',
      isCodeStandard: 'IS 2212 & CPWD DSR',
      primaryFormula: 'Bricks = Masonry_Volume * 500,  Mortar Dry Volume = Mortar Wet * 1.30',
      assumptions: ['Standard modular brick size 190x90x90 mm; with mortar 200x100x100 mm.'],
      inputs: [
        { key: 'masonryVolume', label: 'Masonry Volume', unit: 'm³', defaultValue: 10, type: 'number', min: 0.5 },
        {
          key: 'mortarRatio',
          label: 'Cement : Sand Mortar Mix',
          unit: '',
          defaultValue: '1:6',
          type: 'select',
          options: [
            { value: '1:3', label: '1 : 3 (Rich mortar for water retaining structures)' },
            { value: '1:4', label: '1 : 4 (Load bearing external brickwork)' },
            { value: '1:6', label: '1 : 6 (Standard internal brick masonry)' },
          ],
        },
      ],
      defaultValues: { masonryVolume: 10, mortarRatio: '1:6' },
      testCases: [
        {
          id: 'test-est-1',
          calculatorId: 'calc-estimation',
          testName: '10 m³ of 1:6 Brick Masonry',
          inputs: { masonryVolume: 10, mortarRatio: '1:6' },
          expectedOutputs: { totalBricks: 5000, cementBags: 13.0, sandM3: 2.73 },
          tolerance: 0.05,
        },
      ],
    },
  ];

  // ==========================================
  // RETRIEVAL
  // ==========================================

  static getAllCalculators(): CivilCalculatorDef[] {
    return this.calculators;
  }

  static getCalculatorById(id: string): CivilCalculatorDef | undefined {
    return this.calculators.find((c) => c.id === id);
  }

  // ==========================================
  // CALCULATION EXECUTION LOGIC
  // ==========================================

  static executeCalculator(id: string, rawInputs: Record<string, any>): CalculatorExecutionResult {
    const startTime = Date.now();
    const validationErrors: string[] = [];
    const warnings: string[] = [];

    // Fallback defaults
    const calc = this.getCalculatorById(id);
    if (!calc) {
      return {
        outputs: [],
        formulaUsed: 'Unknown calculator',
        calculationSteps: ['Error: Calculator ID not found'],
        assumptions: [],
        validationErrors: [`Calculator ${id} does not exist.`],
        warnings: [],
        executionTimeMs: 0,
      };
    }

    const inputs = { ...calc.defaultValues, ...rawInputs };

    switch (id) {
      case 'calc-units': {
        const val = Number(inputs.inputValue) || 0;
        const from = String(inputs.fromUnit);
        const to = String(inputs.toUnit);

        // Standard conversions to Base SI (MPa / N/mm²)
        const stressToMpa: Record<string, number> = {
          MPa: 1.0,
          N_mm2: 1.0,
          kPa: 0.001,
          bar: 0.1,
          psi: 0.00689476,
          kg_cm2: 0.0980665,
        };

        const forceToN: Record<string, number> = {
          kN: 1000,
          N: 1,
          kgf: 9.80665,
          tonne_f: 9806.65,
          lbf: 4.44822,
        };

        let result = val;
        let formulaUsed = `${val} ${from} -> ${to}`;
        const steps: string[] = [];

        if (inputs.dimensionType === 'stress' && stressToMpa[from] && stressToMpa[to]) {
          const valMpa = val * stressToMpa[from];
          result = valMpa / stressToMpa[to];
          steps.push(`Step 1: Convert input ${val} ${from} to Base SI (MPa): ${val} * ${stressToMpa[from]} = ${valMpa.toFixed(6)} MPa`);
          steps.push(`Step 2: Convert Base MPa to target unit (${to}): ${valMpa.toFixed(6)} / ${stressToMpa[to]} = ${result.toFixed(4)} ${to}`);
        } else if (inputs.dimensionType === 'force' && forceToN[from] && forceToN[to]) {
          const valN = val * forceToN[from];
          result = valN / forceToN[to];
          steps.push(`Step 1: Convert input ${val} ${from} to Base SI (N): ${val} * ${forceToN[from]} = ${valN.toFixed(4)} N`);
          steps.push(`Step 2: Convert Base N to target unit (${to}): ${valN.toFixed(4)} / ${forceToN[to]} = ${result.toFixed(4)} ${to}`);
        } else {
          // General scale
          result = from === 'MPa' && to === 'kPa' ? val * 1000 : val;
          steps.push(`Direct conversion factor applied: ${result}`);
        }

        return {
          outputs: [
            { key: 'convertedValue', label: 'Converted Magnitude', value: Number(result.toFixed(4)), unit: to, formatted: `${result.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${to}`, highlight: true },
          ],
          formulaUsed,
          calculationSteps: steps,
          assumptions: calc.assumptions,
          validationErrors,
          warnings,
          executionTimeMs: Date.now() - startTime,
        };
      }

      case 'calc-stress-strain': {
        const P_kN = Number(inputs.axialLoad);
        const P_N = P_kN * 1000;
        const d_mm = Number(inputs.barDiameter);
        const L_mm = Number(inputs.length);
        const E_GPa = Number(inputs.youngModulus);
        const E_MPa = E_GPa * 1000;
        const mu = Number(inputs.poissonRatio);

        if (P_kN <= 0) validationErrors.push('Axial load must be positive.');
        if (d_mm <= 0) validationErrors.push('Diameter/width must be greater than zero.');
        if (L_mm <= 0) validationErrors.push('Length must be positive.');
        if (E_GPa <= 0) validationErrors.push('Elastic modulus must be positive.');
        if (mu < 0 || mu > 0.5) validationErrors.push('Poisson\'s ratio must be between 0.0 and 0.5.');

        if (validationErrors.length > 0) {
          return { outputs: [], formulaUsed: calc.primaryFormula, calculationSteps: [], assumptions: calc.assumptions, validationErrors, warnings, executionTimeMs: Date.now() - startTime };
        }

        const area_mm2 = inputs.sectionShape === 'circular' ? (Math.PI * Math.pow(d_mm, 2)) / 4 : Math.pow(d_mm, 2);
        const stress_MPa = P_N / area_mm2;
        const strain = stress_MPa / E_MPa;
        const elongation_mm = (P_N * L_mm) / (area_mm2 * E_MPa);

        const G_GPa = E_GPa / (2 * (1 + mu));
        const K_GPa = E_GPa / (3 * (1 - 2 * mu));

        if (stress_MPa > 415) {
          warnings.push('Stress exceeds 415 MPa. If using mild steel (Fe 250) or Fe 415, yield threshold is breached.');
        }

        const steps = [
          `Step 1: Cross-sectional Area A = ${inputs.sectionShape === 'circular' ? 'π*d²/4' : 'b²'} = ${area_mm2.toFixed(2)} mm²`,
          `Step 2: Axial Stress σ = P / A = ${P_N} N / ${area_mm2.toFixed(2)} mm² = ${stress_MPa.toFixed(2)} N/mm² (MPa)`,
          `Step 3: Longitudinal Strain ε = σ / E = ${stress_MPa.toFixed(2)} / ${E_MPa} = ${strain.toExponential(4)}`,
          `Step 4: Total Elongation ΔL = (P * L) / (A * E) = (${P_N} * ${L_mm}) / (${area_mm2.toFixed(2)} * ${E_MPa}) = ${elongation_mm.toFixed(3)} mm`,
          `Step 5: Shear Modulus G = E / [2(1 + μ)] = ${E_GPa} / [2(1 + ${mu})] = ${G_GPa.toFixed(2)} GPa`,
          `Step 6: Bulk Modulus K = E / [3(1 - 2μ)] = ${E_GPa} / [3(1 - ${2 * mu})] = ${K_GPa.toFixed(2)} GPa`,
        ];

        return {
          outputs: [
            { key: 'stressMpa', label: 'Axial Stress (σ)', value: Number(stress_MPa.toFixed(2)), unit: 'MPa (N/mm²)', formatted: `${stress_MPa.toFixed(2)} MPa`, highlight: true },
            { key: 'elongationMm', label: 'Total Elongation (ΔL)', value: Number(elongation_mm.toFixed(3)), unit: 'mm', formatted: `${elongation_mm.toFixed(3)} mm`, highlight: true },
            { key: 'strain', label: 'Longitudinal Strain (ε)', value: strain, unit: 'dimensionless', formatted: strain.toExponential(4) },
            { key: 'shearModulusGpa', label: 'Shear Modulus (G)', value: Number(G_GPa.toFixed(2)), unit: 'GPa', formatted: `${G_GPa.toFixed(2)} GPa` },
            { key: 'bulkModulusGpa', label: 'Bulk Modulus (K)', value: Number(K_GPa.toFixed(2)), unit: 'GPa', formatted: `${K_GPa.toFixed(2)} GPa` },
          ],
          formulaUsed: 'σ = P / A,  ΔL = PL / AE,  G = E / 2(1+μ),  K = E / 3(1-2μ)',
          calculationSteps: steps,
          assumptions: calc.assumptions,
          validationErrors: [],
          warnings,
          executionTimeMs: Date.now() - startTime,
        };
      }

      case 'calc-beams': {
        const L_m = Number(inputs.spanLength);
        const L_mm = L_m * 1000;
        const load = Number(inputs.loadMagnitude);
        const b = Number(inputs.beamWidth);
        const D = Number(inputs.beamDepth);
        const E_GPa = Number(inputs.elasticModulus);
        const E_N_mm2 = E_GPa * 1000;

        if (L_m <= 0 || b <= 0 || D <= 0 || load <= 0) {
          validationErrors.push('All dimensions and loads must be positive.');
        }

        const I_mm4 = (b * Math.pow(D, 3)) / 12;
        let maxM_kNm = 0;
        let maxDelta_mm = 0;
        const steps: string[] = [
          `Step 1: Moment of Inertia I = (b * D³) / 12 = (${b} * ${D}³) / 12 = ${(I_mm4 / 1e6).toFixed(3)} * 10⁶ mm⁴`,
        ];

        if (inputs.supportType === 'ss_udl') {
          // Simply Supported with UDL: M = w L^2 / 8
          maxM_kNm = (load * Math.pow(L_m, 2)) / 8;
          // delta = 5 w L^4 / 384 E I
          const w_N_mm = load; // 20 kN/m = 20 N/mm
          maxDelta_mm = (5 * w_N_mm * Math.pow(L_mm, 4)) / (384 * E_N_mm2 * I_mm4);
          steps.push(`Step 2: Maximum Bending Moment M_max = (w * L²) / 8 = (${load} * ${L_m}²) / 8 = ${maxM_kNm.toFixed(2)} kN·m`);
          steps.push(`Step 3: Maximum Deflection δ_max = (5 * w * L⁴) / (384 * E * I) = ${maxDelta_mm.toFixed(3)} mm`);
        } else if (inputs.supportType === 'ss_point') {
          // Simply Supported with Point load: M = W L / 4
          maxM_kNm = (load * L_m) / 4;
          const W_N = load * 1000;
          maxDelta_mm = (W_N * Math.pow(L_mm, 3)) / (48 * E_N_mm2 * I_mm4);
          steps.push(`Step 2: Maximum Bending Moment M_max = (W * L) / 4 = (${load} * ${L_m}) / 4 = ${maxM_kNm.toFixed(2)} kN·m`);
          steps.push(`Step 3: Maximum Deflection δ_max = (W * L³) / (48 * E * I) = ${maxDelta_mm.toFixed(3)} mm`);
        } else if (inputs.supportType === 'cant_point') {
          maxM_kNm = load * L_m;
          const W_N = load * 1000;
          maxDelta_mm = (W_N * Math.pow(L_mm, 3)) / (3 * E_N_mm2 * I_mm4);
          steps.push(`Step 2: Cantilever Maximum B.M. at fixed support = W * L = ${load} * ${L_m} = ${maxM_kNm.toFixed(2)} kN·m`);
          steps.push(`Step 3: Tip Deflection δ_max = (W * L³) / (3 * E * I) = ${maxDelta_mm.toFixed(3)} mm`);
        } else {
          maxM_kNm = (load * Math.pow(L_m, 2)) / 2;
          const w_N_mm = load;
          maxDelta_mm = (w_N_mm * Math.pow(L_mm, 4)) / (8 * E_N_mm2 * I_mm4);
          steps.push(`Step 2: Cantilever Maximum B.M. = (w * L²) / 2 = (${load} * ${L_m}²) / 2 = ${maxM_kNm.toFixed(2)} kN·m`);
          steps.push(`Step 3: Tip Deflection δ_max = (w * L⁴) / (8 * E * I) = ${maxDelta_mm.toFixed(3)} mm`);
        }

        const spanDeflectionLimit = L_mm / 250; // IS 456 standard span/250 limit
        if (maxDelta_mm > spanDeflectionLimit) {
          warnings.push(`Calculated deflection (${maxDelta_mm.toFixed(2)} mm) exceeds IS 456 span/250 limit (${spanDeflectionLimit.toFixed(1)} mm). Increase beam depth.`);
        }

        return {
          outputs: [
            { key: 'maxMomentKnm', label: 'Maximum Bending Moment (M_max)', value: Number(maxM_kNm.toFixed(2)), unit: 'kN·m', formatted: `${maxM_kNm.toFixed(2)} kN·m`, highlight: true },
            { key: 'maxDeflectionMm', label: 'Maximum Deflection (δ_max)', value: Number(maxDelta_mm.toFixed(3)), unit: 'mm', formatted: `${maxDelta_mm.toFixed(3)} mm`, highlight: true },
            { key: 'momentOfInertia', label: 'Moment of Inertia (I_xx)', value: Number((I_mm4 / 1e6).toFixed(2)), unit: 'x 10⁶ mm⁴', formatted: `${(I_mm4 / 1e6).toFixed(2)} x 10⁶ mm⁴` },
            { key: 'permissibleDeflection', label: 'IS 456 Permissible Limit (Span/250)', value: Number(spanDeflectionLimit.toFixed(1)), unit: 'mm', formatted: `${spanDeflectionLimit.toFixed(1)} mm` },
          ],
          formulaUsed: 'M_max & δ_max from standard Euler-Bernoulli solutions',
          calculationSteps: steps,
          assumptions: calc.assumptions,
          validationErrors: [],
          warnings,
          executionTimeMs: Date.now() - startTime,
        };
      }

      case 'calc-concrete': {
        const wetVol = Number(inputs.wetVolume) || 10;
        const grade = String(inputs.concreteGrade || 'M20');
        const wc = Number(inputs.waterCementRatio) || 0.50;

        const mixRatios: Record<string, [number, number, number]> = {
          M25: [1, 1, 2],
          M20: [1, 1.5, 3],
          M15: [1, 2, 4],
          M10: [1, 3, 6],
          'M7.5': [1, 4, 8],
          M5: [1, 5, 10],
        };

        const [cPart, sPart, aPart] = mixRatios[grade] || [1, 1.5, 3];
        const sumParts = cPart + sPart + aPart;
        const dryVol = wetVol * 1.54;

        const cementVolM3 = (cPart / sumParts) * dryVol;
        const cementKg = cementVolM3 * 1440;
        const cementBags = cementKg / 50;

        const sandVolM3 = (sPart / sumParts) * dryVol;
        const sandCft = sandVolM3 * 35.3147;

        const aggVolM3 = (aPart / sumParts) * dryVol;
        const aggCft = aggVolM3 * 35.3147;

        const waterLitres = cementKg * wc;

        const steps = [
          `Step 1: Convert Wet Volume (${wetVol} m³) to Dry Volume using factor 1.54: Dry Vol = ${wetVol} * 1.54 = ${dryVol.toFixed(2)} m³`,
          `Step 2: Total proportion sum for ${grade} (${cPart}:${sPart}:${aPart}) = ${cPart} + ${sPart} + ${aPart} = ${sumParts}`,
          `Step 3: Cement volume = (${cPart} / ${sumParts}) * ${dryVol.toFixed(2)} = ${cementVolM3.toFixed(3)} m³`,
          `Step 4: Cement Weight = ${cementVolM3.toFixed(3)} * 1440 kg/m³ = ${cementKg.toFixed(1)} kg (${cementBags.toFixed(2)} bags of 50kg)`,
          `Step 5: Sand volume = (${sPart} / ${sumParts}) * ${dryVol.toFixed(2)} = ${sandVolM3.toFixed(3)} m³ (${sandCft.toFixed(1)} CFT)`,
          `Step 6: Coarse Aggregate volume = (${aPart} / ${sumParts}) * ${dryVol.toFixed(2)} = ${aggVolM3.toFixed(3)} m³ (${aggCft.toFixed(1)} CFT)`,
          `Step 7: Water required = ${cementKg.toFixed(1)} kg * ${wc} (w/c ratio) = ${waterLitres.toFixed(1)} Litres`,
        ];

        return {
          outputs: [
            { key: 'cementBags', label: 'Cement Required (50 kg bags)', value: Number(cementBags.toFixed(2)), unit: 'Bags', formatted: `${cementBags.toFixed(1)} Bags (${cementKg.toFixed(0)} kg)`, highlight: true },
            { key: 'sandCft', label: 'River Sand / Fine Aggregate', value: Number(sandCft.toFixed(1)), unit: 'CFT (m³)', formatted: `${sandCft.toFixed(1)} CFT (${sandVolM3.toFixed(2)} m³)`, highlight: true },
            { key: 'aggregateCft', label: 'Coarse Aggregate (10/20 mm)', value: Number(aggCft.toFixed(1)), unit: 'CFT (m³)', formatted: `${aggCft.toFixed(1)} CFT (${aggVolM3.toFixed(2)} m³)`, highlight: true },
            { key: 'waterLitres', label: 'Estimated Water Requirement', value: Number(waterLitres.toFixed(1)), unit: 'Litres', formatted: `${waterLitres.toFixed(0)} Litres` },
          ],
          formulaUsed: 'Dry Volume = 1.54 * Wet Volume; Proportions by volume with cement density 1440 kg/m³',
          calculationSteps: steps,
          assumptions: calc.assumptions,
          validationErrors: [],
          warnings: [],
          executionTimeMs: Date.now() - startTime,
        };
      }

      case 'calc-rebar': {
        const d = Number(inputs.barDiameter) || 16;
        const totalL = Number(inputs.totalLengthMeters) || 100;
        const lapMultiple = Number(inputs.lapLengthMultiple) || 50;

        const unitW = (Math.pow(d, 2)) / 162.2;
        const totalKg = unitW * totalL;
        const totalTonnes = totalKg / 1000;
        const lapLenMm = lapMultiple * d;

        const steps = [
          `Step 1: Unit Weight formula w = d² / 162.2 = ${d}² / 162.2 = ${unitW.toFixed(3)} kg/m`,
          `Step 2: Total Weight for ${totalL} m = ${unitW.toFixed(3)} kg/m * ${totalL} m = ${totalKg.toFixed(2)} kg (${totalTonnes.toFixed(3)} Metric Tonnes)`,
          `Step 3: Tension Lap Length = ${lapMultiple} * d = ${lapMultiple} * ${d} mm = ${lapLenMm} mm (${(lapLenMm / 1000).toFixed(2)} m)`,
        ];

        return {
          outputs: [
            { key: 'unitWeightKgPerM', label: 'Unit Weight of Bar', value: Number(unitW.toFixed(3)), unit: 'kg/m', formatted: `${unitW.toFixed(3)} kg/m`, highlight: true },
            { key: 'totalWeightKg', label: 'Total Steel Weight', value: Number(totalKg.toFixed(2)), unit: 'kg', formatted: `${totalKg.toFixed(2)} kg (${totalTonnes.toFixed(3)} T)`, highlight: true },
            { key: 'lapLengthMm', label: 'Tension Lap Length (IS 456)', value: lapLenMm, unit: 'mm', formatted: `${lapLenMm} mm` },
          ],
          formulaUsed: 'w = d² / 162.2 kg/m, Lap = 50d (Tension) / 24d (Compression)',
          calculationSteps: steps,
          assumptions: calc.assumptions,
          validationErrors: [],
          warnings: [],
          executionTimeMs: Date.now() - startTime,
        };
      }

      case 'calc-earthwork': {
        const B = Number(inputs.formationWidth) || 10;
        const s = Number(inputs.sideSlopeRatio) || 2;
        const d1 = Number(inputs.depthAtStart) || 1.5;
        const d2 = Number(inputs.depthAtEnd) || 2.5;
        const L = Number(inputs.sectionLength) || 100;

        const d_mid = (d1 + d2) / 2;
        const A_mid = B * d_mid + s * Math.pow(d_mid, 2);
        const V_mid = A_mid * L;

        const A1 = B * d1 + s * Math.pow(d1, 2);
        const A2 = B * d2 + s * Math.pow(d2, 2);
        const V_prismoidal = (L / 6) * (A1 + 4 * A_mid + A2);

        const steps = [
          `Step 1: Mean depth d_mid = (d1 + d2) / 2 = (${d1} + ${d2}) / 2 = ${d_mid.toFixed(2)} m`,
          `Step 2: Mid-sectional Area A_mid = (B * d_mid) + (s * d_mid²) = (${B} * ${d_mid}) + (${s} * ${d_mid}²) = ${A_mid.toFixed(2)} m²`,
          `Step 3: Mid-sectional Volume V = A_mid * L = ${A_mid.toFixed(2)} * ${L} = ${V_mid.toFixed(1)} m³`,
          `Step 4: Prismoidal Formula: V_p = (L/6) * (A1 + 4*A_mid + A2) = (${L}/6) * (${A1.toFixed(2)} + ${(4 * A_mid).toFixed(2)} + ${A2.toFixed(2)}) = ${V_prismoidal.toFixed(1)} m³`,
        ];

        return {
          outputs: [
            { key: 'midSectionAreaM2', label: 'Mid-Section Area', value: Number(A_mid.toFixed(2)), unit: 'm²', formatted: `${A_mid.toFixed(2)} m²` },
            { key: 'midSectionVolumeM3', label: 'Volume (Mid-Section Method)', value: Number(V_mid.toFixed(1)), unit: 'm³', formatted: `${V_mid.toFixed(1)} m³`, highlight: true },
            { key: 'prismoidalVolumeM3', label: 'Volume (Prismoidal Rule)', value: Number(V_prismoidal.toFixed(1)), unit: 'm³', formatted: `${V_prismoidal.toFixed(1)} m³` },
          ],
          formulaUsed: 'A = B*d + s*d²,  V = A_mid * L,  V_prismoidal = (L/6)(A1 + 4Am + A2)',
          calculationSteps: steps,
          assumptions: calc.assumptions,
          validationErrors: [],
          warnings: [],
          executionTimeMs: Date.now() - startTime,
        };
      }

      case 'calc-surveying': {
        const d_km = Number(inputs.distanceKm) || 2.5;
        const obs_m = Number(inputs.observedReading) || 3.450;

        const Cc = 0.0785 * Math.pow(d_km, 2);
        const Cr = 0.0112 * Math.pow(d_km, 2);
        const C_comb = 0.0673 * Math.pow(d_km, 2);
        const trueReading = obs_m - C_comb;

        const steps = [
          `Step 1: Distance d = ${d_km} km`,
          `Step 2: Curvature Correction Cc = 0.0785 * d² = 0.0785 * ${d_km}² = ${Cc.toFixed(4)} m (subtractive)`,
          `Step 3: Refraction Correction Cr = 0.0112 * d² = 0.0112 * ${d_km}² = ${Cr.toFixed(4)} m (additive to true line, 1/7 of Cc)`,
          `Step 4: Combined Correction C_comb = 0.0673 * d² = 0.0673 * ${d_km}² = ${C_comb.toFixed(4)} m (subtractive from staff reading)`,
          `Step 5: True Staff Reading = Observed Reading - C_comb = ${obs_m.toFixed(3)} - ${C_comb.toFixed(4)} = ${trueReading.toFixed(3)} m`,
        ];

        return {
          outputs: [
            { key: 'curvatureCorrectionM', label: 'Curvature Correction (Cc)', value: Number(Cc.toFixed(3)), unit: 'm', formatted: `${Cc.toFixed(3)} m` },
            { key: 'combinedCorrectionM', label: 'Combined Correction (C_comb)', value: Number(C_comb.toFixed(3)), unit: 'm', formatted: `${C_comb.toFixed(3)} m`, highlight: true },
            { key: 'trueStaffReadingM', label: 'True Staff Reading', value: Number(trueReading.toFixed(3)), unit: 'm', formatted: `${trueReading.toFixed(3)} m`, highlight: true },
          ],
          formulaUsed: 'Cc = 0.0785 d²,  Cr = 0.0112 d²,  C_comb = 0.0673 d² (d in km)',
          calculationSteps: steps,
          assumptions: calc.assumptions,
          validationErrors: [],
          warnings: [],
          executionTimeMs: Date.now() - startTime,
        };
      }

      case 'calc-hydraulics': {
        const b = Number(inputs.bedWidth) || 4.0;
        const y = Number(inputs.waterDepth) || 2.0;
        const S_denom = Number(inputs.bedSlope) || 1000;
        const S = 1 / S_denom;
        const n = Number(inputs.manningN) || 0.015;

        const A = b * y;
        const P = b + 2 * y;
        const R = A / P;
        const v = (1 / n) * Math.pow(R, 2 / 3) * Math.pow(S, 1 / 2);
        const Q = A * v;

        const steps = [
          `Step 1: Flow Area A = b * y = ${b} * ${y} = ${A.toFixed(2)} m²`,
          `Step 2: Wetted Perimeter P = b + 2y = ${b} + 2(${y}) = ${P.toFixed(2)} m`,
          `Step 3: Hydraulic Radius R = A / P = ${A.toFixed(2)} / ${P.toFixed(2)} = ${R.toFixed(3)} m`,
          `Step 4: Flow Velocity v = (1/n) * R^(2/3) * S^(1/2) = (1/${n}) * (${R.toFixed(3)})^(2/3) * (1/${S_denom})^(1/2) = ${v.toFixed(3)} m/s`,
          `Step 5: Discharge Q = A * v = ${A.toFixed(2)} * ${v.toFixed(3)} = ${Q.toFixed(2)} m³/s (cumecs)`,
        ];

        return {
          outputs: [
            { key: 'flowAreaM2', label: 'Flow Cross-Section Area (A)', value: Number(A.toFixed(2)), unit: 'm²', formatted: `${A.toFixed(2)} m²` },
            { key: 'hydraulicRadiusM', label: 'Hydraulic Radius (R)', value: Number(R.toFixed(3)), unit: 'm', formatted: `${R.toFixed(3)} m` },
            { key: 'velocityMPerS', label: 'Mean Velocity (v)', value: Number(v.toFixed(3)), unit: 'm/s', formatted: `${v.toFixed(3)} m/s`, highlight: true },
            { key: 'dischargeCumecs', label: 'Discharge (Q)', value: Number(Q.toFixed(2)), unit: 'm³/s (cumecs)', formatted: `${Q.toFixed(2)} cumecs`, highlight: true },
          ],
          formulaUsed: 'v = (1/n) R^(2/3) S^(1/2),  Q = A * v (Manning\'s Equation)',
          calculationSteps: steps,
          assumptions: calc.assumptions,
          validationErrors: [],
          warnings: [],
          executionTimeMs: Date.now() - startTime,
        };
      }

      case 'calc-soil': {
        const Gs = Number(inputs.specificGravity) || 2.68;
        const e = Number(inputs.voidRatio) || 0.75;
        const w_pct = Number(inputs.waterContentPercent) || 18.0;
        const w = w_pct / 100;
        const gamma_w = 9.81;

        const n_porosity = e / (1 + e);
        const Sr = (w * Gs) / e;
        const gamma_d = (Gs / (1 + e)) * gamma_w;
        const gamma_bulk = ((Gs + Sr * e) / (1 + e)) * gamma_w;
        const gamma_sat = ((Gs + e) / (1 + e)) * gamma_w;
        const i_crit = (Gs - 1) / (1 + e);

        const steps = [
          `Step 1: Porosity n = e / (1 + e) = ${e} / (1 + ${e}) = ${(n_porosity * 100).toFixed(2)}%`,
          `Step 2: Degree of Saturation Sr = (w * Gs) / e = (${w.toFixed(3)} * ${Gs}) / ${e} = ${(Sr * 100).toFixed(2)}%`,
          `Step 3: Dry Unit Weight γ_d = [Gs / (1 + e)] * γ_w = [${Gs} / (1 + ${e})] * 9.81 = ${gamma_d.toFixed(2)} kN/m³`,
          `Step 4: Bulk Unit Weight γ = [(Gs + Sr*e) / (1 + e)] * γ_w = ${gamma_bulk.toFixed(2)} kN/m³`,
          `Step 5: Saturated Unit Weight γ_sat = [(Gs + e) / (1 + e)] * γ_w = ${gamma_sat.toFixed(2)} kN/m³`,
          `Step 6: Critical Hydraulic Gradient i_c = (Gs - 1) / (1 + e) = (${Gs} - 1) / (1 + ${e}) = ${i_crit.toFixed(3)}`,
        ];

        return {
          outputs: [
            { key: 'porosityPercent', label: 'Porosity (n)', value: Number((n_porosity * 100).toFixed(2)), unit: '%', formatted: `${(n_porosity * 100).toFixed(2)} %` },
            { key: 'saturationPercent', label: 'Degree of Saturation (Sr)', value: Number((Sr * 100).toFixed(2)), unit: '%', formatted: `${(Sr * 100).toFixed(2)} %`, highlight: true },
            { key: 'dryUnitWeightKnM3', label: 'Dry Unit Weight (γ_d)', value: Number(gamma_d.toFixed(2)), unit: 'kN/m³', formatted: `${gamma_d.toFixed(2)} kN/m³` },
            { key: 'bulkUnitWeightKnM3', label: 'Bulk Unit Weight (γ)', value: Number(gamma_bulk.toFixed(2)), unit: 'kN/m³', formatted: `${gamma_bulk.toFixed(2)} kN/m³`, highlight: true },
            { key: 'criticalGradient', label: 'Critical Hydraulic Gradient (i_c)', value: Number(i_crit.toFixed(3)), unit: 'dimensionless', formatted: `${i_crit.toFixed(3)}` },
          ],
          formulaUsed: 'w*Gs = Sr*e,  γ = [(Gs + Sr*e)/(1+e)]*γ_w,  i_c = (Gs-1)/(1+e)',
          calculationSteps: steps,
          assumptions: calc.assumptions,
          validationErrors: [],
          warnings: [],
          executionTimeMs: Date.now() - startTime,
        };
      }

      case 'calc-highway': {
        const v = Number(inputs.designSpeedKmph) || 80;
        const R = Number(inputs.curveRadiusMeters) || 350;
        const f = Number(inputs.frictionCoeff) || 0.35;
        const n_pct = Number(inputs.gradientPercent) || 0;
        const t = 2.5; // IRC reaction time

        const lagDist = 0.278 * v * t;
        const brakeDist = Math.pow(v, 2) / (254 * (f + 0.01 * n_pct));
        const ssd = lagDist + brakeDist;

        const e_equilibrium = Math.pow(v, 2) / (225 * R);
        const e_pct = e_equilibrium * 100;

        if (e_pct > 7.0) {
          warnings.push(`Equilibrium superelevation (${e_pct.toFixed(2)}%) exceeds IRC 73 maximum permissible 7% for plain/rolling terrain. Provide 7% superelevation and check lateral friction.`);
        }

        const steps = [
          `Step 1: Lag distance = 0.278 * v * t = 0.278 * ${v} * ${t} = ${lagDist.toFixed(2)} m`,
          `Step 2: Braking distance = v² / [254 * (f ± 0.01n)] = ${v}² / [254 * (${f} + ${0.01 * n_pct})] = ${brakeDist.toFixed(2)} m`,
          `Step 3: Stopping Sight Distance SSD = ${lagDist.toFixed(2)} + ${brakeDist.toFixed(2)} = ${ssd.toFixed(2)} m`,
          `Step 4: Equilibrium Superelevation e = v² / (225 * R) = ${v}² / (225 * ${R}) = ${e_equilibrium.toFixed(4)} (${e_pct.toFixed(2)}%)`,
        ];

        return {
          outputs: [
            { key: 'ssdMeters', label: 'Stopping Sight Distance (SSD)', value: Number(ssd.toFixed(2)), unit: 'm', formatted: `${ssd.toFixed(1)} m`, highlight: true },
            { key: 'lagDistanceMeters', label: 'Lag Distance (Reaction)', value: Number(lagDist.toFixed(2)), unit: 'm', formatted: `${lagDist.toFixed(1)} m` },
            { key: 'brakingDistanceMeters', label: 'Braking Distance', value: Number(brakeDist.toFixed(2)), unit: 'm', formatted: `${brakeDist.toFixed(1)} m` },
            { key: 'superelevationPercent', label: 'Superelevation (e)', value: Number(e_pct.toFixed(2)), unit: '%', formatted: `${e_pct.toFixed(2)} %`, highlight: true },
          ],
          formulaUsed: 'SSD = 0.278*v*t + v²/[254*(f±0.01n)],  e = v² / (225*R)',
          calculationSteps: steps,
          assumptions: calc.assumptions,
          validationErrors: [],
          warnings,
          executionTimeMs: Date.now() - startTime,
        };
      }

      case 'calc-estimation': {
        const vol_m3 = Number(inputs.masonryVolume) || 10;
        const ratio = String(inputs.mortarRatio || '1:6');
        const [cPart, sPart] = ratio.split(':').map(Number);
        const sumParts = cPart + sPart;

        const totalBricks = vol_m3 * 500;
        const mortarWetM3 = vol_m3 * 0.30; // 30% mortar in brickwork
        const mortarDryM3 = mortarWetM3 * 1.30; // 30% dry expansion

        const cementVolM3 = (cPart / sumParts) * mortarDryM3;
        const cementKg = cementVolM3 * 1440;
        const cementBags = cementKg / 50;

        const sandVolM3 = (sPart / sumParts) * mortarDryM3;
        const sandCft = sandVolM3 * 35.3147;

        const steps = [
          `Step 1: Total Modular Bricks = ${vol_m3} m³ * 500 bricks/m³ = ${totalBricks} bricks`,
          `Step 2: Wet mortar volume (30% of masonry) = ${vol_m3} * 0.30 = ${mortarWetM3.toFixed(2)} m³`,
          `Step 3: Dry mortar volume with 1.30 expansion = ${mortarWetM3.toFixed(2)} * 1.30 = ${mortarDryM3.toFixed(3)} m³`,
          `Step 4: Cement required = (${cPart} / ${sumParts}) * ${mortarDryM3.toFixed(3)} * 1440 kg/m³ = ${cementKg.toFixed(1)} kg (${cementBags.toFixed(1)} Bags)`,
          `Step 5: Sand required = (${sPart} / ${sumParts}) * ${mortarDryM3.toFixed(3)} = ${sandVolM3.toFixed(2)} m³ (${sandCft.toFixed(1)} CFT)`,
        ];

        return {
          outputs: [
            { key: 'totalBricks', label: 'Standard Modular Bricks (190x90x90 mm)', value: totalBricks, unit: 'Nos', formatted: `${totalBricks.toLocaleString()} Nos`, highlight: true },
            { key: 'cementBags', label: 'Cement Required', value: Number(cementBags.toFixed(1)), unit: 'Bags (50 kg)', formatted: `${cementBags.toFixed(1)} Bags (${cementKg.toFixed(0)} kg)`, highlight: true },
            { key: 'sandM3', label: 'River Sand Volume', value: Number(sandVolM3.toFixed(2)), unit: 'm³ (CFT)', formatted: `${sandVolM3.toFixed(2)} m³ (${sandCft.toFixed(1)} CFT)`, highlight: true },
          ],
          formulaUsed: '500 bricks/m³; Dry Mortar = 1.30 * Wet Mortar; Cement density 1440 kg/m³',
          calculationSteps: steps,
          assumptions: calc.assumptions,
          validationErrors: [],
          warnings: [],
          executionTimeMs: Date.now() - startTime,
        };
      }

      default:
        return {
          outputs: [],
          formulaUsed: calc.primaryFormula,
          calculationSteps: ['Standard mathematical evaluation complete.'],
          assumptions: calc.assumptions,
          validationErrors: [],
          warnings: [],
          executionTimeMs: Date.now() - startTime,
        };
    }
  }

  // ==========================================
  // AUTOMATED NUMERICAL TEST SUITE
  // ==========================================

  static runNumericalTestSuite(): {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    results: CalculatorNumericalTest[];
  } {
    const allTests: CalculatorNumericalTest[] = [];
    let passed = 0;
    let failed = 0;

    for (const calc of this.calculators) {
      for (const t of calc.testCases) {
        const exec = this.executeCalculator(t.calculatorId, t.inputs);
        const actuals: Record<string, any> = {};
        for (const out of exec.outputs) {
          actuals[out.key] = out.value;
        }

        let isMatch = true;
        let discrepancyMsg = '';

        for (const [expKey, expVal] of Object.entries(t.expectedOutputs)) {
          const actVal = Number(actuals[expKey]);
          const expectedNum = Number(expVal);

          if (isNaN(actVal)) {
            isMatch = false;
            discrepancyMsg = `Missing or NaN output for key ${expKey}`;
            break;
          }

          const diffRatio = Math.abs(actVal - expectedNum) / Math.max(1, Math.abs(expectedNum));
          if (diffRatio > t.tolerance) {
            isMatch = false;
            discrepancyMsg = `Discrepancy on ${expKey}: Expected ${expectedNum}, got ${actVal} (diff ratio ${(diffRatio * 100).toFixed(2)}% > tolerance ${(t.tolerance * 100)}%)`;
            break;
          }
        }

        if (isMatch) passed++;
        else failed++;

        allTests.push({
          ...t,
          status: isMatch ? 'passed' : 'failed',
          actualOutputs: actuals,
          discrepancyMessage: discrepancyMsg || undefined,
        });
      }
    }

    return {
      totalTests: allTests.length,
      passedTests: passed,
      failedTests: failed,
      results: allTests,
    };
  }
}

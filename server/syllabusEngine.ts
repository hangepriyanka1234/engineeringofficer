import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  CivilExamHierarchyProfile,
  ExamPaper,
  CanonicalSubject,
  CanonicalUnit,
  CanonicalTopic,
  SyllabusSubtopic,
  SyllabusConcept,
  ExamSyllabusMapping,
  SyllabusAuditLog,
  SyllabusVersionMeta
} from '../src/types';

// Initial Canonical Subjects Data with Units, Topics, Subtopics, and Concepts
export const INITIAL_CANONICAL_SUBJECTS: CanonicalSubject[] = [
  {
    id: 'rcc',
    code: 'CE-RCC',
    name: 'Design of Reinforced Concrete & Prestressed Structures',
    shortName: 'RCC & Prestressed',
    category: 'Structural Engineering',
    standardISCodes: ['IS 456:2000', 'IS 1343:2012', 'IS 875 (Parts 1-5)', 'IS 1893:2016', 'SP 16'],
    order: 1,
    description: 'Working stress and limit state design of beams, slabs, columns, footings, retain walls, and prestressed concrete per IS 456 and IS 1343.',
    units: [
      {
        id: 'rcc-u1',
        subjectId: 'rcc',
        unitNumber: 1,
        title: 'Limit State Method Fundamentals & Singly Reinforced Beams',
        order: 1,
        description: 'Philosophy of limit state design, characteristic loads/strengths, stress-strain curves, and flexural analysis of singly reinforced rectangular sections.',
        topics: [
          {
            id: 'rcc-u1-t1',
            unitId: 'rcc-u1',
            title: 'Assumptions & Stress Block Parameters in Limit State of Collapse (Flexure)',
            order: 1,
            difficulty: 'medium',
            importance: 'Very High',
            pyqFrequency: '1-2 Questions in every PWD/MPSC/SSC shift',
            estimatedHours: 6,
            isCodes: ['IS 456:2000 Cl. 38.1'],
            keyFormulas: [
              'C = 0.36 * fck * b * xu',
              'T = 0.87 * fy * Ast',
              'Lever Arm = d - 0.42 * xu',
              'xu,max / d = 700 / (1100 + 0.87 * fy)'
            ],
            subtopics: [
              {
                id: 'rcc-u1-t1-s1',
                topicId: 'rcc-u1-t1',
                title: 'Concrete Compressive Stress Block Properties',
                order: 1,
                pyqNotes: 'Parabolic up to 0.002 strain and rectangular up to 0.0035 strain.',
                concepts: [
                  {
                    id: 'con-rcc-001',
                    subtopicId: 'rcc-u1-t1-s1',
                    code: 'CON-RCC-001',
                    name: 'Stress Block Compressive Force & Centroid Location',
                    explanation: 'Under flexure, the compressive stress profile of concrete consists of a parabolic portion from neutral axis up to strain 0.002, followed by a rectangular portion up to maximum strain 0.0035. The resultant compressive force is C = 0.36*fck*b*xu, acting at a distance of 0.42*xu from the extreme compression fiber.',
                    keyFormula: 'C = 0.36 * fck * b * xu, y_bar = 0.416 * xu ~ 0.42 * xu',
                    isCodeClause: 'IS 456:2000 Cl. 38.1',
                    importance: 'Very High',
                    commonTrap: 'Do not confuse 0.42*xu from top fiber with distance from neutral axis (which is 0.58*xu).',
                    order: 1,
                    tags: ['Stress Block', 'Compressive Force', 'Centroid'],
                  },
                  {
                    id: 'con-rcc-002',
                    subtopicId: 'rcc-u1-t1-s1',
                    code: 'CON-RCC-002',
                    name: 'Limiting Neutral Axis Depth Ratio (xu,max / d)',
                    explanation: 'The limiting neutral axis depth corresponds to the balanced condition where concrete reaches 0.0035 strain simultaneously with tensile steel reaching yield strain (0.002 + 0.87*fy/Es). Values are 0.53d for Fe 250, 0.48d for Fe 415, 0.46d for Fe 500, and 0.44d for Fe 550.',
                    keyFormula: 'xu,max / d = 700 / (1100 + 0.87 * fy)',
                    isCodeClause: 'IS 456:2000 Cl. 38.1 (Note)',
                    importance: 'Very High',
                    commonTrap: 'Often tested: Fe 500 has xu,max = 0.46d, NOT 0.48d.',
                    order: 2,
                    tags: ['Balanced Section', 'Limiting Neutral Axis', 'Steel Grades'],
                  }
                ]
              },
              {
                id: 'rcc-u1-t1-s2',
                topicId: 'rcc-u1-t1',
                title: 'Section Behavior: Under-Reinforced vs Over-Reinforced',
                order: 2,
                pyqNotes: 'Over-reinforced sections are strictly forbidden by IS 456 in limit state design.',
                concepts: [
                  {
                    id: 'con-rcc-003',
                    subtopicId: 'rcc-u1-t1-s2',
                    code: 'CON-RCC-003',
                    name: 'Ductile vs Brittle Flexural Failure Criteria',
                    explanation: 'When actual xu < xu,max, steel yields first giving ample deflection warning (under-reinforced ductile failure). When xu > xu,max, concrete crushes suddenly without warning (over-reinforced brittle failure). IS 456 restricts moment capacity of over-reinforced sections to Mu,lim.',
                    keyFormula: 'Mu = 0.87 * fy * Ast * (d - 0.42 * xu)',
                    isCodeClause: 'IS 456:2000 Cl. 38.1 & G-1.1',
                    importance: 'High',
                    commonTrap: 'In over-reinforced sections, never calculate Mu using 0.87*fy*Ast because steel has not yielded.',
                    order: 1,
                    tags: ['Ductility', 'Failure Modes', 'Over-reinforced restriction'],
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'rcc-u2',
        subjectId: 'rcc',
        unitNumber: 2,
        title: 'Shear, Bond, Anchorage & Torsion Detailing',
        order: 2,
        description: 'Nominal shear stress, design shear strength of concrete, critical section for shear, development length, and stirrup spacing.',
        topics: [
          {
            id: 'rcc-u2-t1',
            unitId: 'rcc-u2',
            title: 'Shear Reinforcement & Critical Section',
            order: 1,
            difficulty: 'medium',
            importance: 'Very High',
            pyqFrequency: '1 Question in nearly every SSC JE & PWD paper',
            estimatedHours: 5,
            isCodes: ['IS 456:2000 Cl. 22.6.2, Cl. 40, Table 19 & 20'],
            keyFormulas: [
              'tau_v = Vu / (b * d)',
              'Vus = (0.87 * fy * Asv * d) / Sv',
              'Sv,max = min(0.75 * d, 300 mm)'
            ],
            subtopics: [
              {
                id: 'rcc-u2-t1-s1',
                topicId: 'rcc-u2-t1',
                title: 'Critical Section for Beam Shear Design',
                order: 1,
                concepts: [
                  {
                    id: 'con-rcc-004',
                    subtopicId: 'rcc-u2-t1-s1',
                    code: 'CON-RCC-004',
                    name: 'Location of Critical Section for Shear under Compression Support',
                    explanation: 'When the reaction produces compression in the end region of the member, the critical section for shear is taken at a distance "d" (effective depth) from the face of the support. If support creates tension (e.g. hanging load), critical section is at the face of support.',
                    keyFormula: 'Critical Shear Distance = d from face of support',
                    isCodeClause: 'IS 456:2000 Cl. 22.6.2',
                    importance: 'Very High',
                    commonTrap: 'If load is applied within 2d from face of support, shear enhancement factor applies.',
                    order: 1,
                    tags: ['Critical Section', 'Effective Depth', 'Shear Reaction'],
                  },
                  {
                    id: 'con-rcc-005',
                    subtopicId: 'rcc-u2-t1-s1',
                    code: 'CON-RCC-005',
                    name: 'Maximum Nominal Shear Stress tau_c,max',
                    explanation: 'To prevent diagonal compression failure of concrete struts before stirrup yielding, nominal shear stress tau_v must not exceed tau_c,max under any circumstances. If tau_v > tau_c,max, the cross-section dimensions must be redesigned.',
                    keyFormula: 'tau_c,max = 0.62 * sqrt(fck) in MPa (Table 20)',
                    isCodeClause: 'IS 456:2000 Table 20 & Cl. 40.2.3',
                    importance: 'High',
                    commonTrap: 'For M20 concrete, tau_c,max = 2.8 N/mm²; for M25, it is 3.1 N/mm².',
                    order: 2,
                    tags: ['Diagonal Compression', 'Shear Limits', 'Table 20'],
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'som',
    code: 'CE-SOM',
    name: 'Strength of Materials & Mechanics of Structures',
    shortName: 'SOM / Mechanics',
    category: 'Engineering Sciences',
    standardISCodes: ['IS 800 (Material Properties)', 'IS 456 (Elastic constants)'],
    order: 2,
    description: 'Stress, strain, elastic constants, Mohr circle, SFD/BMD, bending and shear stresses in beams, torsion of circular shafts, and Euler column buckling.',
    units: [
      {
        id: 'som-u1',
        subjectId: 'som',
        unitNumber: 1,
        title: 'Simple Stresses, Strains & Elastic Constants',
        order: 1,
        description: 'Hooke law, Young modulus E, Shear modulus G, Bulk modulus K, Poisson ratio mu, and composite bar thermal stresses.',
        topics: [
          {
            id: 'som-u1-t1',
            unitId: 'som-u1',
            title: 'Relations Between Elastic Constants (E, G, K, mu)',
            order: 1,
            difficulty: 'easy',
            importance: 'Very High',
            pyqFrequency: '1-2 Questions in 100% of Civil JE/AE exams',
            estimatedHours: 4,
            keyFormulas: [
              'E = 2 * G * (1 + mu)',
              'E = 3 * K * (1 - 2 * mu)',
              'E = (9 * K * G) / (3 * K + G)',
              'mu = (3 * K - 2 * G) / (6 * K + 2 * G)'
            ],
            subtopics: [
              {
                id: 'som-u1-t1-s1',
                topicId: 'som-u1-t1',
                title: 'Standard Elastic Constant Interrelations',
                order: 1,
                concepts: [
                  {
                    id: 'con-som-001',
                    subtopicId: 'som-u1-t1-s1',
                    code: 'CON-SOM-001',
                    name: 'Theoretical and Practical Limits of Poisson Ratio (mu)',
                    explanation: 'For isotropic linear elastic materials, the theoretical range of Poisson ratio is -1.0 <= mu <= 0.5. In engineering materials, mu is typically 0 to 0.5 (Cork ~ 0.0, Concrete ~ 0.15 - 0.20, Steel ~ 0.28 - 0.30, Rubber / Incompressible ~ 0.50). When mu = 0.5, volumetric strain is zero and Bulk Modulus K approaches infinity.',
                    keyFormula: '-1 <= mu <= 0.5; For steel: 0.28 - 0.30; For concrete: 0.15 - 0.20',
                    importance: 'Very High',
                    commonTrap: 'Rubber has Poisson ratio ~ 0.5 (incompressible material with K = infinity).',
                    order: 1,
                    tags: ['Poisson Ratio', 'Elasticity', 'Incompressible'],
                  },
                  {
                    id: 'con-som-002',
                    subtopicId: 'som-u1-t1-s1',
                    code: 'CON-SOM-002',
                    name: 'Derivation of E in terms of K and G',
                    explanation: 'By eliminating Poisson ratio mu from E = 2*G*(1+mu) and E = 3*K*(1-2*mu), we obtain E = 9*K*G / (3*K + G). If K = G, then E = 9/4 * K = 2.25*K.',
                    keyFormula: 'E = (9 * K * G) / (3 * K + G)',
                    importance: 'Very High',
                    commonTrap: 'Denominator is (3*K + G), NOT (3*K - G) or (K + 3*G).',
                    order: 2,
                    tags: ['Young Modulus', 'Bulk Modulus', 'Shear Modulus'],
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'geotechnical',
    code: 'CE-GEO',
    name: 'Geotechnical & Foundation Engineering',
    shortName: 'Geotechnical / Soil',
    category: 'Geotechnical & Water Resources',
    standardISCodes: ['IS 2720 (Soil testing)', 'IS 1904 (Foundations)', 'IS 6403 (Bearing capacity)', 'IS 2911 (Piles)'],
    order: 3,
    description: 'Soil classification, phase relations, seepage, Terzaghi effective stress and 1D consolidation, Mohr-Coulomb shear strength, and shallow/deep foundation design.',
    units: [
      {
        id: 'geo-u1',
        subjectId: 'geotechnical',
        unitNumber: 1,
        title: 'Soil Phase Relationships, Index Properties & Soil Classification',
        order: 1,
        description: 'Void ratio, porosity, degree of saturation, moisture content, unit weights, Atterberg limits, and Indian Standard Soil Classification System (ISCS).',
        topics: [
          {
            id: 'geo-u1-t1',
            unitId: 'geo-u1',
            title: 'Phase Relations & Interrelationships',
            order: 1,
            difficulty: 'easy',
            importance: 'Very High',
            pyqFrequency: '2-3 Questions in every Civil exam paper',
            estimatedHours: 5,
            keyFormulas: [
              'Se = w * G',
              'gamma = [G + S * e] / [1 + e] * gamma_w',
              'n = e / (1 + e)',
              'e = n / (1 - n)'
            ],
            subtopics: [
              {
                id: 'geo-u1-t1-s1',
                topicId: 'geo-u1-t1',
                title: 'The Fundamental Soil Identity: S * e = w * G',
                order: 1,
                concepts: [
                  {
                    id: 'con-geo-001',
                    subtopicId: 'geo-u1-t1-s1',
                    code: 'CON-GEO-001',
                    name: 'Degree of Saturation, Void Ratio and Specific Gravity Relation',
                    explanation: 'From mass-volume definitions: S * e = w * G, where S is degree of saturation (0 to 1 or 0% to 100%), e is void ratio (Vv/Vs, can exceed 1.0), w is water content (Mw/Ms), and G is specific gravity of soil solids (~2.65 for inorganic soils). For fully saturated soil, S = 1, giving e = w * G.',
                    keyFormula: 'S * e = w * G; When S=1 (saturated): e = w * G',
                    importance: 'Very High',
                    commonTrap: 'Void ratio e can be greater than 1.0 (e.g. bentonite or soft clays), but porosity n must always be strictly < 1.0 (or < 100%).',
                    order: 1,
                    tags: ['Phase Diagram', 'Saturation', 'Void Ratio'],
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'geo-u2',
        subjectId: 'geotechnical',
        unitNumber: 2,
        title: 'Compressibility & Terzaghi 1-D Consolidation Theory',
        order: 2,
        description: 'Primary consolidation, settlement computation, coefficient of consolidation Cv, time factor Tv, and drainage boundary conditions.',
        topics: [
          {
            id: 'geo-u2-t1',
            unitId: 'geo-u2',
            title: 'Time Factor & Drainage Path Calculations',
            order: 1,
            difficulty: 'hard',
            importance: 'Very High',
            pyqFrequency: '1-2 Questions in ESE, MPSC & PWD exams',
            estimatedHours: 6,
            keyFormulas: [
              'Tv = (Cv * t) / (d^2)',
              'd = H / 2 (Double Drainage), d = H (Single Drainage)',
              'Sc = [Cc * H0 / (1 + e0)] * log10((sigma0 + delta_sigma) / sigma0)'
            ],
            subtopics: [
              {
                id: 'geo-u2-t1-s1',
                topicId: 'geo-u2-t1',
                title: 'Drainage Path Distance (d) in Two-Way vs One-Way Drainage',
                order: 1,
                concepts: [
                  {
                    id: 'con-geo-002',
                    subtopicId: 'geo-u2-t1-s1',
                    code: 'CON-GEO-002',
                    name: 'Effect of Double vs Single Drainage on Consolidation Time',
                    explanation: 'Time factor is Tv = (Cv * t) / d^2. For double drainage (permeable sand layers above and below clay layer of thickness H), the maximum drainage path is d = H/2. For single drainage (impermeable rock at bottom), d = H. Therefore, for the same degree of consolidation U, the consolidation time in single drainage is 4 times that of double drainage: t_single = 4 * t_double.',
                    keyFormula: 't is proportional to d^2; t_single = 4 * t_double',
                    importance: 'Very High',
                    commonTrap: 'Students often square the factor of 2 correctly but forget that d is half the total thickness for double drainage.',
                    order: 1,
                    tags: ['Consolidation', 'Drainage Path', 'Time Factor'],
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'steel',
    code: 'CE-STEEL',
    name: 'Design of Steel Structures (IS 800:2007)',
    shortName: 'Steel Structures',
    category: 'Structural Engineering',
    standardISCodes: ['IS 800:2007', 'IS 875', 'IS 1893'],
    order: 4,
    description: 'Limit state design of steel members, bolted and welded connections, tension members, compression members, column bases, and plate girders per IS 800:2007.',
    units: [
      {
        id: 'steel-u1',
        subjectId: 'steel',
        unitNumber: 1,
        title: 'Connections & Compression Members (IS 800 Table 3)',
        order: 1,
        description: 'Fillet and butt welds, high strength friction grip (HSFG) bolts, effective length of struts, and slenderness ratio limits.',
        topics: [
          {
            id: 'steel-u1-t1',
            unitId: 'steel-u1',
            title: 'Maximum Permissible Slenderness Ratio Limits (IS 800 Table 3)',
            order: 1,
            difficulty: 'medium',
            importance: 'Very High',
            pyqFrequency: '1-2 Questions in every PWD JE & SSC JE shift',
            estimatedHours: 4,
            isCodes: ['IS 800:2007 Table 3'],
            keyFormulas: [
              'lambda = L_eff / r_min',
              'Throat thickness tt = K * s (K = 0.7 for 60-90 deg)'
            ],
            subtopics: [
              {
                id: 'steel-u1-t1-s1',
                topicId: 'steel-u1-t1',
                title: 'Table 3 Slenderness Ratio Enforcements',
                order: 1,
                concepts: [
                  {
                    id: 'con-stl-001',
                    subtopicId: 'steel-u1-t1-s1',
                    code: 'CON-STL-001',
                    name: 'Slenderness Limit for Members carrying compressive loads from Dead & Imposed Load',
                    explanation: 'Per IS 800:2007 Table 3, a member carrying compressive loads resulting from dead loads and imposed loads has a maximum permissible slenderness ratio of 180. If the compression results from wind or earthquake action only (no dead load compression reversal), the limit is 250. For tension members with reversal of stress under wind/earthquake, limit is 350.',
                    keyFormula: 'Max lambda = 180 (DL+LL compression); 250 (Wind/EQ compression); 350 (Tension reversal)',
                    isCodeClause: 'IS 800:2007 Table 3',
                    importance: 'Very High',
                    commonTrap: 'Often confused: 180 is for DL+LL compression, while 250 is for wind/EQ compression.',
                    order: 1,
                    tags: ['Slenderness Ratio', 'Table 3', 'Compression Members'],
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'fluid_mechanics',
    code: 'CE-FM',
    name: 'Fluid Mechanics & Open Channel Hydraulics',
    shortName: 'Fluid & Hydraulics',
    category: 'Geotechnical & Water Resources',
    standardISCodes: ['IS 1192 (Velocity measurement)', 'IS 9108 (Notches & Weirs)'],
    order: 5,
    description: 'Fluid statics, buoyant stability, continuity and Bernoulli equations, viscous pipe flow, Moody diagram, open channel flow, hydraulic jumps, and dimensional analysis.',
    units: [
      {
        id: 'fm-u1',
        subjectId: 'fluid_mechanics',
        unitNumber: 1,
        title: 'Open Channel Flow & Hydraulic Jumps',
        order: 1,
        description: 'Specific energy, critical depth, critical velocity, Froude number, and hydraulic jump characteristics in rectangular channels.',
        topics: [
          {
            id: 'fm-u1-t1',
            unitId: 'fm-u1',
            title: 'Hydraulic Jump in Rectangular Channels',
            order: 1,
            difficulty: 'medium',
            importance: 'Very High',
            pyqFrequency: 'Heavily tested in WRD Irrigation & MPSC MES',
            estimatedHours: 5,
            keyFormulas: [
              'y2 / y1 = 0.5 * (sqrt(1 + 8 * Fr1^2) - 1)',
              'E_loss = (y2 - y1)^3 / (4 * y1 * y2)',
              'Fr = V / sqrt(g * y)'
            ],
            subtopics: [
              {
                id: 'fm-u1-t1-s1',
                topicId: 'fm-u1-t1',
                title: 'Belanger Conjugate Depth Equation',
                order: 1,
                concepts: [
                  {
                    id: 'con-fm-001',
                    subtopicId: 'fm-u1-t1-s1',
                    code: 'CON-FM-001',
                    name: 'Belanger Relation for Sequent Depths in Hydraulic Jump',
                    explanation: 'In a horizontal frictionless rectangular open channel, the relationship between initial depth y1 and post-jump depth y2 (sequent or conjugate depths) is given by Belanger momentum equation: y2/y1 = 0.5 * (sqrt(1 + 8*Fr1^2) - 1), where Fr1 = V1 / sqrt(g*y1) is the supercritical Froude number before the jump (Fr1 > 1.0).',
                    keyFormula: 'y2 / y1 = 0.5 * (sqrt(1 + 8 * Fr1^2) - 1)',
                    importance: 'Very High',
                    commonTrap: 'Notice the -1 is outside the square root: sqrt(1 + 8*Fr^2) - 1.',
                    order: 1,
                    tags: ['Hydraulic Jump', 'Sequent Depths', 'Froude Number'],
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'transportation',
    code: 'CE-TRANS',
    name: 'Transportation & Highway Engineering',
    shortName: 'Transportation & Highways',
    category: 'Infrastructure & Surveying',
    standardISCodes: ['IRC 73 (Geometric design)', 'IRC 37:2018 (Flexible pavements)', 'IRC 58 (Rigid pavements)'],
    order: 6,
    description: 'Highway geometric design, Stopping Sight Distance (SSD), Overtaking Sight Distance (OSD), superelevation, flexible pavement design via CBR (IRC 37), and traffic flow fundamentals.',
    units: [
      {
        id: 'trans-u1',
        subjectId: 'transportation',
        unitNumber: 1,
        title: 'Geometric Design & Sight Distances (IRC 73)',
        order: 1,
        description: 'Cross-sectional elements, camber, design speed, SSD, OSD, horizontal curves, and superelevation design steps.',
        topics: [
          {
            id: 'trans-u1-t1',
            unitId: 'trans-u1',
            title: 'Stopping Sight Distance (SSD) & Superelevation (e)',
            order: 1,
            difficulty: 'easy',
            importance: 'Very High',
            pyqFrequency: '1-2 Questions in every PWD/ZP/SSC paper',
            estimatedHours: 4,
            isCodes: ['IRC 73-1980', 'IRC 86-1983'],
            keyFormulas: [
              'SSD = 0.278 * V * t_r + V^2 / (254 * f)',
              'e + f = V^2 / (127 * R)',
              'Design e = V^2 / (225 * R) (neglecting friction at 75% speed)'
            ],
            subtopics: [
              {
                id: 'trans-u1-t1-s1',
                topicId: 'trans-u1-t1',
                title: 'IRC Design Steps for Horizontal Curve Superelevation',
                order: 1,
                concepts: [
                  {
                    id: 'con-trans-001',
                    subtopicId: 'trans-u1-t1-s1',
                    code: 'CON-TRANS-001',
                    name: 'Practical Design of Superelevation for 75% Design Speed',
                    explanation: 'Per IRC standards, superelevation is designed for 75% of design speed neglecting lateral friction (f=0): e = (0.75*V)^2 / (127*R) = V^2 / (225*R). If e <= e_max (7% for plain/rolling terrain, 10% for hilly terrain, 4% for urban roads with frequent intersections), this value is provided. If e > e_max, provide e_max and check lateral friction f.',
                    keyFormula: 'e_design = V^2 / (225 * R); e_max = 7% (Plain/Rolling)',
                    isCodeClause: 'IRC 73 Cl. 7.4',
                    importance: 'Very High',
                    commonTrap: 'When using V in km/h, the denominator is 225*R; when using v in m/s, it is 2*g*R.',
                    order: 1,
                    tags: ['Superelevation', 'IRC 73', 'Centrifugal Force'],
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

// 10 Distinct Civil Recruitment Examinations and their Papers
export const INITIAL_EXAMS_HIERARCHY: CivilExamHierarchyProfile[] = [
  {
    id: 'ese_civil',
    name: 'UPSC Engineering Services Examination (ESE / IES) Civil',
    shortName: 'UPSC ESE / IES',
    conductingBody: 'Union Public Service Commission (UPSC)',
    cadre: 'Group-A Central Engineering Services (Gazetted)',
    category: 'National',
    syllabusVersion: '2026.1',
    papers: [
      {
        id: 'ese-p1',
        examId: 'ese_civil',
        paperNumber: 1,
        paperName: 'Paper-I: Civil Engineering (Structures, Materials & Mechanics)',
        code: 'ESE-CE-01',
        totalMarks: 300,
        durationMinutes: 180,
        negativeMarking: 'one_third',
        pattern: 'Objective CBT',
        subjectIds: ['som', 'rcc', 'steel'],
      },
      {
        id: 'ese-p2',
        examId: 'ese_civil',
        paperNumber: 2,
        paperName: 'Paper-II: Civil Engineering (Fluids, Geotech, Water & Transport)',
        code: 'ESE-CE-02',
        totalMarks: 300,
        durationMinutes: 180,
        negativeMarking: 'one_third',
        pattern: 'Objective CBT',
        subjectIds: ['geotechnical', 'fluid_mechanics', 'transportation'],
      }
    ]
  },
  {
    id: 'ssc_je',
    name: 'SSC Junior Engineer (Civil) Examination',
    shortName: 'SSC JE Civil',
    conductingBody: 'Staff Selection Commission (SSC)',
    cadre: 'Junior Engineer (Group-B Non-Gazetted) in CPWD, MES, CWC',
    category: 'National',
    syllabusVersion: '2026.1',
    papers: [
      {
        id: 'ssc-p1',
        examId: 'ssc_je',
        paperNumber: 1,
        paperName: 'Paper-I: Part-A General Engineering (Civil & Structural)',
        code: 'SSC-JE-P1',
        totalMarks: 100,
        durationMinutes: 120,
        negativeMarking: 'one_fourth',
        pattern: 'Objective CBT',
        subjectIds: ['rcc', 'som', 'geotechnical', 'steel', 'fluid_mechanics', 'transportation'],
      }
    ]
  },
  {
    id: 'mpsc_mes',
    name: 'MPSC Maharashtra Engineering Services (MES Civil AE/JE)',
    shortName: 'MPSC MES Civil',
    conductingBody: 'Maharashtra Public Service Commission (MPSC)',
    cadre: 'Assistant Engineer (AE) Group-A & Group-B (Gazetted)',
    category: 'Maharashtra State',
    syllabusVersion: '2026.1',
    papers: [
      {
        id: 'mpsc-p1',
        examId: 'mpsc_mes',
        paperNumber: 1,
        paperName: 'Paper-I: Civil Engineering (Structures, Materials & Mechanics)',
        code: 'MPSC-MES-01',
        totalMarks: 200,
        durationMinutes: 120,
        negativeMarking: 'one_fourth',
        pattern: 'Objective CBT',
        subjectIds: ['rcc', 'som', 'steel'],
      },
      {
        id: 'mpsc-p2',
        examId: 'mpsc_mes',
        paperNumber: 2,
        paperName: 'Paper-II: Civil Engineering (Water, Geotech & Infrastructure)',
        code: 'MPSC-MES-02',
        totalMarks: 200,
        durationMinutes: 120,
        negativeMarking: 'one_fourth',
        pattern: 'Objective CBT',
        subjectIds: ['geotechnical', 'fluid_mechanics', 'transportation'],
      }
    ]
  },
  {
    id: 'maha_pwd',
    name: 'Maharashtra Public Works Department (PWD JE / CEA)',
    shortName: 'Maha PWD JE',
    conductingBody: 'Public Works Department (Maharashtra)',
    cadre: 'Junior Engineer (Civil) Group-B & Civil Engg Assistant (CEA)',
    category: 'Maharashtra State',
    syllabusVersion: '2026.1',
    papers: [
      {
        id: 'pwd-p1',
        examId: 'maha_pwd',
        paperNumber: 1,
        paperName: 'Technical Paper: Core Civil Engineering & PWD Specifications',
        code: 'PWD-TECH-01',
        totalMarks: 140,
        durationMinutes: 90,
        negativeMarking: 'one_fourth',
        pattern: 'Objective CBT',
        subjectIds: ['rcc', 'som', 'geotechnical', 'steel', 'transportation', 'fluid_mechanics'],
      }
    ]
  },
  {
    id: 'wrd_civil',
    name: 'Maharashtra Water Resources Department (WRD / Jalsampada JE)',
    shortName: 'WRD / Jalsampada',
    conductingBody: 'Water Resources Department (Government of Maharashtra)',
    cadre: 'Junior Engineer (Civil) Group-B (Irrigation & Dam Works)',
    category: 'Irrigation / PSU',
    syllabusVersion: '2026.1',
    papers: [
      {
        id: 'wrd-p1',
        examId: 'wrd_civil',
        paperNumber: 1,
        paperName: 'Technical Paper: Irrigation, Hydraulics & Structural Works',
        code: 'WRD-TECH-01',
        totalMarks: 150,
        durationMinutes: 90,
        negativeMarking: 'one_fourth',
        pattern: 'Objective CBT',
        subjectIds: ['fluid_mechanics', 'geotechnical', 'rcc', 'som'],
      }
    ]
  },
  {
    id: 'zp_civil',
    name: 'Maharashtra Zilla Parishad (ZP) Civil Engineering JE',
    shortName: 'ZP Civil JE',
    conductingBody: 'Rural Development Department / Local Body Selection Board',
    cadre: 'Junior Engineer (Civil) Group-C / Local Self-Government',
    category: 'Local Body / Municipal',
    syllabusVersion: '2026.1',
    papers: [
      {
        id: 'zp-p1',
        examId: 'zp_civil',
        paperNumber: 1,
        paperName: 'Technical Paper: Rural Infrastructure, Building & Water Works',
        code: 'ZP-CIVIL-01',
        totalMarks: 100,
        durationMinutes: 75,
        negativeMarking: 'one_fourth',
        pattern: 'Objective CBT',
        subjectIds: ['rcc', 'som', 'geotechnical', 'transportation'],
      }
    ]
  },
  {
    id: 'bmc_sub_engg',
    name: 'Brihanmumbai Municipal Corporation (BMC) Sub-Engineer Civil',
    shortName: 'BMC Sub-Engg',
    conductingBody: 'Municipal Corporation of Greater Mumbai (MCGM)',
    cadre: 'Sub-Engineer (Civil) Group-B',
    category: 'Local Body / Municipal',
    syllabusVersion: '2026.1',
    papers: [
      {
        id: 'bmc-p1',
        examId: 'bmc_sub_engg',
        paperNumber: 1,
        paperName: 'Civil Engineering: Urban Infrastructure, Water & Structures',
        code: 'BMC-CE-01',
        totalMarks: 100,
        durationMinutes: 90,
        negativeMarking: 'one_fourth',
        pattern: 'Objective CBT',
        subjectIds: ['rcc', 'som', 'fluid_mechanics', 'transportation', 'geotechnical'],
      }
    ]
  },
  {
    id: 'rrb_je',
    name: 'Railway Recruitment Board (RRB) Junior Engineer Civil',
    shortName: 'RRB JE Civil',
    conductingBody: 'Railway Recruitment Control Board (RRCB)',
    cadre: 'Junior Engineer (Civil Track, Works & Bridges) Level-6',
    category: 'National',
    syllabusVersion: '2026.1',
    papers: [
      {
        id: 'rrb-p2',
        examId: 'rrb_je',
        paperNumber: 2,
        paperName: 'CBT-2: Technical Abilities (Civil & Allied Engineering)',
        code: 'RRB-CBT2-CE',
        totalMarks: 100,
        durationMinutes: 120,
        negativeMarking: 'one_third',
        pattern: 'Objective CBT',
        subjectIds: ['rcc', 'som', 'steel', 'geotechnical', 'transportation'],
      }
    ]
  },
  {
    id: 'mjp_civil',
    name: 'Maharashtra Jeevan Pradhikaran (MJP) Civil JE / AE',
    shortName: 'MJP Water Supply',
    conductingBody: 'Maharashtra Jeevan Pradhikaran Authority',
    cadre: 'Junior Engineer (Civil) - Public Health & Pipeline Works',
    category: 'Irrigation / PSU',
    syllabusVersion: '2026.1',
    papers: [
      {
        id: 'mjp-p1',
        examId: 'mjp_civil',
        paperNumber: 1,
        paperName: 'Technical Paper: Water Distribution, Pipe Networks & Civil Works',
        code: 'MJP-TECH-01',
        totalMarks: 100,
        durationMinutes: 90,
        negativeMarking: 'one_fourth',
        pattern: 'Objective CBT',
        subjectIds: ['fluid_mechanics', 'rcc', 'geotechnical'],
      }
    ]
  },
  {
    id: 'urban_rural_dev',
    name: 'Urban & Rural Development Civil Engineering Cadre',
    shortName: 'Urban / Rural Dev',
    conductingBody: 'Urban Development & Gramvikas Directorate',
    cadre: 'Assistant Town Planner / Municipal Civil Engineer',
    category: 'Local Body / Municipal',
    syllabusVersion: '2026.1',
    papers: [
      {
        id: 'dev-p1',
        examId: 'urban_rural_dev',
        paperNumber: 1,
        paperName: 'Technical Paper: Municipal Buildings, Town Layouts & Sanitation',
        code: 'URBAN-TECH-01',
        totalMarks: 100,
        durationMinutes: 90,
        negativeMarking: 'none',
        pattern: 'Objective CBT',
        subjectIds: ['rcc', 'transportation', 'som', 'geotechnical'],
      }
    ]
  }
];

// Initial Exam-Specific Mappings demonstrating that Syllabi are NOT identical across exams
export const INITIAL_EXAM_MAPPINGS: ExamSyllabusMapping[] = [
  {
    id: 'map-ese-rcc',
    examId: 'ese_civil',
    paperId: 'ese-p1',
    subjectId: 'rcc',
    inclusionStatus: 'core_compulsory',
    examWeightagePercent: 18,
    depthLevel: 'advanced_ese',
    examSpecificNotes: 'High theoretical rigor: Flanged beams, torsion design, and prestressed indeterminate frames.',
    pyqFrequencyText: '25-30 Questions in Paper-I',
    lastAuditedDate: '2026-03-10'
  },
  {
    id: 'map-ssc-rcc',
    examId: 'ssc_je',
    paperId: 'ssc-p1',
    subjectId: 'rcc',
    inclusionStatus: 'core_compulsory',
    examWeightagePercent: 12,
    depthLevel: 'diploma_je',
    examSpecificNotes: 'Direct formula substitutions: xu,max, minimum shear steel, nominal cover from Table 16.',
    pyqFrequencyText: '10-12 Questions in Paper-I',
    lastAuditedDate: '2026-02-15'
  },
  {
    id: 'map-pwd-rcc',
    examId: 'maha_pwd',
    paperId: 'pwd-p1',
    subjectId: 'rcc',
    inclusionStatus: 'core_compulsory',
    examWeightagePercent: 15,
    depthLevel: 'diploma_je',
    examSpecificNotes: 'Focus on PWD Red Book and direct clauses of IS 456:2000 (limiting neutral axis, cover).',
    pyqFrequencyText: '12-15 Questions in PWD shift',
    lastAuditedDate: '2026-01-20'
  },
  {
    id: 'map-wrd-fm',
    examId: 'wrd_civil',
    paperId: 'wrd-p1',
    subjectId: 'fluid_mechanics',
    inclusionStatus: 'specialized_heavy',
    examWeightagePercent: 35,
    depthLevel: 'degree_ae',
    examSpecificNotes: 'Extremely high weightage: Open channel flow, Belanger jump equations, spillway profiles & Manning roughness.',
    pyqFrequencyText: '25-30 Questions (Dominates WRD CBT)',
    lastAuditedDate: '2026-02-28'
  },
  {
    id: 'map-pwd-trans',
    examId: 'maha_pwd',
    paperId: 'pwd-p1',
    subjectId: 'transportation',
    inclusionStatus: 'specialized_heavy',
    examWeightagePercent: 20,
    depthLevel: 'diploma_je',
    examSpecificNotes: 'Highway geometric design (IRC 73) and Flexible pavement design (IRC 37) are primary PWD field criteria.',
    pyqFrequencyText: '15-18 Questions per paper',
    lastAuditedDate: '2026-02-10'
  },
  {
    id: 'map-mpsc-geo',
    examId: 'mpsc_mes',
    paperId: 'mpsc-p2',
    subjectId: 'geotechnical',
    inclusionStatus: 'core_compulsory',
    examWeightagePercent: 22,
    depthLevel: 'degree_ae',
    examSpecificNotes: 'Rigorous calculation questions: Terzaghi 1D consolidation, Skempton pore pressure, and Meyerhof bearing capacity.',
    pyqFrequencyText: '18-22 Questions in Paper-II',
    lastAuditedDate: '2026-03-01'
  }
];

// Initial Audit Logs
export const INITIAL_AUDIT_LOGS: SyllabusAuditLog[] = [
  {
    id: 'audit-001',
    timestamp: '2026-03-10T10:30:00Z',
    version: '2026.1',
    actor: 'admin.sp@engineeringofficer.in',
    action: 'PUBLISH_VERSION',
    entityType: 'Exam',
    entityId: 'all',
    entityName: 'Civil Engineering 7-Tier Syllabus Hierarchy',
    changeSummary: 'Published official v2026.1 syllabus release covering 10 engineering recruitment examinations with distinct papers and codal mappings.',
    previousValue: 'Draft',
    newValue: 'v2026.1'
  },
  {
    id: 'audit-002',
    timestamp: '2026-03-12T14:15:00Z',
    version: '2026.1',
    actor: 'chief.mentor@engineeringofficer.in',
    action: 'MAPPING_UPDATE',
    entityType: 'Mapping',
    entityId: 'map-wrd-fm',
    entityName: 'WRD Fluid Mechanics Specialization',
    changeSummary: 'Elevated Open Channel Hydraulics weightage in WRD exam mapping to 35% in alignment with 2026 irrigation board guidelines.',
    previousValue: '28%',
    newValue: '35%'
  }
];

export class ServerSyllabusEngine {
  private static canonicalSubjects: CanonicalSubject[] = [...INITIAL_CANONICAL_SUBJECTS];
  private static examsHierarchy: CivilExamHierarchyProfile[] = [...INITIAL_EXAMS_HIERARCHY];
  private static examMappings: ExamSyllabusMapping[] = [...INITIAL_EXAM_MAPPINGS];
  private static auditLogs: SyllabusAuditLog[] = [...INITIAL_AUDIT_LOGS];
  private static currentVersion: string = '2026.1';

  // Get full hierarchy overview
  public static getFullHierarchy() {
    return {
      version: this.currentVersion,
      exams: this.examsHierarchy,
      subjects: this.canonicalSubjects,
      mappings: this.examMappings,
      auditLogsCount: this.auditLogs.length,
    };
  }

  // Get specific exam syllabus tree including mapped papers and subjects
  public static getExamSyllabus(examId: string) {
    const exam = this.examsHierarchy.find((e) => e.id === examId) || this.examsHierarchy[0];
    const mappingsForExam = this.examMappings.filter((m) => m.examId === exam.id);

    const papersWithSubjects = exam.papers.map((paper) => {
      const mappedSubjects = paper.subjectIds.map((subjId) => {
        const canonical = this.canonicalSubjects.find((s) => s.id === subjId);
        const mapping = mappingsForExam.find((m) => m.paperId === paper.id && m.subjectId === subjId);
        return {
          ...canonical,
          examMapping: mapping || {
            inclusionStatus: 'core_compulsory',
            examWeightagePercent: 12,
            depthLevel: 'diploma_je',
            examSpecificNotes: 'Standard syllabus inclusion.',
            pyqFrequencyText: 'Frequently asked',
          },
        };
      }).filter(Boolean);

      return {
        ...paper,
        subjects: mappedSubjects,
      };
    });

    return {
      exam,
      papers: papersWithSubjects,
      version: this.currentVersion,
    };
  }

  // Get individual concept with deep learning data
  public static getConcept(conceptId: string): SyllabusConcept | null {
    for (const subj of this.canonicalSubjects) {
      for (const unit of subj.units) {
        for (const topic of unit.topics) {
          for (const subtopic of topic.subtopics) {
            const match = subtopic.concepts.find((c) => c.id === conceptId);
            if (match) return match;
          }
        }
      }
    }
    return null;
  }

  // Admin: Create or Update Concept (Versioned & Audited)
  public static upsertConcept(conceptData: Partial<SyllabusConcept>, actorEmail: string = 'admin@engineeringofficer.in') {
    const isNew = !conceptData.id;
    const conceptId = conceptData.id || `con-${crypto.randomBytes(4).toString('hex')}`;
    let updatedConcept: SyllabusConcept | null = null;
    let parentSubtopic: SyllabusSubtopic | null = null;

    for (const subj of this.canonicalSubjects) {
      for (const unit of subj.units) {
        for (const topic of unit.topics) {
          for (const subtopic of topic.subtopics) {
            if (subtopic.id === conceptData.subtopicId || subtopic.concepts.some((c) => c.id === conceptId)) {
              parentSubtopic = subtopic;
              const existingIdx = subtopic.concepts.findIndex((c) => c.id === conceptId);

              const newEntry: SyllabusConcept = {
                id: conceptId,
                subtopicId: subtopic.id,
                topicId: topic.id,
                name: conceptData.name || 'Untitled Concept',
                code: conceptData.code || `CON-${subj.code.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
                explanation: conceptData.explanation || '',
                keyFormula: conceptData.keyFormula,
                isCodeClause: conceptData.isCodeClause,
                importance: conceptData.importance || 'High',
                commonTrap: conceptData.commonTrap,
                order: conceptData.order || (subtopic.concepts.length + 1),
                tags: conceptData.tags || [],
                lastUpdated: new Date().toISOString().split('T')[0],
              };

              if (existingIdx >= 0) {
                subtopic.concepts[existingIdx] = newEntry;
              } else {
                subtopic.concepts.push(newEntry);
              }

              updatedConcept = newEntry;
              break;
            }
          }
          if (updatedConcept) break;
        }
        if (updatedConcept) break;
      }
      if (updatedConcept) break;
    }

    if (updatedConcept) {
      // Record Audit Trail
      this.recordAudit({
        actor: actorEmail,
        action: isNew ? 'CREATE' : 'UPDATE',
        entityType: 'Concept',
        entityId: updatedConcept.id,
        entityName: updatedConcept.name,
        changeSummary: `${isNew ? 'Created new' : 'Updated'} concept "${updatedConcept.name}" with code ${updatedConcept.code} (${updatedConcept.isCodeClause || 'General'}).`,
      });
    }

    return updatedConcept;
  }

  // Admin: Update Exam-Specific Mapping
  public static updateExamMapping(mappingData: Partial<ExamSyllabusMapping>, actorEmail: string = 'admin@engineeringofficer.in') {
    let mapping = this.examMappings.find((m) => m.id === mappingData.id);
    if (!mapping) {
      mapping = {
        id: mappingData.id || `map-${crypto.randomBytes(4).toString('hex')}`,
        examId: mappingData.examId || 'maha_pwd',
        paperId: mappingData.paperId || 'pwd-p1',
        subjectId: mappingData.subjectId || 'rcc',
        inclusionStatus: mappingData.inclusionStatus || 'core_compulsory',
        examWeightagePercent: mappingData.examWeightagePercent || 15,
        depthLevel: mappingData.depthLevel || 'diploma_je',
        examSpecificNotes: mappingData.examSpecificNotes || '',
        pyqFrequencyText: mappingData.pyqFrequencyText || 'Regular',
        lastAuditedDate: new Date().toISOString().split('T')[0],
      };
      this.examMappings.push(mapping);
    } else {
      const prevWeight = mapping.examWeightagePercent;
      mapping.inclusionStatus = mappingData.inclusionStatus || mapping.inclusionStatus;
      mapping.examWeightagePercent = mappingData.examWeightagePercent ?? mapping.examWeightagePercent;
      mapping.depthLevel = mappingData.depthLevel || mapping.depthLevel;
      mapping.examSpecificNotes = mappingData.examSpecificNotes ?? mapping.examSpecificNotes;
      mapping.pyqFrequencyText = mappingData.pyqFrequencyText ?? mapping.pyqFrequencyText;
      mapping.lastAuditedDate = new Date().toISOString().split('T')[0];

      this.recordAudit({
        actor: actorEmail,
        action: 'MAPPING_UPDATE',
        entityType: 'Mapping',
        entityId: mapping.id,
        entityName: `${mapping.examId} - ${mapping.subjectId}`,
        changeSummary: `Updated exam mapping weightage from ${prevWeight}% to ${mapping.examWeightagePercent}% (${mapping.depthLevel}).`,
      });
    }

    return mapping;
  }

  // Publish New Version of Syllabus
  public static publishVersion(newVersion: string, releaseNotes: string, actorEmail: string = 'admin@engineeringofficer.in') {
    const oldVersion = this.currentVersion;
    this.currentVersion = newVersion;

    this.recordAudit({
      actor: actorEmail,
      action: 'PUBLISH_VERSION',
      entityType: 'Exam',
      entityId: 'global',
      entityName: `Syllabus Release ${newVersion}`,
      changeSummary: `Published new Civil Engineering Syllabus Version ${newVersion} (Upgraded from ${oldVersion}): ${releaseNotes}`,
      previousValue: oldVersion,
      newValue: newVersion,
    });

    return {
      version: this.currentVersion,
      publishedAt: new Date().toISOString(),
      notes: releaseNotes,
    };
  }

  // Get Audit Trail
  public static getAuditLogs(): SyllabusAuditLog[] {
    return [...this.auditLogs].reverse();
  }

  private static recordAudit(entry: Omit<SyllabusAuditLog, 'id' | 'timestamp' | 'version'>) {
    const log: SyllabusAuditLog = {
      id: `audit-${crypto.randomBytes(4).toString('hex')}`,
      timestamp: new Date().toISOString(),
      version: this.currentVersion,
      ...entry,
    };
    this.auditLogs.push(log);
  }
}

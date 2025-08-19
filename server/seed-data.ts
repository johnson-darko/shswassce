import { db } from "./db";
import { universities, programs, requirements, scholarships } from "@shared/schema";

export async function seedDatabase() {
  console.log('Seeding database with sample data...');

  try {
    // Clear existing data
    await db.delete(scholarships);
    await db.delete(requirements);
    await db.delete(programs);
    await db.delete(universities);

    // Sample Universities
    const universityData = [
      {
        id: "ug-001",
        name: "University of Ghana",
        location: "Accra",
        region: "Greater Accra",
        type: "Public",
        size: "Large",
        setting: "City",
        website: "https://ug.edu.gh",
        graduationRate: 87,
        annualCost: 15000,
        medianEarnings: 45000,
        acceptanceRate: 65,
        description: "Ghana's premier university, established in 1948"
      },
      {
        id: "knust-001",
        name: "Kwame Nkrumah University of Science and Technology",
        location: "Kumasi",
        region: "Ashanti",
        type: "Public",
        size: "Large",
        setting: "City",
        website: "https://knust.edu.gh",
        graduationRate: 82,
        annualCost: 12500,
        medianEarnings: 52000,
        acceptanceRate: 58,
        description: "Leading technology and science university in Ghana"
      },
      {
        id: "ucc-001",
        name: "University of Cape Coast",
        location: "Cape Coast",
        region: "Central",
        type: "Public",
        size: "Medium",
        setting: "City",
        website: "https://ucc.edu.gh",
        graduationRate: 79,
        annualCost: 11000,
        medianEarnings: 38000,
        acceptanceRate: 72,
        description: "Ghana's premier university for education and liberal arts"
      },
      {
        id: "ashesi-001",
        name: "Ashesi University",
        location: "Berekuso",
        region: "Eastern",
        type: "Private",
        size: "Small",
        setting: "Suburban",
        website: "https://ashesi.edu.gh",
        graduationRate: 95,
        annualCost: 45000,
        medianEarnings: 75000,
        acceptanceRate: 35,
        description: "Liberal arts university focused on leadership and innovation"
      },
      {
        id: "uds-001",
        name: "University for Development Studies",
        location: "Tamale",
        region: "Northern",
        type: "Public",
        size: "Medium",
        setting: "City",
        website: "https://uds.edu.gh",
        graduationRate: 75,
        annualCost: 9500,
        medianEarnings: 35000,
        acceptanceRate: 68,
        description: "Multi-campus university focused on development studies"
      }
    ];

    await db.insert(universities).values(universityData);

    // Sample Programs
    const programData = [
      {
        id: "prog-001",
        universityId: "ug-001",
        name: "B.Sc. Computer Science",
        level: "Bachelor's",
        duration: 48,
        tuitionLocal: 15000,
        tuitionInternational: 25000,
        currency: "GHS",
        description: "Comprehensive computer science program with industry focus",
        careerOutcomes: ["Software Developer", "Data Scientist", "IT Consultant", "Systems Analyst", "Cybersecurity Specialist"],
        averageSalary: 55000,
        employmentRate: 90
      },
      {
        id: "prog-002",
        universityId: "ug-001",
        name: "B.A. Economics",
        level: "Bachelor's",
        duration: 36,
        tuitionLocal: 12000,
        tuitionInternational: 20000,
        currency: "GHS",
        description: "Economics program with policy and development focus",
        careerOutcomes: ["Economic Analyst", "Policy Advisor", "Financial Consultant", "Development Officer", "Research Economist"],
        averageSalary: 42000,
        employmentRate: 85
      },
      {
        id: "prog-003",
        universityId: "knust-001",
        name: "B.Sc. Civil Engineering",
        level: "Bachelor's",
        duration: 48,
        tuitionLocal: 14000,
        tuitionInternational: 24000,
        currency: "GHS",
        description: "Accredited engineering program with practical training",
        careerOutcomes: ["Civil Engineer", "Project Manager", "Construction Manager", "Structural Engineer", "Infrastructure Planner"],
        averageSalary: 60000,
        employmentRate: 92
      },
      {
        id: "prog-004",
        universityId: "ucc-001",
        name: "B.Ed. Mathematics",
        level: "Bachelor's",
        duration: 48,
        tuitionLocal: 11000,
        tuitionInternational: 18000,
        currency: "GHS",
        description: "Teacher training program for mathematics education",
        careerOutcomes: ["Mathematics Teacher", "Education Officer", "Curriculum Developer", "Educational Consultant", "School Administrator"],
        averageSalary: 35000,
        employmentRate: 88
      },
      {
        id: "prog-005",
        universityId: "ashesi-001",
        name: "B.Sc. Business Administration",
        level: "Bachelor's",
        duration: 48,
        tuitionLocal: 45000,
        tuitionInternational: 45000,
        currency: "GHS",
        description: "Liberal arts business program with leadership focus",
        careerOutcomes: ["Business Manager", "Entrepreneur", "Management Consultant", "Marketing Manager", "Operations Manager"],
        averageSalary: 75000,
        employmentRate: 95
      },
      {
        id: "prog-006",
        universityId: "knust-001",
        name: "B.Sc. Computer Engineering",
        level: "Bachelor's",
        duration: 48,
        tuitionLocal: 14500,
        tuitionInternational: 24500,
        currency: "GHS",
        description: "Hardware and software engineering with embedded systems",
        careerOutcomes: ["Computer Engineer", "Hardware Designer", "Embedded Systems Engineer", "Software Engineer", "Robotics Engineer"],
        averageSalary: 65000,
        employmentRate: 91
      },
      {
        id: "prog-007",
        universityId: "ucc-001",
        name: "Diploma in Nursing",
        level: "Diploma",
        duration: 36,
        tuitionLocal: 8000,
        tuitionInternational: 15000,
        currency: "GHS",
        description: "Professional nursing program with clinical practice",
        careerOutcomes: ["Registered Nurse", "Community Health Nurse", "Hospital Nurse", "Public Health Officer", "Nursing Supervisor"],
        averageSalary: 32000,
        employmentRate: 94
      },
      {
        id: "prog-008",
        universityId: "uds-001",
        name: "B.Sc. Agriculture",
        level: "Bachelor's",
        duration: 48,
        tuitionLocal: 9500,
        tuitionInternational: 16000,
        currency: "GHS",
        description: "Modern agriculture with sustainable farming practices",
        careerOutcomes: ["Agricultural Officer", "Farm Manager", "Agricultural Consultant", "Extension Officer", "Agribusiness Manager"],
        averageSalary: 38000,
        employmentRate: 82
      }
    ];

    await db.insert(programs).values(programData);

    // Sample Requirements
    const requirementData = [
      {
        id: "req-001",
        programId: "prog-001",
        coreSubjects: {
          "English": "C6",
          "Mathematics": "C6",
          "Integrated Science": "C6",
          "Social Studies": "C6"
        },
        electiveSubjects: [
          {"subject": "Elective Mathematics", "min_grade": "B3"},
          {"subject": "Physics", "min_grade": "C6"},
          {"subject": "Any other elective", "min_grade": "C6"}
        ],
        additionalRequirements: "Strong performance in mathematics required",
        aggregatePoints: 24
      },
      {
        id: "req-002",
        programId: "prog-002",
        coreSubjects: {
          "English": "C6",
          "Mathematics": "C6",
          "Integrated Science": "C6",
          "Social Studies": "C6"
        },
        electiveSubjects: [
          {"subject": "Economics", "min_grade": "C6"},
          {"subject": "Government", "min_grade": "C6"},
          {"subject": "Any other elective", "min_grade": "C6"}
        ],
        additionalRequirements: "Good performance in social sciences preferred",
        aggregatePoints: 24
      },
      {
        id: "req-003",
        programId: "prog-003",
        coreSubjects: {
          "English": "C6",
          "Mathematics": "C6",
          "Integrated Science": "C6",
          "Social Studies": "C6"
        },
        electiveSubjects: [
          {"subject": "Elective Mathematics", "min_grade": "B3"},
          {"subject": "Physics", "min_grade": "B3"},
          {"subject": "Chemistry", "min_grade": "C6"}
        ],
        additionalRequirements: "Must have strong mathematics and physics background",
        aggregatePoints: 20
      },
      {
        id: "req-004",
        programId: "prog-004",
        coreSubjects: {
          "English": "C6",
          "Mathematics": "C6",
          "Integrated Science": "C6",
          "Social Studies": "C6"
        },
        electiveSubjects: [
          {"subject": "Elective Mathematics", "min_grade": "C6"},
          {"subject": "Any other 2 electives", "min_grade": "C6"}
        ],
        additionalRequirements: "Teaching aptitude test required",
        aggregatePoints: 24
      },
      {
        id: "req-005",
        programId: "prog-005",
        coreSubjects: {
          "English": "B3",
          "Mathematics": "C6",
          "Integrated Science": "C6",
          "Social Studies": "C6"
        },
        electiveSubjects: [
          {"subject": "Economics", "min_grade": "B3"},
          {"subject": "Any other 2 electives", "min_grade": "C6"}
        ],
        additionalRequirements: "Interview and essay required for admission",
        aggregatePoints: 18
      },
      {
        id: "req-006",
        programId: "prog-006",
        coreSubjects: {
          "English": "C6",
          "Mathematics": "C6",
          "Integrated Science": "C6",
          "Social Studies": "C6"
        },
        electiveSubjects: [
          {"subject": "Elective Mathematics", "min_grade": "B3"},
          {"subject": "Physics", "min_grade": "B3"},
          {"subject": "Chemistry", "min_grade": "C6"}
        ],
        additionalRequirements: "Strong background in mathematics and physics required",
        aggregatePoints: 20
      },
      {
        id: "req-007",
        programId: "prog-007",
        coreSubjects: {
          "English": "C6",
          "Mathematics": "C6",
          "Integrated Science": "C6",
          "Social Studies": "C6"
        },
        electiveSubjects: [
          {"subject": "Biology", "min_grade": "C6"},
          {"subject": "Chemistry", "min_grade": "C6"},
          {"subject": "Any other elective", "min_grade": "C6"}
        ],
        additionalRequirements: "Medical fitness certificate and interview required",
        aggregatePoints: 24
      },
      {
        id: "req-008",
        programId: "prog-008",
        coreSubjects: {
          "English": "C6",
          "Mathematics": "C6",
          "Integrated Science": "C6",
          "Social Studies": "C6"
        },
        electiveSubjects: [
          {"subject": "Biology", "min_grade": "C6"},
          {"subject": "Chemistry", "min_grade": "C6"},
          {"subject": "Any other elective", "min_grade": "C6"}
        ],
        additionalRequirements: "Interest in sustainable agriculture practices",
        aggregatePoints: 30
      }
    ];

    await db.insert(requirements).values(requirementData);

    // Sample Scholarships
    const scholarshipData = [
      {
        id: "sch-001",
        universityId: "ug-001",
        programId: null,
        name: "UG Merit Scholarship",
        amount: 5000,
        eligibilityText: "Merit-based scholarship for academic excellence. Minimum aggregate of 12 points, leadership experience required",
        link: "https://ug.edu.gh/scholarships"
      },
      {
        id: "sch-002",
        universityId: "knust-001",
        programId: null,
        name: "KNUST Engineering Excellence Award",
        amount: 8000,
        eligibilityText: "Scholarship for outstanding engineering students. Excellent performance in mathematics and physics required",
        link: "https://knust.edu.gh/scholarships"
      },
      {
        id: "sch-003",
        universityId: "ucc-001",
        programId: null,
        name: "UCC Teacher Training Support",
        amount: 6000,
        eligibilityText: "Support for future educators. Commitment to teach for 2 years after graduation",
        link: "https://ucc.edu.gh/scholarships"
      },
      {
        id: "sch-004",
        universityId: "ashesi-001",
        programId: null,
        name: "Ashesi Leadership Scholarship",
        amount: 20000,
        eligibilityText: "Full scholarship for exceptional leaders. Demonstrated leadership, community service, essay required",
        link: "https://ashesi.edu.gh/scholarships"
      },
      {
        id: "sch-005",
        universityId: "uds-001",
        programId: null,
        name: "Northern Development Scholarship",
        amount: 4000,
        eligibilityText: "Supporting students from northern regions. Resident of Northern Ghana, financial need demonstrated",
        link: "https://uds.edu.gh/scholarships"
      }
    ];

    await db.insert(scholarships).values(scholarshipData);

    console.log('Database seeded successfully!');
    console.log('Sample data includes:');
    console.log('- 5 Universities (UG, KNUST, UCC, Ashesi, UDS)');
    console.log('- 8 Programs (Computer Science, Economics, Civil Engineering, etc.)');
    console.log('- 8 Requirements sets (WASSCE grade requirements)');
    console.log('- 5 Scholarships');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
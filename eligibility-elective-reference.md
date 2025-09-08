# Elective Subject Storage & Eligibility Logic Reference

## How Electives Are Stored in the App

Electives are stored in the `CalculatorGrades` interface as four slots, each with a subject and a grade:

```
interface CalculatorGrades {
  elective1Subject: string;
  elective1Grade: string;
  elective2Subject: string;
  elective2Grade: string;
  elective3Subject: string;
  elective3Grade: string;
  elective4Subject: string;
  elective4Grade: string;
  // ...core subjects
}
```
- Each slot can hold any subject from the allowed electives list.
- Grades are stored as strings (e.g., "A1", "C6").

## How Eligibility Logic Uses Electives

- The eligibility engine reads all four elective slots, ignoring empty subjects or grades.
- For each program, it checks if the user's electives match the required subjects/groups and minimum grades (usually C6 or better).
- Group logic: Some programs require electives from specific groups (e.g., Visual Art, Technical, Science). The engine checks how many electives match each group.
- Example: For BA. Integrated Rural Art and Industry, the engine checks if the user has at least 3 electives from Group A or Group B, all with grades ≤ C6.
- "Mathematics (Elective)" is treated as a valid elective subject.

## Reference for Future Edits

- Always use the four elective slots in `CalculatorGrades` for eligibility checks.
- When adding new programs/requirements, define elective groups and required subjects clearly.
- Eligibility logic should:
  - Filter electives by grade (≤ C6)
  - Match subjects to required groups/subjects
  - Count matches per group as needed
- For new programs, update this doc if the elective storage or logic changes.

---

## Example: BA. Integrated Rural Art and Industry

### Requirement Used
- Core Subjects: English Language, Mathematics, Integrated Science (minimum C6)
- Elective Subjects: Credit passes in THREE (3) subjects from:
  - **Group A:** Picture Making, Leatherwork, Graphic Design, Textiles, Jewellery, Basketry, Sculpture, Ceramics, General Knowledge in Art, Management in Living, Clothing & Textiles, Food and Nutrition, Physics, Chemistry, Mathematics (Elective), Biology, Religious Studies, Construction, Economics, History, Akan, Geography, Literature in English, Business Management, Accounting, Costing, ICT
  - **Group B:** For Technical applicants, at least credit passes in three technical subjects: Welding and Fabrication Technology, Digital Design Technology, Industrial Mechanics, Wood Construction Technology, Furniture Design and Construction, Creative Art Technology, Building Construction Technology, General Textiles, Fashion Design Technology, Visual Communication Technology

### Eligibility Logic
1. Check if the user has credit passes (C6 or better) in all three core subjects.
2. Filter the user's electives (from the four slots) to those with grades C6 or better.
3. Count how many electives match Group A subjects (including "Mathematics (Elective)")
4. Count how many electives match Group B subjects.
5. If the user has at least 3 electives from Group A **OR** at least 3 from Group B, they are eligible.
6. The result tells the user which group they qualified through.

**This logic matches the app's storage format and ensures subject names are matched exactly.**

**Always reference this document when implementing or updating eligibility logic involving electives.**

---

## Example: BA. Publishing Studies

### Requirement Used
- Core Subjects: English Language, Mathematics, Integrated Science (minimum C6)
- Elective Subjects: Credit passes in THREE (3) subjects from any of the following groupings:
  - **Visual Arts:** General Knowledge in Art, Picture Making and/or Graphic Design, plus Textiles or Sculpture or Leatherwork
  - **General Arts:** Geography, Economics, Government, English Language, History, Religious Studies, French, Ghanaian Languages, etc.
  - **Business:** Economics, Accounting, Introduction to Business Management, Business Mathematics, Principles of Costing, Mathematics (Elective)
  - **Vocational/Home Economics:** General Knowledge in Art, Management in Living, plus either Food and Nutrition or Clothing and Textiles
  - **Science:** Biology, Chemistry, plus Mathematics (Elective) or Physics

### Eligibility Logic
1. Check if the user has credit passes (C6 or better) in all three core subjects.
2. Filter the user's electives (from the four slots) to those with grades C6 or better.
3. For each group, check if the user has the required combination:
   - **Visual Arts:** Must have General Knowledge in Art, Picture Making or Graphic Design, and one of Textiles, Sculpture, or Leatherwork.
   - **General Arts:** Any 3 from the listed subjects.
   - **Business:** Any 3 from the listed subjects (including Mathematics (Elective)).
   - **Vocational/Home Economics:** Must have General Knowledge in Art, Management in Living, and either Food and Nutrition or Clothing and Textiles.
   - **Science:** Must have Biology, Chemistry, and either Mathematics (Elective) or Physics.
4. If the user matches any group’s required combination, they are eligible.
5. The result tells the user which group and combination they qualified through.

**This logic matches the app's storage format and ensures subject names are matched exactly, including special combinations ("plus either" or "plus Mathematics (Elective) or Physics").**

---

## KNUST Art Programs - Simple Eligibility Logic

For the following programs, eligibility is determined by:
- Core Subjects: Credit passes in English Language, Mathematics, and Integrated Science.
- Elective Subjects: Credit passes in THREE (3) subjects from the specified disciplines/groups, with minimum grade C6.

### Programs and Groups
- BSc. Textile Design and Technology: Visual Art, Home Economics, Technical, Science, General Arts, Business
- BSc. Fashion Design: Visual Art, Home Economics, Technical, Science, General Arts, Business
- BFA. Ceramics: Visual Art, Home Economics, General Arts
- BA. Metal Product Design Technology: Visual Art, Home Economics, Technical, Science
- BSc. Ceramic Technology: Visual Art (Ceramics, General Knowledge in Art, and Chemistry or Mathematics (Elective) or Physics), Science (Mathematics (Elective), Chemistry, Physics or Biology), Technical (Technical Drawing, Building Construction, Applied Electricity, Auto Mechanics, Electronics, Physics)

Eligibility logic for these programs is simple and generic, matching the requirements JSON and informing users about the group-based elective requirement.

Eligibility logic for BSc. Ceramic Technology matches the requirements JSON and checks for the required combinations in each group, informing users which group they qualified through.

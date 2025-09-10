# Group A Eligibility Logic for KNUST Programs
yellow highlight in pdf
// To add a new program to Group 1:
  // 1. Confirm the program's requirements match the Group 1 pattern (core subjects: English, Mathematics, Integrated Science; electives:or any 3 from the allowed groups or technical list).
  // 2. Add the program name and its eligible groups/message to the group1Map below, using UPPERCASE for the key.
  // 3. Reference the program name in the main eligibility logic so it uses checkGroup1Eligibility.
  // 4. No need to duplicate logic—just update group1Map and ensure the main file routes the program to this function.
   // 5. Add it to the program and requirements, append to it
I will append the "Doctor of Optometry (OD)" program to your programs-knust.json file, including all key details for Group 2 eligibility
This document explains which programs and requirements can be grouped under the shared Group A eligibility logic, as implemented in `checkGroup1Eligibility` in `eligibility-knust.ts`.

## Group A Logic Summary
- **Core Subjects Required:** English Language, Mathematics, Integrated Science
- **Elective Requirement:** Credit passes (grade ≤ 6) in at least THREE (3) subjects from a defined list (see below)
- **Technical Applicants:** Alternatively, at least THREE (3) passes in specific technical subjects also qualify
- **Aggregate Requirement:** Must meet the program's aggregate points requirement (if specified)

### Group A Elective Subjects
- Picture Making
- Leatherwork
- Graphic Design
- Textiles
- Jewellery
- Basketry
- Sculpture
- Ceramics
- General Knowledge in Art
- Management in Living
- Clothing & Textiles
- Food and Nutrition
- Physics
- Chemistry
- Mathematics (Elective)
- Biology
- Religious Studies
- Construction
- Economics
- History
- Akan
- Geography
- Literature in English
- Business Management
- Accounting
- Costing
- ICT

### Technical Subjects (for Technical Applicants)
- Welding and Fabrication Technology
- Digital Design Technology
- Industrial Mechanics
- Wood Construction Technology
- Furniture Design and Construction
- Creative Art Technology
- Building Construction Technology
- General Textiles
- Fashion Design Technology
- Visual Communication Technology

## Programs Using Group A Logic
The following KNUST programs currently use the Group A logic:

- BA. INTEGRATED RURAL ART AND INDUSTRY
- BSC. PACKAGING TECHNOLOGY
- BA. METAL PRODUCT DESIGN TECHNOLOGY
- BSC. TEXTILE DESIGN AND TECHNOLOGY
- BSC. FASHION DESIGN
- BFA. CERAMICS

## Requirements for Grouping
A program can be added to Group A if:
1. Its admission requirements specify credit passes in any three subjects from the Group A elective list **OR** three passes in the technical subjects list.
2. The core subject requirements are English, Mathematics, and Integrated Science.
3. There are no additional, unique elective or core subject requirements that would require custom logic.

## How to Add a Program to Group A
- Ensure the program's requirements match the above criteria.
- Add the program name to the `group1Map` in `eligibility-knust.ts` if needed.
- Use the shared `checkGroup1Eligibility` function for eligibility checks.


## Notes and Exceptions

**Exception: BA. INTEGRATED RURAL ART AND INDUSTRY**

This program is a special case within Group A. In the shared logic, it is handled with its own subject lists (Group A and Group B) and eligibility rules:

- To qualify, applicants must have credit passes in at least THREE (3) subjects from either Group A (broad art/science/business subjects) or Group B (specific technical subjects).
- The eligibility feedback and requirements for this program are different from other Group A programs and are implemented as a custom block inside the shared function.

If a program has additional requirements (e.g., specific subjects, minimum grades, or unique combinations), it should not be grouped under Group A and should have custom logic.

Always verify the latest official requirements before grouping.

---
_Last updated: September 9, 2025_

# Contributing Guidelines
Both the program and requirements files already exist. To follow your rule, I need to add the new entries to the existing programs-knust.json and requirements-knust.json using an edit tool.

Would you like me to append the new program and requirement entries for the new B.Ed. and STEM programs to these files now?


## Program Eligibility Logic Rule

Whenever you add a new eligibility logic for a program (for any university), you must:

1. **Add or update the program entry in the relevant `programs-<university>.json` file.**
2. **Add or update the requirements entry in the relevant `requirements-<university>.json` file.**

This ensures every program has both program details and requirements, and eligibility logic always references up-to-date data.

---

Please follow this rule for all future eligibility logic changes. If you have questions, refer to this file or contact the project maintainer.







Here are the groups of KNUST programs with similar eligibility logic (from the 25 programs):

Group 1: Science/Technical/Visual Art/Home Economics/General Arts/Business (3 electives with C6 or better)

BSc Packaging Technology
BA Metal Product Design Technology
BSc Textile Design and Technology
BSc Fashion Design
BFA Ceramics
BA Integrated Rural Art and Industry
Group 2: Strict Science (Specific electives required)

BSc Natural Resource Management
BSc Forest Resource Technology
BSc Aquaculture and Water Resource Management
Group 3: Planning/Economics/Arts/Business (Flexible, but with specific subject requirements)

BSc Development Planning
BSc Human Settlement Planning
BSc Land Economy
BSc Real Estate
Group 4: Visual Art Special (Must include General Knowledge in Art, Graphic Design, ICT, etc.)

BFA Fine Art & Curatorial Practice
BA Communication Design (Graphic Design)
Group 5: Multi-track/Grouped eligibility (Checks for eligibility via multiple groups)

BA Publishing Studies
Group 6: Education (Shows all teaching options, broad 3 electives logic)

B.Ed. Junior High School Education
Other programs (not listed above) may have unique or less common logic and would need to be reviewed individually for grouping.

Would you like a list of the remaining programs and their logic, or do you want to proceed with refactoring/grouping the code for these main groups?


Here are the remaining KNUST programs (from the 25) that are not in the main logic groups and may have unique or less common eligibility logic:

B.Sc. Agriculture
B.Sc. Agricultural Biotechnology
B.Sc. Agribusiness Management
B.Sc. Landscape Design and Management
B.Sc. Architecture
B.Sc. Construction Technology and Management (Building Technology)
B.Sc. Quantity Surveying and Construction Economics (Building Technology)
B.Sc. Ceramic Technology
These programs are not explicitly grouped in the main eligibility logic and may have their own custom requirements or combinations. If you want, I can analyze their logic further or help you group/refactor them as well.
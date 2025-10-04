  for local change vite config to use this 
  
   base: '/shswassce/', // Set base for GitHub Pages


     for production change vite config to use this  
     base: '/', // Set base for GitHub Pages




     Group 1 Logic (group1-eligibility.ts)
Core Subjects: Must have passes in English, Mathematics, and Integrated Science.
Electives: Must have at least 3 passes (C6 or better) in electives from specific allowed groups (e.g., Science, General Arts, Visual Art, Technical, Home Economics, Business).
Each program in Group 1 specifies which groups are allowed.
For some programs, there are custom rules (e.g., Integrated Rural Art and Industry, Religion and Human Development).
The function checks if the user’s electives match the allowed groups and counts the number of passes.
If the user has 3 passes in any one allowed group, they are eligible.
Group 2 Logic (group2-eligibility.ts)
Core Subjects: Must have passes in English, Mathematics, and Integrated Science.
Electives: Each program specifies required electives, sometimes with alternatives (e.g., Physics or Elective Mathematics).
The function checks if the user has the required electives and grades.
For some programs, there are special rules (e.g., must have French with A1–B3 for French and Francophone Studies).
For programs like Statistics and Actuarial Science, the rule is “Mathematics (Elective) and any two other electives.”
If the user meets all required electives and core subjects, they are eligible.
Summary Table:

Group	Core Subjects Required	Elective Logic	Eligibility Rule
Group 1	English, Math, Science	3 passes in electives from allowed groups (Science, Arts, Visual Art, Technical, etc.)	3 passes in any one group
Group 2	English, Math, Science	Specific electives per program, sometimes with alternatives (e.g., Physics or Elective Math)	Must have all required electives for the program
Let me know if you want a specific example for a program or want to see the code for a particular eligibility check!

GPT-4.1 • 0x





Here’s the general flow for adding a new KNUST program and its eligibility logic (applies to both Group 1 and Group 2):

1. List the Program
Add the new program to programs-knust.json with all its details (name, id, description, career outcomes, etc.).
2. Write Its Requirement
Add the program’s requirements to requirements-knust.json.
Specify core subjects (e.g., English, Mathematics, Integrated Science).
Specify elective subjects and any special rules (e.g., must have Chemistry and Biology).
Set aggregate points or other constraints.
3. Add to Eligibility Logic
In eligibility-knust.ts, ensure the program is routed to the correct group logic:
Group 1: If the program fits the Group 1 pattern (core + any 3 electives from allowed groups), add its name and allowed groups/message to group1Map in group1-eligibility.ts.
The main logic will call checkGroup1Eligibility for this program.
Group 2: If the program has specific elective requirements (e.g., Chemistry + Physics + Biology), add its name and required electives to group2Programs in group2-eligibility.ts.
The main logic will call checkGroup2Eligibility for this program.
4. Reference in Main Logic
In eligibility-knust.ts, make sure the program name is included in the correct group’s list so the main function uses the right eligibility check.
5. Test and Validate
Check that the program appears in the UI.
Confirm that eligibility is calculated correctly for sample grades.
Summary Table:

Step	Group 1 Flow	Group 2 Flow
1. List Program	Add to programs-knust.json	Add to programs-knust.json
2. Write Requirement	Add to requirements-knust.json (core + electives)	Add to requirements-knust.json (core + specific electives)
3. Add to Logic	Add to group1Map in group1-eligibility.ts	Add to group2Programs in group2-eligibility.ts
4. Reference Logic	Ensure main logic calls checkGroup1Eligibility	Ensure main logic calls checkGroup2Eligibility
5. Test	Validate in UI and eligibility results	Validate in UI and eligibility results
Let me know when you’re ready to add a new program to Group 2, and I’ll guide you step by step!

GPT-4.1 • 0x



Custom logic in eligibility-knust.ts is used for programs that have unique or complex requirements that don’t fit the standard Group 1 or Group 2 patterns. Here’s how it works for the examples you mentioned:

1. BSC. NATURAL RESOURCE MANAGEMENT (and similar programs)
Core Subjects: Must have credit passes in English Language, Mathematics, and Integrated Science.
Elective Subjects: Must have passed:
Chemistry
Physics or Mathematics
Biology or General Agriculture
The code checks for these specific subjects in the applicant’s electives.
If all are present and the aggregate score is good, the applicant is eligible.
2. BSC. LAND ECONOMY & BSC. REAL ESTATE
Core Subjects: Must have credit passes in English Language, Mathematics, and Integrated Science.
Elective Subjects: Two options:
Option 1: Pass Economics, Geography, and one from a list (Accounting, Business Management, etc.).
Option 2: Pass Economics and any two from another list (Elective Mathematics, Geography, etc.).
The code checks both options for eligibility.
If neither option is fully met, it gives feedback on what’s missing.
Why custom logic?
These programs have requirements that are more detailed or have multiple valid combinations.
The logic is written directly in eligibility-knust.ts for clarity and flexibility.
Summary:
Custom logic is used for programs with special rules, and the code for these is written directly in the main eligibility file, not in the group logic files. This allows for more complex checks and tailored feedback for applicants.

BA. Integrated Rural Art and Industry will do later


when the user clicks on Check All Program Eligibility, pop up a modal

that modal will have options

Search through all programs from all schools( this will do exactly what the current button does when clicked on Check All Program Eligibility)
Filter by Specific Department of interest.( this would do our new adding feature)When a department is selected, update the results to show eligible programs from that department first. And then for the rest say that , you are also eligible for other Department programs below then you list them display eligible programs grouped by department.Other departments are shown in separate sections below.
i dont want to use the faculty because some other universites dont have that. So how best can we do it, wthat user can choose Engineering and all engineering program will appear.



Now i would want user to be able to search select which  max two university program/s they would want to do after high school. so it will track the user base on his future uni program of wish and also his  track record by giving an overview and recommendation base on his grades for the subjects and what he has to do well in .

then we would connect it to the aggregate score , so each


Would you like to add items into the chopbox. then a kind of a add on store will appear below with a nice interface pf things like Gari,Sugar, Sardine, Milo etc, with each price and the kg and an image , so it will show the total rice
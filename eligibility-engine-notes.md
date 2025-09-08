# Eligibility Engine Advanced Track Logic

## Overview
This document explains how the eligibility engine handles advanced/track-based program requirements (e.g., admissionTracks in requirements).

## Track Matching Logic
- For each program with `requirementComplexity: "advanced"` and `admissionTracks`, the engine evaluates each track.
- For each track, it checks the required core subjects and elective subjects.
- For electives, it matches the user's actual electives and grades against the track's required subjects and minimum grades.
- The engine scores each track by how many required electives the user matches with passing grades.
- The track with the highest score (most matches) is selected as the best match.

## Displaying Eligibility Details
- The eligibility details for advanced/track-based programs show only the electives and grades used for the matched track.
- If the user does not have all required electives, the details will show 'N/A' for missing subjects.
- The aggregate score is displayed after the electives.

## Example
If a track requires Chemistry, Physics, Biology and the user has Chemistry: A1, Physics: B2, Biology: B3, the details will show:
```
Chemistry: ✓ A1
Physics: ✓ B2
Biology: ✓ B3
Aggregate: ✓ 6/24
```
If the user is missing Biology, it will show:
```
Chemistry: ✓ A1
Physics: ✓ B2
Biology: N/A
Aggregate: ✓ 6/24
```

## Reference
This logic ensures that only the correct electives for the matched track are displayed, and the best track is chosen based on the user's actual results.

---
For future features, reference this file for advanced/track-based eligibility logic and elective selection.

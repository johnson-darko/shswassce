// Local data service for offline PWA
interface LocalDatabase {
  universities: any[];
  programs: any[];
  requirements: any[];
  scholarships: any[];
}

class LocalDataService {
  private data: LocalDatabase | null = null;
  private isLoaded = false;

  async loadData(): Promise<LocalDatabase> {
    if (this.data && this.isLoaded) {
      return this.data;
    }

    try {
      console.log('Loading local data files...');
      const [universitiesRes, programsIndexRes, requirementsRes, scholarshipsRes] = await Promise.all([
        fetch('/data/universities.json'),
        fetch('/data/programs.json'),
        fetch('/data/requirements.json'),
        fetch('/data/scholarships.json')
      ]);

      const [universities, programsIndex, requirements, scholarships] = await Promise.all([
        universitiesRes.json(),
        programsIndexRes.json(),
        requirementsRes.json(),
        scholarshipsRes.json()
      ]);

      // Load and combine all referenced program files
      let allPrograms: any[] = [];
      for (const uni of programsIndex) {
        try {
          const res = await fetch(`/data/${uni.programsFile}`);
          const programs = await res.json();
          allPrograms = allPrograms.concat(programs);
        } catch (e) {
          // Ignore missing files
        }
      }

      this.data = {
        universities,
        programs: allPrograms,
        requirements,
        scholarships
      };
      this.isLoaded = true;
      console.log('Local data loaded successfully:', {
        universities: universities.length,
        programs: allPrograms.length,
        requirements: requirements.length,
        scholarships: scholarships.length
      });
      return this.data;
    } catch (error) {
      console.error('Failed to load local data:', error);
      throw new Error('Failed to load offline data');
    }
  }

  async getUniversities(filters?: any) {
    const data = await this.loadData();
    let universities = [...data.universities];

    if (filters?.query) {
      const query = filters.query.toLowerCase();
      universities = universities.filter(uni => 
        uni.name.toLowerCase().includes(query) ||
        uni.location.toLowerCase().includes(query) ||
        uni.region.toLowerCase().includes(query)
      );
    }

    if (filters?.region) {
      universities = universities.filter(uni => uni.region === filters.region);
    }

    if (filters?.type) {
      universities = universities.filter(uni => uni.type === filters.type);
    }

    return universities;
  }

  async getPrograms(filters?: any) {
    const data = await this.loadData();
    let programs = [...data.programs];

    if (filters?.query) {
      const query = filters.query.toLowerCase();
      programs = programs.filter(program => 
        program.name.toLowerCase().includes(query) ||
        program.universityName.toLowerCase().includes(query)
      );
    }

    if (filters?.level) {
      programs = programs.filter(program => program.level === filters.level);
    }

    if (filters?.region) {
      programs = programs.filter(program => program.universityRegion === filters.region);
    }

    if (filters?.universityId) {
      programs = programs.filter(program => program.universityId === filters.universityId);
    }

    return programs;
  }

  // Update getRequirements to load and merge all requirements files listed in requirements.json
  async getRequirements() {
    const indexRes = await fetch('/data/requirements.json');
    const files: string[] = await indexRes.json();
    let allRequirements: any[] = [];
    for (const file of files) {
      const res = await fetch(`/data/${file}`);
      const reqs = await res.json();
      allRequirements = allRequirements.concat(reqs);
    }
    return allRequirements;
  }

  async getScholarships(universityId?: string) {
    const data = await this.loadData();
    if (universityId) {
      return data.scholarships.filter(sch => sch.universityId === universityId);
    }
    return data.scholarships;
  }

  async compareUniversities(universityIds: string[]) {
    const data = await this.loadData();
    return data.universities.filter(uni => universityIds.includes(uni.id));
  }

  // Additional methods needed by components
  async getUniversitiesByIds(universityIds: string[]) {
    const data = await this.loadData();
    return data.universities.filter(uni => universityIds.includes(uni.id));
  }

  async getUniversityById(universityId: string) {
    const data = await this.loadData();
    const university = data.universities.find(uni => uni.id === universityId);
    if (!university) {
      throw new Error('University not found');
    }
    return university;
  }

  async getProgramsByUniversity(universityId: string) {
    const data = await this.loadData();
    return data.programs.filter(program => program.universityId === universityId);
  }

  async getScholarshipsByUniversity(universityId: string) {
    const data = await this.loadData();
    return data.scholarships.filter(scholarship => scholarship.universityId === universityId);
  }

  async getRequirementsByProgram(programId: string) {
    const data = await this.loadData();
    return data.requirements.filter(req => req.programId === programId);
  }
}

// Singleton instance
export const localDataService = new LocalDataService();

// User preferences storage using localStorage
interface UserPreferences {
  grades?: any;
  favoritePrograms?: string[];
  favoriteUniversities?: string[];
  searchHistory?: string[];
}

class UserPreferencesService {
  private storageKey = 'gh-uni-guide-preferences';

  getPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return {};
    }
  }

  savePreferences(preferences: UserPreferences) {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }

  saveGrades(grades: any) {
    this.savePreferences({ grades });
  }

  getGrades() {
    return this.getPreferences().grades;
  }

  toggleFavoriteProgram(programId: string) {
    const prefs = this.getPreferences();
    const favorites = prefs.favoritePrograms || [];
    
    if (favorites.includes(programId)) {
      const updated = favorites.filter(id => id !== programId);
      this.savePreferences({ favoritePrograms: updated });
      return false;
    } else {
      const updated = [...favorites, programId];
      this.savePreferences({ favoritePrograms: updated });
      return true;
    }
  }

  getFavoritePrograms(): string[] {
    return this.getPreferences().favoritePrograms || [];
  }

  addToSearchHistory(query: string) {
    const prefs = this.getPreferences();
    const history = prefs.searchHistory || [];
    const updated = [query, ...history.filter(q => q !== query)].slice(0, 10); // Keep last 10 searches
    this.savePreferences({ searchHistory: updated });
  }

  getSearchHistory(): string[] {
    return this.getPreferences().searchHistory || [];
  }
}

export const userPrefsService = new UserPreferencesService();
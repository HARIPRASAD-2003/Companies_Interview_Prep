export interface CompanyStats {
  accuracy: number;
  frequency: number;
  tags: string[];
}

export interface Question {
  link: string;
  difficulty: string;
  title: string;
  companyStats: {
    [company: string]: CompanyStats;
  };
}

export interface QuestionsData {
  questions: {
    [id: string]: Question;
  };
}

export interface CompaniesData {
  companies: string[];
}

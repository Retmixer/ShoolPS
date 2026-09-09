export interface Homework {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  deliverables: string;
  hints?: string[];
  attachments?: { title: string; url: string }[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  googleDriveUrl: string;
  homework: Homework;
  resources?: { title: string; url: string }[];
  order: number;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  thumbnail: string;
  level: 'Начинающий' | 'Средний' | 'Продвинутый';
  tags: string[];
  lessons: Lesson[];
  createdAt: string;
}

export interface UserHomeworkSubmission {
  courseId: string;
  lessonId: string;
  completedTasks: number[];
  solutionUrl?: string;
  notes?: string;
  isCompleted: boolean;
  updatedAt: string;
}

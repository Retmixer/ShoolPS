import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, Lesson, Homework, UserHomeworkSubmission } from '../types';
import { INITIAL_COURSES } from '../data/initialCourses';
import {
  generateOtpCode,
  dispatchAdminOtpEmailAsync,
  verifyOtpCodeAsync,
  getCurrentOtpSession,
  clearOtpSession,
  SentEmail,
} from '../utils/emailService';

interface CoursesContextType {
  courses: Course[];
  isAdmin: boolean;
  adminLoginError: string | null;
  loginAdmin: (login: string, pass: string) => boolean;
  validateAdminCredentials: (login: string, pass: string) => { success: boolean; email?: string; error?: string };
  dispatchAdminOtp: (targetEmail: string) => Promise<SentEmail>;
  verifyAdminOtp: (enteredCode: string, targetEmail?: string) => Promise<boolean>;
  latestSentEmail: SentEmail | null;
  logoutAdmin: () => void;
  getCourseById: (id: string) => Course | undefined;
  getCourseBySlug: (slug: string) => Course | undefined;
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => string;
  updateCourse: (id: string, updated: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  clearAllCourses: () => void;
  loadDemoCourses: () => void;
  addLessonToCourse: (courseId: string, lesson: Omit<Lesson, 'id'>) => void;
  updateLesson: (courseId: string, lessonId: string, updated: Partial<Lesson>) => void;
  deleteLesson: (courseId: string, lessonId: string) => void;
  updateHomework: (courseId: string, lessonId: string, homework: Homework) => void;
  resetToInitialData: () => void;
  userSubmissions: Record<string, UserHomeworkSubmission>;
  toggleTaskCompleted: (courseId: string, lessonId: string, taskIndex: number) => void;
  saveSubmission: (courseId: string, lessonId: string, solutionUrl: string, notes: string) => void;
  getSubmission: (courseId: string, lessonId: string) => UserHomeworkSubmission | undefined;
}

const STORAGE_KEY = 'pacesetter_courses_v1';
const SUBMISSIONS_KEY = 'pacesetter_hw_submissions_v1';
const ADMIN_SESSION_KEY = 'pacesetter_admin_authenticated';

const TARGET_ADMIN_EMAIL = 'lazd548@gmail.com';
const TARGET_ADMIN_PASS = 'Ret4680!';

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export const CoursesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      // Clear old cached demo courses if present from v1
      localStorage.removeItem('synapse_it_ai_courses_v1');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load courses from localStorage:', e);
    }
    // Default is clean / empty as requested ("Убери сейчас курсы")
    return [];
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  const [userSubmissions, setUserSubmissions] = useState<Record<string, UserHomeworkSubmission>>(() => {
    try {
      const saved = localStorage.getItem(SUBMISSIONS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [latestSentEmail, setLatestSentEmail] = useState<SentEmail | null>(() => {
    const session = getCurrentOtpSession();
    if (session) {
      return {
        id: `mail-cached`,
        from: 'PaceSetter School Security <security@pacesetter.school>',
        to: session.email,
        subject: `Код подтверждения для входа в панель PaceSetter: ${session.code}`,
        code: session.code,
        timestamp: new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
    }
    return null;
  });

  // Save courses to localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    } catch (e) {
      console.error('Failed to persist courses:', e);
    }
  }, [courses]);

  // Save user submissions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(userSubmissions));
    } catch (e) {
      console.error('Failed to persist submissions:', e);
    }
  }, [userSubmissions]);

  // Validate credentials: Login: "lazd548@gmail.com", Password: "Ret4680!"
  const validateAdminCredentials = (login: string, pass: string): { success: boolean; email?: string; error?: string } => {
    const trimmedLogin = login.trim().toLowerCase();
    const trimmedPass = pass.trim();

    if (!trimmedLogin) {
      const errorMsg = 'Введите адрес электронной почты.';
      setAdminLoginError(errorMsg);
      return { success: false, error: errorMsg };
    }

    if (!trimmedPass) {
      const errorMsg = 'Введите пароль администратора.';
      setAdminLoginError(errorMsg);
      return { success: false, error: errorMsg };
    }

    if (trimmedLogin === TARGET_ADMIN_EMAIL.toLowerCase() && trimmedPass === TARGET_ADMIN_PASS) {
      setAdminLoginError(null);
      return { success: true, email: TARGET_ADMIN_EMAIL };
    } else {
      const errorMsg = 'Неверный email или пароль администратора.';
      setAdminLoginError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Dispatch real OTP email to admin email
  const dispatchAdminOtp = async (targetEmail: string = TARGET_ADMIN_EMAIL): Promise<SentEmail> => {
    const emailRecord = await dispatchAdminOtpEmailAsync(targetEmail);
    setLatestSentEmail(emailRecord);
    return emailRecord;
  };

  // Step 2: Verify OTP code with backend /api/verify-otp or local session
  const verifyAdminOtp = async (enteredCode: string, targetEmail?: string): Promise<boolean> => {
    const session = getCurrentOtpSession();
    const emailToVerify = targetEmail || session?.email || TARGET_ADMIN_EMAIL;
    const cleanEntered = enteredCode.replace(/\s+/g, '').trim();

    const success = await verifyOtpCodeAsync(emailToVerify, cleanEntered);
    if (success) {
      setIsAdmin(true);
      setAdminLoginError(null);
      clearOtpSession();
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } catch {}
      return true;
    } else {
      setAdminLoginError('Неверный проверочный код. Проверьте входящее письмо.');
      return false;
    }
  };

  // Direct login helper
  const loginAdmin = (login: string, pass: string): boolean => {
    const result = validateAdminCredentials(login, pass);
    if (result.success) {
      setIsAdmin(true);
      setAdminLoginError(null);
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } catch {}
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    setAdminLoginError(null);
    clearOtpSession();
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {}
  };

  const getCourseById = (id: string) => courses.find(c => c.id === id);
  const getCourseBySlug = (slug: string) => courses.find(c => c.slug === slug || c.id === slug);

  const addCourse = (courseData: Omit<Course, 'id' | 'createdAt'>): string => {
    const newId = `course-${Date.now()}`;
    const newCourse: Course = {
      ...courseData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      lessons: courseData.lessons || []
    };
    setCourses(prev => [newCourse, ...prev]);
    return newId;
  };

  const updateCourse = (id: string, updated: Partial<Course>) => {
    setCourses(prev => prev.map(course => {
      if (course.id === id) {
        return { ...course, ...updated };
      }
      return course;
    }));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const clearAllCourses = () => {
    setCourses([]);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {}
  };

  const loadDemoCourses = () => {
    setCourses(INITIAL_COURSES);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COURSES));
    } catch {}
  };

  const resetToInitialData = () => {
    setCourses([]);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {}
  };

  const addLessonToCourse = (courseId: string, lessonData: Omit<Lesson, 'id'>) => {
    const lessonId = `lesson-${Date.now()}`;
    const newLesson: Lesson = {
      ...lessonData,
      id: lessonId,
      order: lessonData.order || 1
    };

    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        const updatedLessons = [...course.lessons, newLesson].sort((a, b) => a.order - b.order);
        return { ...course, lessons: updatedLessons };
      }
      return course;
    }));
  };

  const updateLesson = (courseId: string, lessonId: string, updated: Partial<Lesson>) => {
    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        const updatedLessons = course.lessons.map(l => {
          if (l.id === lessonId) {
            return { ...l, ...updated };
          }
          return l;
        }).sort((a, b) => a.order - b.order);
        return { ...course, lessons: updatedLessons };
      }
      return course;
    }));
  };

  const deleteLesson = (courseId: string, lessonId: string) => {
    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        return { ...course, lessons: course.lessons.filter(l => l.id !== lessonId) };
      }
      return course;
    }));
  };

  const updateHomework = (courseId: string, lessonId: string, homework: Homework) => {
    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        const updatedLessons = course.lessons.map(l => {
          if (l.id === lessonId) {
            return { ...l, homework };
          }
          return l;
        });
        return { ...course, lessons: updatedLessons };
      }
      return course;
    }));
  };

  const getSubKey = (courseId: string, lessonId: string) => `${courseId}__${lessonId}`;

  const getSubmission = (courseId: string, lessonId: string) => {
    return userSubmissions[getSubKey(courseId, lessonId)];
  };

  const toggleTaskCompleted = (courseId: string, lessonId: string, taskIndex: number) => {
    const key = getSubKey(courseId, lessonId);
    const existing = userSubmissions[key] || {
      courseId,
      lessonId,
      completedTasks: [],
      solutionUrl: '',
      notes: '',
      isCompleted: false,
      updatedAt: new Date().toISOString()
    };

    const taskSet = new Set(existing.completedTasks);
    if (taskSet.has(taskIndex)) {
      taskSet.delete(taskIndex);
    } else {
      taskSet.add(taskIndex);
    }

    const currentCourse = courses.find(c => c.id === courseId);
    const currentLesson = currentCourse?.lessons.find(l => l.id === lessonId);
    const totalInstructions = currentLesson?.homework?.instructions?.length || 0;
    const completedList = Array.from(taskSet);
    const isCompleted = totalInstructions > 0 && completedList.length === totalInstructions;

    setUserSubmissions(prev => ({
      ...prev,
      [key]: {
        ...existing,
        completedTasks: completedList,
        isCompleted,
        updatedAt: new Date().toISOString()
      }
    }));
  };

  const saveSubmission = (courseId: string, lessonId: string, solutionUrl: string, notes: string) => {
    const key = getSubKey(courseId, lessonId);
    const existing = userSubmissions[key] || {
      courseId,
      lessonId,
      completedTasks: [],
      solutionUrl: '',
      notes: '',
      isCompleted: false,
      updatedAt: new Date().toISOString()
    };

    setUserSubmissions(prev => ({
      ...prev,
      [key]: {
        ...existing,
        solutionUrl,
        notes,
        isCompleted: true,
        updatedAt: new Date().toISOString()
      }
    }));
  };

  return (
    <CoursesContext.Provider
      value={{
        courses,
        isAdmin,
        adminLoginError,
        loginAdmin,
        validateAdminCredentials,
        dispatchAdminOtp,
        verifyAdminOtp,
        latestSentEmail,
        logoutAdmin,
        getCourseById,
        getCourseBySlug,
        addCourse,
        updateCourse,
        deleteCourse,
        clearAllCourses,
        loadDemoCourses,
        addLessonToCourse,
        updateLesson,
        deleteLesson,
        updateHomework,
        resetToInitialData,
        userSubmissions,
        toggleTaskCompleted,
        saveSubmission,
        getSubmission
      }}
    >
      {children}
    </CoursesContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CoursesContext);
  if (!context) {
    throw new Error('useCourses must be used within a CoursesProvider');
  }
  return context;
};

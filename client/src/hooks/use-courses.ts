import { useState, useEffect } from 'react';
import type { Course, Prerequisites } from '@/lib/mock-data';
import rawCourseData from '../../data/course_data_full.json';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadCourses = () => {
      setIsLoading(true);
      setError(null);
      try {
        // Convert the raw JSON data to Course format
        const courseEntries = Object.entries(rawCourseData) as [string, any][];
        const formattedCourses: Course[] = courseEntries.map(([key, courseData]) => {
          // Extract prerequisites - convert to string array format
          const prerequisites: string[] = [];
          if (Array.isArray(courseData.CourseRequisites)) {
            courseData.CourseRequisites.forEach((req: any) => {
              if (req.DisplayText) {
                prerequisites.push(req.DisplayText);
              }
            });
          } else if (courseData.CourseRequisites?.DisplayText) {
            prerequisites.push(courseData.CourseRequisites.DisplayText);
          }

          // Handle semesters offered
          const semesters_offered: string[] = [];
          if (courseData.TermsOffered) {
            // Split terms like "Fall/Spring/Summer" into array
            semesters_offered.push(...courseData.TermsOffered.split('/'));
          }

          return {
            id: key,
            code: key,
            title: courseData.Title || courseData.FullTitleDisplay || key,
            description: courseData.Description || '',
            credits: courseData.MinimumCredits || parseInt(courseData.CreditsCeusDisplay) || 3,
            prerequisites: prerequisites.length > 0 ? prerequisites : {}, // Use empty object if no prerequisites
            semesters_offered: semesters_offered.length > 0 ? semesters_offered : ['Fall', 'Spring'] // Default
          };
        });
        
        setCourses(formattedCourses);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  return { courses, isLoading, error };
}
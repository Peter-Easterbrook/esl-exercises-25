import { db } from '@/config/firebase';
import { Category, Exercise, UserProgress } from '@/types';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

// Category Operations
export const getCategories = async (): Promise<Category[]> => {
  try {
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(query(categoriesRef, orderBy('name')));

    // First, let's see ALL exercises in the database
    console.log('🔍 Fetching ALL exercises from database...');
    const allExercisesRef = collection(db, 'exercises');
    const allExercisesSnapshot = await getDocs(allExercisesRef);
    console.log(
      `📊 Total exercises in database: ${allExercisesSnapshot.docs.length}`
    );
    allExercisesSnapshot.docs.forEach((doc) => {
      console.log(
        `   - ID: ${doc.id}, Title: "${doc.data().title}", category field: "${
          doc.data().category
        }"`
      );
    });

    const categories: Category[] = [];
    for (const categoryDoc of snapshot.docs) {
      const categoryData = categoryDoc.data();

      console.log(
        `\n📁 Loading category: ${categoryData.name} (ID: ${categoryDoc.id})`
      );

      // Get exercises for this category
      const exercisesRef = collection(db, 'exercises');
      const exercisesSnapshot = await getDocs(
        query(exercisesRef, where('category', '==', categoryDoc.id))
      );

      console.log(
        `   Found ${exercisesSnapshot.docs.length} exercises matching this category ID`
      );
      exercisesSnapshot.docs.forEach((doc) => {
        console.log(
          `   - ${doc.data().title} (category field: ${doc.data().category})`
        );
      });

      const exercises: Exercise[] = exercisesSnapshot.docs.map(
        (exerciseDoc) => ({
          id: exerciseDoc.id,
          ...exerciseDoc.data(),
          createdAt: exerciseDoc.data().createdAt?.toDate() || new Date(),
          updatedAt: exerciseDoc.data().updatedAt?.toDate() || new Date(),
        })
      ) as Exercise[];

      categories.push({
        id: categoryDoc.id,
        ...categoryData,
        exercises,
      } as Category);
    }

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const createCategory = async (
  category: Omit<Category, 'id' | 'exercises'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'categories'), category);
    return docRef.id;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Exercise Operations
export const getExerciseById = async (
  exerciseId: string
): Promise<Exercise | null> => {
  try {
    const exerciseDoc = await getDoc(doc(db, 'exercises', exerciseId));
    if (!exerciseDoc.exists()) {
      return null;
    }

    const data = exerciseDoc.data();
    return {
      id: exerciseDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Exercise;
  } catch (error) {
    console.error('Error fetching exercise:', error);
    throw error;
  }
};

export const getExercisesByCategory = async (
  categoryId: string
): Promise<Exercise[]> => {
  try {
    const exercisesRef = collection(db, 'exercises');
    const snapshot = await getDocs(
      query(exercisesRef, where('category', '==', categoryId), orderBy('title'))
    );

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Exercise[];
  } catch (error) {
    console.error('Error fetching exercises by category:', error);
    throw error;
  }
};

export const createExercise = async (
  exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'exercises'), {
      ...exercise,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating exercise:', error);
    throw error;
  }
};

export const updateExercise = async (
  exerciseId: string,
  updates: Partial<Exercise>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'exercises', exerciseId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating exercise:', error);
    throw error;
  }
};

export const deleteExercise = async (exerciseId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'exercises', exerciseId));
  } catch (error) {
    console.error('Error deleting exercise:', error);
    throw error;
  }
};

// User Progress Operations
export const getUserProgress = async (
  userId: string
): Promise<UserProgress[]> => {
  try {
    const progressRef = collection(db, 'userProgress');
    const snapshot = await getDocs(
      query(progressRef, where('userId', '==', userId))
    );

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        exerciseId: data.exerciseId,
        completed: data.completed,
        score: data.score,
        completedAt: data.completedAt?.toDate(),
      } as UserProgress;
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
};

export const updateUserProgress = async (
  userId: string,
  exerciseId: string,
  progress: { completed: boolean; score?: number }
): Promise<void> => {
  try {
    const progressRef = collection(db, 'userProgress');
    const existingQuery = query(
      progressRef,
      where('userId', '==', userId),
      where('exerciseId', '==', exerciseId)
    );
    const existingSnapshot = await getDocs(existingQuery);

    const progressData = {
      userId,
      exerciseId,
      ...progress,
      completedAt: progress.completed ? Timestamp.now() : null,
    };

    if (existingSnapshot.empty) {
      // Create new progress record
      await addDoc(progressRef, progressData);
    } else {
      // Update existing record
      const existingDoc = existingSnapshot.docs[0];
      await updateDoc(existingDoc.ref, progressData);
    }
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};

// Admin Statistics
export const getAdminStats = async () => {
  try {
    const [exercisesSnapshot, usersSnapshot, categoriesSnapshot] =
      await Promise.all([
        getDocs(collection(db, 'exercises')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'categories')),
      ]);

    const totalExercises = exercisesSnapshot.size;
    const totalUsers = usersSnapshot.size;
    const totalCategories = categoriesSnapshot.size;

    // Get exercises added this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const exercisesThisMonth = exercisesSnapshot.docs.filter((doc) => {
      const createdAt = doc.data().createdAt?.toDate();
      return createdAt && createdAt >= startOfMonth;
    }).length;

    // Get active users (users with progress in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const progressSnapshot = await getDocs(
      query(
        collection(db, 'userProgress'),
        where('completedAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
      )
    );

    const activeUserIds = new Set(
      progressSnapshot.docs.map((doc) => doc.data().userId)
    );

    return {
      totalExercises,
      totalUsers,
      totalCategories,
      exercisesAddedThisMonth: exercisesThisMonth,
      activeUsers: activeUserIds.size,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

// Get detailed user progress statistics
export const getUserProgressStats = async (userId: string) => {
  try {
    // Get all user progress
    const userProgressData = await getUserProgress(userId);

    // Get all exercises and categories
    const [exercisesSnapshot, categoriesData] = await Promise.all([
      getDocs(collection(db, 'exercises')),
      getCategories(),
    ]);

    const allExercises = exercisesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    // Calculate overall stats
    const completedExercises = userProgressData.filter(
      (p) => p.completed
    ).length;
    const totalExercises = allExercises.length;

    const scores = userProgressData
      .filter((p) => p.score !== undefined)
      .map((p) => p.score!);
    const averageScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, score) => sum + score, 0) / scores.length
          )
        : 0;

    // Calculate streak (consecutive days with completed exercises)
    const completedDates = userProgressData
      .filter((p) => p.completed && p.completedAt)
      .map((p) => {
        const date = p.completedAt!;
        return new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        ).getTime();
      })
      .sort((a, b) => b - a); // Sort descending (most recent first)

    let streak = 0;
    if (completedDates.length > 0) {
      const today = new Date();
      const todayTimestamp = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ).getTime();
      const yesterday = todayTimestamp - 86400000;

      let currentDate = completedDates.includes(todayTimestamp)
        ? todayTimestamp
        : yesterday;

      for (const dateTimestamp of [...new Set(completedDates)]) {
        if (dateTimestamp === currentDate) {
          streak++;
          currentDate -= 86400000; // Move to previous day
        } else if (dateTimestamp < currentDate) {
          break;
        }
      }
    }

    // Calculate category-specific stats
    const categoryStats = categoriesData.map((category) => {
      const categoryExercises = allExercises.filter(
        (ex: any) => ex.category === category.id
      );
      const categoryProgress = userProgressData.filter((p) => {
        const exercise = allExercises.find((ex: any) => ex.id === p.exerciseId);
        return exercise && (exercise as any).category === category.id;
      });

      const completed = categoryProgress.filter((p) => p.completed).length;
      const categoryScores = categoryProgress
        .filter((p) => p.score !== undefined)
        .map((p) => p.score!);
      const avgScore =
        categoryScores.length > 0
          ? Math.round(
              categoryScores.reduce((sum, score) => sum + score, 0) /
                categoryScores.length
            )
          : 0;

      return {
        name: category.name,
        completed,
        total: categoryExercises.length,
        avgScore,
      };
    });

    // Get recent activity (last 10 completed exercises)
    const recentActivity = userProgressData
      .filter((p) => p.completed && p.completedAt)
      .sort((a, b) => {
        const dateA = a.completedAt?.getTime() || 0;
        const dateB = b.completedAt?.getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 10)
      .map((progress) => {
        const exercise = allExercises.find(
          (ex: any) => ex.id === progress.exerciseId
        );
        return {
          exerciseTitle: (exercise as any)?.title || 'Unknown Exercise',
          score: progress.score || 0,
          completedAt: progress.completedAt!,
          success: (progress.score || 0) >= 60,
        };
      });

    return {
      completedExercises,
      totalExercises,
      averageScore,
      streak,
      categories: categoryStats,
      recentActivity,
    };
  } catch (error) {
    console.error('Error fetching user progress stats:', error);
    throw error;
  }
};

// Initialize default data (call this once to seed the database)
export const initializeDefaultData = async (): Promise<void> => {
  try {
    // Check if categories already exist
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    if (!categoriesSnapshot.empty) {
      console.log('Default data already exists');
      return;
    }

    // Create default categories
    const defaultCategories = [
      {
        name: 'Tenses',
        description: 'Learn and practice different English tenses',
        icon: 'clock',
      },
      {
        name: 'Grammar',
        description: 'Master English grammar rules and structures',
        icon: 'book',
      },
      {
        name: 'Vocabulary',
        description: 'Expand your English vocabulary',
        icon: 'text.bubble',
      },
      {
        name: 'Reading Comprehension',
        description: 'Improve reading skills and understanding',
        icon: 'doc.text',
      },
      {
        name: 'Find the Mistake',
        description: 'Identify and correct common English errors',
        icon: 'exclamationmark.circle',
      },
      {
        name: 'Listening Skills',
        description: 'Enhance your English listening abilities',
        icon: 'ear',
      },
    ];

    const categoryIds: string[] = [];
    for (const category of defaultCategories) {
      const docRef = await addDoc(collection(db, 'categories'), category);
      categoryIds.push(docRef.id);
    }

    // Create sample exercises for the first category (Tenses)
    const sampleExercises = [
      {
        title: 'Present Simple Tense',
        description: 'Learn the basics of present simple tense',
        instructions: `Welcome to the Present Simple Tense exercise!

**Instructions:**
1. Read each question carefully
2. Choose the correct answer from the multiple choices
3. You can review your answers before submitting
4. After completing, you'll see your score and explanations

**Present Simple Tense Rules:**
- For I, you, we, they: use the base form of the verb
- For he, she, it: add -s or -es to the verb
- Example: "I work" but "She works"

**Tips:**
- Pay attention to the subject of the sentence
- Remember irregular verbs like "have/has" and "be/is/are"

Ready to begin? Tap "Start Exercise" below!`,
        content: {
          type: 'multiple-choice' as const,
          questions: [
            {
              id: '1',
              question: 'She ___ to work every day.',
              options: ['go', 'goes', 'going', 'gone'],
              correctAnswer: 'goes',
              explanation:
                'For third person singular (she/he/it), we add -s to the verb.',
            },
            {
              id: '2',
              question: 'They ___ in London.',
              options: ['live', 'lives', 'living', 'lived'],
              correctAnswer: 'live',
              explanation:
                'For plural subjects (they), we use the base form of the verb.',
            },
            {
              id: '3',
              question: 'He ___ coffee every morning.',
              options: ['drink', 'drinks', 'drinking', 'drank'],
              correctAnswer: 'drinks',
              explanation:
                'For third person singular (he), we add -s to the verb.',
            },
          ],
        },
        category: categoryIds[0], // Tenses category
        difficulty: 'beginner' as const,
      },
      {
        title: 'Past Simple Tense',
        description: 'Practice past simple tense forms',
        instructions: 'Choose the correct past simple form of the verb.',
        content: {
          type: 'multiple-choice' as const,
          questions: [
            {
              id: '1',
              question: 'They ___ to the party yesterday.',
              options: ['go', 'went', 'goes', 'going'],
              correctAnswer: 'went',
              explanation: 'Past simple of "go" is "went".',
            },
            {
              id: '2',
              question: 'I ___ my homework last night.',
              options: ['do', 'did', 'done', 'doing'],
              correctAnswer: 'did',
              explanation: 'Past simple of "do" is "did".',
            },
          ],
        },
        category: categoryIds[0], // Tenses category
        difficulty: 'beginner' as const,
      },
    ];

    for (const exercise of sampleExercises) {
      await createExercise(exercise);
    }

    console.log('Default data initialized successfully');
  } catch (error) {
    console.error('Error initializing default data:', error);
    throw error;
  }
};

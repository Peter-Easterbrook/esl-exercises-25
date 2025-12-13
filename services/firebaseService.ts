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
  setDoc,
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

export const getAllExercises = async (): Promise<Exercise[]> => {
  try {
    const exercisesRef = collection(db, 'exercises');
    const snapshot = await getDocs(query(exercisesRef, orderBy('title')));

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Exercise[];
  } catch (error) {
    console.error('Error fetching all exercises:', error);
    throw error;
  }
};

export const createExercise = async (
  exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    console.log('🔥 Firebase: Attempting to create exercise...');
    console.log('🔥 Firebase: Exercise data:', exercise);

    const now = Timestamp.now();
    const exerciseData = {
      ...exercise,
      createdAt: now,
      updatedAt: now,
    };

    console.log('🔥 Firebase: Adding document to collection...');
    const docRef = await addDoc(collection(db, 'exercises'), exerciseData);

    console.log('🔥 Firebase: Document created with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('🔥 Firebase: Error creating exercise:', error);
    console.error('🔥 Firebase: Error code:', error?.code);
    console.error('🔥 Firebase: Error message:', error?.message);
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
        icon: 'textformat',
      },
      {
        name: 'Language Skills',
        description: 'Develop comprehensive English language abilities',
        icon: 'person.2.wave',
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

// User Management Operations

// Update user display name
export const updateUserDisplayName = async (
  userId: string,
  displayName: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      displayName,
    });
  } catch (error) {
    console.error('Error updating user display name:', error);
    throw error;
  }
};

// Update user language preference
export const updateUserLanguagePreference = async (
  userId: string,
  preferredLanguage: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      preferredLanguage,
    });
  } catch (error) {
    console.error('Error updating user language preference:', error);
    throw error;
  }
};

// Delete all user progress data
export const deleteAllUserProgress = async (userId: string): Promise<void> => {
  try {
    const progressRef = collection(db, 'userProgress');
    const userProgressQuery = query(progressRef, where('userId', '==', userId));
    const snapshot = await getDocs(userProgressQuery);

    // Delete all progress documents for this user
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    console.log(
      `Deleted ${snapshot.docs.length} progress records for user ${userId}`
    );
  } catch (error) {
    console.error('Error deleting user progress:', error);
    throw error;
  }
};

// Delete user account and all associated data
export const deleteUserAccount = async (userId: string): Promise<void> => {
  try {
    // Delete all user progress first
    await deleteAllUserProgress(userId);

    // Delete user document
    await deleteDoc(doc(db, 'users', userId));

    console.log(`Deleted user account and all data for user ${userId}`);
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};

// Get all users from Firestore
// For small user bases, load all and filter client-side
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(query(usersRef, orderBy('email')));

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || '',
        displayName: data.displayName,
        isAdmin: data.isAdmin || false,
        createdAt: data.createdAt?.toDate(),
      };
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

// Get user by ID with full details
export const getUserById = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();
    return {
      id: userDoc.id,
      email: data.email || '',
      displayName: data.displayName,
      isAdmin: data.isAdmin || false,
      createdAt: data.createdAt?.toDate(),
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Search users by email or display name (client-side filtering)
// Simpler approach that works without compound indexes
export const searchUsers = async (searchQuery: string) => {
  try {
    const allUsers = await getAllUsers();

    if (!searchQuery.trim()) {
      return allUsers;
    }

    const searchLower = searchQuery.toLowerCase();

    return allUsers.filter(
      (user) =>
        user.email.toLowerCase().includes(searchLower) ||
        (user.displayName?.toLowerCase() || '').includes(searchLower)
    );
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Analytics Operations
export const getAnalyticsData = async () => {
  try {
    // Get all exercises
    const exercisesSnapshot = await getDocs(collection(db, 'exercises'));
    const exercises = exercisesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        ...data,
      };
    }) as Exercise[];

    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get all progress records from the userProgress collection
    const progressSnapshot = await getDocs(collection(db, 'userProgress'));
    const progressData = progressSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        exerciseId: data.exerciseId,
        completed: data.completed,
        score: data.score,
        completedAt: data.completedAt?.toDate?.() || null,
      };
    });

    // Calculate analytics
    const totalCompletions = progressData.filter((p) => p.completed).length;
    const averageScore =
      progressData.length > 0
        ? progressData.reduce((sum, p) => sum + (p.score || 0), 0) /
          progressData.length
        : 0;

    // Get categories for proper names
    const categoriesData = await getCategories();

    // Category performance
    const categoryStats: { [key: string]: { name: string; count: number } } =
      {};
    progressData.forEach((progress) => {
      const exercise = exercises.find((e) => e.id === progress.exerciseId);
      if (exercise?.category) {
        const category = categoriesData.find((c) => c.id === exercise.category);
        const categoryName = category?.name || exercise.category;
        if (!categoryStats[exercise.category]) {
          categoryStats[exercise.category] = { name: categoryName, count: 0 };
        }
        categoryStats[exercise.category].count++;
      }
    });

    // Difficulty distribution
    const difficultyStats: { [key: string]: number } = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
    };
    progressData.forEach((progress) => {
      const exercise = exercises.find((e) => e.id === progress.exerciseId);
      if (exercise?.difficulty) {
        difficultyStats[exercise.difficulty]++;
      }
    });

    // Top exercises by completion count
    const exerciseCompletions: { [key: string]: number } = {};
    progressData.forEach((progress) => {
      if (progress.completed) {
        exerciseCompletions[progress.exerciseId] =
          (exerciseCompletions[progress.exerciseId] || 0) + 1;
      }
    });
    const topExercises = Object.entries(exerciseCompletions)
      .map(([exerciseId, count]) => {
        const exercise = exercises.find((e) => e.id === exerciseId);
        return {
          title: exercise?.title || 'Unknown Exercise',
          completions: count,
        };
      })
      .sort((a, b) => b.completions - a.completions)
      .slice(0, 5);

    // User activity trend (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const dailyActivity: { [key: string]: Set<string> } = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Initialize all 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      const dateKey = date.toDateString();
      dailyActivity[dateKey] = new Set();
    }

    // Count unique active users per day
    progressData.forEach((progress) => {
      if (progress.completedAt instanceof Date && progress.completed) {
        const completedDate = progress.completedAt;
        if (completedDate >= sevenDaysAgo) {
          const dateKey = completedDate.toDateString();
          if (dailyActivity[dateKey]) {
            dailyActivity[dateKey].add(progress.userId);
          }
        }
      }
    });

    const userActivityTrend = Object.keys(dailyActivity)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map((dateKey) => {
        const date = new Date(dateKey);
        return {
          day: dayNames[date.getDay()],
          users: dailyActivity[dateKey].size,
        };
      });

    // Recent activity (last 10 completions)
    const recentActivity = progressData
      .filter((p) => p.completed && p.completedAt instanceof Date)
      .sort((a, b) => {
        const timeA =
          a.completedAt instanceof Date ? a.completedAt.getTime() : 0;
        const timeB =
          b.completedAt instanceof Date ? b.completedAt.getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 10)
      .map((progress) => {
        const exercise = exercises.find((e) => e.id === progress.exerciseId);
        const user = users.find((u: any) => u.id === progress.userId);
        const completedAt = progress.completedAt as Date;
        const now = new Date();
        const diffMs = now.getTime() - completedAt.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        let timeAgo = '';
        if (diffDays > 0) {
          timeAgo = `${diffDays}d ago`;
        } else if (diffHours > 0) {
          timeAgo = `${diffHours}h ago`;
        } else {
          const diffMins = Math.floor(diffMs / (1000 * 60));
          timeAgo = diffMins > 0 ? `${diffMins}m ago` : 'Just now';
        }

        return {
          user:
            (user as any)?.displayName ||
            (user as any)?.email?.split('@')[0] ||
            'Anonymous',
          exercise: exercise?.title || 'Unknown Exercise',
          score: progress.score || 0,
          date: timeAgo,
        };
      });

    return {
      totalCompletions,
      averageScore: Math.round(averageScore * 10) / 10,
      completionRate:
        exercises.length > 0 && users.length > 0
          ? Math.round(
              (totalCompletions / (exercises.length * users.length)) * 100
            )
          : 0,
      categoryPerformance: Object.values(categoryStats)
        .map((cat) => ({
          name: cat.name,
          count: cat.count,
          percentage:
            totalCompletions > 0
              ? Math.round((cat.count / totalCompletions) * 1000) / 10
              : 0,
        }))
        .sort((a, b) => b.count - a.count),
      difficultyDistribution: Object.entries(difficultyStats).map(
        ([name, count]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          count,
          color:
            name === 'beginner'
              ? '#07b524'
              : name === 'intermediate'
              ? '#FF9800'
              : '#6f0202',
        })
      ),
      userActivityTrend,
      topExercises,
      recentActivity,
    };
  } catch (error) {
    console.error('Error getting analytics data:', error);
    throw error;
  }
};

// App Settings Management
export interface AppSettings {
  exerciseSettings: {
    defaultTimeLimit: number; // in minutes
    showSolutionsImmediately: boolean;
    enablePointsSystem: boolean;
  };
  userManagement: {
    allowNewRegistrations: boolean;
    requireEmailVerification: boolean;
  };
  notifications: {
    enablePushNotifications: boolean;
    dailyReminderTime: string; // HH:MM format
  };
  admin: {
    maintenanceMode: boolean;
    announcementBanner: string;
  };
}

// Get app settings
export const getAppSettings = async (): Promise<AppSettings> => {
  try {
    const settingsDoc = await getDoc(doc(db, 'appSettings', 'config'));

    if (settingsDoc.exists()) {
      return settingsDoc.data() as AppSettings;
    } else {
      // Return default settings if none exist
      const defaultSettings: AppSettings = {
        exerciseSettings: {
          defaultTimeLimit: 30,
          showSolutionsImmediately: false,
          enablePointsSystem: true,
        },
        userManagement: {
          allowNewRegistrations: true,
          requireEmailVerification: false,
        },
        notifications: {
          enablePushNotifications: true,
          dailyReminderTime: '09:00',
        },
        admin: {
          maintenanceMode: false,
          announcementBanner: '',
        },
      };

      // Create default settings
      await setDoc(doc(db, 'appSettings', 'config'), defaultSettings);
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error getting app settings:', error);
    throw error;
  }
};

// Update app settings
export const updateAppSettings = async (
  settings: Partial<AppSettings>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'appSettings', 'config'), settings);
  } catch (error) {
    console.error('Error updating app settings:', error);
    throw error;
  }
};

// Reset app settings to defaults
export const resetAppSettings = async (): Promise<void> => {
  try {
    const defaultSettings: AppSettings = {
      exerciseSettings: {
        defaultTimeLimit: 30,
        showSolutionsImmediately: false,
        enablePointsSystem: true,
      },
      userManagement: {
        allowNewRegistrations: true,
        requireEmailVerification: false,
      },
      notifications: {
        enablePushNotifications: true,
        dailyReminderTime: '09:00',
      },
      admin: {
        maintenanceMode: false,
        announcementBanner: '',
      },
    };

    await setDoc(doc(db, 'appSettings', 'config'), defaultSettings);
  } catch (error) {
    console.error('Error resetting app settings:', error);
    throw error;
  }
};

// Admin Utility Functions for Category Management

// Add a new Grammar category to Firebase
export const addGrammarCategory = async (): Promise<string> => {
  try {
    const grammarCategory = {
      name: 'Grammar',
      description: 'Master English grammar rules and structures',
      icon: 'textformat',
    };

    const docRef = await addDoc(collection(db, 'categories'), grammarCategory);
    console.log('Grammar category created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating Grammar category:', error);
    throw error;
  }
};

// Update an existing category's icon
export const updateCategoryIcon = async (
  categoryId: string,
  newIcon: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'categories', categoryId), {
      icon: newIcon,
    });
    console.log(`Category ${categoryId} icon updated to ${newIcon}`);
  } catch (error) {
    console.error('Error updating category icon:', error);
    throw error;
  }
};

// Update an existing category's details
export const updateCategory = async (
  categoryId: string,
  updates: { name?: string; description?: string; icon?: string }
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'categories', categoryId), updates);
    console.log(`Category ${categoryId} updated successfully`);
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

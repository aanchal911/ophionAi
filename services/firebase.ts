
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, 
  query, orderBy, serverTimestamp, where, getDocs 
} from 'firebase/firestore';
import { Task, Note, User } from '../types';

// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================

const firebaseConfig = {
  apiKey: "AIzaSyDjQvAhMbqhMkmu8z101g1ARWH4T9zR9yk",
  authDomain: "ophionai.firebaseapp.com",
  projectId: "ophionai",
  storageBucket: "ophionai.firebasestorage.app",
  messagingSenderId: "41091858434",
  appId: "1:41091858434:web:6236e0cb0df3be8888a71b",
  measurementId: "G-XSLJVF2VVC"
};

// Export this flag to show a warning in the UI if keys are missing
export const isFirebaseConfigured = true;

let db: any;
let initError: Error | null = null;

try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("✅ Firebase initialized successfully");
} catch (error: any) {
    console.warn("❌ Firebase initialization error:", error);
    initError = error;
}

// ============================================================================
// CUSTOM AUTHENTICATION (Name Only -> Firestore)
// ============================================================================

export const loginCustom = async (name: string): Promise<{ user: User | null, error?: string }> => {
    if (initError) return { user: null, error: `Firebase Error: ${initError.message}` };
    if (!db) return { user: null, error: "Database not connected." };

    try {
        // Simple sanitization
        const cleanName = name.trim();
        const usersRef = collection(db, 'users');
        
        // Check if user with this name already exists
        const q = query(usersRef, where('name', '==', cleanName));
        const querySnapshot = await getDocs(q);

        let user: User;

        if (!querySnapshot.empty) {
            // User exists, log them in
            const docData = querySnapshot.docs[0];
            const data = docData.data();
            user = {
                uid: docData.id,
                displayName: data.name,
                email: null, // No email used
                photoURL: null
            };
            console.log("Welcome back:", user.displayName);
        } else {
            // Create new user
            const newUserRef = await addDoc(usersRef, {
                name: cleanName,
                createdAt: serverTimestamp()
            });
            
            user = {
                uid: newUserRef.id,
                displayName: cleanName,
                email: null,
                photoURL: null
            };
            console.log("New user created:", user.displayName);
        }

        // Save session locally
        localStorage.setItem('ophion_user', JSON.stringify(user));
        return { user };

    } catch (error: any) {
        console.error("Login Error:", error);
        return { user: null, error: "Failed to connect to database. Check your internet." };
    }
};

export const logout = async () => {
    localStorage.removeItem('ophion_user');
    window.location.reload(); // Simple reload to clear state
};

export const checkSession = (): User | null => {
    const stored = localStorage.getItem('ophion_user');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            return null;
        }
    }
    return null;
};

// ============================================================================
// DATABASE (USER SCOPED)
// ============================================================================

// --- TASKS ---

export const subscribeToTasks = (userId: string, callback: (tasks: Task[]) => void) => {
    if (!db) return () => {};
    
    // Filter by User ID
    const q = query(
        collection(db, 'tasks'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Task[];
        callback(tasks);
    }, (error) => {
        console.error("Error subscribing to tasks:", error);
    });

    return unsubscribe;
};

export const addTaskToDb = async (task: Omit<Task, 'id'>) => {
    if (!db) return;
    try {
        const docRef = await addDoc(collection(db, 'tasks'), {
            ...task,
            createdAt: serverTimestamp()
        });
        console.log("✅ Task saved to Firebase! Document ID:", docRef.id);
    } catch (e) {
        console.error("Error adding task: ", e);
    }
};

export const updateTaskInDb = async (task: Task) => {
    if (!db) return;
    try {
        const { id, ...data } = task;
        const taskRef = doc(db, 'tasks', id);
        await updateDoc(taskRef, data);
    } catch (e) {
        console.error("Error updating task: ", e);
    }
};

export const deleteTaskFromDb = async (id: string) => {
    if (!db) return;
    try {
        await deleteDoc(doc(db, 'tasks', id));
    } catch (e) {
        console.error("Error deleting task: ", e);
    }
};

// --- NOTES (STICKY BOARD) ---

export const subscribeToNotes = (userId: string, callback: (notes: Note[]) => void) => {
    if (!db) return () => {};
    
    const q = query(
        collection(db, 'notes'),
        where('userId', '==', userId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const notes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Note[];
        callback(notes);
    }, (error) => {
         console.error("Error subscribing to notes:", error);
    });

    return unsubscribe;
};

export const addNoteToDb = async (note: Omit<Note, 'id'>) => {
    if (!db) return;
    try {
        const docRef = await addDoc(collection(db, 'notes'), {
            ...note,
            createdAt: serverTimestamp()
        });
        console.log("✅ Sticky Note saved:", docRef.id);
    } catch (e) {
        console.error("Error adding note: ", e);
    }
};

export const updateNoteInDb = async (note: Note) => {
    if (!db) return;
    try {
        const { id, ...data } = note;
        const noteRef = doc(db, 'notes', id);
        await updateDoc(noteRef, data);
    } catch (e) {
        console.error("Error updating note: ", e);
    }
};

export const deleteNoteFromDb = async (id: string) => {
    if (!db) return;
    try {
        await deleteDoc(doc(db, 'notes', id));
    } catch (e) {
        console.error("Error deleting note: ", e);
    }
};

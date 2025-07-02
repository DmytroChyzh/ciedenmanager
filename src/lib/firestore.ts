import { db } from './firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  increment,
} from 'firebase/firestore';

interface Message {
  text: string;
  sender: string;
  [key: string]: any;
}

interface Project {
  title: string;
  description: string;
  status: string;
  [key: string]: any;
}

export interface ChatSession {
  id: string;
  metadata: {
    sessionId: string;
    userId: string;
    userName: string;
    userEmail: string;
    status: 'active' | 'completed' | 'archived';
    startedAt: any;
    completedAt?: any;
    totalMessages: number;
    lastActivity: any;
  };
  messages: Message[];
  projectCard?: {
    title?: string;
    description?: string;
    type?: string;
    budget?: number;
    [key: string]: any;
  };
  createdAt: any;
  updatedAt: any;
}

export async function saveChat(projectId: string, message: Message) {
  try {
    const docRef = await addDoc(collection(db, 'messages'), {
      ...message,
      projectId,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
}

export async function createProject(userId: string, data: Project) {
  try {
    const docRef = await addDoc(collection(db, 'projects'), {
      userId,
      ...data,
      createdAt: serverTimestamp(),
      status: 'new', // Default status for new projects
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

export async function getProjects() {
  try {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting projects:', error);
    throw error;
  }
}

// Нові функції для роботи з chatSessions
export async function getChatSessions() {
  try {
    const q = query(collection(db, 'chatSessions'), orderBy('metadata.lastActivity', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatSession[];
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    throw error;
  }
}

export function subscribeToChatSessions(callback: (sessions: ChatSession[]) => void) {
  console.log('🔍 Створюємо підписку на chatSessions...');
  const q = query(collection(db, 'chatSessions'), orderBy('metadata.lastActivity', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    console.log('📊 Отримано snapshot з Firestore:', snapshot.size, 'документів');
    const sessions = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('📄 Документ:', doc.id, data);
      return {
        id: doc.id,
        ...data,
      } as ChatSession;
    });
    
    console.log('✅ Відправляємо сесії в callback:', sessions.length);
    callback(sessions);
  }, (error) => {
    console.error('❌ Помилка підписки на chatSessions:', error);
  });
}

export async function getChatSessionById(sessionId: string): Promise<ChatSession | null> {
  try {
    const docRef = doc(db, 'chatSessions', sessionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as ChatSession;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting chat session:', error);
    throw error;
  }
}

export async function updateChatSessionStatus(sessionId: string, status: 'active' | 'completed' | 'archived') {
  try {
    const docRef = doc(db, 'chatSessions', sessionId);
    await updateDoc(docRef, {
      'metadata.status': status,
      'metadata.lastActivity': serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating chat session status:', error);
    throw error;
  }
}

// Функція для створення нової чат-сесії
export async function createChatSession(userData: {
  userName: string;
  userEmail: string;
  userId: string;
}, projectCard?: {
  title?: string;
  description?: string;
  type?: string;
  budget?: number;
}) {
  try {
    console.log('🚀 Створюємо нову чат-сесію для:', userData);
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    const sessionData = {
      metadata: {
        sessionId,
        userId: userData.userId,
        userName: userData.userName,
        userEmail: userData.userEmail,
        status: 'active' as const,
        startedAt: serverTimestamp(),
        totalMessages: 0,
        lastActivity: serverTimestamp(),
      },
      messages: [],
      projectCard,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log('📝 Дані сесії:', sessionData);
    const docRef = await addDoc(collection(db, 'chatSessions'), sessionData);
    console.log('✅ Сесія створена з ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Помилка створення сесії:', error);
    throw error;
  }
}

// Функція для додавання повідомлення до сесії
export async function addMessageToSession(sessionId: string, message: {
  text: string;
  sender: 'user' | 'assistant' | 'manager';
  timestamp?: any;
}) {
  try {
    const docRef = doc(db, 'chatSessions', sessionId);
    const messageData = {
      ...message,
      timestamp: message.timestamp || serverTimestamp(),
    };
    
    await updateDoc(docRef, {
      messages: arrayUnion(messageData),
      'metadata.totalMessages': increment(1),
      'metadata.lastActivity': serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding message to session:', error);
    throw error;
  }
}

// Функція для міграції існуючих чатів (опціонально)
export async function migrateExistingChats() {
  try {
    const chatsSnapshot = await getDocs(collection(db, 'chats'));
    
    for (const chatDoc of chatsSnapshot.docs) {
      const chatData = chatDoc.data();
      
      // Створюємо нову сесію
      const sessionId = await createChatSession({
        userName: chatData.contact?.name || 'Невідомий клієнт',
        userEmail: chatData.contact?.email || 'no-email@example.com',
        userId: chatData.contact?.email || 'unknown',
      }, chatData.projectCard);

      // Мігруємо повідомлення
      if (chatData.messages && Array.isArray(chatData.messages)) {
        for (const msg of chatData.messages) {
          await addMessageToSession(sessionId, {
            text: msg.content || msg.text || '',
            sender: msg.role === 'user' ? 'user' : 
                   msg.role === 'manager' ? 'manager' : 'assistant',
            timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
          });
        }
      }
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
} 
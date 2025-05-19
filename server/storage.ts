import { db } from './db';
import { 
  users, tasks, sessions, goals, notes, settings,
  type User, type InsertUser, 
  type Task, type InsertTask,
  type Session, type InsertSession,
  type Goal, type InsertGoal,
  type Note, type InsertNote,
  type Settings, type InsertSettings
} from "@shared/schema";
import { eq, desc } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task operations
  getTasks(userId: number): Promise<Task[]>;
  getTaskById(taskId: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(taskId: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(taskId: number): Promise<boolean>;
  
  // Session operations
  getSessions(userId: number): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  
  // Goal operations
  getGoals(userId: number): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(goalId: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(goalId: number): Promise<boolean>;
  
  // Note operations
  getNotes(userId: number): Promise<Note[]>;
  getNote(userId: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(noteId: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  
  // Settings operations
  getSettings(userId: number): Promise<Settings | undefined>;
  createSettings(setting: InsertSettings): Promise<Settings>;
  updateSettings(userId: number, setting: Partial<InsertSettings>): Promise<Settings | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        username: insertUser.username,
        password: hashedPassword,
      })
      .returning();
    return user;
  }
  
  // Task operations
  async getTasks(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.created));
  }
  
  async getTaskById(taskId: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    return task;
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }
  
  async updateTask(taskId: number, updateTask: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({
        ...updateTask,
        updated: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();
    return task;
  }
  
  async deleteTask(taskId: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, taskId));
    return true;
  }
  
  // Session operations
  async getSessions(userId: number): Promise<Session[]> {
    return await db.select().from(sessions).where(eq(sessions.userId, userId)).orderBy(desc(sessions.timestamp));
  }
  
  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values(insertSession)
      .returning();
    return session;
  }
  
  // Goal operations
  async getGoals(userId: number): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.created));
  }
  
  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db
      .insert(goals)
      .values(insertGoal)
      .returning();
    return goal;
  }
  
  async updateGoal(goalId: number, updateGoal: Partial<InsertGoal>): Promise<Goal | undefined> {
    const updates: any = { ...updateGoal };
    
    if (updateGoal.completed === true) {
      updates.completedAt = new Date();
    } else if (updateGoal.completed === false) {
      updates.completedAt = null;
    }
    
    const [goal] = await db
      .update(goals)
      .set(updates)
      .where(eq(goals.id, goalId))
      .returning();
    return goal;
  }
  
  async deleteGoal(goalId: number): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, goalId));
    return true;
  }
  
  // Note operations
  async getNotes(userId: number): Promise<Note[]> {
    return await db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.lastEdited));
  }
  
  async getNote(userId: number): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.userId, userId));
    return note;
  }
  
  async createNote(insertNote: InsertNote): Promise<Note> {
    const [note] = await db
      .insert(notes)
      .values(insertNote)
      .returning();
    return note;
  }
  
  async updateNote(noteId: number, updateNote: Partial<InsertNote>): Promise<Note | undefined> {
    const [note] = await db
      .update(notes)
      .set({
        ...updateNote,
        lastEdited: new Date(),
      })
      .where(eq(notes.id, noteId))
      .returning();
    return note;
  }
  
  // Settings operations
  async getSettings(userId: number): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.userId, userId));
    return setting;
  }
  
  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const [setting] = await db
      .insert(settings)
      .values(insertSettings)
      .returning();
    return setting;
  }
  
  async updateSettings(userId: number, updateSettings: Partial<InsertSettings>): Promise<Settings | undefined> {
    const [setting] = await db
      .update(settings)
      .set(updateSettings)
      .where(eq(settings.userId, userId))
      .returning();
    return setting;
  }
}

// For development, let's use the in-memory storage initially
// We'll implement a proper auth system later
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private taskMap: Map<number, Task>;
  private sessionMap: Map<number, Session>;
  private goalMap: Map<number, Goal>;
  private noteMap: Map<number, Note>;
  private settingsMap: Map<number, Settings>;
  private userIdCounter: number;
  private taskIdCounter: number;
  private sessionIdCounter: number;
  private goalIdCounter: number;
  private noteIdCounter: number;
  private settingsIdCounter: number;

  constructor() {
    this.users = new Map();
    this.taskMap = new Map();
    this.sessionMap = new Map();
    this.goalMap = new Map();
    this.noteMap = new Map();
    this.settingsMap = new Map();
    this.userIdCounter = 1;
    this.taskIdCounter = 1;
    this.sessionIdCounter = 1;
    this.goalIdCounter = 1;
    this.noteIdCounter = 1;
    this.settingsIdCounter = 1;
    
    // Create a demo user
    this.createUser({ username: 'demo', password: 'password' });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      lastLogin: null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Task operations
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.taskMap.values())
      .filter(task => task.userId === userId)
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  }
  
  async getTaskById(taskId: number): Promise<Task | undefined> {
    return this.taskMap.get(taskId);
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const task: Task = {
      ...insertTask,
      id,
      created: new Date(),
      updated: null,
      sessions: 0,
      completed: false
    };
    this.taskMap.set(id, task);
    return task;
  }
  
  async updateTask(taskId: number, updateTask: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.taskMap.get(taskId);
    if (!task) return undefined;
    
    const updatedTask: Task = {
      ...task,
      ...updateTask,
      updated: new Date()
    };
    this.taskMap.set(taskId, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(taskId: number): Promise<boolean> {
    return this.taskMap.delete(taskId);
  }
  
  // Session operations
  async getSessions(userId: number): Promise<Session[]> {
    return Array.from(this.sessionMap.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.sessionIdCounter++;
    const session: Session = {
      ...insertSession,
      id,
      timestamp: new Date()
    };
    this.sessionMap.set(id, session);
    return session;
  }
  
  // Goal operations
  async getGoals(userId: number): Promise<Goal[]> {
    return Array.from(this.goalMap.values())
      .filter(goal => goal.userId === userId)
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  }
  
  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.goalIdCounter++;
    const goal: Goal = {
      ...insertGoal,
      id,
      created: new Date(),
      completed: false,
      completedAt: null
    };
    this.goalMap.set(id, goal);
    return goal;
  }
  
  async updateGoal(goalId: number, updateGoal: Partial<InsertGoal>): Promise<Goal | undefined> {
    const goal = this.goalMap.get(goalId);
    if (!goal) return undefined;
    
    const completedAt = updateGoal.completed ? new Date() : null;
    
    const updatedGoal: Goal = {
      ...goal,
      ...updateGoal,
      completedAt
    };
    this.goalMap.set(goalId, updatedGoal);
    return updatedGoal;
  }
  
  async deleteGoal(goalId: number): Promise<boolean> {
    return this.goalMap.delete(goalId);
  }
  
  // Note operations
  async getNotes(userId: number): Promise<Note[]> {
    return Array.from(this.noteMap.values())
      .filter(note => note.userId === userId)
      .sort((a, b) => new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime());
  }
  
  async getNote(userId: number): Promise<Note | undefined> {
    return Array.from(this.noteMap.values()).find(note => note.userId === userId);
  }
  
  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteIdCounter++;
    const note: Note = {
      ...insertNote,
      id,
      lastEdited: new Date()
    };
    this.noteMap.set(id, note);
    return note;
  }
  
  async updateNote(noteId: number, updateNote: Partial<InsertNote>): Promise<Note | undefined> {
    const note = this.noteMap.get(noteId);
    if (!note) return undefined;
    
    const updatedNote: Note = {
      ...note,
      ...updateNote,
      lastEdited: new Date()
    };
    this.noteMap.set(noteId, updatedNote);
    return updatedNote;
  }
  
  // Settings operations
  async getSettings(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settingsMap.values()).find(setting => setting.userId === userId);
  }
  
  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const id = this.settingsIdCounter++;
    const setting: Settings = {
      ...insertSettings,
      id
    };
    this.settingsMap.set(id, setting);
    return setting;
  }
  
  async updateSettings(userId: number, updateSettings: Partial<InsertSettings>): Promise<Settings | undefined> {
    const existingSettings = Array.from(this.settingsMap.values()).find(setting => setting.userId === userId);
    
    if (!existingSettings) return undefined;
    
    const updatedSettings: Settings = {
      ...existingSettings,
      ...updateSettings
    };
    this.settingsMap.set(existingSettings.id, updatedSettings);
    return updatedSettings;
  }
}

// Use MemStorage during development for simplicity
// Switch to DatabaseStorage when ready to use the database
export const storage = new MemStorage();

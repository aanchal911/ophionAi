import { GoogleGenAI, Chat, Type } from "@google/genai";
import { Task, Project, WrappedData } from '../types';

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

const SYSTEM_INSTRUCTION = `You are OphionAI, a wise, supportive, and highly intelligent productivity companion. 
Your goal is to help the user achieve their goals, manage their time, and maintain a healthy work-life balance.
Your tone should be:
- Encouraging but firm when needed.
- Analytical yet empathetic.
- Concise and actionable.
You act as a mentor. If the user is stressed, offer calming advice. If they are procrastinating, offer a gentle nudge.
Refer to Greek mythology metaphors occasionally if it fits the context of "Ophion" (the titan), but keep it subtle.
`;

const getAI = () => {
  if (!genAI) {
    const apiKey = process.env.API_KEY || '';
    if (!apiKey) {
      console.warn("API_KEY is missing from environment variables.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

export const getChatSession = () => {
  if (!chatSession) {
    const ai = getAI();
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }
  return chatSession;
};

export const generateMotivation = async (context: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a short, powerful motivational quote or insight (max 2 sentences) for a user who is currently: ${context}. Do not use quotes, just speak directly.`,
    });
    return response.text || "Keep pushing forward. Greatness awaits.";
  } catch (error) {
    console.error("Error generating motivation:", error);
    return "Focus on the step in front of you, not the whole staircase.";
  }
};

// Generates a list of tasks from a user's natural language goal
export const generateTasksFromInput = async (userInput: string): Promise<Task[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a list of tasks based on this user goal: "${userInput}". 
      Assign realistic categories (Work, Personal, Health, Growth), priorities (High, Medium, Low), and due dates (Today, Tomorrow, etc).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['Work', 'Personal', 'Health', 'Growth'] },
              priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
              dueDate: { type: Type.STRING },
            }
          }
        }
      }
    });

    const tasksRaw = JSON.parse(response.text || '[]');
    // Add IDs and defaults
    return tasksRaw.map((t: any) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      completed: false,
      ...t
    }));
  } catch (error) {
    console.error("Error generating tasks:", error);
    return [];
  }
};

// Generates a standard daily dashboard setup
export const generateDailyPlan = async (focusArea?: string): Promise<{ tasks: Task[], noteContent: string }> => {
  const ai = getAI();
  try {
    const prompt = focusArea 
      ? `Create a balanced daily plan focusing on: ${focusArea}.` 
      : `Create a balanced daily plan for a productive day including work, health, and personal growth.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             tasks: {
               type: Type.ARRAY,
               items: {
                 type: Type.OBJECT,
                 properties: {
                   title: { type: Type.STRING },
                   category: { type: Type.STRING, enum: ['Work', 'Personal', 'Health', 'Growth'] },
                   priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                   dueDate: { type: Type.STRING },
                 }
               }
             },
             motivationalNote: { type: Type.STRING }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    const tasks = (data.tasks || []).map((t: any) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      completed: false,
      ...t
    }));

    return {
      tasks,
      noteContent: data.motivationalNote || "Focus on the present moment."
    };
  } catch (error) {
    console.error("Error generating daily plan:", error);
    return { tasks: [], noteContent: "Could not generate plan." };
  }
};

export const analyzeStickyNote = async (content: string): Promise<{ suggestedTask?: string, summary?: string }> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze this sticky note content: "${content}". 
        If it contains an actionable item, suggest a task title. 
        Also provide a 5-word summary.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    suggestedTask: { type: Type.STRING, description: "Task title if actionable, else null" },
                    summary: { type: Type.STRING, description: "Short summary" }
                }
            }
        }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error analyzing note:", error);
    return {};
  }
};

export const smartAnalyzeNote = async (content: string): Promise<{ 
    priority: 'High' | 'Medium' | 'Low', 
    suggestedColor: string,
    actionable: boolean
}> => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this note: "${content}". 
            Determine urgency (High/Medium/Low). 
            Suggest a Tailwind background color class (e.g., bg-red-100, bg-blue-100, bg-green-100) based on context (Work=Blue, Urgent=Red, Personal=Green/Purple).
            Is it actionable?`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                        suggestedColor: { type: Type.STRING },
                        actionable: { type: Type.BOOLEAN }
                    }
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Smart analyze error:", error);
        return { priority: 'Medium', suggestedColor: 'bg-yellow-100', actionable: false };
    }
}

export const analyzeProjectHealth = async (project: Project, tasks: Task[]): Promise<string> => {
    const ai = getAI();
    try {
        const projectTasks = tasks.filter(t => t.projectId === project.id);
        const completed = projectTasks.filter(t => t.completed).length;
        const total = projectTasks.length;
        const prompt = `Analyze this project: "${project.title}". 
        Description: ${project.description}.
        Progress: ${project.progress}%.
        Tasks: ${completed}/${total} completed.
        Due Date: ${project.dueDate}.
        Provide a 2-sentence health check and one actionable recommendation for the team.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "Project looks stable. Keep monitoring deadlines.";
    } catch (error) {
        return "Unable to analyze project health at this time.";
    }
}

export const smartReschedule = async (
    pendingTasks: Task[], 
    existingSchedule: Task[] // Tasks that already have a time slot
): Promise<Task[]> => {
    const ai = getAI();
    try {
        const prompt = `
            I have these pending tasks that need to be rescheduled:
            ${JSON.stringify(pendingTasks.map(t => ({ id: t.id, title: t.title, duration: t.duration || 60 })))}

            My current schedule for the rest of the week is:
            ${JSON.stringify(existingSchedule.map(t => ({ day: t.day, start: t.startTime, duration: t.duration })))}

            Please suggest new 'day' (e.g., Mon, Tue...) and 'startTime' (e.g., 14:00) for the pending tasks.
            Assume working hours are 09:00 to 18:00.
            Return a JSON array of objects with 'taskId', 'suggestedDay', 'suggestedStartTime'.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            taskId: { type: Type.STRING },
                            suggestedDay: { type: Type.STRING },
                            suggestedStartTime: { type: Type.STRING },
                        }
                    }
                }
            }
        });

        const suggestions = JSON.parse(response.text || '[]');
        
        // Merge suggestions back into tasks
        return pendingTasks.map(task => {
            const suggestion = suggestions.find((s: any) => s.taskId === task.id);
            if (suggestion) {
                return {
                    ...task,
                    day: suggestion.suggestedDay,
                    startTime: suggestion.suggestedStartTime
                };
            }
            return task;
        });

    } catch (error) {
        console.error("Reschedule error:", error);
        return pendingTasks;
    }
}

export const generateWrappedStory = async (tasks: Task[], projects: Project[]): Promise<WrappedData | null> => {
    const ai = getAI();
    
    // --- 1. DETAILED INPUT METRIC CALCULATION ---
    
    const isSimulation = tasks.length < 5; // Use sim if not enough data
    const totalTasks = isSimulation ? 482 : tasks.length;
    const completedTasks = isSimulation ? 412 : tasks.filter(t => t.completed).length;
    const completionRate = Math.round((completedTasks / (totalTasks || 1)) * 100);

    // Calculate Category Distribution
    const categories: Record<string, number> = {};
    (isSimulation ? [
        {category:'Work', count: 210}, {category:'Personal', count: 90}, {category:'Growth', count: 60}, {category:'Health', count: 52}
    ] : tasks).forEach((t: any) => {
        const cat = t.category || 'General';
        const count = t.count || 1;
        categories[cat] = (categories[cat] || 0) + count;
    });
    const sortedCats = Object.entries(categories).sort((a,b) => b[1] - a[1]);
    const topCategory = sortedCats[0]?.[0] || 'Work';

    // Calculate Peak Productivity Time & Day
    // (In a real app, we'd use 'completedAt' timestamps. Here we use startTimes or simulation)
    const hours: Record<string, number> = {};
    const days: Record<string, number> = {};
    tasks.forEach(t => {
        if (t.completed) {
           if(t.startTime) {
               const h = t.startTime.split(':')[0];
               hours[h] = (hours[h] || 0) + 1;
           }
           if(t.day) {
               days[t.day] = (days[t.day] || 0) + 1;
           }
        }
    });
    const peakHourVal = Object.entries(hours).sort((a,b) => b[1] - a[1])[0]?.[0];
    const bestDayVal = Object.entries(days).sort((a,b) => b[1] - a[1])[0]?.[0];
    
    const peakHour = peakHourVal ? `${peakHourVal}:00` : (isSimulation ? "10:00 AM" : "Morning");
    const bestDay = bestDayVal || (isSimulation ? "Tuesday" : "Monday");

    // Calculate Streak (Simplified consecutive days)
    // Note: This assumes tasks have date data available in a consistent format
    let currentStreak = 0;
    let maxStreak = isSimulation ? 12 : 0;
    // ... (Streak calculation logic would go here in full implementation) ...

    const context = `
    📌 INPUTS (Dynamic Data from User):
    Tasks completed: ${completedTasks}
    Tasks created: ${totalTasks}
    Completion rate: ${completionRate}%
    Peak productivity time: ${peakHour}
    Most productive day: ${bestDay}
    Category distribution: ${JSON.stringify(categories)}
    Streaks: ${maxStreak} days
    Projects completed: ${projects.filter(p => p.status === 'Completed').length}
    Group performance metrics: ${isSimulation ? "Excellent" : "Average"}
    `;

    try {
        const prompt = `
            Generate a personalized Productivity Wrapped report based on the following user data.
            ${context}
            
            Create two sections: (1) Productivity Personality, and (2) Work Wrapped Summary.
            
            📌 STYLE GUIDELINES
            - Make the tone motivational, aesthetic, and cinematic — similar to Spotify Wrapped.
            - Use short, punchy highlight lines.
            - Add emotional & motivational wording.
            - Avoid boring statistics; turn data into a story.
            - Keep it "GenZ + modern + cinematic".

            📌 OUTPUT JSON FORMAT (Must match the schema structure):
            1. identity: Create a "Productivity Personality" (e.g. The Strategist, The Firecracker). Include a title (archetype), a cinematic tagline (quote), and a psychological description.
            2. timeStats: Highlight their peak productivity time (peakHour) and day (bestDay) with a witty comment.
            3. categoryStats: Highlight their top domain (topCategory), completion rate, and a story insight.
            4. streaks: Create a narrative about their consistency (longestStreak) and give it a cool name (type).
            5. projectStats: Highlight a "Main Character" moment with a project (highlightProject), their role, and a comment.
            6. growth: List 3 major growth milestones or habit improvements.
            7. achievements: List 3 specific wins (e.g. "Beat procrastination in March").
            8. movie: If this year was a movie, give it a Title, Genre, and Netflix-style Description.
            9. predictions: 2 smart forecasts for next year.
            10. final: A final "Year Title" (e.g. The Momentum Year) and a powerful closing quote.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        identity: { type: Type.OBJECT, properties: { archetype: {type: Type.STRING}, quote: {type: Type.STRING}, description: {type: Type.STRING} } },
                        timeStats: { type: Type.OBJECT, properties: { peakHour: {type: Type.STRING}, bestDay: {type: Type.STRING}, comment: {type: Type.STRING} } },
                        categoryStats: { type: Type.OBJECT, properties: { topCategory: {type: Type.STRING}, completionRate: {type: Type.NUMBER}, comment: {type: Type.STRING} } },
                        streaks: { type: Type.OBJECT, properties: { longestStreak: {type: Type.NUMBER}, type: {type: Type.STRING}, comment: {type: Type.STRING} } },
                        projectStats: { type: Type.OBJECT, properties: { highlightProject: {type: Type.STRING}, role: {type: Type.STRING}, comment: {type: Type.STRING} } },
                        growth: { type: Type.ARRAY, items: { type: Type.STRING } },
                        achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
                        movie: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, genre: {type: Type.STRING}, description: {type: Type.STRING} } },
                        predictions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        final: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, quote: {type: Type.STRING} } },
                    }
                }
            }
        });
        
        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Wrapped generation error", error);
        return null;
    }
};
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AssessmentSession,
  ChatMessage,
  FollowUpQuestion,
  Symptom,
  TriageResult,
  UserProfile,
} from '@/types';

interface AssessmentState {
  // Session Data
  sessionId: string | null;
  currentStep: number;
  totalSteps: number;
  status: 'idle' | 'chatting' | 'assessing' | 'summarizing' | 'complete';

  // User Data
  profile: UserProfile | null;
  symptoms: Symptom[];
  followUpAnswers: Record<string, string>;
  followUpQuestions: FollowUpQuestion[];

  // Chat Data
  chatMessages: ChatMessage[];

  // Results
  triageResult: TriageResult | null;

  // Loading States
  isLoading: boolean;
  error: string | null;

  // Actions
  setProfile: (profile: UserProfile) => void;
  addSymptom: (symptom: Symptom) => void;
  removeSymptom: (symptomId: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  setFollowUpQuestions: (questions: FollowUpQuestion[]) => void;
  answerQuestion: (questionId: string, answer: string) => void;
  setTriageResult: (result: TriageResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setStep: (step: number) => void;
  setStatus: (status: AssessmentState['status']) => void;
  resetSession: () => void;
  newChat: () => void;
  saveSession: () => AssessmentSession | null;
  loadSession: (session: AssessmentSession) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const initialState = {
  sessionId: null,
  currentStep: 1,
  totalSteps: 4,
  status: 'idle' as const,
  profile: null,
  symptoms: [],
  followUpAnswers: {},
  followUpQuestions: [],
  chatMessages: [],
  triageResult: null,
  isLoading: false,
  error: null,
};

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setProfile: (profile) => set({ profile }),

      addSymptom: (symptom) =>
        set((state) => ({
          symptoms: [...state.symptoms, { ...symptom, id: generateId() }],
        })),

      removeSymptom: (symptomId) =>
        set((state) => ({
          symptoms: state.symptoms.filter((s) => s.id !== symptomId),
        })),

      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, { ...message, id: generateId() }],
        })),

      setFollowUpQuestions: (questions) => set({ followUpQuestions: questions }),

      answerQuestion: (questionId, answer) =>
        set((state) => ({
          followUpAnswers: { ...state.followUpAnswers, [questionId]: answer },
        })),

      setTriageResult: (result) => set({ triageResult: result }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      setStep: (step) => set({ currentStep: step }),

      setStatus: (status) => set({ status }),

      resetSession: () =>
        set({
          ...initialState,
          sessionId: generateId(),
        }),

      // Soft reset: clear the in-flight assessment (chat, symptoms, answers,
      // triage) but keep the user's profile and start in "chatting" state.
      newChat: () =>
        set((state) => ({
          ...initialState,
          profile: state.profile,
          sessionId: generateId(),
          status: 'chatting',
          currentStep: 1,
        })),

      saveSession: () => {
        const state = get();
        if (!state.sessionId) return null;

        const session: AssessmentSession = {
          id: state.sessionId,
          status: state.status === 'complete' ? 'completed' : 'in_progress',
          currentStep: state.currentStep,
          totalSteps: state.totalSteps,
          symptoms: state.symptoms,
          followUpAnswers: state.followUpAnswers,
          profile: state.profile,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Also save to localStorage for resume functionality
        localStorage.setItem('current_session', JSON.stringify(session));
        return session;
      },

      loadSession: (session) => {
        set({
          sessionId: session.id,
          currentStep: session.currentStep,
          symptoms: session.symptoms,
          followUpAnswers: session.followUpAnswers,
          profile: session.profile,
          status: session.status === 'completed' ? 'complete' : 'assessing',
        });
      },
    }),
    {
      name: 'assessment-storage',
      storage: createJSONStorage(() => localStorage),
      // Persist the in-flight assessment so refreshing /results or /summary
      // doesn't lose data. profile is permanent; the rest is cleared by
      // newChat() or resetSession() when the user starts over.
      partialize: (state) => ({
        profile: state.profile,
        chatMessages: state.chatMessages,
        symptoms: state.symptoms,
        followUpQuestions: state.followUpQuestions,
        followUpAnswers: state.followUpAnswers,
        triageResult: state.triageResult,
      }),
    }
  )
);

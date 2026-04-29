import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Persona = 'student' | 'founder' | null;

interface PersonaStore {
  persona: Persona;
  setPersona: (persona: Persona) => void;
  clearPersona: () => void;
}

export const usePersonaStore = create<PersonaStore>()(
  persist(
    (set) => ({
      persona: null,
      setPersona: (persona) => set({ persona }),
      clearPersona: () => set({ persona: null }),
    }),
    {
      name: 'learnova_persona',
    }
  )
);

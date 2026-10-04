import { create } from "zustand";

interface Config {
  selected: string | null;
}

const useMailStore = create<
  Config & { setState: (newState: Partial<Config>) => void }
>((set) => ({
  selected: null,
  setState: (newState) => set((state) => ({ ...state, ...newState })),
}));

export function useMail(): [Config, (newState: Partial<Config>) => void] {
  const selected = useMailStore((state) => state.selected);
  const setState = useMailStore((state) => state.setState);
  return [{ selected }, setState];
}

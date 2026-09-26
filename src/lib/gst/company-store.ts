import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  companyId: number | null;
  setCompanyId: (id: number) => void;
};

export const useCompanyStore = create<State>()(
  persist(
    (set) => ({
      companyId: null,
      setCompanyId: (id) => set({ companyId: id }),
    }),
    { name: "pramaan-company" },
  ),
);

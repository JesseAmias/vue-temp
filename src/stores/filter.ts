import { store } from "@/stores";

type Filters = {
  subjects: string[];
  scoreRange: string | undefined;
  batch: string[];
};

const initFilter: Filters = {
  subjects: [],
  scoreRange: undefined,
  batch: [],
};

export const useStudentsFilter = defineStore("filters", () => {
  const storeFilters = sessionStorage.getItem("filters");
  const filters = ref<Filters>(storeFilters ? JSON.parse(storeFilters) : initFilter);

  watch(
    () => filters.value,
    (newVal) => {
      sessionStorage.setItem("filters", JSON.stringify(newVal));
    },
    { deep: true },
  );

  return { filters };
});

export function useStudentsFilterStore() {
  return useStudentsFilter(store);
}

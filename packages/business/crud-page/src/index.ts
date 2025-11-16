import { onMounted, reactive, ref } from 'vue';

import { cloneDeep } from '@vben/utils';

export interface CrudColumn {
  label: string;
  prop: string;
  width?: number;
}

export interface CrudFormField<T = any> {
  component: 'input' | 'select';
  field: keyof T & string;
  label: string;
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
}

export interface CrudService<T extends Record<string, any>> {
  create?: (payload: T) => Promise<T>;
  list: (payload: Partial<T>) => Promise<T[]>;
  remove?: (id: number | string) => Promise<void>;
}

export interface UseCrudPageOptions<T extends Record<string, any>> {
  columns: CrudColumn[];
  defaultQuery: Partial<T>;
  formFields: CrudFormField<T>[];
  service: CrudService<T>;
}

export function useCrudPage<T extends Record<string, any>>(
  options: UseCrudPageOptions<T>,
) {
  const loading = ref(false);
  const tableData = ref<T[]>([]);
  const queryForm = reactive(cloneDeep(options.defaultQuery) as Partial<T>);

  async function fetchList() {
    loading.value = true;
    try {
      tableData.value = await options.service.list(queryForm);
    } finally {
      loading.value = false;
    }
  }

  async function handleDelete(row: T & { id?: number | string }) {
    if (!options.service.remove || !row.id) return;
    loading.value = true;
    try {
      await options.service.remove(row.id);
      await fetchList();
    } finally {
      loading.value = false;
    }
  }

  async function handleCreate(payload: T) {
    if (!options.service.create) return;
    loading.value = true;
    try {
      await options.service.create(payload);
      await fetchList();
    } finally {
      loading.value = false;
    }
  }

  function resetQuery() {
    Object.assign(queryForm, cloneDeep(options.defaultQuery));
    fetchList();
  }

  onMounted(fetchList);

  return {
    columns: options.columns,
    formFields: options.formFields,
    loading,
    queryForm,
    tableData,
    fetchList,
    handleCreate,
    handleDelete,
    resetQuery,
  };
}

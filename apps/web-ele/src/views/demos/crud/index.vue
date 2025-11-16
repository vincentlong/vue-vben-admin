<script setup lang="ts">
import type { CrudFormField } from '@vben-business/crud-page';

import { reactive, ref } from 'vue';

import { useCrudPage } from '@vben-business/crud-page';
import {
  ElButton,
  ElCard,
  ElDialog,
  ElDivider,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElPopconfirm,
  ElSelect,
  ElTable,
  ElTableColumn,
} from 'element-plus';

interface ArticleRecord {
  id: number;
  title: string;
  author: string;
  status: 'draft' | 'published';
  createdAt: string;
}

const mockDb = ref<ArticleRecord[]>([
  {
    id: 10_001,
    title: '示例文章 1',
    author: '管理员',
    status: 'draft',
    createdAt: '2024-01-01 10:00',
  },
  {
    id: 10_002,
    title: '示例文章 2',
    author: '产品经理',
    status: 'published',
    createdAt: '2024-01-12 19:30',
  },
]);

const {
  columns,
  formFields,
  loading,
  queryForm,
  tableData,
  fetchList,
  handleCreate,
  handleDelete,
  resetQuery,
} = useCrudPage<ArticleRecord>({
  columns: [
    { label: '编号', prop: 'id', width: 120 },
    { label: '标题', prop: 'title' },
    { label: '作者', prop: 'author', width: 140 },
    { label: '状态', prop: 'status', width: 120 },
    { label: '发布时间', prop: 'createdAt', width: 180 },
  ],
  formFields: [
    {
      field: 'title',
      label: '标题',
      component: 'input',
      placeholder: '请输入标题',
    },
    {
      field: 'status',
      label: '状态',
      component: 'select',
      placeholder: '全部状态',
      options: [
        { label: '草稿', value: 'draft' },
        { label: '已发布', value: 'published' },
      ],
    },
  ] as CrudFormField<ArticleRecord>[],
  defaultQuery: {
    title: '',
    status: '',
  },
  service: {
    async list(payload) {
      const keyword = (payload.title ?? '').toString().toLowerCase();
      const status = payload.status ? String(payload.status) : '';
      return mockDb.value.filter((item) => {
        const matchTitle = keyword
          ? item.title.toLowerCase().includes(keyword)
          : true;
        const matchStatus = status ? item.status === status : true;
        return matchTitle && matchStatus;
      });
    },
    async remove(id) {
      mockDb.value = mockDb.value.filter((item) => item.id !== id);
    },
    async create(record) {
      mockDb.value = [
        { ...record, id: Date.now(), createdAt: new Date().toISOString() },
        ...mockDb.value,
      ];
      return mockDb.value[0];
    },
  },
});

const dialogVisible = ref(false);
const createForm = reactive({
  title: '',
  author: '',
  status: 'draft' as ArticleRecord['status'],
});

function openCreateModal() {
  createForm.title = '';
  createForm.author = '';
  createForm.status = 'draft';
  dialogVisible.value = true;
}

async function submitCreate() {
  await handleCreate({
    id: Date.now(),
    title: createForm.title,
    author: createForm.author,
    status: createForm.status,
    createdAt: new Date().toISOString(),
  });
  dialogVisible.value = false;
  ElMessage.success('新增成功');
}

async function handleRemoveRow(row: ArticleRecord) {
  await handleDelete(row);
  ElMessage.success('删除成功');
}
</script>

<template>
  <div class="space-y-4 p-4">
    <ElCard shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span>查询条件</span>
          <ElButton type="primary" @click="openCreateModal">新增文章</ElButton>
        </div>
      </template>
      <ElForm :model="queryForm" inline label-width="80px" class="space-y-2">
        <ElFormItem
          v-for="item in formFields"
          :key="item.field"
          :label="item.label"
        >
          <ElInput
            v-if="item.component === 'input'"
            v-model="queryForm[item.field]"
            :placeholder="item.placeholder"
            clearable
          />
          <ElSelect
            v-else
            v-model="queryForm[item.field]"
            clearable
            :placeholder="item.placeholder"
            class="w-48"
          >
            <ElOption
              v-for="option in item.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </ElFormItem>
        <div class="space-x-2">
          <ElButton type="primary" @click="fetchList">查询</ElButton>
          <ElButton @click="resetQuery">重置</ElButton>
        </div>
      </ElForm>
    </ElCard>

    <ElCard shadow="never">
      <template #header> CRUD 页面示例 </template>
      <ElTable :data="tableData" v-loading="loading" border style="width: 100%">
        <ElTableColumn
          v-for="column in columns"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
        />
        <ElTableColumn fixed="right" label="操作" width="140">
          <template #default="{ row }">
            <ElButton link type="primary">编辑</ElButton>
            <ElDivider direction="vertical" />
            <ElPopconfirm
              title="确认删除该行数据？"
              confirm-button-text="删除"
              cancel-button-text="取消"
              @confirm="handleRemoveRow(row)"
            >
              <template #reference>
                <ElButton link type="danger">删除</ElButton>
              </template>
            </ElPopconfirm>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <ElDialog v-model="dialogVisible" title="新增文章" width="500px">
      <ElForm :model="createForm" label-width="80px">
        <ElFormItem label="标题">
          <ElInput v-model="createForm.title" placeholder="请输入标题" />
        </ElFormItem>
        <ElFormItem label="作者">
          <ElInput v-model="createForm.author" placeholder="请输入作者" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="createForm.status">
            <ElOption label="草稿" value="draft" />
            <ElOption label="已发布" value="published" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取 消</ElButton>
        <ElButton type="primary" @click="submitCreate">确 定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

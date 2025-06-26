<template>
  <div>
    <div class="navbar-wrapper relative flex justify-between items-center h-[50px] py-0 px-[20px] shadow-[0_1px_4px_rgba(0,21,41,.08)] text-lg font-semibold text-[#333]">
      <div class="nav-left">教学管理系统</div>
      <div class="nav-right flex">
        <el-input v-model.trim="searchVal" class="width-[240px] mr-10" placeholder="搜索" @input="handleSearch">
          <template #prefix>
            <el-icon class="el-input__icon"><search /></el-icon>
          </template>
        </el-input>
        <el-dropdown>
          <div class="el-dropdown-link flex items-center outline-none">
            <el-avatar size="small" :src="circleUrl" />
            <span class="ml-[10px]">Jesse</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <el-icon><User /></el-icon> 个人中心
              </el-dropdown-item>
              <el-dropdown-item>
                <el-icon><Setting /></el-icon>设置
              </el-dropdown-item>
              <el-dropdown-item divided>
                <el-icon class="rotate-[-90deg]"><House /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="main-wrapper">
      <div class="main-content bg-white px-10 py-6">
        <div class="filter-container mb-[10px]">
          <!-- 筛选区域 -->
          <div class="py-4 bg-white border-b border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- 科目筛选 -->
              <div class="flex items-center">
                <label class="block text-sm font-medium text-gray-700 mr-2">科目</label>
                <CustomDropdown
                  v-model="filters.subjects"
                  :options="subjectOptions"
                  placeholder="选择科目"
                  :multiple="true"
                  :searchable="true"
                  filter-type="subject"
                  width="100%"
                  @change="handleSubjectChange"
                />
              </div>

              <!-- 分数段筛选 -->
              <div class="flex items-center">
                <label class="block text-sm font-medium text-gray-700 mr-2">分数段</label>
                <CustomDropdown v-model="filters.scoreRange" :options="scoreRangeOptions" placeholder="选择分数段" filter-type="score" width="100%" @change="handleScoreRangeChange" />
              </div>

              <!-- 考试批次筛选 -->
              <div class="flex items-center">
                <label class="block text-sm font-medium text-gray-700 mr-2">考试批次</label>
                <CustomDropdown v-model="filters.batch" :options="batchOptions" placeholder="选择考试批次" :multiple="true" filter-type="batch" width="100%" @change="handleBatchChange" />
              </div>

              <div class="flex justify-end items-center">
                <el-button type="primary" @click="handleQuery">查询</el-button>
                <el-button @click="handleRest">重置</el-button>
              </div>
            </div>
          </div>
        </div>
        <div class="table-wrapper">
          <div class="dynamic-table-container p-[20px] round-lg shadow-[0_2px_12px_0_rgba(0,0,0,.1)]">
            <div class="table-header flex justify-between items-center mb-[20px]">
              <h2 class="font-semibold">考试成绩信息</h2>

              <div class="flex items-center">
                <el-tooltip content="导出数据" placement="top">
                  <el-icon @click="exportData" class="cursor-pointer mr-[15px]"><Document /></el-icon>
                </el-tooltip>
                <el-tooltip content="刷新" placement="top">
                  <el-icon @click="refreshData" class="cursor-pointer mr-[15px]"><RefreshRight /></el-icon>
                </el-tooltip>
                <el-tooltip content="列设置" placement="top">
                  <el-dropdown trigger="click" placement="bottom-end">
                    <el-icon><Grid /></el-icon>

                    <template #dropdown>
                      <el-dropdown-menu class="column-dropdown min-w-[200px]">
                        <div class="dropdown-header px-[16px] py-[4px] border-b">
                          <el-checkbox v-model="allSelected" :indeterminate="isIndeterminate" @change="selectAll"> 全选 </el-checkbox>
                        </div>
                        <div class="column-list max-h-[300px] overflow-auto">
                          <div v-for="column in columns" :key="column.key" class="column-item px-[16px] py-[2px] hover:bg-[#f5f7fa]">
                            <el-checkbox v-model="column.visible" @change="columnToggle">
                              <span class="column-label ml-[8px]">{{ column.label }}</span>
                            </el-checkbox>
                          </div>
                        </div>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </el-tooltip>
              </div>
            </div>

            <!-- 表格 -->
            <el-table :data="tableData" stripe border v-loading="loadingStudentsInfo" height="480px" max-height="480px" :header-cell-style="{ backgroundColor: '#f5f7fa' }">
              <el-table-column
                v-for="column in visibleColumns"
                :key="column.key"
                :prop="column.key"
                :label="column.label"
                :width="getColumnWidth(column.key)"
                :sortable="column.sortable"
                show-overflow-tooltip
              >
              </el-table-column>

              <el-table-column label="操作" width="140" fixed="right">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleEdit(scope.row)"> 编辑 </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(scope.row)"> 删除 </el-button>
                </template>
              </el-table-column>

              <template #empty v-if="networkError">
                <div class="empty-container">
                  <div>数据加载失败</div>
                  <el-button type="primary" size="small" @click="handleRetry" :loading="loadingStudentsInfo"> 重新加载 </el-button>
                </div>
              </template>
            </el-table>

            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 100, 200, 300]"
              layout="prev, pager, next, jumper, sizes, total"
              :total="totalCount"
              class="flex justify-end mt-5"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CheckboxValueType } from "element-plus";
import { User, Setting, House, Search, Grid, RefreshRight, Document } from "@element-plus/icons-vue";
import CustomDropdown from "./CustomDropdown.vue";
import type { SelectedOptions } from "../type";

import { useMutation } from "@tanstack/vue-query";
import { studentsInfo, studentsInfoError } from "../apis/home";
import { useDebounceFn } from "@vueuse/core";

const circleUrl = "https://dev-file.iviewui.com/userinfoPDvn9gKWYihR24SpgC319vXY8qniCqj4/avatar";

const searchVal = ref("");

interface TableRow {
  id: number;
  name: string;
  studentId: string;
  subject: string;
  score: number;
  examBatch: string;
}

interface ColumnConfig {
  key: keyof TableRow;
  label: string;
  visible: boolean;
  sortable: boolean | "custom";
}

type Filters = {
  subjects: string[];
  scoreRange: string | undefined;
  batch: string[];
};

const tableData = ref<TableRow[]>([]);
// 原始表格数据
const originTableData = ref<TableRow[]>([]);

const columns = ref<ColumnConfig[]>([
  { key: "id", label: "ID", visible: true, sortable: false },
  { key: "name", label: "姓名", visible: true, sortable: false },
  { key: "studentId", label: "学号", visible: true, sortable: false },
  { key: "subject", label: "科目", visible: true, sortable: false },
  { key: "score", label: "成绩", visible: true, sortable: true },
  { key: "examBatch", label: "考试批次", visible: true, sortable: false },
]);

const allSelected = ref(false);
const isIndeterminate = ref(false);

const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(466);
const networkError = ref(true);

const visibleColumns = computed(() => {
  return columns.value.filter((col) => col.visible);
});

// 过滤
const filteredData = computed(() => {
  return originTableData.value.filter((row) => {
    // 科目筛选
    if (filters.subjects.length && !filters.subjects.includes(row.subject)) {
      return false;
    }

    // 分数段筛选
    if (filters.scoreRange) {
      const [min, max] = filters.scoreRange.split("-").map(Number);
      if (row.score < min || row.score > max) {
        return false;
      }
    }

    // 批次筛选
    if (filters.batch.length && !filters.batch.includes(row.examBatch)) {
      return false;
    }

    return true;
  });
});

const updateSelectAllState = () => {
  const visibleCount = columns.value.filter((col) => col.visible).length;
  const totalCount = columns.value.length;

  allSelected.value = visibleCount === totalCount;
  isIndeterminate.value = visibleCount > 0 && visibleCount < totalCount;
};

const initFilters = {
  subjects: [],
  scoreRange: undefined,
  batch: [],
};

// 筛选条件
const filters = reactive<Filters>(initFilters);

// 筛选选项配置
const subjectOptions = [
  { label: "语文", value: "语文" },
  { label: "数学", value: "数学" },
  { label: "英语", value: "英语" },
  { label: "物理", value: "物理" },
  { label: "化学", value: "化学" },
  { label: "生物", value: "生物" },
  { label: "历史", value: "历史" },
  { label: "地理", value: "地理" },
  { label: "政治", value: "政治" },
];

const scoreRangeOptions = [
  { label: "未及格 (0-59)", value: "0-59" },
  { label: "良好 (60-79)", value: "60-79" },
  { label: "优秀 (80-100)", value: "80-100" },
];

const batchOptions = [
  { label: "期中考试", value: "期中考试" },
  { label: "期末考试", value: "期末考试" },
];

const getColumnWidth = (key: string): string | undefined => {
  const widthMap: Record<string, string> = {
    id: "80",
    name: "120",
  };
  return widthMap[key];
};

const selectAll = (checked: CheckboxValueType) => {
  const isChecked = Boolean(checked);
  columns.value.forEach((col) => {
    col.visible = isChecked;
  });
  if (!isChecked) {
    columns.value[0].visible = true;
    ElMessage.warning("至少需要显示一列");
  }
  updateSelectAllState();
};

const columnToggle = () => {
  const visibleCount = columns.value.filter((col) => col.visible).length;
  if (visibleCount === 0) {
    ElMessage.warning("至少需要显示一列");
    columns.value[0].visible = true;
  }
};

const handleEdit = (row: TableRow) => {
  ElMessage.info(`编辑用户: ${row.name}`);
};

const handleDelete = (row: TableRow) => {
  ElMessage.info(`删除用户: ${row.name}`);
};

const exportData = () => {
  ElMessage.success("导出功能待实现");
};

const refreshData = () => {
  ElMessage.success("数据刷新成功");
  // loading.value = true;
  // setTimeout(() => {
  //   originalData.value = generateMockData();
  //   loading.value = false;
  //   ElMessage.success("数据刷新成功");
  // }, 1000);
};

// const handleFilterChange = () => {
//   currentPage.value = 1; // 重置到第一页
// };

const handleSubjectChange = (value: string[], options: SelectedOptions) => {
  // console.log("科目筛选变更:", value, options);
  console.log("科目筛选变更-value:", value);
  console.log("科目筛选变更-options:", options);
  currentPage.value = 1;
  handleQuery();
};

const handleScoreRangeChange = (value: string, options: SelectedOptions) => {
  console.log("分数段筛选变更-value:", value);
  console.log("分数段筛选变更-options:", options);
  currentPage.value = 1;
  handleQuery();
};

const handleBatchChange = (value: string[], options: SelectedOptions) => {
  console.log("考试批次筛选变更-value:", value);
  console.log("考试批次筛选变更-options:", options);
  currentPage.value = 1;
  handleQuery();
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  getStudentsInfo();
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  getStudentsInfo();
};

const { mutate: updateStudentsInfo, isPending: loadingStudentsInfo } = useMutation({
  // mutationFn: studentsInfo,
  mutationFn: async (params: { currentPage: number; pageSize: number }) => {
    return networkError.value ? studentsInfoError(params) : studentsInfo(params);
  },
  onSuccess: (res) => {
    networkError.value = false;
    console.log("api--学生数据结果:\n", res);
    originTableData.value = res.data;
    tableData.value = [...res.data];
  },
  onError: () => {
    networkError.value = true;
  },
});

const getStudentsInfo = () => {
  console.log("xupdateStudentsInfo结果:\n", updateStudentsInfo);
  updateStudentsInfo({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
  });
};

const handleQuery = () => {
  tableData.value = filteredData.value;
};

const handleRest = () => {
  filters.subjects = [];
  filters.scoreRange = undefined;
  filters.batch = [];
  handleQuery();
};

const handleSearch = useDebounceFn(() => {
  tableData.value = originTableData.value.filter((row) => {
    return row.name.includes(searchVal.value) || row.studentId.includes(searchVal.value);
  });
}, 500);

const handleRetry = () => {
  networkError.value = false;
  getStudentsInfo();
};

onMounted(() => {
  console.log("进入home页结果:\n");
  updateSelectAllState();
  getStudentsInfo();
});
</script>

<style lang="scss" scoped>
.dropdown-icon.rotate {
  transform: rotate(180deg);
}
</style>

<template>
  <div>
    <div class="navbar-wrapper relative flex justify-between items-center h-[50px] py-0 px-[20px] shadow-[0_1px_4px_rgba(0,21,41,.08)] text-lg font-semibold text-[#333]">
      <div class="nav-left hidden sm:block">教学管理系统</div>
      <div class="nav-right flex">
        <el-input v-model.trim="searchVal" class="width-[240px] mr-10" placeholder="搜索" @input="handleSearch">
          <template #prefix>
            <el-icon class="el-input__icon"><search /></el-icon>
          </template>
        </el-input>

        <template v-if="isLogin">
          <el-dropdown class="system-setting-dropdown hover:bg-[#f5f7fa] px-[18px] py-[8px] rounded-md" :teleported="false">
            <div class="flex items-center outline-none">
              <el-avatar size="small" :src="circleUrl" />
              <span class="ml-[10px]">Jesse</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="system-dropwdown-menu">
                <el-dropdown-item>
                  <el-icon><User /></el-icon> 个人中心
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-icon><Setting /></el-icon>设置
                </el-dropdown-item>
                <el-dropdown-item @click="changeTheme">
                  <el-icon><Moon /></el-icon>主题切换
                </el-dropdown-item>
                <el-dropdown-item divided class="logout-item" @click="handleLogout">
                  <el-icon class="rotate-[-90deg]"><House /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <div class="flex shrink-0 hover:bg-[#f5f7fa] p-1 rounded-md">
            <el-text class="cursor-pointer font-normal" @click="handleLogin">未登录</el-text>
          </div>
          <!-- <el-button type="primary" @click="handleLogin">登录</el-button> -->
        </template>
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
                <div class="block text-sm font-medium text-gray-700 mr-2 shrink-0">科目</div>
                <CustomDropdown
                  class="subject-dropdown"
                  v-model="filters.subjects"
                  :options="subjectOptions"
                  placeholder="选择科目"
                  :multiple="true"
                  :searchable="true"
                  filter-type="subject"
                  width="100%"
                  :theme="currentTheme"
                  @change="handleFilterChange"
                />
              </div>

              <!-- 分数段筛选 -->
              <div class="flex items-center">
                <div class="block text-sm font-medium text-gray-700 mr-2 shrink-0">分数段</div>
                <CustomDropdown
                  v-model="filters.scoreRange"
                  :options="scoreRangeOptions"
                  placeholder="选择分数段"
                  filter-type="score"
                  width="100%"
                  :theme="currentTheme"
                  @change="handleFilterChange"
                />
              </div>

              <!-- 考试批次筛选 -->
              <div class="flex items-center">
                <div class="block text-sm font-medium text-gray-700 mr-2 shrink-0">考试批次</div>
                <CustomDropdown
                  v-model="filters.batch"
                  :options="batchOptions"
                  placeholder="选择考试批次"
                  :multiple="true"
                  filter-type="batch"
                  width="100%"
                  :theme="currentTheme"
                  @change="handleFilterChange"
                />
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
            <div class="table-top flex justify-between items-center mb-[20px]">
              <h2 class="font-semibold">考试成绩信息</h2>

              <div class="flex items-center">
                <el-tooltip content="切换表格模式" placement="top">
                  <!-- <el-icon @click="refreshData" class="cursor-pointer mr-[15px]"><RefreshRight /></el-icon> -->
                  <el-icon class="cursor-pointer mr-[15px]" @click="changeTable"><Guide /></el-icon>
                </el-tooltip>
                <el-tooltip content="导出数据" placement="top">
                  <el-dropdown class="export-dropdown" trigger="click" placement="bottom-end" :teleported="false">
                    <el-icon class="cursor-pointer mr-[15px]"><Document /></el-icon>
                    <!-- @click="exportData"  -->
                    <template #dropdown>
                      <el-dropdown-menu class="column-dropdown min-w-[100px]">
                        <div class="py-[4px] export-wrapper">
                          <div class="py-[5px] px-[16px] cursor-pointer hover:bg-blue-100" @click="handleExportData(ExportType.XLSX)">导出为 xls</div>
                          <div class="py-[5px] px-[16px] cursor-pointer hover:bg-blue-100" @click="handleExportData(ExportType.CSV)">导出为 csv</div>
                        </div>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </el-tooltip>

                <el-tooltip content="列设置" placement="top">
                  <el-dropdown class="column-setting-dropdown" trigger="click" placement="bottom-end" :teleported="false">
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
            <template v-if="!tableV2Enabled">
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

                <!-- <el-table-column label="操作" width="140" fixed="right">
                  <template>
                    <el-button type="primary" size="small"> 编辑 </el-button>
                    <el-button type="danger" size="small"> 删除 </el-button>
                  </template>
                </el-table-column> -->

                <template #empty>
                  <div class="empty-container" v-if="networkError">
                    <div>数据加载失败</div>
                    <el-button type="primary" size="small" @click="handleRetry" :loading="loadingStudentsInfo"> 重新加载 </el-button>
                  </div>
                </template>
              </el-table>
            </template>
            <template v-else>
              <div class="table-content h-[400px]">
                <el-auto-resizer>
                  <template #default="{ height, width }">
                    <el-table-v2 :columns="visibleColumns" :data="sortedTableData" v-loading="loadingStudentsInfo" :width="width" :height="height" :sort-by="sortState" @column-sort="onSort">
                      <template #empty>
                        <div class="empty-container h-full flex flex-col justify-center items-center" v-if="networkError">
                          <div class="mb-[10px] text-gray-400">数据加载失败</div>
                          <el-button type="primary" size="small" @click="handleRetry" :loading="loadingStudentsInfo"> 重新加载 </el-button>
                        </div>
                      </template>
                    </el-table-v2>
                  </template>
                </el-auto-resizer>
              </div>
            </template>

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
import { User, Setting, House, Search, Grid, Guide, Document, Moon } from "@element-plus/icons-vue";
import CustomDropdown from "./CustomDropdown.vue";
import type { SelectedOptions, TableRow, ColumnConfig } from "../types/home";
import { useLoginStoreHook } from "@/stores/login";
import { useStudentsFilterStore } from "@/stores/filter";

import { useMutation } from "@tanstack/vue-query";
import { studentsInfo, studentsInfoError } from "../apis/home";
import { useDebounceFn } from "@vueuse/core";
import { TableV2SortOrder } from "element-plus";
import type { SortBy } from "element-plus";
import { useFileExport } from "@/utils/tableExport";
import { getFilterData, getSortedTableData } from "./composables/useHomeLogic";
const circleUrl = "https://dev-file.iviewui.com/userinfoPDvn9gKWYihR24SpgC319vXY8qniCqj4/avatar";

enum ExportType {
  XLSX = "xlsx",
  CSV = "csv",
}

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

const loginStore = useLoginStoreHook();
const filterStore = useStudentsFilterStore();
const router = useRouter();
const { exportData } = useFileExport();

const searchVal = ref("");
const tableData = ref<TableRow[]>([]);
// 原始表格数据
const originTableData = ref<TableRow[]>([]);

const columns = ref<ColumnConfig[]>([
  { key: "id", label: "ID", dataKey: "id", width: 100, visible: true, sortable: false },
  { key: "name", label: "姓名", dataKey: "name", width: 200, visible: true, sortable: false },
  { key: "studentId", label: "学号", dataKey: "studentId", width: 220, visible: true, sortable: false },
  { key: "subject", label: "科目", dataKey: "subject", width: 200, visible: true, sortable: false },
  { key: "score", label: "成绩", dataKey: "score", width: 200, visible: true, sortable: true },
  { key: "examBatch", label: "考试批次", dataKey: "examBatch", width: 200, visible: false, sortable: false },
]);

const allSelected = ref(false);
const isIndeterminate = ref(false);

const currentPage = ref(1);
const pageSize = ref(100);
const totalCount = ref(466);
const networkError = ref(true);
const sortState = ref<SortBy>({
  key: "",
  order: TableV2SortOrder.ASC,
});
const tableV2Enabled = ref(false);

const currentTheme = ref<"light" | "dark">("light");

const { filters } = storeToRefs(filterStore);

const isLogin = computed(() => loginStore.isLogin);

const visibleColumns = computed(() => {
  return columns.value
    .filter((col) => col.visible)
    .map((col) => ({
      ...col,
      dataKey: col.key,
      title: col.label,
    }));
});

// 过滤
const filteredData = computed(() => {
  return getFilterData(originTableData.value, filters.value);
});

// 排序
const sortedTableData = computed(() => {
  return getSortedTableData(tableData.value, sortState.value);
});

onMounted(() => {
  updateSelectAllState();
  getStudentsInfo();
});

const updateSelectAllState = () => {
  const visibleCount = columns.value.filter((col) => col.visible).length;
  const totalCount = columns.value.length;

  allSelected.value = visibleCount === totalCount;
  isIndeterminate.value = visibleCount > 0 && visibleCount < totalCount;
};

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

const changeTable = () => {
  tableV2Enabled.value = !tableV2Enabled.value;
};

const handleFilterChange = (value: string[], options: SelectedOptions) => {
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
    // 第一次模拟网络请求失败，之后设置为成功
    networkError.value = false;

    originTableData.value = res.data;
    tableData.value = [...res.data];
    // handleQuery();

    // console.log("before handleQuery");
    handleQuery();
    // console.log("after handleQuery");
  },
  onError: () => {
    networkError.value = true;
  },
});

const getStudentsInfo = () => {
  updateStudentsInfo({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
  });
};

const handleQuery = () => {
  tableData.value = filteredData.value;
};

const handleRest = () => {
  filters.value = { subjects: [], scoreRange: undefined, batch: [] };
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

const onSort = (sortBy: SortBy) => {
  sortState.value = sortBy;
};

const handleLogin = () => {
  router.replace({
    path: "/login",
  });
};

const changeTheme = () => {
  currentTheme.value = currentTheme.value === "light" ? "dark" : "light";
};
const handleLogout = async () => {
  loginStore.logout();
  router.replace({
    path: "/login",
  });
};

const handleExportData = (formmat: "xlsx" | "csv") => {
  const headers: Record<keyof TableRow, string> = visibleColumns.value.reduce(
    (acc, cur) => {
      acc[cur.key] = cur.label;
      return acc;
    },
    {} as Record<keyof TableRow, string>,
  );
  const result = exportData(tableData.value, formmat, { headers });
  if (result.success) {
    ElMessage.success(result.message);
  } else {
    ElMessage.error(result.message);
  }
};
</script>

<style lang="scss" scoped>
.dropdown-icon.rotate {
  transform: rotate(180deg);
}
:deep(.el-table-v2__header-cell) {
  background-color: #f5f7fa;
}
:deep(.el-table-v2__empty) {
  height: 100%;
}
</style>

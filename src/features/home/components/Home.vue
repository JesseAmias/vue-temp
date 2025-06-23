<template>
  <div>
    <div class="navbar-wrapper relative flex justify-between items-center h-[50px] py-0 px-[20px] shadow-[0_1px_4px_rgba(0,21,41,.08)] text-lg font-semibold text-[#333]">
      <div class="nav-left">教学管理系统</div>
      <div class="nav-right flex">
        <el-input v-model="searchVal" class="width-[240px] mr-10" placeholder="搜索">
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
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- 科目筛选 -->
              <div class="flex items-center">
                <label class="block text-sm font-medium text-gray-700 w-[60px]">科目</label>
                <custom-dropdown v-model="filters.subjects" :options="subjectOptions" multiple placeholder="选择科目" filterable @change="handleFilterChange" />
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
            <el-table :data="tableData" stripe border style="width: 100%" :header-cell-style="{ backgroundColor: '#f5f7fa' }">
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
            </el-table>
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
const currentPage = ref(1);

const tableData = ref<TableRow[]>([
  { id: 1, name: "张三", studentId: "20250611", subject: "语文", score: 88, examBatch: "第一批" },
  { id: 2, name: "李四", studentId: "20250612", subject: "语文", score: 78, examBatch: "第一批" },
  { id: 3, name: "王五", studentId: "20250613", subject: "数学", score: 99, examBatch: "第一批" },
  { id: 4, name: "赵六", studentId: "20250614", subject: "数学", score: 98, examBatch: "第二批" },
  { id: 5, name: "孙七", studentId: "20250618", subject: "数学", score: 88, examBatch: "第二批" },
]);

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

const visibleColumns = computed(() => {
  return columns.value.filter((col) => col.visible);
});

const updateSelectAllState = () => {
  const visibleCount = columns.value.filter((col) => col.visible).length;
  const totalCount = columns.value.length;

  allSelected.value = visibleCount === totalCount;
  isIndeterminate.value = visibleCount > 0 && visibleCount < totalCount;
};

// 筛选条件
const filters = reactive({
  subjects: [] as string[],
  scoreRange: "",
  examBatch: [] as string[],
  gradeClass: "",
});

// 筛选选项配置
const subjectOptions = [
  { label: "语文", value: "语文", icon: "Document" },
  { label: "数学", value: "数学", icon: "Calculator" },
  { label: "英语", value: "英语", icon: "ChatDotRound" },
  { label: "物理", value: "物理", icon: "Lightning" },
  { label: "化学", value: "化学", icon: "TestTube" },
  { label: "生物", value: "生物", icon: "Cherry" },
  { label: "历史", value: "历史", icon: "Clock" },
  { label: "地理", value: "地理", icon: "Location" },
  { label: "政治", value: "政治", icon: "Flag" },
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

const handleFilterChange = () => {
  currentPage.value = 1; // 重置到第一页
};

onMounted(() => {
  console.log("进入home页结果:\n");
  updateSelectAllState();
});
</script>

<style lang="scss" scoped>
.dropdown-icon.rotate {
  transform: rotate(180deg);
}
</style>

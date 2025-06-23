<!-- TableWithFilters.vue -->
<template>
  <div class="table-container p-6 bg-gray-50 min-h-screen">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- 表格头部 -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">学生成绩管理</h2>
          <div class="flex items-center space-x-4">
            <el-button size="small" @click="exportData">导出数据</el-button>
            <el-button size="small" type="primary" @click="refreshData">刷新</el-button>
          </div>
        </div>
      </div>

      <!-- 筛选区域 -->
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- 科目筛选 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">科目</label>
            <custom-dropdown v-model="filters.subjects" :options="subjectOptions" multiple placeholder="选择科目" filterable @change="handleFilterChange" />
          </div>

          <!-- 分数段筛选 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">分数段</label>
            <custom-dropdown v-model="filters.scoreRange" :options="scoreRangeOptions" placeholder="选择分数段" @change="handleFilterChange" />
          </div>

          <!-- 考试批次筛选 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">考试批次</label>
            <custom-dropdown v-model="filters.examBatch" :options="examBatchOptions" multiple placeholder="选择考试批次" @change="handleFilterChange" />
          </div>

          <!-- 年级班级级联筛选 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">年级班级</label>
            <custom-dropdown v-model="filters.gradeClass" :options="gradeClassOptions" placeholder="选择年级班级" @change="handleFilterChange" />
          </div>
        </div>

        <!-- 筛选操作 -->
        <div class="flex items-center justify-between mt-4">
          <div class="flex items-center space-x-2">
            <el-button size="small" @click="clearAllFilters">清空筛选</el-button>
            <span class="text-sm text-gray-500">
              共找到 <span class="font-medium text-blue-600">{{ filteredData.length }}</span> 条记录
            </span>
          </div>

          <!-- 已选筛选条件标签 -->
          <div class="flex flex-wrap gap-2">
            <el-tag v-for="tag in activeFilterTags" :key="tag.key" closable size="small" @close="removeFilterTag(tag)">
              {{ tag.label }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="px-6 py-4">
        <el-table :data="paginatedData" :loading="loading" stripe border style="width: 100%" @sort-change="handleSortChange">
          <el-table-column prop="name" label="姓名" width="120" sortable="custom" />
          <el-table-column prop="studentId" label="学号" width="120" sortable="custom" />
          <el-table-column prop="subject" label="科目" width="100" sortable="custom" />
          <el-table-column prop="score" label="成绩" width="100" sortable="custom">
            <template #default="{ row }">
              <span :class="getScoreClass(row.score)">
                {{ row.score }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="examBatch" label="考试批次" width="120" sortable="custom" />
          <el-table-column prop="grade" label="年级" width="80" />
          <el-table-column prop="class" label="班级" width="80" />
          <el-table-column prop="examDate" label="考试日期" width="120" sortable="custom" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button size="small" text @click="editRecord(row)">编辑</el-button>
              <el-button size="small" text type="danger" @click="deleteRecord(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="flex justify-between items-center mt-4">
          <div class="text-sm text-gray-500">显示第 {{ (currentPage - 1) * pageSize + 1 }} 到 {{ Math.min(currentPage * pageSize, filteredData.length) }} 条， 共 {{ filteredData.length }} 条记录</div>
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredData.length"
            layout="sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import CustomDropdown from "./CustomDropdown.vue";

// 数据类型定义
interface StudentRecord {
  id: number;
  name: string;
  studentId: string;
  subject: string;
  score: number;
  examBatch: string;
  grade: string;
  class: string;
  examDate: string;
}

interface FilterTag {
  key: string;
  label: string;
  value: any;
}

// 响应式数据
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);

// 筛选条件
const filters = reactive({
  subjects: [] as string[],
  scoreRange: "",
  examBatch: [] as string[],
  gradeClass: "",
});

// 排序条件
const sortConfig = ref({
  prop: "",
  order: "",
});

// 模拟数据
const originalData = ref<StudentRecord[]>([]);

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

const scoreRangeOptions = [
  { label: "60分以下", value: "below60", description: "不及格" },
  { label: "60-70分", value: "60-70", description: "及格" },
  { label: "70-80分", value: "70-80", description: "良好" },
  { label: "80-90分", value: "80-90", description: "优秀" },
  { label: "90分以上", value: "above90", description: "卓越" },
];

const examBatchOptions = [
  { label: "第一次月考", value: "第一次月考" },
  { label: "期中考试", value: "期中考试" },
  { label: "第二次月考", value: "第二次月考" },
  { label: "期末考试", value: "期末考试" },
];

// 年级班级级联选项
const gradeClassOptions = [
  {
    label: "高一年级",
    options: [
      { label: "高一(1)班", value: "高一-1班" },
      { label: "高一(2)班", value: "高一-2班" },
      { label: "高一(3)班", value: "高一-3班" },
    ],
  },
  {
    label: "高二年级",
    options: [
      { label: "高二(1)班", value: "高二-1班" },
      { label: "高二(2)班", value: "高二-2班" },
      { label: "高二(3)班", value: "高二-3班" },
    ],
  },
  {
    label: "高三年级",
    options: [
      { label: "高三(1)班", value: "高三-1班" },
      { label: "高三(2)班", value: "高三-2班" },
      { label: "高三(3)班", value: "高三-3班" },
    ],
  },
];

// 计算属性
const filteredData = computed(() => {
  let data = [...originalData.value];

  // 科目筛选
  if (filters.subjects.length > 0) {
    data = data.filter((item) => filters.subjects.includes(item.subject));
  }

  // 分数段筛选
  if (filters.scoreRange) {
    data = data.filter((item) => {
      switch (filters.scoreRange) {
        case "below60":
          return item.score < 60;
        case "60-70":
          return item.score >= 60 && item.score < 70;
        case "70-80":
          return item.score >= 70 && item.score < 80;
        case "80-90":
          return item.score >= 80 && item.score < 90;
        case "above90":
          return item.score >= 90;
        default:
          return true;
      }
    });
  }

  // 考试批次筛选
  if (filters.examBatch.length > 0) {
    data = data.filter((item) => filters.examBatch.includes(item.examBatch));
  }

  // 年级班级筛选
  if (filters.gradeClass) {
    const [grade, className] = filters.gradeClass.split("-");
    data = data.filter((item) => item.grade === grade && item.class === className);
  }

  // 排序
  if (sortConfig.value.prop && sortConfig.value.order) {
    data.sort((ab, cd) => {
      const aVal = ab[sortConfig.value.prop as keyof StudentRecord];
      const bVal = cd[sortConfig.value.prop as keyof StudentRecord];

      if (sortConfig.value.order === "ascending") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  return data;
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

const activeFilterTags = computed(() => {
  const tags: FilterTag[] = [];

  // 科目标签
  filters.subjects.forEach((subject) => {
    tags.push({
      key: `subject-${subject}`,
      label: `科目: ${subject}`,
      value: subject,
    });
  });

  // 分数段标签
  if (filters.scoreRange) {
    const scoreOption = scoreRangeOptions.find((opt) => opt.value === filters.scoreRange);
    tags.push({
      key: `scoreRange-${filters.scoreRange}`,
      label: `分数段: ${scoreOption?.label}`,
      value: filters.scoreRange,
    });
  }

  // 考试批次标签
  filters.examBatch.forEach((batch) => {
    tags.push({
      key: `examBatch-${batch}`,
      label: `批次: ${batch}`,
      value: batch,
    });
  });

  // 年级班级标签
  if (filters.gradeClass) {
    const [grade, className] = filters.gradeClass.split("-");
    tags.push({
      key: `gradeClass-${filters.gradeClass}`,
      label: `班级: ${grade}${className}`,
      value: filters.gradeClass,
    });
  }

  return tags;
});

// 方法
const generateMockData = () => {
  const names = ["张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十"];
  const subjects = ["语文", "数学", "英语", "物理", "化学", "生物", "历史", "地理", "政治"];
  const examBatches = ["第一次月考", "期中考试", "第二次月考", "期末考试"];
  const grades = ["高一", "高二", "高三"];
  const classes = ["1班", "2班", "3班"];

  const data: StudentRecord[] = [];

  for (let i = 1; i <= 200; i++) {
    const grade = grades[Math.floor(Math.random() * grades.length)];
    const className = classes[Math.floor(Math.random() * classes.length)];

    data.push({
      id: i,
      name: names[Math.floor(Math.random() * names.length)] + i,
      studentId: `${grade.slice(1)}${className.slice(0, 1)}${String(i).padStart(2, "0")}`,
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      score: Math.floor(Math.random() * 40) + 60, // 60-100分
      examBatch: examBatches[Math.floor(Math.random() * examBatches.length)],
      grade,
      class: className,
      examDate: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
    });
  }

  return data;
};

const getScoreClass = (score: number) => {
  if (score >= 90) return "text-green-600 font-semibold";
  if (score >= 80) return "text-blue-600 font-semibold";
  if (score >= 70) return "text-yellow-600 font-semibold";
  if (score >= 60) return "text-orange-600";
  return "text-red-600 font-semibold";
};

const handleFilterChange = () => {
  currentPage.value = 1; // 重置到第一页
};

const clearAllFilters = () => {
  filters.subjects = [];
  filters.scoreRange = "";
  filters.examBatch = [];
  filters.gradeClass = "";
  currentPage.value = 1;
};

const removeFilterTag = (tag: FilterTag) => {
  if (tag.key.startsWith("subject-")) {
    const index = filters.subjects.indexOf(tag.value);
    if (index > -1) {
      filters.subjects.splice(index, 1);
    }
  } else if (tag.key.startsWith("scoreRange-")) {
    filters.scoreRange = "";
  } else if (tag.key.startsWith("examBatch-")) {
    const index = filters.examBatch.indexOf(tag.value);
    if (index > -1) {
      filters.examBatch.splice(index, 1);
    }
  } else if (tag.key.startsWith("gradeClass-")) {
    filters.gradeClass = "";
  }
};

const handleSortChange = ({ prop, order }: any) => {
  sortConfig.value = { prop, order };
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

const editRecord = (row: StudentRecord) => {
  ElMessage.info(`编辑学生: ${row.name}`);
};

const deleteRecord = (row: StudentRecord) => {
  ElMessageBox.confirm(`确定要删除学生 ${row.name} 的成绩记录吗？`, "确认删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const index = originalData.value.findIndex((item) => item.id === row.id);
      if (index > -1) {
        originalData.value.splice(index, 1);
        ElMessage.success("删除成功");
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

const exportData = () => {
  ElMessage.success("导出功能待实现");
};

const refreshData = () => {
  loading.value = true;
  setTimeout(() => {
    originalData.value = generateMockData();
    loading.value = false;
    ElMessage.success("数据刷新成功");
  }, 1000);
};

// 生命周期
onMounted(() => {
  originalData.value = generateMockData();
});
</script>

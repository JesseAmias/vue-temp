<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">学生成绩管理系统</h1>

      <!-- 筛选区域 -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">筛选条件</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- 科目筛选 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">科目</label>
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
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">分数段</label>
            <CustomDropdown v-model="filters.scoreRange" :options="scoreRangeOptions" placeholder="选择分数段" filter-type="score" width="100%" @change="handleScoreRangeChange" />
          </div>

          <!-- 考试批次筛选 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">考试批次</label>
            <CustomDropdown v-model="filters.batch" :options="batchOptions" placeholder="选择考试批次" :multiple="true" filter-type="batch" width="100%" @change="handleBatchChange" />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <div class="text-sm text-gray-500">共找到 {{ filteredStudents.length }} 条记录</div>
          <div class="space-x-2">
            <button
              @click="clearAllFilters"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              清除筛选
            </button>
            <button
              @click="exportData"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              导出数据
            </button>
          </div>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">学生成绩列表</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">学号</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">科目</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成绩</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">考试批次</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="student in paginatedStudents" :key="`${student.id}-${student.subject}`">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ student.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ student.studentId }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ student.subject }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span :class="getScoreClass(student.score)">
                    {{ student.score }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ student.batch }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              显示第 {{ (currentPage - 1) * pageSize + 1 }} 到 {{ Math.min(currentPage * pageSize, filteredStudents.length) }} 条， 共 {{ filteredStudents.length }} 条记录
            </div>
            <div class="flex space-x-2">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import CustomDropdown from "./CustomDropdown2.vue";

// 定义数据类型
interface Student {
  id: string;
  name: string;
  studentId: string;
  subject: string;
  score: number;
  batch: string;
}

// 模拟学生数据
const students = ref<Student[]>([
  { id: "1", name: "张三", studentId: "2023001", subject: "语文", score: 85, batch: "期中考试" },
  { id: "2", name: "张三", studentId: "2023001", subject: "数学", score: 92, batch: "期中考试" },
  { id: "3", name: "张三", studentId: "2023001", subject: "英语", score: 78, batch: "期中考试" },
  { id: "4", name: "李四", studentId: "2023002", subject: "语文", score: 76, batch: "期中考试" },
  { id: "5", name: "李四", studentId: "2023002", subject: "数学", score: 88, batch: "期中考试" },
  { id: "6", name: "李四", studentId: "2023002", subject: "英语", score: 82, batch: "期中考试" },
  { id: "7", name: "王五", studentId: "2023003", subject: "语文", score: 94, batch: "期末考试" },
  { id: "8", name: "王五", studentId: "2023003", subject: "数学", score: 87, batch: "期末考试" },
  { id: "9", name: "王五", studentId: "2023003", subject: "英语", score: 91, batch: "期末考试" },
  { id: "10", name: "赵六", studentId: "2023004", subject: "语文", score: 58, batch: "期末考试" },
  { id: "11", name: "赵六", studentId: "2023004", subject: "数学", score: 65, batch: "期末考试" },
  { id: "12", name: "赵六", studentId: "2023004", subject: "英语", score: 72, batch: "期末考试" },
]);

// 筛选条件
const filters = reactive({
  subjects: [] as string[],
  scoreRange: "" as string,
  batch: [] as string[],
});

// 分页
const currentPage = ref(1);
const pageSize = ref(10);

// 筛选选项配置
const subjectOptions = [
  { label: "语文", value: "语文", description: "语言文学科目" },
  { label: "数学", value: "数学", description: "数理逻辑科目" },
  { label: "英语", value: "英语", description: "外国语言科目" },
  { label: "物理", value: "物理", description: "自然科学科目" },
  { label: "化学", value: "化学", description: "化学科学科目" },
  { label: "生物", value: "生物", description: "生命科学科目" },
];

const scoreRangeOptions = [
  { label: "不及格 (0-59)", value: "0-59", description: "需要重点关注的学生" },
  { label: "及格 (60-69)", value: "60-69", description: "达到基本要求" },
  { label: "良好 (70-79)", value: "70-79", description: "表现良好的学生" },
  { label: "优秀 (80-89)", value: "80-89", description: "成绩优秀的学生" },
  { label: "卓越 (90-100)", value: "90-100", description: "成绩卓越的学生" },
];

const batchOptions = [
  { label: "期中考试", value: "期中考试", description: "学期中期测试" },
  { label: "期末考试", value: "期末考试", description: "学期末期测试" },
  { label: "月考", value: "月考", description: "每月定期测试" },
  { label: "模拟考试", value: "模拟考试", description: "模拟正式考试" },
];

// 计算属性
const filteredStudents = computed(() => {
  let result = students.value;

  // 科目筛选
  if (filters.subjects.length > 0) {
    result = result.filter((student) => filters.subjects.includes(student.subject));
  }

  // 分数段筛选
  if (filters.scoreRange) {
    const [min, max] = filters.scoreRange.split("-").map(Number);
    result = result.filter((student) => student.score >= min && student.score <= max);
  }

  // 考试批次筛选
  if (filters.batch.length > 0) {
    result = result.filter((student) => filters.batch.includes(student.batch));
  }

  return result;
});

const totalPages = computed(() => Math.ceil(filteredStudents.value.length / pageSize.value));

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredStudents.value.slice(start, end);
});

// 方法
const getScoreClass = (score: number): string => {
  if (score >= 90) return "text-green-600 font-semibold";
  if (score >= 80) return "text-blue-600 font-semibold";
  if (score >= 70) return "text-yellow-600 font-semibold";
  if (score >= 60) return "text-orange-600 font-semibold";
  return "text-red-600 font-semibold";
};

const clearAllFilters = () => {
  filters.subjects = [];
  filters.scoreRange = "";
  filters.batch = [];
  currentPage.value = 1;
};

const exportData = () => {
  // 模拟导出功能
  console.log("导出数据:", filteredStudents.value);
  alert("导出功能已触发，请查看控制台");
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// 事件处理
const handleSubjectChange = (value: string[], options: any[]) => {
  console.log("科目筛选变更:", value, options);
  currentPage.value = 1;
};

const handleScoreRangeChange = (value: string, option: any) => {
  console.log("分数段筛选变更:", value, option);
  currentPage.value = 1;
};

const handleBatchChange = (value: string[], options: any[]) => {
  console.log("考试批次筛选变更:", value, options);
  currentPage.value = 1;
};
</script>

<style scoped>
/* 如果需要自定义样式，可以在这里添加 */
</style>

<!-- CustomDropdown.vue -->
<template>
  <div class="custom-dropdown" :class="{ 'is-disabled': disabled }">
    <!-- 下拉触发器 -->
    <div
      ref="triggerRef"
      class="dropdown-trigger"
      :class="[
        'flex items-center justify-between px-3 py-2 border rounded-md cursor-pointer transition-all duration-200',
        {
          'border-blue-500 ring-2 ring-blue-200': isOpen,
          'border-gray-300 hover:border-gray-400': !isOpen && !disabled,
          'border-gray-200 bg-gray-50 cursor-not-allowed': disabled,
          'bg-white': !disabled,
        },
      ]"
      @click="toggleDropdown"
    >
      <div class="flex-1 truncate">
        <span v-if="displayText" class="text-gray-900">{{ displayText }}</span>
        <span v-else class="text-gray-400">{{ placeholder }}</span>
      </div>
      <el-icon class="text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': isOpen }">
        <ArrowDown />
      </el-icon>
    </div>

    <!-- 下拉菜单 -->
    <Teleport to="body">
      <div v-if="isOpen" ref="dropdownRef" class="dropdown-menu fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg min-w-[200px] max-h-[300px] overflow-y-auto" :style="dropdownStyle">
        <!-- 搜索框 -->
        <div v-if="filterable" class="p-2 border-b border-gray-100">
          <el-input v-model="searchKeyword" size="small" placeholder="搜索选项..." clearable @input="handleSearch" class="h-[35px]">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 全选/清空按钮 (多选模式) -->
        <div v-if="multiple && showSelectAll" class="p-2 border-b border-gray-100 flex gap-2">
          <el-button size="small" text @click="selectAll">全选</el-button>
          <el-button size="small" text @click="clearAll">清空</el-button>
        </div>

        <!-- 选项列表 -->
        <div class="py-1">
          <!-- 分组选项 -->
          <template v-if="isGrouped">
            <div v-for="group in filteredGroupedOptions" :key="group.label" class="group-section">
              <div class="group-header px-3 py-2 text-sm font-medium text-gray-500 bg-gray-50">
                {{ group.label }}
              </div>
              <div
                v-for="option in group.options"
                :key="getOptionKey(option)"
                class="option-item flex items-center px-3 py-2 cursor-pointer transition-colors duration-150"
                :class="[getOptionClass(option), { 'bg-blue-50 text-blue-600': isSelected(option) }]"
                @click="handleOptionClick(option)"
                @mouseenter="handleOptionHover(option)"
              >
                <!-- 多选复选框 -->
                <el-checkbox v-if="multiple" :model-value="isSelected(option)" class="mr-2" @change="handleOptionClick(option)" />

                <!-- 选项内容 -->
                <div class="flex-1">
                  <div class="flex items-center">
                    <!-- 自定义图标 -->
                    <el-icon v-if="option.icon" class="mr-2 text-gray-400">
                      <component :is="option.icon" />
                    </el-icon>

                    <!-- 选项标签 -->
                    <span class="truncate">{{ getOptionLabel(option) }}</span>

                    <!-- 选项描述 -->
                    <span v-if="option.description" class="ml-2 text-xs text-gray-400 truncate">
                      {{ option.description }}
                    </span>
                  </div>
                </div>

                <!-- 单选选中标记 -->
                <el-icon v-if="!multiple && isSelected(option)" class="text-blue-600 ml-2">
                  <Check />
                </el-icon>

                <!-- 级联箭头 -->
                <el-icon v-if="option.children && option.children.length" class="text-gray-400 ml-2">
                  <ArrowRight />
                </el-icon>
              </div>
            </div>
          </template>

          <!-- 普通选项 -->
          <template v-else>
            <div
              v-for="option in filteredOptions"
              :key="getOptionKey(option)"
              class="option-item flex items-center px-3 py-2 cursor-pointer transition-colors duration-150"
              :class="[getOptionClass(option), { 'bg-blue-50 text-blue-600': isSelected(option) }]"
              @click="handleOptionClick(option)"
              @mouseenter="handleOptionHover(option)"
            >
              <!-- 多选复选框 -->
              <el-checkbox v-if="multiple" :model-value="isSelected(option)" class="mr-2" @change="handleOptionClick(option)" />

              <!-- 选项内容 -->
              <div class="flex-1">
                <div class="flex items-center">
                  <!-- 自定义图标 -->
                  <el-icon v-if="option.icon" class="mr-2 text-gray-400">
                    <component :is="option.icon" />
                  </el-icon>

                  <!-- 选项标签 -->
                  <span class="truncate">{{ getOptionLabel(option) }}</span>

                  <!-- 选项描述 -->
                  <span v-if="option.description" class="ml-2 text-xs text-gray-400 truncate">
                    {{ option.description }}
                  </span>
                </div>
              </div>

              <!-- 单选选中标记 -->
              <el-icon v-if="!multiple && isSelected(option)" class="text-blue-600 ml-2">
                <Check />
              </el-icon>

              <!-- 级联箭头 -->
              <el-icon v-if="option.children && option.children.length" class="text-gray-400 ml-2">
                <ArrowRight />
              </el-icon>
            </div>

            <!-- 无数据 -->
            <div v-if="!filteredOptions.length" class="px-3 py-8 text-center text-gray-400 text-sm">
              {{ searchKeyword ? "无匹配选项" : "暂无数据" }}
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// import { ref, computed, watch, nextTick, onMounted, onUnmounted, reactive } from "vue";
import { ArrowDown, Search, Check, ArrowRight } from "@element-plus/icons-vue";

// 选项类型定义
interface DropdownOption {
  label: string;
  value: any;
  disabled?: boolean;
  icon?: any;
  description?: string;
  children?: DropdownOption[];
  [key: string]: any;
}

// 分组选项类型
interface GroupedOption {
  label: string;
  options: DropdownOption[];
}

// Props 定义
interface Props {
  modelValue?: any;
  options?: DropdownOption[] | GroupedOption[];
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  filterable?: boolean;
  showSelectAll?: boolean;
  valueKey?: string;
  labelKey?: string;
  size?: "large" | "default" | "small";
  maxHeight?: number;
  popperClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  options: () => [],
  multiple: false,
  placeholder: "请选择",
  disabled: false,
  clearable: false,
  filterable: false,
  showSelectAll: true,
  valueKey: "value",
  labelKey: "label",
  size: "default",
  maxHeight: 300,
  popperClass: "",
});

const emit = defineEmits<{
  "update:modelValue": [value: any];
  change: [value: any];
  clear: [];
  "visible-change": [visible: boolean];
  "option-hover": [option: DropdownOption];
}>();

const isOpen = ref(false);
const searchKeyword = ref("");
const triggerRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const dropdownStyle = ref({});

const isGrouped = computed(() => {
  return props.options.length > 0 && "options" in props.options[0];
});

const flatOptions = computed(() => {
  if (isGrouped.value) {
    return (props.options as GroupedOption[]).reduce((acc, group) => {
      return acc.concat(group.options);
    }, [] as DropdownOption[]);
  }
  return props.options as DropdownOption[];
});

const filteredOptions = computed(() => {
  if (!searchKeyword.value) return flatOptions.value;

  const keyword = searchKeyword.value.toLowerCase();
  return flatOptions.value.filter((option) => getOptionLabel(option).toLowerCase().includes(keyword) || (option.description && option.description.toLowerCase().includes(keyword)));
});

const filteredGroupedOptions = computed(() => {
  if (!isGrouped.value) return [];

  const keyword = searchKeyword.value.toLowerCase();
  return (props.options as GroupedOption[])
    .map((group) => ({
      ...group,
      options: group.options.filter((option) => !keyword || getOptionLabel(option).toLowerCase().includes(keyword) || (option.description && option.description.toLowerCase().includes(keyword))),
    }))
    .filter((group) => group.options.length > 0);
});

const selectedValues = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) ? props.modelValue : [];
  }
  return props.modelValue !== undefined ? [props.modelValue] : [];
});

const displayText = computed(() => {
  if (!selectedValues.value.length) return "";

  const selectedOptions = flatOptions.value.filter((option) => selectedValues.value.includes(getOptionValue(option)));

  if (props.multiple) {
    if (selectedOptions.length === 1) {
      return getOptionLabel(selectedOptions[0]);
    } else if (selectedOptions.length > 1) {
      return `已选择 ${selectedOptions.length} 项`;
    }
    return "";
  } else {
    return selectedOptions.length ? getOptionLabel(selectedOptions[0]) : "";
  }
});

// 方法
const getOptionKey = (option: DropdownOption) => {
  return getOptionValue(option);
};

const getOptionValue = (option: DropdownOption) => {
  return option[props.valueKey];
};

const getOptionLabel = (option: DropdownOption) => {
  return option[props.labelKey];
};

const isSelected = (option: DropdownOption) => {
  return selectedValues.value.includes(getOptionValue(option));
};

const getOptionClass = (option: DropdownOption) => {
  return {
    "hover:bg-gray-50": !option.disabled && !isSelected(option),
    "text-gray-400 cursor-not-allowed": option.disabled,
    "cursor-pointer": !option.disabled,
  };
};

const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
  isOpen.value = false;
};

const handleOptionClick = (option: DropdownOption) => {
  if (option.disabled) return;

  const value = getOptionValue(option);

  if (props.multiple) {
    const newValue = [...selectedValues.value];
    const index = newValue.indexOf(value);

    if (index > -1) {
      newValue.splice(index, 1);
    } else {
      newValue.push(value);
    }

    emit("update:modelValue", newValue);
    emit("change", newValue);
  } else {
    emit("update:modelValue", value);
    emit("change", value);
    closeDropdown();
  }
};

const handleOptionHover = (option: DropdownOption) => {
  emit("option-hover", option);
};

const selectAll = () => {
  const allValues = flatOptions.value.filter((option) => !option.disabled).map((option) => getOptionValue(option));

  emit("update:modelValue", allValues);
  emit("change", allValues);
};

const clearAll = () => {
  emit("update:modelValue", []);
  emit("change", []);
};

const handleSearch = (value: string) => {
  searchKeyword.value = value;
};

// 位置计算
const updateDropdownPosition = async () => {
  if (!isOpen.value || !triggerRef.value || !dropdownRef.value) return;

  await nextTick();

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const dropdownEl = dropdownRef.value;
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  let top = triggerRect.bottom + 4;
  let left = triggerRect.left;

  // 检查底部空间
  if (top + dropdownEl.offsetHeight > viewportHeight) {
    top = triggerRect.top - dropdownEl.offsetHeight - 4;
  }

  // 检查右侧空间
  if (left + dropdownEl.offsetWidth > viewportWidth) {
    left = viewportWidth - dropdownEl.offsetWidth - 16;
  }

  // 确保不超出左边界
  if (left < 16) {
    left = 16;
  }

  dropdownStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    minWidth: `${triggerRect.width}px`,
    maxHeight: `${props.maxHeight}px`,
  };
};

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  if (!isOpen.value) return;

  const target = event.target as HTMLElement;
  if (!triggerRef.value?.contains(target) && !dropdownRef.value?.contains(target)) {
    closeDropdown();
  }
};

// 生命周期
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("scroll", updateDropdownPosition);
  window.addEventListener("resize", updateDropdownPosition);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("scroll", updateDropdownPosition);
  window.removeEventListener("resize", updateDropdownPosition);
});

// 监听器
watch(isOpen, (newVal) => {
  emit("visible-change", newVal);
  if (newVal) {
    updateDropdownPosition();
    searchKeyword.value = "";
  }
});

// 暴露方法
defineExpose({
  focus: () => triggerRef.value?.focus(),
  blur: closeDropdown,
  clear: clearAll,
});
</script>

<style scoped>
.custom-dropdown {
  position: relative;
  display: inline-block;
  width: 100%;
}

.dropdown-trigger {
  user-select: none;
}

.dropdown-menu {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.option-item {
  user-select: none;
}

.group-header {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* 滚动条样式 */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

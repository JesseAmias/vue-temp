<template>
  <div class="relative inline-block" ref="dropdownRef">
    <!-- 触发器 -->
    <div
      @click="toggleDropdown"
      :class="[
        'flex items-center justify-between px-3 py-2 border rounded-md cursor-pointer transition-colors',
        'hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        isOpen ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300',
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
      ]"
      :style="{ minWidth: width }"
    >
      <span :class="['flex-1 text-left', getDisplayTextClass()]"> {{ displayText }} </span>
      <el-icon :class="['ml-2 transition-transform', isOpen ? 'rotate-180' : '']" :size="16">
        <ArrowDown />
      </el-icon>
    </div>

    <!-- 下拉面板 -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div v-show="isOpen" :class="['absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg', 'max-h-60 overflow-auto']" :style="{ minWidth: width }">
        <!-- 搜索框 (可选) -->
        <div v-if="searchable" class="p-2 border-b border-gray-100">
          <input
            v-model="searchKeyword"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            @click.stop
          />
        </div>

        <!-- 全选选项 (多选模式下) -->
        <div v-if="multiple && showSelectAll" @click="handleSelectAll" class="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
          <input type="checkbox" :checked="isAllSelected" :indeterminate="isIndeterminate" class="mr-2 text-blue-600 focus:ring-blue-500 cursor-pointer" />
          <span class="text-sm text-gray-700">全选</span>
        </div>

        <!-- 选项列表 -->
        <div v-if="filteredOptions.length === 0" class="px-3 py-2 text-sm text-gray-500 text-center">
          {{ noDataText }}
        </div>

        <div
          v-for="option in filteredOptions"
          :key="getOptionKey(option)"
          @click="handleOptionClick(option)"
          :class="['flex items-center px-3 py-2 cursor-pointer transition-colors', 'hover:bg-blue-50', isOptionSelected(option) ? 'bg-blue-100 text-blue-700' : 'text-gray-700']"
        >
          <!-- 多选框 -->
          <input v-if="multiple" type="checkbox" :checked="isOptionSelected(option)" class="mr-2 text-blue-600 focus:ring-blue-500" @click.stop />

          <!-- 选项内容 -->
          <div class="flex-1">
            <div class="text-sm font-medium">
              {{ getOptionLabel(option) }}
            </div>
          </div>

          <!-- 选中标记 (单选模式) -->
          <el-Icon v-if="!multiple && isOptionSelected(option)" class="text-blue-600" :size="16">
            <Check />
          </el-Icon>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ArrowDown, Check } from "@element-plus/icons-vue";
import type { DropdownOption } from "../type";

// 定义组件属性
interface Props {
  // 基础配置
  modelValue?: any;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  width?: string;

  // 选择模式
  multiple?: boolean;
  showSelectAll?: boolean;

  // 搜索功能
  searchable?: boolean;
  searchPlaceholder?: string;

  // 自定义字段映射
  labelKey?: string;
  valueKey?: string;

  // 选项无数据时显示文本
  noDataText?: string;

  // 筛选类型
  filterType?: "subject" | "score" | "batch" | "custom";
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  options: () => [],
  placeholder: "请选择",
  disabled: false,
  clearable: true,
  width: "200px",
  multiple: false,
  showSelectAll: true,
  searchable: false,
  searchPlaceholder: "搜索选项...",
  labelKey: "label",
  valueKey: "value",
  noDataText: "暂无数据",
  filterType: "custom",
});

const emit = defineEmits<{
  "update:modelValue": [value: any];
  change: [value: any, options: DropdownOption | DropdownOption[]];
  clear: [];
  "visible-change": [visible: boolean];
}>();

const isOpen = ref(false);
const searchKeyword = ref("");
const dropdownRef = ref<HTMLElement>();

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const selectedValues = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) ? props.modelValue : [];
  }
  return props.modelValue !== undefined ? [props.modelValue] : [];
});

const filteredOptions = computed(() => {
  let options = props.options.filter((option) => !option.disabled);

  if (props.searchable && searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    options = options.filter((option) => getOptionLabel(option).toLowerCase().includes(keyword));
  }

  return options;
});

const displayText = computed(() => {
  if (selectedValues.value.length === 0) {
    return props.placeholder;
  }

  if (props.multiple) {
    if (selectedValues.value.length === 1) {
      const option = props.options.find((opt) => getOptionValue(opt) === selectedValues.value[0]);
      return option ? getOptionLabel(option) : props.placeholder;
    }
    return `已选择 ${selectedValues.value.length} 项`;
  } else {
    const option = props.options.find((opt) => getOptionValue(opt) === props.modelValue);
    return option ? getOptionLabel(option) : props.placeholder;
  }
});

const isAllSelected = computed(() => {
  if (!props.multiple || filteredOptions.value.length === 0) return false;
  return filteredOptions.value.every((option) => selectedValues.value.includes(getOptionValue(option)));
});

const isIndeterminate = computed(() => {
  if (!props.multiple) return false;
  const selectedCount = filteredOptions.value.filter((option) => selectedValues.value.includes(getOptionValue(option))).length;
  return selectedCount > 0 && selectedCount < filteredOptions.value.length;
});

// 监听器
watch(
  () => isOpen.value,
  (newVal) => {
    if (newVal) {
      searchKeyword.value = "";
    }
  },
);

// 获取选项标签
const getOptionLabel = (option: DropdownOption): string => {
  return option[props.labelKey] || option.label || String(option);
};

const getOptionValue = (option: DropdownOption): any => {
  return option[props.valueKey] !== undefined ? option[props.valueKey] : option.value;
};

const getOptionKey = (option: DropdownOption): string => {
  return `${getOptionValue(option)}_${getOptionLabel(option)}`;
};

const getDisplayTextClass = (): string => {
  console.log("selectedValues.value结果:\n", selectedValues.value);
  return selectedValues.value.length === 0 ? "text-gray-400" : "text-gray-900";
};

const isOptionSelected = (option: DropdownOption): boolean => {
  return selectedValues.value.includes(getOptionValue(option));
};

const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  emit("visible-change", isOpen.value);
};

const handleOptionClick = (option: DropdownOption) => {
  const value = getOptionValue(option);

  if (props.multiple) {
    const newValues = [...selectedValues.value];
    const index = newValues.indexOf(value);

    if (index > -1) {
      newValues.splice(index, 1);
    } else {
      newValues.push(value);
    }

    emit("update:modelValue", newValues);
    emit(
      "change",
      newValues,
      props.options.filter((opt) => newValues.includes(getOptionValue(opt))),
    );
  } else {
    emit("update:modelValue", value);
    emit("change", value, option);
    isOpen.value = false;
    emit("visible-change", false);
  }
};

const handleSelectAll = () => {
  if (!props.multiple) return;

  if (isAllSelected.value) {
    // 取消全选
    // newValues：选中的值中，没有包含在已过滤的选项中（如：某些值是disabled，保留其被选中状态）
    const newValues = selectedValues.value.filter((val) => !filteredOptions.value.some((option) => getOptionValue(option) === val));
    emit("update:modelValue", newValues);
    emit(
      "change",
      newValues,
      props.options.filter((opt) => newValues.includes(getOptionValue(opt))),
    );
  } else {
    // 全选
    const allValues = [...selectedValues.value];
    filteredOptions.value.forEach((option) => {
      const value = getOptionValue(option);
      !allValues.includes(value) && allValues.push(value);
    });
    emit("update:modelValue", allValues);
    emit(
      "change",
      allValues,
      props.options.filter((opt) => allValues.includes(getOptionValue(opt))),
    );
  }
};

const handleClear = () => {
  if (props.multiple) {
    emit("update:modelValue", []);
    emit("change", [], []);
  } else {
    emit("update:modelValue", undefined);
    emit("change", undefined, []);
  }
  emit("clear");
};

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    if (isOpen.value) {
      isOpen.value = false;
      emit("visible-change", false);
    }
  }
};

// 暴露方法
defineExpose({
  focus: () => dropdownRef.value?.focus(),
  blur: () => {
    isOpen.value = false;
    emit("visible-change", false);
  },
  clear: handleClear,
});
</script>

<style scoped lang="scss"></style>

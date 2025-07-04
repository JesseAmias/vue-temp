<template>
  <div class="relative inline-block" ref="dropdownRef">
    <div
      @click="toggleDropdown"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      :class="[
        'flex items-center justify-between px-[8px] min-h-[36px] border rounded-md cursor-pointer transition-colors',
        'hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        isOpen ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300',
        disabled ? themeConfig.triggerDisabled + ' cursor-not-allowed' : themeConfig.trigger,
      ]"
      :style="{ minWidth: width }"
    >
      <template v-if="multiple && displayText?.length">
        <div class="flex flex-wrap justify-start">
          <div v-for="(label, index) in displayText" :key="index" :class="['flex items-center p-[2px_8px]  m-[3px_4px_3px_0] rounded shrink-0', themeConfig.inputText]">
            <span :class="[themeConfig.inputSpan]"> {{ label }} </span>
            <el-icon :class="['ml-[8px]', themeConfig.closeIconText]" @click.stop="removeSelectedOption(label)"><Close /></el-icon>
          </div>
        </div>
      </template>
      <template v-else>
        <span :class="[themeConfig.inputSpan, getDisplayTextClass()]"> {{ displayText.length ? displayText : placeholder }} </span>
      </template>

      <!-- <el-icon :class="['ml-2 transition-transform', isOpen ? 'rotate-180' : '']" :size="16"> -->
      <el-icon color="rgba(0, 0, 0, .4)" :class="['ml-2 transition-transform', themeConfig.clearIconText]" :size="16">
        <ArrowDown v-if="!dropdownHover" />
        <CircleCloseFilled v-else @click.stop="handleClear()" />
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
      <div v-show="isOpen" :class="['absolute z-50 mt-1 border rounded-md shadow-lg', 'max-h-60 overflow-auto', themeConfig.dropdown]" :style="{ minWidth: width }">
        <!-- 搜索框 (可选) -->
        <div v-if="searchable" :class="['p-2 border-b', themeConfig.selectAll]">
          <input
            v-model="searchKeyword"
            type="text"
            :placeholder="searchPlaceholder"
            :class="['w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1', themeConfig.search]"
            @click.stop
          />
        </div>

        <!-- 全选选项 (多选模式下) -->
        <div v-if="multiple && showSelectAll" @click="handleSelectAll" :class="['flex items-center px-3 py-2 cursor-pointer border-b', themeConfig.option, themeConfig.selectAll]">
          <input type="checkbox" :checked="isAllSelected" :indeterminate="isIndeterminate" class="mr-2 text-blue-600 focus:ring-blue-500 cursor-pointer" />
          <span :class="['text-sm text-gray-700', themeConfig.optionSearch]">全选</span>
        </div>

        <!-- 选项列表 -->
        <div v-if="filteredOptions.length === 0" :class="['px-3 py-2 text-sm text-center', themeConfig.noData]">
          {{ noDataText }}
        </div>

        <div
          v-for="option in filteredOptions"
          :key="getOptionKey(option)"
          @click="handleOptionClick(option)"
          :class="['flex items-center px-3 py-2 cursor-pointer transition-colors', isOptionSelected(option) ? themeConfig.optionSelected : themeConfig.option]"
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
import { ArrowDown, Check, Close, CircleCloseFilled } from "@element-plus/icons-vue";
import type { DropdownOption, Props } from "../types/customDropdown";

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
  theme: "light",
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
const dropdownHover = ref(false);

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
    return props.multiple ? [] : "";
  }

  if (props.multiple) {
    return selectedValues.value.map((value) => {
      const option = props.options.find((opt) => getOptionValue(opt) === value);
      return option ? getOptionLabel(option) : "";
    });
  } else {
    const option = props.options.find((opt) => getOptionValue(opt) === props.modelValue);
    return option ? getOptionLabel(option) : "";
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

const themeConfig = computed(() => {
  const themes = {
    light: {
      trigger: "bg-white border-gray-300 text-gray-900 hover:border-blue-500 focus:border-blue-500 focus:ring-blue-500",
      triggerDisabled: "bg-gray-100",
      dropdown: "bg-white border-gray-200",
      inputText: "bg-[#e8e8e8]",
      inputSpan: "",
      closeIconText: "text-black/40 hover:text-black/80",
      clearIconText: "",
      option: "text-gray-700 hover:bg-blue-50",
      optionSelected: "bg-blue-100 text-blue-700",
      search: "border-gray-300 focus:ring-blue-500",
      optionSearch: "border-gray-700 focus:ring-blue-500",
      selectAll: "border-gray-100",
      noData: "text-gray-500",
    },
    dark: {
      trigger: "bg-gray-800 border-gray-600 text-gray-100 hover:border-blue-500 focus:border-blue-400 focus:ring-blue-400",
      triggerDisabled: "bg-gray-700",
      dropdown: "bg-gray-800 border-gray-600 dark custom-scroll",
      inputText: "bg-[#393939]",
      inputSpan: "text-white/80",
      closeIconText: "text-white/35 hover:text-white/80",
      clearIconText: "text-white/60 hover:text-white/80",
      option: "text-gray-200 hover:bg-gray-700",
      optionSelected: "bg-blue-900 text-blue-200",
      search: "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-400",
      optionSearch: "text-gray-100",
      selectAll: "border-gray-600",
      noData: "text-gray-400",
    },
  };
  return themes[props.theme];
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

const removeSelectedOption = (label: string) => {
  if (props.multiple) {
    const newValues = selectedValues.value.filter((val) => val !== label);
    emit("update:modelValue", newValues);
    emit(
      "change",
      newValues,
      props.options.filter((opt) => newValues.includes(getOptionValue(opt))),
    );
  }
};

const handleMouseEnter = () => {
  dropdownHover.value = true;
};

const handleMouseLeave = () => {
  dropdownHover.value = false;
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

defineExpose({
  focus: () => dropdownRef.value?.focus(),
  blur: () => {
    isOpen.value = false;
    emit("visible-change", false);
  },
  clear: handleClear,
});
</script>

<style scoped lang="scss">
.custom-scroll::-webkit-scrollbar {
  width: 8px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(100, 100, 100, 0.6);
  border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-track {
  background-color: rgba(30, 30, 30, 0.2);
}

.dark .custom-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(160, 160, 160, 0.6);
}
.dark .custom-scroll::-webkit-scrollbar-track {
  background-color: rgba(50, 50, 50, 0.4);
}
</style>

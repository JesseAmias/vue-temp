<template>
  <el-select v-model="selectedValue" :multiple="multiple" :placeholder="placeholder" class="w-full" @change="handleChange" clearable>
    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" class="hover:bg-blue-100" />
  </el-select>
</template>

<script lang="ts" setup>
import type { PropType } from "vue";

interface Option {
  label: string;
  value: string | number;
}

const props = defineProps({
  modelValue: {
    type: [String, Number, Array] as PropType<string | number | Array<string | number>>,
    default: () => [],
  },
  options: {
    type: Array as PropType<Option[]>,
    required: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "请选择",
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", val: string | number | Array<string | number>): void;
  (e: "change", val: string | number | Array<string | number>): void;
}>();

const selectedValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    selectedValue.value = val;
  },
);

const handleChange = (val: typeof selectedValue.value) => {
  emit("update:modelValue", val);
  emit("change", val);
};
</script>

<style scoped>
.el-select-dropdown__item.selected {
  @apply bg-blue-200 text-white;
}
</style>

import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import CustomDropdown from "./CustomDropdown.vue";
import type { DropdownOption } from "../types/customDropdown";

const options: DropdownOption[] = [
  { label: "Option A", value: "a" },
  { label: "Option B", value: "b" },
  { label: "Option C", value: "c", disabled: true },
];

describe("CustomDropdown", () => {
  it("测试下拉菜单组件渲染", () => {
    const wrapper = mount(CustomDropdown, {
      props: {
        options,
        modelValue: undefined,
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("测试点击下拉菜单渲染选项", async () => {
    const wrapper = mount(CustomDropdown, {
      props: {
        options,
        modelValue: undefined,
      },
    });
    const trigger = wrapper.find("div.cursor-pointer");
    await trigger.trigger("click");

    expect(wrapper.vm.isOpen).toBe(true);
    expect(wrapper.findAll("div").some((el) => el.text().includes("Option A"))).toBe(true);
  });

  it("测试多选点击与事件发送", async () => {
    const wrapper = mount(CustomDropdown, {
      props: {
        options,
        modelValue: undefined,
        multiple: true,
      },
    });

    await wrapper.find("div.cursor-pointer").trigger("click");
    const optionEl = wrapper.findAll(".filter-options").find((el) => el.text().includes("Option A"));
    await optionEl?.trigger("click");

    const optionElB = wrapper.findAll(".filter-options").find((el) => el.text().includes("Option B"));
    await optionElB?.trigger("click");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("change")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["a"]]);
    expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([["b"]]);
  });

  it("测试单选点击与事件发送", async () => {
    const wrapper = mount(CustomDropdown, {
      props: {
        options,
        modelValue: undefined,
        multiple: false,
      },
    });
    await wrapper.find("div.cursor-pointer").trigger("click");
    const optionEl = wrapper.findAll(".filter-options").find((el) => el.text().includes("Option A"));
    await optionEl?.trigger("click");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["a"]);
  });

  it("渲染选择多个选项的值", async () => {
    const wrapper = mount(CustomDropdown, {
      props: {
        options,
        modelValue: ["a", "b"],
        multiple: true,
      },
    });
    const labelEls = wrapper.findAll(".label-text");
    const labelTexts = labelEls.map((item) => item.text());
    expect(labelTexts).toContain("Option A");
    expect(labelTexts).toContain("Option B");
    expect(labelTexts).not.toContain("Option C");
  });

  it("handleSelectAll", async () => {
    const wrapper = mount(CustomDropdown, {
      props: {
        options,
        modelValue: [],
        multiple: true,
        showSelectAll: true,
      },
    });

    await wrapper.find("div.cursor-pointer").trigger("click");
    const selectAll = wrapper.findAll(".select-all").find((el) => el.text().includes("全选"));
    await selectAll?.trigger("click");
    const emitted = wrapper.emitted("update:modelValue")?.pop()?.[0];
    expect(emitted).toContain("a");
    expect(emitted).toContain("b");
    expect(emitted).not.toContain("c");
  });

  it("removeSelectedOption", async () => {
    const wrapper = mount(CustomDropdown, {
      props: {
        options,
        modelValue: ["a", "b"],
        multiple: true,
      },
    });
    const removeIncnEls = wrapper.findAll(".remove-icon");
    await removeIncnEls[0].trigger("click");
    expect(wrapper.emitted("update:modelValue")?.pop()?.[0]).toEqual(["b"]);
  });

  it("测试handleClear清除多选", async () => {
    const wrapper = mount(CustomDropdown, {
      props: {
        options,
        modelValue: ["a", "b"],
        multiple: true,
      },
    });
    await wrapper.find(".dropdown-box").trigger("mouseenter");
    await wrapper.find(".clear-icon").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.pop()?.[0]).toEqual([]);

    const emitted = wrapper.emitted("change")?.pop();
    emitted && expect(emitted).toEqual([[], []]);
    expect(wrapper.emitted("clear")).toBeTruthy();
  });

  it("测试handleClear清除单选", async () => {
    const wrapper = mount(CustomDropdown, {
      props: {
        options,
        modelValue: ["a"],
        multiple: false,
      },
    });
    await wrapper.find(".dropdown-box").trigger("mouseenter");
    await wrapper.find(".clear-icon").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.pop()?.[0]).toBe(undefined);
    expect(wrapper.emitted("change")?.pop()).toEqual([undefined, []]);
    expect(wrapper.emitted("clear")).toBeTruthy();
  });

  it("handleClickOutside", async () => {
    const wrapper = mount(CustomDropdown, {
      props: {
        options,
        modelValue: [],
        multiple: true,
      },
      attachTo: document.body,
    });

    await wrapper.find("div.cursor-pointer").trigger("click");
    expect(wrapper.vm.isOpen).toBe(true);

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(clickEvent);

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isOpen).toBe(false);
    expect(wrapper.emitted("visible-change")).toBeTruthy();
    expect(wrapper.emitted("visible-change")?.pop()?.[0]).toBe(false);

    wrapper.unmount();
  });

  describe("测试defineExpose", () => {
    it("测试focus", () => {
      const wrapper = mount(CustomDropdown);

      const mockFocus = vi.fn();
      wrapper.vm.focus = mockFocus;

      wrapper.vm.focus();
      expect(mockFocus).toHaveBeenCalled();
    });

    it("测试blur", () => {
      const wrapper = mount(CustomDropdown, {
        props: {
          options,
          isOpen: true,
        },
      });
      wrapper.vm.blur();

      expect(wrapper.vm.isOpen).toBe(false);
      expect(wrapper.emitted("visible-change")).toBeTruthy();
      expect(wrapper.emitted("visible-change")?.pop()?.[0]).toBe(false);
    });
  });

  it("handleMouseLeave", () => {
    const wrapper = mount(CustomDropdown, {
      props: {
        options,
      },
    });

    const dropdownEL = wrapper.find(".dropdown-box");
    dropdownEL.trigger("mouseenter");
    dropdownEL.trigger("mouseleave");
    const vm = wrapper.vm as any;
    expect(vm.dropdownHover).toBe(false);
  });
});

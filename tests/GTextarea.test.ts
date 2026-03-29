import { describe, expect, it } from "vitest";
import { ref } from "vue";
import GTextarea from "../packages/grad-vue/src/components/GTextarea.vue";
import { mnt, testAccessibility } from "./test-utils";

describe("GTextarea", () => {
    describe("Functional Tests", () => {
        it("renders with placeholder", async () => {
            const wrapper = mnt(GTextarea, {
                props: {
                    label: "Comments",
                    placeholder: "Enter your comments",
                    modelValue: "",
                },
            });

            const textarea = wrapper.instance.getByRole("textbox", { name: "Comments" });
            await expect.element(textarea).toHaveAttribute("placeholder", "Enter your comments");
        });

        it("syncs model value", async () => {
            const model = ref("hello");
            const wrapper = mnt(GTextarea, {
                props: { label: "Comments", modelValue: "hello" },
                model,
            });

            const textarea = wrapper.instance.getByRole("textbox", { name: "Comments" });
            await expect.element(textarea).toHaveValue("hello");
        });

        it("renders with disabled state", async () => {
            const wrapper = mnt(GTextarea, {
                props: {
                    label: "Comments",
                    disabled: true,
                    modelValue: "",
                },
            });

            const textarea = wrapper.instance.getByRole("textbox", { name: "Comments" });
            await expect.element(textarea).toBeDisabled();
        });

        it("renders with readonly state", async () => {
            const wrapper = mnt(GTextarea, {
                props: {
                    label: "Comments",
                    readonly: true,
                    modelValue: "Read only text",
                },
            });

            const textarea = wrapper.instance.getByRole("textbox", { name: "Comments" });
            await expect.element(textarea).toHaveAttribute("readonly");
        });

        it("renders with rows attribute", async () => {
            const wrapper = mnt(GTextarea, {
                props: {
                    label: "Comments",
                    rows: 8,
                    modelValue: "",
                },
            });

            const textarea = wrapper.instance.getByRole("textbox", { name: "Comments" });
            await expect.element(textarea).toHaveAttribute("rows", "8");
        });

        it("renders maxlength attribute and character count", async () => {
            const wrapper = mnt(GTextarea, {
                props: {
                    label: "Comments",
                    maxlength: 200,
                    modelValue: "Hello",
                },
            });

            const textarea = wrapper.instance.getByRole("textbox", { name: "Comments" });
            await expect.element(textarea).toHaveAttribute("maxlength", "200");
            await expect.element(wrapper.instance.getByText("5 / 200")).toBeInTheDocument();
        });

        it("displays error messages", async () => {
            const wrapper = mnt(GTextarea, {
                props: {
                    label: "Comments",
                    errors: ["This field is required", "Too short"],
                    modelValue: "",
                },
            });

            await expect.element(wrapper.instance.getByText("This field is required")).toBeInTheDocument();
            await expect.element(wrapper.instance.getByText("Too short")).toBeInTheDocument();
        });

        it("sets aria-invalid when there are errors", async () => {
            const wrapper = mnt(GTextarea, {
                props: {
                    label: "Comments",
                    errors: ["Required"],
                    modelValue: "",
                },
            });

            const textarea = wrapper.instance.getByRole("textbox", { name: "Comments" });
            await expect.element(textarea).toHaveAttribute("aria-invalid", "true");
        });

        it("sets aria-required when required", async () => {
            const wrapper = mnt(GTextarea, {
                props: {
                    label: "Comments",
                    required: true,
                    modelValue: "",
                },
            });

            const textarea = wrapper.instance.getByRole("textbox", { name: "Comments" });
            await expect.element(textarea).toHaveAttribute("aria-required", "true");
        });

        it("does not apply maxlength attribute when not provided", async () => {
            const wrapper = mnt(GTextarea, {
                props: {
                    label: "Comments",
                    modelValue: "",
                },
            });

            const textarea = wrapper.instance.getByRole("textbox", { name: "Comments" });
            await expect.element(textarea).not.toHaveAttribute("maxlength");
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with basic props", async () => {
            await testAccessibility(GTextarea, {
                label: "Comments",
                modelValue: "",
            });
        });

        it("passes accessibility tests with placeholder", async () => {
            await testAccessibility(GTextarea, {
                label: "Comments",
                placeholder: "Enter your comments",
                modelValue: "",
            });
        });

        it("passes accessibility tests with error state", async () => {
            await testAccessibility(GTextarea, {
                label: "Comments",
                errors: ["This field is required"],
                modelValue: "",
            });
        });

        it("passes accessibility tests with instructions", async () => {
            await testAccessibility(GTextarea, {
                label: "Comments",
                instructions: "Please enter at least 10 characters.",
                modelValue: "",
            });
        });

        it("passes accessibility tests with instructions and error", async () => {
            await testAccessibility(GTextarea, {
                label: "Comments",
                instructions: "Please enter at least 10 characters.",
                errors: ["Too short"],
                modelValue: "",
            });
        });

        it("passes accessibility tests with required", async () => {
            await testAccessibility(GTextarea, {
                label: "Comments",
                required: true,
                modelValue: "",
            });
        });

        it("passes accessibility tests with disabled", async () => {
            await testAccessibility(GTextarea, {
                label: "Comments",
                disabled: true,
                modelValue: "",
            });
        });

        it("passes accessibility tests with maxlength", async () => {
            await testAccessibility(GTextarea, {
                label: "Comments",
                maxlength: 200,
                modelValue: "Hello",
            });
        });
    });
});

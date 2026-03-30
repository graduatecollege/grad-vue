import { describe, it, expect } from "vitest";
import { ref, nextTick } from "vue";
import GFileInput from "../packages/grad-vue/src/components/GFileInput.vue";
import { mnt, testAccessibility } from "./test-utils";
import { userEvent } from "vitest/browser";

function makeFile(name: string, size = 1024, type = "text/plain"): File {
    return new File(["x".repeat(size)], name, { type });
}

describe("GFileInput", () => {
    describe("Functional Tests", () => {
        it("renders with label", async () => {
            const wrapper = mnt(GFileInput, {
                props: {
                    label: "Upload File",
                    modelValue: [],
                },
            });

            await expect
                .element(wrapper.instance.getByLabelText("Upload File"))
                .toBeInTheDocument();
        });

        it("has file input type", async () => {
            const wrapper = mnt(GFileInput, {
                props: {
                    label: "Upload File",
                    modelValue: [],
                },
            });

            await expect
                .element(wrapper.instance.getByLabelText("Upload File"))
                .toHaveAttribute("type", "file");
        });

        it("renders with disabled state", async () => {
            const wrapper = mnt(GFileInput, {
                props: {
                    label: "Upload File",
                    disabled: true,
                    modelValue: [],
                },
            });

            await expect
                .element(wrapper.instance.getByLabelText("Upload File"))
                .toBeDisabled();
        });

        it("renders with instructions", async () => {
            const wrapper = mnt(GFileInput, {
                props: {
                    label: "Upload File",
                    instructions: "Select a PDF or Word document.",
                    modelValue: [],
                },
            });

            await expect
                .element(
                    wrapper.instance.getByText(
                        "Select a PDF or Word document.",
                    ),
                )
                .toBeInTheDocument();
        });

        it("passes accept attribute to input", async () => {
            const wrapper = mnt(GFileInput, {
                props: {
                    label: "Upload Image",
                    accept: "image/*",
                    modelValue: [],
                },
            });

            await expect
                .element(wrapper.instance.getByLabelText("Upload Image"))
                .toHaveAttribute("accept", "image/*");
        });

        it("passes multiple attribute when multiple is true", async () => {
            const wrapper = mnt(GFileInput, {
                props: {
                    label: "Upload Files",
                    multiple: true,
                    modelValue: [],
                },
            });

            await expect
                .element(wrapper.instance.getByLabelText("Upload Files"))
                .toHaveAttribute("multiple");
        });

        it("does not pass multiple attribute when multiple is false", async () => {
            const wrapper = mnt(GFileInput, {
                props: {
                    label: "Upload File",
                    multiple: false,
                    modelValue: [],
                },
            });

            const input = wrapper.instance.getByLabelText("Upload File");
            await expect
                .element(input)
                .not.toHaveAttribute("multiple");
        });

        it("displays error messages", async () => {
            const wrapper = mnt(GFileInput, {
                props: {
                    label: "Upload File",
                    errors: ["A file is required."],
                    modelValue: [],
                },
            });

            await expect
                .element(wrapper.instance.getByText("A file is required."))
                .toBeInTheDocument();
        });

        it("emits change event with selected files", async () => {
            const files = [makeFile("document.pdf")];
            const model = ref<File[]>([]);
            const wrapper = mnt(GFileInput, {
                props: {
                    label: "Upload File",
                },
                model,
            });

            const input = wrapper.instance.getByLabelText("Upload File");
            await userEvent.upload(input, files);

            expect(model.value.length).toBe(1);
            expect(model.value[0].name).toBe("document.pdf");
        });

        it("emits change event with multiple files", async () => {
            const files = [makeFile("a.pdf"), makeFile("b.pdf")];
            const model = ref<File[]>([]);
            const wrapper = mnt(GFileInput, {
                props: {
                    label: "Upload Files",
                    multiple: true,
                },
                model,
            });

            const input = wrapper.instance.getByLabelText("Upload Files");
            await userEvent.upload(input, files);

            expect(model.value.length).toBe(2);
            expect(model.value.map((f) => f.name)).toEqual(["a.pdf", "b.pdf"]);
        });

        it("shows file list when multiple files are selected", async () => {
            const files = [makeFile("alpha.pdf"), makeFile("beta.pdf")];
            const model = ref<File[]>([]);
            const wrapper = mnt(GFileInput, {
                props: {
                    label: "Upload Files",
                    multiple: true,
                },
                model,
            });

            const input = wrapper.instance.getByLabelText("Upload Files");
            await userEvent.upload(input, files);
            await nextTick();

            await expect
                .element(wrapper.instance.getByText("alpha.pdf"))
                .toBeInTheDocument();
            await expect
                .element(wrapper.instance.getByText("beta.pdf"))
                .toBeInTheDocument();
        });

        it("shows maxFiles validation error", async () => {
            const files = [
                makeFile("a.pdf"),
                makeFile("b.pdf"),
                makeFile("c.pdf"),
            ];
            const model = ref<File[]>([]);
            const wrapper = mnt(GFileInput, {
                props: {
                    label: "Upload Files",
                    multiple: true,
                    maxFiles: 2,
                },
                model,
            });

            const input = wrapper.instance.getByLabelText("Upload Files");
            await userEvent.upload(input, files);
            await nextTick();

            await expect
                .element(
                    wrapper.instance.getByText(
                        "You may select at most 2 files.",
                    ),
                )
                .toBeInTheDocument();
        });

        it("shows maxFileSize validation error", async () => {
            const bigFile = makeFile("large.pdf", 5 * 1024 * 1024 + 1);
            const model = ref<File[]>([]);
            const wrapper = mnt(GFileInput, {
                props: {
                    label: "Upload File",
                    maxFileSize: 5 * 1024 * 1024,
                },
                model,
            });

            const input = wrapper.instance.getByLabelText("Upload File");
            await userEvent.upload(input, [bigFile]);
            await nextTick();

            await expect
                .element(
                    wrapper.instance.getByText(
                        "One file exceeds the maximum size of 5.0 MB.",
                    ),
                )
                .toBeInTheDocument();
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with basic props", async () => {
            await testAccessibility(GFileInput, {
                label: "Upload File",
                modelValue: [],
            });
        });

        it("passes accessibility tests with instructions", async () => {
            await testAccessibility(GFileInput, {
                label: "Upload File",
                instructions: "Accepted formats: PDF, DOCX.",
                modelValue: [],
            });
        });

        it("passes accessibility tests with error state", async () => {
            await testAccessibility(GFileInput, {
                label: "Upload File",
                errors: ["A file is required."],
                modelValue: [],
            });
        });

        it("passes accessibility tests with multiple enabled", async () => {
            await testAccessibility(GFileInput, {
                label: "Upload Files",
                multiple: true,
                modelValue: [],
            });
        });

        it("passes accessibility tests with accept filter", async () => {
            await testAccessibility(GFileInput, {
                label: "Upload Image",
                accept: "image/*",
                modelValue: [],
            });
        });
    });
});

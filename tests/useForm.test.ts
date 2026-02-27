import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useForm } from "../packages/grad-vue/src/compose/useForm";

describe("useForm reactivity", () => {
    it("values computed updates when field value changes", async () => {
        const form = useForm();
        
        // Register a field
        const fieldValue = ref("initial");
        form.registerField("test", {
            name: "test",
            value: fieldValue,
            errors: ref([]),
        });
        
        // Check initial value
        expect(form.values.value.test).toBe("initial");
        
        // Change the field value
        fieldValue.value = "changed";
        
        // Check that values updated
        await expect.poll(() => {
            return form.values.value.test;
        }).toBe("changed");
    });
});

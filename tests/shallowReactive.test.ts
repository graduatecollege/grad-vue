import { describe, expect, it } from "vitest";
import { shallowReactive, ref, computed } from "vue";

describe("shallowReactive approach test", () => {
    it("shallowReactive prevents deep unwrapping and maintains reactivity", async () => {
        // Test shallowReactive approach
        const fields = shallowReactive({});

        const values = computed(() => {
            const vals = {};
            Object.entries(fields).forEach(([name, field]) => {
                if (field && field.value) {
                    vals[name] = field.value.value;
                }
            });
            return vals;
        });

        // Register a field
        const fieldValue = ref('hello');
        fields['test'] = {
            name: 'test',
            value: fieldValue,
            errors: ref([]),
        };

        // Check initial value
        expect(values.value.test).toBe('hello');

        // Change the field value
        fieldValue.value = 'changed';

        // Check that values updated reactively
        await expect.poll(() => {
            return values.value.test;
        }).toBe('changed');

        // Add another field
        const fieldValue2 = ref('world');
        fields['test2'] = {
            name: 'test2',
            value: fieldValue2,
            errors: ref([]),
        };

        await expect.poll(() => {
            return values.value.test2;
        }).toBe('world');

        // Delete a field
        delete fields['test'];

        await expect.poll(() => {
            return values.value.test;
        }).toBe(undefined);
    });
});

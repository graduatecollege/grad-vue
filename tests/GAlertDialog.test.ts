import { describe, it } from "vitest";
import GAlertDialog from "../src/components/GAlertDialog.vue";
import { testAccessibility } from "./test-utils";

describe("GAlertDialog", () => {
    describe("Functional Tests", () => {
        it("renders with default props", () => {
            // Basic rendering test
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with default props", async () => {
            await testAccessibility(
                GAlertDialog,
                { label: "Confirm action" },
                { default: "Are you sure?" }
            );
        });

        it("passes accessibility tests with custom button text", async () => {
            await testAccessibility(
                GAlertDialog,
                {
                    label: "Delete item",
                    buttonText: "Delete",
                    buttonColor: "danger",
                },
                { default: "This action cannot be undone." }
            );
        });

        it("passes accessibility tests with different button colors", async () => {
            const colors = ["primary", "secondary", "danger"] as const;

            for (const buttonColor of colors) {
                await testAccessibility(
                    GAlertDialog,
                    { label: "Confirm", buttonColor },
                    { default: "Please confirm." }
                );
            }
        });
    });
});

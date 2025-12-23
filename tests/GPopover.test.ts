import { describe, it } from "vitest";
import GPopover from "../src/components/GPopover.vue";
import { testAccessibility } from "./test-utils";

describe("GPopover", () => {
    describe("Functional Tests", () => {
        it("renders with default props", () => {
            // Basic rendering test
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with trigger and content", async () => {
            await testAccessibility(
                GPopover,
                {},
                {
                    trigger: "<button>Open</button>",
                    default: "Popover content",
                }
            );
        });

        it("passes accessibility tests with custom label", async () => {
            await testAccessibility(
                GPopover,
                { label: "Additional information" },
                {
                    trigger: "<button>Info</button>",
                    default: "More details here",
                }
            );
        });
    });
});

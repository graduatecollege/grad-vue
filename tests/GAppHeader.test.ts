import { describe, it } from "vitest";
import GAppHeader from "../src/components/GAppHeader.vue";
import { mnt, testAccessibility } from "./test-utils";

describe("GAppHeader", () => {
    describe("Functional Tests", () => {
        it("renders with default props", () => {
            const { unmount } = mnt(GAppHeader, {});
            unmount();
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with title", async () => {
            await testAccessibility(
                GAppHeader,
                {},
                { default: "Application Title" },
            );
        });

        it("passes accessibility tests with navigation slot", async () => {
            await testAccessibility(
                GAppHeader,
                {},
                {
                    default: "App",
                    navigation: "<nav><a href='/'>Home</a></nav>",
                },
            );
        });
    });
});

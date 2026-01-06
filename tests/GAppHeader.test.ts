import { describe, it } from "vitest";
import GAppHeader from "../src/components/GAppHeader.vue";
import { mnt, testAccessibility } from "./test-utils";

describe("GAppHeader", () => {
    describe("Functional Tests", () => {
        it("renders with default props", () => {
            mnt(GAppHeader, {});
        });
    });

    describe("Accessibility Tests", () => {
        it("with title", async () => {
            await testAccessibility(
                GAppHeader,
                {},
                { default: () => "Application Title" },
            );
        });

        it("with navigation slot", async () => {
            await testAccessibility(
                GAppHeader,
                {},
                {
                    default: () => "App",
                    navigation: () => "<nav><a href='/'>Home</a></nav>",
                },
            );
        });
    });
});

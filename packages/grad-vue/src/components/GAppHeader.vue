<script lang="ts">
/**
 * This is a minimal header meant for web apps where a full Illinois
 * brand header would be too large.
 *
 * **Slot** `left` allows replacing the link element in the top-left corner.
 *
 * **Slot** `title` is to the right of the logo.
 *
 * **Slot** `app-controls` is the remaining area to the right.
 */
export default {};
</script>

<script setup lang="ts">
type Props = {
    /**
     * Whether to show the Illinois logo
     */
    illinois?: boolean;
    /**
     * Top-left corner text
     *
     * You can customize this text element with the "left" slot.
     * @demo
     */
    brand?: string;
};

const props = withDefaults(defineProps<Props>(), {
    illinois: false,
    brand: "GRAD",
});
</script>

<template>
    <header
        :class="{
            'g-app-header': true,
        }"
    >
        <div class="g-app-header__background">
            <div class="g-app-header__background-pattern"></div>
            <div class="g-app-header__background-gradient"></div>
        </div>
        <div class="g-app-header__brand">
            <slot name="left">
                <a class="g-app-header__brand-text" href="/">{{ brand }}</a>
            </slot>
        </div>
        <div v-if="illinois" class="g-app-header__block-i-container">
            <svg
                class="g-app-header__block-i"
                role="img"
                width="55"
                viewBox="0 0 55 79"
                xmlns="http://www.w3.org/2000/svg"
            >
                <!-- NO LICENSE GRANTED for this logo, must have the right to use it -->
                <title>Block I logo</title>
                <path
                    class="g-app-header__block-i-outline"
                    d="M54.2 21.1V0H0v21.1h12v36.1H0v21.1h54.2V57.2h-12V21.1z"
                ></path>
                <path
                    class="g-app-header__block-i-fill"
                    d="M42.1 18.1h9V3H3v15h9c1.7 0 3 1.3 3 3v36.1c0 1.7-1.3 3-3 3H3v15h48.1v-15h-9c-1.7 0-3-1.3-3-3v-36c0-1.7 1.4-3 3-3z"
                ></path>
            </svg>
        </div>
        <slot v-else name="icon"></slot>
        <div class="g-app-header__title">
            <slot name="title"></slot>
        </div>
        <div class="g-app-header__app-controls-wrap">
            <slot name="app-controls" class="g-app-header__app-controls"></slot>
        </div>
    </header>
</template>

<style>
html {
    scroll-padding-top: 70px;
}

.g-app-header {
    .g-app-header__title {
        display: flex;
        align-items: center;
        margin-left: 20px;
        flex: 1;
    }

    .g-app-header__title > * {
        font-size: 20px;
        font-family: "Source Sans";
        font-style: normal;
        line-height: 30px;
        color: var(--g-primary-500);
        margin: 0;
    }

    .g-app-header__app-controls-wrap {
        margin-right: 20px;
    }
}

.app-name {
    color: var(--g-primary-500);
    font-size: 1.25rem;
    font-family: "Source Sans";
    font-style: normal;
    font-weight: 700;
    line-height: 1.875rem;
    margin: 0 10px 0 20px;
    text-decoration: none;

    a {
        color: var(--g-primary-500);

        &:hover {
            text-decoration: underline;
            color: var(--g-accent-700);
        }
    }

    @media screen and (max-width: 640px) {
        display: none;
    }
}
a.app-name {
    &:hover {
        text-decoration: underline;
        color: var(--g-accent-700);
    }
}
</style>

<style scoped>
.g-app-header {
    box-sizing: border-box;
    background-color: var(--g-surface-100);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    /*noinspection CssUnresolvedCustomProperty*/
    padding-right: var(--g-scrollbar-width, 0px);
    display: flex;
    align-items: center;
    z-index: 2;
    height: var(--g-toolbar-height);
    border-bottom: 2px solid var(--g-accent-500);
    box-shadow:
        0px 1px 2px 0px rgba(0, 0, 0, 0.25),
        0px 1px 10px 5px rgba(0, 0, 0, 0.08);
}

.g-app-header__background {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    bottom: 0;
    width: 470px;

    @media screen and (max-width: 640px) {
        width: 80%;
    }
}

.g-app-header__background-pattern {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBoZWlnaHQ9IjQ2IiB2aWV3Qm94PSIwIDAgNzEyLjkyNSA2NjkuMTY1Ij48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItNzE5Ni45NzciIHgyPSItNzIwNC4yIiB5MT0iLTE4MTEuMzA3IiB5Mj0iLTIyODQuNDA1IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDIuMDQ2NSAwIDAgLTEgMTM2MjkuODQ4IC0yNzk4LjAxNSkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNjOGM2YzciLz48c3RvcCBvZmZzZXQ9Ii45ODEiIHN0b3AtY29sb3I9IiNmZmYiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCB4bGluazpocmVmPSIjYSIgaWQ9ImIiIHgxPSItNzE5Ni45NzciIHgyPSItNzIwNC4yIiB5MT0iLTE1NTguNjU1IiB5Mj0iLTIwMzEuNzUzIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDIuMDQ2NSAwIDAgLTEgMTM4MDguNSAtMjM2Ni43MTEpIi8+PGxpbmVhckdyYWRpZW50IHhsaW5rOmhyZWY9IiNhIiBpZD0iYyIgeDE9Ii03MTk2Ljk3NyIgeDI9Ii03MjA0LjIiIHkxPSItMTMwNi4wMDMiIHkyPSItMTc3OS4xMDEiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMi4wNDY1IDAgMCAtMSAxMzk4Ny4xNTIgLTE5MzUuNDA3KSIvPjxsaW5lYXJHcmFkaWVudCB4bGluazpocmVmPSIjYSIgaWQ9ImQiIHgxPSItNzE5Ni45NzciIHgyPSItNzIwNC4yIiB5MT0iLTEwNTMuMzUxIiB5Mj0iLTE1MjYuNDQ5IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDIuMDQ2NSAwIDAgLTEgMTQxNjUuODAzIC0xNTA0LjEwMykiLz48bGluZWFyR3JhZGllbnQgeGxpbms6aHJlZj0iI2EiIGlkPSJlIiB4MT0iLTcxOTYuOTc3IiB4Mj0iLTcyMDQuMiIgeTE9Ii04MDAuNjk5IiB5Mj0iLTEyNzMuNzk3IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDIuMDQ2NSAwIDAgLTEgMTQzNDQuNDU1IC0xMDcyLjc5OSkiLz48bGluZWFyR3JhZGllbnQgeGxpbms6aHJlZj0iI2EiIGlkPSJmIiB4MT0iLTcxOTYuOTc3IiB4Mj0iLTcyMDQuMiIgeTE9Ii01NDguMDQ3IiB5Mj0iLTEwMjEuMTQ0IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDIuMDQ2NSAwIDAgLTEgMTQ1MjMuMTA3IC02NDEuNDk1KSIvPjxsaW5lYXJHcmFkaWVudCB4bGluazpocmVmPSIjYSIgaWQ9ImciIHgxPSItNzE5OS40OSIgeDI9Ii03MjA2LjcxMyIgeTE9Ii0yOTUuMzcxIiB5Mj0iLTc2OC40NjkiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMi4wNDY1IDAgMCAtMSAxNDcxMC41NTUgLTIxMy43ODcpIi8+PGxpbmVhckdyYWRpZW50IHhsaW5rOmhyZWY9IiNhIiBpZD0iaCIgeDE9Ii03MTk5LjQ5IiB4Mj0iLTcyMDYuNzEzIiB5MT0iLTQyLjcxOSIgeTI9Ii01MTUuODE3IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDIuMDQ2NSAwIDAgLTEgMTQ4ODkuMjA3IDIxNy41MTcpIi8+PGxpbmVhckdyYWRpZW50IHhsaW5rOmhyZWY9IiNhIiBpZD0iaSIgeDE9Ii03MTk5LjQ5IiB4Mj0iLTcyMDYuNzEzIiB5MT0iMjA5LjkzMyIgeTI9Ii0yNjMuMTY1IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDIuMDQ2NSAwIDAgLTEgMTUwNjcuODU5IDY0OC44MikiLz48bGluZWFyR3JhZGllbnQgeGxpbms6aHJlZj0iI2EiIGlkPSJqIiB4MT0iLTcxOTkuNDkiIHgyPSItNzIwNi43MTMiIHkxPSI0NjIuNTg1IiB5Mj0iLTEwLjUxMyIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgyLjA0NjUgMCAwIC0xIDE1MjQ2LjUxIDEwODAuMTI1KSIvPjxsaW5lYXJHcmFkaWVudCB4bGluazpocmVmPSIjYSIgaWQ9ImsiIHgxPSItNzE5OS40OSIgeDI9Ii03MjA2LjcxMyIgeTE9IjcxNS4yMzciIHkyPSIyNDIuMTM5IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDIuMDQ2NSAwIDAgLTEgMTU0MjUuMTYyIDE1MTEuNDI5KSIvPjxsaW5lYXJHcmFkaWVudCB4bGluazpocmVmPSIjYSIgaWQ9ImwiIHgxPSItNzE5OS40OSIgeDI9Ii03MjA2LjcxMyIgeTE9Ijk2Ny44ODkiIHkyPSI0OTQuNzkxIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDIuMDQ2NSAwIDAgLTEgMTU2MDMuODE0IDE5NDIuNzMzKSIvPjwvZGVmcz48ZyBjbGlwLXBhdGg9InVybCgjY2xpcHBhdGgpIj48cGF0aCBmaWxsPSJ1cmwoI2EpIiBkPSJNLTI1NDYuNjc0LTk3OC41MzNIMzQwLjY4djI1Mi42NTJoLTI4ODcuMzU0eiIgdHJhbnNmb3JtPSJyb3RhdGUoMTM1IC0xMTAyLjk5NyAtODUyLjIwOCkiLz48cGF0aCBmaWxsPSJ1cmwoI2IpIiBkPSJNLTIzNjguMDIyLTc5OS44ODFINTE5LjMzMnYyNTIuNjUyaC0yODg3LjM1NHoiIHRyYW5zZm9ybT0icm90YXRlKDEzNSAtOTI0LjM0NSAtNjczLjU1NikiLz48cGF0aCBmaWxsPSJ1cmwoI2MpIiBkPSJNLTIxODkuMzctNjIxLjIyOUg2OTcuOTg0djI1Mi42NTJILTIxODkuMzd6IiB0cmFuc2Zvcm09InJvdGF0ZSgxMzUgLTc0NS42OTMgLTQ5NC45MDMpIi8+PHBhdGggZmlsbD0idXJsKCNkKSIgZD0iTS0yMDEwLjcxOC00NDIuNTc3SDg3Ni42MzZ2MjUyLjY1MmgtMjg4Ny4zNTR6IiB0cmFuc2Zvcm09InJvdGF0ZSgxMzUgLTU2Ny4wNDEgLTMxNi4yNTEpIi8+PHBhdGggZmlsbD0idXJsKCNlKSIgZD0iTS0xODMyLjA2Ni0yNjMuOTI1aDI4ODcuMzU0djI1Mi42NTJoLTI4ODcuMzU0eiIgdHJhbnNmb3JtPSJyb3RhdGUoMTM1IC0zODguMzkgLTEzNy42KSIvPjxwYXRoIGZpbGw9InVybCgjZikiIGQ9Ik0tMTY1My40MTQtODUuMjczSDEyMzMuOTR2MjUyLjY1MmgtMjg4Ny4zNTR6IiB0cmFuc2Zvcm09InJvdGF0ZSgxMzUgLTIwOS43MzcgNDEuMDUzKSIvPjxwYXRoIGZpbGw9InVybCgjZykiIGQ9Ik0tMTQ3MS4xMDkgODkuNzU5aDI4ODcuMzU0djI1Mi42NTJoLTI4ODcuMzU0eiIgdHJhbnNmb3JtPSJyb3RhdGUoMTM1IC0yNy40MzIgMjE2LjA4NSkiLz48cGF0aCBmaWxsPSJ1cmwoI2gpIiBkPSJNLTEyOTIuNDU3IDI2OC40MTFoMjg4Ny4zNTR2MjUyLjY1MmgtMjg4Ny4zNTR6IiB0cmFuc2Zvcm09InJvdGF0ZSgxMzUgMTUxLjIyIDM5NC43MzcpIi8+PHBhdGggZmlsbD0idXJsKCNpKSIgZD0iTS0xMTEzLjgwNiA0NDcuMDYzaDI4ODcuMzU0djI1Mi42NTJoLTI4ODcuMzU0eiIgdHJhbnNmb3JtPSJyb3RhdGUoMTM1IDMyOS44NzEgNTczLjM4OSkiLz48cGF0aCBmaWxsPSJ1cmwoI2opIiBkPSJNLTkzNS4xNTQgNjI1LjcxNUgxOTUyLjJ2MjUyLjY1MkgtOTM1LjE1NHoiIHRyYW5zZm9ybT0icm90YXRlKDEzNSA1MDguNTIzIDc1Mi4wNCkiLz48cGF0aCBmaWxsPSJ1cmwoI2spIiBkPSJNLTc1Ni41MDIgODA0LjM2N2gyODg3LjM1NHYyNTIuNjUySC03NTYuNTAyeiIgdHJhbnNmb3JtPSJyb3RhdGUoMTM1IDY4Ny4xNzUgOTMwLjY5MykiLz48cGF0aCBmaWxsPSJ1cmwoI2wpIiBkPSJNLTU3Ny44NSA5ODMuMDE5aDI4ODcuMzU0djI1Mi42NTJILTU3Ny44NXoiIHRyYW5zZm9ybT0icm90YXRlKDEzNSA4NjUuODI3IDExMDkuMzQ1KSIvPjwvZz48L3N2Zz4=');
    background-repeat: repeat;
    opacity: 0.5;
}

.darkmode {
    .g-app-header__background-pattern {

    }

    .g-app-header__block-i-container {
        background: var(--il-orange);
    }

    .g-app-header__block-i-fill {
        fill: var(--il-blue);
    }
}

.g-app-header__background-gradient {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(
        90deg,
        transparent -15.89%,
        var(--g-surface-100) 95.85%
    );
}

.g-app-header__brand {
    min-width: 1rem;
    margin-top: 2px;

    &:deep(a) {
        text-decoration: none;
        padding: 10px 15px;
        font-family: var(--il-font-montserrat);
        letter-spacing: 0.98px;
        font-size: 14px;
        font-style: normal;
        font-weight: 800;
        color: var(--g-primary-300);

        &:hover {
            text-decoration: underline;
            color: var(--g-primary-500);
        }

        @media screen and (max-width: 740px) {
            display: none;
        }
    }
}

.g-app-header__block-i-container {
    height: calc(var(--g-toolbar-height) + 3px);
    box-sizing: border-box;
    margin-top: 6px;
    box-shadow:
        0px 0px 1px 1px rgba(0, 0, 0, 0.08),
        2px 1px 10px 0px rgba(0, 0, 0, 0.35);
}

.g-app-header__app-controls {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    padding: 0 10px;
    gap: 10px;
}
.g-app-header__block-i-container {
    background-color: var(--il-blue);
    min-width: 40px;
    padding: 8px 10px;

    .g-app-header__block-i {
        display: block;
        width: 24px;
    }

    .g-app-header__block-i-outline {
        fill: #fff;
    }

    .g-app-header__block-i-fill {
        fill: var(--il-orange);
    }
}
</style>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
    heading: string;
    showTitle?: boolean;
    titleH1?: boolean;
    titleLink?: string;
}

const props = withDefaults(defineProps<Props>(), {
    showTitle: true,
    titleH1: false,
    titleLink: undefined,
});

const titleText = computed(() => {
    return props.heading;
});
</script>

<template>
    <header
        :class="{
            'grad-app-header': true,
        }"
    >
        <div class="header-background">
            <div class="background-pattern"></div>
            <div class="background-gradient"></div>
        </div>
        <div class="grad">
            <router-link to="/">
                <em>GRAD</em>
            </router-link>
        </div>
        <div class="block-i-container">
            <svg class="block-i" role="img" width="55" viewBox="0 0 55 79" xmlns="http://www.w3.org/2000/svg">
                <title>Block I logo</title>
                <path class="block-i__outline" d="M54.2 21.1V0H0v21.1h12v36.1H0v21.1h54.2V57.2h-12V21.1z"></path>
                <path
                    class="block-i__fill"
                    d="M42.1 18.1h9V3H3v15h9c1.7 0 3 1.3 3 3v36.1c0 1.7-1.3 3-3 3H3v15h48.1v-15h-9c-1.7 0-3-1.3-3-3v-36c0-1.7 1.4-3 3-3z"
                ></path>
            </svg>
        </div>
        <div v-if="props.showTitle" class="title">
            <h1 v-if="props.titleH1" class="app-name">
                {{ titleText }}
            </h1>
            <router-link v-else-if="props.titleLink" :to="props.titleLink" class="app-name">
                {{ titleText }}
            </router-link>
            <span v-else class="app-name">
                {{ titleText }}
            </span>
        </div>
        <div id="header-title"></div>
        <div class="app-controls-wrap">
            <slot name="app-controls" class="app-controls"></slot>
        </div>
    </header>
</template>

<style>
.grad-app-header {
    --toolbar-border-color: var(--g-accent-500);
    --toolbar-background: var(--g-surface-100);
    --toolbar-background-gradient-start: transparent;
    --toolbar-app-name-color: var(--g-primary-500);
    --toolbar-hover-color: var(--g-accent-700);
}

.app-name {
    color: var(--toolbar-app-name-color);
    font-size: 1.25rem;
    font-family: "Source Sans";
    font-style: normal;
    font-weight: 700;
    line-height: 1.875rem;
    margin: 0 10px 0 20px;
    text-decoration: none;

    a {
        color: var(--toolbar-app-name-color);

        &:hover {
            text-decoration: underline;
            color: var(--toolbar-hover-color);
        }
    }

    @media screen and (max-width: 640px) {
        display: none;
    }
}
a.app-name {
    &:hover {
        text-decoration: underline;
        color: var(--toolbar-hover-color);
    }
}

.has-department-selector .app-name {
    @media screen and (max-width: 870px) {
        clip: rect(1px, 1px, 1px, 1px) !important;
        clip-path: inset(50%) !important;
        height: 1px !important;
        margin: -1px !important;
        overflow: hidden !important;
        padding: 0 !important;
        position: absolute !important;
        width: 1px !important;
    }
}
</style>

<style scoped>
.grad-app-header {
    background-color: var(--toolbar-background);
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    z-index: 2;
    height: var(--toolbar-height);
    border-bottom: 2px solid var(--toolbar-border-color);
    box-shadow:
        0px 1px 2px 0px rgba(0, 0, 0, 0.25),
        0px 1px 10px 5px rgba(0, 0, 0, 0.08);
}

.header-background {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    bottom: 0;
    width: 470px;
}

.background-pattern {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-image: url('data:image/svg+xml,<%3Fxml version="1.0" encoding="UTF-8"%3F><svg id="White" height="60" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 712.9248 669.165"><defs><linearGradient id="linear-gradient" x1="-7196.9772" y1="-1811.3069" x2="-7204.2" y2="-2284.4046" gradientTransform="translate(13629.8481 -2798.015) scale(2.0465 -1)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="%23c8c6c7"/><stop offset=".9807" stop-color="%23fff"/></linearGradient><linearGradient id="linear-gradient-2" x1="-7196.9771" y1="-1558.6549" x2="-7204.2" y2="-2031.7526" gradientTransform="translate(13808.4999 -2366.711) scale(2.0465 -1)" xlink:href="%23linear-gradient"/><linearGradient id="linear-gradient-3" x1="-7196.9771" y1="-1306.0029" x2="-7204.1999" y2="-1779.1006" gradientTransform="translate(13987.1517 -1935.4069) scale(2.0465 -1)" xlink:href="%23linear-gradient"/><linearGradient id="linear-gradient-4" x1="-7196.977" y1="-1053.3509" x2="-7204.1999" y2="-1526.4486" gradientTransform="translate(14165.8035 -1504.1028) scale(2.0465 -1)" xlink:href="%23linear-gradient"/><linearGradient id="linear-gradient-5" x1="-7196.977" y1="-800.6988" x2="-7204.1999" y2="-1273.7966" gradientTransform="translate(14344.4553 -1072.7988) scale(2.0465 -1)" xlink:href="%23linear-gradient"/><linearGradient id="linear-gradient-6" x1="-7196.9769" y1="-548.0468" x2="-7204.1998" y2="-1021.1445" gradientTransform="translate(14523.1071 -641.4947) scale(2.0465 -1)" xlink:href="%23linear-gradient"/><linearGradient id="linear-gradient-7" x1="-7199.49" y1="-295.3714" x2="-7206.7129" y2="-768.4691" gradientTransform="translate(14710.5552 -213.7874) scale(2.0465 -1)" xlink:href="%23linear-gradient"/><linearGradient id="linear-gradient-8" x1="-7199.49" y1="-42.7194" x2="-7206.7128" y2="-515.8171" gradientTransform="translate(14889.207 217.5166) scale(2.0465 -1)" xlink:href="%23linear-gradient"/><linearGradient id="linear-gradient-9" x1="-7199.4899" y1="209.9326" x2="-7206.7128" y2="-263.1651" gradientTransform="translate(15067.8588 648.8207) scale(2.0465 -1)" xlink:href="%23linear-gradient"/><linearGradient id="linear-gradient-10" x1="-7199.4899" y1="462.5846" x2="-7206.7128" y2="-10.5131" gradientTransform="translate(15246.5106 1080.1248) scale(2.0465 -1)" xlink:href="%23linear-gradient"/><linearGradient id="linear-gradient-11" x1="-7199.4898" y1="715.2367" x2="-7206.7127" y2="242.1389" gradientTransform="translate(15425.1624 1511.4288) scale(2.0465 -1)" xlink:href="%23linear-gradient"/><linearGradient id="linear-gradient-12" x1="-7199.4898" y1="967.8887" x2="-7206.7127" y2="494.791" gradientTransform="translate(15603.8142 1942.7329) scale(2.0465 -1)" xlink:href="%23linear-gradient"/></defs><g clip-path="url(%23clippath)"><g><rect x="-2546.6738" y="-978.5334" width="2887.3541" height="252.652" transform="translate(-2485.5349 -674.873) rotate(135)" fill="url(%23linear-gradient)"/><rect x="-2368.0219" y="-799.8814" width="2887.3541" height="252.652" transform="translate(-2054.231 -496.2207) rotate(135)" fill="url(%23linear-gradient-2)"/><rect x="-2189.37" y="-621.2293" width="2887.3541" height="252.652" transform="translate(-1622.9271 -317.5685) rotate(135)" fill="url(%23linear-gradient-3)"/><rect x="-2010.7182" y="-442.5773" width="2887.3541" height="252.652" transform="translate(-1191.6232 -138.9163) rotate(135)" fill="url(%23linear-gradient-4)"/><rect x="-1832.0663" y="-263.9253" width="2887.3541" height="252.652" transform="translate(-760.3193 39.736) rotate(135)" fill="url(%23linear-gradient-5)"/><rect x="-1653.4144" y="-85.2732" width="2887.3541" height="252.652" transform="translate(-329.0155 218.3882) rotate(135)" fill="url(%23linear-gradient-6)"/><rect x="-1471.1093" y="89.7587" width="2887.3541" height="252.652" transform="translate(105.9651 388.2772) rotate(135)" fill="url(%23linear-gradient-7)"/><rect x="-1292.4575" y="268.4107" width="2887.3541" height="252.652" transform="translate(537.269 566.9294) rotate(135)" fill="url(%23linear-gradient-8)"/><rect x="-1113.8056" y="447.0628" width="2887.3541" height="252.652" transform="translate(968.5728 745.5817) rotate(135)" fill="url(%23linear-gradient-9)"/><rect x="-935.1537" y="625.7148" width="2887.3541" height="252.652" transform="translate(1399.8767 924.2339) rotate(135)" fill="url(%23linear-gradient-10)"/><rect x="-756.5019" y="804.3669" width="2887.3541" height="252.652" transform="translate(1831.1806 1102.8862) rotate(135)" fill="url(%23linear-gradient-11)"/><rect x="-577.85" y="983.0189" width="2887.3541" height="252.652" transform="translate(2262.4845 1281.5384) rotate(135)" fill="url(%23linear-gradient-12)"/></g></g></svg>');
    background-repeat: repeat;
    opacity: 0.5;
}

.darkmode {
    .background-pattern {
        background-image: url('data:image/svg+xml,<%3Fxml version="1.0" encoding="UTF-8"%3F><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 712.9248 669.165"><defs><linearGradient id="linear-gradient" x1="-1489.8977" y1="3840.7045" x2="-1497.1206" y2="3367.6068" gradientTransform="translate(-3080.7102 -3500.1236) rotate(-180) scale(2.0465 -1)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="%2313294b"/><stop offset="1" stop-color="%230071ce"/></linearGradient><linearGradient id="linear-gradient-2" x1="-1489.8977" y1="4093.3564" x2="-1497.1204" y2="3620.2586" gradientTransform="translate(-2902.0583 -3574.1233) rotate(-180) scale(2.0465 -1)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="%2313294b"/><stop offset="1" stop-color="%230071ce"/></linearGradient><linearGradient id="linear-gradient-3" x1="-1489.8976" y1="4346.0085" x2="-1497.1205" y2="3872.9108" gradientTransform="translate(-2723.4065 -3648.1232) rotate(-180) scale(2.0465 -1)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="%2313294b"/><stop offset="1" stop-color="%230071ce"/></linearGradient><linearGradient id="linear-gradient-4" x1="-1489.8976" y1="4598.6606" x2="-1497.1205" y2="4125.5627" gradientTransform="translate(-2544.7544 -3722.123) rotate(-180) scale(2.0465 -1)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="%2313294b"/><stop offset="1" stop-color="%230071ce"/></linearGradient></defs><g id="Blue"><g clip-path="url(%23clippath)"><g><rect x="-1471.1094" y="79.7585" width="2887.354" height="252.652" transform="translate(-153.7585 40.9631) rotate(-45)" fill="url(%23linear-gradient)"/><rect x="-1292.4576" y="258.4107" width="2887.354" height="252.652" transform="translate(-227.7588 219.615) rotate(-45)" fill="url(%23linear-gradient-2)"/><rect x="-1113.8058" y="437.0627" width="2887.354" height="252.652" transform="translate(-301.759 398.2669) rotate(-45)" fill="url(%23linear-gradient-3)"/><rect x="-935.1538" y="615.715" width="2887.354" height="252.652" transform="translate(-375.7592 576.919) rotate(-45)" fill="url(%23linear-gradient-4)"/><rect x="-756.5019" y="794.367" width="2887.354" height="252.652" transform="translate(-449.7594 755.5709) rotate(-45)" fill="url(%23linear-gradient-5)"/><rect x="-577.8503" y="973.0192" width="2887.3541" height="252.652" transform="translate(-523.7597 934.2227) rotate(-45)" fill="url(%23linear-gradient-6)"/></g></g></g></svg>');
    }

    .block-i-container {
        background: var(--il-orange);
    }

    .block-i__fill {
        fill: var(--il-blue);
    }
}

.background-gradient {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(
        90deg,
        var(--toolbar-background-gradient-start) -15.89%,
        var(--toolbar-background) 95.85%
    );
}

.grad {
    &:deep(a) {
        text-decoration: none;

        &:hover {
            text-decoration: underline;
            color: var(--toolbar-app-name-color);
        }

        @media screen and (max-width: 740px) {
            display: none;
        }
    }

    &:deep(em) {
        padding: 10px 15px;
        font-family: Montserrat;
        letter-spacing: 0.98px;
        font-size: 14px;
        font-style: normal;
        font-weight: 800;
        color: var(--g-primary-300);
    }

    min-width: 1rem;
}

.block-i-container {
    height: calc(var(--toolbar-height) + 3px);
    margin-top: 6px;
    box-shadow:
        0px 0px 1px 1px rgba(0, 0, 0, 0.08),
        2px 1px 10px 0px rgba(0, 0, 0, 0.35);
}

.app-controls {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    padding: 0 10px;
    gap: 10px;
}
</style>

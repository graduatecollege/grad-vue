<script setup lang="ts">
import ComponentDemo from "../ComponentDemo.vue";
import { computed, ref } from "vue";

</script>

<template>
    <section id="user-menu" class="demo-section">
        <h2 class="demo-section__title">User Menu</h2>
        <ComponentDemo
            description="User menu component with avatar, email display, and account links."
            component="GUserMenu"
            :props-config="{
                initials: {
                    type: 'string',
                    label: 'User initial(s)',
                    default: 'J'
                },
                email: {
                    type: 'string',
                    label: 'User email',
                    default: 'j@example.org'
                },
                color: {
                    type: 'string',
                    label: 'Background color',
                    default: 'var(--g-surface-700)'
                },
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'User menu'
                }
            }"
        >
            <template #docs><p>User menu component for toolbars. Displays a button with the user&#39;s initials
inside a colored circle. When clicked, it opens a popover with the user&#39;s
email and a menu for account-related links.</p>
<p><strong>Slots</strong>:</p>
<ul>
<li><code>default</code> contains menu items (links or buttons) that will be wrapped in
an unordered list for accessibility.</li>
</ul>
<p><strong>Props</strong>:</p>
<ul>
<li><code>initials</code> - User&#39;s initials to display in the avatar</li>
<li><code>email</code> - User&#39;s email to display in the popover</li>
<li><code>color</code> - Background color for the avatar (should be deterministic)</li>
<li><code>label</code> - Accessible label for the menu button. The initial will be prepended to this for the full label.</li>
</ul>
<p>Example:</p>
<figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#800000">&#x3C;</span><span style="color:#267F99">GUserMenu</span></span>
<span class="line"><span style="color:#E50000">    initials</span><span style="color:#000000">=</span><span style="color:#0000FF">"J"</span></span>
<span class="line"><span style="color:#E50000">    email</span><span style="color:#000000">=</span><span style="color:#0000FF">"j@example.com"</span></span>
<span class="line"><span style="color:#E50000">    color</span><span style="color:#000000">=</span><span style="color:#0000FF">"#4A90E2"</span></span>
<span class="line"><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">    &#x3C;router-link</span><span style="color:#E50000"> to</span><span style="color:#000000">=</span><span style="color:#0000FF">"/profile"</span><span style="color:#800000">></span><span style="color:#000000">Profile</span><span style="color:#800000">&#x3C;/router-link></span></span>
<span class="line"><span style="color:#800000">    &#x3C;a</span><span style="color:#E50000"> href</span><span style="color:#000000">=</span><span style="color:#0000FF">"/settings"</span><span style="color:#800000">></span><span style="color:#000000">Settings</span><span style="color:#800000">&#x3C;/a></span></span>
<span class="line"><span style="color:#800000">    &#x3C;button</span><span style="color:#000000"> @</span><span style="color:#E50000">click</span><span style="color:#000000">=</span><span style="color:#000000">"</span><span style="color:#001080">handleLogout</span><span style="color:#000000">"</span><span style="color:#800000">></span><span style="color:#000000">Logout</span><span style="color:#800000">&#x3C;/button></span></span>
<span class="line"><span style="color:#800000">&#x3C;/</span><span style="color:#267F99">GUserMenu</span><span style="color:#800000">></span></span></code></pre>
</figure>

</template>
            <template #default="{ props }">
                <div style="width: 50px; margin: 0 auto;">
                    <GUserMenu v-bind="props">
                        <a href="#">Profile</a>
                        <a href="#">Settings</a>
                        <button type="button">
                            Logout
                        </button>
                    </GUserMenu>
                </div>
            </template>
        </ComponentDemo>
    </section>
</template>

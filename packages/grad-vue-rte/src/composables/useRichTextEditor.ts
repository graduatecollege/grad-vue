import { toRaw, watch, type Ref } from "vue";
import { useEditor } from "@tiptap/vue-3";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import { ListKit } from "@tiptap/extension-list";
import { UndoRedo, Placeholder } from "@tiptap/extensions";

interface UseRichTextEditorOptions {
    content: Ref<object | "" | undefined>;
    placeholder: Ref<string> | string;
    label: Ref<string> | string;
    onUpdate?: (editor: any) => void;
    editorProps?: Record<string, any>;
}

export function useRichTextEditor(options: UseRichTextEditorOptions) {
    const { content, placeholder, label, onUpdate, editorProps = {} } = options;

    const placeholderValue = typeof placeholder === 'string' ? placeholder : placeholder.value;
    const labelValue = typeof label === 'string' ? label : label.value;

    const editor = useEditor({
        content: content.value || "",
        extensions: [
            Document,
            Paragraph,
            Text,
            Bold,
            Italic,
            ListKit,
            UndoRedo,
            Placeholder.configure({ placeholder: placeholderValue }),
        ],
        editorProps: {
            ...editorProps,
            attributes: {
                "aria-label": labelValue,
                ...editorProps.attributes,
            },
        },
        onUpdate({ editor }) {
            content.value = editor.getJSON();
            if (onUpdate) {
                onUpdate(editor);
            }
        },
    });

    // Watch for label changes and update editor
    watch(
        () => typeof label === 'string' ? label : label.value,
        (val) => {
            if (editor.value) {
                editor.value?.setOptions({
                    editorProps: {
                        attributes: {
                            "aria-label": val,
                        },
                    },
                });
            }
        },
    );

    // Watch for content changes and update editor
    watch(
        () => content.value,
        (val) => {
            if (
                editor.value &&
                JSON.stringify(val) !== JSON.stringify(editor.value.getJSON())
            ) {
                editor.value.commands.setContent(toRaw(val) || "");
            }
        },
    );

    function focusEditor() {
        editor.value?.commands?.focus();
    }

    return {
        editor,
        focusEditor,
    };
}

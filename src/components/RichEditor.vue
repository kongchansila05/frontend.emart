<template>
  <div class="border border-surface-600 rounded-xl overflow-hidden focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">

    <!-- Toolbar -->
    <div class="flex items-center gap-0.5 px-2 py-1.5 border-b border-surface-600" style="background-color: var(--surface-800)">

      <!-- Heading buttons -->
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="['px-2 py-1 text-xs font-bold rounded-lg transition-all',
          editor?.isActive('heading', { level: 1 })
            ? 'bg-brand-500 text-white'
            : 'text-gray-500 hover:bg-surface-700 hover:text-gray-800']">
        H1
      </button>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="['px-2 py-1 text-xs font-bold rounded-lg transition-all',
          editor?.isActive('heading', { level: 2 })
            ? 'bg-brand-500 text-white'
            : 'text-gray-500 hover:bg-surface-700 hover:text-gray-800']">
        H2
      </button>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="['px-2 py-1 text-xs font-bold rounded-lg transition-all',
          editor?.isActive('heading', { level: 3 })
            ? 'bg-brand-500 text-white'
            : 'text-gray-500 hover:bg-surface-700 hover:text-gray-800']">
        H3
      </button>

      <div class="w-px h-4 bg-surface-600 mx-1"></div>

      <!-- Bold -->
      <button type="button" @click="editor.chain().focus().toggleBold().run()"
        :class="['px-2 py-1 rounded-lg transition-all',
          editor?.isActive('bold')
            ? 'bg-brand-500 text-white'
            : 'text-gray-500 hover:bg-surface-700 hover:text-gray-800']"
        title="Bold">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6z"/>
        </svg>
      </button>

      <!-- Italic -->
      <button type="button" @click="editor.chain().focus().toggleItalic().run()"
        :class="['px-2 py-1 rounded-lg transition-all',
          editor?.isActive('italic')
            ? 'bg-brand-500 text-white'
            : 'text-gray-500 hover:bg-surface-700 hover:text-gray-800']"
        title="Italic">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 4v3h2.21l-3.42 10H6v3h8v-3h-2.21l3.42-10H18V4z"/>
        </svg>
      </button>

      <!-- Underline -->
      <button type="button" @click="editor.chain().focus().toggleUnderline().run()"
        :class="['px-2 py-1 rounded-lg transition-all',
          editor?.isActive('underline')
            ? 'bg-brand-500 text-white'
            : 'text-gray-500 hover:bg-surface-700 hover:text-gray-800']"
        title="Underline">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
        </svg>
      </button>

      <div class="w-px h-4 bg-surface-600 mx-1"></div>

      <!-- Bullet list -->
      <button type="button" @click="editor.chain().focus().toggleBulletList().run()"
        :class="['px-2 py-1 rounded-lg transition-all',
          editor?.isActive('bulletList')
            ? 'bg-brand-500 text-white'
            : 'text-gray-500 hover:bg-surface-700 hover:text-gray-800']"
        title="Bullet list">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <!-- Ordered list -->
      <button type="button" @click="editor.chain().focus().toggleOrderedList().run()"
        :class="['px-2 py-1 rounded-lg transition-all',
          editor?.isActive('orderedList')
            ? 'bg-brand-500 text-white'
            : 'text-gray-500 hover:bg-surface-700 hover:text-gray-800']"
        title="Numbered list">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2zm1-9h1V4H2v1h1zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2zm5-6v2h14V5zm0 14h14v-2H7zm0-6h14v-2H7z"/>
        </svg>
      </button>

      <div class="w-px h-4 bg-surface-600 mx-1"></div>

      <!-- Clear formatting -->
      <button type="button" @click="editor.chain().focus().clearNodes().unsetAllMarks().run()"
        class="px-2 py-1 rounded-lg text-gray-500 hover:bg-surface-700 hover:text-gray-800 transition-all"
        title="Clear formatting">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Editor content -->
    <EditorContent
      :editor="editor"
      class="prose prose-sm max-w-none px-4 py-3 min-h-[100px] text-sm outline-none"
      style="color: var(--text-base)"
    />
  </div>
</template>

<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'

const props = defineProps({
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Underline,
  ],
  editorProps: {
    attributes: {
      class: 'outline-none focus:outline-none',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

// Sync external value changes (e.g. when modal opens with existing data)
watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val || '', false)
  }
})

onBeforeUnmount(() => editor.value?.destroy())
</script>

<style>
/* Tiptap content styles */
.ProseMirror h1 { font-size: 1.4rem; font-weight: 700; margin: 0.5rem 0; }
.ProseMirror h2 { font-size: 1.2rem; font-weight: 700; margin: 0.5rem 0; }
.ProseMirror h3 { font-size: 1rem;   font-weight: 700; margin: 0.4rem 0; }
.ProseMirror strong { font-weight: 700; }
.ProseMirror em     { font-style: italic; }
.ProseMirror u      { text-decoration: underline; }
.ProseMirror ul     { list-style-type: disc;    padding-left: 1.25rem; margin: 0.4rem 0; }
.ProseMirror ol     { list-style-type: decimal; padding-left: 1.25rem; margin: 0.4rem 0; }
.ProseMirror p      { margin: 0.25rem 0; }
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: #9aa0bc;
  pointer-events: none;
  float: left;
  height: 0;
}
</style>
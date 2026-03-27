'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useCallback, useEffect } from 'react';

interface ArticleEditorProps {
  /** Initial HTML content */
  content?: string;
  /** Called when content changes (debounced 1s) */
  onChange?: (html: string) => void;
  /** Placeholder text shown when editor is empty */
  placeholder?: string;
  /** Whether the editor is read-only */
  readOnly?: boolean;
}

/**
 * TipTap WYSIWYG editor for article content.
 * Integrates StarterKit + Link + Image + Placeholder + CharacterCount + Underline + TextAlign extensions.
 * Toolbar is rendered above the editor content area.
 */
export function ArticleEditor({
  content = '',
  onChange,
  placeholder = 'Start writing your article...',
  readOnly = false,
}: ArticleEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: { languageClassPrefix: 'language-' },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: 'article-image' },
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getHTML());
    },
    immediatelyRender: false, // Prevents SSR hydration mismatch
  });

  // Sync content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL:', previousUrl ?? '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleImageUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const characterCount = editor.storage.characterCount?.characters?.() ?? 0;
  const wordCount = editor.storage.characterCount?.words?.() ?? 0;

  return (
    <div className="article-editor">
      {/* Toolbar */}
      {!readOnly && (
        <div
          className="flex flex-wrap items-center gap-0.5 p-2 border-b-[2px] border-ink-600 mb-4"
          style={{ background: '#E8DFD0' }}
        >
          {/* Text style */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <span className="font-bold text-sm">B</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <span className="italic text-sm">I</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <span className="underline text-sm">U</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <span className="line-through text-sm">S</span>
          </ToolbarButton>

          <ToolbarDivider />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <span className="font-pixel text-[10px] font-bold">H2</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <span className="font-pixel text-[10px] font-bold">H3</span>
          </ToolbarButton>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet list"
          >
            <ListIcon type="bullet" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered list"
          >
            <ListIcon type="ordered" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Blockquote & Code */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Blockquote"
          >
            <span className="text-sm">&ldquo;&rdquo;</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            title="Code block"
          >
            <span className="font-mono text-xs">&lt;/&gt;</span>
          </ToolbarButton>

          <ToolbarDivider />

          {/* Links & Images */}
          <ToolbarButton onClick={handleLink} active={editor.isActive('link')} title="Add link">
            <LinkIcon />
          </ToolbarButton>
          <ToolbarButton onClick={handleImageUrl} title="Insert image URL">
            <ImageIcon />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Align left"
          >
            <AlignIcon align="left" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="Align center"
          >
            <AlignIcon align="center" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <UndoIcon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <RedoIcon />
          </ToolbarButton>

          {/* Word count */}
          <div className="ml-auto font-pixel text-[10px] text-ink-400 tracking-widest px-2">
            {wordCount} words · {characterCount} chars
          </div>
        </div>
      )}

      {/* Editor content */}
      <EditorContent editor={editor} className="article-editor-content prose-editor" />

      <style>{`
        .article-editor .ProseMirror {
          outline: none;
          min-height: 400px;
          padding: 1rem;
          font-family: 'Quicksand', sans-serif;
          font-size: 1rem;
          line-height: 1.8;
          color: #302818;
        }
        .article-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #8B7355;
          pointer-events: none;
          float: left;
          height: 0;
        }
        .article-editor .ProseMirror h2 {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #302818;
          margin: 1.5rem 0 0.75rem;
          border-bottom: 2px solid #CC6B47;
          padding-bottom: 0.25rem;
        }
        .article-editor .ProseMirror h3 {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: #302818;
          margin: 1.25rem 0 0.5rem;
        }
        .article-editor .ProseMirror p {
          margin: 0.75rem 0;
        }
        .article-editor .ProseMirror ul,
        .article-editor .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }
        .article-editor .ProseMirror li {
          margin: 0.25rem 0;
        }
        .article-editor .ProseMirror blockquote {
          border-left: 4px solid #CC6B47;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #5C4B26;
          font-style: italic;
          background: rgba(204, 107, 71, 0.06);
        }
        .article-editor .ProseMirror pre {
          background: #302818;
          color: #F5EFE0;
          padding: 1rem;
          border-radius: 0;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          overflow-x: auto;
          margin: 1rem 0;
          border: 2px solid #302818;
          box-shadow: 4px 4px 0px #CC6B47;
        }
        .article-editor .ProseMirror code {
          background: rgba(48, 40, 24, 0.08);
          padding: 0.125rem 0.375rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875em;
          color: #CC6B47;
          border: 1px solid rgba(48, 40, 24, 0.15);
        }
        .article-editor .ProseMirror a {
          color: #CC6B47;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .article-editor .ProseMirror a:hover {
          color: #4A7C59;
        }
        .article-editor .ProseMirror img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1rem auto;
          border: 2px solid #302818;
          box-shadow: 4px 4px 0px rgba(48, 40, 24, 0.3);
        }
        .article-editor .ProseMirror hr {
          border: none;
          border-top: 2px solid #CC6B47;
          margin: 2rem 0;
        }
        .article-editor .ProseMirror strong { font-weight: 700; }
        .article-editor .ProseMirror em { font-style: italic; }
        .article-editor .ProseMirror s { text-decoration: line-through; }
        .article-editor .ProseMirror u { text-decoration: underline; }
        .article-editor .ProseMirror p + p { margin-top: 0; }
        .article-editor .ProseMirror > * + * { margin-top: 0.5rem; }
      `}</style>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}

/**
 *
 * @param root0
 * @param root0.onClick
 * @param root0.active
 * @param root0.disabled
 * @param root0.title
 * @param root0.children
 */
function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        flex items-center justify-center w-8 h-8 border-[2px] transition-all
        ${active ? 'border-ink-800' : 'border-ink-500'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-ink-800'}
      `}
      style={{
        background: active ? '#CC6B47' : '#E8DFD0',
        color: active ? '#F5EFE0' : '#302818',
        boxShadow: '1px 1px 0px #302818',
      }}
    >
      {children}
    </button>
  );
}

/**
 *
 */
function ToolbarDivider() {
  return <div className="w-[2px] h-6 bg-ink-400 mx-1" />;
}

/**
 *
 * @param root0
 * @param root0.type
 */
function ListIcon({ type }: { type: 'bullet' | 'ordered' }) {
  if (type === 'bullet') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="2" cy="3" r="1.5" fill="currentColor" />
        <circle cx="2" cy="7" r="1.5" fill="currentColor" />
        <circle cx="2" cy="11" r="1.5" fill="currentColor" />
        <rect x="5" y="2" width="8" height="2" fill="currentColor" />
        <rect x="5" y="6" width="8" height="2" fill="currentColor" />
        <rect x="5" y="10" width="8" height="2" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <text x="0" y="4" fontSize="4" fill="currentColor">
        1.
      </text>
      <text x="0" y="8" fontSize="4" fill="currentColor">
        2.
      </text>
      <text x="0" y="12" fontSize="4" fill="currentColor">
        3.
      </text>
      <rect x="5" y="2" width="8" height="2" fill="currentColor" />
      <rect x="5" y="6" width="8" height="2" fill="currentColor" />
      <rect x="5" y="10" width="8" height="2" fill="currentColor" />
    </svg>
  );
}

/**
 *
 */
function LinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M5 7a3 3 0 0 0 4.243 4.243L8 10l-1 1 1.243 1.243A3 3 0 0 0 10 7" />
      <path d="M9 7a3 3 0 0 0-4.243-4.243L6 4l1-1L5.757 2.757A3 3 0 0 0 4 7" />
    </svg>
  );
}

/**
 *
 */
function ImageIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="1" y="1" width="12" height="12" rx="0" />
      <circle cx="4.5" cy="4.5" r="1.5" />
      <path d="M1 10l3.5-3.5 3 3 2-2 4.5 4.5" />
    </svg>
  );
}

/**
 *
 * @param root0
 * @param root0.align
 */
function AlignIcon({ align }: { align: 'left' | 'center' }) {
  if (align === 'center') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <rect x="1" y="3" width="12" height="2" />
        <rect x="3" y="6" width="8" height="2" />
        <rect x="1" y="9" width="12" height="2" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="1" y="3" width="12" height="2" />
      <rect x="1" y="6" width="8" height="2" />
      <rect x="1" y="9" width="12" height="2" />
    </svg>
  );
}

/**
 *
 */
function UndoIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2 5h7a3 3 0 1 1 0 6H4" />
      <path d="M2 2l2 3-2 3" />
    </svg>
  );
}

/**
 *
 */
function RedoIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 5H5a3 3 0 1 0 0 6h5" />
      <path d="M12 2l-2 3 2 3" />
    </svg>
  );
}

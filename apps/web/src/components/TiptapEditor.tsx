'use client'

import { useState, useEffect } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { uploadResourceDescriptionImage, uploadServerDescriptionImage, fileToBase64 } from '@/lib/api/image-upload'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
  resourceId?: string
  serverId?: string
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Write your description here...',
  className = '',
  minHeight = '300px',
  resourceId,
  serverId
}: TiptapEditorProps) {
  const [showImageInput, setShowImageInput] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4]
        },
        hardBreak: {
          keepMarks: true,
        }
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4'
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2 hover:text-primary/80 transition-colors'
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      Underline,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none p-4',
      },
      handlePaste: (view, event, slice) => {
        const items = event.clipboardData?.items
        if (!items) return false

        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          if (!item) continue;

          if (item.type.indexOf('image') !== -1) {
            event.preventDefault()

            const file = item.getAsFile()
            if (file) {
              handleImageUpload(file, editor)
            }

            return true
          }
        }

        return false
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]

          if (file.type.indexOf('image') !== -1) {
            event.preventDefault()
            handleImageUpload(file, editor)
            return true
          }
        }

        return false
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    }
  })

  // Update editor content when the content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  const handleImageUpload = async (file: File, editor: Editor | null) => {
    if (!editor) return

    try {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image too large. Maximum size is 5MB.')
        return
      }

      if (resourceId) {
        try {
          toast.loading('Uploading image...', { id: 'image-upload' })

          const result = await uploadResourceDescriptionImage(resourceId, file)
          editor.chain().focus().setImage({ src: result.url }).run()

          toast.success('Image uploaded successfully!', { id: 'image-upload' })
        } catch (uploadError) {
          console.warn('Upload failed, falling back to base64:', uploadError)
          toast.dismiss('image-upload')

          const base64 = await fileToBase64(file)
          editor.chain().focus().setImage({ src: base64 }).run()

          toast.info('Image added locally. Server upload will be available when backend is ready.')
        }
      } else if (serverId) {
        try {
          toast.loading('Uploading image...', { id: 'image-upload' })

          const result = await uploadServerDescriptionImage(serverId, file)
          editor.chain().focus().setImage({ src: result.url }).run()

          toast.success('Image uploaded successfully!', { id: 'image-upload' })
        } catch (uploadError) {
          console.warn('Upload failed, falling back to base64:', uploadError)
          toast.dismiss('image-upload')

          const base64 = await fileToBase64(file)
          editor.chain().focus().setImage({ src: base64 }).run()

          toast.info('Image added locally. Server upload will be available when backend is ready.')
        }
      } else {
        const base64 = await fileToBase64(file)
        editor.chain().focus().setImage({ src: base64 }).run()

        toast.info('Image added locally. Save first to enable server uploads.')
      }
    } catch (error) {
      console.error('Failed to process image:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process image')
    }
  }

  const addImageByUrl = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      setShowImageInput(false)
      toast.success('Image added!')
    }
  }

  const setLink = () => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter URL:', previousUrl)

    if (url === null) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const triggerImageUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && editor) {
        handleImageUpload(file, editor)
      }
    }
    input.click()
  }

  if (!editor) {
    return null
  }

  return (
    <div className={`relative border border-[#1E5A63] rounded-lg overflow-hidden bg-[#041518] ${className}`}>
      {/* Fixed Top Toolbar */}
      <div className="sticky top-0 z-20 border-b border-[#1E5A63] bg-[#0A1F24] p-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center gap-0.5">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              icon="mdi:format-bold"
              tooltip="Bold (Ctrl+B)"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              icon="mdi:format-italic"
              tooltip="Italic (Ctrl+I)"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
              icon="mdi:format-underline"
              tooltip="Underline (Ctrl+U)"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')}
              icon="mdi:format-strikethrough"
              tooltip="Strikethrough"
            />
          </div>

          <div className="w-px h-6 bg-[#1E5A63] mx-1" />

          {/* Headings */}
          <div className="flex items-center gap-0.5">
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
              icon="mdi:format-header-1"
              tooltip="Heading 1"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              icon="mdi:format-header-2"
              tooltip="Heading 2"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              icon="mdi:format-header-3"
              tooltip="Heading 3"
            />
          </div>

          <div className="w-px h-6 bg-[#1E5A63] mx-1" />

          {/* Lists */}
          <div className="flex items-center gap-0.5">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              icon="mdi:format-list-bulleted"
              tooltip="Bullet List"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              icon="mdi:format-list-numbered"
              tooltip="Numbered List"
            />
          </div>

          <div className="w-px h-6 bg-[#1E5A63] mx-1" />

          {/* Code & Quote */}
          <div className="flex items-center gap-0.5">
            <MenuButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive('code')}
              icon="mdi:code-tags"
              tooltip="Inline Code"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              active={editor.isActive('codeBlock')}
              icon="mdi:code-block-tags"
              tooltip="Code Block"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              icon="mdi:format-quote-close"
              tooltip="Quote"
            />
          </div>

          <div className="w-px h-6 bg-[#1E5A63] mx-1" />

          {/* Links */}
          <div className="flex items-center gap-0.5">
            <MenuButton
              onClick={setLink}
              active={editor.isActive('link')}
              icon="mdi:link"
              tooltip="Add Link"
            />
            {editor.isActive('link') && (
              <MenuButton
                onClick={() => editor.chain().focus().unsetLink().run()}
                active={false}
                icon="mdi:link-off"
                tooltip="Remove Link"
              />
            )}
          </div>

          <div className="w-px h-6 bg-[#1E5A63] mx-1" />

          {/* Images */}
          <div className="flex items-center gap-0.5">
            <MenuButton
              onClick={triggerImageUpload}
              active={false}
              icon="mdi:image-plus"
              tooltip="Upload Image"
            />
            <MenuButton
              onClick={() => setShowImageInput(!showImageInput)}
              active={showImageInput}
              icon="mdi:link-variant"
              tooltip="Add Image by URL"
            />
          </div>

          <div className="flex-1" />

          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5">
            <MenuButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              active={false}
              icon="mdi:undo"
              tooltip="Undo (Ctrl+Z)"
            />
            <MenuButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              active={false}
              icon="mdi:redo"
              tooltip="Redo (Ctrl+Y)"
            />
          </div>
        </div>

        {/* Image URL Input */}
        {showImageInput && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-[#041518] border border-[#1E5A63] rounded-lg animate-in slide-in-from-top-2 duration-200">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL..."
              className="flex-1 px-3 py-1.5 bg-[#0A1F24] border border-[#1E5A63] rounded text-sm text-[#C7F4FA] placeholder:text-[#C7F4FA]/40 focus:outline-none focus:ring-2 focus:ring-[#109EB1]/50 font-nunito"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addImageByUrl()
                } else if (e.key === 'Escape') {
                  setShowImageInput(false)
                  setImageUrl('')
                }
              }}
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              onClick={addImageByUrl}
              className="h-8 px-3 font-nunito bg-[#109EB1] hover:bg-[#0D8A9A] text-white"
            >
              Add
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowImageInput(false)
                setImageUrl('')
              }}
              className="h-8 px-3 font-nunito text-[#C7F4FA]/70 hover:text-[#C7F4FA] hover:bg-[#1E5A63]/30"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div
        className="bg-[#041518] overflow-y-auto"
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Info footer */}
      <div className="border-t border-[#1E5A63] bg-[#0A1F24]/50 p-3 text-xs text-[#C7F4FA]/50 font-nunito">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:information-outline" width="14" height="14" />
          <span>
            Select text to format it • Paste or drag & drop images
          </span>
        </div>
      </div>
    </div>
  )
}

// Menu Button Component
interface MenuButtonProps {
  onClick: () => void
  active: boolean
  icon: string
  tooltip: string
  disabled?: boolean
}

function MenuButton({ onClick, active, icon, tooltip, disabled = false }: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        p-2 rounded-md transition-all duration-150 
        hover:bg-[#1E5A63]/50
        ${active ? 'bg-[#109EB1]/30 text-[#109EB1]' : 'text-[#C7F4FA]/80'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={tooltip}
    >
      <Icon icon={icon} width="18" height="18" />
    </button>
  )
}
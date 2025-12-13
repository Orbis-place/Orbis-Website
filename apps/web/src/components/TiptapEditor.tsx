'use client'

import { useState } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { uploadResourceDescriptionImage, fileToBase64 } from '@/lib/api/image-upload'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
  resourceId?: string
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Write your description here...',
  className = '',
  minHeight = '300px',
  resourceId
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
      } else {
        const base64 = await fileToBase64(file)
        editor.chain().focus().setImage({ src: base64 }).run()

        toast.info('Image added locally. Save the resource first to enable server uploads.')
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
    <div className={`relative border rounded-lg overflow-hidden bg-background ${className}`}>
      {/* Bubble Menu - Appears when text is selected */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100, maxWidth: 'none' }}
        className="flex items-center gap-1 bg-popover border border-border rounded-lg shadow-lg p-1"
      >
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

        <div className="w-px h-6 bg-border mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          icon="mdi:code-tags"
          tooltip="Inline Code"
        />
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
      </BubbleMenu>

      {/* Floating Menu - Appears on empty lines */}
      <FloatingMenu
        editor={editor}
        tippyOptions={{ duration: 100, placement: 'left' }}
        className="flex items-center gap-1 bg-popover border border-border rounded-lg shadow-lg p-1"
      >
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

        <div className="w-px h-6 bg-border mx-1" />

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

        <div className="w-px h-6 bg-border mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          icon="mdi:format-quote-close"
          tooltip="Quote"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          icon="mdi:code-block-tags"
          tooltip="Code Block"
        />
      </FloatingMenu>

      {/* Fixed bottom toolbar for images and other actions */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="flex items-center gap-2">
          {showImageInput && (
            <div className="flex items-center gap-2 bg-popover border border-border rounded-lg shadow-lg p-2 animate-in slide-in-from-right-5 duration-200">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL..."
                className="px-3 py-1.5 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 font-nunito"
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
                className="h-8 px-3 font-nunito"
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
                className="h-8 px-3 font-nunito"
              >
                Cancel
              </Button>
            </div>
          )}

          <div className="flex items-center gap-1 bg-popover border border-border rounded-lg shadow-lg p-1">
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

            <div className="w-px h-6 bg-border mx-1" />

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
      </div>

      {/* Editor Content */}
      <div
        className="bg-background overflow-y-auto"
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Info footer */}
      <div className="border-t bg-secondary/30 p-3 text-xs text-muted-foreground font-nunito">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:information-outline" width="14" height="14" />
          <span>
            Select text to format it • Use / on a new line for commands • Paste or drag & drop images
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
        hover:bg-accent
        ${active ? 'bg-primary/20 text-primary' : 'text-foreground/70'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={tooltip}
    >
      <Icon icon={icon} width="18" height="18" />
    </button>
  )
}
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import { useEffect } from 'react';

export interface TiptapViewerProps {
    content: string;
    className?: string;
}

/**
 * TipTap Viewer - Affichage sécurisé du contenu TipTap en read-only
 * 
 * Ce composant affiche du contenu HTML TipTap de manière sécurisée SANS utiliser dangerouslySetInnerHTML.
 * Il utilise le moteur de rendu TipTap en mode lecture seule, ce qui empêche les attaques XSS.
 * 
 * @security C'est la méthode SÉCURISÉE pour afficher du contenu HTML généré par les utilisateurs
 */
export function TiptapViewer({ content, className = '' }: TiptapViewerProps) {
    const editor = useEditor({
        immediatelyRender: false,
        editable: false, // Mode lecture seule
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4]
                },
            }),
            Image.configure({
                inline: true,
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto my-4'
                }
            }),
            Link.configure({
                openOnClick: true, // Permet de cliquer les liens en mode viewer
                HTMLAttributes: {
                    class: 'text-[#109EB1] underline underline-offset-2 hover:text-[#109EB1]/80 transition-colors',
                    target: '_blank',
                    rel: 'noopener noreferrer'
                }
            }),
            Underline,
            Youtube.configure({
                width: 640,
                height: 480,
                controls: true,
                nocookie: true,
                HTMLAttributes: {
                    class: 'rounded-lg my-4 max-w-full'
                }
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: `tiptap font-nunito text-base leading-relaxed ${className}`,
            },
        },
    });

    // Met à jour le contenu quand il change
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [editor, content]);

    if (!editor) {
        return null;
    }

    return <EditorContent editor={editor} />;
}

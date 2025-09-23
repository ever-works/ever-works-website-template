import { Editor, EditorContent as TiptapEditorContent } from '@tiptap/react';
import { DetailedHTMLProps, HTMLAttributes } from 'react';


interface EditorContentProps {
	editor: Editor;
	onContentChange?: (content: string) => void;
	role?: string;
	className?: string;
	content?: string;
	placeholder?: string;
	onPaste?: (event: React.ClipboardEvent<HTMLDivElement>) => void;
	onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
	onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
	onKeyUp?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
	onKeyPress?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
	onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
	onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
	toolbar?: React.ReactNode;
	style?: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
}
/**
 * Editor content component
 * @param props - Editor content props
 * @param props.editor - Editor instance
 * @param props.role - Role attribute
 * @param props.className - Class name
 * @param props.content - Content
 * @param props.placeholder - Placeholder
 * @param props.onPaste - On paste event
 * @param props.onDrop - On drop event
 * @param props.onKeyDown - On key down event
 * @param props.onKeyUp - On key up event
 * @param props.onKeyPress - On key press event
 * @param props.onFocus - On focus event
 * @param props.onBlur - On blur event
 * @returns Editor content component
 */
export function EditorContent({ ...props }: EditorContentProps) {
	return (
		<div {...props.style}>
			{props.toolbar && props.toolbar}
			<TiptapEditorContent {...props}  />
		</div>
	);
}

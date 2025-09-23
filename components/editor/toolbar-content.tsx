import React from 'react';
import { Spacer } from '../tiptap-ui-primitive/spacer';
import { ToolbarGroup, ToolbarSeparator } from '../tiptap-ui-primitive/toolbar';
import { BlockquoteButton } from '../tiptap-ui/blockquote-button';
import { CodeBlockButton } from '../tiptap-ui/code-block-button';
import { ColorHighlightPopover } from '../tiptap-ui/color-highlight-popover';
import { HeadingDropdownMenu } from '../tiptap-ui/heading-dropdown-menu';
import { LinkPopover } from '../tiptap-ui/link-popover';
import { ListDropdownMenu } from '../tiptap-ui/list-dropdown-menu';
import { MarkButton } from '../tiptap-ui/mark-button';
import { TextAlignButton } from '../tiptap-ui/text-align-button';
import { UndoRedoButton } from '../tiptap-ui/undo-redo-button';
import type { Editor } from '@tiptap/react';
import { ImageUploadButton } from '../tiptap-ui/image-upload-button';

export const ToolbarContent = React.memo(({ editor }: { editor: Editor | null }) => {
	return (
		<>
			<Spacer />

			<ToolbarGroup >
				<UndoRedoButton action="undo" editor={editor} />
				<UndoRedoButton action="redo" editor={editor} />
			</ToolbarGroup>

			<ToolbarSeparator />

			<ToolbarGroup>
				{editor && (
					<>
						<HeadingDropdownMenu 
							className='key-selector'
							key={editor?.state.selection.from}
							levels={[1, 2, 3, 4]} 
							portal={true} 
							editor={editor} 
						/>
						<ListDropdownMenu
							className='key-selector'
							key={editor.state.selection.from}
							types={['bulletList', 'orderedList', 'taskList']}
							portal={true}
							editor={editor}
						/>
					</>
				)}
				<BlockquoteButton editor={editor} />
				<CodeBlockButton editor={editor} />
			</ToolbarGroup>

			<ToolbarSeparator />

			<ToolbarGroup>
				<MarkButton type="bold" editor={editor} />
				<MarkButton type="italic" editor={editor} />
				<MarkButton type="strike" editor={editor} />
				<MarkButton type="code" editor={editor} />
				<MarkButton type="underline" editor={editor} />
				<ColorHighlightPopover editor={editor} />
				<LinkPopover editor={editor} />
			</ToolbarGroup>

			<ToolbarSeparator />

			<ToolbarGroup>
				<MarkButton type="superscript" editor={editor} />
				<MarkButton type="subscript" editor={editor} />
			</ToolbarGroup>

			<ToolbarSeparator />

			<ToolbarGroup>
				<TextAlignButton align="left" editor={editor} />
				<TextAlignButton align="center" editor={editor} />
				<TextAlignButton align="right" editor={editor} />
				<TextAlignButton align="justify" editor={editor} />
			</ToolbarGroup>

			<ToolbarSeparator />

			<ToolbarGroup >
				<ImageUploadButton text="Add" editor={editor} />
			</ToolbarGroup>

			<ToolbarSeparator />
			<Spacer />
		</>
	);
});

import { useGlobalState } from 'feature-react/state';
import React, { useImperativeHandle } from 'react';

import { type TFlowEditor } from './types';

export const Board = React.forwardRef<HTMLDivElement, TProps>((props, ref) => {
	const { flowEditor } = props;
	const interaction = useGlobalState(flowEditor.interactionMode);

	const boardRef = React.useRef<HTMLDivElement>(null);

	// https://stackoverflow.com/questions/68162617/whats-the-correct-way-to-use-useref-and-forwardref-together
	useImperativeHandle(ref, () => boardRef.current as unknown as HTMLDivElement);

	React.useEffect(() => {
		const board = boardRef.current;
		if (board == null) {
			return;
		}

		const handleMouseDown = (event: MouseEvent): void => {
			if (event.button === 1) {
				flowEditor.interactionMode.set({
					type: 'Panning',
					start: { x: event.clientX, y: event.clientY },
					origin: {
						x: flowEditor.viewport._v.position.x,
						y: flowEditor.viewport._v.position.y
					}
				});
			}
		};

		const handleMouseMove = (event: MouseEvent): void => {
			if (flowEditor.interactionMode._v.type === 'Panning') {
				const { start, origin } = flowEditor.interactionMode._v;
				const deltaX = event.clientX - start.x;
				const deltaY = event.clientY - start.y;
				flowEditor.viewport.set((v) => ({
					...v,
					position: {
						x: origin.x + deltaX,
						y: origin.y + deltaY
					}
				}));
			}
		};

		const handleMouseUp = (): void => {
			flowEditor.interactionMode.set({ type: 'None' });
		};

		const handleWheel = (event: WheelEvent): void => {
			// Zooming
			if (event.ctrlKey) {
				event.preventDefault();
				const { scale, position } = flowEditor.viewport._v;
				const deltaScale = -event.deltaY * 0.001;
				const newScale = Math.max(0.1, Math.min(5, scale * (1 + deltaScale)));

				const rect = board.getBoundingClientRect();
				const cursorX = event.clientX - rect.left;
				const cursorY = event.clientY - rect.top;

				const currentX = position.x;
				const currentY = position.y;
				const newX = currentX - (cursorX - currentX) * (newScale / scale - 1);
				const newY = currentY - (cursorY - currentY) * (newScale / scale - 1);

				flowEditor.viewport.set({ scale: newScale, position: { x: newX, y: newY } });
			}
			// Vertical scrolling
			else {
				const scrollSpeed = 1;
				const deltaY = event.deltaY * scrollSpeed;
				flowEditor.viewport.set((v) => ({
					...v,
					position: {
						x: v.position.x,
						y: v.position.y - deltaY
					}
				}));
			}
		};

		board.addEventListener('mousedown', handleMouseDown);
		board.addEventListener('mousemove', handleMouseMove);
		board.addEventListener('mouseup', handleMouseUp);
		board.addEventListener('wheel', handleWheel, { passive: false });

		return () => {
			board.removeEventListener('mousedown', handleMouseDown);
			board.removeEventListener('mousemove', handleMouseMove);
			board.removeEventListener('mouseup', handleMouseUp);
			board.removeEventListener('wheel', handleWheel);
		};
	}, [flowEditor]);

	// Note: Not passed into component as 'styles' because 'styles', don't support priority like !important
	React.useEffect(() => {
		const board = boardRef.current;
		if (board == null) {
			return;
		}

		let style: HTMLStyleElement | null = null;
		switch (interaction.type) {
			case 'None':
				// Apply the cursor style only to the board itself
				board.style.setProperty('cursor', 'grab');
				break;
			case 'Panning':
				// Create a style block to override the cursor for all child elements of the board
				style = document.createElement('style');
				style.innerHTML = `
					#${board.id} * {
					  cursor: grabbing !important;
					  user-select: none !important;
					}
				  `;
				document.head.appendChild(style);
				break;
		}

		return () => {
			board.style.removeProperty('cursor');
			if (style != null) {
				document.head.removeChild(style);
			}
		};
	}, [interaction.type]);

	return (
		<div id="flow-editor_board" ref={boardRef} className="relative h-full w-full">
			{props.children}
		</div>
	);
});
Board.displayName = 'Board';

interface TProps {
	flowEditor: TFlowEditor;
	children?: React.ReactElement[] | React.ReactElement;
}

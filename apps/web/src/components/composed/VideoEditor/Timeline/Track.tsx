import { useVirtualizer } from '@tanstack/react-virtual';
import { useGlobalState } from 'feature-react/state';
import React from 'react';

import { Action } from './Action';
import { calculateVirtualTimelineActionSize } from './helper';
import { type TTimelineTrack } from './types';

export const Track: React.FC<TTrackProps> = (props) => {
	const { track, containerRef } = props;
	const { actionIds } = useGlobalState(track);

	const actionVirtualizer = useVirtualizer({
		count: actionIds.length,
		getScrollElement: () => containerRef.current,
		// TODO: Figure out how to cache.
		// Right now called for every not visible action items when manually resizing via "actionVirtualizer.resizeItem"
		estimateSize: (index) => {
			const action = track.getActionAtIndex(index);
			if (action == null) {
				return 0;
			}

			// console.log(`[estimateSize] ${action._v.id} (${index.toString()})`);

			return calculateVirtualTimelineActionSize(action, track.getActionAtIndex(index - 1));
		},
		horizontal: true,
		overscan: 5,
		initialOffset: 0
	});

	// https://github.com/TanStack/virtual/discussions/852
	React.useEffect(() => {
		if (containerRef.current != null) {
			actionVirtualizer.measure();
		}
	}, [containerRef, actionVirtualizer]);

	// Remeasure all item sizes for the actionVirtualizer on scale change
	React.useEffect(() => {
		const unsubscribe = track._timeline.scale.listen(() => {
			actionVirtualizer.measure();
		});
		return () => {
			unsubscribe();
		};
	}, [actionVirtualizer, track]);

	return (
		<>
			{actionVirtualizer.getVirtualItems().map((virtualAction) => {
				const action = track.getActionAtIndex(virtualAction.index);
				if (action == null) {
					return null;
				}
				return (
					<Action
						key={virtualAction.key}
						action={action}
						index={virtualAction.index}
						actionVirtualizer={actionVirtualizer}
						track={track}
					/>
				);
			})}
		</>
	);
};

interface TTrackProps {
	track: TTimelineTrack;
	containerRef: React.RefObject<HTMLDivElement>;
}

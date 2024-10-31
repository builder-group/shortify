import { type TTimeline, type TTimelineAction, type TTimelineTrack } from '@repo/video';
import { AppError } from '@blgc/openapi-router';
import { Err, Ok, type TResult } from '@blgc/utils';
import { pika } from '@/environment';
import {
	getVideosByCategories,
	selectSingleVideo,
	selectVideoSequence,
	type TVideoAsset
} from '@/lib';

export function createBackgroundTrack(
	actionMap: TTimeline['actionMap'],
	config: TCreateBackgroundTrackConfig
): TResult<TTimelineTrack, AppError> {
	const {
		variant = { type: 'static', backgroundColor: '00b140' },
		durationInFrames,
		width,
		height,
		fps
	} = config;
	const actionIds: string[] = [];

	switch (variant.type) {
		case 'static': {
			const actionId = pika.gen('action');
			actionMap[actionId] = createStaticBackground(variant, width, height, durationInFrames);
			actionIds.push(actionId);
			break;
		}

		case 'single': {
			const result = createSingleVideoBackground(variant, width, height, durationInFrames, fps);

			if (result.isErr()) {
				return Err(result.error);
			}

			const actionId = pika.gen('action');
			actionMap[actionId] = result.value;
			actionIds.push(actionId);
			break;
		}

		case 'sequence': {
			const result = createSequenceVideoBackground(variant, width, height, durationInFrames, fps);

			if (result.isErr()) {
				return Err(result.error);
			}

			for (const action of result.value) {
				const actionId = pika.gen('action');
				actionMap[actionId] = action;
				actionIds.push(actionId);
			}

			break;
		}
	}

	return Ok({
		type: 'Track',
		actionIds
	});
}

function createStaticBackground(
	variant: TStaticVariant,
	width: number,
	height: number,
	durationInFrames: number
): TTimelineAction {
	const { backgroundColor = '00b140' } = variant;
	return {
		type: 'Rectangle',
		width,
		height,
		startFrame: 0,
		durationInFrames,
		fill: { type: 'Solid', color: backgroundColor }
	};
}

function createSingleVideoBackground(
	variant: TSingleVideoVariant,
	width: number,
	height: number,
	durationInFrames: number,
	fps: number
): TResult<TTimelineAction, AppError> {
	const { categories, endBufferMs = 2000, startBufferMs = 2000 } = variant;

	// Get videos from specified categories
	const videoGroups = getVideosByCategories(categories);
	const allVideos: TVideoAsset[] = Object.values(videoGroups).flatMap((group) => group.videos);

	if (!allVideos.length) {
		return Err(
			new AppError('#ERR_NO_VIDEOS_FOUND', 400, {
				description: `No videos found for categories: ${categories.join(', ')}`
			})
		);
	}

	const selectedVideo = selectSingleVideo(allVideos, {
		durationInFrames,
		fps,
		startBufferMs,
		endBufferMs
	});

	if (selectedVideo == null) {
		return Err(
			new AppError('#ERR_VIDEO_SELECTION_FAILED', 400, {
				description: 'Failed to select appropriate video for background'
			})
		);
	}

	return Ok({
		type: 'Rectangle',
		width,
		height,
		startFrame: 0,
		durationInFrames,
		fill: {
			type: 'Video',
			width,
			height,
			objectFit: 'cover',
			src: selectedVideo.src,
			startFrom: selectedVideo.startFrom
		}
	});
}

function createSequenceVideoBackground(
	variant: TSequenceVideoVariant,
	width: number,
	height: number,
	durationInFrames: number,
	fps: number
): TResult<TTimelineAction[], AppError> {
	const { categories, endBufferMs = 0, startBufferMs = 0 } = variant;

	// Get videos from specified categories
	const videoGroups = getVideosByCategories(categories);
	const allVideos: TVideoAsset[] = Object.values(videoGroups).flatMap((group) => group.videos);

	if (!allVideos.length) {
		return Err(
			new AppError('#ERR_NO_VIDEOS_FOUND', 400, {
				description: `No videos found for categories: ${categories.join(', ')}`
			})
		);
	}

	const selectedVideos = selectVideoSequence(allVideos, {
		durationInFrames,
		fps,
		startBufferMs,
		endBufferMs
	});

	if (!selectedVideos?.length) {
		return Err(
			new AppError('#ERR_VIDEO_SEQUENCE_FAILED', 400, {
				description: 'Failed to select appropriate videos for background sequence'
			})
		);
	}

	let startFrame = 0;
	return Ok(
		selectedVideos.map((video) => {
			const action: TTimelineAction = {
				type: 'Rectangle',
				width,
				height,
				startFrame,
				durationInFrames: video.durationInFrames,
				fill: {
					type: 'Video',
					width,
					height,
					objectFit: 'cover',
					src: video.src,
					startFrom: video.startFrom
				}
			};

			startFrame += video.durationInFrames;

			return action;
		})
	);
}

interface TStaticVariant {
	type: 'static';
	backgroundColor?: string;
}

interface TSingleVideoVariant {
	type: 'single';
	categories: string[];
	startBufferMs?: number;
	endBufferMs?: number;
}

interface TSequenceVideoVariant {
	type: 'sequence';
	categories: string[];
	startBufferMs?: number;
	endBufferMs?: number;
}

export type TBackgroundVariant = TStaticVariant | TSingleVideoVariant | TSequenceVideoVariant;

export interface TCreateBackgroundTrackConfig {
	variant?: TBackgroundVariant;
	durationInFrames: number;
	width: number;
	height: number;
	fps: number;
}

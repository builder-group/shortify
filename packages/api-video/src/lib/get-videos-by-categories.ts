import { assetMap } from '@repo/video';

function parseVideoMetadata(filename: string): TVideoAssetMetadata | null {
	const match = /(?<temp1>[^/]+)_(?<temp2>[^_]+)_(?<temp3>\d+)\.mp4$/.exec(filename);
	if (match == null) {
		return null;
	}
	const [_, category, author, stringifiedIndex = '0'] = match;
	const index = parseInt(stringifiedIndex, 10);
	if (category == null || author == null || isNaN(index)) {
		return null;
	}

	return {
		category,
		author: author.replace('--', '_'),
		index
	};
}

// Preprocess and filter assetMap into video assets array for easy reuse
export function getAllVideoAssets(): TVideoAsset[] {
	return Object.entries(assetMap).reduce<TVideoAsset[]>((acc, [path, asset]) => {
		if (asset.type === 'MP4' && path.endsWith('.mp4')) {
			const metadata = parseVideoMetadata(path);
			if (metadata) {
				acc.push({
					path,
					type: asset.type,
					durationMs: 'durationMs' in asset ? asset.durationMs : 0,
					metadata
				});
			}
		}
		return acc;
	}, []);
}

// Get unique, sorted video categories
export function getVideoCategories(): string[] {
	return Array.from(new Set(getAllVideoAssets().map((asset) => asset.metadata.category))).sort();
}

// Group videos by category, calculating authors and total duration per group
export function getVideosByCategories(categories: string[]): Record<string, TVideoAssetGroup> {
	const filteredAssets = getAllVideoAssets().filter((asset) =>
		categories.includes(asset.metadata.category)
	);

	return filteredAssets.reduce<Record<string, TVideoAssetGroup>>((acc, asset) => {
		const { category, author } = asset.metadata;

		if (!acc[category]) {
			acc[category] = { category, videos: [], authors: [], totalDuration: 0 };
		}

		acc[category].videos.push(asset);
		if (!acc[category].authors.includes(author)) {
			acc[category].authors.push(author);
		}
		acc[category].totalDuration += asset.durationMs;

		// Sort videos and authors in each category group
		acc[category].videos.sort((a, b) => a.metadata.index - b.metadata.index);
		acc[category].authors.sort();

		return acc;
	}, {});
}

// Filter videos by author and specified categories
export function getVideosByAuthor(categories: string[], author: string): TVideoAsset[] {
	return getAllVideoAssets()
		.filter(
			(asset) => categories.includes(asset.metadata.category) && asset.metadata.author === author
		)
		.sort((a, b) => a.metadata.index - b.metadata.index);
}

export interface TVideoAsset {
	path: string;
	type: string;
	durationMs: number;
	metadata: TVideoAssetMetadata;
}

export interface TVideoAssetMetadata {
	category: string;
	author: string;
	index: number;
}

export interface TVideoAssetGroup {
	category: string;
	videos: TVideoAsset[];
	authors: string[];
	totalDuration: number;
}

import { TTrackPieceReference, TTrackVariant } from './TrackPiece';

export const TRACK_PIECES: TTrackPieceReference[] = [
	{
		modelPath: '/static/3d/mesh/.local/marble-race_track-part_046.glb',
		id: '046',
		variant: TTrackVariant.START,
		gridSize: 1,
		turnAngleRad: 0,
		slopeAngleRad: -0.1244
	},
	{
		modelPath: '/static/3d/mesh/.local/marble-race_track-part_054.glb',
		id: '054',
		variant: TTrackVariant.NORMAL,
		gridSize: 1,
		turnAngleRad: 0,
		slopeAngleRad: -0.1244
	},
	// {
	// 	modelPath: '/static/3d/mesh/.local/marble-race_track-part_087.glb',
	// 	id: '087',
	// 	variant: TTrackVariant.NORMAL,
	// 	gridSize: 1,
	// 	turnAngleRad: Math.PI / 2,
	// 	slopeAngleRad: 0
	// },
	// {
	// 	modelPath: '/static/3d/mesh/.local/marble-race_track-part_117.glb',
	// 	id: '117',
	// 	variant: TTrackVariant.NORMAL,
	// 	gridSize: 1,
	// 	turnAngleRad: -(Math.PI / 2),
	// 	slopeAngleRad: 0
	// },
	{
		modelPath: '/static/3d/mesh/.local/marble-race_track-part_140.glb',
		id: '140',
		variant: TTrackVariant.NORMAL,
		gridSize: 1,
		turnAngleRad: -(Math.PI / 2),
		slopeAngleRad: -0.175
	},
	{
		modelPath: '/static/3d/mesh/.local/marble-race_track-part_141.glb',
		id: '141',
		variant: TTrackVariant.NORMAL,
		gridSize: 1,
		turnAngleRad: Math.PI / 2,
		slopeAngleRad: -0.175
	},
	{
		modelPath: '/static/3d/mesh/.local/marble-race_track-part_142.glb',
		id: '142',
		variant: TTrackVariant.NORMAL,
		gridSize: 1,
		turnAngleRad: Math.PI / 2,
		slopeAngleRad: -0.175
	},
	{
		modelPath: '/static/3d/mesh/.local/marble-race_track-part_143.glb',
		id: '143',
		variant: TTrackVariant.NORMAL,
		gridSize: 1,
		turnAngleRad: -(Math.PI / 2),
		slopeAngleRad: -0.175
	}
];

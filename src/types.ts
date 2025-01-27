
export interface Env {

}


export type ImgurData = {
	id: string;
	account_id: number;
	title: string;
	description: string;
	view_count: number;
	upvote_count: number;
	downvote_count: number;
	point_count: number;
	image_count: number;
	comment_count: number;
	favorite_count: number;
	is_album: boolean;
	is_mature: boolean;
	cover_id: string;
	created_at: string;
	url: string;
	account?: {
		id: number;
		username: string;
		avatar_url: string;
		created_at: string;
	};
	cover?: ImgurImage;
	tags?: ImgurTag[];
	media?: ImgurImage[];
};

export type ImgurTag = {
	tag: string;
	display: string;
	background_id: string;
	accent: string;
	is_promoted: boolean;
}

export type ImgurImage = {
	id: string;
	account_id: number;
	mime_type: string;
	type: string;
	name: string;
	url: string;
	ext: string;
	width: number;
	height: number;
	size: number;
	metadata: {
		title: string;
		description: string;
		is_animated: boolean;
		is_looping: boolean;
		has_sound: boolean;
		duration: number;
	};
	created_at: string;
};

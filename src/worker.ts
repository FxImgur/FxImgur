import { COPY_META_TAGS, REMAP_META_TAGS } from "./constants";
import { Env, ImgurImage } from "./types";
import { extractImgurData, isBotRequest, metaTag, redirectToImgur } from "./utils";
import { decode, encode } from 'html-entities';


function oembedHandler(url: URL, request: Request): Response {
	const params = url.searchParams,
		text = params.get('text') ?? 'Imgur',
		path = params.get('url') ?? '/';

	const out = {
		version: '1.0',
		type: 'link',
		provider_name: 'Imgur, via FxImgur',
		provider_url: 'https://github.com/FxImgur/FxImgur',
		title: 'Embed',
		author_name: text,
		author_url: new URL(path, 'https://www.imgur.com').toString()
	}

	return new Response(JSON.stringify(out), {
		headers: {
			'Content-Type': 'application/json',
			'X-Clacks-Overhead': 'GNU Terry Pratchett'
		}
	});
}


async function imgurLookup(url: URL, request: Request): Promise<Response> {

	// Convert the URL to an imgur URL.
	// TODO: Support the i. subdomain.
	const target = new URL(url);
	target.host = 'imgur.com';
	target.port = '';
	target.protocol = 'https:';

	// Any request not from a bot like Discord? Just forward the user.
	if (!isBotRequest(request))
		return redirectToImgur(url);

	// See what we can learn about this URL.
	const data = await extractImgurData(target);

	const out = [
		'<!DOCTYPE html>',
		metaTag('theme-color', "#2cd63c"),
		`<meta http-equiv="refresh" content="0;url=${encode(target.toString())}"/>`,
		metaTag('og:url', target.toString())
	];

	// If we don't have JSON data, fall back to just forwarding meta tags.
	if (!data.data || ! Array.isArray(data.data.media) ) {
		// If we aren't dealing with a video, just return a redirect.
		const type = data.meta['og:video:type'];
		if (type !== 'video/mp4')
			return redirectToImgur(target);

		// We have a video, just assume it has sound and make our own embed.

		for(const [key, val] of Object.entries(data.meta)) {
			if (!COPY_META_TAGS.includes(key))
				continue;
			let k = REMAP_META_TAGS[key] ?? key;
			out.push(metaTag(k, val));
		}


	} else {
		// We *do* have data, so we want to build something nicer.
		console.log(data.data);

		// First, let's build our oembed data. This is used to add a little
		// more data to the embed.
		const embed = new URL(`/oembed`, url),
			author: string | null = data.data.account?.username ?? null,
			text: string[] = [];

		if (typeof author === 'string' && author.length > 0) {
			text.push(`@${author}`);
			embed.searchParams.append('url', `/user/${author}`);
		}

		if (data.data.comment_count > 0)
			text.push(`💬 ${data.data.comment_count}`);

		if (data.data.upvote_count > 0)
			text.push(`👍 ${data.data.upvote_count}`);

		if (data.data.downvote_count > 0)
			text.push(`👎 ${data.data.downvote_count}`);

		if (data.data.image_count > 1)
			text.push(`📷 ${data.data.image_count}`);

		embed.searchParams.append('text', text.join('   '));

		out.push(`<link rel="alternative" type="application/json+oembed" title="${encode(author)}" href="${encode(embed.toString())}"/>`);

		// Alright. Now, the media itself.
		// We have a couple possible display modes:
		// 1. Single video
		// 2. Multiple images

		let cover = data.data.cover;
		if (! cover && data.data.media.length > 0)
			cover = data.data.media[0];

		let title: string | null = data.data.title;
		if (!title?.length)
			title = cover?.metadata?.title ?? '';

		let description: string | null = data.data.description;
		if (!description?.length)
			description = cover?.metadata?.description ?? '';

		if (title?.length > 0) {
			title = decode(title);

			out.push(metaTag('og:title', title));
			out.push(metaTag('twitter:title', title));
		}

		if (description?.length > 0) {
			description = decode(description);

			out.push(metaTag('og:description', description));
			out.push(metaTag('twitter:description', description));
		}

		if (cover?.type === 'video') {
			// Just a video.

			// First. Thumbnail image.
			const thumb = `https://i.imgur.com/${cover.id}.jpg?fbplay`;

			out.push(metaTag('twitter:card', cover.metadata.has_sound ? 'player' : 'summary_large_image'));
			out.push(metaTag('og:type', 'video.other'));

			out.push(metaTag('twitter:player', `https://i.imgur.com/${cover.id}.gifv?twitter#t`));
			out.push(metaTag('twitter:player:width', `${cover.width}`));
			out.push(metaTag('twitter:player:height', `${cover.height}`));
			out.push(metaTag('twitter:player:stream', cover.url));
			out.push(metaTag('twitter:player:stream:content_type', cover.mime_type));

			out.push(metaTag('og:video', cover.url));
			out.push(metaTag('og:video:secure_url', cover.url));
			out.push(metaTag('og:video:type', cover.mime_type));
			out.push(metaTag('og:video:width', `${cover.width}`));
			out.push(metaTag('og:video:height', `${cover.height}`));
			out.push(metaTag('og:image', thumb));
			out.push(metaTag('twitter:image', `https://i.imgur.com/${cover.id}h.jpg`));

			/*for(const [key, val] of Object.entries(data.meta)) {
				if (!COPY_META_TAGS.includes(key))
					continue;
				let k = REMAP_META_TAGS[key] ?? key;
				out.push(metaTag(k, val));
			}*/

		} else {
			out.push(metaTag('og:type', 'article'));

			let i = 0;
			if (renderImage(out, cover))
				i++;

			for(const media of data.data.media) {
				if (media.id === cover?.id)
					continue;
				if (renderImage(out, media))
					i++;
				if (i >= 4)
					break;
			}
		}

	}

	return new Response(out.join('\n'), {
		headers: {
			'Content-Type': 'text/html',
			'X-Clacks-Overhead': 'GNU Terry Pratchett'
		}
	});
}


function renderImage(out: string[], data?: ImgurImage | null) {
	if (!data || data.type !== 'image')
		return false;

	out.push(metaTag('og:image', data.url));
	out.push(metaTag('og:image:secure_url', data.url));
	out.push(metaTag('og:image:type', data.mime_type));
	out.push(metaTag('og:image:width', `${data.width}`));
	out.push(metaTag('og:image:height', `${data.height}`));

	return true;
}


export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response> {
		try {
			const url = new URL(request.url);
			if (url.pathname === '/oembed')
				return oembedHandler(url, request);

			return imgurLookup(url, request);
		} catch(err) {
			console.error(err);
			return new Response(`Failed to connect to Imgur.`, {
				status: 500
			})
		}
	}
}

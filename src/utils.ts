import JSON5 from 'json5';
import { BOT_UA_REGEX } from "./constants";
import { ImgurData } from './types';
import { encode } from 'html-entities';


export function isBotRequest(request: Request) {
	const ua = request.headers.get('User-Agent');
	return ua ? BOT_UA_REGEX.test(ua) : false;
}


export function redirectToImgur(url: URL | string) {
	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString(),
			'Referrer-Policy': 'no-referrer',
			'X-Clacks-Overhead': 'GNU Terry Pratchett'
		}
	});
}


export function metaTag(property: string, content: string) {
	return `<meta property="${encode(property)}" content="${encode(content)}" />`
}


export async function extractImgurData(url: URL | string) {
	const response = await fetch(url);

	const meta: Record<string, string> = {};
	let text: string | null = null;
	let pending_text: string[] = [];

	const rewriter = new HTMLRewriter()
		.on('meta', {
			element(element) {
				let name: string | null = null,
					value: string | null = null;

				for(const attr of element.attributes) {
					if (attr[0] === 'name' || attr[0] === 'property' )
						name = attr[1];
					if (attr[0] === 'content')
						value = attr[1];
				}

				if (name != null && value != null)
					meta[name] = value;
			}
		})
		.on('script', {
			element() {
				pending_text = [];
			},
			text(element) {
				pending_text.push(element.text);
				if (element.lastInTextNode) {
					const value = pending_text.join('');
					if (value.startsWith('window.postDataJSON='))
						text = value.slice(20);
					pending_text = [];
				}
			}
		});

	await rewriter.transform(response).text();

	let data: ImgurData | null = null;
	try {
		// We use JSON5 to parse the text because HTML entities are treated weirdly
		// by HTMLRewriter and we might end up with extra escape sequences.
		if (text)
			data = JSON.parse(JSON5.parse(text));
	} catch(err) {
		console.error(err);
	}

	return {
		meta,
		data
	}
}

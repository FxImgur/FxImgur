export const BOT_UA_REGEX = /bot|facebook|embed|got|firefox\/92|firefox\/38|curl|wget|go-http|yahoo|generator|whatsapp|revoltchat|preview|link|proxy|vkshare|images|analyzer|index|crawl|spider|python|cfnetwork|node|mastodon|http\.rb|ruby|bun\/|fiddler|iframely|steamchaturllookup|bluesky/gi;

export const COPY_META_TAGS = [
	//'msapplication-TileColor',
	//'msapplication-TileImage',
	'og:url',
	'twitter:image',
	'og:video:height',
	'og:video:width',
	'og:video',
	'og:video:secure_url',
	'og:video:type',
	'og:type',
	'og:image',
	'twitter:card',
	'twitter:player',
	'twitter:player:height',
	'twitter:player:width',
	'twitter:player:stream',
	'twitter:player:stream:content_type',
	//'description',
	'twitter:title',
	//'twitter:description',
	'og:title',
	//'og:description'
];

export const REMAP_META_TAGS: Record<string, string> = {
	//'msapplication-TileColor': 'theme-color'
};

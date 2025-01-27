FxImgur
=======

Different Imgur embeds for Discord.

Written in TypeScript as a Cloudflare Worker.

Just add `fx` before your `imgur.com` link to make it `fximgur.com`.

For now this mainly works with gallery posts. Non-gallery albums
and the like won't work because Imgur doesn't include the helpful
JSON data we extract post info from.

Why does this exist? Because I got sick of trying to link a video or
an image gallery on Imgur and have it show up in Discord like a GIF
without even a visible link. No sound for videos. Only one image,
and probably not the correct image. Not a good experience.

Some of my design goals:
* Make sure you can listen to the audio of a post
* Include the poster's name and upvote / downvote / comment counts
* Include either a video or up to four images, and the cover is
  always first.

This is heavily inspired by FxTwitter and other similar services.

TODO:
* Investigate possibility of GIF-style video embeds (looping, no sound)
* Add `i.fximgur.com` for just posting raw videos, maybe?
* Stop relying on JSON data so non-gallery posts will work too.


## I found a bug!
Great! Report it on the Issues tab. Or even better, help me fix it!


## Disclaimer

This project is not associated with Imgur.

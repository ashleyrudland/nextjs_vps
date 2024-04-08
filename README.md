# Do we need Vercel? Can we just run our NextJS apps on a VM? Maybe all our apps on one machine?

I love NextJS, but I don't like Vercels pricing. It seems nuts to me and it seems many other people do too. So I spent a few hours playing with this and Digital Ocean to see what was possible.

All thanks goes to [kamal](https://github.com/basecamp/kamal) and @ImSh4yy, I built this using his [post](https://logsnag.com/blog/self-host-nextjs-hetzner-kamal) 🙏

## What's the objective here?

Figure out if we can have all the requirements of most indie hacker apps on a little VM instead of Vercel?

Here's the list of to dos:

-   [x] Can we run NextJS on VPS easily? ✅
-   [x] Is the latency acceptable? ✅ 35ms, roughly same as Vercel
-   [x] Can we auto deploy? ✅ see [deploy-on-main.yml](.github/workflows/deploy-on-main.yml)
-   [x] Can we persist data on this machine when using Docker?
-   [x] What's the writes per second using SQL Lite? ✅ 235/sec on Docker on $5 Digital Ocean VPS
-   [x] What's the uptime of this? ✅ so far 100%
-   [x] NextJS Feature: Image Optimization?
-   [x] NextJS Feature: Can we use Server Actions? SQLite write test runs on Server Actions. See [actions](./src/app/actions/)
-   [x] NextJS Feature: API routes? ✅ see [/api/vm/](./src/app/api/vm/)
-   [ ] NextJS Feature: Can we use the NextJS Caching? Custom Cache?
-   [ ] How much traffic can this machine handle?
-   [ ] Can/how we run multiple apps on the same machine? Switch app based on domain name?

## What's not the objective?

-   Infinite scale - do indie hackers really need this?
-   Complex architecture

### How does this auto deploy?

Basically GitHub actions run on each commit to main, builds image using Docker, uploads then Kamal connects to machine via SSH (with passphrase), then reboots app with new code.

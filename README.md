```
  _          _           _     _  __ _
 | |__   ___| |_ __  ___| |__ (_)/ _| |_
 | '_ \ / _ \ | '_ \/ __| '_ \| | |_| __|
 | | | |  __/ | |_) \__ \ | | | |  _| |_
 |_| |_|\___|_| .__/|___/_| |_|_|_|  \__|
   __| | _____|_|__    | |__ | | ___   __ _
  / _` |/ _ \ \ / /____| '_ \| |/ _ \ / _` |
 | (_| |  __/\ V /_____| |_) | | (_) | (_| |
  \__,_|\___| \_/      |_.__/|_|\___/ \__, |
                                      |___/
```

# Adding a new post

Create a new file inside `_posts` named in this format: `YYYY-MM-DD-my-new-post.md`.

Inside the file, you need to add a preamble that looks like this:

```
---
layout: post
title: My New Post
tags: tag1, tag2
author:
    name: John Doe
    email: john@ludicorp.com
    meta: President of Vice
---
```

After the preamble you can write the post in Markdown.

# Setup & running

To build the blog and get a live preview, you need to install
`npm`. After installing `npm` you can just do a `npm install` inside
this project directory.

Once `npm` has installed all dependencies you can call `grunt` inside
the project directory.

Grunt will then automatically compile any changes to the blog posts and
serve them via an internal webserver at the url `http://localhost:4000/`

# Contributing

Bug fixes, etc are welcome. If you would like to write an article on our
blog send us a pull-request and we'll consider it.

# License

```
Copyright 2014, Helpshift, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

#Authors

* Abhishek Mishra @ideamonk
* Baishampayan Ghose @ghoseb

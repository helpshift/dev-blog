---
layout: post
title: Scaling MongoDB to 10,000 rps and beyond
tags: mongodb scaling database 
author:
    name: Abhishek Amberkar & Vinayak Hegde
    email: vinayak@helpshift.com
    meta: Operations
---

## Background

At [Helpshift](http://www.helpshift.com), [MongoDB](http://www.mongodb.org/) is our primary datastore. Compared to traditional open-source databases such as PostgreSQL and MySQL, it was easy to evolve our schema with MongoDB. This was especially true for a fast growing startup like ours which was in a product discovery phase. However, MongoDB came with its own set of challenges. It did not have good recipes for scaling as compared to other databases and the tooling around data management is also not as mature. This was to be expected as MongoDB is also evolving very fast. We had to learn very fast and trawl the documentation, mailing lists and irc to get tribal knowledge which was not easily accessible. Recently, as part of [RootConf](https://rootconf.in/2014/) we gave a talk on ["Scaling Mongodb to more than 10,000 requests per second"](https://rootconf.in/2014/runup-pune) in which we shared our growing pains and insights for scaling MongoDB. The talk video and the slides are embedded below:

## Talk

<iframe width="853" height="480" src="//www.youtube.com/embed/qbiRf4P2pJw" frameborder="0" allowfullscreen></iframe>

## Slides

<script async class="speakerdeck-embed" data-id="c9616190dd21013100ef36ab2b38a31a" data-ratio="1.77777777777778" src="//speakerdeck.com/assets/embed.js"></script>

If you're interested in working in a fast paced team, [we are hiring, join us!](https://www.helpshift.com/about/careers/)


-- [Abhishek Amberkar](https://twitter.com/greenmang0) & [Vinayak Hegde](https://twitter.com/vinayakh)

---
layout: post
title: Grouping similar messages using Topic Modeling
tags: topic-modeling data-science machine-learning
author:
    name: Divyanshu Ranjan, Kapil Reddy & Vinayak Hegde
    email: vinayak@helpshift.com
    twitter: vinayakh
    github: vinayakh
    meta: Data Science team
---

## Background

At [Helpshift](http://www.helpshift.com), we have [several customers who file thousands of issues per week](https://www.helpshift.com/customers/). This is a huge volume of tickets for any customer service team to handle. We try to make them efficient by providing several features to make them more efficient such as automations, smartviews, bulk editing of issues and inserting of FAQs. Given a huge corpus of data we have, we were looking at some machine learning techniques that could allow us to make the bulk edit feature more intelligent. In bulk edit feature, a customer service agent can do a quick view of the issues and select those he wants to take action on. We looked at different statistical/probabilistic techniques that could help us achieve this. One important requirement was that we should be able to find issues when we have a burst of similar issues in ashort time period. Mobile apps update often. As with all software, there are often bugs. These get reported very fast using in-app mobile helpsdesk that we provide. Another scenarios which can cause a burst of tickets is intermittent backend outages. So it is really useful if all of these issues are grouped together so customer support can reply to all of these at once or tag them for resolution for updates later.

We wanted a machine learning algorithm which would be real-time, supported unsupervised learning and could support different languages (internationalization). Topic modeling fits the bill on most of these counts. When we implemented it we found that it gave good results. We had to do some tweaking for the number of topics in the algorithm on a per customer basis. In the video below, I share a heuristic that worked well for us. 

## Talk

<iframe width="853" height="480" src="//www.youtube.com/embed/rcDl-sW9mq8" frameborder="0" allowfullscreen></iframe>

## Slides
<script async class="speakerdeck-embed" data-id="c99135e0f229013163b70aec731e246e" data-ratio="1.77777777777778" src="//speakerdeck.com/assets/embed.js"></script>

If you're interested in working in a fast paced team, [we are hiring, join us!](https://www.helpshift.com/about/careers/)

-- [Divyanshu Ranjan](https://twitter.com/rdivyanshu), [Kapil Reddy](https://twitter.com/KapilReddy) & [Vinayak Hegde](https://twitter.com/vinayakh)

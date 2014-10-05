---
layout: post
title: Data layer Architectures for Mobile applications
tags: mobile architecture design
author:
    name: Rhishikesh Joshi
    email: rhishikesh@helpshift.com
    twitter: rhishikeshj
    github: rhishikeshj
    meta: Mobile SDK team
---

## Background

Mobile applications are becoming ubiquitous in our day to day lives. They are capable of performing a wide range of tasks. They can wake us up in the morning, help us with our work out, track the calories we eat, help us stay on top of work and stay in touch with friends. They can even [remind us to drink water](https://play.google.com/store/search?q=drink+water+reminder&c=apps) on time !

Admittedly there are a lot of below average apps out there. But let's not focus on them for now.
Let's talk about the really great ones. What factors make them great ?
There are many factors that go into making a great app. Features, functionality, stability. But most people would agree it has to do with the design language of the app. The way the app engages its user is of highest priority.

But there is another important factor which gets overlooked; the efficiency of the Data layer of the application. In today's age of ultra connected, thin-client design style of writing apps, the design of the Data layer is of utmost importance too.

At [Helpshift](http://www.helpshift.com), due to the nature of the product, our mobile SDK is highly data intensive. Sending data to our servers reliably and fetching updates periodically and efficiently are the two main goals of our design.

In this series of blogs, I will try and share the knowledge that we have gathered in the process of designing such a model.

## Challenges

There are some unique challenges in creating data-centric thin-client apps for mobiles.

1. Restrictions on bandwidth usage : Mobile data is a valuable commodity and mobile developers should try and minimize the data exchange on the network.
1. Restrictions on battery and resource usage : If an app is using the network too much or too frequently, it will eat up device resources very fast. The user will very quickly get rid of such an app.
1. Accounting for fault tolerance and network errors : Mobile networks are inherently flaky and prone of glitches. A good application should take these glitches in its stride.
1. Being responsive and fast with data transactions : All said and done, being fast with data is the most important challenge of good data layer design.

All of the above challenges need to be accounted for from the start when designing a mobile application.
We have faced a similar set of challenges at Helpshift and described below is our attempt at overcoming them.

## High level design

Being a fast paced startup, we have gone through many iterations of our SDK design, especially the data layer. As we keep adding capabilities and features, the design continues to evolve.
Described below is just the current state of the data architecture.

These are the key guidelines which we try to adhere to:

1. Loosely coupled components which interact with each other through a well defined interface.
1. Single responsibility assigned to each component.
1. Keep statefulness isolated and minimized.

![Architecture](/static/images/sdk_architecture.png)


## Brief description of each component

### Data model

This layer holds all the business logic of the Helpshift API.

The main responsibilities of the **Data model** are :

1. Providing interfaces to the **UI layer** for getting data such a FAQs, all the messages for a conversation etc.
1. Polling in the background to fetch the latest updates to a conversation and its state (`In-Progress`, `Resolve-Requested` etc)
1. Creating stub objects for the data before forwarding the request to the API layer. This ensures that the UI gets the newly created data as soon as possible.
1. Interacting with the **Storage** layer and updating the database in response to add actions from the UI and updates coming from the Servers.

A typical **Data Model** API will look like this :

{% highlight objectivec %}
[HSIssueModel createIssue:issueText
                onSuccess:^(id newIssue) {
                    issue = [HSIssueModel getIssue:[newIssue objectForKey:@"id"]];
                    STAssertNotNil(issue, @"Could not add the issue in Db");
                }
                onFailure:^() {
                    STFail(@"Failed to create an issue");}];
{% endhighlight %}

### Storage

This layer forms the main data store of the SDK.
At Helpshift, we use the **sqlite** database and raw sqlite queries. We prefer the flexibility and clarity provided by raw SQL as opposed to any ORM.

The main responsibilites of this layer are :

1. Storage and retrieval of data related to `FAQs` and `Conversations`.

A typical **Storage** API will look like this :

{% highlight objectivec %}
[HSIssuesDb createIssue:issue forProfile:PROFILE_ID];
{% endhighlight %}

### API layer

This layer serves as the client for the REST API exposed by the Helpshift servers.
Every request will spawn a new thread of execution so as not to interfere with the UI thread.

The main responsibilities of this layer are :

1. Making GET/POST requests to the backend servers in response to **Data model** requests.
1. Handling responses from the servers and forwarding them to the **Retry Queue**.

A typical **API layer** API will look like this :

{% highlight objectivec %}
[HSIssueCalls createIssue:[NSString stringWithFormat:@"This is a not so random issue created at : %.2f, [[NSDate date] timeIntervalSince1970]]
               forProfile:PROFILE_ID
                onSuccess:^(id jsonData) {
                    STAssertNotNil(jsonData, @"We could not create an issue.");
                }
                onFailure:^(void) {
                    NSLog(@"Royal failure");
}];
{% endhighlight %}

### Retry Queue

This is the fault tolerance layer of the SDK. The **API layer** will forward all the failed request packets to this layer. This can be a continuous thread running in the background which flushes the Queue periodically. The **API layer** will forward the `SuccessHandler` received from the **Model** layer which will be triggered on successful completion of a request packet in the **Retry Queue**

The main responsibilities of this layer are :

1. Accepting failed request packets from the **API layer**.
1. Periodically flushing the Queue to make sure all the failed requests are completed successfully.
1. Informing the **Data model** of the successful completion.

A typical **Retry** API will look like this :

{% highlight objectivec %}
[HSRetryQueue addFailedRequest : failedRequest
            withSuccessHandler : dataModelSuccessHandler
                     onFailure : ^(void) {
                         NSLog(@"Royal failure");
}];
{% endhighlight %}


If you're interested in working in a fast paced team, [we are hiring, join us!](https://www.helpshift.com/about/careers/)

-- [Rhishikesh Joshi](https://twitter.com/rhishikeshj)

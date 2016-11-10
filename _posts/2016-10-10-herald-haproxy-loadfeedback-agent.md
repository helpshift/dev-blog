---
layout: post
title: Herald - Haproxy load feedback and check agent
categories: Tech
tags: Haproxy agent-check loadfeedback
author:
    name: Raghu Udiyar
    email: raghusiddarth@gmail.com
    meta: DevOps @ Helpshift
---
Today we are excited to to open source [Herald](https://github.com/helpshift/herald) - a load feedback and check agent for [Haproxy](http://haproxy.org).

Herald is the agent service for the `agent-check` feature in Haproxy. This feature allows a backend server to issue commands and control its state in Haproxy. This can be used for out of band health checks, or load feedback (which we explain below), and many other use cases.


# Background

At Helpshift we swear by Haproxy, which is an extremely powerful and versatile load balancer.

Haproxy is used to balance requests from a `frontend` (client facing interface) to a pool of `backend` servers. For simple http requests the `roundrobin` balancing algorithm works well. But for long lived connections, an even balancing is not achieved. The `leastconn` balancing method helps to a certain extent - here the requests are sent to the backend with least connections - but in a cluster of Haproxy nodes, this doesn't work, as no state regarding the connections is shared between the clustered haproxy nodes.

To solve this, we need a mechanism to regulate traffic sent by haproxy, depending on the load condition of the respective backend server in realtime. We built Herald to solve this load feedback use case.

## Load feedback

As the name suggests, the backend servers can send feedback to Haproxy and regulate its incoming traffic. The application on the backends must expose its load status (a metric such as rps) over some interface, such as http.

When `agent-check` is enabled, Haproxy periodically opens a tcp connection to herald running on the backend servers. The agent on the server queries the application via the load status interface, and replies back with a weight percentage, say 75%. This directs haproxy to reduce the traffic sent to this node by that percent difference. This percentage can keep changing as per the current traffic condition.

Besides regulating load percentage, the reponse can also be an Haproxy action, such as MAINT, DOWN, READY, UP etc. The Haproxy documentation [here](https://cbonte.github.io/haproxy-dconv/1.6/configuration.html#5.2-agent-check) has more details on `agent-check`.

# Herald

Herald is the Haproxy agent that runs on the backends. It has been designed to be generic, with a plugin architecture that along with load feedback can be used for other use cases as well.

The agent has two responsibilities:

1. Respond to Haproxy agent requests, and
2. Query backend application, and calculate the haproxy agent response

The following illustrates this simple architecture :

![Herald Architecture](/images/2016-06-12-herald/herald_arch.png "Herald Architecture")

## Plugins

Herald plugins do the job of querying the application and interpreting the result. Plugins for file and http are available, others can be easily added.

Following features are provided out of the box by the plugin framework:

* Response result cacheing
* Json parsing and processing parsed data using python dict expressions
* Arthmetic expressions on the result
* Regex pattern matching on the result
* Fallback in case of failures

## Performance

Being entirely network and IO driven, we chose to use [gevent](http://www.gevent.org/), a coroutine based python networking library. Gevent uses [greenlets](https://pypi.python.org/pypi/greenlet), to spawn cooperatively scheduled tasks, which yield when blocked, such as when waiting for IO. The resulting code is very simple, and highly performant.

We have been using Herald in production for almost a year with no issues, on a cluster with 100+ instances (depending on autoscaling), serving requests from a cluster of 10+ load balancers. We have had 100% uptime on our load feedback and agent check system.

# Code and Documentation

The source code is on Helpshift [github](https://github.com/helpshift/herald) page. Please follow the README for installation and configuration instructions. We hope Herald is useful to others. Feature and pull requests are most welcome.

